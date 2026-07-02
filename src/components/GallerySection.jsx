import { useRef, useLayoutEffect } from 'react'
// Central GSAP module — ScrollTrigger is already registered there.
import { gsap, ScrollTrigger } from '../lib/gsap'

/**
 * GallerySection — "SMILE GALLERY" (Before & After)
 * ---------------------------------------------------------------------------
 * A dark, premium showcase of stylized before/after transformations. Since the
 * build ships with no photography, every card is a self-contained inline-SVG
 * "smile" — a muted/yellowed BEFORE that brightens to a luminous AFTER on hover,
 * with a sweeping divider line and a BEFORE → AFTER label. Fully offline.
 *
 * The section paints its own opaque dark background (bg-paradise-navy) and sits
 * at z-10 so it covers the fixed 3D canvas (z-0). White + sky-blue type keeps it
 * strictly on the blue / white / black palette.
 *
 * Motion: cards stagger-fade up as the section enters the viewport.
 */

// ---------------------------------------------------------------------------
// Stylized smile illustration — a clean dental-brand mouth: soft lips, a dark
// interior, a pink gum line, and a row of INDIVIDUAL rounded-rect teeth set on
// a gentle smile arc (central incisors widest, tapering + tucked at the
// corners). `variant` toggles the treatment:
//   'before' → duller, faintly yellow, a touch uneven, a hairline gap
//   'after'  → bright clean white with a cool blue-white sheen, even + aligned
// All vector — no photos. A unique `id` namespaces the gradient/clip defs.
// ---------------------------------------------------------------------------
function SmileSVG({ variant, id }) {
  const bright = variant === 'after'

  // --- Per-tooth geometry on a smile arc ----------------------------------
  // Centered on x=160; widths taper from the central incisors outward. Each
  // tooth's top edge dips slightly toward the corners so the row follows a
  // curve, and its height shortens at the edges (teeth tuck back into shadow).
  const COUNT = 9 // odd → a true central tooth; 4 per side
  const half = (COUNT - 1) / 2
  // Relative widths per "rank" from center (0) outward.
  const widthByRank = [30, 27, 22, 18, 15]

  let cursor = 160
  const teeth = []
  // Build outward symmetrically so packing stays tight + centered.
  // First lay the central tooth, then mirror each rank left/right.
  const centerW = widthByRank[0]
  teeth.push({ rank: 0, x: 160 - centerW / 2, w: centerW })
  let leftEdge = 160 - centerW / 2
  let rightEdge = 160 + centerW / 2
  const GAP = 1.5
  for (let r = 1; r <= half; r++) {
    const w = widthByRank[Math.min(r, widthByRank.length - 1)]
    leftEdge -= GAP + w
    teeth.push({ rank: r, x: leftEdge, w, side: -1 })
    teeth.push({ rank: r, x: rightEdge + GAP, w, side: 1 })
    rightEdge += GAP + w
  }
  cursor = rightEdge // (kept for clarity; unused beyond build)

  // Arc + shading helpers driven by distance from the center.
  const TOP = 108 // baseline top of central teeth
  const BASE_H = 58 // height of central teeth

  // Subtle BEFORE imperfections: a couple of teeth sit lower / are a hair
  // shorter / slightly darker for an "uneven" read. Keyed by signed index.
  const beforeJitter = {
    '-2': { dy: 3, dh: -4, tint: 0.5 },
    '2': { dy: 1, dh: -2, tint: 0.25 },
    '-1': { dy: -1, dh: 0, tint: 0 },
    '3': { dy: 4, dh: -6, tint: 0.6 },
  }

  return (
    <svg
      viewBox="0 0 320 240"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        {/* Soft skin / lip backdrop */}
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bright ? '#12325E' : '#1A2138'} />
          <stop offset="55%" stopColor={bright ? '#0C1F44' : '#10162A'} />
          <stop offset="100%" stopColor={bright ? '#081634' : '#0A0E1B'} />
        </linearGradient>

        {/* Lip fill (cool, restrained pink so it reads on a blue palette) */}
        <linearGradient id={`lip-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bright ? '#E89BB0' : '#C98598'} />
          <stop offset="100%" stopColor={bright ? '#C76E89' : '#A45F75'} />
        </linearGradient>

        {/* Dark mouth interior */}
        <radialGradient id={`mouth-${id}`} cx="50%" cy="38%" r="75%">
          <stop offset="0%" stopColor="#4A1E2C" />
          <stop offset="70%" stopColor="#2A0E18" />
          <stop offset="100%" stopColor="#160710" />
        </radialGradient>

        {/* Gum line — soft pink */}
        <linearGradient id={`gum-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bright ? '#F2A8BC' : '#D88EA0'} />
          <stop offset="100%" stopColor={bright ? '#E07F99' : '#BC7286'} />
        </linearGradient>

        {/* Enamel — top→bottom shading per tooth */}
        <linearGradient id={`tooth-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bright ? '#FFFFFF' : '#F0E8CE'} />
          <stop offset="55%" stopColor={bright ? '#F4F8FF' : '#E8DCB0'} />
          <stop offset="100%" stopColor={bright ? '#DCEAFF' : '#D2C394'} />
        </linearGradient>

        {/* Cool blue-white sheen swept across the enamel (mostly on 'after') */}
        <linearGradient id={`sheen-${id}`} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={bright ? 0.85 : 0.3} />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Overall vignette / glow */}
        <radialGradient id={`glow-${id}`} cx="50%" cy="42%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={bright ? 0.18 : 0.06} />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>

        {/* Clip that contains the teeth strictly within the mouth interior so
            the rounded crowns never bleed over the lips. */}
        <clipPath id={`mouthClip-${id}`}>
          <path d="M30 120 Q160 70 290 120 Q292 150 270 176 Q160 214 50 176 Q28 150 30 120 Z" />
        </clipPath>
      </defs>

      {/* Backdrop */}
      <rect width="320" height="240" fill={`url(#bg-${id})`} />

      {/* Upper lip curve */}
      <path
        d="M16 118 Q60 84 110 96 Q140 104 160 104 Q180 104 210 96 Q260 84 304 118 Q300 92 250 74 Q160 50 70 74 Q20 92 16 118 Z"
        fill={`url(#lip-${id})`}
        opacity="0.96"
      />

      {/* Dark mouth interior (everything inside the lip aperture) */}
      <path
        d="M28 118 Q160 72 292 118 Q294 152 268 182 Q160 222 52 182 Q26 152 28 118 Z"
        fill={`url(#mouth-${id})`}
      />

      {/* Teeth + gums, clipped to the mouth aperture */}
      <g clipPath={`url(#mouthClip-${id})`}>
        {/* Gum arch behind the crowns */}
        <path
          d="M30 116 Q160 78 290 116 L290 132 Q160 100 30 132 Z"
          fill={`url(#gum-${id})`}
        />

        {/* Upper arch — individual rounded-rect teeth on a gentle curve. */}
        {teeth.map((t, i) => {
          const signed = (t.side ?? 0) * t.rank // signed rank for jitter keys
          const dist = t.rank
          // Smile arc: top edge dips, crown shortens toward the corners.
          const arcDip = dist * dist * 1.6
          const heightTaper = dist * 5.5
          const j = !bright ? beforeJitter[String(signed)] : null
          const y = TOP + arcDip + (j?.dy ?? 0)
          const h = BASE_H - heightTaper + (j?.dh ?? 0)
          const rx = Math.min(t.w * 0.42, 9)
          return (
            <g key={`${signed}-${i}`}>
              <rect
                x={t.x}
                y={y}
                width={t.w}
                height={h}
                rx={rx}
                ry={rx}
                fill={`url(#tooth-${id})`}
              />
              {/* Soft per-tooth shading on the BEFORE uneven teeth */}
              {j?.tint ? (
                <rect
                  x={t.x}
                  y={y}
                  width={t.w}
                  height={h}
                  rx={rx}
                  ry={rx}
                  fill="#8A7A45"
                  opacity={0.18 * j.tint}
                />
              ) : null}
            </g>
          )
        })}

        {/* Thin separations between teeth — drawn as faint vertical seams that
            sit on the tooth gaps so each crown reads as its own form. */}
        {teeth.map((t, i) => (
          <line
            key={`seam-${i}`}
            x1={t.x - GAP / 2}
            x2={t.x - GAP / 2}
            y1={TOP - 2}
            y2={TOP + BASE_H}
            stroke={bright ? '#BBD2F5' : '#B9A874'}
            strokeWidth="0.9"
            strokeLinecap="round"
            opacity={bright ? 0.45 : 0.6}
          />
        ))}

        {/* BEFORE: a faint central gap for character. */}
        {!bright && (
          <line
            x1="160"
            x2="160"
            y1={TOP - 1}
            y2={TOP + BASE_H - 6}
            stroke="#6E5F33"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.5"
          />
        )}

        {/* Cool enamel sheen sweeping across the upper rows. */}
        <path
          d="M30 116 Q160 78 290 116 L290 150 Q160 118 30 150 Z"
          fill={`url(#sheen-${id})`}
        />
      </g>

      {/* Lower lip */}
      <path
        d="M22 168 Q160 232 298 168 Q300 200 270 222 Q160 252 50 222 Q20 200 22 168 Z"
        fill={`url(#lip-${id})`}
      />
      {/* Lower-lip highlight */}
      <path
        d="M52 184 Q160 224 268 184 Q230 206 160 208 Q90 206 52 184 Z"
        fill="#FFFFFF"
        opacity={bright ? 0.16 : 0.1}
      />

      {/* Overall glow + sparkle (AFTER) */}
      <rect width="320" height="240" fill={`url(#glow-${id})`} />
      {bright && (
        <g fill="#FFFFFF">
          <path
            d="M226 92 l4.5 11 11 4.5 -11 4.5 -4.5 11 -4.5 -11 -11 -4.5 11 -4.5 z"
            opacity="0.95"
          />
          <circle cx="96" cy="118" r="2.6" opacity="0.85" />
          <circle cx="208" cy="120" r="1.8" opacity="0.7" />
        </g>
      )}
    </svg>
  )
}

// Card data — each transformation gets a treatment tag.
const CASES = [
  { tag: 'Veneers', id: 'c1' },
  { tag: 'All-on-X', id: 'c2' },
  { tag: 'Whitening', id: 'c3' },
  { tag: 'Invisalign', id: 'c4' },
  { tag: 'Full-Mouth', id: 'c5' },
  { tag: 'Veneers', id: 'c6' },
]

// A single interactive before/after card. The AFTER smile is stacked on top of
// the BEFORE and clipped to the left of a divider; on hover the divider sweeps
// fully across so the brighter result is revealed. Pure CSS — robust + offline.
function GalleryCard({ tag, id }) {
  return (
    <div className="gallery-card group relative overflow-hidden rounded-2xl border border-white/10 bg-paradise-ink shadow-[0_30px_70px_-30px_rgba(0,0,0,0.8)]">
      {/* Fixed-ratio stage holding both smile layers. */}
      <div className="relative aspect-[4/3] w-full">
        {/* BEFORE — always fully visible underneath. */}
        <div className="absolute inset-0">
          <SmileSVG variant="before" id={`${id}-b`} />
        </div>

        {/* AFTER — clipped to a sliver on the left at rest, then sweeps to full
            width on hover/focus to "wipe" the transformation across the card. */}
        <div className="absolute inset-0 transition-[clip-path] duration-700 ease-out [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0_0_0)] group-focus-within:[clip-path:inset(0_0_0_0)]">
          <SmileSVG variant="after" id={`${id}-a`} />
        </div>

        {/* Divider line that travels with the reveal edge. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-paradise-sky/80 shadow-[0_0_18px_2px_rgba(111,183,255,0.6)] transition-all duration-700 ease-out group-hover:left-full group-focus-within:left-full" />

        {/* BEFORE → AFTER label */}
        <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
          <span className="text-white/60">Before</span>
          <svg className="h-3 w-3 text-paradise-sky" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-paradise-sky">After</span>
        </div>
      </div>

      {/* Treatment tag bar */}
      <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
        <span className="font-display text-base font-semibold text-white">{tag}</span>
        <span className="text-xs uppercase tracking-[0.22em] text-paradise-sky">Hover to reveal</span>
      </div>
    </div>
  )
}

export default function GallerySection() {
  const sectionRef = useRef(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      // Stagger-fade the cards up as the gallery scrolls into view.
      const cards = gsap.utils.toArray('.gallery-card')
      gsap.from(cards, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="gallery"
      ref={sectionRef}
      // Opaque dark background + relative z-10 so it covers the fixed canvas.
      className="relative z-10 overflow-hidden bg-paradise-navy text-white"
    >
      {/* Soft blue glow accents — pure CSS radial gradients, no images. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(40% 50% at 15% 0%, rgba(47,107,255,0.35) 0%, rgba(47,107,255,0) 70%), radial-gradient(45% 50% at 100% 100%, rgba(111,183,255,0.25) 0%, rgba(111,183,255,0) 70%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32 lg:px-8">
        {/* ---- Header ------------------------------------------------- */}
        <div className="max-w-3xl">
          <span className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-paradise-sky">
            Smile Gallery
          </span>
          <h2 className="mt-5 font-display text-4xl font-bold leading-[1.02] tracking-tightest text-white sm:text-5xl lg:text-6xl">
            Real transformations.
            <br />
            Real Miami smiles.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            Drag your eye across each result — every smile is designed,
            engineered, and finished by hand in our Miami studio.
          </p>
        </div>

        {/* ---- Card grid: 1 / 2 / 3 columns -------------------------- */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CASES.map((c) => (
            <GalleryCard key={c.id} tag={c.tag} id={c.id} />
          ))}
        </div>

        {/* ---- Credibility + CTA ------------------------------------- */}
        <div className="mt-16 flex flex-col items-start gap-8 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* Five-star flourish */}
            <div className="flex gap-1 text-paradise-sky" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <svg key={i} className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9 4.8 17.6l1-5.8L1.5 7.7l5.9-.9z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-slate-300">
              <span className="font-display text-lg font-bold text-white">4,496+</span> five-star reviews — thousands of smiles transformed.
            </p>
          </div>

          <a
            href="#contact"
            className="inline-flex w-fit items-center justify-center rounded-full bg-paradise-blue px-8 py-4 font-display text-sm font-semibold uppercase tracking-[0.15em] text-white shadow-[0_18px_40px_-15px_rgba(47,107,255,0.7)] transition-transform duration-300 hover:scale-[1.03] hover:bg-paradise-sky hover:text-paradise-navy"
          >
            See Your New Smile
          </a>
        </div>
      </div>
    </section>
  )
}
