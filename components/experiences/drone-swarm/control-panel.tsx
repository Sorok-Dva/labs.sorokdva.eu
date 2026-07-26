"use client"

import { useState } from "react"
import { ChevronDown, Volume2, X } from "lucide-react"

import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

import { DRONE_PRESETS, HELP_TEXTS } from "./constants"
import type { DroneSettings } from "./types"

interface ControlPanelProps {
  settings: DroneSettings
  onSettingsChange: (settings: Partial<DroneSettings>) => void
  onClose: () => void
  t: (key: string, fallback?: string) => string
}

interface SliderControlProps {
  id: string
  label: string
  help: string
  min: number
  max: number
  step?: number
  value: number
  tone?: "ion" | "sun"
  onChange: (value: number) => void
}

function SliderControl({
  id,
  label,
  help,
  min,
  max,
  step = 1,
  value,
  tone = "ion",
  onChange,
}: SliderControlProps) {
  return (
    <div className="swarm-setting">
      <div className="swarm-setting__label">
        <label htmlFor={id} title={help}>
          {label}
        </label>
        <output htmlFor={id}>{Math.round(value * 100) / 100}</output>
      </div>
      <Slider
        id={id}
        value={[value]}
        onValueChange={([nextValue]) => onChange(nextValue)}
        min={min}
        max={max}
        step={step}
        className="swarm-setting__slider"
        data-tone={tone}
        aria-label={label}
      />
    </div>
  )
}

export function DroneControlPanel({
  settings,
  onSettingsChange,
  onClose,
  t,
}: ControlPanelProps) {
  const [presetKey, setPresetKey] = useState<string>("swarm")

  const handlePresetChange = (key: string) => {
    const preset = DRONE_PRESETS[key]
    setPresetKey(key)
    const { label: _label, hint: _hint, ...presetSettings } = preset
    onSettingsChange(presetSettings)
  }

  return (
    <aside id="swarm-settings" className="swarm-settings" aria-label={t("swarm.shell.settings", "Réglages")}>
      <header className="swarm-settings__header">
        <div>
          <span>{t("swarm.shell.settingsIndex", "SYS. 02")}</span>
          <h2>{t("swarm.shell.settings", "Réglages")}</h2>
        </div>
        <button
          type="button"
          aria-label={t("swarm.shell.closeSettings", "Fermer les réglages")}
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </button>
      </header>

      <div className="swarm-settings__scroll">
        <details className="swarm-settings-group" open>
          <summary>
            <span>{t("swarm.controls.presets", "Presets")}</span>
            <ChevronDown aria-hidden="true" />
          </summary>
          <div className="swarm-settings-group__content">
            <div className="swarm-presets">
              {Object.entries(DRONE_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  data-active={presetKey === key}
                  onClick={() => handlePresetChange(key)}
                >
                  {t(`swarm.presets.${key}.label`, preset.label)}
                </button>
              ))}
            </div>
            <p className="swarm-preset-hint">
              {t(`swarm.presets.${presetKey}.hint`, DRONE_PRESETS[presetKey]?.hint)}
            </p>
          </div>
        </details>

        <details className="swarm-settings-group" open>
          <summary>
            <span>{t("swarm.controls.physics", "Physique")}</span>
            <ChevronDown aria-hidden="true" />
          </summary>
          <div className="swarm-settings-group__content swarm-settings-list">
            <SliderControl
              id="swarm-drone-count"
              label={t("swarm.settings.droneCount", "Drones")}
              help={t("swarm.help.droneCount", HELP_TEXTS.droneCount)}
              min={10}
              max={300}
              step={5}
              value={settings.droneCount}
              onChange={(value) => onSettingsChange({ droneCount: Math.round(value) })}
            />
            <SliderControl
              id="swarm-max-speed"
              label={t("swarm.settings.maxSpeed", "Vitesse")}
              help={t("swarm.help.maxSpeed", HELP_TEXTS.maxSpeed)}
              min={50}
              max={300}
              step={10}
              value={settings.maxSpeed}
              onChange={(value) => onSettingsChange({ maxSpeed: Math.round(value) })}
            />
          </div>
        </details>

        <details className="swarm-settings-group" open>
          <summary>
            <span>{t("swarm.controls.collectiveRules", "Règles collectives")}</span>
            <ChevronDown aria-hidden="true" />
          </summary>
          <div className="swarm-settings-group__content swarm-settings-list">
            <SliderControl
              id="swarm-cohesion"
              label={t("swarm.settings.cohesion", "Cohésion")}
              help={t("swarm.help.cohesion", HELP_TEXTS.cohesionWeight)}
              min={0}
              max={2}
              step={0.05}
              value={settings.cohesionWeight}
              tone="sun"
              onChange={(value) => onSettingsChange({ cohesionWeight: value })}
            />
            <SliderControl
              id="swarm-alignment"
              label={t("swarm.settings.alignment", "Alignement")}
              help={t("swarm.help.alignment", HELP_TEXTS.alignmentWeight)}
              min={0}
              max={2}
              step={0.05}
              value={settings.alignmentWeight}
              tone="sun"
              onChange={(value) => onSettingsChange({ alignmentWeight: value })}
            />
            <SliderControl
              id="swarm-separation"
              label={t("swarm.settings.separation", "Séparation")}
              help={t("swarm.help.separation", HELP_TEXTS.separationWeight)}
              min={0}
              max={3}
              step={0.1}
              value={settings.separationWeight}
              tone="sun"
              onChange={(value) => onSettingsChange({ separationWeight: value })}
            />
          </div>
        </details>

        <details className="swarm-settings-group" open>
          <summary>
            <span>{t("swarm.controls.signal", "Signal")}</span>
            <ChevronDown aria-hidden="true" />
          </summary>
          <div className="swarm-settings-group__content swarm-settings-list">
            <SliderControl
              id="swarm-influence"
              label={t("swarm.settings.influence", "Rayon d’influence")}
              help={t("swarm.help.influence", HELP_TEXTS.influenceRadius)}
              min={40}
              max={320}
              step={10}
              value={settings.influenceRadius}
              onChange={(value) => onSettingsChange({ influenceRadius: Math.round(value) })}
            />
            <SliderControl
              id="swarm-trails"
              label={t("swarm.settings.trails", "Traînées")}
              help={t("swarm.help.trails", HELP_TEXTS.trailLength)}
              min={3}
              max={30}
              step={1}
              value={settings.trailLength}
              onChange={(value) => onSettingsChange({ trailLength: Math.round(value) })}
            />
          </div>
        </details>

        <div className="swarm-audio-setting">
          <span>
            <Volume2 aria-hidden="true" />
            {t("swarm.settings.audio", "Audio réactif")}
          </span>
          <Switch
            checked={settings.audioEnabled}
            onCheckedChange={(checked) => onSettingsChange({ audioEnabled: checked })}
            aria-label={t("swarm.settings.audio", "Audio réactif")}
          />
        </div>
      </div>
    </aside>
  )
}
