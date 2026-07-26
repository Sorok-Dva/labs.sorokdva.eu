# Shared layouts

## `app/layout.tsx`

Root App Router layout. It installs Geist fonts, global tokens, analytics, the i18n provider, and the fixed language switcher on every route.

```tsx
import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { I18nProvider } from "@/components/i18n/I18nProvider"
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher"

export const metadata: Metadata = {
  title: "SorokDva Labs - Cabinet des Curiosités Numériques",
  description:
    "Explorez des expériences interactives uniques : vie artificielle, art génératif, illusions visuelles et simulations poétiques.",
  generator: "v0.app",
  keywords: ["art génératif", "vie artificielle", "expériences interactives", "cabinet curiosités", "labs"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <I18nProvider>
          <LanguageSwitcher />
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  )
}
```

## `components/i18n/I18nProvider.tsx`

Global locale state. The current homepage copy is hardcoded in French, while Microcosm reads this provider.

```tsx
"use client"

import React from "react"

type Lang = "en" | "fr"
type Dict = Record<string, any>

import microcosm_en from "@/locales/en/microcosm.json"
import microcosm_fr from "@/locales/fr/microcosm.json"

const DICTS: Record<Lang, Record<string, Dict>> = {
  en: { microcosm: microcosm_en },
  fr: { microcosm: microcosm_fr },
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
```

## `components/i18n/LanguageSwitcher.tsx`

Fixed FR/EN control rendered on every route.

```tsx
"use client"

import { useI18n } from "./I18nProvider"

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n()
  return (
    <div className="fixed top-2 right-2 z-50 flex gap-2 bg-slate-900/70 border border-slate-700 rounded-md p-1">
      <button
        onClick={() => setLang("fr")}
        className={`px-2 py-1 rounded text-xs ${lang === "fr" ? "bg-slate-700 text-white" : "text-slate-300"}`}
      >
        FR
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-2 py-1 rounded text-xs ${lang === "en" ? "bg-slate-700 text-white" : "text-slate-300"}`}
      >
        EN
      </button>
    </div>
  )
}
```
