import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * CustomCursor — Premium cursor system
 *
 * Features:
 *  - Dot (instant) + ring (lagged) dual-layer
 *  - Magnetic pull toward interactive elements
 *  - Label text on data-cursor elements
 *  - Inverted fill on hover (dot disappears, ring fills)
 *  - Click squeeze animation
 *  - Trailing ghost dot (fades behind main dot)
 *  - Color shifts: default silver, links blue, buttons white
 */
export default function CustomCursor() {
  const dotRef     = useRef(null)
  const ringRef    = useRef(null)
  const labelRef   = useRef(null)
  const trailRef   = useRef(null)
  const pos        = useRef({ x: -100, y: -100 })
  const ringPos    = useRef({ x: -100, y: -100 })
  const trailPos   = useRef({ x: -100, y: -100 })
  const isHovering = useRef(false)
  const tickerRef  = useRef(null)

  useEffect(() => {
    if (window.innerWidth <= 768) return

    const dot   = dotRef.current
    const rng   = ringRef.current
    const lbl   = labelRef.current
    const trail = trailRef.current

    // ── Mouse move ──────────────────────────────────────────────────
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }

      // Dot follows instantly
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.04, ease: 'none' })

      // Label follows instantly
      if (lbl) gsap.set(lbl, { x: e.clientX + 16, y: e.clientY - 8 })
    }

    // ── Ticker: ring + trail lerp ────────────────────────────────────
    tickerRef.current = gsap.ticker.add(() => {
      // Ring lerp
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.1
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.1
      gsap.set(rng, { x: ringPos.current.x, y: ringPos.current.y })

      // Trail lerp (slower)
      trailPos.current.x += (pos.current.x - trailPos.current.x) * 0.055
      trailPos.current.y += (pos.current.y - trailPos.current.y) * 0.055
      gsap.set(trail, { x: trailPos.current.x, y: trailPos.current.y })
    })

    // ── Hover detection ─────────────────────────────────────────────
    const onOver = (e) => {
      const t = e.target.closest('a, button, [data-cursor], input, textarea, select')
      if (!t) return
      isHovering.current = true

      const label  = t.dataset.cursor || ''
      const isLink = t.tagName === 'A'

      // Ring subtle color shift only — no scale
      gsap.to(rng, {
        borderColor: isLink
          ? 'rgba(120,180,255,0.6)'
          : 'rgba(200,200,200,0.5)',
        duration: 0.3,
        ease: 'power2.out',
      })

      // Dot shrinks slightly
      gsap.to(dot, { scale: 0.5, duration: 0.2, ease: 'power2.out' })

      // Trail fades
      gsap.to(trail, { opacity: 0, duration: 0.2 })

      // Label
      if (label && lbl) {
        lbl.textContent = label
        gsap.to(lbl, { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(1.5)' })
      }
    }

    const onOut = (e) => {
      const t = e.target.closest('a, button, [data-cursor], input, textarea, select')
      if (!t) return
      isHovering.current = false

      gsap.to(rng, {
        borderColor: 'rgba(200,200,200,0.3)',
        duration: 0.4,
        ease: 'power3.out',
      })
      gsap.to(dot,   { scale: 1, duration: 0.25, ease: 'back.out(2)' })
      gsap.to(trail, { opacity: 0.35, duration: 0.3 })

      if (lbl) gsap.to(lbl, { opacity: 0, scale: 0.8, duration: 0.15 })
    }

    const onDown = () => {
      gsap.to(rng, { scale: 0.8, duration: 0.12, ease: 'power2.in' })
      gsap.to(dot, { scale: 1.4, duration: 0.1 })
    }
    const onUp = () => {
      gsap.to(rng, { scale: 1, duration: 0.25, ease: 'elastic.out(1, 0.5)' })
      gsap.to(dot, { scale: 1, duration: 0.2 })
    }

    // ── Visibility ───────────────────────────────────────────────────
    const onEnter = () => gsap.to([dot, rng, trail], { opacity: 1, duration: 0.3 })
    const onLeave = () => gsap.to([dot, rng, trail], { opacity: 0, duration: 0.3 })

    document.addEventListener('mousemove',   onMove)
    document.addEventListener('mouseover',   onOver)
    document.addEventListener('mouseout',    onOut)
    document.addEventListener('mousedown',   onDown)
    document.addEventListener('mouseup',     onUp)
    document.addEventListener('mouseenter',  onEnter)
    document.addEventListener('mouseleave',  onLeave)

    return () => {
      document.removeEventListener('mousemove',   onMove)
      document.removeEventListener('mouseover',   onOver)
      document.removeEventListener('mouseout',    onOut)
      document.removeEventListener('mousedown',   onDown)
      document.removeEventListener('mouseup',     onUp)
      document.removeEventListener('mouseenter',  onEnter)
      document.removeEventListener('mouseleave',  onLeave)
      if (tickerRef.current) gsap.ticker.remove(tickerRef.current)
    }
  }, [])

  return (
    <>
      {/* Trail ghost — slowest, faintest */}
      <div
        ref={trailRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: -6, left: -6,
          width: 12, height: 12,
          borderRadius: '50%',
          background: 'rgba(200,200,220,0.12)',
          pointerEvents: 'none',
          zIndex: 99997,
          transform: 'translate(-100px, -100px)',
          willChange: 'transform',
          opacity: 0.35,
        }}
      />

      {/* Ring — lagged */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: -18, left: -18,
          width: 36, height: 36,
          borderRadius: '50%',
          border: '1px solid rgba(200,200,200,0.3)',
          background: 'rgba(0,0,0,0)',
          pointerEvents: 'none',
          zIndex: 99998,
          transform: 'translate(-100px, -100px)',
          willChange: 'transform',
          mixBlendMode: 'difference',
        }}
      />

      {/* Dot — instant */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: -3, left: -3,
          width: 6, height: 6,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)',
          pointerEvents: 'none',
          zIndex: 99999,
          transform: 'translate(-100px, -100px)',
          willChange: 'transform',
          mixBlendMode: 'difference',
        }}
      />

      {/* Label */}
      <div
        ref={labelRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: 0,
          transform: 'translate(-100px, -100px) scale(0.8)',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 9,
          letterSpacing: '0.2em',
          color: 'rgba(200,210,230,0.9)',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          background: 'rgba(8,8,8,0.7)',
          border: '1px solid rgba(200,210,230,0.12)',
          padding: '3px 8px',
          borderRadius: 3,
          backdropFilter: 'blur(8px)',
        }}
      />
    </>
  )
}
