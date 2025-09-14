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
  // Social following lifecycle
  isFollowingParent?: boolean
  followUntil?: number // world.t time until which it follows
  // Infection state (toxin-borne, light SIR-like)
  infectionState?: "susceptible" | "infected" | "recovered" | "immune"
  infectedUntil?: number // world.t when infection ends
  immuneUntil?: number // world.t until which immunity lasts (for recovered)
  naturallyImmune?: boolean // born immune (baseline immunity)
  reproBlockedUntil?: number // cannot reproduce until this time (after contamination)
  lastSpreadAt?: number // last time this cell attempted to spread
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
  // Social following settings
  socialFollowEnabled: boolean
  socialFollowDuration: number // ticks the juvenile follows the parent
  socialFollowStrength: number // force multiplier toward parent
  socialRebelProb: number // probability the child ignores social model
  // Infection/toxin parameters
  toxinInfectProb: number // per-tick probability to get infected when inside toxin radius
  infectionDuration: number // ticks being infected
  infectionImmunityDuration: number // ticks of immunity after recovery
  infectionNaturalImmunityRate: number // chance a new cell is permanently immune
  infectionExtraDrain: number // extra energy lost per tick when infected
  infectionReproBlockDuration: number // ticks reproduction is blocked since contamination
  infectionTransmitRadius: number // px
  infectionR0: number // target basic reproduction number (lightweight)
  infectionSpreadCooldown: number // min ticks between two spreads by same carrier
  toxinProximityDrain: number // extra energy drain per tick when inside toxin radius (scaled by strength)
  toxinDigestMultiplier: number // multiplier to energy gain from food when inside toxin (0..1)
}

export type VisSettings = {
  trailsEnabled: boolean
  trailColorMode: "mono" | "byGenome"
  perfMode?: boolean
}

export type CellTrackingInfo = {
  cell: Cell
  visible: boolean
  position: Vec2
}
