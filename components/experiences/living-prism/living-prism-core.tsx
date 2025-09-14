"use client"

import { useEffect, useRef, useState } from "react"

// ===================== Types & Utils =====================

type Vec2 = { x: number; y: number }

type Drone = {
  id: number
  pos: Vec2
  vel: Vec2
  angle: number
  color: string
  baseHue: number
  state: "free" | "leader" | "following"
  trail: Vec2[]
}

type Bounds = { x: number; y: number; w: number; h: number }

type Formation = "default" | "compact" | "line" | "spiral"

const rand = (a = 0, b = 1) => Math.random() * (b - a) + a
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y })
const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y })
const mul = (a: Vec2, s: number): Vec2 => ({ x: a.x * s, y: a.y * s })
const len = (v: Vec2) => Math.hypot(v.x, v.y)
const norm = (v: Vec2): Vec2 => {
  const l = len(v)
  return l === 0 ? { x: 0, y: 0 } : { x: v.x / l, y: v.y / l }
}
const limit = (v: Vec2, max: number): Vec2 => {
  const l = len(v)
  return l > max ? mul(norm(v), max) : v
}
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const hsl = (h: number, s: number, l: number, a = 1) =>
  `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`

// Palette base (cyan, magenta, ambre, blanc chaud)
const BASE_HUES = [190, 310, 35, 48]

// ===================== Spatial Index (Quadtree) =====================

class QuadTree {
  bounds: Bounds
  capacity: number
  points: { x: number; y: number; i: number }[] = []
  divided = false
  ne?: QuadTree
  nw?: QuadTree
  se?: QuadTree
  sw?: QuadTree

  constructor(bounds: Bounds, capacity = 8) {
    this.bounds = bounds
    this.capacity = capacity
  }

  contains(x: number, y: number) {
    return (
      x >= this.bounds.x && x < this.bounds.x + this.bounds.w && y >= this.bounds.y && y < this.bounds.y + this.bounds.h
    )
  }

  subdivide() {
    const { x, y, w, h } = this.bounds
    const hw = w / 2,
      hh = h / 2
    this.ne = new QuadTree({ x: x + hw, y, w: hw, h: hh }, this.capacity)
    this.nw = new QuadTree({ x, y, w: hw, h: hh }, this.capacity)
    this.se = new QuadTree({ x: x + hw, y: y + hh, w: hw, h: hh }, this.capacity)
    this.sw = new QuadTree({ x, y: y + hh, w: hw, h: hh }, this.capacity)
    this.divided = true
  }

  insert(x: number, y: number, i: number) {
    if (!this.contains(x, y)) return false
    if (this.points.length < this.capacity) {
      this.points.push({ x, y, i })
      return true
    }
    if (!this.divided) this.subdivide()
    return this.ne!.insert(x, y, i) || this.nw!.insert(x, y, i) || this.se!.insert(x, y, i) || this.sw!.insert(x, y, i)
  }

  queryCircle(cx: number, cy: number, r: number, out: number[]) {
    const { x, y, w, h } = this.bounds
    const dx = Math.max(x - cx, 0, cx - (x + w))
    const dy = Math.max(y - cy, 0, cy - (y + h))
    if (dx * dx + dy * dy > r * r) return out
    for (const p of this.points) {
      const ddx = p.x - cx
      const ddy = p.y - cy
      if (ddx * ddx + ddy * ddy <= r * r) out.push(p.i)
    }
    if (this.divided) {
      this.ne!.queryCircle(cx, cy, r, out)
      this.nw!.queryCircle(cx, cy, r, out)
      this.se!.queryCircle(cx, cy, r, out)
      this.sw!.queryCircle(cx, cy, r, out)
    }
    return out
  }
}

// ===================== Audio Engine (Web Audio) =====================

type AudioStuff = {
  ctx: AudioContext
  master: GainNode
  noise: AudioBufferSourceNode
  noiseGain: GainNode
}

