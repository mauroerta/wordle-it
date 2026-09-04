import { describe, expect, test } from "vitest"
import { accountNameFromUser } from "./account-name"

describe("accountNameFromUser", () => {
  test("uses the WorkOS full name", () => {
    expect(
      accountNameFromUser({
        firstName: "Mauro",
        lastName: "Rossi",
        email: "mauro@example.com",
      })
    ).toBe("Mauro Rossi")
  })

  test("falls back to the email handle, never the full address", () => {
    expect(
      accountNameFromUser({
        firstName: null,
        lastName: null,
        email: "mauro.rossi@example.com",
      })
    ).toBe("mauro.rossi")
  })

  test("falls back to Giocatore when WorkOS has nothing", () => {
    expect(
      accountNameFromUser({ firstName: null, lastName: "", email: null })
    ).toBe("Giocatore")
  })
})
