"use client"

import type { Cell } from "./types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Users, Zap, Eye, EyeOff, Gauge, Target } from "lucide-react"

interface CellInfoPanelProps {
  cell: Cell | null
  onClose: () => void
  onSelectCell: (cellId: number) => void
  allCells: Cell[]
  isTracking?: boolean
  onToggleTracking?: () => void
  currentTime?: number
  t?: (k: string, fallback?: string) => string
}

export function CellInfoPanel({ cell, onClose, onSelectCell, allCells, isTracking = false, onToggleTracking, currentTime = 0, t }: CellInfoPanelProps) {
  if (!cell) return null

  const formatValue = (value: number, decimals = 2) => {
    return Number(value.toFixed(decimals))
  }

  const getRelatives = () => {
    const parent = cell.parentId ? allCells.find((c) => c.id === cell.parentId) : null
    const children = allCells.filter((c) => cell.children.includes(c.id))
    return { parent, children }
  }

  const { parent, children } = getRelatives()

  return (
    <Card className="microcosm-organism">
      <CardHeader className="microcosm-organism__header">
        <span className="microcosm-organism__eyebrow">
          {t ? t("microcosm.shell.organismFile", "Fiche organisme") : "Fiche organisme"}
        </span>
        <div className="flex items-center justify-between">
          <CardTitle className="microcosm-organism__title">
            <div
              className="microcosm-organism__cell-dot"
              style={{
                backgroundColor: `hsl(${cell.kind === "herbivore" ? cell.genome.hue : (cell.genome.hue + 330) % 360}, 90%, 60%)`,
                borderColor: `hsl(${cell.kind === "herbivore" ? cell.genome.hue : (cell.genome.hue + 330) % 360}, 90%, 70%)`,
              }}
            />
            {(t ? t('microcosm.cell.cell','Cellule') : 'Cellule')} #{cell.id}
          </CardTitle>
          <div className="flex items-center gap-1">
            {onToggleTracking && (
              <Button
                variant={isTracking ? "default" : "outline"}
                size="sm"
                onClick={onToggleTracking}
                className="microcosm-organism__track"
                data-active={isTracking}
              >
                {isTracking ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                {isTracking ? (t ? t('microcosm.cell.following','Suivi') : 'Suivi') : (t ? t('microcosm.cell.follow','Suivre') : 'Suivre')}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="microcosm-organism__close"
              aria-label={t ? t("microcosm.shell.closeOrganism", "Fermer la fiche organisme") : "Fermer la fiche organisme"}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="microcosm-organism__badges">
          <Badge
            variant="outline"
            data-tone={cell.kind === "herbivore" ? "ion" : "ember"}
          >
            {cell.kind === "herbivore" ? (t ? t('microcosm.cell.herbivore','Herbivore') : 'Herbivore') : (t ? t('microcosm.cell.predator','Prédateur') : 'Prédateur')}
          </Badge>
          <Badge variant="outline">
            {(t ? t('microcosm.cell.gen','Gen') : 'Gen')} {cell.generation}
          </Badge>
          {cell.isFollowingParent && cell.followUntil && currentTime <= cell.followUntil && (
            <Badge variant="outline" data-tone="sun">
              {t ? t('microcosm.cell.juvenile','Juvénile') : 'Juvénile'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="microcosm-organism__content">
        {/* Stats vitaux */}
        <div className="microcosm-organism__stats">
          <div className="space-y-1">
            <div className="microcosm-organism__label">
              <Zap className="w-3 h-3" />
              {t ? t('microcosm.cell.energy','Énergie') : 'Énergie'}
            </div>
            <div className="microcosm-organism__value">{formatValue(cell.energy)}</div>
          </div>
          <div className="space-y-1">
            <div className="microcosm-organism__label">{t ? t('microcosm.cell.age','Âge') : 'Âge'}</div>
            <div className="microcosm-organism__value">{cell.age} ticks</div>
          </div>
          <div className="space-y-1">
            <div className="microcosm-organism__label">{t ? t('microcosm.cell.position','Position') : 'Position'}</div>
            <div className="microcosm-organism__value">
              {formatValue(cell.pos.x, 0)}, {formatValue(cell.pos.y, 0)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="microcosm-organism__label">{t ? t('microcosm.cell.speed','Vitesse') : 'Vitesse'}</div>
            <div className="microcosm-organism__value">{formatValue(Math.hypot(cell.vel.x, cell.vel.y))}</div>
          </div>
        </div>

        {/* Génome */}
        <div className="space-y-2">
          <h4 className="microcosm-organism__section-title">{t ? t('microcosm.cell.genome','Génome') : 'Génome'}</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-slate-400" />
              <span className="text-slate-400">{t ? t('microcosm.cell.size','Taille') : 'Taille'}:</span>
              <span className="font-mono">{formatValue(cell.genome.size)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-slate-400" />
              <span className="text-slate-400">{t ? t('microcosm.cell.maxSpeed','Vitesse max') : 'Vitesse max'}:</span>
              <span className="font-mono">{formatValue(cell.genome.maxSpeed)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-slate-400" />
              <span className="text-slate-400">{t ? t('microcosm.cell.sense','Portée') : 'Portée'}:</span>
              <span className="font-mono">{formatValue(cell.genome.sense, 0)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-slate-400" />
              <span className="text-slate-400">{t ? t('microcosm.cell.efficiency','Efficacité') : 'Efficacité'}:</span>
              <span className="font-mono">{formatValue(cell.genome.efficiency * 100, 0)}%</span>
            </div>
          </div>
        </div>

        {/* Lignée */}
        <div className="space-y-2">
          <h4 className="microcosm-organism__section-title flex items-center gap-1">
            <Users className="w-4 h-4" />
            {t ? t('microcosm.cell.lineage','Lignée') : 'Lignée'}
          </h4>

          {parent && (
            <div className="space-y-1">
              <div className="text-xs text-slate-400">{t ? t('microcosm.cell.parent','Parent') : 'Parent'}</div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs bg-transparent"
                onClick={() => onSelectCell(parent.id)}
              >
                {(t ? t('microcosm.cell.cell','Cellule') : 'Cellule')} #{parent.id} ({t ? t('microcosm.cell.gen','Gen') : 'Gen'} {parent.generation})
              </Button>
            </div>
          )}

          <div className="space-y-1">
            <div className="text-xs text-slate-400">{t ? t('microcosm.cell.children','Enfants') : 'Enfants'} ({children.length}/{cell.totalOffspring} total)</div>
            {children.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {children.slice(0, 4).map((child) => (
                  <Button
                    key={child.id}
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs px-2 bg-transparent"
                    onClick={() => onSelectCell(child.id)}
                  >
                    #{child.id}
                  </Button>
                ))}
                {children.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{children.length - 4}
                  </Badge>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500">{t ? t('microcosm.cell.noChildren','Aucun enfant vivant') : 'Aucun enfant vivant'}</div>
            )}
          </div>
        </div>

        {/* Santé / Infection */}
        <div className="space-y-2">
          <h4 className="microcosm-organism__section-title">{t ? t('microcosm.cell.health','Santé') : 'Santé'}</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400">{t ? t('microcosm.cell.infectionState','Statut infection') : 'Statut infection'}:</span>
              <span className="ml-1 font-mono">{cell.infectionState ?? (cell.naturallyImmune ? 'immune' : 'susceptible')}</span>
            </div>
            {cell.infectedUntil !== undefined && (
              <div>
                <span className="text-slate-400">{t ? t('microcosm.cell.infectedUntil','Infecté jusqu’à') : 'Infecté jusqu’à'}:</span>
                <span className="ml-1 font-mono">{Math.max(0, (cell.infectedUntil || 0) - (currentTime || 0))}</span>
              </div>
            )}
            {cell.immuneUntil !== undefined && (
              <div>
                <span className="text-slate-400">{t ? t('microcosm.cell.immuneUntil','Immunisé jusqu’à') : 'Immunisé jusqu’à'}:</span>
                <span className="ml-1 font-mono">{Math.max(0, (cell.immuneUntil || 0) - (currentTime || 0))}</span>
              </div>
            )}
            {cell.reproBlockedUntil !== undefined && (
              <div>
                <span className="text-slate-400">{t ? t('microcosm.cell.reproBlocked','Repro. bloquée (ticks restants)') : 'Repro. bloquée (ticks)'}:</span>
                <span className="ml-1 font-mono">{Math.max(0, (cell.reproBlockedUntil || 0) - (currentTime || 0))}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats de reproduction */}
        <div className="pt-3 border-t border-hairline">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400">Descendance totale:</span>
              <span className="ml-1 font-mono">{cell.totalOffspring}</span>
            </div>
            <div>
              <span className="text-slate-400">Né à:</span>
              <span className="ml-1 font-mono">{cell.birthTime}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
