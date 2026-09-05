import { describe, expect, it } from "vitest"
import { installKind, isIosDevice } from "./installability"

describe("installKind", () => {
  it("treats standalone display mode as installed", () => {
    expect(
      installKind({
        displayModeStandalone: true,
        iosStandalone: false,
        userAgent: "Mozilla/5.0",
        platform: "MacIntel",
        maxTouchPoints: 0,
      })
    ).toBe("installed")
  })

  it("treats iOS home-screen standalone as installed", () => {
    expect(
      installKind({
        displayModeStandalone: false,
        iosStandalone: true,
        userAgent: "iPhone",
        platform: "iPhone",
        maxTouchPoints: 5,
      })
    ).toBe("installed")
  })

  it("classifies iPhone Safari as ios", () => {
    expect(
      installKind({
        displayModeStandalone: false,
        iosStandalone: false,
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        platform: "iPhone",
        maxTouchPoints: 5,
      })
    ).toBe("ios")
  })

  it("classifies iPadOS desktop UA as ios", () => {
    expect(
      installKind({
        displayModeStandalone: false,
        iosStandalone: false,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        platform: "MacIntel",
        maxTouchPoints: 5,
      })
    ).toBe("ios")
  })

  it("classifies desktop Chrome as browser", () => {
    expect(
      installKind({
        displayModeStandalone: false,
        iosStandalone: false,
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0",
        platform: "MacIntel",
        maxTouchPoints: 0,
      })
    ).toBe("browser")
  })
})

describe("isIosDevice", () => {
  it("detects iPod", () => {
    expect(
      isIosDevice({
        userAgent: "iPod touch",
        platform: "iPod",
        maxTouchPoints: 5,
      })
    ).toBe(true)
  })
})
