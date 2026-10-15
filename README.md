# JUOMAPELI — Mene töihin(V1)
Client-side digital drinking-game app (React + Vite + TypeScript + Tailwind + Lucide). Games include Hitler and Higher or Lower, a rank-guessing game played through a full 52-card deck with a visible card history arranged from Ace to King. Ace is low, a correct first guess makes the dealer drink the card's value in sips, and a correct second guess makes the dealer drink the rank difference between the revealed card and the first wrong guess. A completed rank is no longer available to guess. No backend, accounts or storage. Drink responsibly; 18+. Have Fun!

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
`src/games/hitler/` holds the Hitler game. `src/games/higher-lower/` contains the Higher or Lower game UI and logic..
