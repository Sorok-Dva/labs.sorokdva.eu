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

