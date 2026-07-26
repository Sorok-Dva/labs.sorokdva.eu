"use client"

import { AlignJustify, Focus, LayoutTemplate, Orbit } from "lucide-react"

import type { Formation } from "./types"

interface FormationRailProps {
  activeFormation: Formation
  onSetFormation: (formation: Formation) => void
  t: (key: string, fallback?: string) => string
}

const formations = [
  { key: "default", label: "Libre", shortcut: "↓", icon: LayoutTemplate },
  { key: "compact", label: "Compact", shortcut: "←", icon: Focus },
  { key: "line", label: "Ligne", shortcut: "↑", icon: AlignJustify },
  { key: "spiral", label: "Spirale", shortcut: "→", icon: Orbit },
] as const

export function FormationRail({ activeFormation, onSetFormation, t }: FormationRailProps) {
  return (
    <nav className="swarm-formation-rail" aria-label={t("swarm.controls.formations", "Formations")}>
      {formations.map(({ key, label, shortcut, icon: Icon }) => {
        const active = activeFormation === key
        const translatedLabel = t(`swarm.formations.${key}`, label)

        return (
          <button
            key={key}
            type="button"
            className="swarm-formation-key"
            data-active={active}
            aria-pressed={active}
            aria-label={`${translatedLabel} (${shortcut})`}
            title={`${translatedLabel} · ${shortcut}`}
            onClick={() => onSetFormation(key)}
          >
            <span>
              <Icon aria-hidden="true" />
            </span>
            <small>{translatedLabel}</small>
          </button>
        )
      })}
    </nav>
  )
}
