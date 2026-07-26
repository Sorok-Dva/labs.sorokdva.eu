"use client"

import Link from "next/link"

import { Separator } from "@/components/ui/separator"
import { useI18n } from "@/components/i18n/I18nProvider"

const navigation = {
  fr: {
    experiences: "Expériences",
    about: "À propos",
    portfolio: "Portfolio",
  },
  en: {
    experiences: "Experiences",
    about: "About",
    portfolio: "Portfolio",
  },
} as const

export function SiteHeader() {
  const { lang } = useI18n()
  const copy = navigation[lang]

  return (
    <header className="site-header">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
        <Link
          href="#top"
          className="flex items-center gap-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Sorok-Dva Labs — accueil"
        >
          <span className="font-display text-xl font-semibold tracking-tighter text-primary">
            [42]
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span className="font-display text-[0.68rem] uppercase tracking-[0.2em] text-foreground">
            Sorok-Dva / Labs
          </span>
        </Link>

        <nav className="hidden items-center gap-8 pr-20 md:flex" aria-label="Navigation principale">
          <Link className="site-nav-link" href="#catalogue">
            {copy.experiences}
          </Link>
          <Link className="site-nav-link" href="#about">
            {copy.about}
          </Link>
          <Link className="site-nav-link" href="https://sorok-dva.eu">
            {copy.portfolio}
          </Link>
        </nav>
      </div>
    </header>
  )
}
