/**
 * Footer
 * ------
 * Dark, premium closing/contact section. Doubles as the "#contact" anchor that
 * the navbar and CTAs point to. Like every section it carries its own opaque
 * background (paradise-ink) so it cleanly covers the fixed 3D canvas below.
 */

// Pre-built Google Maps directions link from the real business address.
const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=All+Dental+Paradise+13+SW+107th+Ave+Miami+FL+33174'

// "Explore" navigation links, kept as data for declarative markup.
const EXPLORE_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Smile Gallery', href: '#gallery' },
  { label: 'Technology', href: '#trust' },
  { label: 'Reviews', href: '#reviews' },
]

/**
 * Small inline star used in the reviews badge — avoids external assets. The
 * warm gold (#F5B301) is the one sanctioned exception to the blue/white/black
 * palette, applied ONLY to the star glyph so the rating reads authentically.
 */
function StarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      style={{ color: '#F5B301' }}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z"
      />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative z-10 bg-paradise-ink py-24 text-paradise-white"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Closing call-to-action */}
        <div className="max-w-3xl">
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Your paradise smile starts here.
          </h2>
          <a
            href="#contact"
            className="mt-8 inline-flex rounded-full bg-paradise-blue px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95"
          >
            Book Your Visit
          </a>
        </div>

        {/* Three-column info block */}
        <div className="mt-20 grid gap-12 border-t border-paradise-white/10 pt-16 md:grid-cols-3">
          {/* Column 1 — brand */}
          <div>
            <p className="font-display text-xl font-bold tracking-tight">
              ALL DENTAL <span className="text-paradise-blue">PARADISE</span>
            </p>
            <p className="mt-3 text-sm text-paradise-white/60">
              Luxury Dentistry · South Florida
            </p>
          </div>

          {/* Column 2 — visit / location */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-paradise-white/40">
              Visit
            </h3>
            <address className="mt-4 not-italic text-sm leading-relaxed text-paradise-white/80">
              13 SW 107th Ave
              <br />
              Miami, FL 33174
              <br />
              <span className="text-paradise-white/60">Holiday Plaza</span>
            </address>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-paradise-sky transition-colors hover:text-paradise-white"
            >
              Get Directions
              <span aria-hidden="true">→</span>
            </a>
          </div>

          {/* Column 3 — explore */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-paradise-white/40">
              Explore
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-paradise-white/80 transition-colors hover:text-paradise-sky"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-start gap-4 border-t border-paradise-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-paradise-white/50">
            © 2026 All Dental Paradise Corp. All rights reserved.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-paradise-white/10 px-3 py-1.5">
            <StarIcon />
            <span className="text-xs font-medium text-paradise-white/80">
              4,496+ Google Reviews · 5.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
