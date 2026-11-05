# Siply - Drinking Game
Digital drinking games built with React, Vite, TypeScript, Tailwind and Lucide. Includes King's Cup, Ravit (a horse-racing card game), Higher or Lower, Bus Driver (Ride the Bus), a local pass-and-play card game with English and Finnish UI, and Case Opening, a username-based animated roulette game. Drink responsibly; 18+.

## Requirements
Node.js 22.12.x, 24.x, or 26+ and npm.

## Install
`npm install`

## Development
`npm run dev` starts the Vite app and Node API together (open the printed URL; use browser device mode at 375–430px). The API is available at `http://127.0.0.1:3001`.

Bus Driver uses the same local player setup as the other games. It supports 1–6 players sharing one device; pass the device to the active player during their turn. No room or API connection is needed to play.

The host can configure guess and pyramid penalties, equal-card handling, one-versus-all matching-card plays, pyramid response order/mode, and challenge length. The default scoring is points only; alcohol is never required. A fresh shuffled deck is explicitly created and announced if a long run exhausts the current pack.

For separate processes, use `npm run server` and `npm run dev:web` in two terminals. Set `API_PORT` to change the API port and `API_URL` to change the Vite proxy target.

## Testing
`npm test` (Vitest, game logic tests under `src/games/`, including Case Opening and Bus Driver)

## Production build
`npm run build` → output in `dist/` (`npm run preview` to check it)

## Deploy
`dist/` is static (relative base path) and can be uploaded to a static host.

## Structure
`src/games/cheers/`, `src/games/ravit/`, `src/games/higher-lower/`, and `src/games/case-opening/` keep each game's logic, tests, and UI separate. `src/games/bus-driver/` contains Bus Driver's local game UI; its rules are shared from `shared/busGame.mjs`.
