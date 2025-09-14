"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { Cell, Food, Toxin, Settings, VisSettings, Genome, Vec2, CellTrackingInfo } from "./types"
import { DEFAULTS, PRESETS } from "./constants"
import { rand, clamp, dist2, norm, add, sub, mul, roundRect } from "./utils"
import { ControlPanel } from "./control-panel"
import { CellInfoPanel } from "./cell-info-panel"
import { ContextMenu } from "./context-menu"
import { type Camera, createCamera, updateCamera, screenToWorld, isInViewport } from "./camera"
import { useI18n } from '@/components/i18n/I18nProvider'

export default function Microcosm() {
  // Refs
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const hudRef = useRef<HTMLCanvasElement | null>(null)

  // État principal
  const [running, setRunning] = useState(true)
  const [fps, setFps] = useState(0)
  const [presetKey, setPresetKey] = useState<string>("gentleSoup")
  const [settings, setSettings] = useState<Settings>(() => ({ ...DEFAULTS, ...PRESETS["gentleSoup"] }))
  const [vis, setVis] = useState<VisSettings>({ trailsEnabled: true, trailColorMode: "byGenome", perfMode: false })
  const autoPerfActiveRef = useRef(false)
  const fpsRef = useRef(60)
  const [stats, setStats] = useState({ herbs: 0, preds: 0, food: 0 })

  const [selectedCell, setSelectedCell] = useState<Cell | null>(null)
  const [trackingInfo, setTrackingInfo] = useState<CellTrackingInfo | null>(null)
  const [isTracking, setIsTracking] = useState(false)

  const [contextMenu, setContextMenu] = useState<{ position: { x: number; y: number }; worldPos: Vec2 } | null>(null)
  const { t, lang, setLang } = useI18n()

  const cameraRef = useRef<Camera>(createCamera())
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })
  const [hasDragged, setHasDragged] = useState(false)

  const [isInteracting, setIsInteracting] = useState(false)
  const interactDebounceRef = useRef<number | null>(null)
  const interactingRef = useRef(false)

  const kickInteraction = useCallback(() => {
    setIsInteracting(true)
    if (interactDebounceRef.current) window.clearTimeout(interactDebounceRef.current)
    interactDebounceRef.current = window.setTimeout(() => setIsInteracting(false), 180)
  }, [])

  const prevInteractingRef = useRef(false)

  useEffect(() => {
    prevInteractingRef.current = isInteracting
    interactingRef.current = isInteracting
  }, [isInteracting])

  useEffect(() => {
    return () => {
      if (interactDebounceRef.current) window.clearTimeout(interactDebounceRef.current)
    }
  }, [])

  const dpr = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1

  // État du monde - Expand world size for infinite feel
  const worldRef = useRef({
    cells: [] as Cell[],
    food: [] as Food[],
    toxins: [] as Toxin[],
    nextId: 1,
    t: 0,
    lastFpsSample: 0,
    frames: 0,
    generationCounter: 0,
    worldWidth: 4000,
    worldHeight: 3000,
  })

  // Resize canvas responsively
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

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      kickInteraction()
      const camera = cameraRef.current
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
      camera.targetZoom = clamp(camera.targetZoom * zoomFactor, 0.2, 5)
    }

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault()
      kickInteraction()
      setIsDragging(true)
      setLastMousePos({ x: e.clientX, y: e.clientY })
      setDragStartPos({ x: e.clientX, y: e.clientY })
      setHasDragged(false)
      if (contextMenu) setContextMenu(null)
    }

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        kickInteraction()
        const camera = cameraRef.current
        const dx = e.clientX - lastMousePos.x
        const dy = e.clientY - lastMousePos.y
        const totalDrag = Math.abs(e.clientX - dragStartPos.x) + Math.abs(e.clientY - dragStartPos.y)
        if (totalDrag > 5) setHasDragged(true)
        camera.x -= dx / camera.zoom
        camera.y -= dy / camera.zoom
        setLastMousePos({ x: e.clientX, y: e.clientY })
      }
    }

    const onMouseUp = (e: MouseEvent) => {
      if (isDragging && !hasDragged) handleClick(e)
      setIsDragging(false)
      setHasDragged(false)
      // on laisse le debounce éteindre tout seul isInteracting
    }

    const handleClick = (e: MouseEvent) => {
      const rect = c.getBoundingClientRect()
      const screenX = (e.clientX - rect.left) * dpr
      const screenY = (e.clientY - rect.top) * dpr

      const worldPos = screenToWorld(cameraRef.current, screenX, screenY, c.width, c.height)

      // Chercher la cellule la plus proche du clic
      const world = worldRef.current
      let closestCell: Cell | null = null
      let closestDist = Number.POSITIVE_INFINITY

      for (const cell of world.cells) {
        const d = dist2(worldPos, cell.pos)
        const clickRadius = (cell.genome.size + 10) * (cell.genome.size + 10)
        if (d < clickRadius && d < closestDist) {
          closestCell = cell
          closestDist = d
        }
      }

      if (closestCell) {
        setSelectedCell(closestCell)
        setTrackingInfo({
          cell: closestCell,
          visible: true,
          position: { x: e.clientX, y: e.clientY },
        })
      } else {
        if (e.altKey) {
          spawnPredator(worldPos)
        } else if (e.shiftKey) {
          spawnToxin(worldPos)
        } else if (e.ctrlKey) {
          dropFoodCluster(worldPos, 16)
        } else {
          // Show context menu
          setContextMenu({
            position: { x: e.clientX, y: e.clientY },
            worldPos,
          })
        }
      }
    }

    c.addEventListener("wheel", onWheel, { passive: false })
    c.addEventListener("mousedown", onMouseDown)
    c.addEventListener("mousemove", onMouseMove)
    c.addEventListener("mouseup", onMouseUp)

    return () => {
      c.removeEventListener("wheel", onWheel)
      c.removeEventListener("mousedown", onMouseDown)
      c.removeEventListener("mousemove", onMouseMove)
      c.removeEventListener("mouseup", onMouseUp)
    }
  }, [dpr, isDragging, lastMousePos, dragStartPos, hasDragged, contextMenu])

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return

    const onClick = (e: MouseEvent) => {
      const rect = c.getBoundingClientRect()
      const x = (e.clientX - rect.left) * dpr
      const y = (e.clientY - rect.top) * dpr

      // Chercher la cellule la plus proche du clic
      const world = worldRef.current
      let closestCell: Cell | null = null
      let closestDist = Number.POSITIVE_INFINITY

      for (const cell of world.cells) {
        const d = dist2({ x, y }, cell.pos)
        const clickRadius = (cell.genome.size + 10) * (cell.genome.size + 10)
        if (d < clickRadius && d < closestDist) {
          closestCell = cell
          closestDist = d
        }
      }

      if (closestCell) {
        setSelectedCell(closestCell)
        setTrackingInfo({
          cell: closestCell,
          visible: true,
          position: { x: e.clientX, y: e.clientY },
        })
      } else {
        // Actions originales si pas de cellule cliquée
        if (e.altKey) spawnPredator({ x, y })
        else if (e.shiftKey) spawnToxin({ x, y })
        else dropFoodCluster({ x, y }, 16)
      }
    }

    c.addEventListener("click", onClick)
    return () => c.removeEventListener("click", onClick)
  }, [dpr])

  // Initialisation
  useEffect(() => {
    seedWorld()

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (k === " ") {
        e.preventDefault()
        toggleRun()
      }
      if (k === "r") resetWorld()
      if (k === "s") snapshot()
      if (k === "f") {
        const camera = cameraRef.current
        dropFoodCluster(
          {
            x: camera.x + rand(-200, 200),
            y: camera.y + rand(-200, 200),
          },
          28,
        )
      }
      if (k === "t") {
        const camera = cameraRef.current
        spawnToxin({
          x: camera.x + rand(-200, 200),
          y: camera.y + rand(-200, 200),
        })
      }
      if (k === "p") {
        const camera = cameraRef.current
        spawnPredator({
          x: camera.x + rand(-200, 200),
          y: camera.y + rand(-200, 200),
        })
      }
      if (k === "escape") setSelectedCell(null)
    }
    window.addEventListener("keydown", onKey)

    return () => {
      window.removeEventListener("keydown", onKey)
    }
  }, [])

  // Boucle principale
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
      const camera = cameraRef.current
      const dt = 1

      updateCamera(camera, dt)
      // Camera follow when tracking is active
      if (isTracking && selectedCell) {
        const k = 0.25
        camera.x += (selectedCell.pos.x - camera.x) * k
        camera.y += (selectedCell.pos.y - camera.y) * k
      }

      // Background / trails in screen space
      ctx.globalCompositeOperation = "source-over"
      if (vis.trailsEnabled && !interactingRef.current) {
        ctx.fillStyle = `rgba(7,9,14,${settings.trailFade})`
        ctx.fillRect(0, 0, width, height)
      } else {
        // Opaque clear while interacting or when trails disabled
        ctx.fillStyle = "#07090E"
        ctx.fillRect(0, 0, width, height)
      }

      // Apply camera transform for world rendering
      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.scale(camera.zoom, camera.zoom)
      ctx.translate(-camera.x, -camera.y)

      if (running) {
        stepWorld(world, world.worldWidth, world.worldHeight, dt, settings)
        drawWorld(ctx, world, width, height, vis, selectedCell, camera)
      }

      ctx.restore()

      drawHud(hctx, world, width, height, running, fps, camera, t, vis)

      // FPS
      const now = performance.now()
      world.frames++
      if (world.lastFpsSample === 0) world.lastFpsSample = now
      if (now - world.lastFpsSample > 500) {
        const sampleFps = Math.round((world.frames * 1000) / (now - world.lastFpsSample))
        fpsRef.current = sampleFps
        setFps(sampleFps)
        world.frames = 0
        world.lastFpsSample = now
        // Auto-perf hysteresis (always considered; not a user setting)
        const cellCount = world.cells.length
        const zoom = camera.zoom
        const lowFPSOn = sampleFps < 28
        const highFPSOff = sampleFps > 34
        const tooManyOn = cellCount >= 3000
        const tooFewOff = cellCount < 2000
        const extremeZoomOut = zoom < 0.5

        // Enable only for low FPS or many entities; zoom alone never enables unless over 3k
        const shouldEnable = lowFPSOn || tooManyOn

        // Disable when FPS recovered and entity count low; also disable when zoomed out but <3k
        let shouldDisable = (highFPSOff && tooFewOff)
        if (extremeZoomOut && cellCount < 3000 && !lowFPSOn && !tooManyOn) {
          shouldDisable = true
        }

        if (!autoPerfActiveRef.current && shouldEnable) autoPerfActiveRef.current = true
        else if (autoPerfActiveRef.current && shouldDisable) autoPerfActiveRef.current = false
      }

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [running, settings, fps, vis, selectedCell, isTracking, lang])

  useEffect(() => {
    if (selectedCell) {
      const world = worldRef.current
      const updatedCell = world.cells.find((c) => c.id === selectedCell.id)
      if (updatedCell) {
        setSelectedCell(updatedCell)
      } else {
        // La cellule est morte
        setSelectedCell(null)
        setTrackingInfo(null)
        setIsTracking(false)
      }
    }
  }, [selectedCell, stats])

  // Fonctions utilitaires
  const seedWorld = useCallback((override?: Settings) => {
    const w = worldRef.current
    w.cells = []
    w.food = []
    w.toxins = []
    w.nextId = 1
    w.generationCounter = 0

    const { worldWidth, worldHeight } = w

    const cfg = override ?? settings

    // Seed food with the value from cfg (avoid closure on settings)
    for (let i = 0; i < cfg.foodCount; i++) {
      w.food.push({ id: w.nextId++, pos: { x: rand(0, worldWidth), y: rand(0, worldHeight) }, value: cfg.foodValue })
    }
    for (let i = 0; i < cfg.toxinCount; i++) {
      w.toxins.push(newToxin({ x: rand(0, worldWidth), y: rand(0, worldHeight) }))
    }
    for (let i = 0; i < cfg.initialHerbivores; i++) {
      w.cells.push(newCell({ x: rand(0, worldWidth), y: rand(0, worldHeight) }, "herbivore"))
    }
    for (let i = 0; i < cfg.initialPredators; i++) {
      w.cells.push(newCell({ x: rand(0, worldWidth), y: rand(0, worldHeight) }, "predator"))
    }

    const camera = cameraRef.current
    camera.x = worldWidth / 2
    camera.y = worldHeight / 2
    camera.zoom = 1
    camera.targetZoom = 1
  }, [settings])

  const resetWorld = useCallback((override?: Settings) => {
    setSelectedCell(null)
    setTrackingInfo(null)
    setIsTracking(false)
    seedWorld(override)
  }, [seedWorld])

  const toggleRun = useCallback(() => setRunning((r) => !r), [])

  const snapshot = useCallback(() => {
    const c = canvasRef.current
    if (!c) return
    const url = c.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = url
    a.download = `microcosm_${Date.now()}.png`
    a.click()
  }, [])

  // Constructeurs d'entités
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

  const newCell = (pos: Vec2, kind: Cell["kind"], parentId?: number): Cell => {
    const world = worldRef.current
    const parent = parentId ? world.cells.find((c) => c.id === parentId) : null

    return {
      id: world.nextId++,
      pos: { ...pos },
      vel: { x: rand(-1, 1), y: rand(-1, 1) },
      energy: kind === "herbivore" ? rand(14, 26) : rand(18, 32),
      genome: newGenome(kind),
      kind,
      age: 0,
      cd: 0,
      parentId,
      children: [],
      generation: parent ? parent.generation + 1 : 0,
      totalOffspring: 0,
      birthTime: world.t,
      lastAteAt: world.t,
      hunger: 0,
      roamDir: (() => {
        const a = rand(0, Math.PI * 2)
        return { x: Math.cos(a), y: Math.sin(a) }
      })(),
      roamTimer: Math.floor(rand(60, 180)),
    }
  }

  const newFood = (pos: Vec2): Food => ({
    id: worldRef.current.nextId++,
    pos,
    value: settings.foodValue,
  })

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

  // Simulation
  const stepWorld = (
    world: {
      cells: Cell[]
      food: Food[]
      toxins: Toxin[]
      nextId: number
      t: number
      worldWidth: number
      worldHeight: number
    },
    width: number,
    height: number,
    dt: number,
    cfg: Settings,
  ) => {
    world.t += dt
    const wf = cfg.worldFriction

    // Food drift (no map clamping for infinite world)
    for (const f of world.food) {
      if (Math.random() < 0.02) {
        f.pos.x = f.pos.x + rand(-1, 1)
        f.pos.y = f.pos.y + rand(-1, 1)
      }
    }
    // Build spatial indices (per-frame) to accelerate neighborhood queries
    const GRID_SIZE = 64
    const cellKey = (x: number, y: number) => `${Math.floor(x / GRID_SIZE)}|${Math.floor(y / GRID_SIZE)}`
    const herbGrid = new Map<string, Cell[]>()
    const predGrid = new Map<string, Cell[]>()
    const foodGrid = new Map<string, Food[]>()
    const toxGrid = new Map<string, Toxin[]>()
    const idMap = new Map<number, Cell>()

    for (const c of world.cells) {
      idMap.set(c.id, c)
      const key = cellKey(c.pos.x, c.pos.y)
      if (c.kind === "herbivore") {
        let arr = herbGrid.get(key)
        if (!arr) herbGrid.set(key, (arr = []))
        arr.push(c)
      } else {
        let arr = predGrid.get(key)
        if (!arr) predGrid.set(key, (arr = []))
        arr.push(c)
      }
    }
    for (const f of world.food) {
      const key = cellKey(f.pos.x, f.pos.y)
      let arr = foodGrid.get(key)
      if (!arr) foodGrid.set(key, (arr = []))
      arr.push(f)
    }
    for (const t of world.toxins) {
      const key = cellKey(t.pos.x, t.pos.y)
      let arr = toxGrid.get(key)
      if (!arr) toxGrid.set(key, (arr = []))
      arr.push(t)
    }

    const queryCells = (grid: Map<string, Cell[]>, x: number, y: number, r: number) => {
      const out: Cell[] = []
      const gx0 = Math.floor((x - r) / GRID_SIZE)
      const gy0 = Math.floor((y - r) / GRID_SIZE)
      const gx1 = Math.floor((x + r) / GRID_SIZE)
      const gy1 = Math.floor((y + r) / GRID_SIZE)
      for (let i = gx0; i <= gx1; i++) {
        for (let j = gy0; j <= gy1; j++) {
          const arr = grid.get(`${i}|${j}`)
          if (!arr) continue
          for (let k = 0; k < arr.length; k++) out.push(arr[k])
        }
      }
      return out
    }
    const queryFood = (x: number, y: number, r: number) => {
      const out: Food[] = []
      const gx0 = Math.floor((x - r) / GRID_SIZE)
      const gy0 = Math.floor((y - r) / GRID_SIZE)
      const gx1 = Math.floor((x + r) / GRID_SIZE)
      const gy1 = Math.floor((y + r) / GRID_SIZE)
      for (let i = gx0; i <= gx1; i++) {
        for (let j = gy0; j <= gy1; j++) {
          const arr = foodGrid.get(`${i}|${j}`)
          if (!arr) continue
          for (let k = 0; k < arr.length; k++) out.push(arr[k])
        }
      }
      return out
    }
    const queryToxins = (x: number, y: number, r: number) => {
      const out: Toxin[] = []
      const gx0 = Math.floor((x - r) / GRID_SIZE)
      const gy0 = Math.floor((y - r) / GRID_SIZE)
      const gx1 = Math.floor((x + r) / GRID_SIZE)
      const gy1 = Math.floor((y + r) / GRID_SIZE)
      for (let i = gx0; i <= gx1; i++) {
        for (let j = gy0; j <= gy1; j++) {
          const arr = toxGrid.get(`${i}|${j}`)
          if (!arr) continue
          for (let k = 0; k < arr.length; k++) out.push(arr[k])
        }
      }
      return out
    }

    const newCells: Cell[] = []

    for (let i = 0; i < world.cells.length; i++) {
      const c = world.cells[i]
      c.age += dt
      c.energy -= cfg.metabolism * (c.kind === "predator" ? 1.4 : 1) * dt
      if (c.cd && c.cd > 0) c.cd -= 1

      // Hunger model: 0..1 over a horizon
      const hungerHorizon = 720 // frames to reach max hunger
      c.hunger = Math.max(0, Math.min(1, (world.t - c.lastAteAt) / hungerHorizon))

      let acc = { x: 0, y: 0 }
      let hasTarget = false

      // Avoid toxins (query nearby only)
      {
        const scanR = 72
        const cand = queryToxins(c.pos.x, c.pos.y, scanR)
        for (let it = 0; it < cand.length; it++) {
          const t = cand[it]
          const r = t.radius + c.genome.size * 2
          const r2 = r * r
          const d2t = dist2(c.pos, t.pos)
          if (d2t < r2) {
            const dir = norm(sub(c.pos, t.pos))
            acc = add(acc, mul(dir, t.strength * 2.2))
            c.energy -= t.strength * 0.02
          }
        }
      }

      if (c.kind === "herbivore") {
        // Seek food (strong steering, suppress roam when targeting)
        let best: Food | null = null
        let bestD2 = Number.POSITIVE_INFINITY
        const sense = c.genome.sense * (1 + 1.2 * c.hunger)
        {
          const candidates = queryFood(c.pos.x, c.pos.y, sense)
          const sense2 = sense * sense
          for (let jj = 0; jj < candidates.length; jj++) {
            const f = candidates[jj]
            const d2f = dist2(c.pos, f.pos)
            if (d2f < sense2 && d2f < bestD2) {
              best = f
              bestD2 = d2f
            }
          }
        }
        if (best) {
          hasTarget = true
          // Steering towards food: desired velocity - current velocity
          const toFood = sub(best.pos, c.pos)
          const dir = norm(toFood)
          const desired = mul(dir, c.genome.maxSpeed)
          const steer = sub(desired, c.vel)
          const hungerBoost = 0.35 * c.hunger
          let seekGain = 0.28 + hungerBoost
          // Stronger pull when close to avoid skimming past
          if (bestD2 < (c.genome.size + 12) * (c.genome.size + 12)) seekGain *= 1.6
          acc = add(acc, mul(steer, seekGain))

          // Eat if within reach (slightly larger radius)
          const eatR = c.genome.size + 6
          if (bestD2 < eatR * eatR || dist2(add(c.pos, c.vel), best.pos) < (eatR + 1.5) * (eatR + 1.5)) {
            c.energy += best.value * c.genome.efficiency
            const idx = world.food.indexOf(best)
            if (idx >= 0) world.food.splice(idx, 1)
            c.lastAteAt = world.t
            c.hunger = 0
          }
        }
      } else {
        // Predator logic
        let best: Cell | null = null
        let bestD2 = Number.POSITIVE_INFINITY
        const sense = c.genome.sense * (1 + 1.0 * c.hunger)
        {
          const candidates = queryCells(herbGrid, c.pos.x, c.pos.y, sense)
          const sense2 = sense * sense
          for (let kk = 0; kk < candidates.length; kk++) {
            const other = candidates[kk]
            if (other.kind !== "herbivore") continue
            const d2h = dist2(c.pos, other.pos)
            if (d2h < sense2 && d2h < bestD2) {
              best = other
              bestD2 = d2h
            }
          }
        }
        if (best) {
          const dir = norm(sub(best.pos, c.pos))
          acc = add(acc, mul(dir, 0.2))
          const bodyRange = c.genome.size + best.genome.size + cfg.predAttackRange
          if (bestD2 < bodyRange * bodyRange && (!c.cd || c.cd <= 0)) {
            best.energy -= cfg.predAttackDamage
            c.energy += cfg.predAttackDamage * cfg.predLifesteal
            c.cd = cfg.predAttackCooldown
            c.lastAteAt = world.t
            c.hunger = 0
          }
          // Herd defense
          let defenders = 0
          {
            const r = cfg.herdDefenseRange
            const r2 = r * r
            const candidates = queryCells(herbGrid, c.pos.x, c.pos.y, r)
            for (let hh = 0; hh < candidates.length; hh++) {
              const h = candidates[hh]
              if (h.kind !== "herbivore") continue
              if (dist2(h.pos, c.pos) < r2) defenders++
            }
          }
          if (defenders >= cfg.herdDefenseCount) {
            const stacks = Math.min(cfg.herdDefenseMaxStacks, Math.max(0, defenders - cfg.herdDefenseCount + 1))
            const dmg = cfg.herdDefenseDamage * (1 + stacks)
            c.energy -= dmg
            acc = add(acc, mul(norm(sub(c.pos, best.pos)), 0.35))
          }
        }
      }

      // Social following: juveniles follow their parent for a while
      if (settings.socialFollowEnabled && c.isFollowingParent && c.followUntil && world.t <= c.followUntil) {
        const parent = c.parentId ? idMap.get(c.parentId) : undefined
        if (parent) {
          const dirp = norm(sub(parent.pos, c.pos))
          acc = add(acc, mul(dirp, settings.socialFollowStrength))
        } else {
          c.isFollowingParent = false
          c.followUntil = undefined
        }
      } else if (c.isFollowingParent && c.followUntil && world.t > c.followUntil) {
        c.isFollowingParent = false
        c.followUntil = undefined
      }

      // Anti-crowding: repel from local centroid if dense
      {
        const sepRadius = 42
        const sepRadius2 = sepRadius * sepRadius
        const sepLimit = 14
        let count = 0
        let cx = 0,
          cy = 0
        const neighHerb = queryCells(herbGrid, c.pos.x, c.pos.y, sepRadius)
        const neighPred = queryCells(predGrid, c.pos.x, c.pos.y, sepRadius)
        for (let k = 0; k < neighHerb.length && count < sepLimit; k++) {
          const o = neighHerb[k]
          if (o.id === c.id) continue
          const d2v = dist2(c.pos, o.pos)
          if (d2v < sepRadius2) {
            count++
            cx += o.pos.x
            cy += o.pos.y
          }
        }
        for (let k = 0; k < neighPred.length && count < sepLimit; k++) {
          const o = neighPred[k]
          if (o.id === c.id) continue
          const d2v = dist2(c.pos, o.pos)
          if (d2v < sepRadius2) {
            count++
            cx += o.pos.x
            cy += o.pos.y
          }
        }
        if (count >= sepLimit) {
          cx /= count
          cy /= count
          const away = norm(sub(c.pos, { x: cx, y: cy }))
          // If we are targeting food (seek state), keep repulsion mild
          const mild = 0.08 + 0.12 * c.hunger
          const strong = 0.25
          const repulse = mild // we don't explicitly track target flag; mild repulsion is safer overall
          acc = add(acc, mul(away, repulse))
          // steer exploration outward
          c.roamDir = norm(add(c.roamDir, mul(away, 0.6)))
        }
      }

      // Hunger-driven exploration: persistent roam
      c.roamTimer -= 1
      if (c.roamTimer <= 0) {
        const a = rand(0, Math.PI * 2)
        c.roamDir = { x: Math.cos(a), y: Math.sin(a) }
        // longer persistence when hungry
        c.roamTimer = Math.floor(rand(60, 120) * (1 + 1.8 * c.hunger))
      } else {
        // small chance to reorient, higher when hungry
        const p = 0.002 + 0.01 * c.hunger
        if (Math.random() < p) {
          const a = rand(0, Math.PI * 2)
          c.roamDir = { x: Math.cos(a), y: Math.sin(a) }
        }
      }
      // Apply roam force stronger when hungry; but reduce if velocity is already pointed well
      const roamStrength = (0.06 + 0.18 * c.hunger) * (hasTarget ? 0.25 : 1)
      acc = add(acc, mul(c.roamDir, roamStrength))

      // Mild noise
      acc = add(acc, { x: rand(-0.04, 0.04), y: rand(-0.04, 0.04) })

      // Integrate motion
      c.vel = add(c.vel, acc)
      const speed = Math.hypot(c.vel.x, c.vel.y)
      const maxV = c.genome.maxSpeed
      if (speed > maxV) c.vel = mul(norm(c.vel), maxV)
      c.vel = mul(c.vel, wf)
      c.pos = add(c.pos, c.vel)

      // Remove map wrapping/bouncing for cells to allow infinite world

      // Density-aware reproduction (spatial)
      let crowded = false
      if (c.energy > cfg.splitThreshold) {
        let local = 0
        const r = 40
        const r2 = r * r
        const candidatesA = queryCells(herbGrid, c.pos.x, c.pos.y, r)
        const candidatesB = queryCells(predGrid, c.pos.x, c.pos.y, r)
        const scan = c.kind === "herbivore" ? candidatesA : candidatesB
        for (let k = 0; k < scan.length; k++) {
          const n = scan[k]
          if (n.id === c.id || n.kind !== c.kind) continue
          if (dist2(c.pos, n.pos) < r2) {
            local++
            if (local > 10) {
              crowded = true
              break
            }
          }
        }
      }

      if (c.energy > cfg.splitThreshold && !crowded && world.cells.length + newCells.length < cfg.maxEntitiesCap) {
        c.energy -= cfg.reproductionCost
        const willFollow = settings.socialFollowEnabled && Math.random() > settings.socialRebelProb
        const child: Cell = {
          id: world.nextId++,
          pos: add(c.pos, { x: rand(-3, 3), y: rand(-3, 3) }),
          vel: mul(norm({ x: rand(-1, 1), y: rand(-1, 1) }), c.genome.maxSpeed * 0.6),
          energy: c.energy * 0.4,
          genome: mutate(c.genome, cfg.mutationRate),
          kind: c.kind,
          age: 0,
          cd: 0,
          parentId: c.id,
          children: [],
          generation: c.generation + 1,
          totalOffspring: 0,
          birthTime: world.t,
          lastAteAt: world.t,
          hunger: 0,
          roamDir: (() => {
            const a = rand(0, Math.PI * 2)
            return { x: Math.cos(a), y: Math.sin(a) }
          })(),
          roamTimer: Math.floor(rand(60, 180)),
          isFollowingParent: willFollow ? true : false,
          followUntil: willFollow ? world.t + settings.socialFollowDuration : undefined,
        }
        c.children.push(child.id)
        c.totalOffspring++
        newCells.push(child)
      }

      // Death
      if (c.energy <= -8) {
        for (let k = 0; k < rand(2, 6); k++) {
          world.food.push(
            newFood({
              x: c.pos.x + rand(-6, 6),
              y: c.pos.y + rand(-6, 6),
            }),
          )
        }
        continue
      }

      newCells.push(c)
    }

    world.cells = newCells

    // Food regeneration
    if (world.food.length < cfg.foodCount) {
      if (Math.random() < 0.6) {
        world.food.push(newFood({ x: rand(0, width), y: rand(0, height) }))
      }
    }

    // Update stats
    let herbs = 0,
      preds = 0
    for (const c of world.cells) c.kind === "herbivore" ? herbs++ : preds++
    setStats({ herbs, preds, food: world.food.length })
  }

  // Trail layer renderer: only draws ephemeral trail marks
  const drawWorld = (
    ctx: CanvasRenderingContext2D,
    world: { cells: Cell[]; food: Food[]; toxins: Toxin[] },
    width: number,
    height: number,
    vis: VisSettings,
    selectedCell: Cell | null,
    camera: Camera,
  ) => {
    // Only draw trail marks for cells; toxins/food moved to HUD
    const perf = !!(vis.perfMode || autoPerfActiveRef.current)

    // Cells trail marks - only draw visible ones
    // Heuristic trail decimation in perf mode (stable by id to avoid flicker)
    const total = world.cells.length
    let stride = 1
    if (perf) {
      if (total > 8000 || camera.zoom < 0.35) stride = 6
      else if (total > 4000 || camera.zoom < 0.45) stride = 4
      else if (total > 2000 || camera.zoom < 0.6) stride = 3
      else if (total > 1000 || camera.zoom < 0.8) stride = 2
    }
    for (const c of world.cells) {
      if (stride > 1 && (c.id % stride) !== 0) continue
      if (!isInViewport(camera, c.pos.x, c.pos.y, c.genome.size + 10, width, height)) continue

      const hue = c.kind === "herbivore" ? c.genome.hue : (c.genome.hue + 330) % 360
      // Minimal trail dot only, skip when interacting
      if (vis.trailsEnabled && !interactingRef.current) {
        const alpha = vis.trailColorMode === "byGenome" ? 0.18 : 0.15
        const color = vis.trailColorMode === "byGenome" ? `hsla(${hue}, 90%, 65%, 1)` : `rgba(200,220,255,1)`
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        // Use cheaper primitive when zoomed out or perf mode
        if (perf && camera.zoom < 0.8) {
          const s = 1 / Math.max(1, camera.zoom)
          ctx.fillRect(c.pos.x, c.pos.y, s, s)
        } else {
          ctx.beginPath()
          ctx.arc(c.pos.x, c.pos.y, 0.9, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }
    }
  }

  const drawHud = (
    hctx: CanvasRenderingContext2D,
    world: { cells: Cell[]; food: Food[]; toxins: Toxin[]; t: number },
    width: number,
    height: number,
    running: boolean,
    fps: number,
    camera: Camera,
    t: (k: string, fallback?: string) => string,
    vis: VisSettings,
  ) => {
    hctx.clearRect(0, 0, width, height)
    const perf = !!(vis.perfMode || autoPerfActiveRef.current)

    // Draw non-trailing elements in world space (e.g., food)
    hctx.save()
    hctx.translate(width / 2, height / 2)
    hctx.scale(camera.zoom, camera.zoom)
    hctx.translate(-camera.x, -camera.y)

    // Toxins (simplify in perf mode: avoid gradient)
    for (const t of world.toxins) {
      if (!isInViewport(camera, t.pos.x, t.pos.y, t.radius, width, height)) continue
      if (perf) {
        hctx.fillStyle = "rgba(255,60,80,0.12)"
        hctx.beginPath()
        hctx.arc(t.pos.x, t.pos.y, t.radius, 0, Math.PI * 2)
        hctx.fill()
      } else {
        const grd = hctx.createRadialGradient(t.pos.x, t.pos.y, 0, t.pos.x, t.pos.y, t.radius)
        grd.addColorStop(0, "rgba(255,60,80,0.18)")
        grd.addColorStop(1, "rgba(255,60,80,0.0)")
        hctx.fillStyle = grd
        hctx.beginPath()
        hctx.arc(t.pos.x, t.pos.y, t.radius, 0, Math.PI * 2)
        hctx.fill()
      }
    }

    for (const f of world.food) {
      if (!isInViewport(camera, f.pos.x, f.pos.y, 2, width, height)) continue
      hctx.fillStyle = "rgba(140,220,255,0.9)"
      if (perf && camera.zoom < 0.9) {
        const s = Math.max(1, Math.floor(2 / camera.zoom))
        hctx.fillRect(f.pos.x, f.pos.y, s, s)
      } else {
        hctx.beginPath()
        hctx.arc(f.pos.x, f.pos.y, 2, 0, Math.PI * 2)
        hctx.fill()
      }
    }

    // Cells (crisp, no trail accumulation)
    const totalCells = world.cells.length
    for (const c of world.cells) {
      if (!isInViewport(camera, c.pos.x, c.pos.y, c.genome.size + 10, width, height)) continue

      const hue = c.kind === "herbivore" ? c.genome.hue : (c.genome.hue + 330) % 360
      const body = `hsla(${hue}, 90%, 60%, 0.85)`
      const outline = `hsla(${hue}, 90%, 70%, 0.35)`

      // Visual indicator: juvenile following line to parent
      if (!perf && c.isFollowingParent && c.followUntil && world.t <= c.followUntil && c.parentId) {
        const parent = world.cells.find((x) => x.id === c.parentId)
        if (parent) {
          hctx.strokeStyle = `hsla(${hue}, 90%, 65%, 0.35)`
          hctx.lineWidth = 1 / camera.zoom
          hctx.setLineDash([4 / camera.zoom, 4 / camera.zoom])
          hctx.beginPath()
          hctx.moveTo(c.pos.x, c.pos.y)
          hctx.lineTo(parent.pos.x, parent.pos.y)
          hctx.stroke()
          hctx.setLineDash([])
        }
      }

      const isSelected = selectedCell && selectedCell.id === c.id

      if (isSelected) {
        hctx.strokeStyle = "rgba(255,255,255,0.8)"
        hctx.lineWidth = 3 / camera.zoom
        hctx.beginPath()
        hctx.arc(c.pos.x, c.pos.y, c.genome.size + 4, 0, Math.PI * 2)
        hctx.stroke()
      }

      if (!perf) {
        hctx.shadowColor = body
        hctx.shadowBlur = (isSelected ? 12 : 6) / camera.zoom
      } else {
        hctx.shadowBlur = 0
      }
      hctx.fillStyle = body
      hctx.beginPath()
      hctx.arc(c.pos.x, c.pos.y, c.genome.size, 0, Math.PI * 2)
      hctx.fill()
      hctx.shadowBlur = 0

      const dir = norm(c.vel)
      if (!(perf && (camera.zoom < 0.9 || totalCells > 3000))) {
        hctx.strokeStyle = outline
        hctx.lineWidth = 1 / camera.zoom
        hctx.beginPath()
        hctx.moveTo(c.pos.x, c.pos.y)
        hctx.lineTo(c.pos.x + dir.x * (c.genome.size + 5), c.pos.y + dir.y * (c.genome.size + 5))
        hctx.stroke()
      }
    }

    hctx.restore()

    // Gradient overlay (skip in perf mode)
    if (!perf) {
      const g = hctx.createLinearGradient(0, 0, 0, height)
      g.addColorStop(0, "rgba(0,0,0,0.35)")
      g.addColorStop(0.12, "rgba(0,0,0,0)")
      g.addColorStop(0.88, "rgba(0,0,0,0)")
      g.addColorStop(1, "rgba(0,0,0,0.35)")
      hctx.fillStyle = g
      hctx.fillRect(0, 0, width, height)
    }

    // Stats pill
    const pad = 10
    const pillW = 320 * dpr // Wider to fit camera info
    const pillH = 150 * dpr // Made taller for new instructions
    const x = pad * dpr
    const y = pad * dpr
    hctx.fillStyle = "rgba(10,12,18,0.55)"
    roundRect(hctx, x, y, pillW, pillH, 14 * dpr)
    hctx.fill()

    hctx.font = `${14 * dpr}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas`
    hctx.fillStyle = "rgba(220,230,255,0.85)"
    hctx.fillText(`${t('microcosm.hud.fps','FPS')}: ${fps}`, x + 14 * dpr, y + 22 * dpr)
    hctx.fillText(`${t('microcosm.hud.herbivores','Herbivores')}: ${stats.herbs}`, x + 14 * dpr, y + 40 * dpr)
    hctx.fillText(`${t('microcosm.hud.predators','Prédateurs')}: ${stats.preds}`, x + 14 * dpr, y + 58 * dpr)
    hctx.fillText(`${t('microcosm.hud.food','Nourriture')}: ${stats.food}`, x + 140 * dpr, y + 40 * dpr)
    hctx.fillText(`Zoom: ${camera.zoom.toFixed(1)}x`, x + 140 * dpr, y + 58 * dpr)
    hctx.fillText(`Pos: ${Math.round(camera.x)}, ${Math.round(camera.y)}`, x + 14 * dpr, y + 76 * dpr)
    hctx.fillText(`Perf: ${perf ? 'ON' : 'OFF'}`, x + 140 * dpr, y + 76 * dpr)
    const trailsLabel = vis.trailsEnabled ? (vis.trailColorMode === 'byGenome' ? 'colored' : 'mono') : 'off'
    hctx.fillText(`${t('microcosm.controls.trails','Traînées')}: ${trailsLabel}`, x + 14 * dpr, y + 94 * dpr)
    hctx.fillText(t('microcosm.hud.hint1','Molette=zoom • Glisser=déplacer • Clic cellule=infos'), x + 14 * dpr, y + 112 * dpr)
    hctx.fillText(t('microcosm.hud.hint2','Clic vide=menu • Ctrl/Shift/Alt+clic=direct'), x + 14 * dpr, y + 130 * dpr)
  }

  // Handlers
  const handleSettingsChange = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const handleVisSettingsChange = (newVis: Partial<VisSettings>) => {
    setVis((prev) => ({ ...prev, ...newVis }))
  }

  const handlePresetChange = (key: string) => {
    const preset = PRESETS[key]
    setPresetKey(key)
    const merged = { ...settings, ...preset }
    setSettings(merged)
    resetWorld(merged)
  }

  const handleSelectCell = (cellId: number) => {
    const world = worldRef.current
    const cell = world.cells.find((c) => c.id === cellId)
    if (cell) {
      setSelectedCell(cell)
    }
  }

  const handleContextMenuAction = (action: "food" | "toxin" | "predator") => {
    if (!contextMenu) return

    const { worldPos } = contextMenu

    switch (action) {
      case "food":
        dropFoodCluster(worldPos, 16)
        break
      case "toxin":
        spawnToxin(worldPos)
        break
      case "predator":
        spawnPredator(worldPos)
        break
    }

    setContextMenu(null)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{t('microcosm.header.title','Microcosm — Vie artificielle')}</h1>
              <p className="text-slate-200 text-sm mt-1">{t('microcosm.header.subtitle','Un écosystème émergent proie–prédateur, où chaque créature possède un petit génome. Explorez avec la molette et Ctrl+glisser.')}</p>
            </div>
            <div className="hidden md:flex gap-4 text-sm items-center">
              <div className="text-center">
                <div className="text-emerald-400 font-mono text-lg">{stats.herbs}</div>
                <div className="text-slate-500 text-xs">{t('microcosm.stats.herbivores','Herbivores')}</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-mono text-lg">{stats.preds}</div>
                <div className="text-slate-500 text-xs">{t('microcosm.stats.predators','Prédateurs')}</div>
              </div>
              <div className="text-center">
                <div className="text-cyan-400 font-mono text-lg">{stats.food}</div>
                <div className="text-slate-500 text-xs">{t('microcosm.stats.food','Nourriture')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Canvas */}
        <div ref={containerRef} className="flex-1 relative overflow-hidden">
          <canvas ref={canvasRef} className={`block w-full h-full ${isDragging ? "cursor-grabbing" : "cursor-grab"}`} />
          <canvas ref={hudRef} className="pointer-events-none absolute inset-0" />

          {/* Cell info panel */}
          {selectedCell && (
          <CellInfoPanel
              cell={selectedCell}
              onClose={() => {
                setSelectedCell(null)
                setIsTracking(false)
              }}
              onSelectCell={handleSelectCell}
              allCells={worldRef.current.cells}
              t={t}
              isTracking={isTracking}
              onToggleTracking={() => {
                setIsTracking((v) => {
                  const next = !v
                  if (next && selectedCell) {
                    const camera = cameraRef.current
                    camera.x = selectedCell.pos.x
                    camera.y = selectedCell.pos.y
                  }
                  return next
                })
              }}
              currentTime={worldRef.current.t}
            />
          )}

          {contextMenu && (
            <ContextMenu
              position={contextMenu.position}
              onAction={handleContextMenuAction}
              onClose={() => setContextMenu(null)}
              t={t}
            />
          )}
        </div>

        {/* Control panel */}
        <div className="lg:w-96 p-4 border-l border-slate-800 bg-slate-900/30 backdrop-blur-sm overflow-y-auto">
          <ControlPanel
            settings={settings}
            visSettings={vis}
            presetKey={presetKey}
            running={running}
            stats={stats}
            onSettingsChange={handleSettingsChange}
            onVisSettingsChange={handleVisSettingsChange}
            onPresetChange={handlePresetChange}
            onToggleRun={toggleRun}
            onReset={resetWorld}
            onSnapshot={snapshot}
            t={t}
            onSpawnFood={() => {
              const camera = cameraRef.current
              dropFoodCluster(
                {
                  x: camera.x + rand(-200, 200),
                  y: camera.y + rand(-200, 200),
                },
                28,
              )
            }}
            onSpawnToxin={() => {
              const camera = cameraRef.current
              spawnToxin({
                x: camera.x + rand(-200, 200),
                y: camera.y + rand(-200, 200),
              })
            }}
            onSpawnPredator={() => {
              const camera = cameraRef.current
              spawnPredator({
                x: camera.x + rand(-200, 200),
                y: camera.y + rand(-200, 200),
              })
            }}
          />
        </div>
      </div>
    </div>
  )
}
