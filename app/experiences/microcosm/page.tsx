import Microcosm from "@/components/experiences/microcosm/microcosm"
import { BackToHome } from "@/components/experiences/microcosm/back-to-home"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Microcosm - Vie Artificielle | SorokDva Labs",
  description:
    "Un écosystème émergent proie–prédateur où chaque créature possède un génome évolutif. Observez la sélection naturelle en temps réel.",
}

export default function MicrocosmPage() {
  return (
    <div className="relative">
      <BackToHome />
      <Microcosm />
    </div>
  )
}
