"use client"

import { memo, useState } from "react"
import { Eye, EyeOff, HelpCircle, X } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

import { HELP_TEXTS, PRESETS } from "./constants"
import type { Settings, VisSettings } from "./types"

type NumericSettingKey = {
  [Key in keyof Settings]: Settings[Key] extends number ? Key : never
}[keyof Settings]

interface SliderDefinition {
  key: NumericSettingKey
  label: string
  help?: string
  min: number
  max: number
  step?: number
  round?: boolean
}

interface SettingsDrawerProps {
  settings: Settings
  visSettings: VisSettings
  presetKey: string
  onSettingsChange: (settings: Partial<Settings>) => void
  onVisSettingsChange: (vis: Partial<VisSettings>) => void
  onPresetChange: (key: string) => void
  onClose: () => void
  t: (key: string, fallback?: string) => string
}

interface SliderControlProps {
  definition: SliderDefinition
  value: number
  onChange: (value: number) => void
}

const SIMULATION_SLIDERS: SliderDefinition[] = [
  { key: "worldFriction", label: "Friction du monde", help: HELP_TEXTS.worldFriction, min: 0.8, max: 0.999, step: 0.001 },
  { key: "mutationRate", label: "Taux de mutation", help: HELP_TEXTS.mutationRate, min: 0, max: 0.3, step: 0.005 },
  { key: "metabolism", label: "Métabolisme", help: HELP_TEXTS.metabolism, min: 0.002, max: 0.05, step: 0.001 },
  { key: "trailFade", label: "Fondu traînées", help: HELP_TEXTS.trailFade, min: 0.01, max: 0.5, step: 0.01 },
  { key: "foodCount", label: "Quantité de nourriture", help: HELP_TEXTS.foodCount, min: 50, max: 2000, step: 10, round: true },
  { key: "foodValue", label: "Valeur nutritive", help: HELP_TEXTS.foodValue, min: 2, max: 30, round: true },
  { key: "splitThreshold", label: "Énergie de division", help: HELP_TEXTS.splitThreshold, min: 10, max: 80, round: true },
  { key: "reproductionCost", label: "Coût reproduction", help: HELP_TEXTS.reproductionCost, min: 4, max: 40, round: true },
]

const COMBAT_SLIDERS: SliderDefinition[] = [
  { key: "predAttackDamage", label: "Dégâts morsure", help: HELP_TEXTS.predAttackDamage, min: 4, max: 40, round: true },
  { key: "predAttackCooldown", label: "Cooldown morsure", help: HELP_TEXTS.predAttackCooldown, min: 4, max: 40, round: true },
  { key: "predAttackRange", label: "Portée morsure", help: HELP_TEXTS.predAttackRange, min: 6, max: 32, round: true },
  { key: "predLifesteal", label: "Vol de vie", help: HELP_TEXTS.predLifesteal, min: 0, max: 1, step: 0.05 },
  { key: "herdDefenseCount", label: "Seuil troupeau", help: HELP_TEXTS.herdDefenseCount, min: 2, max: 20, round: true },
  { key: "herdDefenseDamage", label: "Dégâts troupeau", help: HELP_TEXTS.herdDefenseDamage, min: 0, max: 10, step: 0.5 },
  { key: "herdDefenseRange", label: "Portée troupeau", help: HELP_TEXTS.herdDefenseRange, min: 10, max: 80, round: true },
  { key: "herdDefenseMaxStacks", label: "Max stacks troupeau", help: HELP_TEXTS.herdDefenseMaxStacks, min: 0, max: 12, round: true },
]

const SOCIAL_SLIDERS: SliderDefinition[] = [
  { key: "socialFollowDuration", label: "Durée suivi (ticks)", help: HELP_TEXTS.socialFollowDuration, min: 60, max: 1200, step: 10, round: true },
  { key: "socialFollowStrength", label: "Force suivi", help: HELP_TEXTS.socialFollowStrength, min: 0, max: 0.6, step: 0.01 },
  { key: "socialRebelProb", label: "Probabilité rebelle", help: HELP_TEXTS.socialRebelProb, min: 0, max: 0.5, step: 0.01 },
]

