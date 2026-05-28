import { useEffect, useRef } from 'react'

/**
 * HeroCanvas — Elegant particle constellation system
 *
 * Features:
 *  - 160 particles with organic drift (Perlin-like sine noise)
 *  - Connection lines between nearby particles (constellation effect)
 *  - Mouse repulsion field with smooth falloff
 *  - Mouse velocity streak — fast movement creates bright trails
 *  - Scroll inertia — scroll pushes particles upward
 *  - Particles have varied size, opacity, and drift speed
 *  - Monochromatic palette: white/silver on dark — clean & premium
 */
export default function HeroCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width  = W
    canvas.height = H

    // ── Mouse state ──────────────────────────────────────────────────
    const mouse = { x: W / 2, y: H / 2, vx: 0, vy: 0, px: W / 2, py: H / 2 }
    const onMouseMove = (e) => {
      mouse.vx = e.clientX - mouse.px
      mouse.vy = e.clientY - mouse.py
      mouse.px = mouse.x
      mouse.py = mouse.y
      mouse.x  = e.clientX
      mouse.y  = e.clientY
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── Scroll state ─────────────────────────────────────────────────
    let scrollVY   = 0
    let lastScroll = window.scrollY
    const onScroll = () => {
      const dy = window.scrollY - lastScroll
      lastScroll = window.scrollY
      scrollVY  -= dy * 0.04   // scroll down → particles drift up
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // ── Particles ────────────────────────────────────────────────────
    const COUNT = 160
    const CONNECT_DIST = 130   // max distance to draw connection line
    const REPEL_RADIUS = 110   // mouse repulsion radius
    const REPEL_FORCE  = 0.38  // repulsion strength

    const particles = Array.from({ length: COUNT }, (_, i) => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      vx:    (Math.random() - 0.5) * 0.18,
      vy:    (Math.random() - 0.5) * 0.18,
      ox:    0,   // offset x from noise
      oy:    0,   // offset y from noise
      size:  0.6 + Math.random() * 1.6,
      alpha: 0.15 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
      speed: 0.18 + Math.random() * 0.32,
      freq:  0.0004 + Math.random() * 0.0006,
    }))

    // ── Resize ───────────────────────────────────────────────────────
    const onResize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width  = W
      canvas.height = H
    }
    window.addEventListener('resize', onResize)

    // ── Draw connection line ─────────────────────────────────────────
    const drawConnection = (ax, ay, bx, by, dist) => {
      const alpha = (1 - dist / CONNECT_DIST) * 0.12
      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.lineTo(bx, by)
      ctx.strokeStyle = `rgba(200,210,230,${alpha})`
      ctx.lineWidth   = 0.5
      ctx.stroke()
    }

    // ── Main loop ────────────────────────────────────────────────────
    let raf
    let t = 0

    const loop = () => {
      raf = requestAnimationFrame(loop)
      t++

      ctx.clearRect(0, 0, W, H)

      // Decay mouse velocity
      mouse.vx *= 0.82
      mouse.vy *= 0.82

      // Decay scroll velocity
      scrollVY *= 0.92

      const mouseSpeed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy)

      // ── Update particles ──
      for (let i = 0; i < COUNT; i++) {
        const p = particles[i]

        // Organic drift via sine noise
        p.ox = Math.sin(t * p.freq * 1.1 + p.phase)        * 0.22 * p.speed
        p.oy = Math.cos(t * p.freq * 0.9 + p.phase + 1.57) * 0.22 * p.speed

        // Apply scroll inertia
        p.vy += scrollVY * 0.012

        // Mouse repulsion
        const dx   = p.x - mouse.x
        const dy   = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < REPEL_RADIUS && dist > 0.1) {
          const force  = (1 - dist / REPEL_RADIUS) * REPEL_FORCE
          const angle  = Math.atan2(dy, dx)
          p.vx += Math.cos(angle) * force
          p.vy += Math.sin(angle) * force
        }

        // Velocity damping
        p.vx *= 0.96
        p.vy *= 0.96

        // Move
        p.x += p.vx + p.ox
        p.y += p.vy + p.oy

        // Wrap edges with soft margin
        const M = 40
        if (p.x < -M) p.x = W + M
        if (p.x > W + M) p.x = -M
        if (p.y < -M) p.y = H + M
        if (p.y > H + M) p.y = -M
      }

      // ── Draw connections ──
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const a  = particles[i]
          const b  = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < CONNECT_DIST) drawConnection(a.x, a.y, b.x, b.y, d)
        }
      }

      // ── Draw mouse proximity glow on connections ──
      // Connections near mouse get brighter
      if (mouseSpeed > 0.5) {
        for (let i = 0; i < COUNT; i++) {
          const a  = particles[i]
          const dx = a.x - mouse.x
          const dy = a.y - mouse.y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < REPEL_RADIUS * 1.4) {
            const glow = (1 - d / (REPEL_RADIUS * 1.4)) * mouseSpeed * 0.012
            ctx.beginPath()
            ctx.arc(a.x, a.y, a.size + 1.5, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(180,210,255,${glow})`
            ctx.fill()
          }
        }
      }

      // ── Draw particles ──
      for (let i = 0; i < COUNT; i++) {
        const p = particles[i]

        // Proximity to mouse boosts brightness
        const dx   = p.x - mouse.x
        const dy   = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const boost = dist < REPEL_RADIUS
          ? (1 - dist / REPEL_RADIUS) * 0.5
          : 0

        const alpha = Math.min(1, p.alpha + boost)

        // Outer soft glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
        grad.addColorStop(0, `rgba(220,230,255,${alpha * 0.9})`)
        grad.addColorStop(1, `rgba(220,230,255,0)`)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(240,245,255,${alpha})`
        ctx.fill()
      }

      // ── Mouse cursor glow ──
      const cursorGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 80)
      cursorGrad.addColorStop(0, `rgba(160,200,255,${0.04 + mouseSpeed * 0.004})`)
      cursorGrad.addColorStop(1, 'rgba(160,200,255,0)')
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI * 2)
      ctx.fillStyle = cursorGrad
      ctx.fill()
    }

    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll',    onScroll)
      window.removeEventListener('resize',    onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        display: 'block',
      }}
    />
  )
}
