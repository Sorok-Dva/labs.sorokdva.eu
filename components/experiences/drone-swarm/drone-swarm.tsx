"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { Drone, Formation, DroneSettings, DroneStats, Vec2 } from "./types"
import { DRONE_DEFAULTS } from "./constants"
import { DroneControlPanel } from "./control-panel"
import { DroneInfoPanel } from "./drone-info-panel"
import { FormationRail } from "./formation-rail"
import { MissionDeck } from "./mission-deck"
import { SwarmHeader } from "./swarm-header"
import { SwarmPresentation } from "./swarm-presentation"
import { useI18n } from "@/components/i18n/I18nProvider"

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

const BASE_HUES = [190, 310, 35, 48]

class QuadTree {
  bounds: { x: number; y: number; w: number; h: number }
  capacity: number
  points: { x: number; y: number; i: number }[] = []
  divided = false
  ne?: QuadTree
  nw?: QuadTree
  se?: QuadTree
  sw?: QuadTree

  constructor(bounds: { x: number; y: number; w: number; h: number }, capacity = 8) {
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

  insert(x: number, y: number, i: number): boolean {
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
    try {
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
    } catch (e) {
      console.warn("Audio initialization failed:", e)
      return null
    }
  }

  const triggerGrain = (x01: number, y01: number, density: number, attract: boolean) => {
    if (!ref.current) return
    try {
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
    } catch (e) {
      console.warn("Audio grain failed:", e)
    }
  }

  const setNoiseLevel = (v: number) => {
    if (!ref.current) return
    ref.current.noiseGain.gain.value = clamp(v, 0, 0.1)
  }

  return { ref, init, triggerGrain, setNoiseLevel }
}

export default function DroneSwarm() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const fpsRef = useRef<number>(0)
  const frameCountRef = useRef<number>(0)
  const lastFpsUpdateRef = useRef<number>(performance.now())

  const drones = useRef<Drone[]>([])
  const leader = useRef<number | null>(null)
  const repulsive = useRef(false)
  const dragging = useRef(false)
  const mouse = useRef<Vec2 | null>(null)
  const lastActivity = useRef<number>(performance.now())
  const autopilot = useRef(false)
  const formation = useRef<Formation>("default")

  const zoom = useRef<number>(1)
  const camera = useRef<Vec2>({ x: 0, y: 0 })
  const isDraggingLeader = useRef(false)

  const { init: initAudio, triggerGrain, setNoiseLevel } = useAudio()

  const [running, setRunning] = useState(true)
  const [settings, setSettings] = useState<DroneSettings>(DRONE_DEFAULTS)
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [presentationOpen, setPresentationOpen] = useState(false)
  const [repulsionActive, setRepulsionActive] = useState(false)
  const [stats, setStats] = useState<DroneStats>({
    totalDrones: 0,
    freeDrones: 0,
    followingDrones: 0,
    hasLeader: false,
    currentFormation: "default",
    autopilotActive: false,
  })
  const panelStateRef = useRef({ settingsOpen: false, presentationOpen: false })
  const { t } = useI18n()

