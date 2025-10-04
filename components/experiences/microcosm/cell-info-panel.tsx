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
    <Card className="absolute top-4 right-4 z-50 w-80 rounded-[24px] border border-white/10 bg-white/[0.07] backdrop-blur-xl shadow-[0_25px_70px_rgba(99,102,241,0.25)]">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <div
              className="w-4 h-4 rounded-full border-2"
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
                className={
                  isTracking
                    ? "rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 text-slate-900 shadow-[0_10px_32px_rgba(76,29,149,0.35)]"
                    : "rounded-full border-white/20 bg-white/10 text-slate-200 hover:bg-white/20"
                }
              >
                {isTracking ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                {isTracking ? (t ? t('microcosm.cell.following','Suivi') : 'Suivi') : (t ? t('microcosm.cell.follow','Suivre') : 'Suivre')}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full text-slate-200 hover:bg-white/10">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge
            variant={cell.kind === "herbivore" ? "secondary" : "destructive"}
            className={
              cell.kind === "herbivore"
                ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-100"
                : "border-rose-400/30 bg-rose-500/20 text-rose-100"
            }
          >
            {cell.kind === "herbivore" ? (t ? t('microcosm.cell.herbivore','Herbivore') : 'Herbivore') : (t ? t('microcosm.cell.predator','Prédateur') : 'Prédateur')}
          </Badge>
          <Badge variant="outline" className="border-white/20 text-slate-200">
            {(t ? t('microcosm.cell.gen','Gen') : 'Gen')} {cell.generation}
          </Badge>
          {cell.isFollowingParent && cell.followUntil && currentTime <= cell.followUntil && (
            <Badge variant="secondary" className="border-purple-400/25 bg-purple-500/15 text-purple-100">
              {t ? t('microcosm.cell.juvenile','Juvénile') : 'Juvénile'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-slate-200">
        {/* Stats vitaux */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {t ? t('microcosm.cell.energy','Énergie') : 'Énergie'}
            </div>
            <div className="text-sm font-mono">{formatValue(cell.energy)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-400">{t ? t('microcosm.cell.age','Âge') : 'Âge'}</div>
            <div className="text-sm font-mono">{cell.age} ticks</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-400">{t ? t('microcosm.cell.position','Position') : 'Position'}</div>
            <div className="text-sm font-mono">
              {formatValue(cell.pos.x, 0)}, {formatValue(cell.pos.y, 0)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-400">{t ? t('microcosm.cell.speed','Vitesse') : 'Vitesse'}</div>
            <div className="text-sm font-mono">{formatValue(Math.hypot(cell.vel.x, cell.vel.y))}</div>
          </div>
        </div>

        {/* Génome */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-200">{t ? t('microcosm.cell.genome','Génome') : 'Génome'}</h4>
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
          <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-1">
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
          <h4 className="text-sm font-semibold text-slate-200">{t ? t('microcosm.cell.health','Santé') : 'Santé'}</h4>
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
        <div className="pt-2 border-t border-slate-700">
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
