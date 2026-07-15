# CORPO // BRAINDANCE

A frontend-only corporate buzzword generator with a cyberpunk personnel-system aesthetic. Generate executive nonsense, file favorite phrases to a local dossier, and rank curated artifacts in the Hall of Shame.

The application has no backend, accounts, analytics, or environment variables. Dossier entries, recent history, and votes remain in the visitor's browser through `localStorage`.

## Features

- Three generation modes: Visionary, Growth, and Engineering
- Instant local phrase generation with a simulated synergy score
- Clipboard-ready corporate briefs
- A Neural Dossier for up to 20 saved phrases
- Ten-entry recent transmission history
- Curated Hall of Shame merged with locally filed phrases
- Browser-local Promote and Fire voting
- Responsive radial navigation, keyboard focus management, and reduced-motion support
- Static export suitable for passive portfolio hosting

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No `.env` file or external account is required.

## Verify and build

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

`npm run build` produces a deployable static site in `out/`.

## Architecture

- `src/lib/buzzwords/lab.ts` owns generation, dossier filing, vote toggling, and ranking.
- `src/lib/stores/use-buzzword-store.ts` owns browser state and persists only history, dossier entries, votes, and the selected role.
- `src/app/page.tsx` presents the generator and dossier.
- `src/app/(features)/hall-of-shame/` presents the curated and locally filed ranking.

The previous Supabase-backed version is preserved on the `uk/fullstack-supabase-archive` branch at commit `8c40d36`.

## Local data

Browser state is stored under the key `corpo-braindance-dossier`. Clearing site data resets the dossier, history, and local votes.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- Vitest