  useEffect(() => {
    panelStateRef.current = { settingsOpen, presentationOpen }
  }, [settingsOpen, presentationOpen])

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)")
    const syncSettingsDrawer = () => setSettingsOpen(desktop.matches)

    syncSettingsDrawer()
    desktop.addEventListener("change", syncSettingsDrawer)
    return () => desktop.removeEventListener("change", syncSettingsDrawer)
  }, [])

  const markActivity = () => {
    lastActivity.current = performance.now()
    if (autopilot.current) autopilot.current = false
  }

  const addDrone = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const worldWidth = canvas.width * 2
    const worldHeight = canvas.height * 2

    const hue = BASE_HUES[Math.floor(rand(0, BASE_HUES.length))]
    const d: Drone = {
      id: drones.current.length,
      pos: {
        x: rand(-worldWidth / 2, worldWidth / 2),
        y: rand(-worldHeight / 2, worldHeight / 2),
      },
      vel: { x: rand(-1, 1), y: rand(-1, 1) },
      angle: 0,
      color: hsl(hue, 80, 65),
      baseHue: hue,
      state: "free",
      trail: [],
    }
    drones.current.push(d)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resize = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    if (drones.current.length === 0) {
      for (let i = 0; i < settings.droneCount; i++) addDrone()
    }

    const getMouse = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      const screenX = e.clientX - r.left
      const screenY = e.clientY - r.top
      // Convert screen coordinates to world coordinates
      const worldX = (screenX - canvas.width / 2) / zoom.current + camera.current.x
      const worldY = (screenY - canvas.height / 2) / zoom.current + camera.current.y
      return { x: worldX, y: worldY }
    }

    const onMove = (e: MouseEvent) => {
      mouse.current = getMouse(e)
      markActivity()
    }

    const onDown = () => {
      dragging.current = true
      if (leader.current !== null) {
        isDraggingLeader.current = true
      }
      markActivity()
    }

    const onUp = () => {
      dragging.current = false
      isDraggingLeader.current = false
      markActivity()
    }

    const onClick = (e: MouseEvent) => {
      const p = getMouse(e)
      let found: number | null = null
      for (let i = drones.current.length - 1; i >= 0; i--) {
        if (Math.hypot(drones.current[i].pos.x - p.x, drones.current[i].pos.y - p.y) < 26 / zoom.current) {
          found = i
          break
        }
      }
      leader.current = found
      drones.current.forEach((d, i) => (d.state = i === found ? "leader" : "free"))

      initAudio()?.ctx.resume()
      if (found !== null) {
        setSelectedDrone(drones.current[found])
        setSettingsOpen(false)
        setPresentationOpen(false)
      } else {
        setSelectedDrone(null)
      }
      setStats((previous) => ({ ...previous, hasLeader: found !== null }))

      markActivity()
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()

      // If we have a leader selected, adjust influence radius
      if (leader.current !== null) {
        const delta = clamp(settings.influenceRadius + (e.deltaY > 0 ? -10 : 10), 40, 320)
        setSettings((prev) => ({ ...prev, influenceRadius: delta }))
      } else {
        // Otherwise, zoom in/out
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
        zoom.current = clamp(zoom.current * zoomFactor, 0.3, 3)
      }

      markActivity()
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (panelStateRef.current.presentationOpen) {
          setPresentationOpen(false)
          return
        }
        if (panelStateRef.current.settingsOpen) {
          setSettingsOpen(false)
          return
        }
        setRunning((prev) => !prev)
      }
      if (e.key === "Enter") {
        leader.current = null
        setSelectedDrone(null)
      }
      if (e.key === " ") {
        e.preventDefault()
        repulsive.current = !repulsive.current
        setRepulsionActive(repulsive.current)
      }
      if (e.key === "ArrowLeft") formation.current = "compact"
      if (e.key === "ArrowUp") formation.current = "line"
      if (e.key === "ArrowRight") formation.current = "spiral"
      if (e.key === "ArrowDown") formation.current = "default"

      const moveSpeed = 50 / zoom.current
      if (e.key === "w" || e.key === "W") camera.current.y -= moveSpeed
      if (e.key === "s" || e.key === "S") camera.current.y += moveSpeed
      if (e.key === "a" || e.key === "A") camera.current.x -= moveSpeed
      if (e.key === "d" || e.key === "D") camera.current.x += moveSpeed

      markActivity()
    }

    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    canvas.addEventListener("mousedown", onDown)
    canvas.addEventListener("click", onClick)
    canvas.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("keydown", onKey)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
      canvas.removeEventListener("mousedown", onDown)
      canvas.removeEventListener("click", onClick)
      canvas.removeEventListener("wheel", onWheel)
      window.removeEventListener("keydown", onKey)
    }
  }, [addDrone])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let last = performance.now()
    let animationId: number

    const loop = () => {
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.033) // Cap at 30fps max
      last = now

      frameCountRef.current++
      if (frameCountRef.current >= 30) {
        const elapsed = now - lastFpsUpdateRef.current
        fpsRef.current = Math.round((frameCountRef.current * 1000) / elapsed)
        frameCountRef.current = 0
        lastFpsUpdateRef.current = now
      }

      if (frameCountRef.current % 30 === 0) {
        if (now - lastActivity.current > settings.autopilotDelay) autopilot.current = true
      }

      step(canvas, dt)
      draw(ctx, canvas)

      if (running) {
        animationId = requestAnimationFrame(loop)
      }
    }

    if (running) {
      animationId = requestAnimationFrame(loop)
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [settings, running])

  const step = (canvas: HTMLCanvasElement, dt: number) => {
    if (!running) return
    if (!canvas || canvas.width === 0 || canvas.height === 0) return

    if (frameCountRef.current % 60 === 0) {
      while (drones.current.length < settings.droneCount) addDrone()
      while (drones.current.length > settings.droneCount) drones.current.pop()
    }

    const worldWidth = canvas.width * 2
    const worldHeight = canvas.height * 2
    const qt = new QuadTree({ x: -worldWidth / 2, y: -worldHeight / 2, w: worldWidth, h: worldHeight }, 16)
    drones.current.forEach((d, i) => qt.insert(d.pos.x, d.pos.y, i))

    const neighR = 50 // Reduced neighbor radius
    const sepR = 18 // Reduced separation radius

    let cx = 0,
      cy = 0
    if (frameCountRef.current % 10 === 0) {
      for (const d of drones.current) {
        cx += d.pos.x
        cy += d.pos.y
      }
      cx /= drones.current.length
      cy /= drones.current.length
    }

    for (let i = 0; i < drones.current.length; i++) {
      const d = drones.current[i]
      let v = d.vel
      let p = d.pos
      let force = { x: 0, y: 0 }

      const idx: number[] = []
      qt.queryCircle(p.x, p.y, neighR, idx)

      let align = { x: 0, y: 0 }
      let cohesion = { x: 0, y: 0 }
      let separation = { x: 0, y: 0 }
      let count = 0

      const maxNeighbors = 6
      for (let n = 0; n < Math.min(idx.length, maxNeighbors); n++) {
        const j = idx[n]
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

      if (count > 0) {
        align = norm(align)
        cohesion = norm(sub(mul(cohesion, 1 / count), p))
        separation = norm(separation)
        force = add(force, mul(align, settings.alignmentWeight))
        force = add(force, mul(cohesion, settings.cohesionWeight))
        force = add(force, mul(separation, settings.separationWeight))
      }

      if (leader.current === i && mouse.current && dragging.current) {
        const dir = sub(mouse.current, p)
        const dist = len(dir)
        const k = mix(220, 520, clamp(dist / 200, 0, 1))
        force = add(force, mul(norm(dir), k))
      }

      if (leader.current !== null && leader.current !== i) {
        const L = drones.current[leader.current]
        const diff = sub(L.pos, p)
        const dist = Math.max(1, len(diff))
        if (dist < settings.influenceRadius) {
          const sgn = repulsive.current ? -1 : 1
          const k = mix(90, 220, 1 - dist / settings.influenceRadius)
          force = add(force, mul(norm(diff), sgn * k))
          if (d.state !== "leader") d.state = "following"

          const density = clamp(count / 8, 0, 1)
          if (Math.random() < 0.002 + density * 0.01)
            triggerGrain(p.x / canvas.width, p.y / canvas.height, density, !repulsive.current)
        } else {
          if (d.state !== "leader") d.state = "free"
        }
      }

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

      force = add(force, { x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 10 })

      if (count > 8) {
        const away = norm(sub(p, { x: cx, y: cy }))
        force = add(force, mul(away, 150))
      }

      v = add(v, mul(force, dt))
      v = limit(v, settings.maxSpeed)
      p = add(p, mul(v, dt))

      let wrapped = false
      if (p.x < -worldWidth / 2) {
        p.x = worldWidth / 2
        wrapped = true
      }
      if (p.y < -worldHeight / 2) {
        p.y = worldHeight / 2
        wrapped = true
      }
      if (p.x > worldWidth / 2) {
        p.x = -worldWidth / 2
        wrapped = true
      }
      if (p.y > worldHeight / 2) {
        p.y = -worldHeight / 2
        wrapped = true
      }

      if (wrapped) d.trail = []

      d.angle = Math.atan2(v.y, v.x)

      if (frameCountRef.current % 2 === 0) {
        d.trail.push({ x: p.x, y: p.y })
        if (d.trail.length > settings.trailLength) d.trail.shift()
      }

      const hueShift = d.state === "leader" ? 20 : d.state === "following" ? 10 : 0
      const light = d.state === "leader" ? 65 : d.state === "following" ? 70 : 60
      d.color = hsl(d.baseHue + hueShift + (repulsive.current ? 10 : 0), 80, light)

      d.vel = v
      d.pos = p
    }

    if (autopilot.current) {
      const t = Math.floor((performance.now() / 4000) % 3)
      formation.current = t === 0 ? "spiral" : t === 1 ? "line" : "compact"
      setNoiseLevel(0.05 + 0.02 * t)
    } else {
      setNoiseLevel(0.03)
    }

    if (frameCountRef.current % 30 === 0) {
      const freeDrones = drones.current.filter((d) => d.state === "free").length
      const followingDrones = drones.current.filter((d) => d.state === "following").length

      setStats({
        totalDrones: drones.current.length,
        freeDrones,
        followingDrones,
        hasLeader: leader.current !== null,
        currentFormation: formation.current,
        autopilotActive: autopilot.current,
      })

      if (selectedDrone && leader.current !== null) {
        const updated = drones.current.find((d) => d.id === selectedDrone.id)
        if (updated) setSelectedDrone(updated)
      }
    }
  }

  const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const backdrop = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      Math.max(canvas.width, canvas.height) * 0.75,
    )
    backdrop.addColorStop(0, "rgba(9,19,37,1)")
    backdrop.addColorStop(1, "rgba(4,6,13,1)")
    ctx.fillStyle = backdrop
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Radar registration remains screen-space while the swarm moves through world-space.
    ctx.save()
    const radarX = canvas.width / 2
    const radarY = canvas.height / 2
    const radarStep = Math.max(145, Math.min(canvas.width, canvas.height) * 0.19)
    ctx.strokeStyle = "rgba(124,196,255,0.065)"
    ctx.lineWidth = 1
    for (let radius = radarStep; radius < Math.max(canvas.width, canvas.height); radius += radarStep) {
      ctx.beginPath()
      ctx.arc(radarX, radarY, radius, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.strokeStyle = "rgba(27,34,54,0.7)"
    ctx.setLineDash([3, 14])
    ctx.beginPath()
    ctx.moveTo(0, radarY)
    ctx.lineTo(canvas.width, radarY)
    ctx.moveTo(radarX, 0)
    ctx.lineTo(radarX, canvas.height)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()

    // Apply camera transform
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.scale(zoom.current, zoom.current)
    ctx.translate(-camera.current.x, -camera.current.y)

    const g = ctx.createRadialGradient(
      camera.current.x,
      camera.current.y,
      0,
      camera.current.x,
      camera.current.y,
      (Math.max(canvas.width, canvas.height) * 0.6) / zoom.current,
    )
    g.addColorStop(0, "rgba(10,20,40,0.03)")
    g.addColorStop(1, "rgba(0,0,0,0.08)")
    ctx.fillStyle = g
    ctx.fillRect(
      camera.current.x - canvas.width / (2 * zoom.current),
      camera.current.y - canvas.height / (2 * zoom.current),
      canvas.width / zoom.current,
      canvas.height / zoom.current,
    )

    if (leader.current !== null) {
      const haloPos = drones.current[leader.current].pos
      const halo = ctx.createRadialGradient(haloPos.x, haloPos.y, 10, haloPos.x, haloPos.y, settings.influenceRadius)
      halo.addColorStop(0, repulsive.current ? "rgba(255,70,70,0.08)" : "rgba(80,180,255,0.08)")
      halo.addColorStop(0.7, repulsive.current ? "rgba(255,70,70,0.02)" : "rgba(80,180,255,0.02)")
      halo.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(haloPos.x, haloPos.y, settings.influenceRadius, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.shadowBlur = 0
    for (const d of drones.current) {
      if (d.trail.length > 3) {
        for (let j = 1; j < d.trail.length; j++) {
          const alpha = (j / d.trail.length) * 0.3
          ctx.beginPath()
          ctx.moveTo(d.trail[j - 1].x, d.trail[j - 1].y)
          ctx.lineTo(d.trail[j].x, d.trail[j].y)
          ctx.strokeStyle = hsl(d.baseHue, 90, 70, alpha)
          ctx.lineWidth = 1.5
          ctx.stroke()
        }
      }
    }

    for (const d of drones.current) {
      const isLeader = d.state === "leader"
      const isFollowing = d.state === "following"

      ctx.save()
      ctx.translate(d.pos.x, d.pos.y)
      ctx.rotate(d.angle)

      ctx.shadowBlur = isLeader ? 20 : isFollowing ? 12 : 8
      ctx.shadowColor = isLeader ? hsl(35, 100, 95, 0.8) : d.color

      const gradient = ctx.createLinearGradient(-8, -6, 12, 6)
      if (isLeader) {
        gradient.addColorStop(0, hsl(35, 100, 40))
        gradient.addColorStop(0.5, hsl(35, 100, 70))
        gradient.addColorStop(1, hsl(35, 100, 90))
      } else {
        gradient.addColorStop(0, hsl(d.baseHue, 80, 40))
        gradient.addColorStop(0.5, hsl(d.baseHue, 80, 65))
        gradient.addColorStop(1, hsl(d.baseHue, 80, 85))
      }

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.moveTo(12, 0)
      ctx.lineTo(-8, 6)
      ctx.lineTo(-4, 0)
      ctx.lineTo(-8, -6)
      ctx.closePath()
      ctx.fill()

      ctx.shadowBlur = 0
      ctx.beginPath()
      ctx.arc(0, 0, isLeader ? 3 : 2, 0, Math.PI * 2)
      ctx.fillStyle = isLeader ? hsl(35, 100, 95) : hsl(d.baseHue, 60, 95)
      ctx.fill()

      ctx.strokeStyle = isLeader ? hsl(35, 100, 30) : hsl(d.baseHue, 80, 30)
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(-6, 3)
      ctx.lineTo(-2, 0)
      ctx.moveTo(-6, -3)
      ctx.lineTo(-2, 0)
      ctx.stroke()

      ctx.restore()
    }

    ctx.restore()
  }

  const handleSettingsChange = (newSettings: Partial<DroneSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const handleToggleRun = () => setRunning((prev) => !prev)

  const handleReset = () => {
    drones.current = []
    leader.current = null
    setSelectedDrone(null)
    formation.current = "default"
    autopilot.current = false
    repulsive.current = false
    setRepulsionActive(false)
    setStats((previous) => ({
      ...previous,
      hasLeader: false,
      currentFormation: "default",
      autopilotActive: false,
    }))
    for (let i = 0; i < settings.droneCount; i++) addDrone()
  }

  const handleSnapshot = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = url
    a.download = `drone_swarm_${Date.now()}.png`
    a.click()
  }

  const handleSetFormation = (newFormation: Formation) => {
    formation.current = newFormation
    autopilot.current = false
    setStats((previous) => ({
      ...previous,
      currentFormation: newFormation,
      autopilotActive: false,
    }))
    markActivity()
  }

  const handleReleaseLeader = () => {
    leader.current = null
    drones.current.forEach((d) => (d.state = "free"))
    setSelectedDrone(null)
    setStats((previous) => ({
      ...previous,
      hasLeader: false,
      followingDrones: 0,
      freeDrones: drones.current.length,
    }))
    markActivity()
  }

  const handleToggleRepulsion = () => {
    repulsive.current = !repulsive.current
    setRepulsionActive(repulsive.current)
    markActivity()
  }

  const closeSettings = useCallback(() => setSettingsOpen(false), [])
  const closePresentation = useCallback(() => setPresentationOpen(false), [])

  const handleToggleSettings = useCallback(() => {
    setPresentationOpen(false)
    setSelectedDrone(null)
    setSettingsOpen((value) => !value)
  }, [])

  const handleTogglePresentation = useCallback(() => {
    setSettingsOpen(false)
    setSelectedDrone(null)
    setPresentationOpen((value) => !value)
  }, [])

  return (
    <div className="swarm-shell">
      <SwarmHeader stats={stats} t={t} />

      <div className="swarm-workspace">
        <FormationRail activeFormation={stats.currentFormation} onSetFormation={handleSetFormation} t={t} />

        <section ref={containerRef} className="swarm-stage">
          <canvas
            ref={canvasRef}
            className={dragging.current ? "cursor-grabbing" : "cursor-grab"}
            aria-label={t(
              "swarm.shell.canvasLabel",
              "Simulation interactive Swarm Intel. Cliquez sur un drone pour choisir un leader, puis glissez pour le guider.",
            )}
          />

          {selectedDrone && !isDraggingLeader.current ? (
            <DroneInfoPanel drone={selectedDrone} onClose={() => setSelectedDrone(null)} t={t} />
          ) : null}

          <div className="swarm-gesture-strip" aria-hidden="true">
            <span>{t("swarm.gesture.click", "Clic : choisir le leader")}</span>
            <i />
            <span>{t("swarm.gesture.drag", "Glisser : guider")}</span>
            <i />
            <span>{t("swarm.gesture.scroll", "Molette : rayon / zoom")}</span>
            <i />
            <span>{t("swarm.gesture.camera", "WASD : caméra")}</span>
          </div>

          {presentationOpen ? (
            <>
              <button
                type="button"
                className="experience-presentation-backdrop"
                aria-label={t("swarm.presentation.close", "Fermer la présentation")}
                onClick={closePresentation}
              />
              <SwarmPresentation onClose={closePresentation} t={t} />
            </>
          ) : null}
        </section>

        {settingsOpen ? (
          <>
            <button
              type="button"
              className="swarm-settings-backdrop"
              aria-label={t("swarm.shell.closeSettings", "Fermer les réglages")}
              onClick={closeSettings}
            />
          <DroneControlPanel
            settings={settings}
            onSettingsChange={handleSettingsChange}
              onClose={closeSettings}
              t={t}
          />
          </>
        ) : null}
      </div>

      <MissionDeck
        running={running}
        hasLeader={stats.hasLeader}
        repulsionActive={repulsionActive}
        presentationOpen={presentationOpen}
        settingsOpen={settingsOpen}
        onToggleRun={handleToggleRun}
        onReset={handleReset}
        onSnapshot={handleSnapshot}
        onReleaseLeader={handleReleaseLeader}
        onToggleRepulsion={handleToggleRepulsion}
        onTogglePresentation={handleTogglePresentation}
        onToggleSettings={handleToggleSettings}
        t={t}
      />
    </div>
  )
}
