import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const links = [
  { label: 'About',    href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Work',     href: '#projects' },
  { label: 'Contact',  href: '#footer' },
]

export default function Navbar() {
  const navRef      = useRef(null)
  const progRef     = useRef(null)
  const sideProgRef = useRef(null)
  const [scrolled,  setScrolled]  = useState(false)
  const [hidden,    setHidden]    = useState(false)
  const [active,    setActive]    = useState('')
  const [menuOpen,  setMenuOpen]  = useState(false)

  useEffect(() => {
    // ── Entrance animation ──────────────────────────────────────────
    gsap.fromTo(navRef.current,
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 2.8 }
    )

    // ── Scroll progress (top bar + side bar) ────────────────────────
    ScrollTrigger.create({
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: self => {
        const p = self.progress
        if (progRef.current)     progRef.current.style.transform     = `scaleX(${p})`
        if (sideProgRef.current) sideProgRef.current.style.transform = `scaleY(${p})`
      },
    })

    // ── Hide on scroll down, show on scroll up ──────────────────────
    let lastY    = 0
    let ticking  = false

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y   = window.scrollY
          const nav = navRef.current
          if (!nav) { ticking = false; return }

          setScrolled(y > 80)

          if (y > lastY && y > 120) {
            // Scrolling down — hide
            if (!hidden) {
              gsap.to(nav, { y: -80, duration: 0.4, ease: 'power3.in' })
              setHidden(true)
            }
          } else {
            // Scrolling up — show
            if (hidden || y <= 120) {
              gsap.to(nav, { y: 0, duration: 0.5, ease: 'power3.out' })
              setHidden(false)
            }
          }

          lastY   = y
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    // ── Active section detection ────────────────────────────────────
    const sections = links.map(l => document.querySelector(l.href)).filter(Boolean)
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setActive('#' + e.target.id)
      }),
      { threshold: 0.35 }
    )
    sections.forEach(s => io.observe(s))

    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [])

  const go = (href) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* ── Side scroll progress indicator ── */}
      <div
        style={{
          position: 'fixed',
          left: 0, top: 0, bottom: 0,
          width: 2,
          zIndex: 60,
          pointerEvents: 'none',
          background: 'rgba(38,38,38,0.5)',
        }}
      >
        <div
          ref={sideProgRef}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '100%',
            transformOrigin: 'top',
            transform: 'scaleY(0)',
            background: 'linear-gradient(to bottom, transparent, rgba(200,200,200,0.5) 30%, rgba(200,200,200,0.8) 70%, transparent)',
          }}
        />
      </div>

      {/* ── Navbar ── */}
      <nav
        ref={navRef}
        className={`fixed top-0 inset-x-0 z-50 transition-colors duration-500 ${
          scrolled
            ? 'bg-ink/85 backdrop-blur-xl border-b border-ink-border'
            : 'bg-transparent'
        }`}
        style={{ opacity: 0, willChange: 'transform' }}
      >
        {/* Top progress line */}
        <div
          ref={progRef}
          className="absolute bottom-0 left-0 right-0 h-px origin-left"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(200,200,200,0.6) 40%, rgba(200,200,200,0.9) 60%, transparent)',
            transform: 'scaleX(0)',
          }}
        />

        <div className="flex items-center justify-between px-8 md:px-16 py-5 max-w-[1600px] mx-auto">

          {/* Monogram */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="relative w-9 h-9 border border-ink-border group-hover:border-silver/40 transition-colors duration-300 flex items-center justify-center overflow-hidden">
              <span
                className="font-display text-xl font-light text-white transition-transform duration-300 group-hover:-translate-y-full"
                style={{ fontFamily: "'Cormorant Garamond',serif" }}
              >
                T
              </span>
              <span
                className="font-display text-xl font-light text-white absolute translate-y-full transition-transform duration-300 group-hover:translate-y-0"
                style={{ fontFamily: "'Cormorant Garamond',serif" }}
              >
                T
              </span>
            </div>
            <div className="hidden md:block overflow-hidden">
              <div className="font-mono text-[10px] tracking-[0.3em] text-silver/60 uppercase group-hover:text-silver/80 transition-colors duration-300">
                Tegar Baradika
              </div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-10">
            {links.map((l, i) => (
              <button
                key={l.label}
                onClick={() => go(l.href)}
                className={`relative font-mono text-[10px] uppercase tracking-[0.25em] transition-colors duration-300 group ${
                  active === l.href ? 'text-white' : 'text-silver-dim/60 hover:text-silver'
                }`}
              >
                {/* Number prefix */}
                <span className="text-silver/20 mr-1.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {l.label}
                {/* Underline */}
                <span className={`absolute -bottom-1 left-0 h-px bg-silver transition-all duration-400 ${
                  active === l.href ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => go('#footer')}
              data-cursor="Hire"
              className="group relative border border-ink-border text-silver font-mono text-[10px] px-5 py-2.5 uppercase tracking-[0.25em] overflow-hidden transition-colors duration-300 hover:border-white/40"
            >
              {/* Fill sweep on hover */}
              <span className="absolute inset-0 bg-white translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 group-hover:text-ink transition-colors duration-150">
                Available
              </span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 border border-ink-border"
            aria-label="Toggle menu"
          >
            <span className={`block w-4 h-px bg-silver/70 transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
            <span className={`block w-4 h-px bg-silver/70 transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-4 h-px bg-silver/70 transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
          </button>
        </div>

        {/* Mobile menu overlay */}
        {menuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-ink/95 backdrop-blur-xl border-b border-ink-border">
            <div className="flex flex-col px-8 py-8 gap-6">
              {links.map((l, i) => (
                <button
                  key={l.label}
                  onClick={() => { go(l.href); setMenuOpen(false) }}
                  className="flex items-center gap-4 text-left group"
                >
                  <span className="font-mono text-[9px] text-silver/20 w-6">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-mono text-sm uppercase tracking-[0.25em] text-silver/60 group-hover:text-white transition-colors duration-200">
                    {l.label}
                  </span>
                </button>
              ))}
              <div className="h-px bg-ink-border mt-2" />
              <button
                onClick={() => { go('#footer'); setMenuOpen(false) }}
                className="font-mono text-[10px] uppercase tracking-[0.25em] text-silver/40 text-left"
              >
                Available for work →
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
