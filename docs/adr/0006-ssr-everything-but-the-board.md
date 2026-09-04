# SSR everything but the board

Every route renders on the server except `/`. The board is device state (guest Plays, keyboard, theme toggles live in `localStorage`), so `/` stays `ssr: false`. Groups, Invite and Credits are ordinary pages: they render on the server, so content is there on first paint and the sign-in redirect is an HTTP 307, not a client bounce.

Two consequences:

- The theme is on the device, so the server cannot know it. `THEME_BOOT_SCRIPT` runs inline at the top of `<body>` and sets `nightmode` / `colorblind` before anything paints. No effect, no flash.
- Who is signed in is route context, resolved once in the root `beforeLoad`. Routes that need an Account sit under the pathless `_authed` layout, whose `beforeLoad` redirects to sign-in with the current path. Loaders only fetch data. Server functions still check auth themselves; the guard is for the redirect, not for security.

`beforeLoad` runs serially parent → child and blocks every loader below it, so it holds only the auth check. Data goes in loaders, which run in parallel and are what `router.invalidate()` refreshes.
