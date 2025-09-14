"use client"

import { useEffect, useRef } from "react"

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Particle system for background
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
    }> = []

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      })
    }

    // Animation loop
    const animate = () => {
      ctx.fillStyle = "rgba(15, 23, 42, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(132, 204, 22, ${particle.opacity})`
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}
      />

      <div className="relative z-10 text-center space-y-8">
        <div className="animate-float">
          <h1 className="text-6xl md:text-8xl font-bold text-balance">
            <span className="text-white animate-glow">Labs</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 mt-4 text-balance">Cabinet des Curiosités Numériques</p>
        </div>

        <div className="space-y-4 text-center max-w-2xl mx-auto px-4">
          <p className="text-lg text-slate-100 text-pretty">
            Explorez des expériences interactives uniques où la technologie rencontre l'art
          </p>
          <p className="text-base text-slate-200 text-pretty">
            Vie artificielle • Art génératif • Illusions visuelles • Simulations poétiques
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => {
              document.getElementById("gallery")?.scrollIntoView({
                behavior: "smooth",
              })
            }}
            className="group px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-300 hover:bg-primary/90 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
          >
            Découvrir les Expériences
            <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
          </button>
        </div>
      </div>
    </section>
  )
}
