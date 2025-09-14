"use client"

import type { Cell } from "./types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Users, Zap, Eye, Gauge, Target } from "lucide-react"

interface CellInfoPanelProps {
  cell: Cell | null
  onClose: () => void
  onSelectCell: (cellId: number) => void
  allCells: Cell[]
}

export function CellInfoPanel({ cell, onClose, onSelectCell, allCells }: CellInfoPanelProps) {
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
    <Card className="absolute top-4 right-4 w-80 bg-slate-900/95 border-slate-700 backdrop-blur-sm z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border-2"
              style={{
                backgroundColor: `hsl(${cell.kind === "herbivore" ? cell.genome.hue : (cell.genome.hue + 330) % 360}, 90%, 60%)`,
                borderColor: `hsl(${cell.kind === "herbivore" ? cell.genome.hue : (cell.genome.hue + 330) % 360}, 90%, 70%)`,
              }}
            />
            Cellule #{cell.id}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Badge variant={cell.kind === "herbivore" ? "secondary" : "destructive"}>
            {cell.kind === "herbivore" ? "Herbivore" : "Prédateur"}
          </Badge>
          <Badge variant="outline">Gen {cell.generation}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats vitaux */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Énergie
            </div>
            <div className="text-sm font-mono">{formatValue(cell.energy)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-400">Âge</div>
            <div className="text-sm font-mono">{cell.age} ticks</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-400">Position</div>
            <div className="text-sm font-mono">
              {formatValue(cell.pos.x, 0)}, {formatValue(cell.pos.y, 0)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-slate-400">Vitesse</div>
            <div className="text-sm font-mono">{formatValue(Math.hypot(cell.vel.x, cell.vel.y))}</div>
          </div>
        </div>

        {/* Génome */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-200">Génome</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-slate-400" />
              <span className="text-slate-400">Taille:</span>
              <span className="font-mono">{formatValue(cell.genome.size)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-slate-400" />
              <span className="text-slate-400">Vitesse max:</span>
              <span className="font-mono">{formatValue(cell.genome.maxSpeed)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-slate-400" />
              <span className="text-slate-400">Portée:</span>
              <span className="font-mono">{formatValue(cell.genome.sense, 0)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-slate-400" />
              <span className="text-slate-400">Efficacité:</span>
              <span className="font-mono">{formatValue(cell.genome.efficiency * 100, 0)}%</span>
            </div>
          </div>
        </div>

        {/* Lignée */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-1">
            <Users className="w-4 h-4" />
            Lignée
          </h4>

          {parent && (
            <div className="space-y-1">
              <div className="text-xs text-slate-400">Parent</div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs bg-transparent"
                onClick={() => onSelectCell(parent.id)}
              >
                Cellule #{parent.id} (Gen {parent.generation})
              </Button>
            </div>
          )}

          <div className="space-y-1">
            <div className="text-xs text-slate-400">
              Enfants ({children.length}/{cell.totalOffspring} total)
            </div>
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
              <div className="text-xs text-slate-500">Aucun enfant vivant</div>
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
