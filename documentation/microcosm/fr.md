# Microcosm — Vie artificielle (Documentation)

Microcosm est un écosystème émergent proie–prédateur rendu sur un canvas HTML, avec caméra (pan/zoom), rendu de traînées, hachage spatial pour la simulation, et un HUD séparé pour un rendu net. Ce document décrit le fonctionnement et l’usage.

- Code : `components/experiences/microcosm/`
- Page : `app/experiences/microcosm/page.tsx`

## Vue d’ensemble

- Monde : espace 2D continu (par défaut 4000×3000) avec un effet « infini » (pas d’enfermement ni rebond forcé des cellules).
- Entités :
  - Cellules : herbivores et prédateurs, chacune avec un petit génome et une énergie.
  - Nourriture : petites sources d’énergie qui dérivent légèrement.
  - Toxines : zones circulaires qui repoussent et drainent l’énergie.
- Tick de simulation : une mise à jour par frame (dt≈1). Le rendu est séparé en deux couches.
- Rendu :
  - Couche « traînées » : marques éphémères dans l’espace monde (fondu de fond).
  - Couche « HUD » : overlay net pour cellules, nourriture, toxines, et texte.
- Performance : culling strict par viewport, hachage spatial pour les recherches locales, mode performance manuel/auto.

## Contrôles

Souris / Touch
- Molette : zoom.
- Glisser : déplacement (pan).
- Clic sur une cellule : panneau d’info ; suivi caméra on/off.
- Clic dans le vide : menu contextuel au curseur (actions ci‑dessous).
- Ctrl+clic : largue un paquet de nourriture au curseur.
- Shift+clic : génère une toxine au curseur.
- Alt+clic : génère un prédateur au curseur.

Clavier
- Espace : lecture/pause.
- R : reset du monde (conserve les réglages/preset actifs).
- S : enregistre une capture PNG du canvas.
- F : largue un paquet de nourriture près de la caméra.
- T : génère une toxine près de la caméra.
- P : génère un prédateur près de la caméra.
- Échap : ferme le panneau de cellule sélectionnée.

HUD
- Affiche FPS, compte d’entités, zoom, position caméra, mode de traînées, et indicateur « Perf : ON/OFF ».

## Caméra & Viewport

- La molette ajuste `camera.targetZoom` (interpolation douce chaque frame).
- Le pan modifie `camera.x/y` ; en mode suivi, la caméra effectue un easing vers la cellule.
- `isInViewport(camera, x, y, radius, width, height)` effectue un culling conservatif. Hors écran : non rendu mais simulation continue.

## Entités & Génome

Cellules
- Type : `herbivore` ou `predator`.
- Génome par cellule :
  - `hue` : teinte base (0..360).
  - `size` : rayon visuel en px.
  - `maxSpeed` : vitesse max.
  - `sense` : rayon de perception.
  - `efficiency` : conversion nourriture → énergie.
- État : `pos`, `vel`, `energy`, `age`, cooldown `cd` (prédateurs), faim (dérivée du temps depuis le dernier repas), flags de suivi social.

Nourriture
- `value` : énergie gagnée à l’ingestion. Dérive légèrement dans le temps.

Toxines
- `radius`, `strength` : repoussent les cellules et réduisent leur énergie.

## Modèle de simulation

Énergie & Métabolisme
- Chaque tick, les cellules perdent de l’énergie via `metabolism` (prédateurs ×1,4).
- Les herbivores mangent la nourriture à portée. Les prédateurs mordent les herbivores à portée.

Forces & Mouvement
- Accumulation par tick : évitement des toxines, recherche de cibles (nourriture/proies), suivi social, anti‑entassement, errance (bruit).
- Intégration de la vitesse, clamp à `maxSpeed`, amortissement `worldFriction`, puis mise à jour de position.

Recherche
- Herbivores : trouvent la nourriture la plus proche dans `sense` et convergent ; ingestion à portée.
- Prédateurs : trouvent l’herbivore le plus proche dans `sense` ; morsure si contact et cooldown OK.

Prédation & Vol de vie
- Morsure si `bodyRange = predator.size + prey.size + predAttackRange` et `cd <= 0` :
  - Proie : `energy -= predAttackDamage`.
  - Prédateur : `energy += predAttackDamage * predLifesteal`.
  - Prédateur : `cd = predAttackCooldown`.

Défense en meute
- On compte les herbivores dans `herdDefenseRange` autour du prédateur.
- Si défenseurs ≥ `herdDefenseCount` : dégâts par tick au prédateur = `herdDefenseDamage * (1 + stacks)` (stacks limités par `herdDefenseMaxStacks`).
- Une petite répulsion du prédateur par la proie s’applique en « mobbing ».

Suivi social
- L’enfant peut suivre son parent si `socialFollowEnabled` et non « rebelle » (voir réglages).
- Tant que `followUntil` est actif, une force douce attire l’enfant vers le parent. Ligne en pointillé affichée hors mode perf.

Anti‑entassement
- Si de nombreux voisins sont proches (rayon 42), on s’écarte doucement du centroïde local.

Reproduction (Duplication)
- Conditions (testées à chaque tick) :
  - `energy > splitThreshold`.
  - Densité locale : dans un rayon de 40px, si plus de 10 voisins de même type → reproduction bloquée.
  - Plafond global : `world.cells.length + enfants_ajoutés_ce_tick < maxEntitiesCap`.
