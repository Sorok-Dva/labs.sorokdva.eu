export type Vec2 = { x: number; y: number }

export type Drone = {
  id: number
  pos: Vec2
  vel: Vec2
  angle: number
  color: string
  baseHue: number
  state: "free" | "leader" | "following"
  trail: Vec2[]
}

export type Formation = "default" | "compact" | "line" | "spiral"

export type DroneSettings = {
  droneCount: number
  maxSpeed: number
  cohesionWeight: number
  alignmentWeight: number
  separationWeight: number
  influenceRadius: number
  trailLength: number
  audioEnabled: boolean
  autopilotDelay: number
}

export type DroneStats = {
  totalDrones: number
  freeDrones: number
  followingDrones: number
  hasLeader: boolean
  currentFormation: Formation
  autopilotActive: boolean
}
