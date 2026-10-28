# JUOMAPELI — Mene töihin(V1)
Digital drinking games built with React, Vite, TypeScript, Tailwind and Lucide. Includes King's Cup, Ravit (a horse-racing card game), Higher or Lower, Bus Driver (Ride the Bus), a multiplayer card game with English and Finnish UI, and Case Opening, a username-based animated roulette game. Drink responsibly; 18+.

## Requirements
Node.js 22.12.x, 24.x, or 26+ and npm.

## Install
`npm install`

## Development
`npm run dev` starts the Vite app and the room API together (open the printed URL; use browser device mode at 375–430px). The room API is available at `http://127.0.0.1:3001`; Vite proxies `/api` requests to it.

Bus Driver rooms are server-authoritative: the Node API creates/shuffles decks, validates turns and guesses, tracks private hands, and publishes each player's filtered room state. Room codes can be shared with other people who can reach the same host. A room supports 1–6 players, so the host can start a solo game or invite up to five others. All players must be ready before starting. A room's state is held in server memory, so restarting the API ends active rooms; reconnecting players can return with their saved browser session while the API remains running.

The host can configure guess and pyramid penalties, equal-card handling, one-versus-all matching-card plays, pyramid response order/mode, and challenge length. The default scoring is points only; alcohol is never required. A fresh shuffled deck is explicitly created and announced if a long run exhausts the current pack.

For separate processes, use `npm run server` and `npm run dev:web` in two terminals. Set `API_PORT` to change the room API port and `API_URL` to change the Vite proxy target. For deployment, host the Node API and configure the web server/reverse proxy to route `/api` to that API; the Vite build alone is a static client and does not provide multiplayer rooms.

## Testing
`npm test` (Vitest, game logic tests under `src/games/`, including Case Opening and Bus Driver)

## Production build
`npm run build` → output in `dist/` (`npm run preview` to check it)

## Deploy
`dist/` is static (relative base path). Upload it to a static host and configure a reverse proxy/API deployment for `/api` to enable Bus Driver multiplayer.

## Structure
`src/games/cheers/`, `src/games/ravit/`, `src/games/higher-lower/`, and `src/games/case-opening/` keep each game's logic, tests, and UI separate. `src/games/bus-driver/` contains the room UI; `shared/busGame.mjs` owns the server-validated rules and `server.mjs` provides the room API.
