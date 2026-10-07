# JUOMAPELI — Kkona (V1)
Client-side digital drinking-game app (React + Vite + TypeScript + Tailwind + Lucide). One game: Hitler, a 52-card sip-based party game. No backend, accounts or storage. Drink responsibly; 18+.

## Requirements
Node.js 18+ and npm.

## Install
`npm install`

## Development
`npm run dev` (open the printed URL; use browser device mode at 375–430px)

## Testing
`npm test` (Vitest, pure game logic in `src/games/hitler/hitlerGameLogic.test.ts`)

## Production build
`npm run build` → output in `dist/` (`npm run preview` to check it)

## Deploy
`dist/` is static (relative base path). Upload it to Netlify, Vercel, GitHub Pages, Cloudflare Pages or any static host.

## Structure
`src/games/hitler/` holds types, deck, rules, pure logic and event UI, so another game can be added later under `src/games/`.
