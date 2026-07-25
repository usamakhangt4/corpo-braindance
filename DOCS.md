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

The interface uses CSS-only ambient and stateful motion: a perspective data grid, low-contrast data streams, one-time interface decoding, and a short cyan-to-magenta transmission sweep while a new phrase is generated. Motion never blocks input, and `prefers-reduced-motion` removes it. The saved collection uses intrinsic sizing plus a `46rem` media query, and controls maintain 44px touch targets at every width.

Generated phrases are unpredictable in length: the word banks can produce single tokens of up to 25 characters, such as `cryptographically-agilize`. Two rules keep those inside the generator panel, which clips its overflow:

- The phrase measure is governed by the panel rather than a character count, so the headline uses the width it has instead of wrapping into a narrow column.
- `overflow-wrap: break-word` guarantees an over-long token wraps instead of being sliced off, and `hyphens: auto` improves the break where the browser ships hyphenation dictionaries.

On screens narrower than `46rem` the phrase steps down to `8.8vw`, the largest size at which a 16-character token still fits a 360px-wide phone.

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

The behavior tests cover deterministic generation, duplicate saving, and saved-brief formatting.

The browser smoke test covers saving, persistence, clipboard actions, removal, clearing, undo, responsive rendering, and runtime errors. It runs against the static export rather than the dev server:

```bash
npm run build
python3 -m http.server 3100 --bind 127.0.0.1 --directory out &
python3 tests/ui-smoke.py
```

It also guards the layout rules above at 320, 390, 768, and 1440 pixels: no text may be trimmed by an ancestor's hidden overflow, the phrase must stay inside the panel across repeated generations of the longest-token technology field, and the phrase must still span at least 85% of the panel so a narrow measure cannot creep back in.

## Archived backend version

The reviewed Supabase implementation is preserved on branch `uk/fullstack-supabase-archive` at commit `8c40d36` for code-history and full-stack reference.