- Si déclenché :
  - Parent : `energy -= reproductionCost`.
  - Enfant : créé près du parent, ~40% de l’énergie actuelle du parent, légère vitesse aléatoire, génome muté selon `mutationRate`.
  - Suivi social possible pour `socialFollowDuration` ticks.

Mort
- Si énergie ≤ −8, la cellule meurt et laisse 2..5 nourritures autour d’elle.

## Réglages

Défauts : voir `components/experiences/microcosm/constants.ts` (`DEFAULTS`). Tous réglables via le panneau.

Coeur
- `initialHerbivores`, `initialPredators` : quantités initiales.
- `foodCount`, `foodValue`, `toxinCount`.
- `metabolism`, `worldFriction`.
- `mutationRate`.
- `splitThreshold`, `reproductionCost`, `maxEntitiesCap`.
- `wallBounce` : héritage (monde ouvert, cellules non contraintes).

Combat
- `predAttackRange`, `predAttackDamage`, `predAttackCooldown`, `predLifesteal`.
- `herdDefenseRange`, `herdDefenseCount`, `herdDefenseDamage`, `herdDefenseMaxStacks`.

Social
- `socialFollowEnabled`, `socialFollowDuration`, `socialFollowStrength`, `socialRebelProb`.

Visuel
- `trailFade` (fondu d’arrière‑plan pour les traînées).
- Mode de traînées : `byGenome` (couleurs) ou `mono`.
- Mode performance (manuel) + auto‑perf (voir ci‑dessous).

## Presets

Définis dans `constants.ts` (`PRESETS`) :
- Gentle Soup : équilibre doux, couleurs pastel, émergence lente (plus de nourriture, métabolisme modéré).
- Neon Night : faible population, contraste fort, mouvements élégants (moins de nourriture, métabolisme plus élevé, plus de prédateurs).
- Predator–Prey Chaos : dynamique très active (davantage de prédateurs, mutation plus rapide, combat/social ajustés).
- Slow Garden : économie d’énergie, reproduction rare, ambiance contemplative.

Au changement de preset, le monde est réinitialisé avec la configuration fusionnée (le preset remplace les valeurs en cours) pour garantir que les quantités initiales correspondent exactement au preset.

## Rendu & Performance

Couches
- Traînées : en espace monde, effacées par fondu. Pendant l’interaction (zoom/pan) on peut suspendre le tracé des traînées.
- HUD : nourriture, toxines, cellules (sans accumulation de traînées), texte.

Culling
- `isInViewport` filtre le rendu pour chaque entité ; hors écran = pas rendu, mais simulation continue.

Hachage spatial
- Grille uniforme par frame (cellule = 64px) indexant herbivores, prédateurs, nourriture, toxines.
- Les requêtes locales remplacent les scans O(n²) : recherche de cibles, prédation, défense en meute, anti‑entassement, test de densité pour la reproduction.

Mode performance
- Bascule manuelle dans l’UI.
- Auto‑perf toujours considéré en interne (pas de réglage utilisateur). Hystérésis :
  - ON : FPS < 28 OU cellules ≥ 3000.
  - OFF : FPS > 34 ET cellules < 2000 ; OFF aussi si on est très dézoomé et < 3000 cellules sans faibles FPS.
- Effets quand le mode perf est actif :
  - Traînées : décimation 1/n selon zoom/population ; `fillRect` en zoom faible.
  - Nourriture : `fillRect` en zoom faible.
  - Toxines : cercle plein (pas de dégradé).
  - Cellules : pas de glow/ombres ; ligne parent‑enfant masquée ; trait directionnel omis si zoom faible ou forte densité.
- HUD affiche `Perf : ON/OFF`.

## Interactions & Panneaux

- Panneau cellule : génome/stats, suivi on/off, navigation.
- Menu contextuel (clic vide) : nourriture, toxine, prédateur au curseur.
- Presets : appliquent et réinitialisent le monde immédiatement avec ces valeurs.
- Snapshot : exporte le canvas principal en PNG.

## Notes développeur

- Fichiers clés :
  - Logique/UI : `microcosm.tsx` (hooks, boucle, simulation, rendu, contrôles).
  - Caméra : `camera.ts` (transformations monde↔écran, `isInViewport`).
  - Types : `types.ts`.
  - Constantes/Presets : `constants.ts`.
  - Panneaux : `control-panel.tsx`, `cell-info-panel.tsx`, `context-menu.tsx`.
- Réglage du hachage :
  - `GRID_SIZE = 64` couvre les rayons de `sense` usuels (≈22–64). Augmenter pour moins de buckets (moins d’overhead), diminuer pour des requêtes plus fines.
- Ajouter un preset : le déclarer dans `PRESETS` ; le panneau le listera automatiquement ; utiliser `resetWorld(merged)` pour conserver les quantités initiales exactes.
- Étendre les entités : ajouter une grille dédiée si ces entités participent aux interactions locales.

## Dépannage

- « La reproduction s’arrête » ?
  - Vérifier la densité locale (crowding), `splitThreshold` vs. nourriture/métabolisme, et `maxEntitiesCap`.
- « Scintillement » ?
  - En mode perf, la décimation des traînées est stable par `id` ; les corps ne sont pas décimés. Vérifier que seul le tracé des traînées est réduit.
- « FPS bas même avec Perf ON » ?
  - Réduire les traînées ; augmenter `trailFade` ; baisser les cibles/populations ; zoomer ; ou réduire les toxines (dégradés désactivés en mode perf).
