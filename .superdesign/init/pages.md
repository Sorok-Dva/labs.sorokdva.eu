# Page dependency trees

## `/` — Homepage

Entry: `app/page.tsx`

- `app/page.tsx`
  - `components/hero-section.tsx`
    - `next/link`
  - `components/experience-gallery.tsx`
    - `components/ui/card.tsx`
      - `lib/utils.ts`
    - `next/link`
- Shared layout: `app/layout.tsx`
  - `app/globals.css`
  - `components/i18n/I18nProvider.tsx`
    - `locales/en/microcosm.json`
    - `locales/fr/microcosm.json`
  - `components/i18n/LanguageSwitcher.tsx`
    - `components/i18n/I18nProvider.tsx`

## `/experiences/microcosm`

Entry: `app/experiences/microcosm/page.tsx`

- `app/experiences/microcosm/page.tsx`
  - `components/experiences/microcosm/microcosm.tsx`
    - `components/experiences/microcosm/types.ts`
    - `components/experiences/microcosm/constants.ts`
    - `components/experiences/microcosm/utils.ts`
    - `components/experiences/microcosm/camera.ts`
    - `components/experiences/microcosm/control-panel.tsx`
      - `components/ui/card.tsx`
      - `components/ui/button.tsx`
      - `components/ui/badge.tsx`
      - `components/ui/slider.tsx`
      - `components/ui/switch.tsx`
      - `components/ui/label.tsx`
      - `components/ui/accordion.tsx`
    - `components/experiences/microcosm/cell-info-panel.tsx`
      - `components/ui/card.tsx`
      - `components/ui/button.tsx`
      - `components/ui/badge.tsx`
    - `components/experiences/microcosm/context-menu.tsx`
    - `components/experiences/microcosm/back-to-home.tsx`
      - `components/ui/button.tsx`
    - `components/i18n/I18nProvider.tsx`

## `/experiences/drone-swarm`

Entry: `app/experiences/drone-swarm/page.tsx`

- `app/experiences/drone-swarm/page.tsx`
  - `components/experiences/drone-swarm/drone-swarm.tsx`
    - `components/experiences/drone-swarm/types.ts`
    - `components/experiences/drone-swarm/constants.ts`
    - `components/experiences/drone-swarm/control-panel.tsx`
      - `components/ui/card.tsx`
      - `components/ui/button.tsx`
      - `components/ui/badge.tsx`
      - `components/ui/slider.tsx`
      - `components/ui/switch.tsx`
      - `components/ui/label.tsx`
    - `components/experiences/drone-swarm/drone-info-panel.tsx`
      - `components/ui/card.tsx`
      - `components/ui/button.tsx`
      - `components/ui/badge.tsx`

## `/experiences/fractal-ocean`

Entry: `app/experiences/fractal-ocean/page.tsx`

- `app/experiences/fractal-ocean/page.tsx`
  - `components/experiences/fractal-ocean/fractal-ocean.tsx`
    - `components/experiences/fractal-ocean/types.ts`
    - `components/experiences/fractal-ocean/constants.ts`
    - React Three Fiber and Three.js

## `/experiences/living-prism`

Entry: `app/experiences/living-prism/page.tsx`

- `app/experiences/living-prism/page.tsx`
  - `components/experiences/spiral-of-life/spiral-of-life.tsx`
    - `components/experiences/spiral-of-life/types.ts`
    - `components/experiences/spiral-of-life/constants.ts`
    - React Three Fiber, Three.js, and postprocessing

## `/experiences/spiral-of-life`

Entry: `app/experiences/spiral-of-life/page.tsx`

- `app/experiences/spiral-of-life/page.tsx`
  - `components/experiences/spiral-of-life/spiral-of-life.tsx`
    - `components/experiences/spiral-of-life/types.ts`
    - `components/experiences/spiral-of-life/constants.ts`
    - React Three Fiber, Three.js, and postprocessing
