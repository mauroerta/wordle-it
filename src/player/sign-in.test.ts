import { describe, expect, test } from "vitest"
import { safeReturnPathname, signInHref } from "./sign-in"

describe("safeReturnPathname", () => {
  test("keeps same-origin paths", () => {
    expect(safeReturnPathname("/groups/amici")).toBe("/groups/amici")
  })

  test("drops anything that could leave the origin", () => {
    expect(safeReturnPathname(null)).toBeUndefined()
    expect(safeReturnPathname("")).toBeUndefined()
    expect(safeReturnPathname("https://evil.example")).toBeUndefined()
    expect(safeReturnPathname("//evil.example/x")).toBeUndefined()
    expect(safeReturnPathname("/\\evil.example")).toBeUndefined()
    expect(safeReturnPathname("groups")).toBeUndefined()
  })
})

describe("signInHref", () => {
  test("encodes the return path", () => {
    expect(signInHref("/groups/à")).toBe(
      "/api/auth/sign-in?returnPathname=%2Fgroups%2F%C3%A0"
    )
    expect(signInHref()).toBe("/api/auth/sign-in")
  })
})
