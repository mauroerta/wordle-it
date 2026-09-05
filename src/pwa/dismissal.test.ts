import { describe, expect, it } from "vitest"
import {
  PWA_INSTALL_DISMISSED_KEY,
  createPwaInstallDismissal,
} from "./dismissal"

function memoryStore(initial: Record<string, string> = {}) {
  const data = { ...initial }
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value
    },
  }
}

describe("createPwaInstallDismissal", () => {
  it("starts undismissed", () => {
    const dismissal = createPwaInstallDismissal({ storage: memoryStore() })
    expect(dismissal.isDismissed()).toBe(false)
  })

  it("reads a prior dismissal", () => {
    const dismissal = createPwaInstallDismissal({
      storage: memoryStore({ [PWA_INSTALL_DISMISSED_KEY]: "1" }),
    })
    expect(dismissal.isDismissed()).toBe(true)
  })

  it("persists dismiss", () => {
    const storage = memoryStore()
    const dismissal = createPwaInstallDismissal({ storage })
    dismissal.dismiss()
    expect(storage.getItem(PWA_INSTALL_DISMISSED_KEY)).toBe("1")
    expect(dismissal.isDismissed()).toBe(true)
  })
})
