import { useRef, useLayoutEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, Float } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from '../lib/gsap'
import { ToothArch } from '../teeth/ArchFinal.jsx'

/* The dental arch geometry (teeth + gum + palate) lives in ../teeth/ArchFinal.jsx
   and is imported above as <ToothArch flip? />. It's anatomy-driven (elliptical
   arch, RED proportions, scalloped gum, closed palate) so the full 180° turn
   never reveals a hollow ring. Swapping in a real .glb later needs no timeline
   changes — the GSAP timeline only targets the GROUP refs below. */

/* -------------------------------------------------------------------------- */
/*  Stethoscope: chrome ring + white diaphragm + curved tubing                  */
/* -------------------------------------------------------------------------- */

function Stethoscope({ groupRef, lightRef }) {
  const chrome = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#eef3f8',
        roughness: 0.12,
        metalness: 0.95,
        envMapIntensity: 1.3,
      }),
    [],
  )
  const white = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#fafbfd',
        roughness: 0.22,
        clearcoat: 0.85,
        clearcoatRoughness: 0.1,
      }),
    [],
  )

  const tube = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.08, 0),
      new THREE.Vector3(0.55, 0.85, 0.18),
      new THREE.Vector3(0.15, 1.6, -0.12),
      new THREE.Vector3(-0.65, 2.2, 0.1),
    ])
    return new THREE.TubeGeometry(curve, 64, 0.06, 14, false)
  }, [])

  // Starts fully off-screen to the right; GSAP flies it in toward the mouth.
  return (
    <group ref={groupRef} position={[9, 1.4, 1]} scale={0.85}>
      {/* Chest piece (diaphragm) — the part that hovers into the open mouth */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh material={chrome} castShadow>
          <cylinderGeometry args={[0.46, 0.46, 0.15, 48]} />
        </mesh>
        <mesh position={[0, 0.085, 0]} material={white}>
          <cylinderGeometry args={[0.42, 0.42, 0.04, 48]} />
        </mesh>
      </group>
      {/* Tubing curling up and away */}
      <mesh geometry={tube} material={chrome} castShadow />
      {/* Diagnostic light, parented to the chest piece — cool bluish-white */}
      <pointLight
        ref={lightRef}
        position={[0, -0.35, 0]}
        intensity={0}
        distance={9}
        decay={2}
        color="#dcecff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/*  Scene: nested motion groups + the GSAP master timeline                      */
/* -------------------------------------------------------------------------- */

function Scene() {
  const { size } = useThree()

  const sceneWrapper = useRef() // OUTER → mouse tracking (lerped)
  const exitGroup = useRef() // GSAP exit (rotate + scale)
  const flipGroup = useRef() // GSAP flip to a side/3-quarter view
  const upperJaw = useRef()
  const lowerJaw = useRef()
  const stethoscope = useRef()
  const diagnosticLight = useRef()

  // Read the pointer off the window (canvas is pointer-events:none so links work).
  const mouse = useRef({ x: 0, y: 0 })
  useLayoutEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const responsiveScale = useMemo(() => {
    const w = size.width
    if (w < 640) return 0.66
    if (w < 1024) return 0.84
    return 1
  }, [size.width])

  // Continuous mouse parallax on the OUTER group only — never fights GSAP.
  useFrame((_, delta) => {
    if (!sceneWrapper.current) return
    const damp = 1 - Math.pow(0.0018, delta)
    const ty = mouse.current.x * 0.4
    const tx = mouse.current.y * 0.25
    sceneWrapper.current.rotation.y += (ty - sceneWrapper.current.rotation.y) * damp
    sceneWrapper.current.rotation.x += (tx - sceneWrapper.current.rotation.x) * damp
  })

  // -------------------- GSAP master timeline (scroll-driven) ----------------
  useLayoutEffect(() => {
    if (!flipGroup.current) return

    const ctx = gsap.context(() => {
      gsap.set('.hero-line[data-line="0"]', { autoAlpha: 1, y: 0 })
      gsap.set('.hero-line[data-line="1"]', { autoAlpha: 0, y: 60 })
      gsap.set('.hero-line[data-line="2"]', { autoAlpha: 0, y: 60 })
      gsap.set('.hero-line[data-line="3"]', { autoAlpha: 0, y: 60 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      })

      // STATE 1→2 — closed smile faces us; PARADISE → IS IN
      tl.to('.hero-line[data-line="0"]', { autoAlpha: 0, y: -50, duration: 0.07 }, 0.08)
      tl.to('.hero-line[data-line="1"]', { autoAlpha: 1, y: 0, duration: 0.09 }, 0.13)

      // STATE 3 — the mouth rotates LEFT a FULL 180° to face the other way by the
      // time we reach "THE DETAILS" (28% → 58%)
      tl.to(flipGroup.current.rotation, { y: -Math.PI, duration: 0.3, ease: 'power2.inOut' }, 0.28)

      // IS IN → THE DETAILS
      tl.to('.hero-line[data-line="1"]', { autoAlpha: 0, y: -50, duration: 0.07 }, 0.3)
      tl.to('.hero-line[data-line="2"]', { autoAlpha: 1, y: 0, duration: 0.09 }, 0.37)

      // STATE 4 — now in side view, the lower jaw OPENS (46% → 72%)
      tl.to(lowerJaw.current.rotation, { x: 0.62, duration: 0.26, ease: 'power1.inOut' }, 0.46)
      tl.to(lowerJaw.current.position, { y: -0.5, duration: 0.26, ease: 'power1.inOut' }, 0.46)

      // …and the stethoscope flies in toward the open mouth (50% → 76%)
      tl.to(
        stethoscope.current.position,
        { x: 0.25, y: 0.05, z: 0.6, duration: 0.26, ease: 'power3.out' },
        0.5,
      )
      tl.to(stethoscope.current.rotation, { z: -0.25, y: 0.35, duration: 0.26 }, 0.5)

      // STATE 5 — diagnostic light intensifies (62% → 86%)
      tl.to(diagnosticLight.current, { intensity: 9, duration: 0.24 }, 0.62)
      tl.to(diagnosticLight.current, { intensity: 6.5, duration: 0.06 }, 0.86)

      // THE DETAILS → closing tagline
      tl.to('.hero-line[data-line="2"]', { autoAlpha: 0, y: -50, duration: 0.07 }, 0.78)
      tl.to('.hero-line[data-line="3"]', { autoAlpha: 1, y: 0, duration: 0.09 }, 0.84)

      // EXIT — rotate, scale down, fade the whole canvas (87% → 100%)
      tl.to(exitGroup.current.rotation, { y: 0.6, duration: 0.13 }, 0.87)
      tl.to(exitGroup.current.scale, { x: 0.4, y: 0.4, z: 0.4, duration: 0.13 }, 0.87)
      tl.to('.canvas-wrap', { autoAlpha: 0, duration: 0.11 }, 0.89)
      tl.to('.hero-line[data-line="3"]', { autoAlpha: 0, duration: 0.1 }, 0.92)
    })

    return () => ctx.revert()
  }, [])

  return (
    <group ref={sceneWrapper} scale={responsiveScale}>
      <group ref={exitGroup}>
        <group ref={flipGroup}>
          {/* Jaws gently float; flip + open are driven by GSAP */}
          <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.25}>
            <group ref={upperJaw} position={[0, 0.04, 0]}>
              <ToothArch />
            </group>
            <group ref={lowerJaw} position={[0, -0.04, 0]}>
              <ToothArch flip />
            </group>
          </Float>
          {/* Stethoscope shares the flipped frame so it enters the side view cleanly */}
          <Stethoscope groupRef={stethoscope} lightRef={diagnosticLight} />
        </group>
      </group>
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/*  Canvas + studio lighting                                                    */
/* -------------------------------------------------------------------------- */

export default function CanvasExperience() {
  return (
    <div className="canvas-wrap">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 6.3], fov: 38 }}
        onCreated={({ gl }) => {
          // ACES rolls off bright-white highlights so enamel stays bright but
          // shaped (not clipped to flat grey) — the biggest "looks pro" win.
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
        }}
      >
        {/* Clinical studio lighting — low ambient so the environment + key shape
            the white enamel instead of flattening it. */}
        <ambientLight intensity={0.35} />
        <hemisphereLight args={['#ffffff', '#cdd9ea', 0.5]} />
        {/* KEY — warm, shaping */}
        <directionalLight
          position={[4, 6, 6]}
          intensity={1.5}
          color="#fff6ee"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />
        {/* FILL — cool, soft, opposite side */}
        <directionalLight position={[-6, 3, -2]} intensity={0.45} color="#dcebff" />
        {/* RIM — cool, behind/above, crisp enamel edge */}
        <spotLight position={[0, 5, -4]} angle={0.5} penumbra={1} intensity={1.2} color="#eaf2ff" />

        <Scene />

        <ContactShadows
          position={[0, -1.9, 0]}
          opacity={0.32}
          scale={12}
          blur={2.8}
          far={4}
          color="#16203a"
        />

        {/* Studio reflections from Lightformers — no network/HDR fetch (offline-safe) */}
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={2.2} position={[0, 4, 2]} scale={[9, 3, 1]} color="#ffffff" />
          <Lightformer form="rect" intensity={1.3} position={[-5, 1, 3]} scale={[4, 4, 1]} color="#e9f2ff" />
          <Lightformer form="ring" intensity={1.1} position={[5, 2, -1]} scale={[3, 3, 1]} color="#ffffff" />
        </Environment>
      </Canvas>
    </div>
  )
}
