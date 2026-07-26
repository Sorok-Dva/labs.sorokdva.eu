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
      <div className="microcosm-context-menu">
        <div className="flex gap-2">
          <button
            onClick={() => handleAction("food")}
            className="microcosm-context-menu__button"
            data-tone="ion"
            title={t ? t('microcosm.menu.feed','Nourrir (Ctrl+clic)') : 'Nourrir (Ctrl+clic)'}
          >
            <Droplets className="h-5 w-5" />
          </button>

          <button
            onClick={() => handleAction("toxin")}
            className="microcosm-context-menu__button"
            data-tone="ember"
            title={t ? t('microcosm.menu.toxin','Empoisonner (Shift+clic)') : 'Empoisonner (Shift+clic)'}
          >
            <Skull className="h-5 w-5" />
          </button>

          <button
            onClick={() => handleAction("predator")}
            className="microcosm-context-menu__button"
            data-tone="sun"
            title={t ? t('microcosm.menu.predator','Prédateur (Alt+clic)') : 'Prédateur (Alt+clic)'}
          >
            <Zap className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
