import type { Settings } from "./types"

export const DEFAULTS: Settings = {
  width: 1200,
  height: 720,
  initialHerbivores: 80,
  initialPredators: 6,
  foodCount: 450,
  foodValue: 12,
  toxinCount: 1,
  trailFade: 0.12,
  worldFriction: 0.985,
  metabolism: 0.02,
  reproductionCost: 16,
  splitThreshold: 38,
  mutationRate: 0.06,
  wallBounce: 0.7,
  maxEntitiesCap: 10000,
  predAttackRange: 14,
  predAttackDamage: 20,
  predAttackCooldown: 10,
  predLifesteal: 0.6,
  herdDefenseRange: 26,
  herdDefenseCount: 6,
  herdDefenseDamage: 2,
  herdDefenseMaxStacks: 4,
  // Social defaults
  socialFollowEnabled: true,
  socialFollowDuration: 240, // ~4s at 60fps, adjust as needed
  socialFollowStrength: 0.22,
  socialRebelProb: 0.12,
  // Infection defaults (light touch)
  toxinInfectProb: 0.03, // 3% per tick inside toxin
  infectionDuration: 900, // ~15s at 60fps
  infectionImmunityDuration: 1800, // ~30s immunity after recovery
  infectionNaturalImmunityRate: 0.08, // 8% born immune
  infectionExtraDrain: 0.01, // extra energy per tick while infected
  infectionReproBlockDuration: 600, // 10s block after contamination
  infectionTransmitRadius: 18,
  infectionR0: 0.6, // mild spread
  infectionSpreadCooldown: 20, // one spread attempt per ~0.33s
  toxinProximityDrain: 0.05, // scales with toxin strength each tick inside radius
  toxinDigestMultiplier: 0.5, // 50% energy gain from food while inside toxin
}

export const PRESETS: Record<string, Partial<Settings> & { label: string; hint: string }> = {
  gentleSoup: {
    label: "Gentle Soup",
    hint: "Équilibre doux, couleurs pastel, émergence lente",
    initialHerbivores: 120,
    initialPredators: 2,
    foodCount: 520,
    trailFade: 0.12,
    mutationRate: 0.04,
    metabolism: 0.017,
    socialFollowDuration: 300,
    socialRebelProb: 0.1,
  },
  neonNight: {
    label: "Neon Night",
    hint: "Peu de créatures, contrastes forts, mouvements élégants",
    initialHerbivores: 50,
    initialPredators: 10,
    foodCount: 300,
    trailFade: 0.01,
    mutationRate: 0.08,
    metabolism: 0.028,
    socialFollowDuration: 200,
    socialRebelProb: 0.14,
  },
  predatorChaos: {
    label: "Predator–Prey Chaos",
    hint: "Dynamique proie/prédateur très active",
    initialHerbivores: 100,
    initialPredators: 25,
    foodCount: 550,
    trailFade: 0.06,
    mutationRate: 0.3,
    metabolism: 0.01,
    reproductionCost: 5,
    splitThreshold: 25,
    predAttackDamage: 20,
    predAttackCooldown: 15,
    predAttackRange: 10,
    predLifesteal: 0.3,
    herdDefenseCount: 5,
    herdDefenseDamage: 0.8,
    herdDefenseRange: 20,
    socialFollowDuration: 120,
    socialRebelProb: 0.25,
  },
  slowGarden: {
    label: "Slow Garden",
    hint: "Économie d’énergie, reproduction rare, ambiance contemplative",
    initialHerbivores: 90,
    initialPredators: 3,
    foodCount: 600,
    trailFade: 0.1,
    mutationRate: 0.03,
    metabolism: 0.014,
    socialFollowDuration: 360,
    socialRebelProb: 0.08,
  },
}

export const HELP_TEXTS = {
  worldFriction:
    "Coefficient de friction globale. Plus proche de 1 = mouvement fluide et inertiel, plus bas = déplacements freinés.",
  mutationRate:
    "Probabilité qu’un enfant mute (couleur, taille, vitesse, sens, efficacité). Plus haut = diversité/chaos, plus bas = lignées stables",
  metabolism:
    "Coût énergétique par tick. Plus haut = créatures affamées, cycles rapides. Plus bas = univers contemplatif",
  trailFade: "Opacité du fondu d’arrière-plan. Faible = traînées longues et fluides. Élevé = rendu net (peu de traces)",
  foodCount:
    "Quantité cible de nourriture en circulation. Plus haut = écosystème abondant (explosions de population). Plus bas = pression sélective",
  foodValue:
    "Énergie rendue par chaque ressource alimentaire ingérée. Plus haut = populations qui croissent rapidement.",
  splitThreshold:
    "Énergie requise pour se diviser (reproduction). Plus haut = reproduction rare, lignées plus robustes",
  reproductionCost: "Coût énergétique de la division. Plus haut = les parents s’épuisent en se reproduisant",
  predAttackDamage: "Dégâts infligés par une morsure de prédateur. Plus haut = proies abattues plus vite",
  predAttackCooldown: "Frames entre deux morsures. Plus bas = attaques plus fréquentes",
  predAttackRange: "Portée de contact pour qu’une morsure connecte (autour des corps)",
  predLifesteal: "Part des dégâts convertie en énergie pour le prédateur (survie en mêlée)",
  herdDefenseCount: 'Nombre d’herbivores requis, proches du prédateur, pour déclencher le "mobbing"',
  herdDefenseDamage: 'Dégâts par tick infligés au prédateur par le groupe (échelle avec les "stacks")',
  herdDefenseRange: 'Portée à laquelle les herbivores sont comptés comme "défenseurs"',
  herdDefenseMaxStacks: "Nombre maximum de paliers additionnels au-dessus du seuil (limite la létalité en meute)",
  socialFollowDuration:
    "Durée pendant laquelle un enfant suit son parent après la naissance (en ticks).",
  socialFollowStrength:
    "Intensité de la force qui attire un enfant vers son parent. Plus haut = regroupement serré.",
  socialRebelProb:
    "Probabilité qu’un enfant ignore le suivi familial et parte explorer seul.",
  toxinInfectProb:
    "Probabilité par tick de contracter une infection lorsqu’on reste dans une zone toxique.",
  infectionDuration:
    "Durée pendant laquelle un organisme reste infecté avant de guérir automatiquement.",
  infectionImmunityDuration:
    "Temps d’immunité accordé après guérison avant de pouvoir se réinfecter.",
  infectionNaturalImmunityRate:
    "Part des nouveau-nés naturellement immunisés (0 = aucun, 0.5 = 50 %).",
  infectionExtraDrain:
    "Drain d’énergie supplémentaire subi par un organisme infecté chaque tick.",
  infectionReproBlockDuration:
    "Durée pendant laquelle la reproduction reste bloquée après une contamination.",
  infectionTransmitRadius:
    "Rayon de voisinage utilisé pour propager l’infection aux organismes proches.",
  infectionR0:
    "R0 cible approximatif. Plus haut = propagation agressive, plus bas = infection contenue.",
  toxinProximityDrain:
    "Drain d’énergie appliqué lorsqu’une créature reste à proximité d’une toxine (pondéré par la force).",
  toxinDigestMultiplier:
    "Coefficient appliqué aux calories récupérées en zone toxique (0 = aucune énergie, 1 = pas d’impact).",
}
