# JUOMAPELI — Mene töihin(V1)
Client-side digital card-game app (React + Vite + TypeScript + Tailwind + Lucide). Games include King's Cup, Ravit (a horse-racing card game), and Higher or Lower, a rank-guessing game played through a full 52-card deck. No backend, accounts or storage. Drink responsibly; 18+. Have fun!

## Requirements
Node.js 22.12.x, 24.x, or 26+ and npm.

## Install
`npm install`

## Development
`npm run dev` (open the printed URL; use browser device mode at 375–430px)

## Testing
`npm test` (Vitest, pure game logic tests under `src/games/`)

## Production build
`npm run build` → output in `dist/` (`npm run preview` to check it)

## Deploy
`dist/` is static (relative base path). Upload it to Netlify, Vercel, GitHub Pages, Cloudflare Pages or any static host.

## Structure
`src/games/cheers/`, `src/games/ravit/`, and `src/games/higher-lower/` keep each game's logic, tests, and UI separate.
