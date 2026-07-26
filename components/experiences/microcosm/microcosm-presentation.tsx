"use client"

import { Eye, MousePointer2, Sparkles } from "lucide-react"

import { ExperiencePresentation } from "@/components/experiences/experience-presentation"

interface MicrocosmPresentationProps {
  onClose: () => void
  t: (key: string, fallback?: string) => string
}

export function MicrocosmPresentation({ onClose, t }: MicrocosmPresentationProps) {
  return (
    <ExperiencePresentation
      id="microcosm-presentation"
      index="EXP. 01 / 05"
      eyebrow={t("microcosm.shell.presentationEyebrow", "Présentation de l’expérience")}
      title={t("microcosm.shell.presentationTitle", "Microcosm — Vie artificielle")}
      body={t(
        "microcosm.shell.presentationBody",
        "Un écosystème proie–prédateur où chaque créature possède un petit génome. Observez les populations évoluer, puis intervenez directement sur leur environnement.",
      )}
      steps={[
        {
          index: "01",
          icon: Eye,
          title: t("microcosm.shell.presentationSteps.explore.title", "Explorer"),
          body: t(
            "microcosm.shell.presentationSteps.explore.body",
            "Zoomez et parcourez librement l’écosystème.",
          ),
        },
        {
          index: "02",
          icon: MousePointer2,
          title: t("microcosm.shell.presentationSteps.intervene.title", "Intervenir"),
          body: t(
            "microcosm.shell.presentationSteps.intervene.body",
            "Ajoutez nourriture, toxines ou prédateurs.",
          ),
        },
        {
          index: "03",
          icon: Sparkles,
          title: t("microcosm.shell.presentationSteps.observe.title", "Observer"),
          body: t(
            "microcosm.shell.presentationSteps.observe.body",
            "Sélectionnez une cellule et suivez sa lignée.",
          ),
        },
      ]}
      hint={t("microcosm.shell.presentationHint", "La simulation continue derrière cette fiche.")}
      resumeLabel={t("microcosm.shell.resumeExperience", "Reprendre l’expérience")}
      closeLabel={t("microcosm.shell.closePresentation", "Fermer la présentation")}
      onClose={onClose}
    />
  )
}
