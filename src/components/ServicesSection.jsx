import { useRef, useLayoutEffect } from 'react'
// Central GSAP module — ScrollTrigger is already registered there.
import { gsap, ScrollTrigger } from '../lib/gsap'

/**
 * ServicesSection — "THE MIAMI STANDARD"
 * ---------------------------------------------------------------------------
 * A horizontally-scrolling showcase of the clinic's flagship services, driven
 * by vertical page scroll. The outer <section> is pinned for the duration of
 * the interaction while an inner flex-row "track" is translated on the X axis
 * via a scrubbed ScrollTrigger.
 *
 * The track holds: an intro panel → one premium card per service → a closing
 * CTA panel. Each card carries a tasteful abstract blue/white SVG visual whose
 * inner layer parallaxes (.svc-parallax) slightly relative to the track scroll
 * for a layered sense of depth.
 *
 * The section paints its own opaque background (bg-paradise-white) and sits at
 * z-10 so it cleanly covers the fixed 3D canvas behind it (z-0). All imagery is
 * inline SVG / CSS gradients — no external URLs, fully offline.
 *
 * Palette: strictly blue / white / black. Blue accents on numbers + links.
 */

// ---------------------------------------------------------------------------
// Abstract, on-brand SVG "visuals" — one per service. Each is a self-contained
// blue/white composition (no external assets). They live as small components so
// the card markup below stays declarative and readable.
// ---------------------------------------------------------------------------

