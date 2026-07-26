# Theme

## Part 1 — compact token summary

- Active stylesheet: `app/globals.css` (Tailwind CSS 4 via `@import "tailwindcss"`).
- Fonts: Geist Sans for UI/body, Geist Mono for technical labels.
- Base background: `#020617` with violet, emerald, and blue radial gradients.
- Semantic palette: deep cyan/slate surfaces; white foreground; lime `oklch(0.75 0.15 120)` primary; destructive red.
- Home-specific color language: `slate-950` background, translucent white surfaces, purple/indigo/emerald/sky gradients, white 10% borders.
- Radius token: `0.5rem`; homepage adds bespoke 24–32px glass-card radii.
- Shadows: soft black card depth plus purple glow; backdrop blur across hero navigation, map panel, collection intro, and cards.
- Layout: `max-w-6xl`, 24px horizontal padding, mobile-first stacks, two columns from `md`.
- Motion: 300–500ms color, opacity, shadow, and transform transitions. Utility float is 3s; glow is 2s.
- Breakpoints: Tailwind CSS 4 defaults (`sm`, `md`, `lg`, `xl`, `2xl`).

## Part 2 — raw active source

### `app/globals.css`

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(0.15 0.05 200);
  --foreground: oklch(0.98 0 0);
  --card: oklch(0.25 0.02 220);
  --card-foreground: oklch(0.98 0 0);
  --popover: oklch(0.95 0.01 180);
  --popover-foreground: oklch(0.15 0.05 200);
  --primary: oklch(0.75 0.15 120);
  --primary-foreground: oklch(0.15 0.05 200);
  --secondary: oklch(0.98 0 0);
  --secondary-foreground: oklch(0.25 0.02 220);
  --muted: oklch(0.95 0.01 180);
  --muted-foreground: oklch(0.35 0.02 210);
  --accent: oklch(0.75 0.15 120);
  --accent-foreground: oklch(0.15 0.05 200);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.25 0.02 220);
  --input: oklch(0.98 0 0);
  --ring: oklch(0.75 0.15 120 / 0.5);
  --chart-1: oklch(0.55 0.15 140);
  --chart-2: oklch(0.75 0.15 120);
  --chart-3: oklch(0.35 0.02 210);
  --chart-4: oklch(0.95 0.01 180);
  --chart-5: oklch(0.15 0.05 200);
  --radius: 0.5rem;
  --sidebar: oklch(0.25 0.02 220);
  --sidebar-foreground: oklch(0.98 0 0);
  --sidebar-primary: oklch(0.15 0.05 200);
  --sidebar-primary-foreground: oklch(0.98 0 0);
  --sidebar-accent: oklch(0.75 0.15 120);
  --sidebar-accent-foreground: oklch(0.15 0.05 200);
  --sidebar-border: oklch(0.35 0.02 210);
  --sidebar-ring: oklch(0.75 0.15 120 / 0.5);
}

.dark {
  --background: oklch(0.08 0.03 200);
  --foreground: oklch(0.98 0 0);
  --card: oklch(0.12 0.02 220);
  --card-foreground: oklch(0.98 0 0);
  --popover: oklch(0.12 0.02 220);
  --popover-foreground: oklch(0.98 0 0);
  --primary: oklch(0.75 0.15 120);
  --primary-foreground: oklch(0.08 0.03 200);
  --secondary: oklch(0.18 0.02 220);
  --secondary-foreground: oklch(0.98 0 0);
  --muted: oklch(0.18 0.02 220);
  --muted-foreground: oklch(0.65 0.02 200);
  --accent: oklch(0.75 0.15 120);
  --accent-foreground: oklch(0.08 0.03 200);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.18 0.02 220);
  --input: oklch(0.18 0.02 220);
  --ring: oklch(0.75 0.15 120 / 0.5);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.12 0.02 220);
  --sidebar-foreground: oklch(0.98 0 0);
  --sidebar-primary: oklch(0.75 0.15 120);
  --sidebar-primary-foreground: oklch(0.08 0.03 200);
  --sidebar-accent: oklch(0.18 0.02 220);
  --sidebar-accent-foreground: oklch(0.98 0 0);
  --sidebar-border: oklch(0.18 0.02 220);
  --sidebar-ring: oklch(0.75 0.15 120 / 0.5);
}

@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    background-color: #020617;
    background-image:
      radial-gradient(circle at top left, rgba(79, 70, 229, 0.22), transparent 55%),
      radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.18), transparent 60%),
      radial-gradient(circle at bottom, rgba(37, 99, 235, 0.15), transparent 65%),
      linear-gradient(115deg, rgba(2, 6, 23, 0.95), rgba(15, 23, 42, 0.88));
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes glow {
  0%,
  100% {
    box-shadow: 0 0 5px var(--accent);
  }
  50% {
    box-shadow: 0 0 20px var(--accent), 0 0 30px var(--accent);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}
```

There is also a stale `styles/globals.css` generated shadcn default stylesheet, but it is not imported by the App Router layout and is not part of the live render.
