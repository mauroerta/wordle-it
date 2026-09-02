import type { Play } from "../play/play"
import { createDevicePlays } from "./device"
import type { KeyValueStore } from "./device"
import { playsAfterPlayerChange } from "./player-change"
import type { PlayerChange } from "./player-change"

export type Account = {
  takeChange: (guestPlays: Play[]) => Promise<PlayerChange>
  savePlay: (play: Play) => Promise<void>
}

export function createPlayer({
  storage,
  account,
}: {
  storage: KeyValueStore
  account?: Account
}) {
  const device = createDevicePlays({ storage })

  async function onSignIn() {
    if (!account) {
      return
    }
    device.replaceAll(
      playsAfterPlayerChange(await account.takeChange(device.load()))
    )
  }

  async function savePlay(play: Play) {
    device.savePlay(play)
    if (!account) {
      return
    }
    await account.savePlay(play)
  }

  function onSignOut() {
    device.replaceAll([])
  }

  return {
    load: device.load,
    playForGameDay: device.playForGameDay,
    savePlay,
    hasEverPlayed: device.hasEverPlayed,
    onSignIn,
    onSignOut,
  }
}

export function createServerAccount(): Account {
  return {
    async takeChange(guestPlays) {
      const { takePlayerChange } = await import("./account-server")
      return takePlayerChange({ data: { guestPlays } })
    },
    async savePlay(play) {
      const { saveAccountPlay } = await import("./account-server")
      await saveAccountPlay({ data: { play } })
    },
  }
}
