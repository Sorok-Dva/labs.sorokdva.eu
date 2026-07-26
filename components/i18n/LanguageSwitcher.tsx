"use client"

import { usePathname } from "next/navigation"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useI18n } from "./I18nProvider"

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n()
  const pathname = usePathname()
  const isHome = pathname === "/"

  return (
    <ToggleGroup
      type="single"
      value={lang}
      onValueChange={(value) => {
        if (value === "fr" || value === "en") setLang(value)
      }}
      variant="outline"
      size="sm"
      aria-label="Langue"
      className={isHome ? "language-switcher language-switcher--home" : "language-switcher"}
    >
      <ToggleGroupItem value="fr" aria-label="Français">
        FR
      </ToggleGroupItem>
      <ToggleGroupItem value="en" aria-label="English">
        EN
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
