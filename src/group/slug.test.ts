import { describe, expect, test } from "vitest"
import { slugFromName, uniqueSlug } from "./slug"

describe("slugFromName", () => {
  test("derives a frozen-looking slug from an Italian display name", () => {
    expect(slugFromName("Famiglia Rossi")).toBe("famiglia-rossi")
    expect(slugFromName("Caffè in ufficio!")).toBe("caffe-in-ufficio")
  })

  test("falls back when nothing letter-like remains", () => {
    expect(slugFromName("!!!")).toBe("gruppo")
  })
})

describe("uniqueSlug", () => {
  test("appends -2 when the base is taken", () => {
    expect(
      uniqueSlug({ base: "famiglia-rossi", taken: new Set(["famiglia-rossi"]) })
    ).toBe("famiglia-rossi-2")
  })
})
