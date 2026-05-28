import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function MarqueeTicker({ items = [], speed = 40, reverse = false, dim = false }) {
  const trackRef = useRef(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const total = track.scrollWidth / 2
    gsap.to(track, {
      x: reverse ? total : -total,
      duration: total / speed,
      ease: 'none',
      repeat: -1,
      modifiers: { x: gsap.utils.unitize(x => parseFloat(x) % total) },
    })
  }, [speed, reverse])

  const all = [...items, ...items, ...items]

  return (
    <div className="overflow-hidden w-full">
      <div ref={trackRef} className="flex items-center whitespace-nowrap" style={{ willChange: 'transform' }}>
        {all.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className={`font-mono text-[10px] uppercase tracking-[0.3em] px-6 py-0.5 ${
              dim ? 'text-silver/15' : 'text-silver/25 hover:text-silver/50'
            } transition-colors duration-200`}>
              {item}
            </span>
            <span className={`text-[6px] ${dim ? 'text-silver/10' : 'text-silver/15'}`}>◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}
