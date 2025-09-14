"use client"

import Link from "next/link"

const highlights = [
  {
    title: "Art & Code",
    description: "Des interfaces sensibles pensées pour l'expérimentation interactive.",
    accent: "from-purple-500/50 via-indigo-400/40 to-emerald-400/40",
  },
  {
    title: "Rituels Numériques",
    description: "Vie artificielle, illusions perceptives et scénarios génératifs cohabitent dans ce cabinet de curiosités.",
    accent: "from-sky-400/40 via-fuchsia-500/30 to-blue-500/40",
  },
  {
    title: "Cartographie expérimentale",
    description: "Une esthétique cosmique cohérente guide chaque expérience immersive.",
    accent: "from-purple-500/40 via-slate-900/40 to-emerald-400/30",
  },
]

export function HeroSection() {
  const scrollToGallery = () => {
    document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(76,29,149,0.35),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(6,182,212,0.25),transparent_60%)]" />
        <div className="absolute -top-48 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full blur-3xl bg-gradient-to-br from-purple-500/40 via-indigo-500/30 to-emerald-400/30" />
        <div className="absolute -bottom-40 right-[-10%] h-[28rem] w-[28rem] rounded-full blur-3xl bg-gradient-to-br from-emerald-400/25 via-blue-500/25 to-purple-500/25" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(2,6,23,0.82),rgba(15,23,42,0.72),rgba(2,6,23,0.9))]" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col">
        <header className="px-6 pt-10">
          <div className="mx-auto w-full max-w-6xl">
            <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-6 py-4 shadow-lg shadow-purple-500/10 backdrop-blur">
              <span className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-200">
                Sorokdva Labs
              </span>
              <div className="flex items-center gap-4 text-sm text-slate-200">
                <Link
                  href="https://sorokdva.eu"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-medium leading-none text-slate-100 transition hover:border-purple-400/40 hover:bg-purple-500/20"
                >
                  Portfolio principal
                </Link>
                <button
                  type="button"
                  onClick={scrollToGallery}
                  className="rounded-full border border-white/10 px-4 py-2 font-medium leading-none text-slate-200 transition hover:border-emerald-300/40 hover:bg-emerald-400/10"
                >
                  Explorer les labs
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 items-center">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24 pt-12 md:flex-row md:items-center">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-purple-100">
                Cabinet des Curiosités Numériques
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl md:text-6xl">
                <span className="block text-transparent bg-clip-text bg-gradient-to-br from-purple-200 via-sky-200 to-emerald-200">
                  Expériences exploratoires
                </span>
                <span className="mt-3 block text-slate-100/90">où l&apos;expérimentation interactive prend vie.</span>
              </h1>
              <p className="max-w-xl text-lg text-slate-200/90">
                Dans ces labs, j&apos;explore une esthétique cosmique transformée en terrains de jeux vivants : prototypes
                immersifs, art génératif, simulations sensibles et narrations augmentées.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={scrollToGallery}
                  className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:shadow-lg hover:shadow-purple-500/30"
                >
                  Découvrir les expériences
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </button>
              </div>

              <div className="grid gap-4 pt-4 sm:grid-cols-3">
                {highlights.map((item) => (
                  <div
                    key={item.title}
                    className={`rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left text-sm text-slate-200 shadow-inner shadow-slate-900/60 backdrop-blur transition hover:border-purple-300/40 hover:shadow-purple-500/20`}
                  >
                    <div className={`mb-3 h-1 w-16 rounded-full bg-gradient-to-r ${item.accent}`} />
                    <h3 className="text-sm font-semibold text-slate-100">{item.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300/80">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-purple-500/20 backdrop-blur-lg">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(129,140,248,0.25),transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(45,212,191,0.2),transparent_55%)]" />
                <div className="relative flex flex-col gap-4 text-sm text-slate-200">
                  <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
                    Cartographie du lab
                  </span>
                  <p className="text-base text-slate-100">
                    Chaque expérience est une piste de recherche créative qui préfigure les prochaines explorations
                    numériques. Ce laboratoire revendique des codes visuels cohérents tout en osant des formats
                    interactifs inédits.
                  </p>
                  <div className="mt-4 grid gap-3 text-xs text-slate-200/90">
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <span className="font-medium text-slate-100">Vie artificielle</span>
                      <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-[11px] font-semibold text-emerald-200">
                        Actif
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <span className="font-medium text-slate-100">Simulations immersives</span>
                      <span className="rounded-full bg-purple-500/20 px-3 py-1 text-[11px] font-semibold text-purple-200">
                        En construction
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <span className="font-medium text-slate-100">Art génératif</span>
                      <span className="rounded-full bg-sky-500/20 px-3 py-1 text-[11px] font-semibold text-sky-200">
                        Explorations
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
