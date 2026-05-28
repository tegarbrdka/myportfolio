import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/* ─────────────────────────────────────────────────────────────
   Preloader — Premium v2
   Layers:
    1. Animated dot-grid background
    2. Scanning line sweep
    3. Monogram with pulse ring
    4. Name with glitch reveal
    5. Title fade
    6. Progress counter + shimmer bar
    7. Corner brackets
    8. Exit: blur + scale → curtain panels
   ───────────────────────────────────────────────────────────── */

const GLITCH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&'
const NAME = 'Tegar Baradika'

function useGlitchText(targetText, startDelay = 600, duration = 900) {
  const [display, setDisplay] = useState(() => targetText.split('').map(() => ' '))
  const rafRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const chars = targetText.split('')
      const resolved = new Array(chars.length).fill(false)
      const startTime = performance.now()

      const tick = (now) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        const resolveUpTo = Math.floor(progress * chars.length)

        setDisplay(chars.map((ch, i) => {
          if (ch === ' ') return ' '
          if (i < resolveUpTo) {
            resolved[i] = true
            return ch
          }
          if (resolved[i]) return ch
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        }))

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          setDisplay(chars)
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }, startDelay)

    return () => {
      clearTimeout(timer)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [targetText, startDelay, duration])

  return display
}

export default function Preloader({ onComplete }) {
  const rootRef     = useRef(null)
  const panelsRef   = useRef(null)
  const logoRef     = useRef(null)
  const pulseRef    = useRef(null)
  const nameRef     = useRef(null)
  const titleRef    = useRef(null)
  const numRef      = useRef(null)
  const barRef      = useRef(null)
  const barFillRef  = useRef(null)
  const barGlowRef  = useRef(null)
  const scanRef     = useRef(null)
  const gridRef     = useRef(null)
  const cornersRef  = useRef([])
  const statusRef   = useRef(null)

  const [num, setNum] = useState(0)
  const glitchChars = useGlitchText(NAME, 500, 1000)

  useEffect(() => {
    const tl = gsap.timeline()
    const obj = { v: 0 }

    // ── Initial states ──────────────────────────────────────────────
    gsap.set(
      [logoRef.current, nameRef.current, titleRef.current,
       numRef.current, barRef.current, gridRef.current],
      { opacity: 0 }
    )
    gsap.set(cornersRef.current, { opacity: 0, scale: 0.5 })
    gsap.set(scanRef.current, { top: '-2px', opacity: 0 })
    gsap.set(pulseRef.current, { scale: 0.8, opacity: 0 })

    // ── 1. Grid fade in ─────────────────────────────────────────────
    tl.to(gridRef.current, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0)

    // ── 2. Corners pop in ───────────────────────────────────────────
    tl.to(cornersRef.current, {
      opacity: 1, scale: 1,
      duration: 0.5, stagger: 0.07, ease: 'back.out(2)',
    }, 0.1)

    // ── 3. Scan line sweep ──────────────────────────────────────────
    tl.to(scanRef.current, { opacity: 1, duration: 0.1 }, 0.2)
    tl.to(scanRef.current, { top: '100%', duration: 1.0, ease: 'power2.inOut' }, 0.2)
    tl.to(scanRef.current, { opacity: 0, duration: 0.15 }, 1.1)

    // ── 4. Logo + pulse ring ────────────────────────────────────────
    tl.fromTo(logoRef.current,
      { scale: 0.7, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.8)' },
      0.35
    )
    tl.to(pulseRef.current,
      { scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out' },
      0.5
    )
    // Continuous pulse
    gsap.to(pulseRef.current, {
      scale: 1.6, opacity: 0,
      duration: 1.4, ease: 'power2.out',
      repeat: -1, delay: 0.8,
    })

    // ── 5. Name (glitch handled by hook, just fade wrapper) ─────────
    tl.fromTo(nameRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: 'power2.out' },
      0.5
    )

    // ── 6. Title ────────────────────────────────────────────────────
    tl.fromTo(titleRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      0.8
    )

    // ── 7. Counter + bar ────────────────────────────────────────────
    tl.to([numRef.current, barRef.current], { opacity: 1, duration: 0.3 }, 0.7)

    tl.to(obj, {
      v: 100,
      duration: 2.0,
      ease: 'power1.inOut',
      onUpdate() {
        const v = Math.floor(obj.v)
        setNum(v)
        if (barFillRef.current) {
          barFillRef.current.style.transform = `scaleX(${v / 100})`
        }
        if (barGlowRef.current) {
          barGlowRef.current.style.left = `${v}%`
        }
        if (statusRef.current) {
          statusRef.current.textContent =
            v < 25 ? 'Initializing systems...' :
            v < 50 ? 'Loading assets...' :
            v < 75 ? 'Preparing experience...' :
            v < 95 ? 'Almost ready...' : 'Ready'
        }
      },
    }, 0.8)

    // ── 8. Hold ─────────────────────────────────────────────────────
    tl.to({}, { duration: 0.35 })

    // ── 9. Exit: content fades out with blur ────────────────────────
    tl.to(
      [logoRef.current, pulseRef.current, nameRef.current,
       titleRef.current, numRef.current, barRef.current],
      {
        opacity: 0, y: -20, filter: 'blur(8px)',
        duration: 0.5, stagger: 0.03, ease: 'power3.in',
      }
    )
    tl.to(cornersRef.current,
      { opacity: 0, scale: 0.4, duration: 0.3, stagger: 0.04, ease: 'power2.in' },
      '-=0.4'
    )
    tl.to(gridRef.current, { opacity: 0, duration: 0.4 }, '-=0.3')

    // ── 10. Exit: curtain panels slide up ───────────────────────────
    tl.to(
      Array.from(panelsRef.current?.children || []),
      {
        yPercent: -100,
        duration: 1.0,
        stagger: { each: 0.055, from: 'start' },
        ease: 'power4.inOut',
      },
      '-=0.15'
    )

    tl.to(rootRef.current, {
      opacity: 0, duration: 0.1,
      onComplete: () => {
        if (rootRef.current) rootRef.current.style.display = 'none'
        onComplete?.()
      },
    }, '-=0.1')

    return () => tl.kill()
  }, [])

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[9999] overflow-hidden"
      style={{ background: '#080808' }}
    >
      {/* ── Animated dot grid ── */}
      <div
        ref={gridRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          animation: 'gridDrift 8s linear infinite',
        }}
      />

      {/* ── Radial vignette over grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, #080808 100%)',
        }}
      />

      {/* ── Scan line ── */}
      <div
        ref={scanRef}
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          height: 2,
          background: 'linear-gradient(90deg, transparent 0%, rgba(180,200,255,0.4) 20%, rgba(180,200,255,0.95) 50%, rgba(180,200,255,0.4) 80%, transparent 100%)',
          boxShadow: '0 0 20px rgba(180,200,255,0.5), 0 0 60px rgba(180,200,255,0.15)',
          zIndex: 2,
        }}
      />

      {/* ── Panels for exit animation ── */}
      <div ref={panelsRef} className="absolute inset-0 flex" style={{ zIndex: 1 }}>
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="flex-1"
            style={{
              background: i % 2 === 0 ? '#080808' : '#090909',
            }}
          />
        ))}
      </div>

      {/* ── Corner brackets ── */}
      {[
        { top: 28, left: 28,    borderTop: true,    borderLeft: true   },
        { top: 28, right: 28,   borderTop: true,    borderRight: true  },
        { bottom: 28, left: 28,  borderBottom: true, borderLeft: true   },
        { bottom: 28, right: 28, borderBottom: true, borderRight: true  },
      ].map((c, i) => (
        <div
          key={i}
          ref={el => cornersRef.current[i] = el}
          style={{
            position: 'absolute',
            width: 24, height: 24,
            top: c.top, bottom: c.bottom,
            left: c.left, right: c.right,
            borderTop:    c.borderTop    ? '1px solid rgba(180,200,255,0.25)' : 'none',
            borderBottom: c.borderBottom ? '1px solid rgba(180,200,255,0.25)' : 'none',
            borderLeft:   c.borderLeft   ? '1px solid rgba(180,200,255,0.25)' : 'none',
            borderRight:  c.borderRight  ? '1px solid rgba(180,200,255,0.25)' : 'none',
            zIndex: 10,
          }}
        />
      ))}

      {/* ── Corner labels ── */}
      <div className="absolute top-7 left-16 font-mono text-[8px] text-white/10 uppercase tracking-[0.25em]" style={{ zIndex: 10 }}>
        TB.PORTFOLIO.V3
      </div>
      <div className="absolute bottom-7 right-16 font-mono text-[8px] text-white/10 uppercase tracking-[0.25em]" style={{ zIndex: 10 }}>
        {new Date().getFullYear()} — CREATIVE TECH
      </div>

      {/* ── Center content ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-8">

        {/* Monogram + pulse ring */}
        <div className="relative flex items-center justify-center">
          {/* Pulse ring */}
          <div
            ref={pulseRef}
            className="absolute rounded-full border border-white/20"
            style={{ width: 96, height: 96 }}
          />
          {/* Box */}
          <div
            ref={logoRef}
            className="relative w-20 h-20 border border-white/10 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <span
              className="text-5xl text-white font-light select-none"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              T
            </span>
            {/* Corner accents */}
            <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/40" />
            <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/40" />
            <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/40" />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/40" />
          </div>
        </div>

        {/* Name — glitch reveal */}
        <div className="flex flex-col items-center gap-2">
          <div
            ref={nameRef}
            className="text-white uppercase select-none"
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 'clamp(26px, 4vw, 50px)',
              letterSpacing: '0.35em',
            }}
          >
            {glitchChars.map((ch, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  color: ch === NAME[i] ? 'rgba(255,255,255,0.95)' : 'rgba(180,200,255,0.5)',
                  transition: 'color 0.05s',
                  minWidth: ch === ' ' ? '0.35em' : undefined,
                }}
              >
                {ch}
              </span>
            ))}
          </div>
          <div
            ref={titleRef}
            className="font-mono text-[9px] text-white/25 uppercase tracking-[0.5em]"
          >
            Full-Stack Developer · Creative Technologist
          </div>
        </div>

        {/* Progress */}
        <div className="flex flex-col items-center gap-3 w-72">
          {/* Counter */}
          <div
            ref={numRef}
            className="font-light text-white tabular-nums leading-none"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(52px, 7vw, 80px)',
              fontWeight: 300,
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.9)' }}>
              {String(num).padStart(2, '\u2007')}
            </span>
            <span style={{ fontSize: '0.4em', color: 'rgba(255,255,255,0.2)', marginLeft: '0.1em' }}>
              %
            </span>
          </div>

          {/* Bar */}
          <div ref={barRef} className="w-full relative flex flex-col gap-2">
            {/* Track */}
            <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            {/* Fill */}
            <div
              ref={barFillRef}
              className="absolute top-0 left-0 right-0 h-px origin-left"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(180,200,255,0.4) 20%, rgba(255,255,255,0.9) 60%, rgba(180,200,255,0.6) 90%, transparent)',
                transform: 'scaleX(0)',
                boxShadow: '0 0 8px rgba(180,200,255,0.4)',
              }}
            />
            {/* Glow dot */}
            <div
              ref={barGlowRef}
              className="absolute -top-1 w-2 h-2 rounded-full"
              style={{
                left: '0%',
                transform: 'translateX(-50%)',
                background: 'rgba(255,255,255,0.9)',
                boxShadow: '0 0 8px rgba(180,200,255,0.8), 0 0 20px rgba(180,200,255,0.3)',
                transition: 'left 0.05s linear',
              }}
            />

            {/* Status */}
            <div
              ref={statusRef}
              className="font-mono text-[8px] text-white/15 uppercase tracking-[0.4em] text-center mt-1"
            >
              Initializing systems...
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid drift keyframe ── */}
      <style>{`
        @keyframes gridDrift {
          0%   { background-position: 0px 0px; }
          100% { background-position: 40px 40px; }
        }
      `}</style>
    </div>
  )
}
