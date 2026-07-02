import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

/* -------------------------------------------------------------------------- *
 * ArchFinal — a clean, credible human dental arch.
 *
 * Synthesized from clinical-anatomy research:
 *  - ELLIPTICAL arch (rounder than a parabola), depth ≈ 0.52 × half-width.
 *  - Teeth placed by CUMULATIVE WIDTH (not equal spacing) and yawed to the arch
 *    tangent so they fan outward (kills the "picket fence" tell).
 *  - RED-ish proportions: central widest/tallest → tapering laterally.
 *  - Per-type crowns: incisor (flat blade), canine (pointed cusp), premolar
 *    (cusp bump); convex labial cap so the front face isn't flat.
 *  - Thin scalloped gum roll + interdental papillae (no fat donut).
 *  - Closed concave PALATE so a full 180° turn never reveals a hollow ring.
 *  - NO tongue / throat / roots — clean and clinical.
 *
 * Material params come from enamel/gum shading research (warm-not-pure white,
 * ior 1.6, light clearcoat; desaturated coral gum).
 *
 * `flip=false` = upper arch (crowns up, gum/palate above the biting edge).
 * `flip=true`  = lower arch, mirrored by NEGATING Y in math (never neg-scale).
 * Caller places the two arches so the incisal edges meet near y≈0.
 * -------------------------------------------------------------------------- */

const A = 1.42 // lateral half-width
const B = 0.78 // arch depth (front-to-back); reads as a real horseshoe
const MAXANG = 1.31 // angular reach tuned so arc length ≈ total tooth width (no gaps)
const WC = 0.4 // central-incisor crown width (world units)
const HC = 0.58 // central-incisor crown height (w:h ≈ 0.78, anatomical)

// Per-tooth profile, midline → back. width/height normalized to the central.
const PROFILE = [
  { type: 'central', w: 1.0, h: 1.0 },
  { type: 'lateral', w: 0.78, h: 0.86 },
  { type: 'canine', w: 0.86, h: 1.0 },
  { type: 'premolar', w: 0.84, h: 0.82 },
  { type: 'premolar', w: 0.8, h: 0.8 },
]

// Elliptical arch point + outward yaw for a given signed angle.
function archAt(ang) {
  const x = A * Math.sin(ang)
  const z = -B * (1 - Math.cos(ang)) // front (ang 0) at z=0, recedes to −z
  return { x, z, yaw: ang } // local +Z face rotated by yaw points outward
}

function useMaterials() {
  const enamel = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#f6fbff', // near-white, whisper of blue (pure #fff reads chalky)
        roughness: 0.2,
        metalness: 0,
        ior: 1.6, // enamel ≈1.62 → stronger, correct Fresnel rim
        clearcoat: 0.6, // a thin wet film, not a lacquer
        clearcoatRoughness: 0.12,
        sheen: 0.3,
        sheenColor: new THREE.Color('#e8f1ff'), // cool grazing bloom = "Hollywood"
        sheenRoughness: 0.5,
        envMapIntensity: 0.95,
      }),
    [],
  )
  const gum = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#d68f96', // desaturated coral — not candy magenta
        roughness: 0.58,
        metalness: 0,
        clearcoat: 0.35, // soft wet, not glossy
        clearcoatRoughness: 0.4,
        sheen: 0.4,
        sheenColor: new THREE.Color('#ffbcc4'),
        sheenRoughness: 0.7,
        envMapIntensity: 0.55,
      }),
    [],
  )
  return { enamel, gum }
}

// ---- Per-type crown -------------------------------------------------------
function Crown({ profile, w, h, d, material, dir }) {
  // The crown sits with its BITING edge at local y=0, extending toward dir·y.
  // Crisp rounded blade (no bulging cap) reads cleaner than a pillowy tooth.
  const cy = dir * (h / 2)
  return (
    <group>
      <RoundedBox
        args={[w, h, d]}
        radius={Math.min(w, d) * 0.14}
        smoothness={4}
        position={[0, cy, 0]}
        material={material}
        castShadow
        receiveShadow
      />
      {/* canine: a soft pointed cusp at the biting edge */}
      {profile === 'canine' && (
        <mesh
          position={[0, dir * 0.03, d * 0.05]}
          rotation={[dir < 0 ? Math.PI : 0, 0, 0]}
          material={material}
          castShadow
        >
          <coneGeometry args={[w * 0.3, h * 0.22, 18]} />
        </mesh>
      )}
    </group>
  )
}

