# SorokDva Labs — design system direction

## Product and relationship

SorokDva Labs is the experimental companion to the main Sorok-Dva portfolio. It hosts interactive creative-code studies: artificial life, emergent systems, WebGL pieces, shaders, generative art, and perceptual simulations. The redesign must make moving from `42portfolio` to Labs feel like continuing the same voyage, not opening a separate template.

Primary audience:

- Recruiters and technical leaders evaluating craft and range.
- Freelance clients looking for premium interactive work.
- Curious visitors who want to launch and explore experiments immediately.

Primary homepage job:

1. Establish Sorok-Dva identity and direct continuity with the portfolio.
2. Explain plainly that this is a cabinet of digital curiosities containing web experiments of all kinds.
3. Surface live experiments with unmistakable launch affordances.
4. Separate live, prototype, and incubation states without making unfinished work feel broken.

Existing experience routes and their full-screen simulations must remain functional. The redesign is primarily the shared shell and homepage, then a compact consistent return/header layer inside experiences.

## Messaging and copy

The wording is deliberately simple, direct, and descriptive. SorokDva Labs is not positioned as a research institute, a production methodology, a technology showcase, or a recruitment funnel. It is a cabinet of digital curiosities containing varied web experiments, and nothing more needs to be promised.

Canonical French homepage copy:

- Hero eyebrow: `CABINET DE CURIOSITÉS NUMÉRIQUES`
- Hero title: `Des expériences web, en tout genre.`
- Hero description: `Un endroit où je rassemble des expériences interactives, des simulations, des visualisations et d'autres curiosités à explorer directement dans le navigateur.`
- Primary CTA: `Explorer le cabinet`
- Secondary CTA: `Retour au portfolio`
- Catalogue label: `01 · LE CABINET`
- Catalogue heading: `Les curiosités numériques`
- About label: `02 · À PROPOS`
- About heading: `Un espace pour expérimenter.`
- About body: `Des expériences web de toutes sortes, réunies au même endroit. Certaines sont terminées, d'autres encore en construction.`

Avoid abstract phrases about living systems, emergence, research, instrumentation, production pipelines, pushing limits, premium work, or art/science. Technical HUD labels may remain decorative, but user-facing prose must stay plain.

## Design DNA inherited from `42portfolio`

The portfolio's approved visual language is the source of truth:

- Cinematic deep-space stage.
- Warm solar gold on blue-black, never violet.
- Elegant, controlled motion; the wow lives near the top and content stays readable.
- Technical instrument-readout details paired with large editorial display type.
- Thin structural borders, translucent abyss surfaces, restrained glows, and registration ticks.
- A sense of trajectory and coordinates rather than generic glassmorphism.

Do not use:

- Purple, magenta, rainbow gradients, or generic SaaS neon.
- A terminal-grid cliché.
- Oversized clouds of blurry gradient blobs.
- Decorative pills everywhere.
- Identical card grids with no hierarchy.
- Excessive rounded rectangles; reserve rounded shapes for true controls and small status capsules.

## Color tokens

Use these exact portfolio tokens:

```css
--space: #04060d;
--abyss: #090e1a;
--abyss-2: #0e1525;
--hairline: #1b2236;
--starlight: #f3f1e9;
--sun: #ffc978;
--sun-deep: #e8973c;
--ion: #7cc4ff;
--ember: #ff6b5b;
--dust: #97a0b5;
```

Usage:

- `space`: page and atmospheric background.
- `abyss`: translucent panels at roughly 65–82% opacity.
- `abyss-2`: selected or hover surface.
- `hairline`: all structural borders and dividers.
- `starlight`: primary copy.
- `sun`: identity, primary CTA, section waypoints, focus, and rare glow.
- `sun-deep`: restrained gradient depth or hover.
- `ion`: live/system status and secondary links.
- `ember`: warnings only.
- `dust`: supporting copy.

## Typography

- Display: Space Grotesk, weights 400–600. Use light/regular large headings with tight line-height.
- Body: Inter Tight, weight 400–600.
- Technical labels: Space Mono, weights 400/700.
- Hero display: 64–88px desktop, 43–56px mobile, 1.0–1.06 line-height.
- Section display: 38–52px.
- Body: 16–18px, 1.6–1.75 line-height.
- Labels: 11–12px uppercase, 0.20–0.28em tracking.

Typography should feel editorial and engineered. Never introduce a decorative serif or alternate display face.

## Layout and homepage composition

- Overall content width: 1152px (`max-w-6xl`) with 20–32px gutters.
- Fixed, transparent-to-blurred header matching the portfolio:
  - left: `[42]` solar-gold signature + `Sorok-Dva / Labs`;
  - center/right desktop navigation: `Experiences`, `Manifesto`, `Portfolio`;
  - compact FR/EN switch matching the portfolio control.
