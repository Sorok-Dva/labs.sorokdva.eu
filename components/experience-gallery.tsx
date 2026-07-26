"use client"

import Link from "next/link"
import { ArrowUpRight, Circle, LockKeyhole, Microscope } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useI18n } from "@/components/i18n/I18nProvider"

const content = {
  fr: {
    telemetry: [
      "Expériences interactives",
      "Dans le navigateur",
      "Collection en évolution",
    ],
    locale: "FR · EN",
    catalogueLabel: "01 · Le cabinet",
    catalogueTitle: "Les curiosités numériques",
    catalogueNote: "Disponibles maintenant ou en construction",
    available: "Disponible",
    incubation: "Incubation",
    experiences: [
      {
        id: "microcosm",
        title: "Microcosm",
        category: "Vie Artificielle",
        description:
          "Un écosystème proie–prédateur génératif où chaque créature porte un génome évolutif à observer en temps réel.",
        href: "/experiences/microcosm",
      },
      {
        id: "swarm-intel",
        title: "Swarm Intel",
        category: "Système Complexe",
        description:
          "Dirigez un essaim d’agents autonomes et observez les comportements émergents issus de règles simples.",
        href: "/experiences/drone-swarm",
      },
      {
        id: "procedural-forest",
        title: "Forêt Procédurale",
        category: "Art Génératif",
        description:
          "Une canopée algorithmique qui réagit à votre présence et à vos gestes numériques. En cours d’optimisation.",
      },
      {
        id: "visual-illusions",
        title: "Illusions Visuelles",
        category: "Perception",
        description:
          "Une série d’expériences perceptives qui brouillent les frontières entre l’œil et l’algorithme.",
      },
      {
        id: "living-fractals",
        title: "Fractales Vivantes",
        category: "Mathématiques",
        description:
          "Des structures mathématiques respirent, mutent et dialoguent avec votre curseur.",
      },
    ],
    aboutLabel: "02 · À propos",
    aboutTitle: "Un espace pour expérimenter.",
    aboutDescription:
      "Des expériences web de toutes sortes, réunies au même endroit. Certaines sont terminées, d’autres encore en construction.",
    principles: [
      {
        title: "À explorer",
        description: "Chaque expérience se lance directement dans le navigateur.",
      },
      {
        title: "En évolution",
        description:
          "Le cabinet grandit au fil des nouvelles idées et des nouveaux prototypes.",
      },
    ],
    processor: "Core_processor",
    processorState: "Stable",
    emergence: "Emergence_level",
    emergenceState: "High",
    dataLog:
      "Une collection d’expériences interactives, sans autre prétention que d’être explorée.",
    footerDescription: "Cabinet des curiosités numériques",
    transmission: "Transmission_stable",
  },
  en: {
    telemetry: ["Interactive experiences", "In the browser", "An evolving collection"],
    locale: "FR · EN",
    catalogueLabel: "01 · The cabinet",
    catalogueTitle: "Digital curiosities",
    catalogueNote: "Available now or currently in construction",
    available: "Available",
    incubation: "Incubation",
    experiences: [
      {
        id: "microcosm",
        title: "Microcosm",
        category: "Artificial Life",
        description:
          "A generative predator–prey ecosystem where every creature carries an evolving genome to observe in real time.",
        href: "/experiences/microcosm",
      },
      {
        id: "swarm-intel",
        title: "Swarm Intel",
        category: "Complex System",
        description:
          "Guide a swarm of autonomous agents and observe the behaviours that emerge from simple rules.",
        href: "/experiences/drone-swarm",
      },
      {
        id: "procedural-forest",
        title: "Procedural Forest",
        category: "Generative Art",
        description:
          "An algorithmic canopy that reacts to your presence and digital gestures. Currently being optimised.",
      },
      {
        id: "visual-illusions",
        title: "Visual Illusions",
        category: "Perception",
        description:
          "A series of perceptual experiences that blur the boundary between the eye and the algorithm.",
      },
      {
        id: "living-fractals",
        title: "Living Fractals",
        category: "Mathematics",
        description: "Mathematical structures breathe, mutate and respond to your cursor.",
      },
    ],
    aboutLabel: "02 · About",
    aboutTitle: "A place to experiment.",
    aboutDescription:
      "Web experiences of every kind, gathered in one place. Some are complete, while others are still under construction.",
    principles: [
      {
        title: "Ready to explore",
        description: "Every experience launches directly in the browser.",
      },
      {
        title: "Always evolving",
        description: "The cabinet grows with new ideas and new prototypes.",
      },
    ],
    processor: "Core_processor",
    processorState: "Stable",
    emergence: "Emergence_level",
    emergenceState: "High",
    dataLog:
      "A collection of interactive experiences, with no ambition beyond being explored.",
    footerDescription: "Digital cabinet of curiosities",
    transmission: "Transmission_stable",
  },
} as const

type Experience = {
  id: string
  title: string
  category: string
  description: string
  href?: string
}

