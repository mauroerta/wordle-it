import { beforeAll, beforeEach, describe, expect, test } from "vitest"
import type { Db } from "../db/db"
import { createTestDb, truncateAll } from "../db/test-db"
import type { Play } from "../play/play"
import { createAccountPlays, ensureAccount } from "../player/account"
import { createGroups } from "./store"

const TODAY = "2026-09-03"

function won(gameDay: string, guesses: number): Play {
  return {
    gameDay,
    puzzle: "porta",
    guesses: Array.from({ length: guesses }, () => "porta"),
    evaluations: Array.from({ length: guesses }, () =>
      Array.from({ length: 5 }, () => "correct" as const)
    ),
    status: "won",
    hardMode: false,
  }
}

function lost(gameDay: string): Play {
  return { ...won(gameDay, 6), status: "lost" }
}

let db: Db
let groups: ReturnType<typeof createGroups>

async function account(id: string, name: string) {
  await ensureAccount({ db, accountId: id, name })
}

async function play(accountId: string, ...plays: Play[]) {
  const store = createAccountPlays({ db, accountId })
  for (const item of plays) {
    await store.savePlay(item)
  }
}

async function inviteOf(slug: string, accountId: string) {
  return (await groups.page({ slug, accountId, today: TODAY })).inviteToken
}

beforeAll(async () => {
  db = await createTestDb()
  groups = createGroups({ db })
})

beforeEach(async () => {
  await truncateAll(db)
  await account("mauro", "Mauro Rossi")
  await account("anna", "Anna Bianchi")
  await account("luca", "Luca Verdi")
})

describe("create", () => {
  test("creator is Owner and slug is derived, unique, frozen", async () => {
    const first = await groups.create({
      name: "Famiglia Rossi",
      accountId: "mauro",
    })
    const second = await groups.create({
      name: "Famiglia Rossi",
      accountId: "anna",
    })
    expect(first.slug).toBe("famiglia-rossi")
    expect(second.slug).toBe("famiglia-rossi-2")

    await groups.rename({ slug: first.slug, accountId: "mauro", name: "Casa" })
    const page = await groups.page({
      slug: first.slug,
      accountId: "mauro",
      today: TODAY,
    })
    expect(page.name).toBe("Casa")
    expect(page.slug).toBe("famiglia-rossi")
    expect(page.isOwner).toBe(true)
  })

  test("rejects an empty name", async () => {
    await expect(
      groups.create({ name: "   ", accountId: "mauro" })
    ).rejects.toThrow("Dai un nome al gruppo")
  })
})

describe("join", () => {
  test("joins through the Invite, twice is a no-op, wrong token is rejected", async () => {
    const { slug } = await groups.create({ name: "Amici", accountId: "mauro" })
    const token = await inviteOf(slug, "mauro")

    expect(await groups.join({ token, accountId: "anna" })).toEqual({ slug })
    expect(await groups.join({ token, accountId: "anna" })).toEqual({ slug })
    await expect(
      groups.join({ token: "nope", accountId: "luca" })
    ).rejects.toThrow("Invito non valido")

    const page = await groups.page({ slug, accountId: "anna", today: TODAY })
    expect(page.members.map((member) => [member.name, member.role])).toEqual([
      ["Anna Bianchi", "member"],
      ["Mauro Rossi", "owner"],
    ])
    expect(page.isOwner).toBe(false)
  })

  test("a rotated Invite replaces the old one", async () => {
    const { slug } = await groups.create({ name: "Amici", accountId: "mauro" })
    const old = await inviteOf(slug, "mauro")
    const next = await groups.rotateInvite({ slug, accountId: "mauro" })

    await expect(
      groups.join({ token: old, accountId: "anna" })
    ).rejects.toThrow("Invito non valido")
    expect(await groups.join({ token: next, accountId: "anna" })).toEqual({
      slug,
    })
  })
})

describe("kick and pardon", () => {
  test("kick blocks the Account from the same Invite until the Owner pardons", async () => {
    const { slug } = await groups.create({ name: "Amici", accountId: "mauro" })
    const token = await inviteOf(slug, "mauro")
    await groups.join({ token, accountId: "anna" })

    await groups.kick({ slug, ownerId: "mauro", accountId: "anna" })
    await expect(groups.join({ token, accountId: "anna" })).rejects.toThrow(
      "Non puoi unirti a questo gruppo"
    )
    const page = await groups.page({ slug, accountId: "mauro", today: TODAY })
    expect(page.members).toHaveLength(1)
    expect(page.blocked.map((row) => row.name)).toEqual(["Anna Bianchi"])

    await groups.pardon({ slug, ownerId: "mauro", accountId: "anna" })
    expect(await groups.join({ token, accountId: "anna" })).toEqual({ slug })
  })

  test("only the Owner kicks, renames, rotates, or deletes", async () => {
    const { slug } = await groups.create({ name: "Amici", accountId: "mauro" })
    const token = await inviteOf(slug, "mauro")
    await groups.join({ token, accountId: "anna" })

    const forbidden = "Solo il proprietario può farlo"
    await expect(
      groups.kick({ slug, ownerId: "anna", accountId: "mauro" })
    ).rejects.toThrow(forbidden)
    await expect(
      groups.rename({ slug, accountId: "anna", name: "Mio" })
    ).rejects.toThrow(forbidden)
    await expect(
      groups.rotateInvite({ slug, accountId: "anna" })
    ).rejects.toThrow(forbidden)
    await expect(groups.remove({ slug, accountId: "anna" })).rejects.toThrow(
      forbidden
    )
    await expect(
      groups.kick({ slug, ownerId: "mauro", accountId: "mauro" })
    ).rejects.toThrow("Non puoi escludere te stesso")
  })

  test("non-members see the Group as not found", async () => {
    const { slug } = await groups.create({ name: "Amici", accountId: "mauro" })
    await expect(
      groups.page({ slug, accountId: "luca", today: TODAY })
    ).rejects.toThrow("Pagina non trovata")
    await expect(groups.leave({ slug, accountId: "luca" })).rejects.toThrow(
      "Pagina non trovata"
    )
  })
})

