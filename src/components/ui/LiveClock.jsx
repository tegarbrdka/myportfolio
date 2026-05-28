import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'

export default function LiveClock() {
  const [time, setTime] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const h = String(now.getHours()).padStart(2, '0')
      const m = String(now.getMinutes()).padStart(2, '0')
      const s = String(now.getSeconds()).padStart(2, '0')
      setTime(`${h}:${m}:${s}`)
    }
    tick()
    const id = setInterval(tick, 1000)

    // Entrance
    gsap.fromTo(ref.current,
      { opacity: 0, x: -12 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', delay: 3.4 }
    )

    return () => clearInterval(id)
  }, [])

  return (
    <div ref={ref} className="absolute top-24 left-8 md:left-16 z-20 opacity-0 pointer-events-none select-none">
      <div className="flex flex-col gap-1">
        {/* Location */}
        <div className="flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-silver/40 animate-pulse" />
          <span className="font-mono text-[9px] text-silver/30 uppercase tracking-[0.3em]">
            Based in Indonesia
          </span>
        </div>
        {/* Time */}
        <div className="font-mono text-[11px] text-silver/20 tracking-[0.25em] tabular-nums">
          WIB — {time}
        </div>
      </div>
    </div>
  )
}
