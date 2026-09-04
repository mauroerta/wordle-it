import type { KeyValueStore } from "../player/device"

export const NIGHTMODE_KEY = "parle.nightmode"
export const COLORBLIND_KEY = "parle.colorblind"

export type DeviceTheme = {
  nightmode: boolean
  colorblind: boolean
}

export function createDeviceTheme({
  storage,
  prefersDark,
}: {
  storage: KeyValueStore
  prefersDark: boolean
}) {
  function readFlag(key: string, fallback: boolean): boolean {
    const raw = storage.getItem(key)
    if (raw === null) {
      return fallback
    }
    try {
      return JSON.parse(raw) === true
    } catch {
      return fallback
    }
  }

  function load(): DeviceTheme {
    return {
      nightmode: readFlag(NIGHTMODE_KEY, prefersDark),
      colorblind: readFlag(COLORBLIND_KEY, false),
    }
  }

  function save(theme: DeviceTheme): void {
    storage.setItem(NIGHTMODE_KEY, JSON.stringify(theme.nightmode))
    storage.setItem(COLORBLIND_KEY, JSON.stringify(theme.colorblind))
  }

  return { load, save }
}