describe("leave", () => {
  test("Owner leaving hands the Group to the longest-standing Member", async () => {
    const { slug } = await groups.create({ name: "Amici", accountId: "mauro" })
    const token = await inviteOf(slug, "mauro")
    await groups.join({ token, accountId: "anna" })
    await groups.join({ token, accountId: "luca" })

    await groups.leave({ slug, accountId: "mauro" })

    const page = await groups.page({ slug, accountId: "anna", today: TODAY })
    expect(page.isOwner).toBe(true)
    expect(page.members.map((member) => [member.name, member.role])).toEqual([
      ["Anna Bianchi", "owner"],
      ["Luca Verdi", "member"],
    ])
  })

  test("the last Member leaving deletes the Group", async () => {
    const { slug } = await groups.create({ name: "Amici", accountId: "mauro" })
    await groups.leave({ slug, accountId: "mauro" })

    expect(await groups.listHub({ accountId: "mauro", today: TODAY })).toEqual(
      []
    )
    await expect(
      groups.page({ slug, accountId: "mauro", today: TODAY })
    ).rejects.toThrow("Pagina non trovata")
  })
})

describe("lens", () => {
  test("page ranks today from Plays and shows six Podiums", async () => {
    const { slug } = await groups.create({ name: "Amici", accountId: "mauro" })
    const token = await inviteOf(slug, "mauro")
    await groups.join({ token, accountId: "anna" })
    await groups.join({ token, accountId: "luca" })
    await play("mauro", won("2026-09-02", 3), won(TODAY, 4))
    await play("anna", lost("2026-09-02"), won(TODAY, 4))
    await play("luca", { ...won(TODAY, 2), status: "in_progress" })

    const page = await groups.page({ slug, accountId: "mauro", today: TODAY })

    expect(
      page.today.map((row) => [row.place, row.name, row.attemptsLabel])
    ).toEqual([
      [1, "Anna Bianchi", "4/6"],
      [1, "Mauro Rossi", "4/6"],
      [3, "Luca Verdi", "—"],
    ])
    expect(page.podiums.map((block) => block.metric)).toEqual([
      "currentStreak",
      "maxStreak",
      "average",
      "winPercentage",
      "gamesPlayed",
      "losses",
    ])
    const streak = page.podiums[0].rows
    expect(streak.map((row) => [row.place, row.name, row.value])).toEqual([
      [1, "Mauro Rossi", 2],
      [2, "Anna Bianchi", 1],
      [3, "Luca Verdi", 0],
    ])
  })

  test("Sconfitte does not rank someone who never finished a Play first", async () => {
    const { slug } = await groups.create({ name: "Amici", accountId: "mauro" })
    const token = await inviteOf(slug, "mauro")
    await groups.join({ token, accountId: "anna" })
    await play("mauro", won(TODAY, 3))
    await play("anna", lost(TODAY))

    const page = await groups.page({ slug, accountId: "mauro", today: TODAY })
    const losses = page.podiums.find((block) => block.metric === "losses")
    expect(losses?.rows.map((row) => [row.place, row.name, row.value])).toEqual(
      [
        [1, "Mauro Rossi", 0],
        [2, "Anna Bianchi", 1],
      ]
    )

    await groups.join({ token, accountId: "luca" })
    const again = await groups.page({ slug, accountId: "mauro", today: TODAY })
    const rows = again.podiums.find((block) => block.metric === "losses")?.rows
    expect(rows?.map((row) => [row.place, row.name, row.value])).toEqual([
      [1, "Mauro Rossi", 0],
      [2, "Anna Bianchi", 1],
      [3, "Luca Verdi", undefined],
    ])
  })

  test("hub shows the viewer's Streak place; teasers show today's place", async () => {
    const { slug } = await groups.create({ name: "Amici", accountId: "mauro" })
    const token = await inviteOf(slug, "mauro")
    await groups.join({ token, accountId: "anna" })
    await groups.create({ name: "Solo", accountId: "anna" })
    await play("mauro", won(TODAY, 5))
    await play("anna", won("2026-09-02", 3), won(TODAY, 2))

    const hub = await groups.listHub({ accountId: "mauro", today: TODAY })
    expect(hub).toEqual([
      {
        slug,
        name: "Amici",
        memberCount: 2,
        isOwner: true,
        streakPlace: 2,
        streakMemberCount: 2,
      },
    ])

    const annaHub = await groups.listHub({ accountId: "anna", today: TODAY })
    expect(annaHub.map((row) => [row.name, row.streakPlace])).toEqual([
      ["Amici", 1],
      ["Solo", 1],
    ])

    const teasers = await groups.teasers({ accountId: "mauro", today: TODAY })
    expect(teasers).toEqual([
      { slug, name: "Amici", place: 2, attemptsLabel: "5/6" },
    ])
  })
})
