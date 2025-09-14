"use client"

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'

// ----------------------------
// Utils — couleurs & easing
// ----------------------------
const BG = '#0B0F14'

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x))

// Gradient ambre -> cyan -> magenta en fonction de r in [0,1]
const radiusToRGB = (r: number, energy: number) => {
  const e = clamp(energy, 0, 1)
  // 0..0.5: ambre -> cyan, 0.5..1: cyan -> magenta
  if (r < 0.5) {
    const t = r / 0.5
    const R = lerp(255, 0, t)
    const G = lerp(160, 255, t)
    const B = lerp(64, 255, t)
    // moduler par l'énergie
    return new THREE.Color((R / 255) * (0.7 + 0.3 * e), (G / 255) * (0.7 + 0.3 * e), (B / 255) * (0.7 + 0.3 * e))
  } else {
    const t = (r - 0.5) / 0.5
    const R = lerp(0, 255, t)
    const G = lerp(255, 0, t)
    const B = lerp(255, 255, t)
    return new THREE.Color((R / 255) * (0.7 + 0.3 * e), (G / 255) * (0.6 + 0.4 * (1 - e)), (B / 255) * (0.8 + 0.2 * e))
  }
}

// ----------------------------
// Génération disposition phyllotaxie
// ----------------------------
function generatePhyllotaxis(count: number, scale: number) {
  const goldenAngle = THREE.MathUtils.degToRad(137.5)
  const pos = new Float32Array(count * 3)
  const radius = new Float32Array(count)
  const angle = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const a = i * goldenAngle
    const r = Math.sqrt(i + 0.5)
    const x = Math.cos(a) * r * scale
    const y = Math.sin(a) * r * scale
    pos[i * 3 + 0] = x
    pos[i * 3 + 1] = y
    pos[i * 3 + 2] = 0
    radius[i] = r
    angle[i] = a
  }
  // Normaliser radius 0..1 pour les couleurs
  const maxR = Math.sqrt(count + 0.5)
  for (let i = 0; i < count; i++) radius[i] = radius[i] / maxR
  return { pos, radius, angle, maxR }
}

// ----------------------------
// Shaders — sprites ronds avec halo doux
// ----------------------------
const vertexShader = /* glsl */`
  attribute float aRadius;
  attribute float aEnergy;
  varying float vRadius;
  varying float vEnergy;
  void main() {
    vRadius = aRadius;
    vEnergy = aEnergy;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Taille en pixels modulée par énergie
    float size = 1.5 + 1.5 * vEnergy;
    gl_PointSize = size * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = /* glsl */`
  precision highp float;
  varying float vRadius;
  varying float vEnergy;
  uniform float uTime;
  // Couleur paramétrée en CPU via setUniforms per frame
  uniform vec3 uColorA;
  void main() {
    // Disque doux avec halo
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float d = length(p);
    float alpha = smoothstep(1.0, 0.6, d);
    // léger halo pulsant
    float halo = 0.15 + 0.1 * sin(uTime * 0.8 + vRadius * 12.0);
    alpha *= (1.0 - smoothstep(0.5 - halo, 1.0, d));
    vec3 col = uColorA;
    gl_FragColor = vec4(col, alpha);
  }
