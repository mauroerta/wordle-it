export type InstallKind = "installed" | "ios" | "browser"

export type InstallEnvironment = {
  displayModeStandalone: boolean
  iosStandalone: boolean
  userAgent: string
  platform: string
  maxTouchPoints: number
}

export function installKind(env: InstallEnvironment): InstallKind {
  if (env.displayModeStandalone || env.iosStandalone) {
    return "installed"
  }
  if (isIosDevice(env)) {
    return "ios"
  }
  return "browser"
}

export function isIosDevice({
  userAgent,
  platform,
  maxTouchPoints,
}: Pick<
  InstallEnvironment,
  "userAgent" | "platform" | "maxTouchPoints"
>): boolean {
  if (/iphone|ipod|ipad/i.test(userAgent)) {
    return true
  }
  // iPadOS reports as MacIntel but is a touch device.
  return platform === "MacIntel" && maxTouchPoints > 1
}

export function readInstallEnvironment(
  win: Window = window
): InstallEnvironment {
  const nav = win.navigator as Navigator & { standalone?: boolean }
  return {
    displayModeStandalone: win.matchMedia("(display-mode: standalone)").matches,
    iosStandalone: nav.standalone === true,
    userAgent: nav.userAgent,
    platform: nav.platform,
    maxTouchPoints: nav.maxTouchPoints,
  }
}
