import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * HoloCard — Monochrome ID card
 *
 * Design language: matches portfolio's dark monochrome aesthetic
 *  - Pure black/white/grey palette
 *  - Sharp corners (no border-radius)
 *  - Thin 1px borders, corner brackets
 *  - Mono typography, tight tracking
 *  - Subtle tilt parallax
 *  - Photo glitch on hover (greyscale channels only)
 *  - Scan line sweep
 */
export default function HoloCard({
  photoUrl,
  name  = 'Tegar Baradika',
  title = 'Full-Stack Developer',
  role  = 'Creative Technologist',
}) {
  const cardRef    = useRef(null)
  const shimmerRef = useRef(null)
  const rafRef     = useRef(null)
  const glitchRaf  = useRef(null)
  const photoRef   = useRef(null)
  const r1Ref      = useRef(null)
  const r2Ref      = useRef(null)
  const scanRef    = useRef(null)

  const [glitching, setGlitching] = useState(false)
  const glitchActive = useRef(false)

  // Tilt state
  const state = useRef({ rx: 0, ry: 0, trx: 0, try: 0 })

  // ── Glitch engine (greyscale only) ──────────────────────────────
  const randomClip = () => {
    const y1 = Math.random() * 80
    const h  = 4 + Math.random() * 20
    return `polygon(0% ${y1}%, 100% ${y1}%, 100% ${Math.min(y1 + h, 100)}%, 0% ${Math.min(y1 + h, 100)}%)`
  }

  const runGlitch = useCallback(() => {
    if (!glitchActive.current) return
    const r1 = r1Ref.current
    const r2 = r2Ref.current
    const s  = scanRef.current
    if (!r1 || !r2) return

    r1.style.transform = `translate(${(Math.random() - 0.5) * 8}px, 0)`
    r1.style.clipPath  = randomClip()
    r1.style.opacity   = (0.35 + Math.random() * 0.45).toString()

    r2.style.transform = `translate(${(Math.random() - 0.5) * -6}px, 0)`
    r2.style.clipPath  = randomClip()
    r2.style.opacity   = (0.25 + Math.random() * 0.35).toString()

    if (s) {
      s.style.top     = `${Math.random() * 100}%`
      s.style.opacity = (0.4 + Math.random() * 0.4).toString()
    }

    glitchRaf.current = setTimeout(runGlitch, 55 + Math.random() * 45)
  }, [])

  const startGlitch = useCallback(() => {
    if (glitchActive.current) return
    glitchActive.current = true
    setGlitching(true)
    runGlitch()
    setTimeout(stopGlitch, 650)
  }, [runGlitch])

  const stopGlitch = useCallback(() => {
    glitchActive.current = false
    setGlitching(false)
    clearTimeout(glitchRaf.current)
    const r1 = r1Ref.current
    const r2 = r2Ref.current
    const s  = scanRef.current
    if (r1) { r1.style.transform = ''; r1.style.clipPath = ''; r1.style.opacity = '0' }
    if (r2) { r2.style.transform = ''; r2.style.clipPath = ''; r2.style.opacity = '0' }
    if (s)  { s.style.opacity = '0' }
  }, [])

  // ── Tilt engine ──────────────────────────────────────────────────
  useEffect(() => {
    const card = cardRef.current
    if (!card) return
    const MAX = 14

    const onMove = (e) => {
      const rect = card.getBoundingClientRect()
      const cx   = rect.left + rect.width  / 2
      const cy   = rect.top  + rect.height / 2
      state.current.trx = -((e.clientY - cy) / (window.innerHeight / 2)) * MAX
      state.current.try =  ((e.clientX - cx) / (window.innerWidth  / 2)) * MAX
    }
    const onLeave = () => { state.current.trx = 0; state.current.try = 0 }

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick)
      const s  = state.current
      s.rx += (s.trx - s.rx) * 0.07
      s.ry += (s.try - s.ry) * 0.07
      if (!card) return
      card.style.transform = `perspective(800px) rotateX(${s.rx}deg) rotateY(${s.ry}deg)`

      // Subtle shimmer follows tilt
      if (shimmerRef.current) {
        const sx = 50 + s.ry * 2
        const sy = 50 - s.rx * 2
        shimmerRef.current.style.background =
          `radial-gradient(ellipse 70% 50% at ${sx}% ${sy}%, rgba(255,255,255,0.04) 0%, transparent 100%)`
      }
    }

    window.addEventListener('mousemove',  onMove)
    window.addEventListener('mouseleave', onLeave)
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove',  onMove)
      window.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(rafRef.current)
      clearTimeout(glitchRaf.current)
    }
  }, [])

  return (
    <div
      className="hidden lg:block"
      style={{
        position: 'absolute',
        top: '18%',
        right: '7vw',
        zIndex: 15,
        width: 220,
        perspective: 800,
        pointerEvents: 'none',
      }}
    >
      {/* Card */}
      <div
        ref={cardRef}
        style={{
          width: 220,
          background: '#0a0a0a',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03) inset',
          position: 'relative',
          overflow: 'hidden',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* Shimmer layer */}
        <div ref={shimmerRef} style={{
          position: 'absolute', inset: 0, zIndex: 3,
          pointerEvents: 'none', mixBlendMode: 'screen',
          transition: 'background 0.06s',
        }} />

        {/* Scanlines texture */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)',
        }} />

        {/* Content */}
        <div style={{ padding: '18px 16px 16px', position: 'relative', zIndex: 5 }}>

          {/* Header row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 14,
          }}>
            <span style={{
              fontFamily: 'monospace', fontSize: 7,
              letterSpacing: '0.3em', color: 'rgba(255,255,255,0.2)',
              textTransform: 'uppercase',
            }}>
              ID / PORTFOLIO
            </span>
            <span style={{
              fontFamily: 'monospace', fontSize: 7,
              letterSpacing: '0.2em', color: 'rgba(255,255,255,0.12)',
              textTransform: 'uppercase',
            }}>
              V3
            </span>
          </div>

          {/* ── Photo ── */}
          <div
            style={{
              width: '100%',
              aspectRatio: '3 / 4',
              overflow: 'hidden',
              background: '#111',
              border: '1px solid rgba(255,255,255,0.06)',
              marginBottom: 14,
              position: 'relative',
              pointerEvents: 'auto',
            }}
            onMouseEnter={startGlitch}
          >
            {photoUrl ? (
              <>
                {/* Base */}
                <img
                  ref={photoRef}
                  src={photoUrl}
                  alt={name}
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: 'center 10%',
                    display: 'block',
                    filter: 'grayscale(100%)',
                  }}
                />

                {/* Glitch layer 1 — lighter */}
                <img
                  ref={r1Ref}
                  src={photoUrl}
                  alt="" aria-hidden="true"
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: 'center 10%',
                    filter: 'grayscale(100%) brightness(1.6) contrast(1.2)',
                    mixBlendMode: 'screen',
                    opacity: 0, pointerEvents: 'none',
                  }}
                />

                {/* Glitch layer 2 — darker offset */}
                <img
                  ref={r2Ref}
                  src={photoUrl}
                  alt="" aria-hidden="true"
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: 'center 10%',
                    filter: 'grayscale(100%) brightness(0.4) contrast(1.4)',
                    mixBlendMode: 'multiply',
                    opacity: 0, pointerEvents: 'none',
                  }}
                />

                {/* Scan line */}
                <div ref={scanRef} style={{
                  position: 'absolute', left: 0, right: 0,
                  top: '50%', height: 2,
                  background: 'rgba(255,255,255,0.5)',
                  opacity: 0, pointerEvents: 'none',
                  boxShadow: '0 0 6px rgba(255,255,255,0.4)',
                }} />

                {/* Noise overlay during glitch */}
                {glitching && (
                  <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: '64px 64px',
                    opacity: 0.06, mixBlendMode: 'overlay',
                  }} />
                )}

                {/* Vignette */}
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'radial-gradient(ellipse at 50% 60%, transparent 40%, rgba(0,0,0,0.5) 100%)',
                }} />
              </>
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.1)', letterSpacing: '0.2em' }}>
                  NO PHOTO
                </span>
              </div>
            )}
          </div>

          {/* Name */}
          <div style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 15, letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.92)',
            textTransform: 'uppercase',
            marginBottom: 5,
          }}>
            {name}
          </div>

          {/* Title */}
          <div style={{
            fontFamily: 'monospace', fontSize: 8,
            letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase', marginBottom: 14,
          }}>
            {title}
          </div>

          {/* Divider */}
          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)',
            marginBottom: 12,
          }} />

          {/* Barcode */}
          <div style={{ display: 'flex', gap: 1.5, marginBottom: 8 }}>
            {Array.from({ length: 32 }, (_, i) => (
              <div key={i} style={{
                width: i % 4 === 0 ? 2.5 : 1.5,
                height: 6 + Math.abs(Math.sin(i * 1.7)) * 7,
                background: 'rgba(255,255,255,0.15)',
              }} />
            ))}
          </div>

          {/* Serial + role row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{
              fontFamily: 'monospace', fontSize: 6.5,
              letterSpacing: '0.15em', color: 'rgba(255,255,255,0.15)',
            }}>
              TB-2024-001
            </span>
            <span style={{
              fontFamily: 'monospace', fontSize: 6.5,
              letterSpacing: '0.15em', color: 'rgba(255,255,255,0.15)',
              textTransform: 'uppercase',
            }}>
              {role}
            </span>
          </div>
        </div>

        {/* Corner brackets */}
        {[
          { top: 6,    left: 6,   bT: true,  bL: true  },
          { top: 6,    right: 6,  bT: true,  bR: true  },
          { bottom: 6, left: 6,   bB: true,  bL: true  },
          { bottom: 6, right: 6,  bB: true,  bR: true  },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute', width: 10, height: 10,
            top: c.top, bottom: c.bottom, left: c.left, right: c.right,
            borderTop:    c.bT ? '1px solid rgba(255,255,255,0.2)' : 'none',
            borderBottom: c.bB ? '1px solid rgba(255,255,255,0.2)' : 'none',
            borderLeft:   c.bL ? '1px solid rgba(255,255,255,0.2)' : 'none',
            borderRight:  c.bR ? '1px solid rgba(255,255,255,0.2)' : 'none',
            zIndex: 6,
          }} />
        ))}
      </div>

      {/* Status row below card */}
      <div style={{
        marginTop: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2px',
      }}>
        {/* Available indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ position: 'relative', display: 'inline-flex', width: 6, height: 6 }}>
            <span style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(255,255,255,0.3)',
              animation: 'hc-pulse 2s ease-out infinite',
            }} />
            <span style={{
              position: 'relative', display: 'block',
              width: 6, height: 6, borderRadius: '50%',
              background: 'rgba(255,255,255,0.7)',
            }} />
          </span>
          <span style={{
            fontFamily: 'monospace', fontSize: 7,
            letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase',
          }}>
            Available
          </span>
        </div>

        {/* Year */}
        <span style={{
          fontFamily: 'monospace', fontSize: 7,
          letterSpacing: '0.2em', color: 'rgba(255,255,255,0.15)',
        }}>
          {new Date().getFullYear()}
        </span>
      </div>

      <style>{`
        @keyframes hc-pulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          70%  { transform: scale(2.8); opacity: 0;   }
          100% { transform: scale(2.8); opacity: 0;   }
        }
      `}</style>
    </div>
  )
}