`

// ----------------------------
// Comportements — micro-flocking + flowfield + pulses
// ----------------------------
function useSpiralSimulation(count: number, scale: number) {
  const { pos, radius, angle } = useMemo(() => generatePhyllotaxis(count, scale), [count, scale])
  const velocities = useMemo(() => new Float32Array(count * 2), [count])
  const energy = useMemo(() => new Float32Array(count), [count])
  
  // Pulses enregistrées
  const pulses = useRef<{ x: number, y: number, t: number }[]>([])
  const addPulse = useCallback((x: number, y: number) => {
    pulses.current.push({ x, y, t: performance.now() / 1000 })
    if (pulses.current.length > 8) pulses.current.shift()
  }, [])
  
  // Curseur
  const cursor = useRef({ x: 0, y: 0, active: false })
  const setCursor = useCallback((x: number, y: number, active: boolean) => {
    cursor.current.x = x
    cursor.current.y = y
    cursor.current.active = active
  }, [])
  
  // Mise à jour par frame
  const update = useCallback((dt: number, time: number) => {
    const sepStrength = 12
    const cohStrength = 0.6
    const aliStrength = 0.4
    const mouseStrength = 24
    const mouseRadius = 80
    
    const flowAmp = 4
    const flowFreq = 0.15
    
    const breath = 1.0 + 0.02 * Math.sin(time * 0.2)
    
    for (let i = 0; i < count; i++) {
      const ix = i * 3
      const iv = i * 2
      let x = pos[ix + 0]
      let y = pos[ix + 1]
      
      // voisins le long de la spirale (rapide et crédible visuellement)
      let vx = 0
      let vy = 0
      let nx = 0
      let ny = 0
      let countN = 0
      
      const span = 8 // voisins index +-span
      for (let k = -span; k <= span; k++) {
        if (k === 0) continue
        const j = i + k
        if (j < 0 || j >= count) continue
        const jx = j * 3
        const dx = pos[jx + 0] - x
        const dy = pos[jx + 1] - y
        const d2 = dx * dx + dy * dy
        if (d2 < 1e-6) continue
        const d = Math.sqrt(d2)
        // séparation forte si trop proche
        const desired = 10
        const sep = clamp((desired - d) / desired, 0, 1)
        vx -= (dx / d) * sep * sepStrength
        vy -= (dy / d) * sep * sepStrength
        // cohésion
        nx += pos[jx + 0]
        ny += pos[jx + 1]
        countN++
        // alignement
        const jv = j * 2
        vx += velocities[jv + 0] * aliStrength * 0.03
        vy += velocities[jv + 1] * aliStrength * 0.03
      }
      
      if (countN > 0) {
        nx /= countN
        ny /= countN
        vx += (nx - x) * cohStrength * 0.02
        vy += (ny - y) * cohStrength * 0.02
      }
      
      // Flow field doux (respiration)
      const a = angle[i]
      const fx = Math.cos(a * 0.5 + time * flowFreq) * flowAmp * 0.05
      const fy = Math.sin(a * 0.5 - time * flowFreq * 1.2) * flowAmp * 0.05
      vx += fx
      vy += fy
      
      // Attraction / répulsion du curseur selon la distance
      if (cursor.current.active) {
        const dxm = cursor.current.x - x
        const dym = cursor.current.y - y
        const dm2 = dxm * dxm + dym * dym
        const dm = Math.sqrt(dm2) + 1e-6
        const mInfluence = clamp(1 - dm / mouseRadius, 0, 1)
        // si très près -> répulsion, sinon légère attraction
        const dir = dm < mouseRadius * 0.35 ? -1 : 1
        vx += (dxm / dm) * mouseStrength * mInfluence * 0.05 * dir
        vy += (dym / dm) * mouseStrength * mInfluence * 0.05 * dir
      }
      
      // Pulses circulaires qui se propagent
      for (const p of pulses.current) {
        const age = time - p.t
        if (age > 3) continue
        const dxp = p.x - x
        const dyp = p.y - y
        const dp = Math.sqrt(dxp * dxp + dyp * dyp) + 1e-6
        const wave = Math.sin(dp * 0.08 - age * 6.0)
        const atten = Math.exp(-dp * 0.01) * Math.exp(-age * 0.8)
        vx += (dxp / dp) * wave * atten * 50 * 0.016
        vy += (dyp / dp) * wave * atten * 50 * 0.016
      }
      
      // Intégration
      velocities[iv + 0] = velocities[iv + 0] * 0.96 + vx * dt
      velocities[iv + 1] = velocities[iv + 1] * 0.96 + vy * dt
      
      pos[ix + 0] = x + velocities[iv + 0] * breath
      pos[ix + 1] = y + velocities[iv + 1] * breath
      
      // Énergie = vitesse normalisée
      const speed = Math.hypot(velocities[iv + 0], velocities[iv + 1])
      energy[i] = clamp(speed / 20, 0, 1)
    }
  }, [angle, count, pos, velocities, energy])
  
  return { pos, radius, energy, update, addPulse, setCursor }
}

// ----------------------------
// PointsShader — rendu GPU des sprites lumineux
// ----------------------------
function PointsShader({ count, pos, radius, energy }: { count: number, pos: Float32Array, radius: Float32Array, energy: Float32Array }) {
  const geomRef = useRef<THREE.BufferGeometry>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const { clock } = useThree()
  
  useFrame(() => {
    if (geomRef.current) {
      const attrs = geomRef.current.attributes as any
      if (attrs.position) attrs.position.needsUpdate = true
      if (attrs.aEnergy) attrs.aEnergy.needsUpdate = true
    }
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime()
      const t = Math.sin(clock.getElapsedTime() * 0.1) * 0.5 + 0.5
      matRef.current.uniforms.uColorA.value = radiusToRGB(t, 0.9)
    }
  })
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color('#ffffff') }
  }), [])
  
  return (
    <points>
      <bufferGeometry ref={geomRef}>
        {/* IMPORTANT: on attache directement les Float32Array de la sim */}
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
        <bufferAttribute attach="attributes-aRadius" args={[radius, 1]} />
        <bufferAttribute attach="attributes-aEnergy" args={[energy, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
      />
    </points>
  )
}

// ----------------------------
// SpiralSwarm — combine simulation + rendu + interactions
// ----------------------------
function SpiralSwarm({ count = 12000 }: { count?: number }) {
  const { mouse, viewport } = useThree()
  
  const scale = useMemo(() => {
    const base = Math.min(viewport.width, viewport.height)
    return base * 0.04
  }, [viewport])
  
  const { pos, radius, energy, update, addPulse, setCursor } = useSpiralSimulation(count, scale)
  
  useFrame((_, dt) => {
    const t = performance.now() / 1000
    update(Math.min(dt, 0.033), t)
  })
  
  // Handlers souris (utiliser mouse.x/y convertis en coords monde)
  const onPointerMove = useCallback(() => {
    const x = (mouse.x * viewport.width) / 2
    const y = (mouse.y * viewport.height) / 2
    setCursor(x, y, true)
  }, [mouse, viewport, setCursor])
  
  const onPointerOut = useCallback(() => setCursor(0, 0, false), [setCursor])
  
  const onClick = useCallback(() => {
    const x = (mouse.x * viewport.width) / 2
    const y = (mouse.y * viewport.height) / 2
    addPulse(x, y)
  }, [mouse, viewport, addPulse])
  
  return (
    <group onPointerMove={onPointerMove} onPointerOut={onPointerOut} onClick={onClick}>
      <PointsShader count={count} pos={pos} radius={radius} energy={energy} />
    </group>
  )
}


// ----------------------------
// Camera & Scene wrapper
// ----------------------------
function OrthoRig() {
  const { camera, size } = useThree()
  useEffect(() => {
    const aspect = size.width / size.height
    const frustum = 200
    // @ts-ignore
    camera.left = -frustum * aspect
    // @ts-ignore
    camera.right = frustum * aspect
    // @ts-ignore
    camera.top = frustum
    // @ts-ignore
    camera.bottom = -frustum
    // @ts-ignore
    camera.near = -1000
    // @ts-ignore
    camera.far = 1000
    camera.position.set(0, 0, 10)
    // @ts-ignore
    camera.updateProjectionMatrix()
  }, [camera, size])
  return null
}

// ----------------------------
// UI overlay discrète (instructions)
// ----------------------------
function Overlay() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-end justify-between p-4 text-xs tracking-wide text-slate-300/70">
      <div>
        <p>Spirale de vie — phyllotaxie vivante</p>
      </div>
      <div className="text-right">
        <p>Déplacez la souris pour influencer l’essaim</p>
        <p>Cliquez pour émettre une onde</p>
      </div>
    </div>
  )
}

// ----------------------------
// Composant exporté — prêt à intégrer dans votre Labs
// ----------------------------
export default function LivingPrism() {
  return (
    <div className="relative h-screen w-full bg-[#0B0F14]">
      <Canvas orthographic dpr={[1, 2]} gl={{ antialias: true, alpha: false }} onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color(BG))
        // gl.physicallyCorrectLights = false
      }}>
        <OrthoRig />
        <SpiralSwarm count={14000} />
        <EffectComposer>
          <Bloom intensity={0.6} luminanceThreshold={0.0} luminanceSmoothing={0.9} mipmapBlur />
          <Noise opacity={0.025} />
          <Vignette darkness={0.6} eskil={false} offset={0.2} />
        </EffectComposer>
      </Canvas>
      <Overlay />
    </div>
  )
}
