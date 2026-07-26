import type React from "react"
import type { Metadata } from "next"
import { Inter_Tight, Space_Grotesk, Space_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { I18nProvider } from "@/components/i18n/I18nProvider"
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher"

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "SorokDva Labs — Cabinet de curiosités numériques",
  description:
    "Un cabinet de curiosités numériques qui rassemble des expériences web interactives, des simulations et des visualisations à explorer dans le navigateur.",
  keywords: [
    "expériences web",
    "expériences interactives",
    "simulations",
    "visualisations",
    "cabinet de curiosités numériques",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body
        className={`${interTight.variable} ${spaceGrotesk.variable} ${spaceMono.variable} font-sans antialiased`}
      >
        <I18nProvider>
          <LanguageSwitcher />
          <Suspense fallback={null}>{children}</Suspense>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  )
}