const useAudio = () => {
  const ref = useRef<AudioStuff | null>(null)

  const init = () => {
    if (ref.current) return ref.current
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
    const ctx: AudioContext = new Ctx()
    const master = ctx.createGain()
    master.gain.value = 0.18
    master.connect(ctx.destination)

    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.2
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer
    noise.loop = true
    const noiseGain = ctx.createGain()
    noiseGain.gain.value = 0.03
    noise.connect(noiseGain)
    noiseGain.connect(master)
    noise.start()

    ref.current = { ctx, master, noise, noiseGain }
    return ref.current
  }

  const triggerGrain = (x01: number, y01: number, density: number, attract: boolean) => {
    if (!ref.current) return
    const { ctx, master } = ref.current
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const Stereo = (ctx as any).createStereoPanner ? (ctx as any).createStereoPanner() : null

    const base = attract ? 140 : 320
    const freq = base + density * (attract ? 220 : 420)
    osc.frequency.value = freq
    osc.type = "sine"

    const now = ctx.currentTime
    const dur = 0.08 + Math.random() * 0.06
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.08 + density * 0.12, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur)

    if (Stereo) {
      Stereo.pan.value = clamp(x01 * 2 - 1, -1, 1)
      osc.connect(gain)
      gain.connect(Stereo)
      Stereo.connect(master)
    } else {
      osc.connect(gain)
      gain.connect(master)
    }

    osc.start(now)
    osc.stop(now + dur)
  }

  const setNoiseLevel = (v: number) => {
    if (!ref.current) return
    ref.current.noiseGain.gain.value = clamp(v, 0, 0.1)
  }

  return { ref, init, triggerGrain, setNoiseLevel }
}

// ===================== Component =====================