export function ToothArch({ flip = false }) {
  const dir = flip ? -1 : 1
  const { enamel, gum } = useMaterials()

  // Lay out 10 teeth (both sides) by cumulative width.
  const teeth = useMemo(() => {
    const totalW = PROFILE.reduce((s, t) => s + t.w, 0)
    const out = []
    for (const side of [1, -1]) {
      let cum = 0
      for (let k = 0; k < PROFILE.length; k++) {
        const t = PROFILE[k]
        const frac = (cum + t.w / 2) / totalW
        cum += t.w
        const ang = side * frac * MAXANG
        const { x, z, yaw } = archAt(ang)
        // deterministic micro-variation (no Math.random → no re-render flicker)
        const jitter = Math.sin((k + 1) * 2.4 + side) * 0.5
        out.push({
          key: `${side}-${k}`,
          type: t.type,
          x,
          z,
          yaw,
          w: t.w * WC * 1.14, // overlap so neighbours touch (no gaps)
          // lateral incisor sits a hair shorter (classic smile cue)
          h: t.h * HC * (1 + jitter * 0.015),
          d: 0.24,
          tilt: jitter * 0.04,
        })
      }
    }
    return out
  }, [])

  // Thin gum roll following the arch at the root line + interdental papillae.
  const { gumGeo, papillae } = useMemo(() => {
    const pts = []
    const steps = 80
    const maxH = HC * 1.02
    for (let i = 0; i <= steps; i++) {
      const ang = -MAXANG + (i / steps) * 2 * MAXANG
      const { x, z } = archAt(ang)
      pts.push(new THREE.Vector3(x, dir * (maxH + 0.02), z))
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5)
    const gumGeo = new THREE.TubeGeometry(curve, 100, 0.07, 16, false)

    // papilla bumps between adjacent teeth (scallop the gum line)
    const totalW = PROFILE.reduce((s, t) => s + t.w, 0)
    const pap = []
    for (const side of [1, -1]) {
      let cum = 0
      for (let k = 0; k < PROFILE.length - 1; k++) {
        cum += PROFILE[k].w
        const frac = cum / totalW
        const ang = side * frac * MAXANG
        const { x, z } = archAt(ang)
        pap.push([x, dir * (maxH - 0.12), z])
      }
    }
    return { gumGeo, papillae: pap }
  }, [dir])

  // Concave palate / floor closing the inside of the arch (no hollow ring).
  // Sits BEHIND the back teeth so it only shows from inside / on the 180° turn.
  const palate = useMemo(
    () => new THREE.SphereGeometry(A * 0.74, 28, 20, 0, Math.PI * 2, 0, Math.PI / 2),
    [],
  )

  return (
    <group>
      {/* Gum roll */}
      <mesh geometry={gumGeo} material={gum} castShadow receiveShadow />
      {/* Interdental papillae */}
      {papillae.map((p, i) => (
        <mesh key={`pap-${i}`} position={p} material={gum} castShadow>
          <sphereGeometry args={[0.075, 12, 10]} />
        </mesh>
      ))}

      {/* Palate dome — pushed BEHIND the back teeth, flattened, concave toward
          the mouth opening; only reads from inside / during the 180° turn. */}
      <mesh
        geometry={palate}
        material={gum}
        position={[0, dir * (HC * 0.32), -B - 0.16]}
        rotation={[dir > 0 ? Math.PI : 0, 0, 0]}
        scale={[1, 0.42, 0.62]}
        receiveShadow
      />

      {/* Teeth */}
      {teeth.map((t) => (
        <group key={t.key} position={[t.x, 0, t.z]} rotation={[t.tilt * dir, t.yaw, 0]}>
          <Crown profile={t.type} w={t.w} h={t.h} d={t.d} material={enamel} dir={dir} />
        </group>
      ))}
    </group>
  )
}

export default ToothArch
