import { describe, expect, it } from "vitest"
import { HELP_DISMISSED_KEY, createHelpDismissal } from "./help-dismissal"

function memoryStore(initial: Record<string, string> = {}) {
  const data = { ...initial }
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value
    },
  }
}

describe("createHelpDismissal", () => {
  it("starts undismissed", () => {
    const dismissal = createHelpDismissal({ storage: memoryStore() })
    expect(dismissal.isDismissed()).toBe(false)
  })

  it("reads a prior dismissal", () => {
    const dismissal = createHelpDismissal({
      storage: memoryStore({ [HELP_DISMISSED_KEY]: "1" }),
    })
    expect(dismissal.isDismissed()).toBe(true)
  })

  it("persists dismiss", () => {
    const storage = memoryStore()
    const dismissal = createHelpDismissal({ storage })
    dismissal.dismiss()
    expect(storage.getItem(HELP_DISMISSED_KEY)).toBe("1")
    expect(dismissal.isDismissed()).toBe(true)
  })
})
