"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const experiences = [
  {
    id: "microcosm",
    title: "Microcosm",
    description:
      "Un écosystème émergent proie–prédateur où chaque créature possède un génome évolutif. Observez la sélection naturelle en temps réel.",
    category: "Vie Artificielle",
    status: "Disponible",
    href: "/experiences/microcosm",
  },
  {
    id: "generative-forest",
    title: "Forêt Procédurale",
    description: "Une forêt qui grandit et évolue selon vos interactions",
    category: "Art Génératif",
    status: "À venir",
  },
  {
    id: "visual-illusions",
    title: "Illusions Visuelles",
    description: "Explorez les limites de la perception avec des illusions interactives",
    category: "Perception",
    status: "À venir",
  },
  {
    id: "swarm-intelligence",
    title: "Intelligence d'Essaim",
    description: "Dirigez des essaims d'agents autonomes aux comportements émergents",
    category: "Système Complexe",
    status: "À venir",
  },
  {
    id: "living-fractals",
    title: "Fractales Vivantes",
    description: "Des structures mathématiques qui respirent et évoluent",
    category: "Mathématiques",
    status: "À venir",
  },
  {
    id: "sound-visualization",
    title: "Visualisation Sonore",
    description: "Transformez les sons en paysages visuels dynamiques",
    category: "Audio-Visuel",
    status: "À venir",
  },
]

export function ExperienceGallery() {
  return (
    <section id="gallery" className="py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Expériences Disponibles</h2>
          <p className="text-xl text-slate-300 text-pretty max-w-3xl mx-auto">
            Chaque expérience est une exploration unique des possibilités créatives offertes par la programmation et
            l'art numérique
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experiences.map((experience) => {
            const CardWrapper =
              experience.status === "Disponible" && experience.href
                ? ({ children }: { children: React.ReactNode }) => (
                    <Link href={experience.href} className="block">
                      {children}
                    </Link>
                  )
                : ({ children }: { children: React.ReactNode }) => <div>{children}</div>

            return (
              <CardWrapper key={experience.id}>
                <Card
                  className={`group transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/10 border-border/50 hover:border-primary/50 ${
                    experience.status === "Disponible" ? "cursor-pointer" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          experience.status === "Disponible"
                            ? "text-emerald-100 bg-emerald-500/20 border border-emerald-500/30"
                            : "text-slate-200 bg-slate-600/30 border border-slate-500/30"
                        }`}
                      >
                        {experience.category}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          experience.status === "Disponible" ? "text-emerald-300" : "text-slate-300"
                        }`}
                      >
                        {experience.status}
                      </span>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                      {experience.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed text-slate-300">
                      {experience.description}
                    </CardDescription>
                    <div className="mt-4 pt-4 border-t border-border/30">
                      <span
                        className={`text-sm transition-colors duration-300 font-medium ${
                          experience.status === "Disponible"
                            ? "text-primary hover:text-primary/80"
                            : "text-slate-300 cursor-not-allowed"
                        }`}
                      >
                        {experience.status === "À venir" ? "Bientôt disponible" : "Lancer l'expérience →"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </CardWrapper>
            )
          })}
        </div>

        <div className="text-center mt-16">
          <p className="text-slate-300 text-pretty">
            Nouvelles expériences ajoutées régulièrement.
            <br />
            Chaque création explore les frontières entre art, science et technologie.
          </p>
        </div>
      </div>
    </section>
  )
}
