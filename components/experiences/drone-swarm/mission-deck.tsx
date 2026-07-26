"use client"

import {
  BookOpen,
  Camera,
  Pause,
  Play,
  RadioTower,
  RotateCcw,
  Settings2,
  Unlink,
  Waves,
} from "lucide-react"

interface MissionDeckProps {
  running: boolean
  hasLeader: boolean
  repulsionActive: boolean
  presentationOpen: boolean
  settingsOpen: boolean
  onToggleRun: () => void
  onReset: () => void
  onSnapshot: () => void
  onReleaseLeader: () => void
  onToggleRepulsion: () => void
  onTogglePresentation: () => void
  onToggleSettings: () => void
  t: (key: string, fallback?: string) => string
}

export function MissionDeck({
  running,
  hasLeader,
  repulsionActive,
  presentationOpen,
  settingsOpen,
  onToggleRun,
  onReset,
  onSnapshot,
  onReleaseLeader,
  onToggleRepulsion,
  onTogglePresentation,
  onToggleSettings,
  t,
}: MissionDeckProps) {
  return (
    <footer className="swarm-mission-deck">
      <div className="swarm-mission-deck__playback">
        <button type="button" className="swarm-mission-button swarm-mission-button--play" onClick={onToggleRun}>
          {running ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          <span>{running ? t("swarm.controls.pause", "Pause") : t("swarm.controls.play", "Play")}</span>
        </button>
        <button
          type="button"
          className="swarm-mission-button swarm-mission-button--icon"
          aria-label={t("swarm.controls.reset", "Réinitialiser")}
          title={t("swarm.controls.reset", "Réinitialiser")}
          onClick={onReset}
        >
          <RotateCcw aria-hidden="true" />
        </button>
        <button
          type="button"
          className="swarm-mission-button swarm-mission-button--icon"
          aria-label={t("swarm.controls.snapshot", "Capture")}
          title={t("swarm.controls.snapshot", "Capture")}
          onClick={onSnapshot}
        >
          <Camera aria-hidden="true" />
        </button>
      </div>

      <div className="swarm-mission-deck__state">
        <span className="swarm-mission-state__label">{t("swarm.shell.missionState", "État de mission")}</span>
        <span className="swarm-mission-state" data-active={hasLeader}>
          <i aria-hidden="true" />
          <RadioTower aria-hidden="true" />
          {hasLeader
            ? t("swarm.shell.leaderActive", "Leader actif")
            : t("swarm.shell.autonomous", "Autonome")}
        </span>
        <button
          type="button"
          className="swarm-mission-link"
          onClick={onReleaseLeader}
          disabled={!hasLeader}
        >
          <Unlink aria-hidden="true" />
          <span>{t("swarm.controls.releaseLeader", "Relâcher leader")}</span>
        </button>
        <button
          type="button"
          className="swarm-mission-link swarm-mission-link--repulsion"
          data-active={repulsionActive}
          aria-pressed={repulsionActive}
          onClick={onToggleRepulsion}
        >
          <Waves aria-hidden="true" />
          <span>{t("swarm.controls.repulsion", "Répulsion")}</span>
        </button>
      </div>

      <div className="swarm-mission-deck__tools">
        <button
          type="button"
          className="swarm-mission-tool"
          data-tone="sun"
          data-open={presentationOpen}
          aria-expanded={presentationOpen}
          aria-controls="swarm-presentation"
          aria-label={t("swarm.shell.presentation", "Présentation")}
          onClick={onTogglePresentation}
        >
          <BookOpen aria-hidden="true" />
          <span>{t("swarm.shell.presentation", "Présentation")}</span>
        </button>
        <button
          type="button"
          className="swarm-mission-tool"
          data-tone="ion"
          data-open={settingsOpen}
          aria-expanded={settingsOpen}
          aria-controls="swarm-settings"
          aria-label={t("swarm.shell.settings", "Réglages")}
          onClick={onToggleSettings}
        >
          <Settings2 aria-hidden="true" />
          <span>{t("swarm.shell.settings", "Réglages")}</span>
        </button>
      </div>
    </footer>
  )
}
