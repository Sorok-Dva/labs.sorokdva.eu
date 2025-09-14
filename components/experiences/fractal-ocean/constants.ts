import type { DroneSettings } from "./types"

export const DRONE_DEFAULTS: DroneSettings = {
  droneCount: 130,
  maxSpeed: 160,
  cohesionWeight: 0.55,
  alignmentWeight: 0.8,
  separationWeight: 1.4,
  influenceRadius: 140,
  trailLength: 12,
  audioEnabled: true,
  autopilotDelay: 12000,
}

export const DRONE_PRESETS: Record<string, Partial<DroneSettings> & { label: string; hint: string }> = {
  gentle: {
    label: "Doux",
    hint: "Mouvement fluide et harmonieux",
    droneCount: 80,
    maxSpeed: 120,
    cohesionWeight: 0.4,
    alignmentWeight: 0.6,
    separationWeight: 1.0,
  },
  chaotic: {
    label: "Chaotique",
    hint: "Mouvement erratique et imprévisible",
    droneCount: 200,
    maxSpeed: 220,
    cohesionWeight: 0.8,
    alignmentWeight: 1.2,
    separationWeight: 2.0,
  },
  swarm: {
    label: "Essaim",
    hint: "Formation dense et coordonnée",
    droneCount: 150,
    maxSpeed: 140,
    cohesionWeight: 0.9,
    alignmentWeight: 0.9,
    separationWeight: 1.8,
  },
  minimal: {
    label: "Minimal",
    hint: "Petit groupe contemplatif",
    droneCount: 30,
    maxSpeed: 100,
    cohesionWeight: 0.3,
    alignmentWeight: 0.5,
    separationWeight: 0.8,
  },
}

export const HELP_TEXTS = {
  droneCount: "Nombre total de drones dans l'essaim. Plus il y en a, plus les patterns émergents sont complexes.",
  maxSpeed: "Vitesse maximale des drones. Affecte la fluidité et la réactivité de l'essaim.",
  cohesionWeight: "Force d'attraction vers le centre du groupe. Plus élevé = essaim plus compact.",
  alignmentWeight: "Tendance à suivre la direction du groupe. Plus élevé = mouvement plus coordonné.",
  separationWeight: "Force de répulsion pour éviter les collisions. Plus élevé = drones plus espacés.",
  influenceRadius: "Rayon d'influence du drone leader sur les autres drones.",
  trailLength: "Longueur des traînées lumineuses laissées par les drones.",
  audioEnabled: "Active la synthèse sonore réactive basée sur les mouvements de l'essaim.",
  autopilotDelay: "Délai avant activation du mode autonome en cas d'inactivité (en millisecondes).",
}
