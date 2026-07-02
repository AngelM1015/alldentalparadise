import { useEffect, useState } from 'react'

/**
 * Navbar
 * -------
 * Fixed, transparent-at-top navigation that gains a frosted/blurred look once
 * the user scrolls past ~40px. The scroll state is a single boolean, which is
 * intentionally lightweight — it is not driving the 3D canvas, so plain
 * useState + a scroll listener is the simplest correct approach.
 *
 * Sits at z-50 so it floats above every section (which live at z-10) and the
 * fixed full-screen 3D canvas (z-0).
 */

// Primary navigation links. Kept as data so the markup stays declarative.
const LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Smile Gallery', href: '#gallery' },
  { label: 'Technology', href: '#trust' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Visit', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    // Toggle the frosted state once we pass a small threshold near the top.
    const onScroll = () => setScrolled(window.scrollY > 40)

    onScroll() // sync on mount in case the page loads already scrolled
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={[
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled
          ? 'backdrop-blur bg-paradise-white/80 border-b border-paradise-line'
          : 'bg-transparent border-b border-transparent',
      ].join(' ')}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:py-5">
        {/* Wordmark — "PARADISE" emphasized in paradise-blue for brand accent. */}
        <a
          href="#top"
          className="font-display text-lg font-bold tracking-tight text-paradise-ink md:text-xl"
        >
          ALL DENTAL <span className="text-paradise-blue">PARADISE</span>
        </a>

        {/* Center/right nav links — hidden on small screens to keep mobile clean. */}
        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-paradise-slate transition-colors hover:text-paradise-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Primary CTA — always visible, including on mobile. */}
        <a
          href="#contact"
          className="rounded-full bg-paradise-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03] active:scale-95"
        >
          Book Consultation
        </a>
      </nav>
    </header>
  )
}
