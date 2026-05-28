import { useEffect, useRef } from 'react'

/**
 * LanyardCard — Advanced physics lanyard
 *
 * Physics features:
 *  1. Damped oscillation on load (starts at ~15° angle, decays to rest)
 *  2. Rope responds faster than card (inertia lag — rope bends at card junction)
 *  3. Scroll-driven inertia (scroll down → card swings back, scroll up → forward)
 *  4. Card twist/flex at high angular velocity (material flex micro-detail)
 *  5. Drag with velocity transfer on release
 */

const CW       = 200
const CH       = 280
const SEG      = 18
const ROPE_LEN = 300   // tali lebih panjang = card lebih turun

export default function LanyardCard({
  photoUrl,
  name  = 'Tegar Baradika',
  title = 'Full-Stack Developer',
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // ── Photo ──────────────────────────────────────────────────────────
    let photoImg = null
    if (photoUrl) {
      const img = new Image()
      img.onload = () => { photoImg = img }
      img.src = photoUrl
    }

    // ── Anchor ─────────────────────────────────────────────────────────
    // Center-top of viewport so card can swing freely left AND right
    const AX = () => window.innerWidth * 0.72
    const AY = 30   // sedikit turun dari top agar anchor tidak terpotong

    // ── Rope Verlet ────────────────────────────────────────────────────
    const segLen = ROPE_LEN / SEG
    let rope = null
    const initRope = (ax) => {
      rope = Array.from({ length: SEG + 1 }, (_, i) => ({
        x: ax, y: AY + i * segLen,
        ox: ax, oy: AY + i * segLen,
      }))
    }

    // ── Pendulum state ─────────────────────────────────────────────────
    // angle = pendulum angle from vertical (radians)
    let angle    = 0.28   // ① Start at ~16° — not vertical
    let angleVel = 0
    const G_PX   = 320    // gravity constant — lebih rendah = ayunan lebih lambat & natural
    const DAMP   = 0.004  // damping coefficient — lebih kecil = ayunan lebih lama

    // ② Card inertia — card lags behind rope
    let cardAngle    = 0.28   // card starts at same angle
    let cardAngleVel = 0
    const CARD_STIFFNESS = 3.5   // lebih rendah = lag card lebih terasa, tidak snap
    const CARD_DAMP      = 2.8   // card angular damping

    // ④ Card twist (material flex)
    let cardTwist    = 0
    let cardTwistVel = 0

    // ③ Scroll inertia
    let scrollVel    = 0   // accumulated scroll velocity
    let lastScrollY  = window.scrollY
    let scrollImpact = 0   // current scroll-driven angle impulse

    // Drop state
    let phase   = 'waiting'
    let dropY   = -CH - 60
    let dropVY  = 0
    let elapsed = 0
    let lastT   = performance.now()

    // Drag
    let dragging = false
    let dox = 0, prevMX = 0, dragVX = 0
    let cardX = 0, cardY = 0

    // Hero visibility
    let heroVisible = true
    const heroEl = document.getElementById('hero')
    const io = heroEl ? new IntersectionObserver(
      ([e]) => { heroVisible = e.isIntersecting },
      { threshold: 0.05 }
    ) : null
    if (io && heroEl) io.observe(heroEl)

    // ── ③ Scroll listener ──────────────────────────────────────────────
    const onScroll = () => {
      const dy = window.scrollY - lastScrollY
      lastScrollY = window.scrollY
      // Scroll down → positive dy → card swings "back" (negative angle impulse)
      // Scroll up   → negative dy → card swings "forward" (positive)
      scrollVel += dy * 0.0008
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // ── Rope Verlet update ─────────────────────────────────────────────
    const updateRope = () => {
      const ax = AX()
      rope[0].x = ax;              rope[0].y = AY
      rope[SEG].x = cardX + CW/2; rope[SEG].y = cardY

      for (let i = 1; i < SEG; i++) {
        const p  = rope[i]
        const vx = (p.x - p.ox) * 0.986
        const vy = (p.y - p.oy) * 0.986
        p.ox = p.x; p.oy = p.y
        p.x += vx; p.y += vy + 0.11
      }

      for (let iter = 0; iter < 10; iter++) {
        rope[0].x = ax; rope[0].y = AY
        for (let i = 0; i < SEG; i++) {
          const a = rope[i], b = rope[i+1]
          const dx = b.x - a.x, dy = b.y - a.y
          const d  = Math.sqrt(dx*dx + dy*dy) || 0.001
          const f  = (d - segLen) / d * 0.5
          if (i > 0)       { a.x += dx*f*0.5; a.y += dy*f*0.5 }
          if (i < SEG - 1) { b.x -= dx*f*0.5; b.y -= dy*f*0.5 }
        }
        rope[SEG].x = cardX + CW/2; rope[SEG].y = cardY
      }
    }

    // ── Draw rope ──────────────────────────────────────────────────────
    const drawRope = () => {
      ctx.beginPath()
      ctx.moveTo(rope[0].x + 1, rope[0].y + 2)
      for (let i = 1; i <= SEG; i++) ctx.lineTo(rope[i].x + 1, rope[i].y + 2)
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'
      ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(rope[0].x, rope[0].y)
      for (let i = 1; i <= SEG; i++) ctx.lineTo(rope[i].x, rope[i].y)
      ctx.strokeStyle = 'rgba(210,210,225,0.88)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Anchor
      ctx.beginPath()
      ctx.arc(rope[0].x, rope[0].y, 5, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(170,170,190,0.95)'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(rope[0].x, rope[0].y, 7, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(140,140,160,0.45)'
      ctx.lineWidth = 1; ctx.stroke()
    }

    // ── Draw card ──────────────────────────────────────────────────────
    const drawCard = (x, y, rot, twist) => {
      ctx.save()
      ctx.translate(x + CW/2, y)
      ctx.rotate(rot)

      // ④ Twist: skewX simulates card flex
      ctx.transform(1, 0, twist, 1, 0, 0)

      ctx.translate(-CW/2, 0)

      const r = 12

      // Shadow — offset follows rotation
      ctx.shadowColor   = 'rgba(0,0,0,0.65)'
      ctx.shadowBlur    = 30
      ctx.shadowOffsetX = rot * 10
      ctx.shadowOffsetY = 18

      ctx.beginPath()
      ctx.roundRect(0, 0, CW, CH, r)
      const bg = ctx.createLinearGradient(0, 0, 0, CH)
      bg.addColorStop(0, '#1e1e2c')
      bg.addColorStop(1, '#0d0d16')
      ctx.fillStyle = bg
      ctx.fill()

      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0

      // Border
      ctx.strokeStyle = 'rgba(200,200,220,0.18)'
      ctx.lineWidth   = 1
      ctx.beginPath()
      ctx.roundRect(0, 0, CW, CH, r)
      ctx.stroke()

      // Specular highlight shifts with rotation
      const specX = CW/2 + rot * CW * 0.9
      const spec  = ctx.createRadialGradient(specX, 15, 0, specX, 15, 90)
      spec.addColorStop(0, 'rgba(255,255,255,0.09)')
      spec.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = spec
      ctx.beginPath()
      ctx.roundRect(0, 0, CW, CH, r)
      ctx.fill()

      // Clip hole
      ctx.fillStyle = '#08080c'
      ctx.beginPath()
      ctx.roundRect(CW/2 - 12, -1, 24, 12, [0, 0, 5, 5])
      ctx.fill()
      ctx.strokeStyle = 'rgba(200,200,220,0.18)'
      ctx.lineWidth = 1; ctx.stroke()

      // Metal ring
      ctx.strokeStyle = 'rgba(180,180,200,0.7)'
      ctx.lineWidth   = 2
      ctx.beginPath()
      ctx.arc(CW/2, 10, 5, 0, Math.PI * 2)
      ctx.stroke()

      // Photo area
      const px = 24, py = 32, pw = CW - 48, ph = 148
      ctx.fillStyle = '#0e0e18'
      ctx.beginPath()
      ctx.roundRect(px, py, pw, ph, 7)
      ctx.fill()
      ctx.strokeStyle = 'rgba(200,200,220,0.08)'
      ctx.lineWidth = 1; ctx.stroke()

      if (photoImg) {
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(px, py, pw, ph, 7)
        ctx.clip()
        const ar  = photoImg.width / photoImg.height
        const tar = pw / ph
        let sx = 0, sy = 0, sw = photoImg.width, sh = photoImg.height
        if (ar > tar) { sw = sh * tar; sx = (photoImg.width - sw) / 2 }
        else          { sh = sw / tar }
        ctx.drawImage(photoImg, sx, sy, sw, sh, px, py, pw, ph)
        ctx.restore()
      } else {
        ctx.fillStyle = 'rgba(200,200,220,0.06)'
        ctx.beginPath()
        ctx.arc(CW/2, py + 40, 22, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(CW/2, py + ph - 14, 32, 18, 0, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.fillStyle   = '#ffffff'
      ctx.font        = 'bold 12px "IBM Plex Mono", monospace'
      ctx.textAlign   = 'center'
      ctx.letterSpacing = '1.5px'
      ctx.fillText(name.toUpperCase(), CW/2, py + ph + 22)

      ctx.fillStyle = 'rgba(150,150,170,0.65)'
      ctx.font      = '9px "IBM Plex Mono", monospace'
      ctx.letterSpacing = '0.8px'
      ctx.fillText(title.toUpperCase(), CW/2, py + ph + 37)

      ctx.strokeStyle = 'rgba(200,200,220,0.09)'
      ctx.lineWidth   = 1
      ctx.beginPath()
      ctx.moveTo(16, py + ph + 48); ctx.lineTo(CW - 16, py + ph + 48)
      ctx.stroke()

      for (let i = 0; i < 24; i++) {
        const bx = 14 + i * 7
        const bh = 8 + Math.abs(Math.sin(i * 1.4)) * 9
        ctx.fillStyle = 'rgba(200,200,220,0.15)'
        ctx.fillRect(bx, py + ph + 54, i % 3 === 0 ? 4 : 3, bh)
      }

      ctx.fillStyle = 'rgba(110,110,130,0.38)'
      ctx.font      = '7.5px monospace'
      ctx.letterSpacing = '1.5px'
      ctx.fillText('TB-2024-001', CW/2, CH - 11)

      const ca = (cx, cy, dx, dy) => {
        ctx.strokeStyle = 'rgba(200,200,220,0.12)'
        ctx.lineWidth   = 1
        ctx.beginPath()
        ctx.moveTo(cx + dx*12, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + dy*12)
        ctx.stroke()
      }
      ca(5, 5, 1, 1); ca(CW-5, 5, -1, 1); ca(5, CH-5, 1, -1); ca(CW-5, CH-5, -1, -1)

      ctx.restore()
    }

    // ── Main loop ──────────────────────────────────────────────────────
    let raf
    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min((now - lastT) / 1000, 0.05)
      lastT    = now
      elapsed += dt

      const W = window.innerWidth
      const H = window.innerHeight
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width  = W
        canvas.height = H
      }

      ctx.clearRect(0, 0, W, H)
      if (!heroVisible) return

      const ax = AX()
      if (!rope) initRope(ax)

      // ── Waiting ──
      if (phase === 'waiting') {
        if (elapsed >= 3.2) {
          phase  = 'dropping'
          dropY  = AY - CH - 40
          dropVY = 0
          rope.forEach((p, i) => {
            p.x = ax; p.y = AY + i * segLen
            p.ox = ax; p.oy = AY + i * segLen
          })
        }
        return
      }

      // ── Dropping ──
      if (phase === 'dropping') {
        dropVY += 2000 * dt
        dropY  += dropVY * dt
        const restY = AY + ROPE_LEN - CH / 2
        if (dropY >= restY) {
          dropY = restY
          phase = 'swinging'
          // ① Start with angle already set (0.28 rad ≈ 16°), no extra impulse needed
          // The pendulum will naturally swing from this initial angle
        }
        cardX = ax - CW / 2
        cardY = dropY
        updateRope()
        drawRope()
        drawCard(cardX, cardY, 0, 0)
        return
      }

      // ── Swinging ──
      if (!dragging) {
        // ③ Apply scroll inertia as angle impulse
        if (Math.abs(scrollVel) > 0.0001) {
          angleVel -= scrollVel * 4.0
          scrollVel *= 0.78   // decay scroll velocity
        }

        // ① Damped pendulum ODE
        const alpha = -(G_PX / ROPE_LEN) * Math.sin(angle) - DAMP * angleVel
        angleVel += alpha * dt
        angle    += angleVel * dt
      }

      // ② Card inertia — card angle springs toward pendulum angle with lag
      const cardAlpha = CARD_STIFFNESS * (angle - cardAngle) - CARD_DAMP * cardAngleVel
      cardAngleVel += cardAlpha * dt
      cardAngle    += cardAngleVel * dt

      // ④ Card twist — proportional to angular velocity, decays
      const twistTarget  = angleVel * 0.10
      cardTwistVel += (twistTarget - cardTwist) * 10 * dt
      cardTwistVel *= 0.88
      cardTwist    += cardTwistVel * dt
      // Clamp twist to subtle range
      cardTwist = Math.max(-0.18, Math.min(0.18, cardTwist))

      // Card position from pendulum angle
      cardX = ax + Math.sin(angle) * ROPE_LEN - CW / 2
      cardY = AY + Math.cos(angle) * ROPE_LEN - CH / 2

      // Visual rotation: blend pendulum angle + card inertia lag
      const visualRot = cardAngle * 0.3 + (angle - cardAngle) * 0.15

      updateRope()
      drawRope()
      drawCard(cardX, cardY, visualRot, cardTwist)
    }
    raf = requestAnimationFrame(loop)

    // ── Drag ──────────────────────────────────────────────────────────
    // All listeners on window — canvas stays pointer-events:none so it
    // never blocks clicks on navbar / buttons underneath.
    const onDown = (e) => {
      if (phase !== 'swinging' || !heroVisible) return
      const src = e.touches ? e.touches[0] : e
      dragging     = true
      prevMX       = src.clientX
      dragVX       = 0
      angleVel     = 0
      cardAngleVel = 0
    }

    const onMove = (e) => {
      if (!dragging) return
      const src = e.touches ? e.touches[0] : e
      const mx  = src.clientX
      dragVX    = mx - prevMX
      prevMX    = mx
      const ax  = AX()
      const dx  = mx - ax
      angle = Math.atan2(dx, ROPE_LEN)
      angle = Math.max(-1.53, Math.min(1.53, angle))
      cardAngle    = angle
      cardAngleVel = 0
      e.preventDefault()
    }

    const onUp = () => {
      if (!dragging) return
      dragging     = false
      angleVel     = dragVX * 0.032
      cardAngleVel = dragVX * 0.018
    }

    window.addEventListener('mousedown',  onDown)
    window.addEventListener('mousemove',  onMove)
    window.addEventListener('mouseup',    onUp)
    window.addEventListener('touchstart', onDown, { passive: true })
    window.addEventListener('touchmove',  onMove, { passive: false })
    window.addEventListener('touchend',   onUp)

    return () => {
      cancelAnimationFrame(raf)
      if (io) io.disconnect()
      window.removeEventListener('scroll',     onScroll)
      window.removeEventListener('mousedown',  onDown)
      window.removeEventListener('mousemove',  onMove)
      window.removeEventListener('mouseup',    onUp)
      window.removeEventListener('touchstart', onDown)
      window.removeEventListener('touchmove',  onMove)
      window.removeEventListener('touchend',   onUp)
    }
  }, [photoUrl, name, title])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        pointerEvents: 'none',   // never blocks clicks on elements below
        zIndex: 15,
        display: 'block',
      }}
    />
  )
}
