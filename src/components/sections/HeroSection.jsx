import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import HeroCanvas       from '../ui/HeroCanvas'
import LiveClock        from '../ui/LiveClock'
import SpotlightCursor  from '../ui/SpotlightCursor'
import FloatingTechBits from '../ui/FloatingTechBits'
import HoloCard         from '../ui/HoloCard'
import { useProjects }  from '../../context/ProjectContext'

gsap.registerPlugin(ScrollTrigger)

const BARA_LETTERS = ['B', 'A', 'R', 'A']
const GLITCH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*!?'

// ── Typewriter roles ──────────────────────────────────────────────
const ROLES = [
  'Full-Stack Developer & Creative Technologist',
  'React · Node.js · Three.js · GSAP',
  'Building for the web since 2019',
  'Open to freelance & full-time',
]

export default function HeroSection() {
  const { profile, stats } = useProjects()
  const sectionRef  = useRef(null)
  const line1Ref    = useRef(null)
  const line2Ref    = useRef(null)
  const line3Ref    = useRef(null)
  const subRef      = useRef(null)
  const badgeRef    = useRef(null)
  const scrollRef   = useRef(null)
  const decorRef    = useRef(null)
  const yearRef     = useRef(null)
  const lettersRef  = useRef([])
  const hubRef      = useRef(null)
  const typeRef     = useRef(null)   // typewriter ref
  const line1ElRef  = useRef(null)   // actual h1 for magnetic
  const line2ElRef  = useRef(null)
  const line3ElRef  = useRef(null)

  // ── Typewriter state ─────────────────────────────────────────────
  const [typeText,   setTypeText]   = useState('')
  const [typeCursor, setTypeCursor] = useState(true)
  const roleIdx  = useRef(0)
  const typeTimers = useRef([])

  useEffect(() => {
    let cancelled = false

    const clearAll = () => typeTimers.current.forEach(clearTimeout)

    const typeIn = (text, cb) => {
      let i = 0
      const next = () => {
        if (cancelled) return
        if (i <= text.length) {
          setTypeText(text.slice(0, i))
          i++
          const t = setTimeout(next, 38 + Math.random() * 22)
          typeTimers.current.push(t)
        } else {
          cb?.()
        }
      }
      next()
    }

    const typeOut = (text, cb) => {
      let i = text.length
      const next = () => {
        if (cancelled) return
        if (i >= 0) {
          setTypeText(text.slice(0, i))
          i--
          const t = setTimeout(next, 22)
          typeTimers.current.push(t)
        } else {
          cb?.()
        }
      }
      next()
    }

    const cycle = () => {
      if (cancelled) return
      const text = ROLES[roleIdx.current % ROLES.length]
      typeIn(text, () => {
        const hold = setTimeout(() => {
          typeOut(text, () => {
            roleIdx.current++
            const gap = setTimeout(cycle, 400)
            typeTimers.current.push(gap)
          })
        }, 2200)
        typeTimers.current.push(hold)
      })
    }

    // Start after preloader
    const startDelay = setTimeout(cycle, 3200)
    typeTimers.current.push(startDelay)

    // Cursor blink
    const blinkId = setInterval(() => {
      if (!cancelled) setTypeCursor(v => !v)
    }, 530)

    return () => {
      cancelled = true
      clearAll()
      clearInterval(blinkId)
    }
  }, [])

  // ── GSAP animations ──────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.matchMedia('(max-width:768px)').matches
      const letters  = lettersRef.current.filter(Boolean)

      /* ── Initial states ── */
      gsap.set([line1Ref.current, line2Ref.current, line3Ref.current], { yPercent: 105 })
      gsap.set(badgeRef.current,  { opacity: 0, y: 16 })
      gsap.set(subRef.current,    { opacity: 0, y: 24 })
      gsap.set(scrollRef.current, { opacity: 0 })
      gsap.set(yearRef.current,   { opacity: 0 })
      if (decorRef.current?.children) {
        gsap.set(Array.from(decorRef.current.children), { opacity: 0, scaleX: 0 })
      }

      /* ── BARA: 3-D flip entrance ── */
      gsap.set(letters, { opacity: 0, y: 80, rotateX: -90, transformOrigin: '50% 100%' })
      gsap.to(letters, {
        opacity: 0.06, y: 0, rotateX: 0,
        duration: 1.6, stagger: 0.14, ease: 'power4.out', delay: 3.2,
      })

      /* ── BARA: float ── */
      letters.forEach((el, i) => {
        gsap.to(el, {
          y: `+=${14 + i * 5}`,
          duration: 3.4 + i * 0.6,
          repeat: -1, yoyo: true, ease: 'sine.inOut',
          delay: 4.8 + i * 0.5,
        })
      })

      /* ── BARA: glitch flicker ── */
      const glitchLetter = () => {
        const el = letters[Math.floor(Math.random() * letters.length)]
        if (!el) return
        gsap.timeline()
          .to(el, { opacity: 0.28, skewX: 10,  duration: 0.05, ease: 'none' })
          .to(el, { opacity: 0,    skewX: -8,  duration: 0.04, ease: 'none' })
          .to(el, { opacity: 0.32, skewX: 0,   duration: 0.06, ease: 'none' })
          .to(el, { opacity: 0.06, skewX: 0,   duration: 0.14, ease: 'power2.out' })
      }
      const scheduleGlitch = () => {
        const d = 1600 + Math.random() * 2800
        setTimeout(() => { glitchLetter(); scheduleGlitch() }, d)
      }
      const glitchTimer = setTimeout(scheduleGlitch, 5000)

      /* ── BARA: parallax on scroll ── */
      if (!isMobile) {
        letters.forEach((el, i) => {
          gsap.to(el, {
            yPercent: -20 - i * 10, ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top', end: 'bottom top',
              scrub: 1.0 + i * 0.35,
            },
          })
        })
      }

      /* ── HUB shimmer ── */
      if (hubRef.current) {
        gsap.fromTo(hubRef.current,
          { backgroundPositionX: '200%' },
          { backgroundPositionX: '-200%', duration: 3.5, repeat: -1, ease: 'none', delay: 4.2 }
        )
      }

      /* ── Main entrance timeline ── */
      const tl = gsap.timeline({ delay: 2.9 })
      tl.to(badgeRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
      tl.to([line1Ref.current, line2Ref.current, line3Ref.current],
        { yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: 0.1 }, '-=0.4')
      tl.to(subRef.current, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.6')
      if (decorRef.current?.children) {
        tl.to(Array.from(decorRef.current.children),
          { opacity: 1, scaleX: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, '-=0.5')
      }
      tl.to(scrollRef.current, { opacity: 1, duration: 0.6 }, '-=0.3')
      tl.to(yearRef.current,   { opacity: 1, duration: 0.6 }, '-=0.4')

      /* ── Scroll dot bounce ── */
      gsap.to(scrollRef.current?.querySelector('.s-dot'), {
        y: 14, duration: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })

      /* ── Scroll parallax ── */
      if (!isMobile) {
        gsap.to(line1Ref.current?.parentElement, {
          yPercent: -8, ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 1.2 },
        })
        gsap.to(line3Ref.current?.parentElement, {
          yPercent: -20, ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 0.8 },
        })
        gsap.to(subRef.current, {
          opacity: 0, yPercent: -15, ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: '40% top', end: 'bottom top', scrub: 1 },
        })
      }

      /* ── ② MAGNETIC TEXT — headline words follow cursor ── */
      if (!isMobile) {
        const magnetEls = [
          { el: line1ElRef.current, strength: 0.06 },
          { el: line2ElRef.current, strength: 0.09 },
          { el: line3ElRef.current, strength: 0.07 },
        ]

        const onMouseMove = (e) => {
          magnetEls.forEach(({ el, strength }) => {
            if (!el) return
            const rect = el.getBoundingClientRect()
            const cx   = rect.left + rect.width  / 2
            const cy   = rect.top  + rect.height / 2
            const dx   = e.clientX - cx
            const dy   = e.clientY - cy
            const dist = Math.sqrt(dx * dx + dy * dy)
            const maxDist = window.innerWidth * 0.55

            if (dist < maxDist) {
              const pull = (1 - dist / maxDist) * strength
              gsap.to(el, {
                x: dx * pull,
                y: dy * pull * 0.5,
                duration: 0.6,
                ease: 'power2.out',
                overwrite: 'auto',
              })
            } else {
              gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'power3.out', overwrite: 'auto' })
            }
          })
        }

        const onMouseLeave = () => {
          magnetEls.forEach(({ el }) => {
            if (!el) return
            gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' })
          })
        }

        window.addEventListener('mousemove',  onMouseMove)
        window.addEventListener('mouseleave', onMouseLeave)

        return () => {
          clearTimeout(glitchTimer)
          window.removeEventListener('mousemove',  onMouseMove)
          window.removeEventListener('mouseleave', onMouseLeave)
        }
      }

      return () => clearTimeout(glitchTimer)
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex flex-col justify-center"
      style={{ background: '#080808' }}
    >
      {/* Layer 1 — WebGL */}
      <HeroCanvas />

      {/* Layer 2 — Spotlight */}
      <SpotlightCursor heroRef={sectionRef} />

      {/* Layer 3 — Floating tech bits */}
      <FloatingTechBits sectionRef={sectionRef} />

      {/* Layer 4a — Radial vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 30%, rgba(8,8,8,0.7) 70%, #080808 100%)',
        zIndex: 4,
      }} />

      {/* Layer 4b — Faint grid */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(#C8C8C8 1px, transparent 1px), linear-gradient(90deg, #C8C8C8 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        zIndex: 4,
      }} />

      {/* Layer 5 — BARA watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" style={{ zIndex: 5 }}>
        <div className="flex items-center justify-center gap-[1vw]" style={{ perspective: '1000px' }}>
          {BARA_LETTERS.map((letter, i) => (
            <span
              key={i}
              ref={el => lettersRef.current[i] = el}
              style={{
                fontFamily: "'Anton', sans-serif",
                fontSize: 'clamp(100px, 20vw, 300px)',
                lineHeight: 1,
                display: 'inline-block',
                willChange: 'transform, opacity',
                color: 'transparent',
                WebkitTextStroke: '1px rgba(200,200,200,0.18)',
                opacity: 0,
              }}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>

      {/* Layer 15 — HoloCard */}
      <HoloCard
        photoUrl={profile.photoUrl}
        name={profile.name}
        title={profile.title}
        role={profile.role}
      />

      {/* Layer 6 — Film grain */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 6, opacity: 0.045,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '180px 180px',
      }} />

      {/* Layer 20 — Clock */}
      <LiveClock />

      {/* Layer 20 — Year tag */}
      <div ref={yearRef} className="absolute top-24 right-8 md:right-16" style={{ zIndex: 20 }}>
        <div className="font-mono text-[9px] text-silver-dim/40 uppercase tracking-[0.3em] rotate-90 origin-right translate-x-full">
          Est. 2024
        </div>
      </div>

      {/* Layer 20 — Main content */}
      <div
        className="relative px-8 md:px-16 lg:px-24 max-w-[1600px] mx-auto w-full pt-28 pb-16"
        style={{ zIndex: 20 }}
      >
        {/* ③ Badge — typewriter */}
        <div ref={badgeRef} className="mb-10 flex items-center gap-4">
          <div className="w-5 h-px bg-silver/30" />
          <span className="font-mono text-[9px] text-silver/50 uppercase tracking-[0.4em]">
            {typeText}
            <span
              className="inline-block w-px h-[0.8em] bg-silver/50 ml-0.5 align-middle"
              style={{ opacity: typeCursor ? 1 : 0, transition: 'opacity 0.1s' }}
            />
          </span>
        </div>

        {/* Headline */}
        <div className="mb-10 md:mb-14">

          {/* Line 1: CREATIVE — ② magnetic */}
          <div className="overflow-hidden">
            <h1
              ref={line1Ref}
              className="leading-[0.88] uppercase text-white"
              style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(72px, 13vw, 210px)' }}
            >
              <span ref={line1ElRef} style={{ display: 'inline-block', willChange: 'transform' }}>
                CREATIVE
              </span>
            </h1>
          </div>

          {/* Line 2: Tech HUB — ② magnetic */}
          <div className="overflow-hidden flex items-end gap-6 md:gap-10">
            <h1
              ref={line2Ref}
              className="leading-[0.88] text-white"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic', fontWeight: 300,
                fontSize: 'clamp(64px, 11.5vw, 185px)',
              }}
            >
              <span ref={line2ElRef} style={{ display: 'inline-block', willChange: 'transform' }}>
                Tech
              </span>
            </h1>

            {/* HUB — outline + shimmer */}
            <h1
              ref={line3Ref}
              className="leading-[0.88] uppercase relative"
              style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(72px, 13vw, 210px)' }}
            >
              <span ref={line3ElRef} style={{ display: 'inline-block', willChange: 'transform', position: 'relative' }}>
                {/* Outline base */}
                <span aria-hidden="true" style={{
                  position: 'absolute', inset: 0,
                  color: 'transparent',
                  WebkitTextStroke: '1px rgba(200,200,200,0.22)',
                  display: 'block',
                }}>
                  HUB
                </span>
                {/* Shimmer fill */}
                <span ref={hubRef} style={{
                  display: 'block',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(200,200,200,0.5) 25%, rgba(255,255,255,0.85) 50%, rgba(200,200,200,0.5) 75%, transparent 100%)',
                  backgroundSize: '300% 100%',
                  backgroundPositionX: '200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  HUB
                </span>
              </span>
            </h1>
          </div>
        </div>

        {/* Sub + CTA */}
        <div ref={subRef} className="flex flex-col md:flex-row items-start md:items-end gap-10 md:gap-20">
          <p className="font-body text-silver-dim/70 text-base md:text-lg leading-relaxed max-w-sm font-light">
            Building performant digital experiences at the intersection of engineering precision and visual craft.
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
              data-cursor="View"
              className="group flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-silver hover:text-white transition-colors duration-300"
            >
              <span className="w-10 h-px bg-silver/40 group-hover:w-16 group-hover:bg-white transition-all duration-400" />
              Selected Work
            </button>
            <button
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="font-mono text-[10px] uppercase tracking-[0.3em] text-silver-dim/50 hover:text-silver-dim transition-colors duration-300"
            >
              About
            </button>
          </div>
        </div>

        {/* Stats */}
        <div ref={decorRef} className="hidden md:flex items-center gap-8 mt-20 pt-8 border-t border-ink-border">
          {stats.map(s => (
            <div key={s.id} className="origin-left">
              <div className="font-display font-light text-2xl text-white" style={{ fontFamily: "'Cormorant Garamond',serif" }}>
                {s.value}{s.suffix}
              </div>
              <div className="font-mono text-[9px] text-silver-dim/40 uppercase tracking-[0.25em] mt-1">
                {s.labelShort || s.label?.split('\n')[0]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ zIndex: 20 }}
      >
        <span className="font-mono text-[8px] text-silver/20 uppercase tracking-[0.4em]">Scroll</span>
        <div className="w-px h-14 bg-ink-border relative overflow-hidden">
          <div className="s-dot w-px h-5 bg-silver/50 absolute top-0" />
        </div>
      </div>
    </section>
  )
}
