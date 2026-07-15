# CORPO // BRAINDANCE

A frontend-only corporate buzzword generator with a cyberpunk personnel-system aesthetic. Generate executive nonsense, copy it as a ready-made brief, and save favorites in the browser.

The application has no backend, accounts, analytics, or environment variables. Saved briefs remain in the visitor's browser through `localStorage`.

## Features

- Three generation modes: Visionary, Growth, and Engineering
- Instant local phrase generation with a simulated synergy score
- Clipboard-ready corporate briefs
- A local collection for up to 20 saved briefs
- Copy or remove individual briefs
- Copy or clear the complete collection
- Undo support for destructive actions
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

- `src/lib/buzzwords/lab.ts` owns generation, duplicate-safe saving, and clipboard formatting.
- `src/lib/stores/use-buzzword-store.ts` owns browser state and persists saved briefs plus the selected role.
- `src/app/page.tsx` presents the complete generator-to-saved-briefs workflow.

The previous Supabase-backed version is preserved on the `uk/fullstack-supabase-archive` branch at commit `8c40d36`.

## Local data

Browser state is stored under the legacy-compatible key `corpo-braindance-dossier`. Clearing site data resets saved briefs.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- Vitest
