"use client"

import type { DroneSettings, DroneStats, Formation } from "./types"
import { DRONE_PRESETS, HELP_TEXTS } from "./constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { HelpCircle, Play, Pause, RotateCcw, Camera, Zap, Users, Target } from "lucide-react"
import { useState } from "react"

interface ControlPanelProps {
  settings: DroneSettings
  stats: DroneStats
  running: boolean
  onSettingsChange: (settings: Partial<DroneSettings>) => void
  onToggleRun: () => void
  onReset: () => void
  onSnapshot: () => void
  onSetFormation: (formation: Formation) => void
  onReleaseLeader: () => void
  onToggleRepulsion: () => void
}

interface SliderControlProps {
  label: string
  help?: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
}

function SliderControl({ label, help, min, max, step = 1, value, onChange }: SliderControlProps) {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm">{label}</Label>
          {help && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 hover:bg-slate-700"
                onMouseEnter={() => setShowHelp(true)}
                onMouseLeave={() => setShowHelp(false)}
              >
                <HelpCircle className="w-3 h-3" />
              </Button>
              {showHelp && (
                <div className="absolute left-0 top-6 z-50 w-64 p-2 bg-slate-800 border border-slate-600 rounded-md text-xs leading-relaxed">
                  {help}
                </div>
              )}
            </div>
          )}
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {typeof value === "number" ? Math.round(value * 100) / 100 : value}
        </span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} className="w-full" />
    </div>
  )
}

export function DroneControlPanel({
  settings,
  stats,
  running,
  onSettingsChange,
  onToggleRun,
  onReset,
  onSnapshot,
  onSetFormation,
  onReleaseLeader,
  onToggleRepulsion,
}: ControlPanelProps) {
  const [presetKey, setPresetKey] = useState<string>("swarm")

  const handlePresetChange = (key: string) => {
    const preset = DRONE_PRESETS[key]
    setPresetKey(key)
    const { label, hint, ...presetSettings } = preset
    onSettingsChange(presetSettings)
  }

  return (
    <Card className="w-full max-w-sm bg-slate-900/95 border-slate-700 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Contrôles Essaim</CardTitle>
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="secondary">
            <Target className="w-3 h-3 mr-1" />
            {stats.totalDrones} drones
          </Badge>
          <Badge variant={stats.hasLeader ? "default" : "outline"}>
            <Users className="w-3 h-3 mr-1" />
            {stats.hasLeader ? "Leader actif" : "Autonome"}
          </Badge>
          <Badge variant={stats.autopilotActive ? "destructive" : "outline"}>
            <Zap className="w-3 h-3 mr-1" />
            {stats.autopilotActive ? "Auto" : "Manuel"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Contrôles principaux */}
        <div className="flex gap-2">
          <Button onClick={onToggleRun} className="flex-1" variant={running ? "destructive" : "default"}>
            {running ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {running ? "Pause" : "Play"}
          </Button>
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={onSnapshot}>
            <Camera className="w-4 h-4" />
          </Button>
        </div>

        {/* Presets */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Presets</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(DRONE_PRESETS).map(([key, preset]) => (
              <Button
                key={key}
                variant={presetKey === key ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetChange(key)}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-slate-400">{DRONE_PRESETS[presetKey]?.hint}</p>
        </div>

        {/* Formations */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Formations</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={stats.currentFormation === "default" ? "default" : "outline"}
              size="sm"
              onClick={() => onSetFormation("default")}
              className="text-xs"
            >
              Libre
            </Button>
            <Button
              variant={stats.currentFormation === "compact" ? "default" : "outline"}
              size="sm"
              onClick={() => onSetFormation("compact")}
              className="text-xs"
            >
              Compact
            </Button>
            <Button
              variant={stats.currentFormation === "line" ? "default" : "outline"}
              size="sm"
              onClick={() => onSetFormation("line")}
              className="text-xs"
            >
              Ligne
            </Button>
            <Button
              variant={stats.currentFormation === "spiral" ? "default" : "outline"}
              size="sm"
              onClick={() => onSetFormation("spiral")}
              className="text-xs"
            >
              Spirale
            </Button>
          </div>
        </div>

        {/* Contrôles d'interaction */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Interaction</Label>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onReleaseLeader} className="flex-1 bg-transparent">
              Relâcher Leader
            </Button>
            <Button variant="outline" size="sm" onClick={onToggleRepulsion} className="flex-1 bg-transparent">
              Répulsion
            </Button>
          </div>
        </div>

        {/* Paramètres audio */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Audio</Label>
          <div className="flex items-center justify-between">
            <Label htmlFor="audio" className="text-sm">
              Son réactif
            </Label>
            <Switch
              id="audio"
              checked={settings.audioEnabled}
              onCheckedChange={(checked) => onSettingsChange({ audioEnabled: checked })}
            />
          </div>
        </div>

        {/* Paramètres de l'essaim */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">Comportement</Label>

          <SliderControl
            label="Nombre de drones"
            help={HELP_TEXTS.droneCount}
            min={10}
            max={300}
            step={5}
            value={settings.droneCount}
            onChange={(v) => onSettingsChange({ droneCount: Math.round(v) })}
          />

          <SliderControl
            label="Vitesse max"
            help={HELP_TEXTS.maxSpeed}
            min={50}
            max={300}
            step={10}
            value={settings.maxSpeed}
            onChange={(v) => onSettingsChange({ maxSpeed: Math.round(v) })}
          />

          <SliderControl
            label="Cohésion"
            help={HELP_TEXTS.cohesionWeight}
            min={0}
            max={2}
            step={0.05}
            value={settings.cohesionWeight}
            onChange={(v) => onSettingsChange({ cohesionWeight: v })}
          />

          <SliderControl
            label="Alignement"
            help={HELP_TEXTS.alignmentWeight}
            min={0}
            max={2}
            step={0.05}
            value={settings.alignmentWeight}
            onChange={(v) => onSettingsChange({ alignmentWeight: v })}
          />

          <SliderControl
            label="Séparation"
            help={HELP_TEXTS.separationWeight}
            min={0}
            max={3}
            step={0.1}
            value={settings.separationWeight}
            onChange={(v) => onSettingsChange({ separationWeight: v })}
          />

          <SliderControl
            label="Rayon d'influence"
            help={HELP_TEXTS.influenceRadius}
            min={40}
            max={320}
            step={10}
            value={settings.influenceRadius}
            onChange={(v) => onSettingsChange({ influenceRadius: Math.round(v) })}
          />

          <SliderControl
            label="Longueur traînées"
            help={HELP_TEXTS.trailLength}
            min={3}
            max={30}
            step={1}
            value={settings.trailLength}
            onChange={(v) => onSettingsChange({ trailLength: Math.round(v) })}
          />
        </div>
      </CardContent>
    </Card>
  )
}
