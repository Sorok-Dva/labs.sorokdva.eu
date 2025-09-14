"use client"

import { useEffect, useMemo, useRef, useState } from "react"

// =============================================================
// Microcosm — Cabinet des curiosités numériques (Vie artificielle)
// React + TypeScript + Tailwind (no semicolons)
// Trails controls + slider tooltips + predator balance (buff) + herd defense (capped)
// =============================================================

// —— Types ——

type Vec2 = { x: number; y: number }

type Genome = {
  hue: number // 0..360
  size: number // px
  maxSpeed: number
  sense: number // px
  efficiency: number // 0..1 (food -> energy)
}

type Cell = {
  id: number
  pos: Vec2
  vel: Vec2
  energy: number
  genome: Genome
  kind: "herbivore" | "predator"
  age: number
  cd?: number // attack cooldown timer for predators
}

type Food = { id: number; pos: Vec2; value: number }

type Toxin = { id: number; pos: Vec2; radius: number; strength: number }

// —— Utils ——

const rand = (a = 0, b = 1) => a + Math.random() * (b - a)
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const dist2 = (a: Vec2, b: Vec2) => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}
const norm = (v: Vec2) => {
  const m = Math.hypot(v.x, v.y) || 1
  return { x: v.x / m, y: v.y / m }
}
const add = (a: Vec2, b: Vec2) => ({ x: a.x + b.x, y: a.y + b.y })
const sub = (a: Vec2, b: Vec2) => ({ x: a.x - b.x, y: a.y - b.y })
const mul = (a: Vec2, s: number) => ({ x: a.x * s, y: a.y * s })

// —— Defaults ——

const DEFAULTS = {
  width: 1200,
  height: 720,
  initialHerbivores: 80,
  initialPredators: 6,
  foodCount: 450,
  foodValue: 12,
  toxinCount: 3,
  trailFade: 0.04, // softer by default
  worldFriction: 0.985,
  metabolism: 0.02,
  reproductionCost: 16,
  splitThreshold: 38,
  mutationRate: 0.06,
  wallBounce: 0.7,
  maxEntitiesCap: 1200,
  // Combat — predator buff + capped herd defense
  predAttackRange: 14, // ↑ range
  predAttackDamage: 20, // ↑ damage
  predAttackCooldown: 10, // ↓ cooldown
  predLifesteal: 0.6, // new: fraction of damage gained as energy
  herdDefenseRange: 26,
  herdDefenseCount: 6,
  herdDefenseDamage: 2, // ↓ base mobbing damage
  herdDefenseMaxStacks: 4, // cap retaliation scaling
}

type Settings = typeof DEFAULTS

type VisSettings = {
  trailsEnabled: boolean
  trailColorMode: "mono" | "byGenome"
}

const PRESETS: Record<string, Partial<Settings> & { label: string; hint: string }> = {
  gentleSoup: {
    label: "Gentle Soup",
    hint: "Équilibre doux, couleurs pastel, émergence lente",
    initialHerbivores: 120,
    initialPredators: 2,
    foodCount: 520,
    trailFade: 0.03,
    mutationRate: 0.04,
    metabolism: 0.017,
  },
  neonNight: {
    label: "Neon Night",
    hint: "Peu de créatures, contrastes forts, mouvements élégants",
    initialHerbivores: 50,
    initialPredators: 10,
    foodCount: 300,
    trailFade: 0.06,
    mutationRate: 0.08,
    metabolism: 0.028,
  },
  predatorChaos: {
    label: "Predator–Prey Chaos",
    hint: "Dynamique proie/prédateur très active",
    initialHerbivores: 100,
    initialPredators: 22,
    foodCount: 420,
    trailFade: 0.05,
    mutationRate: 0.1,
    metabolism: 0.03,
  },
  slowGarden: {
    label: "Slow Garden",
    hint: "Économie d’énergie, reproduction rare, ambiance contemplative",
    initialHerbivores: 90,
    initialPredators: 3,
    foodCount: 600,
    trailFade: 0.02,
    mutationRate: 0.03,
    metabolism: 0.014,
  },
}

// —— LocalStorage Keys ——

const LS_KEY_SETTINGS = "microcosm.settings.v1"
const LS_KEY_PRESET = "microcosm.preset.v1"
const LS_KEY_VIS = "microcosm.vis.v1"

// —— Main Component ——