function DossierRow({
  experience,
  index,
  availableLabel,
  incubationLabel,
}: {
  experience: Experience
  index: number
  availableLabel: string
  incubationLabel: string
}) {
  const available = "href" in experience && Boolean(experience.href)
  const rowContents = (
    <div className="grid gap-6 md:grid-cols-12 md:items-center md:gap-8">
      <div className="md:col-span-1">
        <span className="dossier-index font-mono text-sm text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="md:col-span-4">
        <h3 className="dossier-title font-display text-3xl text-foreground transition-[color,transform] duration-300 md:text-4xl">
          {experience.title}
        </h3>
        <span className="mt-2 block font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ion">
          {experience.category}
        </span>
      </div>

      <div className="md:col-span-5">
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          {experience.description}
        </p>
      </div>

      <div className="flex items-center justify-between gap-5 md:col-span-2 md:justify-end">
        <Badge
          variant={available ? "default" : "outline"}
          className="dossier-status"
          data-status={available ? "available" : "incubation"}
        >
          <Circle fill="currentColor" aria-hidden="true" />
          {available ? availableLabel : incubationLabel}
        </Badge>
        {available ? (
          <ArrowUpRight
            className="dossier-action size-5 text-muted-foreground transition-colors"
            aria-hidden="true"
          />
        ) : (
          <LockKeyhole className="size-4 text-border" aria-hidden="true" />
        )}
      </div>
    </div>
  )

  if (available && experience.href) {
    return (
      <Link
        href={experience.href}
        className="dossier-row dossier-row--available group relative block py-10 md:py-12"
      >
        {rowContents}
      </Link>
    )
  }

  return (
    <article className="dossier-row py-10 opacity-55 md:py-12">
      {rowContents}
    </article>
  )
}

export function ExperienceGallery() {
  const { lang } = useI18n()
  const copy = content[lang]
  const year = new Date().getFullYear()

  return (
    <>
      <section className="border-y border-border bg-abyss/75" aria-label="Repères du cabinet">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-8 px-6 py-6 font-mono text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground md:gap-16">
          {copy.telemetry.map((item) => (
            <span key={item}>{item}</span>
          ))}
          <span className="hidden lg:inline">{copy.locale}</span>
        </div>
      </section>

      <section id="catalogue" className="relative py-24 md:py-32" aria-labelledby="catalogue-title">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mb-16 flex items-end justify-between gap-10 md:mb-24">
            <div>
              <p className="mb-4 font-mono text-[0.68rem] uppercase tracking-[0.3em] text-primary">
                {copy.catalogueLabel}
              </p>
              <h2
                id="catalogue-title"
                className="font-display text-4xl font-light tracking-tight text-foreground md:text-5xl"
              >
                {copy.catalogueTitle}
              </h2>
            </div>
            <p className="hidden max-w-64 text-right font-mono text-[0.62rem] uppercase leading-relaxed tracking-[0.18em] text-muted-foreground md:block">
              {copy.catalogueNote}
            </p>
          </div>

          <div className="border-t border-border">
            {copy.experiences.map((experience, index) => (
              <DossierRow
                key={experience.id}
                experience={experience}
                index={index}
                availableLabel={copy.available}
                incubationLabel={copy.incubation}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="about"
        className="relative border-y border-border bg-abyss/75 py-24 md:py-32"
        aria-labelledby="about-title"
      >
        <div className="mx-auto grid w-full max-w-6xl items-center gap-16 px-6 md:grid-cols-2 md:gap-20">
          <div>
            <p className="mb-4 font-mono text-[0.68rem] uppercase tracking-[0.3em] text-ion">
              {copy.aboutLabel}
            </p>
            <h2
              id="about-title"
              className="mb-8 font-display text-4xl font-light leading-tight tracking-tight text-foreground"
            >
              {copy.aboutTitle}
            </h2>
            <p className="mb-12 max-w-xl leading-relaxed text-muted-foreground">
              {copy.aboutDescription}
            </p>

            <div className="grid gap-8">
              {copy.principles.map((principle) => (
                <div key={principle.title} className="flex flex-col gap-3">
                  <h3 className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-primary">
                    {principle.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {principle.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="about-console relative rounded-2xl p-8 md:p-12" aria-label="Journal du cabinet">
            <Microscope
              className="absolute right-6 top-6 size-9 text-ion opacity-20"
              aria-hidden="true"
            />

            <div className="flex flex-col gap-8 font-mono">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[0.62rem] uppercase text-muted-foreground">
                  <span>{copy.processor}</span>
                  <span>{copy.processorState}</span>
                </div>
                <Progress
                  value={85}
                  aria-label={`${copy.processor}: 85%`}
                  className="about-progress about-progress--ion"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[0.62rem] uppercase text-muted-foreground">
                  <span>{copy.emergence}</span>
                  <span>{copy.emergenceState}</span>
                </div>
                <Progress
                  value={92}
                  aria-label={`${copy.emergence}: 92%`}
                  className="about-progress about-progress--sun"
                />
              </div>

              <p className="border-t border-border pt-8 text-[0.68rem] leading-relaxed text-muted-foreground">
                <span className="text-ion">// DATA_LOG:</span> {copy.dataLog}
              </p>
            </div>
          </aside>
        </div>
      </section>

      <footer className="border-t border-border bg-background py-16 md:py-20">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-10 px-6 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <div className="flex items-center gap-3">
              <span className="font-display text-xl font-semibold text-primary">[42]</span>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-foreground">
                Sorok-Dva
              </span>
            </div>
            <p className="mt-2 text-center font-mono text-[0.68rem] uppercase tracking-[0.15em] text-muted-foreground md:text-left">
              {copy.footerDescription} © <span suppressHydrationWarning>{year}</span>
            </p>
          </div>

          <nav
            className="flex flex-wrap justify-center gap-8 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground md:gap-12"
            aria-label="Liens externes"
          >
            <Link className="footer-link" href="https://p-42.fr/github-sorokdva">
              GitHub
            </Link>
            <Link className="footer-link" href="#catalogue">
              Archive
            </Link>
            <Link className="footer-link" href="https://sorok-dva.eu">
              Portfolio
            </Link>
          </nav>

          <p className="flex items-center gap-2 font-mono text-[0.62rem] uppercase text-ion">
            <Circle className="size-2 animate-pulse" fill="currentColor" aria-hidden="true" />
            {copy.transmission}
          </p>
        </div>
      </footer>
    </>
  )
}
