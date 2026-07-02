import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './lib/gsap'

import Navbar from './components/Navbar.jsx'
import CanvasExperience from './components/CanvasExperience.jsx'
import ScrollOverlay from './components/ScrollOverlay.jsx'
import ServicesSection from './components/ServicesSection.jsx'
import GallerySection from './components/GallerySection.jsx'
import TrustSection from './components/TrustSection.jsx'
import ReviewsSection from './components/ReviewsSection.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  // Lenis smooth scroll, driven by GSAP's ticker and wired into ScrollTrigger so
  // every scrubbed timeline (hero 3D + horizontal services) stays frame-synced.
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const ticker = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(ticker)
    gsap.ticker.lagSmoothing(0)

    // Anchor links (#services etc.) routed through Lenis for smooth jumps.
    const onClick = (e) => {
      const link = e.target.closest('a[href^="#"]')
      if (!link) return
      const id = link.getAttribute('href')
      if (id.length > 1) {
        e.preventDefault()
        lenis.scrollTo(id, { offset: 0 })
      }
    }
    document.addEventListener('click', onClick)

    // Recalculate once everything (incl. the canvas) has laid out.
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    const t = setTimeout(refresh, 300)

    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener('load', refresh)
      clearTimeout(t)
      gsap.ticker.remove(ticker)
      lenis.destroy()
    }
  }, [])

  return (
    <>
      <Navbar />

      {/* Shared, fixed 3D experience that lives behind all content */}
      <CanvasExperience />

      <main className="relative">
        {/* Hero: tall transparent scroll-track; the smile shows through */}
        <ScrollOverlay />

        {/* Post-hero sections — each carries its own opaque background */}
        <ServicesSection />
        <GallerySection />
        <TrustSection />
        <ReviewsSection />
        <Footer />
      </main>
    </>
  )
}
