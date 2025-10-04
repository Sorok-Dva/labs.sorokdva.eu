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
      <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-3 shadow-[0_20px_60px_rgba(99,102,241,0.25)] backdrop-blur-xl">
        <div className="flex gap-2">
          <button
            onClick={() => handleAction("food")}
            className="group flex h-12 w-12 items-center justify-center rounded-xl border border-transparent bg-white/10 transition-all duration-200 hover:border-emerald-400/40 hover:bg-emerald-400/15"
            title={t ? t('microcosm.menu.feed','Nourrir (Ctrl+clic)') : 'Nourrir (Ctrl+clic)'}
          >
            <Droplets className="h-5 w-5 text-emerald-300 group-hover:text-emerald-200" />
          </button>

          <button
            onClick={() => handleAction("toxin")}
            className="group flex h-12 w-12 items-center justify-center rounded-xl border border-transparent bg-white/10 transition-all duration-200 hover:border-rose-400/40 hover:bg-rose-500/15"
            title={t ? t('microcosm.menu.toxin','Empoisonner (Shift+clic)') : 'Empoisonner (Shift+clic)'}
          >
            <Skull className="h-5 w-5 text-rose-300 group-hover:text-rose-200" />
          </button>

          <button
            onClick={() => handleAction("predator")}
            className="group flex h-12 w-12 items-center justify-center rounded-xl border border-transparent bg-white/10 transition-all duration-200 hover:border-amber-400/40 hover:bg-amber-500/15"
            title={t ? t('microcosm.menu.predator','Prédateur (Alt+clic)') : 'Prédateur (Alt+clic)'}
          >
            <Zap className="h-5 w-5 text-amber-300 group-hover:text-amber-200" />
          </button>
        </div>
      </div>
    </div>
  )
}