const INFECTION_SLIDERS: SliderDefinition[] = [
  { key: "toxinInfectProb", label: "Prob. contamination", help: HELP_TEXTS.toxinInfectProb, min: 0, max: 0.2, step: 0.005 },
  { key: "infectionDuration", label: "Durée infection", help: HELP_TEXTS.infectionDuration, min: 120, max: 2400, step: 30, round: true },
  { key: "infectionImmunityDuration", label: "Immunité post-infection", help: HELP_TEXTS.infectionImmunityDuration, min: 0, max: 3600, step: 30, round: true },
  { key: "infectionNaturalImmunityRate", label: "Immunité innée", help: HELP_TEXTS.infectionNaturalImmunityRate, min: 0, max: 0.5, step: 0.01 },
  { key: "infectionExtraDrain", label: "Drain infecté", help: HELP_TEXTS.infectionExtraDrain, min: 0, max: 0.06, step: 0.001 },
  { key: "infectionReproBlockDuration", label: "Blocage reproduction", help: HELP_TEXTS.infectionReproBlockDuration, min: 60, max: 2400, step: 30, round: true },
  { key: "infectionTransmitRadius", label: "Rayon transmission", help: HELP_TEXTS.infectionTransmitRadius, min: 6, max: 40, round: true },
  { key: "infectionR0", label: "R0 cible", help: HELP_TEXTS.infectionR0, min: 0, max: 2, step: 0.05 },
  { key: "toxinProximityDrain", label: "Drain proximité toxine", help: HELP_TEXTS.toxinProximityDrain, min: 0, max: 0.2, step: 0.005 },
  { key: "toxinDigestMultiplier", label: "Nutrition en zone toxique", help: HELP_TEXTS.toxinDigestMultiplier, min: 0, max: 1, step: 0.05 },
]

