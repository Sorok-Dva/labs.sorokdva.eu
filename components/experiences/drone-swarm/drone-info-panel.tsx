"use client"

import { Gauge, Navigation, Palette, Target, X, Zap } from "lucide-react"

import type { Drone } from "./types"

interface DroneInfoPanelProps {
  drone: Drone | null
  onClose: () => void
  t: (key: string, fallback?: string) => string
}

function formatValue(value: number, decimals = 2) {
  return Number(value.toFixed(decimals))
}

export function DroneInfoPanel({ drone, onClose, t }: DroneInfoPanelProps) {
  if (!drone) return null

  const speed = Math.hypot(drone.vel.x, drone.vel.y)
  const direction = Math.atan2(drone.vel.y, drone.vel.x) * (180 / Math.PI)
  const state = t(`swarm.drone.states.${drone.state}`, drone.state)

  return (
    <aside className="swarm-drone-sheet" aria-label={`${t("swarm.drone.file", "Fiche drone")} ${drone.id}`}>
      <header className="swarm-drone-sheet__header">
        <div>
          <span>{t("swarm.drone.file", "Fiche drone")}</span>
          <h2>
            <i
              aria-hidden="true"
              style={{
                backgroundColor: drone.color,
                boxShadow: `0 0 12px ${drone.color}`,
              }}
            />
            Drone #{drone.id}
          </h2>
        </div>
        <button type="button" aria-label={t("swarm.drone.close", "Fermer la fiche drone")} onClick={onClose}>
          <X aria-hidden="true" />
        </button>
      </header>

      <div className="swarm-drone-sheet__status">
        <span data-state={drone.state}>{state}</span>
        <small>ID {drone.id.toString().padStart(3, "0")}</small>
      </div>

      <dl className="swarm-drone-metrics">
        <div>
          <dt>
            <Gauge aria-hidden="true" />
            {t("swarm.drone.speed", "Vitesse")}
          </dt>
          <dd>{formatValue(speed)}</dd>
        </div>
        <div>
          <dt>
            <Navigation aria-hidden="true" />
            {t("swarm.drone.direction", "Direction")}
          </dt>
          <dd>{formatValue(direction, 0)}°</dd>
        </div>
        <div>
          <dt>
            <Target aria-hidden="true" />
            Position X
          </dt>
          <dd>{formatValue(drone.pos.x, 0)}</dd>
        </div>
        <div>
          <dt>
            <Target aria-hidden="true" />
            Position Y
          </dt>
          <dd>{formatValue(drone.pos.y, 0)}</dd>
        </div>
      </dl>

      <section className="swarm-drone-section">
        <h3>
          <Zap aria-hidden="true" />
          {t("swarm.drone.velocity", "Vélocité")}
        </h3>
        <dl>
          <div>
            <dt>VX</dt>
            <dd>{formatValue(drone.vel.x)}</dd>
          </div>
          <div>
            <dt>VY</dt>
            <dd>{formatValue(drone.vel.y)}</dd>
          </div>
          <div>
            <dt>{t("swarm.drone.trail", "Traînée")}</dt>
            <dd>{drone.trail.length}</dd>
          </div>
          <div>
            <dt>{t("swarm.drone.angle", "Angle")}</dt>
            <dd>{formatValue(drone.angle * (180 / Math.PI), 0)}°</dd>
          </div>
        </dl>
      </section>

      <section className="swarm-drone-section">
        <h3>
          <Palette aria-hidden="true" />
          {t("swarm.drone.signal", "Signal visuel")}
        </h3>
        <div className="swarm-drone-color">
          <i style={{ backgroundColor: drone.color }} aria-hidden="true" />
          <span>{drone.color}</span>
        </div>
      </section>

      <p className="swarm-drone-note">
        {drone.state === "leader"
          ? t(
              "swarm.drone.notes.leader",
              "Ce drone est le leader actuel. Glissez pour guider et influencer l’essaim.",
            )
          : drone.state === "following"
            ? t("swarm.drone.notes.following", "Ce drone suit le leader et réagit à son influence.")
            : t("swarm.drone.notes.free", "Ce drone évolue librement selon les règles de l’essaim.")}
      </p>
    </aside>
  )
}
