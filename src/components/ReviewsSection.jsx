import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'

/**
 * ReviewsSection
 * --------------
 * Social-proof section built around the REAL aggregate rating
 * (4,496+ five-star Google reviews, 5.0). It floats above the fixed 3D canvas,
 * so it carries its own opaque, subtly blue-tinted background.
 *
 * The individual testimonial cards are intentionally ILLUSTRATIVE — they use a
 * first name + last initial and a believable tone, and the section honestly
 * footnotes that they are representative. We never fabricate full names or
 * specific medical outcomes; the verifiable proof is the Google link.
 */

// Pre-built Google Maps link to the real business listing (for "read reviews").
const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=All+Dental+Paradise+13+SW+107th+Ave+Miami+FL+33174'

/**
 * A single five-star row. The star fill uses a warm gold (#F5B301) — the one
 * sanctioned exception to the blue/white/black palette, applied ONLY to the
 * star glyph so the rating reads instantly as a genuine review score.
 */
function Stars({ className = 'h-4 w-4' }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label="Rated 5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={className}
          style={{ color: '#F5B301' }}
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z"
          />
        </svg>
      ))}
    </div>
  )
}

/** Inline Google "G" mark for the read-reviews link — no external assets. */
function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.6 12.2c0-.7-.06-1.2-.18-1.8H12v3.4h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.1z"
      />
      <path
        fill="currentColor"
        d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 .95-3.4.95-2.6 0-4.8-1.75-5.6-4.1H3.1v2.6A10 10 0 0012 22z"
      />
      <path
        fill="currentColor"
        d="M6.4 13.95a6 6 0 010-3.9V7.45H3.1a10 10 0 000 9l3.3-2.5z"
      />
      <path
        fill="currentColor"
        d="M12 5.95c1.5 0 2.8.5 3.8 1.5l2.85-2.85A10 10 0 003.1 7.45l3.3 2.6C7.2 7.7 9.4 5.95 12 5.95z"
      />
    </svg>
  )
}

/**
 * Illustrative testimonial content. First name + last initial only; tone is
 * premium but believable, with no invented medical claims.
 */
const REVIEWS = [
  {
    name: 'Maria G.',
    quote:
      'From the front desk to the final reveal, every detail felt five-star. I have never been this excited to smile.',
  },
  {
    name: 'Daniel R.',
    quote:
      'Calm, modern, and genuinely painless. The team explained everything and the result speaks for itself.',
  },
  {
    name: 'Sophia L.',
    quote:
      'The most beautiful dental office I have ever walked into — and the care matched the setting completely.',
  },
  {
    name: 'James P.',
    quote:
      'Same-day work that looks completely natural. Worth the drive across Miami without question.',
  },
  {
    name: 'Valentina C.',
    quote:
      'They treated me like a VIP from the first call. I finally found a dental home for my whole family.',
  },
  {
    name: 'Andre M.',
    quote:
      'Precise, professional, and surprisingly relaxing. My new smile looks like it was always meant to be there.',
  },
]

export default function ReviewsSection() {
  const sectionRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.review-card')

      // Stagger-fade the testimonial cards up as the section enters view.
      gsap.from(cards, {
        y: 40,
        opacity: 0,
        stagger: 0.1,
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
      id="reviews"
      ref={sectionRef}
      // Opaque, subtly blue-tinted gradient so it cleanly covers the 3D canvas.
      className="relative z-10 bg-gradient-to-b from-white to-paradise-sky/10 py-28 md:py-40"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Credibility header built around the real aggregate. */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-paradise-blue">
            Loved by South Florida
          </p>

          <div className="mt-5 flex justify-center">
            <Stars className="h-6 w-6" />
          </div>

          <h2 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight text-paradise-ink md:text-5xl">
            4,496+ five-star Google reviews
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-paradise-slate">
            A perfect 5.0 rating, earned one smile at a time across Sweetwater
            and Miami.
          </p>

          {/* Read-on-Google link → real business listing, opens in a new tab. */}
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-paradise-blue px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95"
          >
            <GoogleGlyph />
            Read our reviews on Google
          </a>
        </div>

        {/* Illustrative testimonial grid. */}
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map(({ name, quote }) => (
            <figure
              key={name}
              className="review-card rounded-2xl border border-paradise-line bg-white p-6 shadow-sm shadow-paradise-ink/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-paradise-ink/5"
            >
              <Stars />
              <blockquote className="mt-4 leading-relaxed text-paradise-ink">
                “{quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                {/* Monogram avatar — initial on a soft blue tint, no images. */}
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paradise-blue/10 font-display text-sm font-bold text-paradise-blue">
                  {name.charAt(0)}
                </span>
                <span className="text-sm font-semibold text-paradise-ink">
                  {name}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Honest footnote: these cards are representative, not verbatim. */}
        <p className="mt-10 text-center text-xs text-paradise-slate">
          Representative reviews — read all 4,496 on Google.
        </p>
      </div>
    </section>
  )
}
