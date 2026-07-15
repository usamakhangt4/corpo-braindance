# CORPO // BRAINDANCE

A frontend-only corporate buzzword generator with a cyberpunk personnel-system aesthetic. Generate executive nonsense, copy it as a ready-made brief, and file the best phrases in a personal Neural Dossier.

The application has no backend, accounts, analytics, or environment variables. Dossier entries and recent history stay in the visitor's browser through `localStorage`.

## Features

- Three generation modes: Visionary, Growth, and Engineering
- Instant local phrase generation with a simulated synergy score
- Clipboard-ready corporate briefs
- A local Neural Dossier for up to 20 saved phrases
- Copy, remove, or clear individual dossier records
- Export the complete dossier as portable plain text
- Ten-entry recent transmission history
- Responsive, keyboard-accessible single-page interface
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

- `src/lib/buzzwords/lab.ts` owns generation, duplicate-safe filing, and dossier formatting.
- `src/lib/stores/use-buzzword-store.ts` owns browser state and persists only history, dossier entries, and the selected role.
- `src/app/page.tsx` presents the complete generator-to-dossier workflow.

The previous Supabase-backed version is preserved on the `uk/fullstack-supabase-archive` branch at commit `8c40d36`.

## Local data

Browser state is stored under the key `corpo-braindance-dossier`. Clearing site data resets the dossier and recent history.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- Vitest
