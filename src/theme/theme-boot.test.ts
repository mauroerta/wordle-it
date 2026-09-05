import { describe, expect, test } from "vitest"
import { THEME_BOOT_SCRIPT } from "./theme-boot"

function boot({
  stored,
  prefersDark,
}: {
  stored: Record<string, string>
  prefersDark: boolean
}): Set<string> {
  const classes = new Set<string>()
  const fakeWindow = {
    localStorage: { getItem: (key: string) => stored[key] ?? null },
    matchMedia: () => ({ matches: prefersDark }),
  }
  const fakeDocument = {
    body: {
      classList: {
        toggle(name: string, on: boolean) {
          if (on) {
            classes.add(name)
          } else {
            classes.delete(name)
          }
        },
      },
    },
  }
  new Function("window", "document", THEME_BOOT_SCRIPT)(
    fakeWindow,
    fakeDocument
  )
  return classes
}

describe("THEME_BOOT_SCRIPT", () => {
  test("applies saved nightmode and colorblind before paint", () => {
    expect(
      boot({
        stored: { "parle.nightmode": "true", "parle.colorblind": "true" },
        prefersDark: false,
      })
    ).toEqual(new Set(["nightmode", "dark", "colorblind"]))
  })

  test("falls back to the system preference when nothing is saved", () => {
    expect(boot({ stored: {}, prefersDark: true })).toEqual(
      new Set(["nightmode", "dark"])
    )
    expect(boot({ stored: {}, prefersDark: false })).toEqual(new Set())
  })

  test("a saved choice beats the system preference", () => {
    expect(
      boot({ stored: { "parle.nightmode": "false" }, prefersDark: true })
    ).toEqual(new Set())
  })
})