export default function Microcosm() {
  // Refs
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const hudRef = useRef<HTMLCanvasElement | null>(null)

  const [running, setRunning] = useState(true)
  const [fps, setFps] = useState(0)
  const [presetKey, setPresetKey] = useState<string>(() => {
    if (typeof window === "undefined") return "gentleSoup"
    return localStorage.getItem(LS_KEY_PRESET) || "gentleSoup"
  })
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === "undefined") return { ...DEFAULTS, ...PRESETS["gentleSoup"] }
    const fromLS = localStorage.getItem(LS_KEY_SETTINGS)
    if (fromLS) return JSON.parse(fromLS)
    return { ...DEFAULTS, ...PRESETS["gentleSoup"] }
  })
  const [vis, setVis] = useState<VisSettings>(() => {
    if (typeof window === "undefined") return { trailsEnabled: true, trailColorMode: "byGenome" }
    const from = localStorage.getItem(LS_KEY_VIS)
    return from ? JSON.parse(from) : { trailsEnabled: true, trailColorMode: "byGenome" }
  })
  const [stats, setStats] = useState({ herbs: 0, preds: 0, food: 0 })
  const [pausedOverlay, setPausedOverlay] = useState(false)

  const dpr = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1

  // —— Resize canvas responsively ——
  useEffect(() => {
    const resize = () => {
      const el = containerRef.current
      const cvs = canvasRef.current
      const hud = hudRef.current
      if (!el || !cvs || !hud) return
      const rect = el.getBoundingClientRect()
      cvs.width = Math.floor(rect.width * dpr)
      cvs.height = Math.floor(rect.height * dpr)
      hud.width = cvs.width
      hud.height = cvs.height
      cvs.style.width = rect.width + "px"
      cvs.style.height = rect.height + "px"
      hud.style.width = rect.width + "px"
      hud.style.height = rect.height + "px"
    }
    resize()
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [dpr])

  // —— World State ——
  const worldRef = useRef({
    cells: [] as Cell[],
    food: [] as Food[],
    toxins: [] as Toxin[],
    nextId: 1,
    t: 0,
    lastFpsSample: 0,
    frames: 0,
  })

  // —— Init ——
  useEffect(() => {
    seedWorld()

    // Keyboard shortcuts
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (k === " ") {
        e.preventDefault()
        toggleRun()
      }
      if (k === "r") resetWorld()
      if (k === "s") snapshot()
      if (k === "h") setPausedOverlay((v) => !v)
    }
    window.addEventListener("keydown", onKey)

    // Dev tests (only in dev)
    if (process.env.NODE_ENV !== "production") runDevTests()

    return () => {
      window.removeEventListener("keydown", onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // —— Persist ——
  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem(LS_KEY_SETTINGS, JSON.stringify(settings))
  }, [settings])
  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem(LS_KEY_PRESET, presetKey)
  }, [presetKey])
  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem(LS_KEY_VIS, JSON.stringify(vis))
  }, [vis])

  // —— Main Loop ——
  useEffect(() => {
    let raf = 0
    const loop = () => {
      const c = canvasRef.current
      const hud = hudRef.current
      if (!c || !hud) {
        raf = requestAnimationFrame(loop)
        return
      }
      const ctx = c.getContext("2d")!
      const hctx = hud.getContext("2d")!
      const { width, height } = c

      const world = worldRef.current
      const dt = 1

      // Background / Trails
      ctx.globalCompositeOperation = "source-over"
      if (vis.trailsEnabled) {
        ctx.fillStyle = `rgba(7,9,14,${settings.trailFade})`
        ctx.fillRect(0, 0, width, height)
      } else {
        ctx.fillStyle = "#07090E"
        ctx.fillRect(0, 0, width, height)
      }

      if (running) {
        stepWorld(world, width, height, dt, settings)
        drawWorld(ctx, world, width, height, vis)
      }

      drawHud(hctx, world, width, height, running, fps)

      // FPS
      const now = performance.now()
      world.frames++
      if (world.lastFpsSample === 0) world.lastFpsSample = now
      if (now - world.lastFpsSample > 500) {
        setFps(Math.round((world.frames * 1000) / (now - world.lastFpsSample)))
        world.frames = 0
        world.lastFpsSample = now
      }

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [running, settings, fps, vis])

  // —— Mouse interactions ——
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const onClick = (e: MouseEvent) => {
      const rect = c.getBoundingClientRect()
      const x = (e.clientX - rect.left) * dpr
      const y = (e.clientY - rect.top) * dpr
      if (e.altKey) spawnPredator({ x, y })
      else if (e.shiftKey) spawnToxin({ x, y })
      else dropFoodCluster({ x, y }, 16)
    }
    c.addEventListener("click", onClick)
    return () => c.removeEventListener("click", onClick)
  }, [dpr])

  // —— Helpers (init/reset) ——
  const seedWorld = () => {
    const c = canvasRef.current
    if (!c) return
    const { width, height } = c
    const w = worldRef.current
    w.cells = []
    w.food = []
    w.toxins = []
    w.nextId = 1
    for (let i = 0; i < settings.foodCount; i++) w.food.push(newFood({ x: rand(0, width), y: rand(0, height) }))
    for (let i = 0; i < settings.toxinCount; i++) w.toxins.push(newToxin({ x: rand(0, width), y: rand(0, height) }))
    for (let i = 0; i < settings.initialHerbivores; i++)
      w.cells.push(newCell({ x: rand(0, width), y: rand(0, height) }, "herbivore"))
    for (let i = 0; i < settings.initialPredators; i++)
      w.cells.push(newCell({ x: rand(0, width), y: rand(0, height) }, "predator"))
  }

  const resetWorld = () => {
    seedWorld()
  }
  const toggleRun = () => setRunning((r) => !r)
  const snapshot = () => {
    const c = canvasRef.current
    if (!c) return
    const url = c.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = url
    a.download = `microcosm_${Date.now()}.png`
    a.click()
  }

  // —— World builders ——
  const newGenome = (kind: Cell["kind"]): Genome => {
    if (kind === "herbivore")
      return {
        hue: rand(170, 220),
        size: rand(3, 5),
        maxSpeed: rand(1.2, 2.0),
        sense: rand(22, 48),
        efficiency: rand(0.55, 0.8),
      }
    return {
      hue: rand(0, 20),
      size: rand(4.5, 6.5),
      maxSpeed: rand(1.6, 2.6),
      sense: rand(28, 64),
      efficiency: rand(0.5, 0.7),
    }
  }

  const mutate = (g: Genome, rate: number): Genome => {
    const n = { ...g }
    const jitter = (v: number, amt: number, min: number, max: number) => clamp(v + rand(-amt, amt), min, max)
    if (Math.random() < rate) n.hue = (n.hue + rand(-24, 24) + 360) % 360
    if (Math.random() < rate) n.size = jitter(n.size, 0.6, 2.5, 7)
    if (Math.random() < rate) n.maxSpeed = jitter(n.maxSpeed, 0.4, 0.6, 3.2)
    if (Math.random() < rate) n.sense = jitter(n.sense, 6, 12, 80)
    if (Math.random() < rate) n.efficiency = jitter(n.efficiency, 0.08, 0.3, 0.95)
    return n
  }

  const newCell = (pos: Vec2, kind: Cell["kind"]): Cell => ({
    id: worldRef.current.nextId++,
    pos: { ...pos },
    vel: { x: rand(-1, 1), y: rand(-1, 1) },
    energy: kind === "herbivore" ? rand(14, 26) : rand(18, 32),
    genome: newGenome(kind),
    kind,
    age: 0,
    cd: 0,
  })

  const newFood = (pos: Vec2): Food => ({ id: worldRef.current.nextId++, pos, value: settings.foodValue })
  const newToxin = (pos: Vec2): Toxin => ({
    id: worldRef.current.nextId++,
    pos,
    radius: rand(24, 48),
    strength: rand(0.2, 0.5),
  })

  const spawnPredator = (pos: Vec2) => worldRef.current.cells.push(newCell(pos, "predator"))
  const spawnToxin = (pos: Vec2) => worldRef.current.toxins.push(newToxin(pos))
  const dropFoodCluster = (pos: Vec2, n = 14) => {
    const w = worldRef.current
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2)
      const r = rand(0, 36)
      w.food.push(newFood({ x: pos.x + Math.cos(a) * r, y: pos.y + Math.sin(a) * r }))
    }
  }

  // —— Simulation Step ——
  const stepWorld = (
    world: { cells: Cell[]; food: Food[]; toxins: Toxin[]; nextId: number; t: number },
    width: number,
    height: number,
    dt: number,
    cfg: Settings,
  ) => {
    const wf = cfg.worldFriction

    // Food drift (gentle floating)
    for (const f of world.food) {
      if (Math.random() < 0.02) {
        f.pos.x = clamp(f.pos.x + rand(-1, 1), 0, width)
        f.pos.y = clamp(f.pos.y + rand(-1, 1), 0, height)
      }
    }

    // Cells update
    const newCells: Cell[] = []

    for (let i = 0; i < world.cells.length; i++) {
      const c = world.cells[i]
      c.age += dt
      c.energy -= cfg.metabolism * (c.kind === "predator" ? 1.4 : 1) * dt
      if (c.cd && c.cd > 0) c.cd -= 1

      let acc = { x: 0, y: 0 }

      // Avoid toxins
      for (const t of world.toxins) {
        const d2t = dist2(c.pos, t.pos)
        const r = t.radius + c.genome.size * 2
        if (d2t < r * r) {
          const dir = norm(sub(c.pos, t.pos))
          acc = add(acc, mul(dir, t.strength * 2.2))
          c.energy -= t.strength * 0.02
        }
      }

      if (c.kind === "herbivore") {
        // Seek food
        let best: Food | null = null
        let bestD2 = Number.POSITIVE_INFINITY
        for (let j = 0; j < world.food.length; j++) {
          const f = world.food[j]
          const d2f = dist2(c.pos, f.pos)
          if (d2f < c.genome.sense * c.genome.sense && d2f < bestD2) {
            best = f
            bestD2 = d2f
          }
        }
        if (best) {
          const dir = norm(sub(best.pos, c.pos))
          acc = add(acc, mul(dir, 0.12))
          if (bestD2 < (c.genome.size + 4) * (c.genome.size + 4)) {
            c.energy += best.value * c.genome.efficiency
            const idx = world.food.indexOf(best)
            if (idx >= 0) world.food.splice(idx, 1)
          }
        }
      } else {
        // Predator seeks herbivores
        let best: Cell | null = null
        let bestD2 = Number.POSITIVE_INFINITY
        for (let k = 0; k < world.cells.length; k++) {
          const other = world.cells[k]
          if (other.kind !== "herbivore") continue
          const d2h = dist2(c.pos, other.pos)
          if (d2h < c.genome.sense * c.genome.sense && d2h < bestD2) {
            best = other
            bestD2 = d2h
          }
        }
        if (best) {
          const dir = norm(sub(best.pos, c.pos))
          acc = add(acc, mul(dir, 0.2))
          // Bite when close and off-cooldown
          const bodyRange = c.genome.size + best.genome.size + cfg.predAttackRange
          if (bestD2 < bodyRange * bodyRange && (!c.cd || c.cd <= 0)) {
            best.energy -= cfg.predAttackDamage
            c.energy += cfg.predAttackDamage * cfg.predLifesteal
            c.cd = cfg.predAttackCooldown
          }
          // Herd defense: scaled & capped
          let defenders = 0
          for (const h of world.cells) {
            if (h.kind !== "herbivore") continue
            if (dist2(h.pos, c.pos) < cfg.herdDefenseRange * cfg.herdDefenseRange) defenders++
          }
          if (defenders >= cfg.herdDefenseCount) {
            const stacks = Math.min(cfg.herdDefenseMaxStacks, Math.max(0, defenders - cfg.herdDefenseCount + 1))
            const dmg = cfg.herdDefenseDamage * (1 + stacks)
            c.energy -= dmg
            // stronger repel when mobbing
            acc = add(acc, mul(norm(sub(c.pos, best.pos)), 0.35))
          }
        }
      }

      // Wander
      acc = add(acc, { x: rand(-0.08, 0.08), y: rand(-0.08, 0.08) })

      // Integrate motion
      c.vel = add(c.vel, acc)
      const speed = Math.hypot(c.vel.x, c.vel.y)
      const maxV = c.genome.maxSpeed
      if (speed > maxV) c.vel = mul(norm(c.vel), maxV)
      c.vel = mul(c.vel, wf)
      c.pos = add(c.pos, c.vel)

      // Walls
      if (c.pos.x < 0) {
        c.pos.x = 0
        c.vel.x *= -cfg.wallBounce
      }
      if (c.pos.x > width) {
        c.pos.x = width
        c.vel.x *= -cfg.wallBounce
      }
      if (c.pos.y < 0) {
        c.pos.y = 0
        c.vel.y *= -cfg.wallBounce
      }
      if (c.pos.y > height) {
        c.pos.y = height
        c.vel.y *= -cfg.wallBounce
      }

      // Reproduction by fission
      if (c.energy > cfg.splitThreshold && world.cells.length + newCells.length < cfg.maxEntitiesCap) {
        c.energy -= cfg.reproductionCost
        const child: Cell = {
          id: world.nextId++,
          pos: add(c.pos, { x: rand(-3, 3), y: rand(-3, 3) }),
          vel: mul(norm({ x: rand(-1, 1), y: rand(-1, 1) }), c.genome.maxSpeed * 0.6),
          energy: c.energy * 0.4,
          genome: mutate(c.genome, cfg.mutationRate),
          kind: c.kind,
          age: 0,
        }
        newCells.push(child)
      }

      // Death -> drop food
      if (c.energy <= -8) {
        for (let k = 0; k < rand(2, 6); k++)
          world.food.push(newFood({ x: c.pos.x + rand(-6, 6), y: c.pos.y + rand(-6, 6) }))
        continue
      }

      newCells.push(c)
    }

    world.cells = newCells

    // Gentle food regeneration
    if (world.food.length < cfg.foodCount) {
      if (Math.random() < 0.6) world.food.push(newFood({ x: rand(0, width), y: rand(0, height) }))
    }

    // Update stats
    let herbs = 0,
      preds = 0
    for (const c of world.cells) c.kind === "herbivore" ? herbs++ : preds++
    setStats({ herbs, preds, food: world.food.length })
  }

  // —— Rendering ——
  const drawWorld = (
    ctx: CanvasRenderingContext2D,
    world: { cells: Cell[]; food: Food[]; toxins: Toxin[] },
    width: number,
    height: number,
    vis: VisSettings,
  ) => {
    // Toxins (soft fields)
    for (const t of world.toxins) {
      const grd = ctx.createRadialGradient(t.pos.x, t.pos.y, 0, t.pos.x, t.pos.y, t.radius)
      grd.addColorStop(0, "rgba(255,60,80,0.18)")
      grd.addColorStop(1, "rgba(255,60,80,0.0)")
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(t.pos.x, t.pos.y, t.radius, 0, Math.PI * 2)
      ctx.fill()
    }

    // Food
    ctx.globalCompositeOperation = "lighter"
    for (const f of world.food) {
      ctx.fillStyle = "rgba(140,220,255,0.6)"
      ctx.beginPath()
      ctx.arc(f.pos.x, f.pos.y, 2, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.globalCompositeOperation = "source-over"

    // Cells + trail tint
    for (const c of world.cells) {
      const hue = c.kind === "herbivore" ? c.genome.hue : (c.genome.hue + 330) % 360
      const body = `hsla(${hue}, 90%, 60%, 0.85)`
      const outline = `hsla(${hue}, 90%, 70%, 0.35)`

      // Optional trail color dot
      if (vis.trailsEnabled && vis.trailColorMode === "byGenome") {
        ctx.globalAlpha = 0.25
        ctx.fillStyle = `hsla(${hue}, 90%, 65%, 0.9)`
        ctx.beginPath()
        ctx.arc(c.pos.x, c.pos.y, 1.2, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      // Body with glow
      ctx.shadowColor = body
      ctx.shadowBlur = 6
      ctx.fillStyle = body
      ctx.beginPath()
      ctx.arc(c.pos.x, c.pos.y, c.genome.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Direction indicator
      const dir = norm(c.vel)
      ctx.strokeStyle = outline
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(c.pos.x, c.pos.y)
      ctx.lineTo(c.pos.x + dir.x * (c.genome.size + 5), c.pos.y + dir.y * (c.genome.size + 5))
      ctx.stroke()
    }
  }

  const drawHud = (
    hctx: CanvasRenderingContext2D,
    world: { cells: Cell[]; food: Food[]; toxins: Toxin[] },
    width: number,
    height: number,
    running: boolean,
    fps: number,
  ) => {
    hctx.clearRect(0, 0, width, height)

    const g = hctx.createLinearGradient(0, 0, 0, height)
    g.addColorStop(0, "rgba(0,0,0,0.35)")
    g.addColorStop(0.12, "rgba(0,0,0,0)")
    g.addColorStop(0.88, "rgba(0,0,0,0)")
    g.addColorStop(1, "rgba(0,0,0,0.35)")
    hctx.fillStyle = g
    hctx.fillRect(0, 0, width, height)

    const pad = 10
    const pillW = 280 * dpr
    const pillH = 110 * dpr
    const x = pad * dpr
    const y = pad * dpr
    hctx.fillStyle = "rgba(10,12,18,0.55)"
    roundRect(hctx, x, y, pillW, pillH, 14 * dpr)
    hctx.fill()

    hctx.font = `${14 * dpr}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas`
    hctx.fillStyle = "rgba(220,230,255,0.85)"
    hctx.fillText(`FPS: ${fps}`, x + 14 * dpr, y + 22 * dpr)
    hctx.fillText(`Herbivores: ${stats.herbs}`, x + 14 * dpr, y + 40 * dpr)
    hctx.fillText(`Predators: ${stats.preds}`, x + 14 * dpr, y + 58 * dpr)
    hctx.fillText(`Food: ${stats.food}`, x + 140 * dpr, y + 40 * dpr)
    hctx.fillText(
      `Trails: ${vis.trailsEnabled ? (vis.trailColorMode === "byGenome" ? "colored" : "mono") : "off"}`,
      x + 14 * dpr,
      y + 76 * dpr,
    )
    hctx.fillText(
      `Combat: bite ${DEFAULTS.predAttackDamage} / lifesteal ${(DEFAULTS.predLifesteal * 100) | 0}% / mob x${DEFAULTS.herdDefenseCount}`,
      x + 14 * dpr,
      y + 94 * dpr,
    )

    if (!running && pausedOverlay) {
      hctx.fillStyle = "rgba(0,0,0,0.4)"
      hctx.fillRect(0, 0, width, height)
      hctx.fillStyle = "rgba(255,255,255,0.9)"
      hctx.font = `${28 * dpr}px Inter, system-ui, -apple-system, Segoe UI, Roboto`
      const msg = "Paused — press Space to resume"
      const tw = hctx.measureText(msg).width
      hctx.fillText(msg, width / 2 - tw / 2, height / 2)

      hctx.font = `${14 * dpr}px Inter, system-ui`
      const sub = "Tips: click=food • Shift+click=toxin • Alt+click=predator • R=reset • S=snapshot"
      const tw2 = hctx.measureText(sub).width
      hctx.fillText(sub, width / 2 - tw2 / 2, height / 2 + 26 * dpr)
    }
  }

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }

  // —— UI Controls ——
  const applyPreset = (key: string) => {
    const p = PRESETS[key]
    setPresetKey(key)
    setSettings((s) => ({ ...s, ...p }))
    resetWorld()
  }

  const toggleTrails = () => setVis((v) => ({ ...v, trailsEnabled: !v.trailsEnabled }))
  const toggleTrailMode = () =>
    setVis((v) => ({ ...v, trailColorMode: v.trailColorMode === "byGenome" ? "mono" : "byGenome" }))

  // Helper to render ? tooltips
  const H = {
    mutationRate:
      "Probabilité qu’un enfant mute (couleur, taille, vitesse, sens, efficacité). Plus haut = diversité/chaos, plus bas = lignées stables",
    metabolism:
      "Coût énergétique par tick. Plus haut = créatures affamées, cycles rapides. Plus bas = univers contemplatif",
    trailFade:
      "Opacité du fondu d’arrière-plan. Faible = traînées longues et fluides. Élevé = rendu net (peu de traces)",
    foodCount:
      "Quantité cible de nourriture en circulation. Plus haut = écosystème abondant (explosions de population). Plus bas = pression sélective",
    splitThreshold:
      "Énergie requise pour se diviser (reproduction). Plus haut = reproduction rare, lignées plus robustes",
    reproductionCost: "Coût énergétique de la division. Plus haut = les parents s’épuisent en se reproduisant",
    predAttackDamage: "Dégâts infligés par une morsure de prédateur. Plus haut = proies abattues plus vite",
    predAttackCooldown: "Frames entre deux morsures. Plus bas = attaques plus fréquentes",
    predAttackRange: "Portée de contact pour qu’une morsure connecte (autour des corps)",
    predLifesteal: "Part des dégâts convertie en énergie pour le prédateur (survie en mêlée)",
    herdDefenseCount: "Nombre d’herbivores requis, proches du prédateur, pour déclencher le “mobbing”",
    herdDefenseDamage: "Dégâts par tick infligés au prédateur par le groupe (échelle avec les “stacks”)",
    herdDefenseRange: "Portée à laquelle les herbivores sont comptés comme “défenseurs”",
    herdDefenseMaxStacks: "Nombre maximum de paliers additionnels au-dessus du seuil (limite la létalité en meute)",
  }

  return (
    <div className="w-full h-full min-h-[80vh] grid lg:grid-cols-[1fr_360px] grid-rows-1 bg-[#07090E] text-slate-100">
      {/* Canvas Stage */}
      <div ref={containerRef} className="relative overflow-hidden">
        <canvas ref={canvasRef} className="block" />
        <canvas ref={hudRef} className="pointer-events-none absolute inset-0" />

        {/* Title overlay */}
        <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 text-center z-10 max-w-[90%]">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-200/90 drop-shadow-md">
            Microcosm — Vie artificielle
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300/80 max-w-[60ch] mx-auto leading-snug">
            Un écosystème émergent proie–prédateur, où chaque créature possède un petit génome. Nourrissez, toxifiez,
            dérégulez… et observez.
          </p>
        </div>

        {/* Corner Controls (quick) */}
        <div className="absolute bottom-4 left-4 flex gap-2 z-10">
          <button
            onClick={toggleRun}
            className="px-3 py-2 rounded-xl bg-slate-900/70 hover:bg-slate-900/90 border border-slate-700/50 backdrop-blur text-sm"
          >
            {running ? "Pause" : "Play"} <span className="opacity-60">(Space)</span>
          </button>
          <button
            onClick={resetWorld}
            className="px-3 py-2 rounded-xl bg-slate-900/70 hover:bg-slate-900/90 border border-slate-700/50 backdrop-blur text-sm"
          >
            Reset <span className="opacity-60">(R)</span>
          </button>
          <button
            onClick={snapshot}
            className="px-3 py-2 rounded-xl bg-slate-900/70 hover:bg-slate-900/90 border border-slate-700/50 backdrop-blur text-sm"
          >
            Snapshot <span className="opacity-60">(S)</span>
          </button>
        </div>
      </div>

      {/* Sidebar Controls */}
      <aside className="border-l border-slate-800/70 bg-gradient-to-b from-slate-950/60 to-slate-950/30 backdrop-blur px-4 sm:px-6 py-5 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">Paramètres</h2>
          <p className="text-sm text-slate-400">Ajustez en temps réel. Le monde se rééquilibre tout seul.</p>
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-slate-400">Preset</label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(PRESETS).map(([key, p]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={`px-3 py-1.5 rounded-lg border text-sm ${presetKey === key ? "bg-slate-800/70 border-slate-600" : "bg-slate-900/40 hover:bg-slate-900/70 border-slate-800"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400/80">{PRESETS[presetKey]?.hint}</p>
        </div>

        {/* Sliders with tooltips */}
        <Slider
          label="Mutation rate"
          help={H.mutationRate}
          min={0}
          max={0.3}
          step={0.005}
          value={settings.mutationRate}
          onChange={(v) => setSettings((s) => ({ ...s, mutationRate: v }))}
        />
        <Slider
          label="Metabolism"
          help={H.metabolism}
          min={0.005}
          max={0.06}
          step={0.001}
          value={settings.metabolism}
          onChange={(v) => setSettings((s) => ({ ...s, metabolism: v }))}
        />
        <Slider
          label="Trail fade"
          help={H.trailFade}
          min={0.005}
          max={0.12}
          step={0.002}
          value={settings.trailFade}
          onChange={(v) => setSettings((s) => ({ ...s, trailFade: v }))}
        />
        <Slider
          label="Food target"
          help={H.foodCount}
          min={50}
          max={1000}
          step={10}
          value={settings.foodCount}
          onChange={(v) => setSettings((s) => ({ ...s, foodCount: Math.round(v) }))}
        />
        <Slider
          label="Split threshold"
          help={H.splitThreshold}
          min={12}
          max={80}
          step={1}
          value={settings.splitThreshold}
          onChange={(v) => setSettings((s) => ({ ...s, splitThreshold: Math.round(v) }))}
        />
        <Slider
          label="Reproduction cost"
          help={H.reproductionCost}
          min={4}
          max={40}
          step={1}
          value={settings.reproductionCost}
          onChange={(v) => setSettings((s) => ({ ...s, reproductionCost: Math.round(v) }))}
        />

        {/* Combat tuning */}
        <div className="pt-2 border-t border-slate-800/60">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">Combat</h3>
          <Slider
            label="Bite damage"
            help={H.predAttackDamage}
            min={4}
            max={40}
            step={1}
            value={settings.predAttackDamage}
            onChange={(v) => setSettings((s) => ({ ...s, predAttackDamage: Math.round(v) }))}
          />
          <Slider
            label="Bite cooldown"
            help={H.predAttackCooldown}
            min={4}
            max={40}
            step={1}
            value={settings.predAttackCooldown}
            onChange={(v) => setSettings((s) => ({ ...s, predAttackCooldown: Math.round(v) }))}
          />
          <Slider
            label="Bite range"
            help={H.predAttackRange}
            min={6}
            max={30}
            step={1}
            value={settings.predAttackRange}
            onChange={(v) => setSettings((s) => ({ ...s, predAttackRange: Math.round(v) }))}
          />
          <Slider
            label="Lifesteal"
            help={H.predLifesteal}
            min={0}
            max={1}
            step={0.05}
            value={settings.predLifesteal}
            onChange={(v) => setSettings((s) => ({ ...s, predLifesteal: v }))}
          />
          <Slider
            label="Herd threshold"
            help={H.herdDefenseCount}
            min={2}
            max={20}
            step={1}
            value={settings.herdDefenseCount}
            onChange={(v) => setSettings((s) => ({ ...s, herdDefenseCount: Math.round(v) }))}
          />
          <Slider
            label="Herd damage"
            help={H.herdDefenseDamage}
            min={0}
            max={10}
            step={0.5}
            value={settings.herdDefenseDamage}
            onChange={(v) => setSettings((s) => ({ ...s, herdDefenseDamage: v }))}
          />
          <Slider
            label="Herd range"
            help={H.herdDefenseRange}
            min={10}
            max={80}
            step={1}
            value={settings.herdDefenseRange}
            onChange={(v) => setSettings((s) => ({ ...s, herdDefenseRange: Math.round(v) }))}
          />
          <Slider
            label="Herd max stacks"
            help={H.herdDefenseMaxStacks}
            min={0}
            max={12}
            step={1}
            value={settings.herdDefenseMaxStacks}
            onChange={(v) => setSettings((s) => ({ ...s, herdDefenseMaxStacks: Math.round(v) }))}
          />
        </div>

        {/* Trail options */}
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            onClick={toggleTrails}
            className={`px-3 py-2 rounded-xl border text-sm ${vis.trailsEnabled ? "bg-slate-800/70 border-slate-600" : "bg-slate-900/40 hover:bg-slate-900/70 border-slate-800"}`}
          >
            {vis.trailsEnabled ? "Traînées: ON" : "Traînées: OFF"}
          </button>
          <button
            onClick={toggleTrailMode}
            disabled={!vis.trailsEnabled}
            className={`px-3 py-2 rounded-xl border text-sm ${vis.trailColorMode === "byGenome" ? "bg-emerald-900/30 border-emerald-700/30" : "bg-slate-900/40 border-slate-800"} ${!vis.trailsEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {vis.trailColorMode === "byGenome" ? "Couleur génome" : "Mono"}
          </button>
        </div>

        {/* Actions */}
        <div className="mt-1 grid grid-cols-2 gap-2">
          <button
            onClick={() =>
              dropFoodCluster(
                {
                  x: rand(80, (canvasRef.current?.width || 800) - 80),
                  y: rand(80, (canvasRef.current?.height || 600) - 80),
                },
                28,
              )
            }
            className="px-3 py-2 rounded-xl bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-700/30 text-sm"
          >
            Nourrir ×28
          </button>
          <button
            onClick={() =>
              spawnToxin({
                x: rand(80, (canvasRef.current?.width || 800) - 80),
                y: rand(80, (canvasRef.current?.height || 600) - 80),
              })
            }
            className="px-3 py-2 rounded-xl bg-rose-900/30 hover:bg-rose-900/50 border border-rose-700/30 text-sm"
          >
            Ajouter toxine
          </button>
          <button
            onClick={() =>
              spawnPredator({
                x: rand(80, (canvasRef.current?.width || 800) - 80),
                y: rand(80, (canvasRef.current?.height || 600) - 80),
              })
            }
            className="px-3 py-2 rounded-xl bg-fuchsia-900/30 hover:bg-fuchsia-900/50 border border-fuchsia-700/30 text-sm"
          >
            Ajouter prédateur
          </button>
          <button
            onClick={() => setPausedOverlay((v) => !v)}
            className="px-3 py-2 rounded-xl bg-slate-900/50 hover:bg-slate-900/70 border border-slate-700/40 text-sm"
          >
            Overlay pause (H)
          </button>
        </div>

        {/* Legend */}
        <div className="mt-2 text-xs text-slate-400/90 space-y-1 leading-relaxed">
          <p>
            <span className="text-slate-200">Interactions</span> — Click: nourriture · Shift+Click: toxine · Alt+Click:
            prédateur
          </p>
          <p>
            <span className="text-slate-200">Raccourcis</span> — Space: Play/Pause · R: Reset · S: Snapshot · H: Overlay
          </p>
        </div>

        <div className="mt-auto text-[11px] text-slate-500">Microcosm © Labs — cabinet des curiosités numériques</div>
      </aside>
    </div>
  )
}

// —— Reusable Slider ——

type SliderProps = {
  label: string
  help?: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (v: number) => void
}

function Slider({ label, help, min, max, step = 1, value, onChange }: SliderProps) {
  const id = useMemo(() => `sl_${Math.random().toString(36).slice(2)}`, [])
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm text-slate-200 flex items-center gap-2">
          {label}
          {help && (
            <span className="relative group inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-700/70 text-[11px] leading-none cursor-help select-none">
              ?
              <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 top-6 z-20 w-60 p-2 rounded-md text-xs leading-snug bg-slate-900/95 text-slate-200 border border-slate-700 shadow-xl">
                {help}
              </span>
            </span>
          )}
        </label>
        <span className="text-xs text-slate-400 tabular-nums">
          {typeof value === "number" ? Math.round(value * 100) / 100 : value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number.parseFloat((e.target as HTMLInputElement).value))}
        className="w-full accent-slate-200"
      />
    </div>
  )
}

// —— Dev tests (lightweight) ——
function runDevTests() {
  try {
    console.assert(
      JSON.stringify(add({ x: 1, y: 2 }, { x: 3, y: 4 })) === JSON.stringify({ x: 4, y: 6 }),
      "add() failed",
    )
    console.assert(Math.abs(Math.hypot(...Object.values(norm({ x: 3, y: 4 }))) - 1) < 1e-6, "norm() failed")

    // Eating test
    const testSettings: Settings = { ...DEFAULTS }
    const world = { cells: [] as Cell[], food: [] as Food[], toxins: [] as Toxin[], nextId: 1, t: 0 }
    const herb: Cell = {
      id: 1,
      pos: { x: 100, y: 100 },
      vel: { x: 0, y: 0 },
      energy: 10,
      genome: { hue: 180, size: 4, maxSpeed: 2, sense: 50, efficiency: 0.8 },
      kind: "herbivore",
      age: 0,
    }
    const food: Food = { id: 2, pos: { x: 102, y: 100 }, value: testSettings.foodValue }
    world.cells.push(herb)
    world.food.push(food)

    const d2 = dist2(herb.pos, food.pos)
    if (d2 < (herb.genome.size + 4) * (herb.genome.size + 4)) {
      const before = herb.energy
      herb.energy += food.value * herb.genome.efficiency
      console.assert(herb.energy > before, "herbivore did not gain energy")
    }

    // Predator bite test (damage + lifesteal)
    const pred: Cell = {
      id: 3,
      pos: { x: 110, y: 100 },
      vel: { x: 0, y: 0 },
      energy: 10,
      genome: { hue: 10, size: 5, maxSpeed: 2.2, sense: 60, efficiency: 0.7 },
      kind: "predator",
      age: 0,
      cd: 0,
    }
    const target: Cell = { ...herb, id: 4, pos: { x: 112, y: 100 } }
    const bodyRange = pred.genome.size + target.genome.size + DEFAULTS.predAttackRange
    const within = dist2(pred.pos, target.pos) < bodyRange * bodyRange
    if (within) {
      const beforeT = target.energy
      const beforeP = pred.energy
      target.energy -= DEFAULTS.predAttackDamage
      pred.energy += DEFAULTS.predAttackDamage * DEFAULTS.predLifesteal
      console.assert(target.energy < beforeT, "bite should reduce target energy")
      console.assert(pred.energy > beforeP, "predator should heal via lifesteal")
    }

    // Herd defense test (scaled & capped)
    const defenders = Array.from({ length: DEFAULTS.herdDefenseCount + 3 }, (_, k) => ({
      id: 10 + k,
      pos: { x: 110 + k, y: 100 },
      vel: { x: 0, y: 0 },
      energy: 10,
      genome: { hue: 180, size: 4, maxSpeed: 2, sense: 50, efficiency: 0.8 },
      kind: "herbivore" as const,
      age: 0,
    }))
    const near = defenders.filter(
      (h) => dist2(h.pos, pred.pos) < DEFAULTS.herdDefenseRange * DEFAULTS.herdDefenseRange,
    ).length
    console.assert(near >= DEFAULTS.herdDefenseCount, "test should satisfy herd threshold")

    console.log("%cMicrocosm dev tests passed", "color:#22c55e")
  } catch (err) {
    console.warn("Microcosm dev tests failed", err)
  }
}
