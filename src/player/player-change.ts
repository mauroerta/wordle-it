import type { Play } from "../play/play"

export type PlayerChange =
  | { kind: "create_account"; guestPlays: Play[] }
  | { kind: "sign_in"; accountPlays: Play[] }
  | { kind: "sign_out" }

export function playsAfterPlayerChange(change: PlayerChange): Play[] {
  if (change.kind === "create_account") {
    return change.guestPlays
  }
  if (change.kind === "sign_in") {
    return change.accountPlays
  }
  return []
}

export function playerChangeForAuth({
  accountIsNew,
  guestPlays,
  accountPlays,
}: {
  accountIsNew: boolean
  guestPlays: Play[]
  accountPlays: Play[]
}): PlayerChange {
  if (accountIsNew) {
    return { kind: "create_account", guestPlays }
  }
  return { kind: "sign_in", accountPlays }
}
