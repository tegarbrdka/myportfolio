import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const BITS = [
  { label: 'React',      x: '8%',   y: '18%', rot: -12, speed: 0.6 },
  { label: 'Three.js',   x: '82%',  y: '12%', rot:  8,  speed: 0.9 },
  { label: 'Node.js',    x: '72%',  y: '72%', rot: -6,  speed: 0.5 },
  { label: 'WebGL',      x: '14%',  y: '78%', rot:  14, speed: 0.7 },
  { label: 'TypeScript', x: '88%',  y: '44%', rot: -10, speed: 0.8 },
  { label: 'Docker',     x: '5%',   y: '50%', rot:  6,  speed: 0.55 },
  { label: 'GSAP',       x: '50%',  y: '88%', rot: -8,  speed: 0.65 },
  { label: 'AWS',        x: '38%',  y: '8%',  rot:  10, speed: 0.75 },
  // Code snippets
  { label: 'const x = () =>',  x: '60%', y: '22%', rot: -4,  speed: 0.5,  code: true },
  { label: 'import * as THREE', x: '18%', y: '38%', rot:  5,  speed: 0.7,  code: true },
  { label: 'gl_FragColor',      x: '76%', y: '58%', rot: -7,  speed: 0.6,  code: true },
]

export default function FloatingTechBits({ sectionRef }) {
  const containerRef = useRef(null)
  const itemsRef     = useRef([])

  useEffect(() => {
    const items = itemsRef.current.filter(Boolean)
    if (!items.length) return

    // Entrance — stagger fade in after preloader
    gsap.fromTo(items,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1, scale: 1,
        duration: 1.2,
        stagger: { each: 0.08, from: 'random' },
        ease: 'power3.out',
        delay: 3.5,
      }
    )

    // Continuous float per item
    items.forEach((el, i) => {
      const bit = BITS[i]
      gsap.to(el, {
        y: `+=${8 + Math.random() * 10}`,
        x: `+=${(Math.random() - 0.5) * 6}`,
        duration: 3 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 2,
      })

      // Parallax on scroll
      if (sectionRef?.current) {
        gsap.to(el, {
          yPercent: -(30 + bit.speed * 40),
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: bit.speed,
          },
        })
      }
    })
  }, [sectionRef])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 3 }}
    >
      {BITS.map((bit, i) => (
        <div
          key={i}
          ref={el => itemsRef.current[i] = el}
          className="absolute opacity-0"
          style={{
            left: bit.x,
            top:  bit.y,
            transform: `rotate(${bit.rot}deg)`,
          }}
        >
          <span
            className="font-mono whitespace-nowrap"
            style={{
              fontSize: bit.code ? '9px' : '10px',
              color: bit.code ? 'rgba(200,200,200,0.06)' : 'rgba(200,200,200,0.07)',
              letterSpacing: bit.code ? '0.05em' : '0.3em',
              textTransform: bit.code ? 'none' : 'uppercase',
              fontStyle: bit.code ? 'italic' : 'normal',
            }}
          >
            {bit.label}
          </span>
        </div>
      ))}
    </div>
  )
}
