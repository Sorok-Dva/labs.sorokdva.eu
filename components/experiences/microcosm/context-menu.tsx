"use client"

import { useState, useEffect } from "react"
import { Droplets, Skull, Zap } from "lucide-react"

interface ContextMenuProps {
  position: { x: number; y: number }
  onAction: (action: "food" | "toxin" | "predator") => void
  onClose: () => void
  t?: (k: string, fallback?: string) => string
}

export function ContextMenu({ position, onAction, onClose, t }: ContextMenuProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(".context-menu")) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

  const handleAction = (action: "food" | "toxin" | "predator") => {
    onAction(action)
    onClose()
  }

  return (
    <div
      className={`context-menu fixed z-50 transition-all duration-200 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-lg shadow-2xl p-2">
        <div className="flex gap-1">
          <button
            onClick={() => handleAction("food")}
            className="group flex items-center justify-center w-12 h-12 rounded-lg bg-slate-700/50 hover:bg-cyan-500/20 hover:border-cyan-400/50 border border-transparent transition-all duration-200"
            title={t ? t('microcosm.menu.feed','Nourrir (Ctrl+clic)') : 'Nourrir (Ctrl+clic)'}
          >
            <Droplets className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
          </button>

          <button
            onClick={() => handleAction("toxin")}
            className="group flex items-center justify-center w-12 h-12 rounded-lg bg-slate-700/50 hover:bg-red-500/20 hover:border-red-400/50 border border-transparent transition-all duration-200"
            title={t ? t('microcosm.menu.toxin','Empoisonner (Shift+clic)') : 'Empoisonner (Shift+clic)'}
          >
            <Skull className="w-5 h-5 text-red-400 group-hover:text-red-300" />
          </button>

          <button
            onClick={() => handleAction("predator")}
            className="group flex items-center justify-center w-12 h-12 rounded-lg bg-slate-700/50 hover:bg-orange-500/20 hover:border-orange-400/50 border border-transparent transition-all duration-200"
            title={t ? t('microcosm.menu.predator','Prédateur (Alt+clic)') : 'Prédateur (Alt+clic)'}
          >
            <Zap className="w-5 h-5 text-orange-400 group-hover:text-orange-300" />
          </button>
        </div>
      </div>
    </div>
  )
}
