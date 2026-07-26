"use client"

import { useEffect, useRef, type MouseEvent } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n/I18nProvider"

const copyByLanguage = {
  fr: {
    eyebrow: "Cabinet de curiosités numériques",
    title: "Des expériences web,",
    titleAccent: "en tout genre.",
    description:
      "Un endroit où je rassemble des expériences interactives, des simulations, des visualisations et d’autres curiosités à explorer directement dans le navigateur.",
    explore: "Explorer le cabinet",
    portfolio: "Retour au portfolio",
    meta: ["Expériences interactives", "Dans le navigateur", "Collection en évolution"],
    tag: "Expériences web · à explorer",
  },
  en: {
    eyebrow: "Digital cabinet of curiosities",
    title: "Web experiences,",
    titleAccent: "of every kind.",
    description:
      "A place where I collect interactive experiences, simulations, visualisations and other curiosities to explore directly in the browser.",
    explore: "Explore the cabinet",
    portfolio: "Back to the portfolio",
    meta: ["Interactive experiences", "In the browser", "An evolving collection"],
    tag: "Web experiences · ready to explore",
  },
} as const

function moveMagnet(event: MouseEvent<HTMLAnchorElement>) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

  const link = event.currentTarget
  const bounds = link.getBoundingClientRect()
  const x = (event.clientX - bounds.left - bounds.width / 2) * 0.3
  const y = (event.clientY - bounds.top - bounds.height / 2) * 0.4
  link.style.transform = `translate(${x}px, ${y}px)`
}

function resetMagnet(event: { currentTarget: HTMLAnchorElement }) {
  event.currentTarget.style.transform = ""
}

