"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface MicrocosmHeaderProps {
  stats: {
    herbs: number
    preds: number
    food: number
  }
  t: (key: string, fallback?: string) => string
}

export function MicrocosmHeader({ stats, t }: MicrocosmHeaderProps) {
  const telemetry = [
    {
      label: t("microcosm.stats.herbivores", "Herbivores"),
      value: stats.herbs,
      tone: "ion",
    },
    {
      label: t("microcosm.stats.predators", "Prédateurs"),
      value: stats.preds,
      tone: "ember",
    },
    {
      label: t("microcosm.stats.food", "Nourriture"),
      value: stats.food,
      tone: "sun",
    },
  ]

  return (
    <header className="microcosm-header">
      <div className="microcosm-header__identity">
        <Link href="/" className="microcosm-signature" aria-label={t("microcosm.header.back", "Retour au cabinet")}>
          [42]
        </Link>

        <Link href="/" className="microcosm-back-link" aria-label={t("microcosm.shell.back", "Retour au cabinet")}>
          <ArrowLeft aria-hidden="true" />
          <span>{t("microcosm.shell.back", "Retour au cabinet")}</span>
        </Link>

        <span className="microcosm-header__divider" aria-hidden="true" />

        <div className="microcosm-header__title">
          <span>{t("microcosm.shell.index", "EXP. 01 / 05")}</span>
          <h1>Microcosm</h1>
        </div>
      </div>

      <dl className="microcosm-telemetry" aria-label={t("microcosm.shell.telemetry", "Population en direct")}>
        {telemetry.map((item) => (
          <div key={item.label} className="microcosm-telemetry__item">
            <dt>{item.label}</dt>
            <dd data-tone={item.tone}>{item.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  )
}
