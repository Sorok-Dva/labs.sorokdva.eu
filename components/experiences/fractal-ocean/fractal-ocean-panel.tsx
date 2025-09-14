"use client"

import type { Drone } from "./types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Zap, Navigation, Target, Palette } from "lucide-react"

interface DroneInfoPanelProps {
  drone: Drone | null
  onClose: () => void
}

export function FractalOceanPanel({ drone, onClose }: DroneInfoPanelProps) {
  if (!drone) return null

  const formatValue = (value: number, decimals = 2) => {
    return Number(value.toFixed(decimals))
  }

  const speed = Math.hypot(drone.vel.x, drone.vel.y)
  const direction = Math.atan2(drone.vel.y, drone.vel.x) * (180 / Math.PI)

  return (
    <Card className="absolute top-4 right-4 w-80 bg-slate-900/95 border-slate-700 backdrop-blur-sm z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border-2"
              style={{
                backgroundColor: drone.color,
                borderColor: drone.color,
                boxShadow: `0 0 8px ${drone.color}`,
              }}
            />
            Drone #{drone.id}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Badge variant={drone.state === "leader" ? "default" : drone.state === "following" ? "secondary" : "outline"}>
            {drone.state === "leader" ? "Leader" : drone.state === "following" ? "Suiveur" : "Libre"}
          </Badge>
          <Badge variant="outline">ID {drone.id}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats de mouvement */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Vitesse
            </div>
            <div className="text-sm font-mono">{formatValue(speed)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              Direction
            </div>
            <div className="text-sm font-mono">{formatValue(direction, 0)}°</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Target className="w-3 h-3" />
              Position X
            </div>
            <div className="text-sm font-mono">{formatValue(drone.pos.x, 0)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Target className="w-3 h-3" />
              Position Y
            </div>
            <div className="text-sm font-mono">{formatValue(drone.pos.y, 0)}</div>
          </div>
        </div>

        {/* Propriétés visuelles */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-1">
            <Palette className="w-4 h-4" />
            Propriétés visuelles
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Teinte de base:</span>
              <span className="font-mono">{Math.round(drone.baseHue)}°</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Angle:</span>
              <span className="font-mono">{formatValue(drone.angle * (180 / Math.PI), 0)}°</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Traînée:</span>
              <span className="font-mono">{drone.trail.length} points</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">État:</span>
              <span className="font-mono capitalize">{drone.state}</span>
            </div>
          </div>
        </div>

        {/* Vélocité détaillée */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-200">Vélocité</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Vx:</span>
              <span className="font-mono">{formatValue(drone.vel.x)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Vy:</span>
              <span className="font-mono">{formatValue(drone.vel.y)}</span>
            </div>
          </div>
        </div>

        {/* Couleur actuelle */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-200">Couleur actuelle</h4>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded border-2 border-slate-600" style={{ backgroundColor: drone.color }} />
            <div className="text-xs font-mono text-slate-300">{drone.color}</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="pt-2 border-t border-slate-700">
          <div className="text-xs text-slate-400 leading-relaxed">
            {drone.state === "leader"
              ? "Ce drone est le leader actuel. Glissez pour le guider et influencer l'essaim."
              : drone.state === "following"
                ? "Ce drone suit le leader et réagit à son influence."
                : "Ce drone évolue librement selon les règles de l'essaim."}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
