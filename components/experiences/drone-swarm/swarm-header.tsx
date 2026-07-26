"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import type { DroneStats } from "./types"

interface SwarmHeaderProps {
  stats: DroneStats
  t: (key: string, fallback?: string) => string
}

export function SwarmHeader({ stats, t }: SwarmHeaderProps) {
  const status = stats.autopilotActive
    ? t("swarm.shell.autopilotStatus", "AUTO_PILOT")
    : stats.hasLeader
      ? t("swarm.shell.leaderLink", "LEADER_LINK")
      : t("swarm.shell.radarNominal", "RADAR_NOMINAL")

  return (
    <header className="swarm-header">
      <div className="swarm-header__identity">
        <span className="swarm-signature">[42]</span>
        <span className="swarm-header__divider" aria-hidden="true" />
        <Link href="/" className="swarm-back-link">
          <ArrowLeft aria-hidden="true" />
          <span>{t("swarm.shell.back", "Retour au cabinet")}</span>
        </Link>
        <span className="swarm-header__divider" aria-hidden="true" />
        <div className="swarm-header__title">
          <span>{t("swarm.shell.index", "EXP. 02 / 05")}</span>
          <h1>Swarm Intel</h1>
        </div>
      </div>

      <dl className="swarm-telemetry" aria-label={t("swarm.shell.telemetry", "Télémétrie de l’essaim")}>
        <div>
          <dt>{t("swarm.stats.drones", "Drones")}</dt>
          <dd>{stats.totalDrones}</dd>
        </div>
        <div>
          <dt>{t("swarm.stats.followers", "Suiveurs")}</dt>
          <dd data-tone="ion">{stats.followingDrones}</dd>
        </div>
        <div className="swarm-telemetry__status">
          <dt>{t("swarm.stats.status", "Statut")}</dt>
          <dd data-tone="sun">{status}</dd>
        </div>
      </dl>
    </header>
  )
}
