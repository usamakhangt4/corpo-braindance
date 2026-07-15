# CORPO // BRAINDANCE — Technical Notes

## Product contract

CORPO // BRAINDANCE is a local-first portfolio experience. Its single job is to generate satirical corporate language and let a visitor curate a personal collection without registration or network dependencies.

There are two routes:

- `/` — generator, actions, recent transmissions, and Neural Dossier
- `/hall-of-shame` — curated artifacts plus locally filed records and browser-local voting

## Data flow

```text
Word banks
   ↓
Buzzword Lab ──→ Generator UI
   ↓                  ↓
Ranking logic ← Zustand store → localStorage
   ↓
Hall of Shame UI
```

### Buzzword Lab

`src/lib/buzzwords/lab.ts` is the behavior module. Its interface contains four operations:

- `generateBuzzword(role)`
- `fileBuzzword(entries, buzzword)`
- `toggleLocalVote(votes, entryId, action)`
- `rankHallEntries(dossier, votes)`

The implementation hides random selection, duplicate prevention, dossier limits, curated-entry merging, score adjustment, and ranking tie-breakers. Generation accepts an optional random source so tests can be deterministic without introducing a remote adapter.

### Browser state

`src/lib/stores/use-buzzword-store.ts` manages current UI state and persists:

- the last ten generated phrases;
- up to twenty filed dossier entries;
- local votes;
- the selected generation role.

Persistence uses the `corpo-braindance-dossier` key. Hydration starts after mount through `LocalStateHydrator`, keeping server-rendered and first-client-rendered markup consistent.

### Hall ranking

The Hall starts with curated sample artifacts. Filed phrases are added with zero base points. A local Promote vote adds one point, a Fire vote subtracts one, and repeating the same vote clears it. Entries sort by points, then synergy score, then stable ID.

The interface explicitly labels this as a local simulation; no shared leaderboard is implied.

## Static deployment

`next.config.ts` uses `output: 'export'`. The production build writes static assets to `out/` and requires no environment variables, server functions, database, scheduled activity, or secrets.

Any host that serves static files can deploy the project. Vercel and Netlify can run `npm run build`; other hosts can publish the generated `out/` directory. Project-scoped GitHub Pages deployments need the matching Next.js `basePath` configured first.

## Accessibility and resilience

- Navigation is keyboard operable and the mobile dialog traps and restores focus.
- Controls expose pressed state and descriptive labels.
- Status messages use live regions through the toast and loading primitives.
- Reduced-motion preferences disable decorative animation.
- Core interactions make no runtime network calls after the static application has loaded.

## Verification

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

The local behavior tests cover deterministic generation, duplicate filing, vote toggling, and ranking. The browser smoke test covers the generator, dossier persistence, Hall voting, mobile navigation focus, and reduced-motion rendering.

## Archived backend version

The reviewed Supabase implementation is preserved on branch `uk/fullstack-supabase-archive` at commit `8c40d36` for code-history and full-stack reference.
