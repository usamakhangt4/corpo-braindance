# CORPO // BRAINDANCE — Technical Notes

## Product contract

CORPO // BRAINDANCE is a local-first portfolio experience. Its single job is to generate satirical corporate language and let a visitor save favorites without registration or network dependencies.

The product intentionally has one route: `/`. The generator is the primary experience; Saved Briefs is a secondary collection below it.

## Data flow

```text
Word banks
   ↓
Buzzword Lab → Generator UI
   ↓              ↓
Zustand store → localStorage
   ↓
Saved Briefs
```

### Buzzword Lab

`src/lib/buzzwords/lab.ts` exposes three operations:

- `generateBuzzword(role)`
- `fileBuzzword(entries, buzzword)`
- `formatSavedBriefs(entries)`

The implementation hides random selection, duplicate prevention, the 20-item limit, and portable text formatting. Generation accepts an optional random source so tests remain deterministic without a remote adapter.

### Browser state

`src/lib/stores/use-buzzword-store.ts` persists up to 20 saved briefs and the selected generation role. The legacy-compatible storage key remains `corpo-braindance-dossier` so existing saved data continues to load.

Hydration starts after mount through `LocalStateHydrator`, keeping server-rendered and first-client-rendered markup consistent.

### Saved brief interaction

The empty collection is a compact prompt below the generator rather than a permanent sidebar. Once populated, briefs appear in a responsive card grid. Visitors can copy or remove one brief, copy all briefs as plain text, or clear the collection. Remove and clear actions offer Undo.

### Motion and responsive behavior

The interface uses CSS-only ambient and stateful motion: a perspective data grid, low-contrast data streams, one-time interface decoding, and a short cyan-to-magenta transmission sweep while a new phrase is generated. Motion never blocks input, and `prefers-reduced-motion` removes it. The saved collection uses intrinsic sizing plus a container query, while controls maintain 44px touch targets on narrow screens.

## Static deployment

`next.config.ts` uses `output: 'export'`. The production build writes static assets to `out/` and requires no environment variables, server functions, database, scheduled activity, or secrets.

Any host that serves static files can deploy the project. Vercel and Netlify can run `npm run build`; other hosts can publish the generated `out/` directory. Project-scoped GitHub Pages deployments need the matching Next.js `basePath` configured first.

## Accessibility and resilience

- The single page has a skip link and semantic regions.
- Mode controls expose pressed state; icon actions have descriptive labels.
- Keyboard focus remains visible.
- Destructive actions are reversible through Undo.
- Status messages use live regions through toast primitives.
- Reduced-motion preferences disable decorative animation.
- Increased-contrast preferences remove ambient effects and strengthen borders.
- Core interactions make no runtime network calls after the static application loads.

## Verification

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

The behavior tests cover deterministic generation, duplicate saving, and saved-brief formatting. The browser smoke test covers saving, persistence, clipboard actions, removal, clearing, undo, responsive rendering, and runtime errors.

## Archived backend version

The reviewed Supabase implementation is preserved on branch `uk/fullstack-supabase-archive` at commit `8c40d36` for code-history and full-stack reference.
