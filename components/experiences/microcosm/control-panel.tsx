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
    <Card className="w-full max-w-sm bg-slate-900/95 border-slate-700 backdrop-blur-sm">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg">{t('microcosm.controls.title','Contrôles Microcosm')}</CardTitle>
        <div className="text-sm">
          <Badge variant="secondary">🌱 {stats.herbs} {t('microcosm.stats.herbivores','herbivores')}</Badge>
          <Badge variant="destructive">🦁 {stats.preds} {t('microcosm.stats.predators','prédateurs')}</Badge>
          <Badge variant="outline">🍃 {stats.food} {t('microcosm.stats.food','nourriture')}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Contrôles principaux */}
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
        
        {/* Actions rapides */}
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

        {/* Presets */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">{t('microcosm.controls.presets','Presets')}</Label>
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

        {/* Paramètres visuels */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">{t('microcosm.controls.display','Affichage')}</Label>
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

        {/* Paramètres de simulation */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold">{t('microcosm.controls.simulation','Simulation')}</Label>

          <SliderControl
            label={t('microcosm.controls.sliders.mutation','Mutation')}
            help={t('microcosm.help.mutationRate', HELP_TEXTS.mutationRate)}
            min={0}
            max={0.3}
            step={0.005}
            value={settings.mutationRate}
            onChange={(v) => onSettingsChange({ mutationRate: v })}
          />

          <SliderControl
            label={t('microcosm.controls.sliders.metabolism','Métabolisme')}
            help={t('microcosm.help.metabolism', HELP_TEXTS.metabolism)}
            min={0.005}
            max={0.06}
            step={0.001}
            value={settings.metabolism}
            onChange={(v) => onSettingsChange({ metabolism: v })}
          />

          <SliderControl
            label={t('microcosm.controls.sliders.trailFade','Fondu traînées')}
            help={t('microcosm.help.trailFade', HELP_TEXTS.trailFade)}
            min={0.005}
            max={0.25}
            step={0.002}
            value={settings.trailFade}
            onChange={(v) => onSettingsChange({ trailFade: v })}
          />

          <SliderControl
            label={t('microcosm.controls.sliders.foodCount','Nourriture cible')}
            help={t('microcosm.help.foodCount', HELP_TEXTS.foodCount)}
            min={50}
            max={1000}
            step={10}
            value={settings.foodCount}
            onChange={(v) => onSettingsChange({ foodCount: Math.round(v) })}
          />

          <SliderControl
            label={t('microcosm.controls.sliders.splitThreshold','Seuil division')}
            help={t('microcosm.help.splitThreshold', HELP_TEXTS.splitThreshold)}
            min={12}
            max={80}
            step={1}
            value={settings.splitThreshold}
            onChange={(v) => onSettingsChange({ splitThreshold: Math.round(v) })}
          />

          <SliderControl
            label={t('microcosm.controls.sliders.reproductionCost','Coût reproduction')}
            help={t('microcosm.help.reproductionCost', HELP_TEXTS.reproductionCost)}
            min={4}
            max={40}
            step={1}
            value={settings.reproductionCost}
            onChange={(v) => onSettingsChange({ reproductionCost: Math.round(v) })}
          />
        </div>

        {/* Paramètres de combat */}
        <div className="space-y-4 pt-2 border-t border-slate-700/50">
          <Label className="text-sm font-semibold">{t('microcosm.controls.combat','Combat')}</Label>

          <SliderControl
            label={t('microcosm.controls.sliders.predAttackDamage','Dégâts morsure')}
            help={t('microcosm.help.predAttackDamage', HELP_TEXTS.predAttackDamage)}
            min={4}
            max={40}
            step={1}
            value={settings.predAttackDamage}
            onChange={(v) => onSettingsChange({ predAttackDamage: Math.round(v) })}
          />

          <SliderControl
            label={t('microcosm.controls.sliders.predAttackCooldown','Cooldown morsure')}
            help={t('microcosm.help.predAttackCooldown', HELP_TEXTS.predAttackCooldown)}
            min={4}
            max={40}
            step={1}
            value={settings.predAttackCooldown}
            onChange={(v) => onSettingsChange({ predAttackCooldown: Math.round(v) })}
          />

          <SliderControl
            label={t('microcosm.controls.sliders.predAttackRange','Portée morsure')}
            help={t('microcosm.help.predAttackRange', HELP_TEXTS.predAttackRange)}
            min={6}
            max={30}
            step={1}
            value={settings.predAttackRange}
            onChange={(v) => onSettingsChange({ predAttackRange: Math.round(v) })}
          />

          <SliderControl
            label={t('microcosm.controls.sliders.predLifesteal','Vol de vie')}
            help={t('microcosm.help.predLifesteal', HELP_TEXTS.predLifesteal)}
            min={0}
            max={1}
            step={0.05}
            value={settings.predLifesteal}
            onChange={(v) => onSettingsChange({ predLifesteal: v })}
          />

          <SliderControl
            label={t('microcosm.controls.sliders.herdDefenseCount','Seuil troupeau')}
            help={t('microcosm.help.herdDefenseCount', HELP_TEXTS.herdDefenseCount)}
            min={2}
            max={20}
            step={1}
            value={settings.herdDefenseCount}
            onChange={(v) => onSettingsChange({ herdDefenseCount: Math.round(v) })}
          />

          <SliderControl
            label={t('microcosm.controls.sliders.herdDefenseDamage','Dégâts troupeau')}
            help={t('microcosm.help.herdDefenseDamage', HELP_TEXTS.herdDefenseDamage)}
            min={0}
            max={10}
            step={0.5}
            value={settings.herdDefenseDamage}
            onChange={(v) => onSettingsChange({ herdDefenseDamage: v })}
          />

          <SliderControl
            label={t('microcosm.controls.sliders.herdDefenseRange','Portée troupeau')}
            help={t('microcosm.help.herdDefenseRange', HELP_TEXTS.herdDefenseRange)}
            min={10}
            max={80}
            step={1}
            value={settings.herdDefenseRange}
            onChange={(v) => onSettingsChange({ herdDefenseRange: Math.round(v) })}
          />

          <SliderControl
            label={t('microcosm.controls.sliders.herdDefenseMaxStacks','Max stacks troupeau')}
            help={t('microcosm.help.herdDefenseMaxStacks', HELP_TEXTS.herdDefenseMaxStacks)}
            min={0}
            max={12}
            step={1}
            value={settings.herdDefenseMaxStacks}
            onChange={(v) => onSettingsChange({ herdDefenseMaxStacks: Math.round(v) })}
          />
        </div>

        {/* Paramètres sociaux */}
        <div className="space-y-4 pt-2 border-t border-slate-700/50">
          <Label className="text-sm font-semibold">{t('microcosm.controls.social.title','Social')}</Label>

          <div className="flex items-center justify-between">
            <Label htmlFor="social-follow" className="text-sm">{t('microcosm.controls.social.familyFollow','Suivi familial')}</Label>
            <Switch id="social-follow" checked={settings.socialFollowEnabled} onCheckedChange={(checked) => onSettingsChange({ socialFollowEnabled: checked })} />
          </div>

          <SliderControl
            label={t('microcosm.controls.sliders.socialFollowDuration','Durée suivi')}
            min={60}
            max={900}
            step={10}
            value={settings.socialFollowDuration}
            onChange={(v) => onSettingsChange({ socialFollowDuration: Math.round(v) })}
          />

          <SliderControl
            label={t('microcosm.controls.sliders.socialFollowStrength','Force suivi')}
            min={0}
            max={0.6}
            step={0.01}
            value={settings.socialFollowStrength}
            onChange={(v) => onSettingsChange({ socialFollowStrength: v })}
          />

          <SliderControl
            label={t('microcosm.controls.sliders.socialRebelProb','Prob. rebelle')}
            min={0}
            max={0.5}
            step={0.01}
            value={settings.socialRebelProb}
            onChange={(v) => onSettingsChange({ socialRebelProb: v })}
          />
        </div>
      </CardContent>
    </Card>
  )
}
