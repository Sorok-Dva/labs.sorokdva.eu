# Design QA — SorokDva Labs

## Comparison target

- Source visual truth:
  - Superdesign draft: `https://p.superdesign.dev/draft/572e5da7-0a89-4126-aa4a-ea7451a7605f`
  - Approved source HTML: `.superdesign/tmp/cabinet-final.html`
  - Hero WebGL source: `/home/llyam/projects/42portfolio/design-prototypes/spacetime.html`
- Implementation: `http://127.0.0.1:4173/`
- Browser path: Browser plugin not available; Playwright Chromium fallback used.
- State: French default, desktop homepage and catalogue anchor; mobile homepage, catalogue, about, and footer.

## Evidence and normalization

- Desktop CSS viewport: `1440 × 1000`, device scale factor `1`.
- Source hero screenshot: `/tmp/sorokdva-qa.EOTfaa/.playwright-cli/page-2026-07-26T14-10-33-824Z.png`
- Final implementation hero screenshot: `/tmp/sorokdva-qa.EOTfaa/.playwright-cli/page-2026-07-26T14-16-57-238Z.png`
- Hero comparison: `/tmp/sorokdva-qa.EOTfaa/hero-comparison.png`
- Source catalogue screenshot: `/tmp/sorokdva-qa.EOTfaa/.playwright-cli/page-2026-07-26T14-12-01-500Z.png`
- Final implementation catalogue screenshot: `/tmp/sorokdva-qa.EOTfaa/.playwright-cli/page-2026-07-26T14-16-59-228Z.png`
- Catalogue comparison: `/tmp/sorokdva-qa.EOTfaa/catalogue-comparison.png`
- Source and implementation captures are each `1440 × 1000` pixels at 1× density. Side-by-side comparisons are `2880 × 1000`.
- Mobile implementation screenshot: `/tmp/sorokdva-qa.EOTfaa/.playwright-cli/page-2026-07-26T14-13-57-018Z.png`
- Mobile catalogue screenshot: `/tmp/sorokdva-qa.EOTfaa/.playwright-cli/page-2026-07-26T14-14-17-159Z.png`
- Mobile about screenshot: `/tmp/sorokdva-qa.EOTfaa/.playwright-cli/page-2026-07-26T14-15-17-305Z.png`
- Mobile footer screenshot: `/tmp/sorokdva-qa.EOTfaa/.playwright-cli/page-2026-07-26T14-15-18-944Z.png`
- Mobile CSS viewport: `390 × 844`, device scale factor `1`.

The full hero and catalogue comparisons were reviewed side by side. Separate focused crops were not needed because typography, navigation, CTAs, dossier rows, status icons, and copy remain legible at the normalized desktop size. Mobile captures provide the responsive-focused evidence.

## Required fidelity surfaces

- Fonts and typography: Space Grotesk, Inter Tight, and Space Mono match the approved design and are self-hosted by Next.js. Display scale, line wrapping, italic gold accent, mono tracking, and dossier hierarchy match the source.
- Spacing and layout rhythm: Header height, hero placement, CTA group, telemetry, catalogue grid, row heights, about split, and footer rhythm match the approved composition. No horizontal overflow was detected at `390px`.
- Colors and tokens: The implementation uses the approved `space`, `abyss`, `hairline`, `starlight`, `sun`, `ion`, `ember`, and `dust` palette without the previous purple/green styling.
- Image and asset fidelity: The hero is the code-native Three.js spacetime fabric from the supplied prototype, including its gold grid, ion-blue funnel, glowing core, cursor well, and reduced-motion state. The hosted Superdesign preview failed to render its WebGL sheet during capture, so the supplied `spacetime.html` is the authoritative hero-asset reference. Icons use the configured Lucide library. The favicon is copied byte-for-byte from the 42portfolio source.
- Copy and content: Hero, CTA, catalogue, about, data log, and footer wording match the approved “cabinet de curiosités numériques” direction. The English state is fully translated and the French state remains the default.

## Interaction and runtime checks

- `Explorer le cabinet` updates the URL to `#catalogue` and lands on “Les curiosités numériques”.
- FR/EN changes the whole homepage, updates the selected radio state, and persists `lang` in `localStorage`.
- The Microcosm dossier navigates to `/experiences/microcosm`, renders meaningful content, and keeps its existing route working.
- WebGL canvas exists at desktop and mobile sizes.
- Fresh final browser log: `0` application errors and `0` warnings.
- Production command: `npm run build` passed and exported all seven application routes.

## Comparison history

1. First pass:
   - P2: Hero content was approximately `45px` lower than the selected visual.
   - P2: Catalogue anchor content was approximately `80px` lower because header compensation and section padding were both applied.
   - P2: Missing favicon produced a browser-console 404.
2. Fixes:
   - Removed the extra hero top padding while preserving full-height centering.
   - Removed redundant global anchor scroll padding.
   - Reused the exact 42portfolio favicon.
3. Post-fix evidence:
   - Hero and catalogue side-by-side comparisons align in frame, typography, spacing, and content.
   - Final desktop and mobile screenshots show no clipping or horizontal overflow.
   - Final fresh browser log contains no application errors.

## Findings

No actionable P0, P1, or P2 design mismatches remain.

## Follow-up polish

- P3: The hero is animated, so the exact grid ripple phase naturally differs between captures.
- P3: Browser coverage is Chromium only; Firefox and Safari were not part of this pass.

final result: passed
