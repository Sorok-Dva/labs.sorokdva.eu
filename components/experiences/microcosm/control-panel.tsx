"use client"

import type { Settings, VisSettings } from "./types"
import { PRESETS, HELP_TEXTS } from "./constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { HelpCircle, Play, Pause, RotateCcw, Camera, Eye, EyeOff } from "lucide-react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { useState } from "react"

interface ControlPanelProps {
  settings: Settings
  visSettings: VisSettings
  presetKey: string
  running: boolean
  stats: { herbs: number; preds: number; food: number }
  onSettingsChange: (settings: Partial<Settings>) => void
  onVisSettingsChange: (vis: Partial<VisSettings>) => void
  onPresetChange: (key: string) => void
  onToggleRun: () => void
  onReset: () => void
  onSnapshot: () => void
  onSpawnFood: () => void
  onSpawnToxin: () => void
  onSpawnPredator: () => void
  t: (k: string, fallback?: string) => string
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

export function ControlPanel({
  settings,
  visSettings,
  presetKey,
  running,
  stats,
  onSettingsChange,
  onVisSettingsChange,
  onPresetChange,
  onToggleRun,
  onReset,
  onSnapshot,
  onSpawnFood,
  onSpawnToxin,
  onSpawnPredator,
  t,
}: ControlPanelProps) {
  return (
    <Card className="w-full bg-slate-900/95 border-slate-700 backdrop-blur-sm">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg">{t('microcosm.controls.title','Contrôles Microcosm')}</CardTitle>
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          <Badge variant="secondary">🌱 {stats.herbs} {t('microcosm.stats.herbivores','herbivores')}</Badge>
          <Badge variant="destructive">🦁 {stats.preds} {t('microcosm.stats.predators','prédateurs')}</Badge>
          <Badge variant="outline">🍃 {stats.food} {t('microcosm.stats.food','nourriture')}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button onClick={onToggleRun} className="flex-1">
            {running ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {running ? t('microcosm.controls.buttons.pause','Pause') : t('microcosm.controls.buttons.play','Play')}
          </Button>
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={onSnapshot}>
            <Camera className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold">{t('microcosm.controls.actions','Actions')}</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={onSpawnFood} className="text-xs bg-transparent">
              🍃 {t('microcosm.actions.feed','Nourrir')}
            </Button>
            <Button variant="outline" size="sm" onClick={onSpawnToxin} className="text-xs bg-transparent">
              ☠️ {t('microcosm.actions.toxin','Toxine')}
            </Button>
            <Button variant="outline" size="sm" onClick={onSpawnPredator} className="text-xs bg-transparent">
              🦁 {t('microcosm.actions.predator','Prédateur')}
            </Button>
          </div>
        </div>

        <Accordion type="single" collapsible defaultValue="display">
          <AccordionItem value="presets">
            <AccordionTrigger>{t('microcosm.controls.presets','Presets')}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PRESETS).map(([key, preset]) => (
                    <Button
                      key={key}
                      variant={presetKey === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPresetChange(key)}
                      className="text-xs"
                    >
                      {t(`microcosm.presets.${key}.label`, preset.label)}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-slate-400">{t(`microcosm.presets.${presetKey}.hint`, PRESETS[presetKey]?.hint)}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="display">
            <AccordionTrigger>{t('microcosm.controls.display','Affichage')}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="perf-mode" className="text-sm">{t('microcosm.controls.perfMode','Mode performance')}</Label>
                  <Switch
                    id="perf-mode"
                    checked={!!visSettings.perfMode}
                    onCheckedChange={(checked) => onVisSettingsChange({ perfMode: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="trails" className="text-sm">{t('microcosm.controls.trails','Traînées')}</Label>
                  <Switch
                    id="trails"
                    checked={visSettings.trailsEnabled}
                    onCheckedChange={(checked) => onVisSettingsChange({ trailsEnabled: checked })}
                  />
                </div>
                {visSettings.trailsEnabled && (
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">{t('microcosm.controls.colorMode','Mode couleur')}</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onVisSettingsChange({
                          trailColorMode: visSettings.trailColorMode === "byGenome" ? "mono" : "byGenome",
                        })
                      }
                    >
                      {visSettings.trailColorMode === "byGenome" ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="simulation">
            <AccordionTrigger>{t('microcosm.controls.simulation','Simulation')}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <SliderControl
                  label={t('microcosm.controls.worldFriction','Friction du monde')}
                  help={HELP_TEXTS.worldFriction}
                  min={0.8}
                  max={0.999}
                  step={0.001}
                  value={settings.worldFriction}
                  onChange={(value) => onSettingsChange({ worldFriction: value })}
                />

                <SliderControl
                  label={t('microcosm.controls.mutationRate','Taux de mutation')}
                  help={HELP_TEXTS.mutationRate}
                  min={0}
                  max={0.3}
                  step={0.005}
                  value={settings.mutationRate}
                  onChange={(value) => onSettingsChange({ mutationRate: value })}
                />

                <SliderControl
                  label={t('microcosm.controls.metabolism','Métabolisme')}
                  help={HELP_TEXTS.metabolism}
                  min={0.002}
                  max={0.05}
                  step={0.001}
                  value={settings.metabolism}
                  onChange={(value) => onSettingsChange({ metabolism: value })}
                />

                <SliderControl
                  label={t('microcosm.controls.trailFade','Fondu traînées')}
                  help={HELP_TEXTS.trailFade}
                  min={0.01}
                  max={0.5}
                  step={0.01}
                  value={settings.trailFade}
                  onChange={(value) => onSettingsChange({ trailFade: value })}
                />

                <SliderControl
                  label={t('microcosm.controls.foodCount','Quantité de nourriture')}
                  help={HELP_TEXTS.foodCount}
                  min={50}
                  max={2000}
                  step={10}
                  value={settings.foodCount}
                  onChange={(value) => onSettingsChange({ foodCount: Math.round(value) })}
                />

                <SliderControl
                  label={t('microcosm.controls.foodValue','Valeur nutritive')}
                  help={HELP_TEXTS.foodValue}
                  min={2}
                  max={30}
                  step={1}
                  value={settings.foodValue}
                  onChange={(value) => onSettingsChange({ foodValue: Math.round(value) })}
                />

                <SliderControl
                  label={t('microcosm.controls.splitThreshold','Énergie de division')}
                  help={HELP_TEXTS.splitThreshold}
                  min={10}
                  max={80}
                  step={1}
                  value={settings.splitThreshold}
                  onChange={(value) => onSettingsChange({ splitThreshold: Math.round(value) })}
                />

                <SliderControl
                  label={t('microcosm.controls.reproductionCost','Coût reproduction')}
                  help={HELP_TEXTS.reproductionCost}
                  min={4}
                  max={40}
                  step={1}
                  value={settings.reproductionCost}
                  onChange={(value) => onSettingsChange({ reproductionCost: Math.round(value) })}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="combat">
            <AccordionTrigger>{t('microcosm.controls.combat','Combat')}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <SliderControl
                  label={t('microcosm.controls.predAttackDamage','Dégâts morsure')}
                  help={HELP_TEXTS.predAttackDamage}
                  min={4}
                  max={40}
                  step={1}
                  value={settings.predAttackDamage}
                  onChange={(value) => onSettingsChange({ predAttackDamage: Math.round(value) })}
                />

                <SliderControl
                  label={t('microcosm.controls.predAttackCooldown','Cooldown morsure')}
                  help={HELP_TEXTS.predAttackCooldown}
                  min={4}
                  max={40}
                  step={1}
                  value={settings.predAttackCooldown}
                  onChange={(value) => onSettingsChange({ predAttackCooldown: Math.round(value) })}
                />

                <SliderControl
                  label={t('microcosm.controls.predAttackRange','Portée morsure')}
                  help={HELP_TEXTS.predAttackRange}
                  min={6}
                  max={32}
                  step={1}
                  value={settings.predAttackRange}
                  onChange={(value) => onSettingsChange({ predAttackRange: Math.round(value) })}
                />

                <SliderControl
                  label={t('microcosm.controls.predLifesteal','Vol de vie')}
                  help={HELP_TEXTS.predLifesteal}
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.predLifesteal}
                  onChange={(value) => onSettingsChange({ predLifesteal: value })}
                />

                <SliderControl
                  label={t('microcosm.controls.herdDefenseCount','Seuil troupeau')}
                  help={HELP_TEXTS.herdDefenseCount}
                  min={2}
                  max={20}
                  step={1}
                  value={settings.herdDefenseCount}
                  onChange={(value) => onSettingsChange({ herdDefenseCount: Math.round(value) })}
                />

                <SliderControl
                  label={t('microcosm.controls.herdDefenseDamage','Dégâts troupeau')}
                  help={HELP_TEXTS.herdDefenseDamage}
                  min={0}
                  max={10}
                  step={0.5}
                  value={settings.herdDefenseDamage}
                  onChange={(value) => onSettingsChange({ herdDefenseDamage: value })}
                />

                <SliderControl
                  label={t('microcosm.controls.herdDefenseRange','Portée troupeau')}
                  help={HELP_TEXTS.herdDefenseRange}
                  min={10}
                  max={80}
                  step={1}
                  value={settings.herdDefenseRange}
                  onChange={(value) => onSettingsChange({ herdDefenseRange: Math.round(value) })}
                />

                <SliderControl
                  label={t('microcosm.controls.herdDefenseMaxStacks','Max stacks troupeau')}
                  help={HELP_TEXTS.herdDefenseMaxStacks}
                  min={0}
                  max={12}
                  step={1}
                  value={settings.herdDefenseMaxStacks}
                  onChange={(value) => onSettingsChange({ herdDefenseMaxStacks: Math.round(value) })}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="social">
            <AccordionTrigger>{t('microcosm.controls.social.title','Social')}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="social-follow" className="text-sm">{t('microcosm.controls.social.familyFollow','Suivi familial')}</Label>
                  <Switch
                    id="social-follow"
                    checked={settings.socialFollowEnabled}
                    onCheckedChange={(checked) => onSettingsChange({ socialFollowEnabled: checked })}
                  />
                </div>

                <SliderControl
                  label={t('microcosm.controls.social.followDuration','Durée suivi (ticks)')}
                  help={HELP_TEXTS.socialFollowDuration}
                  min={60}
                  max={1200}
                  step={10}
                  value={settings.socialFollowDuration}
                  onChange={(value) => onSettingsChange({ socialFollowDuration: Math.round(value) })}
                />

                <SliderControl
                  label={t('microcosm.controls.social.followStrength','Force suivi')}
                  help={HELP_TEXTS.socialFollowStrength}
                  min={0}
                  max={0.6}
                  step={0.01}
                  value={settings.socialFollowStrength}
                  onChange={(value) => onSettingsChange({ socialFollowStrength: value })}
                />

                <SliderControl
                  label={t('microcosm.controls.social.rebelProb','Probabilité rebelle')}
                  help={HELP_TEXTS.socialRebelProb}
                  min={0}
                  max={0.5}
                  step={0.01}
                  value={settings.socialRebelProb}
                  onChange={(value) => onSettingsChange({ socialRebelProb: value })}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="infection">
            <AccordionTrigger>{t('microcosm.controls.infection','Toxines & Infection')}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <SliderControl
                  label={t('microcosm.controls.toxinInfectProb','Prob. contamination (toxine)')}
                  help={HELP_TEXTS.toxinInfectProb}
                  min={0}
                  max={0.2}
                  step={0.005}
                  value={settings.toxinInfectProb}
                  onChange={(value) => onSettingsChange({ toxinInfectProb: value })}
                />

                <SliderControl
                  label={t('microcosm.controls.infectionDuration','Durée infection (ticks)')}
                  help={HELP_TEXTS.infectionDuration}
                  min={120}
                  max={2400}
                  step={30}
                  value={settings.infectionDuration}
                  onChange={(value) => onSettingsChange({ infectionDuration: Math.round(value) })}
                />

                <SliderControl
                  label={t('microcosm.controls.infectionImmunityDuration','Immunité post-infection (ticks)')}
                  help={HELP_TEXTS.infectionImmunityDuration}
                  min={0}
                  max={3600}
                  step={30}
                  value={settings.infectionImmunityDuration}
                  onChange={(value) => onSettingsChange({ infectionImmunityDuration: Math.round(value) })}
                />

                <SliderControl
                  label={t('microcosm.controls.infectionNaturalImmunityRate','Immunité innée (%)')}
                  help={HELP_TEXTS.infectionNaturalImmunityRate}
                  min={0}
                  max={0.5}
                  step={0.01}
                  value={settings.infectionNaturalImmunityRate}
                  onChange={(value) => onSettingsChange({ infectionNaturalImmunityRate: value })}
                />

                <SliderControl
                  label={t('microcosm.controls.infectionExtraDrain','Drain infecté (énergie/tick)')}
                  help={HELP_TEXTS.infectionExtraDrain}
                  min={0}
                  max={0.06}
                  step={0.001}
                  value={settings.infectionExtraDrain}
                  onChange={(value) => onSettingsChange({ infectionExtraDrain: value })}
                />

                <SliderControl
                  label={t('microcosm.controls.infectionReproBlockDuration','Blocage repro post-contagion (ticks)')}
                  help={HELP_TEXTS.infectionReproBlockDuration}
                  min={60}
                  max={2400}
                  step={30}
                  value={settings.infectionReproBlockDuration}
                  onChange={(value) => onSettingsChange({ infectionReproBlockDuration: Math.round(value) })}
                />

                <SliderControl
                  label={t('microcosm.controls.infectionTransmitRadius','Rayon transmission (px)')}
                  help={HELP_TEXTS.infectionTransmitRadius}
                  min={6}
                  max={40}
                  step={1}
                  value={settings.infectionTransmitRadius}
                  onChange={(value) => onSettingsChange({ infectionTransmitRadius: Math.round(value) })}
                />

                <SliderControl
                  label={t('microcosm.controls.infectionR0','R0 cible (approx)')}
                  help={HELP_TEXTS.infectionR0}
                  min={0}
                  max={2}
                  step={0.05}
                  value={settings.infectionR0}
                  onChange={(value) => onSettingsChange({ infectionR0: value })}
                />

                <SliderControl
                  label={t('microcosm.controls.toxinProximityDrain','Drain proximité toxine (× force)')}
                  help={HELP_TEXTS.toxinProximityDrain}
                  min={0}
                  max={0.2}
                  step={0.005}
                  value={settings.toxinProximityDrain}
                  onChange={(value) => onSettingsChange({ toxinProximityDrain: value })}
                />

                <SliderControl
                  label={t('microcosm.controls.toxinDigestMultiplier','Nutrition en zone toxique (×)')}
                  help={HELP_TEXTS.toxinDigestMultiplier}
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.toxinDigestMultiplier}
                  onChange={(value) => onSettingsChange({ toxinDigestMultiplier: value })}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