export function HeroSection() {
  const { lang } = useI18n()
  const copy = copyByLanguage[lang]
  const sceneRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sceneElement = sceneRef.current
    const contentElement = contentRef.current

    if (!sceneElement || !contentElement) return

    let cancelled = false
    let disposeScene: (() => void) | undefined

    void import("three")
      .then((THREE) => {
        if (cancelled) return

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        })

        const setRendererSize = () => {
          const width = sceneElement.clientWidth
          const height = sceneElement.clientHeight
          const pixelRatioCap = width < 760 ? 0.75 : 0.85

          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap))
          renderer.setSize(width, height)
          return { width, height }
        }

        const initialSize = setRendererSize()
        renderer.setClearColor(0x02030a, 1)
        renderer.domElement.dataset.webgl = "spacetime"
        renderer.domElement.setAttribute("aria-hidden", "true")
        sceneElement.prepend(renderer.domElement)

        const scene = new THREE.Scene()
        scene.fog = new THREE.FogExp2(0x02030a, 0.018)

        const camera = new THREE.PerspectiveCamera(
          52,
          initialSize.width / initialSize.height,
          0.1,
          240,
        )
        const cameraBase = new THREE.Vector3(0, 10.5, 18.5)
        camera.position.copy(cameraBase)
        camera.lookAt(1.5, -2.2, -8)

        const gold = new THREE.Color("#ffc978")
        const ion = new THREE.Color("#7cc4ff")
        const sheetSize = 78
        const segments = 160
        const mainWellStrength = 7.2
        const geometry = new THREE.PlaneGeometry(sheetSize, sheetSize, segments, segments)
        const uniforms = {
          uTime: { value: 0 },
          uWell1: { value: new THREE.Vector2(9, 7) },
          uWell2: { value: new THREE.Vector2(-40, -40) },
          uW1: { value: mainWellStrength },
          uW2: { value: 4.2 },
          uRipple: { value: reduceMotion ? 0 : 1 },
          uGold: { value: gold },
          uIon: { value: ion },
          uCam: { value: new THREE.Vector3() },
        }

        const material = new THREE.ShaderMaterial({
          uniforms,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: false,
          vertexShader: `
            precision highp float;
            uniform float uTime;
            uniform vec2 uWell1;
            uniform vec2 uWell2;
            uniform float uW1;
            uniform float uW2;
            uniform float uRipple;
            varying vec2 vGrid;
            varying float vDip;
            varying vec3 vWorld;

            float gauss(vec2 point, vec2 center, float radius) {
              float distanceSquared = dot(point - center, point - center);
              return exp(-distanceSquared / (radius * radius));
            }

            void main() {
              vec3 positionCopy = position;
              vec2 point = positionCopy.xy;
              float dip = 0.0;

              dip += uW1 * gauss(point, uWell1, 7.4);
              dip += uW2 * gauss(point, uWell2, 5.2);

              float mainDistance = length(point - uWell1);
              dip += uRipple * 0.55 * sin(mainDistance * 0.85 - uTime * 1.6) * exp(-mainDistance * 0.05);

              float centerDistance = length(point);
              dip += uRipple * 0.35 * sin(centerDistance * 0.5 - uTime) * exp(-centerDistance * 0.04);

              positionCopy.z -= dip;
              vDip = dip;
              vGrid = positionCopy.xy;

              vec4 worldPosition = modelMatrix * vec4(positionCopy, 1.0);
              vWorld = worldPosition.xyz;
              gl_Position = projectionMatrix * viewMatrix * worldPosition;
            }
          `,
          fragmentShader: `
            precision highp float;
            uniform vec3 uGold;
            uniform vec3 uIon;
            uniform vec3 uCam;
            varying vec2 vGrid;
            varying float vDip;
            varying vec3 vWorld;

            void main() {
              vec2 coordinates = vGrid;
              vec2 derivative = fwidth(coordinates);
              vec2 grid = abs(fract(coordinates - 0.5) - 0.5) / max(derivative, vec2(0.0001));
              float line = 1.0 - min(min(grid.x, grid.y), 1.0);

              if (line <= 0.0) discard;

              float worldDistance = distance(vWorld, uCam);
              float fog = 1.0 - smoothstep(20.0, 64.0, worldDistance);
              fog *= fog;

              float normalisedDip = clamp(vDip / 6.0, 0.0, 1.0);
              vec3 colour = mix(uGold, uIon, smoothstep(0.6, 1.0, normalisedDip));
              float glow = mix(0.3, 1.75, normalisedDip);

              gl_FragColor = vec4(colour * line * fog * glow, 1.0);
            }
          `,
        })

        const sheet = new THREE.Mesh(geometry, material)
        sheet.rotation.x = -Math.PI / 2
        sheet.position.z = -10
        sheet.renderOrder = 0
        scene.add(sheet)

        const glowCanvas = document.createElement("canvas")
        glowCanvas.width = 128
        glowCanvas.height = 128
        const glowContext = glowCanvas.getContext("2d")

        if (!glowContext) {
          throw new Error("Canvas 2D indisponible")
        }

        const glowGradient = glowContext.createRadialGradient(64, 64, 0, 64, 64, 64)
        glowGradient.addColorStop(0, "rgba(255,232,190,1)")
        glowGradient.addColorStop(0.25, "rgba(255,201,120,0.7)")
        glowGradient.addColorStop(0.6, "rgba(124,196,255,0.18)")
        glowGradient.addColorStop(1, "rgba(124,196,255,0)")
        glowContext.fillStyle = glowGradient
        glowContext.fillRect(0, 0, 128, 128)

        const glowTexture = new THREE.CanvasTexture(glowCanvas)
        glowTexture.colorSpace = THREE.SRGBColorSpace
        const wellPosition = new THREE.Vector3(
          uniforms.uWell1.value.x,
          -mainWellStrength + 0.4,
          -uniforms.uWell1.value.y + sheet.position.z,
        )
        const glow = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: glowTexture,
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false,
          }),
        )
        glow.position.copy(wellPosition)
        glow.scale.set(7.5, 7.5, 1)
        glow.renderOrder = 2
        scene.add(glow)

        const coreGeometry = new THREE.SphereGeometry(0.32, 24, 24)
        const coreMaterial = new THREE.MeshBasicMaterial({
          color: 0xfff0d8,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: false,
        })
        const core = new THREE.Mesh(coreGeometry, coreMaterial)
        core.position.copy(wellPosition)
        core.renderOrder = 3
        scene.add(core)

        const pointer = new THREE.Vector2(-2, -2)
        const raycaster = new THREE.Raycaster()
        const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
        const intersection = new THREE.Vector3()
        const targetWell = new THREE.Vector2(-40, -40)
        let pointerX = 0
        let pointerY = 0

        const onPointerMove = (event: PointerEvent) => {
          if (reduceMotion) return

          const bounds = sceneElement.getBoundingClientRect()
          pointerX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
          pointerY = ((event.clientY - bounds.top) / bounds.height) * 2 - 1
          pointer.set(pointerX, -pointerY)

          raycaster.setFromCamera(pointer, camera)
          if (raycaster.ray.intersectPlane(interactionPlane, intersection)) {
            targetWell.set(intersection.x, sheet.position.z - intersection.z)
          }

          contentElement.style.transform = `translate(${pointerX * -7}px, ${pointerY * -5}px)`
        }

        const onResize = () => {
          const { width, height } = setRendererSize()
          camera.aspect = width / height
          camera.updateProjectionMatrix()
        }

        window.addEventListener("pointermove", onPointerMove, { passive: true })
        window.addEventListener("resize", onResize)

        const clock = new THREE.Clock()
        const renderFrame = () => {
          const elapsed = clock.getElapsedTime()
          uniforms.uTime.value = elapsed
          uniforms.uWell2.value.x += (targetWell.x - uniforms.uWell2.value.x) * 0.08
          uniforms.uWell2.value.y += (targetWell.y - uniforms.uWell2.value.y) * 0.08

          camera.position.x = cameraBase.x + pointerX * 1.6 + Math.sin(elapsed * 0.15) * 0.4
          camera.position.y = cameraBase.y - pointerY * 0.9
          camera.lookAt(1.5, -2.2, -8)
          uniforms.uCam.value.copy(camera.position)

          const pulse = 1 + Math.sin(elapsed * 1.4) * 0.12
          glow.scale.set(7.5 * pulse, 7.5 * pulse, 1)
          renderer.render(scene, camera)
        }

        uniforms.uCam.value.copy(camera.position)
        renderer.render(scene, camera)

        const observer = reduceMotion
          ? null
          : new IntersectionObserver(([entry]) => {
              renderer.setAnimationLoop(entry.isIntersecting ? renderFrame : null)
            })

        observer?.observe(sceneElement)

        disposeScene = () => {
          observer?.disconnect()
          renderer.setAnimationLoop(null)
          window.removeEventListener("pointermove", onPointerMove)
          window.removeEventListener("resize", onResize)
          contentElement.style.transform = ""
          geometry.dispose()
          material.dispose()
          glowTexture.dispose()
          glow.material.dispose()
          coreGeometry.dispose()
          coreMaterial.dispose()
          renderer.dispose()
          renderer.domElement.remove()
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) console.warn("WebGL initialization failed", error)
      })

    return () => {
      cancelled = true
      disposeScene?.()
    }
  }, [])

  return (
    <section id="top" ref={sceneRef} className="spacetime-hero" aria-labelledby="hero-title">
      <div className="spacetime-scrim" aria-hidden="true" />

      <div className="spacetime-hud" aria-hidden="true">
        <span className="spacetime-corner spacetime-corner--top-left" />
        <span className="spacetime-corner spacetime-corner--top-right" />
        <span className="spacetime-corner spacetime-corner--bottom-left" />
        <span className="spacetime-corner spacetime-corner--bottom-right" />
        <p className="spacetime-coordinates">
          48.8566°N / 2.3522°E
          <br />
          Paris · remote · WebGL
        </p>
      </div>

      <div ref={contentRef} className="spacetime-content">
        <p className="spacetime-eyebrow">{copy.eyebrow}</p>
        <h1 id="hero-title" className="spacetime-title">
          {copy.title}
          <br />
          <i>{copy.titleAccent}</i>
        </h1>
        <p className="spacetime-description">{copy.description}</p>

        <div className="mt-8 flex flex-wrap gap-3.5">
          <Button asChild variant="hero" size="hero">
            <Link
              href="#catalogue"
              onMouseMove={moveMagnet}
              onMouseLeave={resetMagnet}
              onBlur={resetMagnet}
            >
              {copy.explore}
            </Link>
          </Button>
          <Button asChild variant="heroOutline" size="hero">
            <Link
              href="https://sorok-dva.eu"
              onMouseMove={moveMagnet}
              onMouseLeave={resetMagnet}
              onBlur={resetMagnet}
            >
              {copy.portfolio}
            </Link>
          </Button>
        </div>

        <div className="spacetime-meta" aria-label={copy.meta.join(", ")}>
          {copy.meta.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>

      <p className="spacetime-tag">{copy.tag}</p>
    </section>
  )
}
