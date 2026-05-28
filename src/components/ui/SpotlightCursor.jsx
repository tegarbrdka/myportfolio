import { useEffect, useRef } from 'react'

/**
 * SpotlightCursor — radial glow that follows the mouse
 * Rendered as a fixed div with radial-gradient, only visible inside hero section
 */
export default function SpotlightCursor({ heroRef }) {
  const spotRef = useRef(null)
  const pos     = useRef({ x: -999, y: -999 })
  const target  = useRef({ x: -999, y: -999 })
  let   raf

  useEffect(() => {
    const spot = spotRef.current
    if (!spot) return

    const onMove = (e) => {
      target.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMove)

    const lerp = (a, b, t) => a + (b - a) * t

    const tick = () => {
      pos.current.x = lerp(pos.current.x, target.current.x, 0.08)
      pos.current.y = lerp(pos.current.y, target.current.y, 0.08)

      // Only show inside hero bounds
      if (heroRef?.current) {
        const rect = heroRef.current.getBoundingClientRect()
        const inside =
          pos.current.x >= rect.left &&
          pos.current.x <= rect.right &&
          pos.current.y >= rect.top  &&
          pos.current.y <= rect.bottom

        spot.style.opacity = inside ? '1' : '0'
      }

      spot.style.left = pos.current.x + 'px'
      spot.style.top  = pos.current.y + 'px'
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [heroRef])

  return (
    <div
      ref={spotRef}
      className="fixed pointer-events-none"
      style={{
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(circle, rgba(200,200,200,0.04) 0%, rgba(200,200,200,0.015) 30%, transparent 70%)',
        zIndex: 2,
        transition: 'opacity 0.4s ease',
        mixBlendMode: 'screen',
      }}
    />
  )
}
