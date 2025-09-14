import type { Vec2 } from "./types"

// Utilitaires mathématiques pour Microcosm
export const rand = (a = 0, b = 1) => a + Math.random() * (b - a)
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

export const dist2 = (a: Vec2, b: Vec2) => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}

export const norm = (v: Vec2) => {
  const m = Math.hypot(v.x, v.y) || 1
  return { x: v.x / m, y: v.y / m }
}

export const add = (a: Vec2, b: Vec2) => ({ x: a.x + b.x, y: a.y + b.y })
export const sub = (a: Vec2, b: Vec2) => ({ x: a.x - b.x, y: a.y - b.y })
export const mul = (a: Vec2, s: number) => ({ x: a.x * s, y: a.y * s })

export const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