- Hero: 100svh and derived closely from `42portfolio/design-prototypes/spacetime.html`. The WebGL visual is a high-resolution solar-gold grid sheet receding in perspective and physically warped into a deep gravity well on the right. The deepest funnel shifts toward ion blue, with a restrained glowing mass at its base.
- Preserve the prototype's composition: editorial copy on the left over a strong dark legibility scrim; four corner registration marks; top-right Paris/WebGL HUD coordinates; bottom-centered technical tag; subtle camera/content parallax and a pointer-driven secondary gravity well.
- Adapt the prototype copy to SorokDva Labs, but preserve its layout, visual hierarchy, gold-grid material, depth, interactions, and cinematic balance. Do not substitute the warped grid with a generic orbit diagram, dashboard, card, or flat CSS grid.
- Use the eyebrow `TRANSMISSION · LABS · SOROK-DVA` and a concise headline about experiments becoming living systems.
- Primary CTA: warm gold filled button, `Explorer les expériences`.
- Secondary CTA: hairline outline, `Retour au portfolio`.
- Below hero: a slim telemetry rail with counts such as live experiences, WebGL systems, and active research tracks.
- Experience collection:
  - editorial section waypoint (`01 · EXPÉRIENCES VIVANTES`);
  - one featured live experiment occupying more visual weight;
  - remaining experiments arranged as varied dossier rows/cards rather than an undifferentiated 2×N grid;
  - each item shows index, status, field/category, short description, and `Lancer` or `En incubation`;
  - use status dots and mono labels, not large badges.
- Manifesto/research bridge section: explain how lab discoveries feed production work; pair three concise principles with technical readouts.
- Footer: use the approved Observatoire footer composition — `[42] Sorok-Dva` and `Cabinet des curiosités numériques`, centered GitHub/Archive/Portfolio links, plus an ion-blue `TRANSMISSION_STABLE` status on the right.

## Approved hybrid composition

- Overall page base: the selected `Dossiers de recherche` draft.
- Header, telemetry rail, numbered research catalogue, dossier rows, manifesto, long hairline dividers, and negative-space rhythm remain from Dossiers.
- Hero visual and spatial composition come from `42portfolio/design-prototypes/spacetime.html`, adapted to Labs copy.
- Footer comes from the `Observatoire vivant` draft.

## Surfaces, borders, and shape language

- Panels: `rgba(9, 14, 26, 0.65–0.82)` with 1px `hairline` border and 8–12px backdrop blur.
- Main radii: 16px for cards/panels; 999px only for buttons, status controls, and language switch.
- Featured dossier may use 20px radius, but avoid the current 28–32px inflated look.
- Add subtle 9px corner registration ticks to selected/featured surfaces.
- Shadows are mostly ambient black depth. Solar glow is rare and localized around live indicators or hero core.
- Dividers are thin, long, and functional.

## Motion and interaction

- Controlled motion: 250–600ms, easing around `cubic-bezier(0.2, 0.7, 0.2, 1)`.
- Header gains a blurred `space` surface after scroll.
- Hero atmospheric elements drift slowly; avoid large perpetual transforms.
- Experience rows rise 12–18px and fade once on entry.
- Hover: border warms toward `sun`, title moves to `sun`, arrow shifts 2–4px.
- Featured hero observatory can respond subtly to the pointer but must remain legible and GPU-light.
- Respect `prefers-reduced-motion`: remove drift and reduce all motion to near-instant fades.

## Responsive behavior

- Mobile prioritizes content and launch paths.
- Header collapses to signature, language switch, and menu.
- Hero visual moves below the copy and becomes a compact 4:3 instrument panel.
- Experience cards become single-column dossier rows.
- Do not require hover to understand status or launchability.
- Maintain 44px minimum tap targets and visible solar-gold keyboard focus.

## Accessibility

- All visual experiment previews need semantic text equivalents.
- Status must never rely on color alone.
- `starlight` and `dust` text must retain readable contrast on `space`/`abyss`.
- Interactive elements keep visible `sun` focus rings.
- Language switch has explicit accessible labels.
- Decorative cosmic/orbital visuals are `aria-hidden`.

## Implementation constraints

- Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4.
- Existing shadcn/ui components use Radix and Lucide.
- Theme work belongs in `app/globals.css`; do not create a parallel active stylesheet.
- Prefer semantic tokens and existing primitives where they improve behavior.
- Preserve every existing experience route and simulation.
- Keep the redesign dependency-light; use CSS and existing Lucide icons for the homepage visual unless a real interactive background is intentionally introduced.