export default function DroneSwarmFullExperience() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const drones = useRef<Drone[]>([])
  const leader = useRef<number | null>(null)
  const repulsive = useRef(false)
  const influenceRadius = useRef(140)
  const dragging = useRef(false)
  const mouse = useRef<Vec2 | null>(null)
  const paused = useRef(false)
  const formation = useRef<Formation>("default")
  const lastActivity = useRef<number>(performance.now())
  const autopilot = useRef(false)
  const targetCount = useRef(130)

  const [showHelp, setShowHelp] = useState(true)

  const { init: initAudio, triggerGrain, setNoiseLevel } = useAudio()

  const markActivity = () => {
    lastActivity.current = performance.now()
    if (autopilot.current) autopilot.current = false
  }

  const addDrone = () => {
    const canvas = canvasRef.current!
    const hue = BASE_HUES[Math.floor(rand(0, BASE_HUES.length))]
    const d: Drone = {
      id: drones.current.length,
      pos: { x: rand(0, canvas.width), y: rand(0, canvas.height) },
      vel: { x: rand(-1, 1), y: rand(-1, 1) },
      angle: 0,
      color: hsl(hue, 80, 65),
      baseHue: hue,
      state: "free",
      trail: [],
    }
    drones.current.push(d)
  }

  useEffect(() => {
    const canvas = canvasRef.current!
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()

    drones.current = []
    const startCount = 8
    for (let i = 0; i < startCount; i++) addDrone()

    const getMouse = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }

    const onMove = (e: MouseEvent) => {
      mouse.current = getMouse(e)
      markActivity()
    }
    const onDown = () => {
      dragging.current = true
      markActivity()
    }
    const onUp = () => {
      dragging.current = false
      markActivity()
    }
    const onClick = (e: MouseEvent) => {
      const p = getMouse(e)
      let found: number | null = null
      for (let i = drones.current.length - 1; i >= 0; i--) {
        if (Math.hypot(drones.current[i].pos.x - p.x, drones.current[i].pos.y - p.y) < 18) {
          found = i
          break
        }
      }
      leader.current = found
      drones.current.forEach((d, i) => (d.state = i === found ? "leader" : "free"))
      initAudio()?.ctx.resume()
      markActivity()
    }
    const onWheel = (e: WheelEvent) => {
      influenceRadius.current = clamp(influenceRadius.current + (e.deltaY > 0 ? -10 : 10), 40, 320)
      markActivity()
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") paused.current = !paused.current
      if (e.key.toLowerCase() === "h") setShowHelp((v) => !v)
      if (e.key === "Enter") leader.current = null
      if (e.key === " ") repulsive.current = !repulsive.current
      if (e.key === "ArrowLeft") formation.current = "compact"
      if (e.key === "ArrowUp") formation.current = "line"
      if (e.key === "ArrowRight") formation.current = "spiral"
      if (e.key === "ArrowDown") formation.current = "default"
      markActivity()
    }

    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mousedown", onDown)
    window.addEventListener("mouseup", onUp)
    window.addEventListener("click", onClick)
    window.addEventListener("wheel", onWheel, { passive: true })
    window.addEventListener("keydown", onKey)

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mousedown", onDown)
      window.removeEventListener("mouseup", onUp)
      window.removeEventListener("click", onClick)
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("keydown", onKey)
    }
  }, [])

  // ===================== Simulation Loop =====================

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!

    let last = performance.now()
    let acc = 0
    const fixedDt = 1000 / 60

    const loop = () => {
      const now = performance.now()
      let dt = now - last
      last = now
      dt = Math.min(dt, 50)
      acc += dt

      if (now - lastActivity.current > 12000) autopilot.current = true

      while (acc >= fixedDt) {
        step(canvas, fixedDt / 1000)
        acc -= fixedDt
      }

      draw(ctx, canvas)
      requestAnimationFrame(loop)
    }

    requestAnimationFrame(loop)
  }, [])

  const step = (canvas: HTMLCanvasElement, dt: number) => {
    if (paused.current) return

    if (drones.current.length < targetCount.current && Math.random() < 0.2) addDrone()

    const qt = new QuadTree({ x: 0, y: 0, w: canvas.width, h: canvas.height }, 6)
    drones.current.forEach((d, i) => qt.insert(d.pos.x, d.pos.y, i))

    const maxSpeed = 160
    const neighR = 70
    const sepR = 22

    let cx = 0,
      cy = 0
    for (const d of drones.current) {
      cx += d.pos.x
      cy += d.pos.y
    }
    cx /= drones.current.length
    cy /= drones.current.length

    drones.current.forEach((d, i) => {
      let v = d.vel
      let p = d.pos
      let force = { x: 0, y: 0 }

      const idx: number[] = []
      qt.queryCircle(p.x, p.y, neighR, idx)

      let align = { x: 0, y: 0 }
      let cohesion = { x: 0, y: 0 }
      let separation = { x: 0, y: 0 }
      let count = 0

      for (const j of idx) {
        if (j === i) continue
        const o = drones.current[j]
        const diff = sub(o.pos, p)
        const dist = len(diff)
        if (dist < neighR) {
          align = add(align, o.vel)
          cohesion = add(cohesion, o.pos)
          count++
          if (dist < sepR) separation = sub(separation, diff)
        }
      }

      const wAlign = 0.8
      const wCoh = 0.55
      const wSep = 1.4
      const wJitter = 30

      if (count > 0) {
        align = norm(align)
        cohesion = norm(sub(mul(cohesion, 1 / count), p))
        separation = norm(separation)
        force = add(force, mul(align, wAlign))
        force = add(force, mul(cohesion, wCoh))
        force = add(force, mul(separation, wSep))
      }

      // leader guided by mouse only while dragging (conforme à la spec)
      if (leader.current === i && mouse.current && dragging.current) {
        const dir = sub(mouse.current, p)
        const dist = len(dir)
        const k = mix(220, 520, clamp(dist / 200, 0, 1))
        force = add(force, mul(norm(dir), k))
      }

      // leader influence on others within radius
      if (leader.current !== null && leader.current !== i) {
        const L = drones.current[leader.current]
        const diff = sub(L.pos, p)
        const dist = Math.max(1, len(diff))
        if (dist < influenceRadius.current) {
          const sgn = repulsive.current ? -1 : 1
          const k = mix(90, 220, 1 - dist / influenceRadius.current)
          force = add(force, mul(norm(diff), sgn * k))
          if (d.state !== "leader") d.state = "following"

          const density = clamp(count / 12, 0, 1)
          if (Math.random() < 0.02 + density * 0.08)
            triggerGrain(p.x / canvas.width, p.y / canvas.height, density, !repulsive.current)
        } else {
          if (d.state !== "leader") d.state = "free"
        }
      }

      // formations & autopilot fields
      if (autopilot.current || formation.current !== "default") {
        if (formation.current === "line") {
          const flow = { x: 120, y: Math.sin(p.y * 0.01 + performance.now() * 0.001) * 30 }
          force = add(force, flow)
        } else if (formation.current === "spiral") {
          const toC = sub({ x: cx, y: cy }, p)
          const tang = { x: -toC.y, y: toC.x }
          force = add(force, mul(norm(tang), 200))
          force = add(force, mul(norm(toC), 40))
        } else if (formation.current === "compact") {
          const toC = norm(sub({ x: cx, y: cy }, p))
          force = add(force, mul(toC, 180))
        }
      }

      // jitter and anti-saturation dispersion
      force = add(force, { x: (Math.random() - 0.5) * wJitter, y: (Math.random() - 0.5) * wJitter })
      if (count > 16) {
        const away = norm(sub(p, { x: cx, y: cy }))
        force = add(force, mul(away, 280))
      }

      v = add(v, mul(force, dt))
      v = limit(v, maxSpeed)
      p = add(p, mul(v, dt))

      if (p.x < 0) p.x = canvas.width
      if (p.y < 0) p.y = canvas.height
      if (p.x > canvas.width) p.x = 0
      if (p.y > canvas.height) p.y = 0

      d.angle = Math.atan2(v.y, v.x)
      d.trail.push({ x: p.x, y: p.y })
      if (d.trail.length > 12) d.trail.shift()

      const hueShift = d.state === "leader" ? 20 : d.state === "following" ? 10 : 0
      const light = d.state === "leader" ? 65 : d.state === "following" ? 70 : 60
      d.color = hsl(d.baseHue + hueShift + (repulsive.current ? 10 : 0), 80, light)

      d.vel = v
      d.pos = p
    })

    if (autopilot.current) {
      const t = Math.floor((performance.now() / 4000) % 3)
      formation.current = t === 0 ? "spiral" : t === 1 ? "line" : "compact"
      setNoiseLevel(0.05 + 0.02 * t)
    } else {
      setNoiseLevel(0.03)
    }
  }

  const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.fillStyle = "rgba(2,10,22,0.18)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const g = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.5,
      Math.min(canvas.width, canvas.height) * 0.1,
      canvas.width * 0.5,
      canvas.height * 0.5,
      Math.max(canvas.width, canvas.height) * 0.7,
    )
    g.addColorStop(0, "rgba(10,20,40,0.08)")
    g.addColorStop(1, "rgba(0,0,0,0.12)")
    ctx.fillStyle = g
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    let haloPos: Vec2 | null = null
    if (leader.current !== null) haloPos = drones.current[leader.current].pos
    else if (drones.current.length > 0) {
      let cx = 0,
        cy = 0
      for (const d of drones.current) {
        cx += d.pos.x
        cy += d.pos.y
      }
      haloPos = { x: cx / drones.current.length, y: cy / drones.current.length }
    }
    if (haloPos) {
      const halo = ctx.createRadialGradient(haloPos.x, haloPos.y, 10, haloPos.x, haloPos.y, 160)
      halo.addColorStop(0, repulsive.current ? "rgba(255,70,70,0.10)" : "rgba(80,180,255,0.10)")
      halo.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(haloPos.x, haloPos.y, 160, 0, Math.PI * 2)
      ctx.fill()
    }

    for (const d of drones.current) {
      if (d.trail.length > 1) {
        ctx.beginPath()
        ctx.moveTo(d.trail[0].x, d.trail[0].y)
        for (let i = 1; i < d.trail.length; i++) ctx.lineTo(d.trail[i].x, d.trail[i].y)
        ctx.strokeStyle = hsl(d.baseHue, 90, 70, 0.18)
        ctx.lineWidth = 1.2
        ctx.stroke()
      }

      ctx.save()
      ctx.translate(d.pos.x, d.pos.y)
      ctx.rotate(d.angle)
      ctx.beginPath()
      ctx.moveTo(12, 0)
      ctx.lineTo(-7, 5)
      ctx.lineTo(-7, -5)
      ctx.closePath()
      ctx.fillStyle = d.state === "leader" ? hsl(35, 100, 60) : d.color
      ctx.shadowBlur = d.state === "leader" ? 22 : 14
      ctx.shadowColor = d.state === "leader" ? hsl(35, 100, 60) : d.color
      ctx.fill()
      ctx.restore()
    }
  }

  return (
    <div className="relative w-screen h-screen">
      <canvas ref={canvasRef} className="absolute inset-0 block" />

      <div className="pointer-events-none absolute left-4 bottom-4 text-xs text-slate-300/80 select-none">
        <div className="backdrop-blur-sm bg-slate-900/30 rounded-xl px-3 py-2 leading-relaxed">
          <div className="font-medium text-slate-200/90">Essaim de drones — mode {formation.current}</div>
          <div>Click → choisir un leader · Drag → le guider · Scroll → rayon d’influence</div>
          <div>Espace → attraction↔répulsion · Entrée → relâcher · Flèches → formations · H → aide · Échap → pause</div>
        </div>
      </div>

      {showHelp && (
        <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 text-slate-200/90">
          <div className="backdrop-blur-md bg-slate-900/40 rounded-2xl px-4 py-3 text-center">
            <div className="text-sm">Clique pour initialiser l’audio · volume modéré</div>
            <div className="opacity-70 text-xs">
              Inactif 12s → chorégraphie autonome (spirales, vagues, essaim compact)
            </div>
          </div>
        </div>
      )}

      {paused.current && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-slate-200/90 text-lg tracking-widest">PAUSE</div>
        </div>
      )}
    </div>
  )
}

// ===================== DEV TESTS (lightweight) =====================
// These run once to catch obvious logic issues without breaking the UI
if (typeof window !== "undefined") {
  console.assert(len({ x: 3, y: 4 }) === 5, "len should be 5")
  const v = limit({ x: 10, y: 0 }, 2)
  console.assert(Math.abs(v.x - 2) < 1e-6, "limit should clamp magnitude")
  const qt = new QuadTree({ x: 0, y: 0, w: 100, h: 100 }, 1)
  qt.insert(10, 10, 0)
  qt.insert(90, 90, 1)
  const r: number[] = []
  qt.queryCircle(10, 10, 5, r)
  console.assert(r.includes(0) && !r.includes(1), "quadtree circle query basic")
}
