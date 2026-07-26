"use client"

import { MousePointer2, Move, Orbit } from "lucide-react"

import { ExperiencePresentation } from "@/components/experiences/experience-presentation"

interface SwarmPresentationProps {
  onClose: () => void
  t: (key: string, fallback?: string) => string
}

export function SwarmPresentation({ onClose, t }: SwarmPresentationProps) {
  return (
    <ExperiencePresentation
      id="swarm-presentation"
      index="EXP. 02 / 05"
      eyebrow={t("swarm.presentation.eyebrow", "Présentation de l’expérience")}
      title={t("swarm.presentation.title", "Swarm Intel — Intelligence collective")}
      body={t(
        "swarm.presentation.body",
        "Un essaim de drones lumineux dont les trajectoires naissent de quelques règles simples. Choisissez un leader, guidez-le et observez le groupe s’organiser.",
      )}
      steps={[
        {
          index: "01",
          icon: MousePointer2,
          title: t("swarm.presentation.choose.title", "Choisir"),
          body: t("swarm.presentation.choose.body", "Cliquez sur un drone pour en faire le leader."),
        },
        {
          index: "02",
          icon: Move,
          title: t("swarm.presentation.guide.title", "Guider"),
          body: t(
            "swarm.presentation.guide.body",
            "Déplacez le leader et ajustez son rayon d’influence.",
          ),
        },
        {
          index: "03",
          icon: Orbit,
          title: t("swarm.presentation.compose.title", "Composer"),
          body: t(
            "swarm.presentation.compose.body",
            "Alternez formations, cohésion et répulsion.",
          ),
        },
      ]}
      hint={t("swarm.presentation.hint", "L’essaim continue d’évoluer derrière cette fiche.")}
      resumeLabel={t("swarm.presentation.resume", "Reprendre l’expérience")}
      closeLabel={t("swarm.presentation.close", "Fermer la présentation")}
      onClose={onClose}
    />
  )
}
