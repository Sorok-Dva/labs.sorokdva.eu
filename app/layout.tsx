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