function SliderControl({ definition, value, onChange }: SliderControlProps) {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="microcosm-setting">
      <div className="microcosm-setting__label">
        <div>
          <Label>{definition.label}</Label>
          {definition.help ? (
            <button
              type="button"
              className="microcosm-setting__help"
              aria-label={`Aide : ${definition.label}`}
              aria-expanded={showHelp}
              onClick={() => setShowHelp((value) => !value)}
            >
              <HelpCircle aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <output>{Math.round(value * 1000) / 1000}</output>
      </div>

      {showHelp && definition.help ? (
        <p className="microcosm-setting__hint">{definition.help}</p>
      ) : null}

      <Slider
        value={[value]}
        min={definition.min}
        max={definition.max}
        step={definition.step ?? 1}
        onValueChange={([nextValue]) => onChange(nextValue)}
        aria-label={definition.label}
      />
    </div>
  )
}

function SettingsList({
  definitions,
  settings,
  onSettingsChange,
}: {
  definitions: SliderDefinition[]
  settings: Settings
  onSettingsChange: (settings: Partial<Settings>) => void
}) {
  return (
    <div className="microcosm-settings-list">
      {definitions.map((definition) => (
        <SliderControl
          key={definition.key}
          definition={definition}
          value={settings[definition.key] as number}
          onChange={(value) => {
            const nextValue = definition.round ? Math.round(value) : value
            onSettingsChange({ [definition.key]: nextValue } as Partial<Settings>)
          }}
        />
      ))}
    </div>
  )
}

export const SettingsDrawer = memo(function SettingsDrawer({
  settings,
  visSettings,
  presetKey,
  onSettingsChange,
  onVisSettingsChange,
  onPresetChange,
  onClose,
  t,
}: SettingsDrawerProps) {
  return (
    <aside id="microcosm-settings" className="microcosm-settings" aria-label={t("microcosm.shell.advancedSettings", "Réglages avancés")}>
      <div className="microcosm-panel-header">
        <div>
          <span>{t("microcosm.shell.settings", "Réglages")}</span>
          <h2>{t("microcosm.shell.advancedSettings", "Réglages avancés")}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label={t("microcosm.shell.closeSettings", "Fermer les réglages")}>
          <X aria-hidden="true" />
        </button>
      </div>

      <div className="microcosm-settings__scroll">
        <section className="microcosm-presets" aria-labelledby="microcosm-presets-title">
          <h3 id="microcosm-presets-title">{t("microcosm.controls.presets", "Presets")}</h3>
          <div>
            {Object.entries(PRESETS).map(([key, preset]) => (
              <Button
                key={key}
                type="button"
                variant="outline"
                size="sm"
                data-active={presetKey === key}
                onClick={() => onPresetChange(key)}
              >
                {t(`microcosm.presets.${key}.label`, preset.label)}
              </Button>
            ))}
          </div>
          <p>{t(`microcosm.presets.${presetKey}.hint`, PRESETS[presetKey]?.hint)}</p>
        </section>

        <Accordion type="multiple" defaultValue={["display", "simulation"]} className="microcosm-settings-accordion">
          <AccordionItem value="display">
            <AccordionTrigger>{t("microcosm.controls.display", "Affichage")}</AccordionTrigger>
            <AccordionContent>
              <div className="microcosm-toggle-row">
                <Label htmlFor="perf-mode">{t("microcosm.controls.perfMode", "Mode performance")}</Label>
                <Switch
                  id="perf-mode"
                  checked={Boolean(visSettings.perfMode)}
                  onCheckedChange={(checked) => onVisSettingsChange({ perfMode: checked })}
                />
              </div>
              <div className="microcosm-toggle-row">
                <Label htmlFor="trails">{t("microcosm.controls.trails", "Traînées")}</Label>
                <Switch
                  id="trails"
                  checked={visSettings.trailsEnabled}
                  onCheckedChange={(checked) => onVisSettingsChange({ trailsEnabled: checked })}
                />
              </div>
              {visSettings.trailsEnabled ? (
                <div className="microcosm-toggle-row">
                  <Label>{t("microcosm.controls.colorMode", "Mode couleur")}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onVisSettingsChange({
                        trailColorMode: visSettings.trailColorMode === "byGenome" ? "mono" : "byGenome",
                      })
                    }
                  >
                    {visSettings.trailColorMode === "byGenome" ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
                    {visSettings.trailColorMode === "byGenome" ? "Génome" : "Mono"}
                  </Button>
                </div>
              ) : null}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="simulation">
            <AccordionTrigger>{t("microcosm.controls.simulation", "Simulation")}</AccordionTrigger>
            <AccordionContent>
              <SettingsList definitions={SIMULATION_SLIDERS} settings={settings} onSettingsChange={onSettingsChange} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="combat">
            <AccordionTrigger>{t("microcosm.controls.combat", "Combat")}</AccordionTrigger>
            <AccordionContent>
              <SettingsList definitions={COMBAT_SLIDERS} settings={settings} onSettingsChange={onSettingsChange} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="social">
            <AccordionTrigger>{t("microcosm.controls.social.title", "Social")}</AccordionTrigger>
            <AccordionContent>
              <div className="microcosm-toggle-row">
                <Label htmlFor="social-follow">{t("microcosm.controls.social.familyFollow", "Suivi familial")}</Label>
                <Switch
                  id="social-follow"
                  checked={settings.socialFollowEnabled}
                  onCheckedChange={(checked) => onSettingsChange({ socialFollowEnabled: checked })}
                />
              </div>
              <SettingsList definitions={SOCIAL_SLIDERS} settings={settings} onSettingsChange={onSettingsChange} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="infection">
            <AccordionTrigger>{t("microcosm.controls.infection", "Toxines & infection")}</AccordionTrigger>
            <AccordionContent>
              <SettingsList definitions={INFECTION_SLIDERS} settings={settings} onSettingsChange={onSettingsChange} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </aside>
  )
})
