"use client"

import {
  BookOpen,
  Camera,
  Droplets,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  Skull,
  Zap,
} from "lucide-react"

interface ControlDeckProps {
  running: boolean
  fps: number
  presentationOpen: boolean
  settingsOpen: boolean
  onToggleRun: () => void
  onReset: () => void
  onSnapshot: () => void
  onSpawnFood: () => void
  onSpawnToxin: () => void
  onSpawnPredator: () => void
  onTogglePresentation: () => void
  onToggleSettings: () => void
  t: (key: string, fallback?: string) => string
}

interface InterventionButtonProps {
  label: string
  shortcut: string
  tone: "ion" | "ember" | "sun"
  icon: React.ReactNode
  onClick: () => void
}

function InterventionButton({
  label,
  shortcut,
  tone,
  icon,
  onClick,
}: InterventionButtonProps) {
  return (
    <div className="microcosm-intervention">
      <button type="button" className="microcosm-deck-button" data-tone={tone} onClick={onClick}>
        {icon}
        <span>{label}</span>
      </button>
      <span className="microcosm-shortcut">{shortcut}</span>
    </div>
  )
}

export function ControlDeck({
  running,
  fps,
  presentationOpen,
  settingsOpen,
  onToggleRun,
  onReset,
  onSnapshot,
  onSpawnFood,
  onSpawnToxin,
  onSpawnPredator,
  onTogglePresentation,
  onToggleSettings,
  t,
}: ControlDeckProps) {
  return (
    <footer className="microcosm-deck">
      <div className="microcosm-deck__primary">
        <button
          type="button"
          className="microcosm-deck-button microcosm-deck-button--primary"
          onClick={onToggleRun}
          aria-pressed={!running}
        >
          {running ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          <span>
            {running
              ? t("microcosm.controls.buttons.pause", "Pause")
              : t("microcosm.controls.buttons.play", "Play")}
          </span>
        </button>

        <button
          type="button"
          className="microcosm-deck-button microcosm-deck-button--icon"
          onClick={onReset}
          aria-label={t("microcosm.controls.buttons.reset", "Réinitialiser")}
          title={t("microcosm.controls.buttons.reset", "Réinitialiser")}
        >
          <RotateCcw aria-hidden="true" />
        </button>

        <button
          type="button"
          className="microcosm-deck-button microcosm-deck-button--icon"
          onClick={onSnapshot}
          aria-label={t("microcosm.controls.buttons.snapshot", "Capture")}
          title={t("microcosm.controls.buttons.snapshot", "Capture")}
        >
          <Camera aria-hidden="true" />
        </button>

        <span className="microcosm-deck__divider" aria-hidden="true" />

        <div className="microcosm-deck__interventions">
          <InterventionButton
            label={t("microcosm.actions.feed", "Nourrir")}
            shortcut="F / CTRL + CLIC"
            tone="ion"
            icon={<Droplets aria-hidden="true" />}
            onClick={onSpawnFood}
          />
          <InterventionButton
            label={t("microcosm.actions.toxin", "Toxine")}
            shortcut="T / SHIFT + CLIC"
            tone="ember"
            icon={<Skull aria-hidden="true" />}
            onClick={onSpawnToxin}
          />
          <InterventionButton
            label={t("microcosm.actions.predator", "Prédateur")}
            shortcut="P / ALT + CLIC"
            tone="sun"
            icon={<Zap aria-hidden="true" />}
            onClick={onSpawnPredator}
          />
        </div>
      </div>

      <div className="microcosm-deck__status">
        <div className="microcosm-transmission" aria-live="polite">
          <span>
            <i aria-hidden="true" />
            {t("microcosm.shell.stable", "Transmission stable")}
          </span>
          <small>FPS {fps} // MICROCOSM</small>
        </div>

        <span className="microcosm-deck__divider" aria-hidden="true" />

        <button
          type="button"
          className="microcosm-deck-button microcosm-deck-button--presentation"
          data-open={presentationOpen}
          aria-expanded={presentationOpen}
          aria-controls="microcosm-presentation"
          aria-label={t("microcosm.shell.presentation", "Présentation")}
          onClick={onTogglePresentation}
        >
          <BookOpen aria-hidden="true" />
          <span>{t("microcosm.shell.presentation", "Présentation")}</span>
        </button>

        <button
          type="button"
          className="microcosm-deck-button microcosm-deck-button--settings"
          data-open={settingsOpen}
          aria-expanded={settingsOpen}
          aria-controls="microcosm-settings"
          aria-label={t("microcosm.shell.settings", "Réglages")}
          onClick={onToggleSettings}
        >
          <Settings2 aria-hidden="true" />
          <span>{t("microcosm.shell.settings", "Réglages")}</span>
        </button>
      </div>
    </footer>
  )
}
