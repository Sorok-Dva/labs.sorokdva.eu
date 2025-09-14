'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

export default function FractalOcean() {
  return (
    <div className='relative h-[calc(100vh)] w-full bg-[#07090E]'>
      <Canvas gl={{ antialias: false, powerPreference: 'high-performance' }} dpr={[1, 2]}
              onCreated={({ gl }) => {
                gl.setClearColor(0x07090e, 1)
              }}>
        <FullScreenQuad />
      </Canvas>
      <UIOverlay />
    </div>
  )
}

// ------------------------------
// UI Overlay — minimal helper text
// ------------------------------
function UIOverlay() {
  return (
    <div className='pointer-events-none absolute inset-0 flex items-end justify-between p-4 text-xs text-white/60'>
      <div>
        <p>Océan fractal — scroll pour plonger · clic pour créer une onde · bouge la souris pour déformer</p>
      </div>
      <div className='text-right'>
        <p>Auto‑pilot après 4s d'inactivité</p>
      </div>
    </div>
  )
}

// ---------------------------------
// Full-screen quad with custom shader
// ---------------------------------
function FullScreenQuad() {
  const mesh = useRef<THREE.Mesh>(null)
  const { size, viewport } = useThree()
  
  // Interaction state
  const [targetZoom, setTargetZoom] = useState(0) // logarithmic zoom
  const [zoom, setZoom] = useState(0)
  const [lastInputAt, setLastInputAt] = useState(performance.now())
  
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5))
  const velocityRef = useRef(0)
  
  const clicksMax = 6
  const clicksRef = useRef(
    Array.from({ length: clicksMax }, () => ({ pos: new THREE.Vector2(-2, -2), t: -9999 }))
  )
  
  // Handlers
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      setTargetZoom(z => z + Math.sign(e.deltaY) * 0.12)
      setLastInputAt(performance.now())
    }
    const onPointerMove = (e: PointerEvent) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = 1 - (e.clientY - rect.top) / rect.height
      mouseRef.current.set(x, y)
      setLastInputAt(performance.now())
    }
    const onClick = (e: MouseEvent) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = 1 - (e.clientY - rect.top) / rect.height
      // register ripple in a circular buffer
      const now = performance.now() / 1000
      const slot = clicksRef.current.reduce((minIdx, c, i, arr) =>
        c.t < arr[minIdx].t ? i : minIdx, 0)
      clicksRef.current[slot].pos.set(x, y)
      clicksRef.current[slot].t = now
      setLastInputAt(performance.now())
    }
    
    const dom = document.querySelector('canvas')
    if (!dom) return
    dom.addEventListener('wheel', onWheel, { passive: true })
    dom.addEventListener('pointermove', onPointerMove)
    dom.addEventListener('click', onClick)
    return () => {
      dom.removeEventListener('wheel', onWheel)
      dom.removeEventListener('pointermove', onPointerMove)
      dom.removeEventListener('click', onClick)
    }
  }, [])
  
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: fragmentShader,
    uniforms: {
      u_time: new THREE.Uniform(0),
      u_res: new THREE.Uniform(new THREE.Vector2(size.width, size.height)),
      u_zoom: new THREE.Uniform(0),
      u_mouse: new THREE.Uniform(new THREE.Vector2(0.5, 0.5)),
      u_aspect: new THREE.Uniform(size.width / size.height),
      u_velocity: new THREE.Uniform(0),
      u_auto: new THREE.Uniform(0),
      u_clickPos: new THREE.Uniform(new Array(clicksMax).fill(0).map(() => new THREE.Vector2(-2, -2))),
      u_clickTime: new THREE.Uniform(new Array(clicksMax).fill(-9999)),
      u_clickCount: new THREE.Uniform(clicksMax)
    },
    depthTest: false,
    depthWrite: false
  }), [])
  
  useEffect(() => {
    material.uniforms.u_res.value.set(size.width, size.height)
    material.uniforms.u_aspect.value = size.width / size.height
  }, [size, material])
  
  useFrame((_state, dt) => {
    const t = performance.now() / 1000
    
    // Smooth zoom towards target
    const speed = 3
    const nextZoom = THREE.MathUtils.damp(zoom, targetZoom, speed, dt)
    setZoom(nextZoom)
    
    const v = (nextZoom - zoom) / Math.max(dt, 1e-6)
    velocityRef.current = THREE.MathUtils.damp(velocityRef.current, v, 6, dt)
    
    // Auto‑pilot after inactivity
    const idle = performance.now() - lastInputAt > 4000
    if (idle) {
      setTargetZoom(z => z - 0.02) // slow dive
    }
    
    // Push uniforms
    material.uniforms.u_time.value = t
    material.uniforms.u_zoom.value = nextZoom
    material.uniforms.u_mouse.value.copy(mouseRef.current)
    material.uniforms.u_velocity.value = velocityRef.current
    material.uniforms.u_auto.value = idle ? 1 : 0
    
    // clicks
    const now = t
    const posArr = material.uniforms.u_clickPos.value as THREE.Vector2[]
    const timeArr = material.uniforms.u_clickTime.value as number[]
    for (let i = 0; i < clicksMax; i++) {
      posArr[i].copy(clicksRef.current[i].pos)
      timeArr[i] = clicksRef.current[i].t
    }
  })
  
  return (
    <mesh ref={mesh}>
      <planeGeometry args={[2, 2]} />
      <primitive attach='material' object={material} />
    </mesh>
  )
}

