# Route map

The project uses Next.js 15 App Router. `app/layout.tsx` wraps every route with the global i18n provider, fixed language switcher, Suspense boundary, analytics, fonts, and `app/globals.css`.

| URL | Entry file | Main rendered component |
| --- | --- | --- |
| `/` | `app/page.tsx` | `HeroSection`, then `ExperienceGallery` |
| `/experiences/microcosm` | `app/experiences/microcosm/page.tsx` | `Microcosm` full-screen artificial-life simulation |
| `/experiences/drone-swarm` | `app/experiences/drone-swarm/page.tsx` | `DroneSwarm` full-screen simulation |
| `/experiences/fractal-ocean` | `app/experiences/fractal-ocean/page.tsx` | `FractalOcean` full-screen WebGL experience |
| `/experiences/living-prism` | `app/experiences/living-prism/page.tsx` | Currently renders `SpiralOfLife` |
| `/experiences/spiral-of-life` | `app/experiences/spiral-of-life/page.tsx` | `SpiralOfLife` full-screen WebGL experience |

## Homepage route source

```tsx
import { ExperienceGallery } from "@/components/experience-gallery"
import { HeroSection } from "@/components/hero-section"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ExperienceGallery />
    </main>
  )
}
```
