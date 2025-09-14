// Types pour l'expérience Microcosm
export type Vec2 = { x: number; y: number }

export type Genome = {
  hue: number // 0..360
  size: number // px
  maxSpeed: number
  sense: number // px
  efficiency: number // 0..1 (food -> energy)
}

export type Cell = {
  id: number
  pos: Vec2
  vel: Vec2
  energy: number
  genome: Genome
  kind: "herbivore" | "predator"
  age: number
  cd?: number // attack cooldown timer for predators
  parentId?: number
  children: number[]
  generation: number
  totalOffspring: number
  birthTime: number
  // Adaptive behavior state
  lastAteAt: number // world.t when last ate/bit
  hunger: number // 0..1 computed from time since lastAteAt
  roamDir: Vec2 // persistent exploration direction
  roamTimer: number // frames until choosing a new roamDir
}

export type Food = { id: number; pos: Vec2; value: number }

export type Toxin = { id: number; pos: Vec2; radius: number; strength: number }

export type Settings = {
  width: number
  height: number
  initialHerbivores: number
  initialPredators: number
  foodCount: number
  foodValue: number
  toxinCount: number
  trailFade: number
  worldFriction: number
  metabolism: number
  reproductionCost: number
  splitThreshold: number
  mutationRate: number
  wallBounce: number
  maxEntitiesCap: number
  predAttackRange: number
  predAttackDamage: number
  predAttackCooldown: number
  predLifesteal: number
  herdDefenseRange: number
  herdDefenseCount: number
  herdDefenseDamage: number
  herdDefenseMaxStacks: number
}

export type VisSettings = {
  trailsEnabled: boolean
  trailColorMode: "mono" | "byGenome"
}

export type CellTrackingInfo = {
  cell: Cell
  visible: boolean
  position: Vec2
}
