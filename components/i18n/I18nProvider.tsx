"use client"

import React from "react"

type Lang = "en" | "fr"
type Dict = Record<string, any>

// Import namespaces here
import microcosm_en from "@/locales/en/microcosm.json"
import microcosm_fr from "@/locales/fr/microcosm.json"
import swarm_en from "@/locales/en/swarm.json"
import swarm_fr from "@/locales/fr/swarm.json"

const DICTS: Record<Lang, Record<string, Dict>> = {
  en: { microcosm: microcosm_en, swarm: swarm_en },
  fr: { microcosm: microcosm_fr, swarm: swarm_fr },
}

function get(obj: Dict, path: string): any {
  return path.split(".").reduce((o, k) => (o && k in o ? o[k] : undefined), obj)
}

export interface I18nContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string, fallback?: string) => string
}

export const I18nContext = React.createContext<I18nContextValue | undefined>(undefined)

export function I18nProvider({ children, defaultLang = "fr" as Lang }: { children: React.ReactNode; defaultLang?: Lang }) {
  const [lang, setLangState] = React.useState<Lang>(defaultLang)

  React.useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem("lang") as Lang | null) : null
    if (stored === "en" || stored === "fr") setLangState(stored)
  }, [])

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem("lang", l)
    } catch {}
  }, [])

  const t = React.useCallback(
    (key: string, fallback?: string) => {
      // key format: "namespace.path.to.key" e.g. "microcosm.header.title"
      const [ns, ...rest] = key.split(".")
      const path = rest.join(".")
      const dicts = DICTS[lang] || DICTS.fr
      const src = dicts[ns]
      if (!src) return fallback ?? key
      const v = get(src, path)
      if (typeof v === "string") return v
      return fallback ?? key
    },
    [lang],
  )

  const value: I18nContextValue = { lang, setLang, t }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = React.useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}
