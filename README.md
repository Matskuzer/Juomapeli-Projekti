# JUOMAPELI — Mene töihin(V1)
Client-side digital drinking-game app (React + Vite + TypeScript + Tailwind + Lucide). Games: King's Cup and Ravit, a horse-racing card game. No backend, accounts or storage. Drink responsibly; 18+. Have Fun!

## Requirements
Node.js 22.12.x, 24.x, or 26+ and npm.

## Install
`npm install`

## Development
`npm run dev` (open the printed URL; use browser device mode at 375–430px)

## Testing
`npm test` (Vitest, pure game logic in `src/games/`)

## Production build
`npm run build` → output in `dist/` (`npm run preview` to check it)

## Deploy
`dist/` is static (relative base path). Upload it to Netlify, Vercel, GitHub Pages, Cloudflare Pages or any static host.

## Structure
`src/games/cheers/` and `src/games/ravit/` keep each game's types, pure logic, tests and UI separate.
