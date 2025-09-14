# Microcosm — Artificial Life (Documentation)

Microcosm is an emergent predator–prey ecosystem rendered on HTML canvas with a camera (pan/zoom), trail rendering, spatial hashing for simulation, and a split HUD for crisp overlays. This document explains how it works and how to use and tune it.

- Code: `components/experiences/microcosm/`
- Page: `app/experiences/microcosm/page.tsx`

## Overview

- World: 2D continuous space (default 4000×3000) with an “infinite feel” (no wrapping/clamping of cells).
- Entities:
  - Cells: herbivores and predators, each with a tiny genome and energy state.
  - Food: small energy sources drifting slightly.
  - Toxins: circular areas that repel and drain energy.
- Simulation tick: one update per animation frame (dt≈1). Rendering is decoupled into two layers.
- Rendering:
  - Trails layer: ephemeral trails in world space (accumulated via background fade).
  - HUD layer: crisp overlay for cells, food, toxins, UI hints, and stats.
- Performance: strict viewport culling, spatial hashing for neighborhood queries, manual/auto performance mode.

## Controls

Mouse/Touch
- Wheel: zoom in/out.
- Drag: pan the view.
- Click on a cell: open info panel; can start/stop following (camera easing).
- Click empty space: open context menu at cursor (actions below).
- Ctrl+Click: drop a cluster of food at cursor.
- Shift+Click: spawn one toxin at cursor.
- Alt+Click: spawn one predator at cursor.

Keyboard
- Space: play/pause.
- R: reset world (keeps current settings/preset).
- S: save a PNG snapshot of the canvas.
- F: drop a cluster of food near camera.
- T: spawn a toxin near camera.
- P: spawn a predator near camera.
- Escape: close the selected cell panel.

HUD
- Displays FPS, entity counts, zoom, camera position, trail mode, and a Perf: ON/OFF indicator.

## Camera & Viewport

- `wheel` adjusts `camera.targetZoom` smoothly (interpolated each frame).
- Panning updates camera x/y; when following a selected cell, the camera eases toward it.
- `isInViewport(camera, x, y, radius, width, height)` performs conservative culling. Off‑screen entities continue to simulate but are not drawn.

## Entities & Genome

Cells
- Kind: `herbivore` or `predator`.
- Genome per cell:
  - `hue`: base color (0..360).
  - `size`: visual radius in px.
  - `maxSpeed`: movement speed cap.
  - `sense`: perception radius for targets.
  - `efficiency`: food → energy conversion.
- State: `pos`, `vel`, `energy`, `age`, cooldown `cd` (predators), hunger (derived from time since last meal), social follow flags.

Food
- `value`: energy added on eat. Drifts slightly over time.

Toxins
- `radius`, `strength`: repel nearby cells and drain their energy.

## Simulation Model

Energy & Metabolism
- Each tick, cells lose energy by `metabolism` (predators pay ×1.4).
- Herbivores eat food within an eat radius. Predators bite herbivores in range.

Steering & Movement
- Forces are accumulated per tick: avoidance of toxins; seeking (food for herbivores, prey for predators); social following; anti‑crowding; roam noise.
- Velocity is integrated, clamped to `maxSpeed`, damped by `worldFriction`, then applied to position.

Seeking
- Herbivores: find nearest food within `sense` and steer toward it; eat when within reach.
- Predators: find nearest herbivore within `sense` and steer; bite on contact if cooldown allows.

Predation & Lifesteal
- Bite when within `bodyRange = predator.size + prey.size + predAttackRange` and `cd <= 0`:
  - Prey energy `-= predAttackDamage`.
  - Predator energy `+= predAttackDamage * predLifesteal`.
  - Predator `cd = predAttackCooldown`.

Herd Defense (anti‑predator)
- Count herbivores within `herdDefenseRange` around the predator.
- If defenders ≥ `herdDefenseCount`, the predator takes damage per tick: `herdDefenseDamage * (1 + stacks)` with capped stacks up to `herdDefenseMaxStacks`.
- Predator also gets a small repulsion from prey while mobbed.

Social Following
- New child may follow its parent if `socialFollowEnabled` and it is not “rebellious” (see settings).
- While `followUntil` is active, a small force pulls child toward the parent. A dotted line is drawn in non‑perf mode.

Anti‑crowding
- If many neighbors are close (radius 42), steer away from centroid gently to reduce clumping.

Reproduction (Duplication)
- Conditions (checked every tick):
  - `energy > splitThreshold`.
  - Local density: in a 40px radius, if more than 10 same‑kind neighbors → reproduction is blocked.
  - Global cap: `world.cells.length + childrenAddedThisTick < maxEntitiesCap`.
- When triggered:
  - Parent `energy -= reproductionCost`.
  - Create child near parent with ~40% of parent’s current energy, slight random velocity, and a mutated genome according to `mutationRate`.
  - Social follow may be enabled for the child for `socialFollowDuration` ticks.

Infection & Toxins (SIR‑light)
- Toxin proximity:
  - Inside a toxin radius, cells suffer extra energy drain per tick proportional to toxin strength (`toxinProximityDrain * strength`).
  - Digestion penalty: herbivores gain only a fraction of food energy while inside toxins (`toxinDigestMultiplier`).
- Contamination:
  - While inside a toxin, susceptible cells have a per‑tick infection probability (`toxinInfectProb`).
  - Infection lasts `infectionDuration` ticks; reproduction is blocked for `infectionReproBlockDuration` ticks since contamination.
  - While infected, cells lose additional energy per tick (`infectionExtraDrain`).
