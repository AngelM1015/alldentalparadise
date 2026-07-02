import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'

/**
 * Inline icon glyphs — kept as small local components so the cards never
 * depend on external image assets. Each is a minimal, stroked SVG that inherits
 * `currentColor` (we color it paradise-blue via the wrapper).
 */
function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path
        d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GemIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path
        d="M6 4h12l3 5-9 11L3 9l3-5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M3 9h18M9 4l-3 5 6 11 6-11-3-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ConciergeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path
        d="M4 18h16M12 8a6 6 0 016 6H6a6 6 0 016-6zM12 8V5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="4" r="1.4" fill="currentColor" />
    </svg>
  )
}

/** Feature content, kept as data so the markup stays declarative. */
const FEATURES = [
  {
    icon: ShieldIcon,
    title: 'Pain-Free Technology',
    body:
      'Modern, anxiety-free visits powered by the latest in digital and laser dentistry — gentler, faster, and remarkably precise.',
  },
  {
    icon: GemIcon,
    title: 'In-House Master Ceramists',
    body:
      'Restorations are hand-crafted on-site by master ceramists, delivering unmatched precision and same-visit speed.',
  },
  {
    icon: ConciergeIcon,
    title: 'VIP Concierge Care',
    body:
      'A private, white-glove experience tailored entirely to your schedule, comfort, and individual goals.',
  },
]

/** Small stats shown in the slim strip above the grid. */
const STATS = [
  '4,496+ 5-Star Reviews',
  'Same-Day Restorations',
  'Board-Certified Care',
]

/**
 * TrustSection
 * ------------
 * "Trust & Technology" marketing section. Has its own opaque white background
 * (it floats above the fixed 3D canvas) and reveals its feature cards with a
 * staggered upward fade as it scrolls into view.
 */
export default function TrustSection() {
  const sectionRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.trust-card')

      // Fade + stagger the cards up as the section enters the viewport.
      gsap.from(cards, {
        y: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="trust"
      ref={sectionRef}
      className="relative z-10 bg-paradise-white py-28 md:py-40"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading block */}
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-paradise-blue">
            Trust &amp; Technology
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-paradise-ink md:text-5xl">
            Engineered for the highest standard of care.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-paradise-slate">
            Every detail of your visit — from diagnosis to the final polish — is
            crafted with advanced technology and a meticulous, human touch.
          </p>
        </div>

        {/* Slim stats strip */}
        <div className="mt-12 flex flex-col items-start gap-4 border-y border-paradise-line py-6 text-paradise-ink sm:flex-row sm:items-center sm:gap-0">
          {STATS.map((stat, i) => (
            <div key={stat} className="flex items-center">
              <span className="font-display text-base font-semibold tracking-tight">
                {stat}
              </span>
              {i < STATS.length - 1 && (
                <span
                  className="mx-6 hidden text-paradise-blue sm:inline"
                  aria-hidden="true"
                >
                  ·
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="trust-card group rounded-2xl border border-paradise-line bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-paradise-ink/5"
            >
              {/* Icon glyph — blue stroke on a soft blue tint. */}
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-paradise-blue/10 text-paradise-blue">
                <Icon />
              </div>

              <h3 className="mt-6 font-display text-xl font-bold tracking-tight text-paradise-ink">
                {title}
              </h3>
              <p className="mt-3 leading-relaxed text-paradise-slate">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
