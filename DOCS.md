# CORPO // BRAINDANCE — Technical Notes

## Product contract

CORPO // BRAINDANCE is a local-first portfolio experience. Its single job is to generate satirical corporate language and let a visitor curate a personal collection without registration or network dependencies.

The product intentionally has one route: `/`. Generation, recent transmissions, and the Neural Dossier form one continuous workflow.

## Data flow

```text
Word banks
   ↓
Buzzword Lab → Generator UI
   ↓              ↓
Zustand store → localStorage
   ↓
Neural Dossier
```

### Buzzword Lab

`src/lib/buzzwords/lab.ts` is the behavior module. Its interface contains three operations:

- `generateBuzzword(role)`
- `fileBuzzword(entries, buzzword)`
- `formatDossier(entries)`

The implementation hides random selection, duplicate prevention, the twenty-record limit, and portable text formatting. Generation accepts an optional random source so tests remain deterministic without a remote adapter.

### Browser state

`src/lib/stores/use-buzzword-store.ts` manages current UI state and persists:

- the last ten generated phrases;
- up to twenty filed dossier entries;
- the selected generation role.

Persistence uses the `corpo-braindance-dossier` key. Hydration starts after mount through `LocalStateHydrator`, keeping server-rendered and first-client-rendered markup consistent.

### Dossier interaction

Every filed record remains visible in a bounded, scrollable collection. Visitors can copy or remove one record, copy the full dossier as plain text, or clear the collection. These actions are deliberately personal and local; the interface makes no claim of shared votes, rankings, or other users.

## Static deployment

`next.config.ts` uses `output: 'export'`. The production build writes static assets to `out/` and requires no environment variables, server functions, database, scheduled activity, or secrets.

Any host that serves static files can deploy the project. Vercel and Netlify can run `npm run build`; other hosts can publish the generated `out/` directory. Project-scoped GitHub Pages deployments need the matching Next.js `basePath` configured first.

## Accessibility and resilience

- The single page has a skip link and semantic regions.
- Mode controls expose pressed state; record actions use descriptive labels.
- Status messages use live regions through toast primitives.
- Reduced-motion preferences disable decorative animation.
- Core interactions make no runtime network calls after the static application loads.

## Verification

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

The local behavior tests cover deterministic generation, duplicate filing, and dossier formatting. The browser smoke test covers filing, persistence, per-record copy and removal, full-dossier copy, responsive rendering, and runtime errors.

## Archived backend version

The reviewed Supabase implementation is preserved on branch `uk/fullstack-supabase-archive` at commit `8c40d36` for code-history and full-stack reference.