// ---------------------------------
// Fragment shader (GLSL)
// ---------------------------------
const fragmentShader = /* glsl */`
precision highp float;

uniform float u_time;
uniform vec2 u_res;
uniform float u_zoom;
uniform vec2 u_mouse;
uniform float u_aspect;
uniform float u_velocity;
uniform float u_auto;
uniform vec2 u_clickPos[6];
uniform float u_clickTime[6];
uniform int u_clickCount;

varying vec2 vUv;

// --- Hash & Noise ---
float hash(vec2 p){
  p = fract(p*vec2(123.34, 456.21));
  p += dot(p, p+45.32);
  return fract(p.x*p.y);
}

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i+vec2(1.,0.));
  float c = hash(i+vec2(0.,1.));
  float d = hash(i+vec2(1.,1.));
  vec2 u = f*f*(3.-2.*f);
  return mix(a,b,u.x)+ (c-a)*u.y*(1.-u.x) + (d-b)*u.x*u.y;
}

float fbm(vec2 p){
  float s = 0., a = .5;
  for(int i=0;i<5;i++){
    s += a*noise(p);
    p *= 2.0;
    a *= 0.55;
  }
  return s;
}

// Ripple from clicks
float ripple(vec2 uv){
  float r = 0.;
  for(int i=0;i<6;i++){
    float t = u_clickTime[i];
    if(t < -100.) continue;
    float age = (u_time - t);
    if(age>6.) continue;
    float k = 3.14*1.2;
    float w = 2.5;
    float a = smoothstep(6., 0., age);
    float d = distance(uv, u_clickPos[i]) * (2. + age*0.6);
    r += a * sin(d*k - age*w) * exp(-d*2.0) * 0.5;
  }
  return r;
}

// Complex multiplication
vec2 cmul(vec2 a, vec2 b){ return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x); }

vec3 palette(float t){
  // water → fire gradient with mid turquoise
  vec3 deep = vec3(0.02, 0.08, 0.16);
  vec3 cyan = vec3(0.0, 0.8, 1.0);
  vec3 turq = vec3(0.2, 1.0, 0.9);
  vec3 amber = vec3(1.0, 0.7, 0.2);
  vec3 red = vec3(1.0, 0.25, 0.1);
  if(t < 0.4) return mix(deep, cyan, smoothstep(0.0,0.4,t));
  if(t < 0.7) return mix(cyan, turq, smoothstep(0.4,0.7,t));
  if(t < 0.9) return mix(turq, amber, smoothstep(0.7,0.9,t));
  return mix(amber, red, smoothstep(0.9,1.0,t));
}

void main(){
  // Normalized coords
  vec2 uv = vUv;
  vec2 p = uv;
  // Lens from mouse — local flow
  vec2 m = u_mouse;
  float lens = exp(-12.0*distance(uv, m));
  vec2 flowDir = normalize(uv - m + 1e-5);
  float vel = clamp(abs(u_velocity)*0.05, 0.0, 0.04);

  // Time evolution
  float t = u_time * 0.15;

  // Auto subtle drift
  vec2 drift = vec2(sin(t*0.7), cos(t*0.9)) * 0.03;

  // Ripple & FBM warp
  float rip = ripple(uv);
  vec2 warp = vec2(
    fbm(uv*3. + t*1.2 + rip) - 0.5,
    fbm(uv*3. - t*1.1 + rip) - 0.5
  )
  * 0.45;
  warp += flowDir * lens * (0.06 + vel*10.0);

  // Logarithmic zoom mapping (keeps precision)
  float z = exp(u_zoom);
  float s = 2.0 / z; // scale
  vec2 q = ((uv - 0.5) * vec2(u_aspect, 1.0) + drift + warp) * s;

  // Rotate slowly for life
  float ang = 0.15 * t;
  float cs = cos(ang), sn = sin(ang);
  q = mat2(cs,-sn,sn,cs) * q;

  // Hybrid fractal: animated Julia/Mandel mix with flow feedback
  vec2 c = vec2(-0.78 + 0.12*sin(t*0.8), 0.15 + 0.18*cos(t*0.6));
  vec2 zc = q;
  float iter = 0.0;
  float mag2 = 0.0;
  float maxIter = mix(60.0, 120.0, clamp(z*0.002, 0.0, 1.0));

  // Add subtle flow field into the dynamics
  vec2 ff = 0.08 * vec2(
    fbm(q*1.6 + t*0.7),
    fbm(q*1.6 - t*0.7)
  );

  float trap = 1.0; // distance to filaments
  for(int i=0;i<180;i++){
    if(iter>=maxIter) break;
    // z = z^2 + c (with slight time/flow modulation)
    vec2 z2 = vec2(zc.x*zc.x - zc.y*zc.y, 2.0*zc.x*zc.y)
      + c + ff*0.6 + rip*0.03
      ;
    zc = z2;
    mag2 = dot(zc, zc);
    trap = min(trap, length(zc));
    if(mag2 > 64.0) break;
    iter += 1.0;
  }

  // Smooth escape
  float mu = iter - log2(log2(max(mag2, 1e-6))) + 4.0;
  mu = clamp(mu / maxIter, 0.0, 1.0);

  // Energy fields for color mapping
  float energy = fbm(q*2.5 + t*0.3 + rip*0.2);
  float depth = clamp(mu*0.9 + energy*0.2, 0.0, 1.0);
  vec3 col = palette(depth);

  // Add filament glow based on trap (near zeros)
  float glow = exp(-8.0*trap);
  col += glow * vec3(1.0, 0.8, 0.5);

  // Water highlights
  float spec = smoothstep(0.75, 1.0, depth) * 0.8;
  col += spec * vec3(0.9, 1.0, 1.0);

  // Chromatic aberration (very subtle)
  vec2 dir = normalize(warp + flowDir*lens + 1e-5)
    * (0.0015 + 0.005*vel + 0.003*abs(rip));
  float r = clamp(palette(depth + 0.02).r, 0.0, 1.0);
  float g = clamp(palette(depth).g, 0.0, 1.0);
  float b = clamp(palette(depth - 0.02).b, 0.0, 1.0);
  vec3 ca = vec3(r,g,b);

  // Bloom-like soft rolloff
  float bloom = smoothstep(0.8, 1.0, depth) * 0.6 + glow*0.6;
  col = mix(col, ca, 0.25);
  col += bloom * 0.6;

  // Vignette for abyss feel
  float d = distance(uv, vec2(0.5));
  float vig = smoothstep(0.95, 0.2, d);
  col *= vig;

  // Gamma
  col = pow(col, vec3(0.9));

  gl_FragColor = vec4(col, 1.0);
}
`