- Immunity & recovery:
  - After infection, cells recover and gain temporary immunity (`infectionImmunityDuration`).
  - Some are naturally immune from birth (`infectionNaturalImmunityRate`).
- Propagation (mild R0):
  - Infected cells can infect nearby same‑kind neighbors within `infectionTransmitRadius` using a small probability derived from `infectionR0`.
  - Cooldown `infectionSpreadCooldown` limits spread attempts (max ~1 neighbor per attempt).

Death
- If energy ≤ −8, the cell dies and drops 2..5 food pieces around its position.

## Settings

Defaults: see `components/experiences/microcosm/constants.ts` (`DEFAULTS`). All settings are user‑adjustable via the control panel.

Core
- `initialHerbivores`, `initialPredators`: initial counts.
- `foodCount`, `foodValue`, `toxinCount`.
- `metabolism`, `worldFriction`.
- `mutationRate`.
- `splitThreshold`, `reproductionCost`, `maxEntitiesCap`.
- `wallBounce`: legacy (world is effectively open; cells are not clamped).

Combat
- `predAttackRange`, `predAttackDamage`, `predAttackCooldown`, `predLifesteal`.
- `herdDefenseRange`, `herdDefenseCount`, `herdDefenseDamage`, `herdDefenseMaxStacks`.

Social
- `socialFollowEnabled`, `socialFollowDuration`, `socialFollowStrength`, `socialRebelProb`.

Visual
- `trailFade` (background fade for trail persistence).
- Trails toggle and color mode: `byGenome` or `mono`.
- Performance mode (manual), and automatic performance (see below).

## Presets

Defined in `constants.ts` (`PRESETS`):
- Gentle Soup: soft balance, pastel colors, slow emergence (more food, mild metabolism).
- Neon Night: low population, high contrast, elegant motion (lower food, higher metabolism, more predators).
- Predator–Prey Chaos: very active dynamics (many predators, faster mutation, tweaked combat and social).
- Slow Garden: energy‑saving, rare reproduction, contemplative feeling.

When switching presets, the world is reset with the merged settings (preset overrides current settings) to guarantee the seeded counts match the preset.

## Rendering & Performance

Layers
- Trails: rendered in world space with a translucent fill; cleared by fading the background. Skips drawing while interacting (zoom/pan) if trails are enabled.
- HUD: food, toxins, and cells drawn with crisp styles (no trail accumulation) plus UI text.

Viewport Culling
- Rendering checks `isInViewport` for every entity; off‑screen entities are not drawn but still simulated.

Spatial Hashing
- Per‑frame uniform grid (cell = 64 px) indexes herbivores, predators, food, and toxins.
- Local queries replace O(n²) scans for: seeking, predation, herd defense, anticrowding, and reproduction density tests.

Performance Mode
- Manual toggle in UI.
- Auto‑perf is always considered internally (no user setting). Hysteresis:
  - Enable: FPS < 28 OR cells ≥ 3000.
  - Disable: FPS > 34 AND cells < 2000; also disable when extremely zoomed out if cells < 3000 and FPS is not low.
- Effects when performance is active:
  - Trails: draw 1/n entities based on zoom/population; use `fillRect` when zoomed out.
  - Food: `fillRect` at low zoom.
  - Toxins: solid circle (no gradient) at low cost.
  - Cells: no shadow blur; dotted parent‑child line hidden; direction hint line skipped if low zoom or many cells.
- HUD shows `Perf: ON/OFF`.

Visual indicators
- Infected: orange ring around the cell.
- Recovered: subtle green ring.
- Immune: no special indicator (to avoid clutter and confusion).

## Interactions & Panels

- Cell Info Panel: shows genome/stats, selection, and follow toggle.
- Context Menu (click empty space): spawn Food, Toxin, or Predator at cursor.
- Preset buttons: apply preset and reset the world with those values immediately.
- Snapshot: exports the main canvas as PNG.

## Developer Notes

- Important files:
  - Logic/UI: `microcosm.tsx` (hooks, loop, simulation, rendering, controls).
  - Camera: `camera.ts` (world↔screen transforms, `isInViewport`).
  - Types: `types.ts`.
  - Constants/Presets: `constants.ts`.
  - Panels: `control-panel.tsx`, `cell-info-panel.tsx`, `context-menu.tsx`.
- Tuning spatial hash:
  - `GRID_SIZE = 64` is chosen to cover typical `sense` radii (≈22–64). Increase for fewer buckets (less overhead) or decrease for more precise queries.
- Adding presets: add to `PRESETS` and the control panel auto‑lists them; ensure to reset with merged settings so seed counts match.
- Extending entities: consider adding a dedicated grid for new types if they participate in local interactions.

## Troubleshooting

- “Why does reproduction stall?”
  - Check local density (crowding), `splitThreshold` vs. food/metabolism, and `maxEntitiesCap`.
- “Why do cells flicker?”
  - In performance mode, trail decimation is stable by cell `id`, bodies are not decimated. If you see flicker, verify that only trails are decimated.
- “FPS low even with Perf ON?”
  - Reduce trails; increase `trailFade`; lower entity caps or food target; zoom in; or reduce toxin count (gradients off in perf mode).
Infection/Toxins
- `toxinInfectProb`, `infectionDuration`, `infectionImmunityDuration`, `infectionNaturalImmunityRate`.
- `infectionExtraDrain`, `infectionReproBlockDuration`, `infectionTransmitRadius`, `infectionR0`, `infectionSpreadCooldown`.
- `toxinProximityDrain`, `toxinDigestMultiplier`.
