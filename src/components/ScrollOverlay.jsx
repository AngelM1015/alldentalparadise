/*
 * ScrollOverlay
 * -------------
 * The tall hero "scroll-track" that gives the GSAP master timeline its room to
 * run. The 3D canvas is fixed BEHIND this section; here we render only the
 * pinned (sticky) typographic overlay. Each .hero-line is driven directly by
 * the GSAP timeline in CanvasExperience (via data-line selectors) — never by
 * React state — so the 3D and the type stay perfectly in sync without re-renders.
 *
 * The section is intentionally transparent so the smile shows through.
 */
export default function ScrollOverlay() {
  return (
    <section id="hero" className="relative" style={{ height: '600vh' }}>
      {/* Sticky viewport that the type lives in while the page scrolls past */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Top kicker / brand line + the review-count trust badge (our biggest
            advantage over competitors — lead with it). */}
        <div className="pointer-events-none absolute left-0 right-0 top-24 flex flex-col items-center gap-4">
          <span className="text-xs uppercase tracking-[0.5em] text-paradise-slate">
            All Dental Paradise · Miami
          </span>
          <span className="pointer-events-auto flex items-center gap-2 rounded-full border border-paradise-line bg-white/80 px-4 py-2 text-xs font-medium text-paradise-ink shadow-sm backdrop-blur">
            <span className="flex text-paradise-blue" aria-hidden="true">
              {'★★★★★'}
            </span>
            <span className="tabular-nums">4,496+ five-star Google reviews</span>
          </span>
        </div>

        {/* Centered animated headline stack — all lines absolutely stacked so
            they cross-fade in place. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-[24vw] w-full max-w-[1200px]">
            <Line index={0}>PARADISE.</Line>
            <Line index={1}>IS IN.</Line>
            <Line index={2}>THE DETAILS.</Line>
            <Line index={3} tagline>
              A higher standard of smile.
            </Line>
          </div>
        </div>

        {/* Scroll cue, fades naturally as you go */}
        <div className="pointer-events-none absolute bottom-10 left-0 right-0 flex flex-col items-center gap-2 text-paradise-slate">
          <span className="text-[10px] uppercase tracking-[0.4em]">Scroll to diagnose</span>
          <span className="block h-10 w-[1px] animate-pulse bg-paradise-slate/50" />
        </div>
      </div>
    </section>
  )
}

function Line({ index, children, tagline = false }) {
  return (
    <h1
      data-line={index}
      className={
        'hero-line absolute inset-0 flex items-center justify-center text-center font-display font-extrabold leading-none text-paradise-ink ' +
        (tagline
          ? 'text-[6vw] md:text-[3.4vw] tracking-tight text-paradise-slate'
          : 'text-[14vw] md:text-[11vw] tracking-tightest')
      }
    >
      {children}
    </h1>
  )
}