// 01 — Porcelain Veneers: a row of luminous, light-reactive "shells".
function VeneersVisual() {
  return (
    <svg viewBox="0 0 400 280" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="veneer-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6FB7FF" />
          <stop offset="55%" stopColor="#2F6BFF" />
          <stop offset="100%" stopColor="#0A1B3D" />
        </linearGradient>
        <linearGradient id="veneer-shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect width="400" height="280" fill="url(#veneer-bg)" />
      {/* Five rounded "shells" with a soft shine, suggesting layered porcelain. */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${56 + i * 62} 96)`}>
          <rect width="46" height="92" rx="22" fill="url(#veneer-shell)" />
          <rect x="9" y="10" width="12" height="62" rx="6" fill="#FFFFFF" opacity="0.7" />
        </g>
      ))}
    </svg>
  )
}

// 02 — All-on-X Implants: a precise titanium "arch" anchored on points.
function ImplantsVisual() {
  return (
    <svg viewBox="0 0 400 280" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="impl-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0A1B3D" />
          <stop offset="60%" stopColor="#2F6BFF" />
          <stop offset="100%" stopColor="#6FB7FF" />
        </linearGradient>
      </defs>
      <rect width="400" height="280" fill="url(#impl-bg)" />
      {/* The arch */}
      <path
        d="M40 200 Q200 40 360 200"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.95"
      />
      {/* Four anchor screws distributed along the arch */}
      {[
        [70, 178],
        [150, 96],
        [250, 96],
        [330, 178],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="13" fill="#FFFFFF" />
          <circle cx={cx} cy={cy} r="5" fill="#2F6BFF" />
          <line x1={cx} y1={cy + 13} x2={cx} y2={cy + 44} stroke="#FFFFFF" strokeWidth="4" opacity="0.6" />
        </g>
      ))}
    </svg>
  )
}

// 03 — Full-Mouth Makeovers: a symmetrical facial-harmony grid + smile arc.
function MakeoverVisual() {
  return (
    <svg viewBox="0 0 400 280" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="make-bg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#2F6BFF" />
          <stop offset="100%" stopColor="#0A1B3D" />
        </linearGradient>
      </defs>
      <rect width="400" height="280" fill="url(#make-bg)" />
      {/* Faint measurement grid — engineering-precision feel */}
      <g stroke="#FFFFFF" strokeWidth="1" opacity="0.18">
        {[80, 160, 240, 320].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="280" />
        ))}
        {[70, 140, 210].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="400" y2={y} />
        ))}
      </g>
      {/* Vertical mid-line + smile arc */}
      <line x1="200" y1="20" x2="200" y2="260" stroke="#6FB7FF" strokeWidth="2" opacity="0.7" />
      <path d="M110 150 Q200 230 290 150" fill="none" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" />
      <circle cx="200" cy="140" r="6" fill="#6FB7FF" />
    </svg>
  )
}

// 04 — Invisalign / Clear Aligners: a stack of crystal-clear "trays".
function AlignerVisual() {
  return (
    <svg viewBox="0 0 400 280" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="align-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6FB7FF" />
          <stop offset="100%" stopColor="#2F6BFF" />
        </linearGradient>
      </defs>
      <rect width="400" height="280" fill="url(#align-bg)" />
      {/* Three nested U-shaped aligner trays, increasingly bright */}
      {[
        { y: 150, op: 0.35, w: 12 },
        { y: 130, op: 0.6, w: 11 },
        { y: 110, op: 0.95, w: 10 },
      ].map((t, i) => (
        <path
          key={i}
          d={`M90 ${t.y - 60} L90 ${t.y} Q90 ${t.y + 70} 200 ${t.y + 70} Q310 ${t.y + 70} 310 ${t.y} L310 ${t.y - 60}`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={t.w}
          strokeLinecap="round"
          opacity={t.op}
        />
      ))}
    </svg>
  )
}

// Service content + its matching visual live in data so markup stays clean.
const SERVICES = [
  {
    n: '01',
    title: 'Porcelain Veneers',
    copy: 'Hand-layered by in-house master ceramists for a flawless, light-reactive finish that reads as entirely your own.',
    points: ['Minimal-prep, enamel-conserving', 'Custom shade & translucency'],
    Visual: VeneersVisual,
  },
  {
    n: '02',
    title: 'All-on-X Dental Implants',
    copy: 'A complete, permanent set of teeth — titanium-anchored and engineered to last a lifetime, often in a single visit.',
    points: ['Fixed, never removable', 'Guided digital placement'],
    Visual: ImplantsVisual,
  },
  {
    n: '03',
    title: 'Full-Mouth Makeovers',
    copy: 'A total transformation designed millimeter by millimeter around your face, your bite, and the way you want to be seen.',
    points: ['Facial-harmony design', 'Digital smile preview'],
    Visual: MakeoverVisual,
  },
  {
    n: '04',
    title: 'Invisalign / Clear Aligners',
    copy: 'Discreet, removable, and tailored to your timeline — a precisely planned path to a straighter smile.',
    points: ['Virtually invisible', 'Predictable 3D treatment plan'],
    Visual: AlignerVisual,
  },
]

export default function ServicesSection() {
  const sectionRef = useRef(null) // pinned trigger element
  const trackRef = useRef(null) // horizontally translated flex row

  useLayoutEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    // Scope every animation/selector to this section and revert on cleanup.
    const ctx = gsap.context(() => {
      // ---- Main horizontal scroll -------------------------------------
      // Distance (in px) the track must travel so its right edge meets the
      // viewport's right edge. Recomputed on refresh via the function-based
      // `end` + invalidateOnRefresh, keeping it correct across resizes.
      const getDistance = () => track.scrollWidth - window.innerWidth

      const horizontal = gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => '+=' + getDistance(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })

      // ---- Internal parallax ------------------------------------------
      // Each card "image" drifts on X tied to the same scroll, slightly out of
      // sync with the track for a layered, depth-y feel. We reuse the main
      // tween's ScrollTrigger as the containerAnimation so progress maps to
      // horizontal position rather than vertical scroll.
      const images = gsap.utils.toArray('.svc-parallax')
      images.forEach((img) => {
        const speed = parseFloat(img.dataset.speed) || 0
        gsap.fromTo(
          img,
          { xPercent: -speed },
          {
            xPercent: speed,
            ease: 'none',
            scrollTrigger: {
              trigger: img,
              containerAnimation: horizontal,
              start: 'left right',
              end: 'right left',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="services"
      ref={sectionRef}
      // Opaque background + relative z-10 so this content covers the fixed
      // 3D canvas (z-0). overflow-hidden prevents a page-wide horizontal bar.
      className="relative z-10 overflow-hidden bg-paradise-white text-paradise-ink"
    >
      {/* The flex track. h-screen fills the pinned viewport; items-center
          vertically centers the tall cards. px-[8vw] gives breathing room
          at the start/end of the horizontal run. */}
      <div
        ref={trackRef}
        className="flex h-screen items-center gap-8 px-[8vw] will-change-transform"
      >
        {/* ---- Intro panel ------------------------------------------- */}
        <div className="flex h-[72vh] min-w-[85vw] shrink-0 flex-col justify-center pr-[4vw] md:min-w-[48vw] lg:min-w-[40vw]">
          <span className="mb-6 font-display text-sm font-semibold uppercase tracking-[0.3em] text-paradise-blue">
            Our Signature Work
          </span>
          <h2 className="font-display text-5xl font-bold leading-[0.95] tracking-tightest text-paradise-ink sm:text-6xl lg:text-7xl">
            THE MIAMI
            <br />
            STANDARD
          </h2>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-paradise-slate">
            Four disciplines. One obsession with perfection. Scroll to explore
            the procedures that define our clinic.
          </p>
          {/* A small scroll hint with a blue accent. */}
          <div className="mt-10 flex items-center gap-3 text-sm text-paradise-slate">
            <span className="h-px w-10 bg-paradise-blue" />
            <span className="uppercase tracking-[0.2em]">Scroll to explore</span>
          </div>
        </div>

        {/* ---- Service cards ----------------------------------------- */}
        {SERVICES.map((s, i) => {
          const { Visual } = s
          return (
            <article
              key={s.n}
              className="group relative flex h-[74vh] min-w-[78vw] shrink-0 flex-col overflow-hidden rounded-2xl border border-paradise-line bg-white p-8 shadow-[0_24px_70px_-30px_rgba(10,27,61,0.35)] transition-shadow duration-500 hover:shadow-[0_30px_80px_-30px_rgba(47,107,255,0.4)] md:min-w-[44vw] md:p-10 lg:min-w-[34vw]"
            >
              {/* Abstract blue/white visual with subtle internal parallax.
                  data-speed alternates sign so adjacent cards drift opposite
                  directions for variety. Inner layer is wider than its frame so
                  the X drift never exposes an edge. */}
              <div className="relative mb-8 h-[42%] w-full overflow-hidden rounded-xl">
                <div
                  className="svc-parallax absolute inset-0 -left-[10%] w-[120%]"
                  data-speed={(i % 2 === 0 ? 1 : -1) * 8}
                >
                  <Visual />
                </div>
                {/* Floating number chip for a premium editorial touch. */}
                <span className="absolute left-4 top-4 inline-flex items-center justify-center rounded-full bg-white/90 px-3 py-1 font-display text-xs font-bold tracking-[0.2em] text-paradise-blue shadow-sm backdrop-blur">
                  {s.n}
                </span>
              </div>

              {/* Card body */}
              <h3 className="font-display text-3xl font-bold leading-tight tracking-tightest text-paradise-ink md:text-4xl">
                {s.title}
              </h3>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-paradise-slate">
                {s.copy}
              </p>

              {/* Sub-points with blue tick accents */}
              <ul className="mt-6 space-y-2">
                {s.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm text-paradise-ink">
                    <svg className="h-4 w-4 shrink-0 text-paradise-blue" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
                      <path d="M6 10.5l2.5 2.5L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="leading-snug">{p}</span>
                  </li>
                ))}
              </ul>

              {/* Footer: Learn more link in brand blue, anchored to base. */}
              <div className="mt-auto flex items-center justify-between pt-6">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.15em] text-paradise-blue transition-colors hover:text-paradise-navy"
                >
                  Learn more
                  <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <span className="text-xs uppercase tracking-[0.2em] text-paradise-slate">
                  Bespoke
                </span>
              </div>
            </article>
          )
        })}

        {/* ---- Trailing CTA panel ------------------------------------ */}
        <div className="flex h-[72vh] min-w-[85vw] shrink-0 flex-col justify-center pl-[2vw] md:min-w-[48vw] lg:min-w-[40vw]">
          <span className="mb-6 font-display text-sm font-semibold uppercase tracking-[0.3em] text-paradise-blue">
            Your Turn
          </span>
          <h2 className="font-display text-5xl font-bold leading-[0.95] tracking-tightest text-paradise-ink sm:text-6xl lg:text-7xl">
            Ready to begin?
          </h2>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-paradise-slate">
            Every transformation starts with a conversation. Let's design the
            smile that's been waiting for you.
          </p>
          <a
            href="#contact"
            className="mt-10 inline-flex w-fit items-center justify-center rounded-full bg-paradise-blue px-8 py-4 font-display text-sm font-semibold uppercase tracking-[0.15em] text-white shadow-[0_18px_40px_-15px_rgba(47,107,255,0.6)] transition-transform duration-300 hover:scale-[1.03] hover:bg-paradise-navy"
          >
            Request a Consultation
          </a>
        </div>
      </div>
    </section>
  )
}
