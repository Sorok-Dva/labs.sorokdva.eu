"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const experiences = [
  {
    id: "microcosm",
    title: "Microcosm",
    description:
      "Un écosystème proie–prédateur génératif où chaque créature porte un génome évolutif à observer en temps réel.",
    category: "Vie Artificielle",
    status: "Disponible",
    href: "/experiences/microcosm",
    tone: "from-emerald-400/70 via-emerald-500/40 to-purple-500/40",
  },
  {
    id: "generative-forest",
    title: "Forêt Procédurale",
    description: "Une canopée algorithmique qui réagit à votre présence et à vos gestes numériques.",
    category: "Art Génératif",
    status: "À venir",
    tone: "from-purple-500/40 via-indigo-500/30 to-sky-400/30",
  },
  {
    id: "visual-illusions",
    title: "Illusions Visuelles",
    description: "Une série d'expériences perceptives qui brouillent les frontières entre l'œil et l'algorithme.",
    category: "Perception",
    status: "À venir",
    tone: "from-pink-500/40 via-purple-500/30 to-indigo-500/30",
  },
  {
    id: "swarm-intelligence",
    title: "Intelligence d'Essaim",
    description: "Dirigez un essaim d'agents autonomes et observez les comportements émergents",
    category: "Système Complexe",
    status: "Disponible",
    href: "/experiences/drone-swarm",
    tone: "from-sky-400/60 via-purple-500/40 to-emerald-400/40",
  },
  {
    id: "living-fractals",
    title: "Fractales Vivantes",
    description: "Des structures mathématiques respirent, mutent et dialoguent avec votre curseur.",
    category: "Mathématiques",
    status: "À venir",
    tone: "from-indigo-500/40 via-fuchsia-500/30 to-purple-500/30",
  },
  {
    id: "sound-visualization",
    title: "Visualisation Sonore",
    description: "Transformez la musique en paysages visuels qui répondent à vos fréquences.",
    category: "Audio-Visuel",
    status: "À venir",
    tone: "from-emerald-400/40 via-sky-400/30 to-purple-500/30",
  },
]

export function ExperienceGallery() {
  const year = new Date().getFullYear()

  return (
    <section id="gallery" className="relative py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(129,140,248,0.12),transparent_65%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-16 flex flex-col gap-6 rounded-[32px] border border-white/10 bg-white/[0.03] p-10 text-center shadow-xl shadow-purple-500/10 backdrop-blur">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-purple-100">
            Collection vivante
          </span>
          <h2 className="text-3xl font-semibold text-slate-50 sm:text-4xl md:text-5xl">
            Expériences interactives en évolution continue
          </h2>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-200/85">
            Chaque module capture une palette cosmique et une matière verrée pour explorer des interactions toujours plus
            audacieuses. Les expériences disponibles sont jouables immédiatement; les autres restent en incubation dans
            l&apos;atelier.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {experiences.map((experience) => {
            const CardWrapper =
              experience.status === "Disponible" && experience.href
                ? ({ children }: { children: React.ReactNode }) => (
                    <Link
                      href={experience.href}
                      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60"
                    >
                      {children}
                    </Link>
                  )
                : ({ children }: { children: React.ReactNode }) => <div>{children}</div>

            const statusStyles =
              experience.status === "Disponible"
                ? "text-emerald-200 bg-emerald-500/15 border border-emerald-400/25"
                : "text-slate-200 bg-slate-500/10 border border-slate-500/25"

            return (
              <CardWrapper key={experience.id}>
                <Card
                  className={`group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-lg shadow-slate-900/40 transition duration-300 hover:border-purple-400/40 hover:shadow-purple-500/20 ${
                    experience.status === "Disponible" ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <div
                    className={`pointer-events-none absolute inset-px rounded-[26px] bg-gradient-to-br ${experience.tone} opacity-0 transition duration-500 group-hover:opacity-100`}
                  />
                  <CardHeader className="relative z-10">
                    <div className="mb-4 flex items-center justify-between">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${statusStyles}`}
                      >
                        {experience.category}
                      </span>
                      <span className="text-xs font-medium text-slate-200/80">{experience.status}</span>
                    </div>
                    <CardTitle className="text-2xl font-semibold text-slate-50 transition-colors duration-300 group-hover:text-white">
                      {experience.title}
                    </CardTitle>
                    <CardDescription className="mt-3 text-base leading-relaxed text-slate-200/80">
                      {experience.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10 mt-6 flex items-center justify-between border-t border-white/10 pt-6 text-sm text-slate-200/80">
                    <span>
                      {experience.status === "À venir"
                        ? "Prototype en production : restez informé via les journaux du lab."
                        : "Disponible dès maintenant dans le laboratoire."}
                    </span>
                    <span
                      className={`text-sm font-semibold transition duration-300 ${
                        experience.status === "Disponible" ? "text-emerald-200 group-hover:text-white" : "text-slate-400"
                      }`}
                    >
                      {experience.status === "Disponible" ? "Lancer →" : "Soon"}
                    </span>
                  </CardContent>
                </Card>
              </CardWrapper>
            )
          })}
        </div>

        <footer className="mt-20 flex flex-col items-center gap-3 text-center text-sm text-slate-400/80">
          <div className="h-px w-full max-w-3xl bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <p className="tracking-wide uppercase text-[11px] text-slate-400/70">Made with love by Sorokdva</p>
          <p>© {year} Sorokdva. Tous droits réservés.</p>
        </footer>
      </div>
    </section>
  )
}
