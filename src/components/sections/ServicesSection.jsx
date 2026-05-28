import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import MarqueeTicker from '../ui/MarqueeTicker'

gsap.registerPlugin(ScrollTrigger)

const services = [
  { n: '01', title: 'Full-Stack Development',  desc: 'End-to-end applications — from data schema to pixel-perfect interface. I own the whole stack.' },
  { n: '02', title: 'Creative Frontend',        desc: 'Interfaces that move with purpose. GSAP animations, WebGL experiments, scroll-driven stories.' },
  { n: '03', title: 'Performance Engineering',  desc: 'Core Web Vitals, bundle analysis, edge caching. Fast is a feature — I make apps feel instant.' },
  { n: '04', title: 'API & Integrations',       desc: 'Third-party APIs, webhooks, microservices. From payment gateways to AI model endpoints.' },
  { n: '05', title: 'UI/UX Systems',            desc: 'Design systems, component libraries, Figma-to-code pipelines. Consistent and scalable.' },
  { n: '06', title: 'DevOps & Deployment',      desc: 'CI/CD, Docker, cloud infrastructure. Ship with confidence via automated testing.' },
]

const stack = ['React','Next.js','TypeScript','Node.js','Python','FastAPI','PostgreSQL','Redis','Docker','AWS','GSAP','Three.js','Figma','Tailwind','GraphQL','Prisma','Vercel','Stripe']

/* ── Individual service row ── */
function ServiceRow({ s, index }) {
  const rowRef    = useRef(null)
  const bgRef     = useRef(null)
  const numRef    = useRef(null)
  const descRef   = useRef(null)
  const arrowRef  = useRef(null)
  const lineRef   = useRef(null)

  useEffect(() => {
    const row  = rowRef.current
    const bg   = bgRef.current
    const desc = descRef.current
    const num  = numRef.current
    const arr  = arrowRef.current
    if (!row) return

    // ── Entrance ──────────────────────────────────────────────────
    gsap.fromTo(row,
      { opacity: 0, x: -24 },
      {
        opacity: 1, x: 0, duration: 0.6, ease: 'power2.out',
        delay: index * 0.05,
        scrollTrigger: { trigger: row, start: 'top 88%' },
      }
    )

    // ── Line expand ───────────────────────────────────────────────
    if (lineRef.current) {
      gsap.fromTo(lineRef.current, { scaleX: 0 }, {
        scaleX: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: row, start: 'top 90%' },
      })
    }

    // ── Hover: background sweep ───────────────────────────────────
    const onEnter = () => {
      gsap.to(bg, { scaleX: 1, duration: 0.5, ease: 'power3.out' })
      gsap.to(arr, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' })
      // Desc height reveal
      if (desc) {
        gsap.to(desc, {
          height: desc.scrollHeight,
          opacity: 1,
          duration: 0.4,
          ease: 'power3.out',
        })
      }
      // Number flip up
      if (num) {
        gsap.to(num, { yPercent: -110, opacity: 0, duration: 0.2, ease: 'power2.in' })
        gsap.fromTo(num,
          { yPercent: 110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.3, ease: 'power2.out', delay: 0.2 }
        )
      }
    }

    const onLeave = () => {
      gsap.to(bg, { scaleX: 0, duration: 0.4, ease: 'power3.in' })
      gsap.to(arr, { opacity: 0, x: -8, duration: 0.25 })
      if (desc) {
        gsap.to(desc, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in' })
      }
    }

    row.addEventListener('mouseenter', onEnter)
    row.addEventListener('mouseleave', onLeave)

    return () => {
      row.removeEventListener('mouseenter', onEnter)
      row.removeEventListener('mouseleave', onLeave)
    }
  }, [index])

  return (
    <div
      ref={rowRef}
      className="sv-row relative opacity-0"
      data-cursor="Explore"
      style={{ cursor: 'none' }}
    >
      {/* Top separator line */}
      <div
        ref={lineRef}
        className="h-px w-full origin-left"
        style={{ background: 'linear-gradient(90deg, rgba(38,38,38,0.8), transparent)', transform: 'scaleX(0)' }}
      />

      {/* Hover background sweep */}
      <div
        ref={bgRef}
        className="absolute inset-0 origin-left pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 60%, transparent 100%)',
          transform: 'scaleX(0)',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 flex items-start gap-8 md:gap-16 py-8 md:py-10 pr-4">

        {/* Large watermark number */}
        <div className="flex-shrink-0 w-16 relative overflow-hidden" style={{ height: 32 }}>
          <span
            ref={numRef}
            className="absolute inset-0 flex items-center font-mono text-[11px] text-silver/20 tracking-widest transition-colors duration-300"
          >
            {s.n}
          </span>
          {/* Big ghost number behind */}
          <span
            className="absolute -top-2 -left-1 font-mono text-[52px] font-bold leading-none pointer-events-none select-none"
            style={{
              color: 'transparent',
              WebkitTextStroke: '1px rgba(255,255,255,0.04)',
              fontFamily: "'Anton', sans-serif",
            }}
          >
            {s.n}
          </span>
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h3
            className="font-body text-white/65 text-xl md:text-2xl font-light leading-snug
                       group-hover:text-white transition-colors duration-300 mb-0"
          >
            {s.title}
          </h3>
          {/* Description — collapsed by default, expands on hover */}
          <div
            ref={descRef}
            style={{ height: 0, opacity: 0, overflow: 'hidden' }}
          >
            <p className="font-body text-silver-dim/45 text-sm leading-relaxed font-light pt-3">
              {s.desc}
            </p>
          </div>
        </div>

        {/* Arrow */}
        <div
          ref={arrowRef}
          className="flex-shrink-0 mt-1"
          style={{ opacity: 0, transform: 'translateX(-8px)' }}
        >
          <span className="font-mono text-silver/40 text-base">→</span>
        </div>
      </div>
    </div>
  )
}

/* ── Section ── */
export default function ServicesSection() {
  const sectionRef = useRef(null)
  const titleRef   = useRef(null)
  const buildRef   = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── Title entrance ──────────────────────────────────────────
      const whatEl  = titleRef.current?.querySelector('.sv-what')
      const buildEl = buildRef.current

      if (whatEl) {
        const chars = whatEl.textContent.split('')
        whatEl.innerHTML = chars.map(c =>
          `<span style="display:inline-block;overflow:hidden;vertical-align:bottom"><span style="display:inline-block">${c === ' ' ? '&nbsp;' : c}</span></span>`
        ).join('')

        gsap.fromTo(
          whatEl.querySelectorAll('span > span'),
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0, opacity: 1,
            duration: 0.75, stagger: 0.05, ease: 'power4.out',
            scrollTrigger: { trigger: titleRef.current, start: 'top 88%' },
          }
        )
      }

      if (buildEl) {
        gsap.fromTo(buildEl,
          { opacity: 0, x: -40, filter: 'blur(10px)' },
          {
            opacity: 1, x: 0, filter: 'blur(0px)',
            duration: 1.1, ease: 'power3.out', delay: 0.3,
            scrollTrigger: { trigger: titleRef.current, start: 'top 88%' },
            // Idle: float + stroke breathe
            onComplete: () => {
              gsap.to(buildEl, {
                y: -7, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut',
              })
              gsap.to(buildEl, {
                WebkitTextStroke: '1px rgba(200,200,200,0.42)',
                duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.5,
              })
            },
          }
        )
      }

    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative py-0 overflow-hidden"
      style={{ background: '#080808' }}
    >
      {/* Top marquee */}
      <div className="border-y border-ink-border py-3 overflow-hidden">
        <MarqueeTicker items={stack} speed={30} />
      </div>

      <div className="px-8 md:px-16 lg:px-24 py-24 md:py-40 max-w-[1600px] mx-auto">

        {/* Label */}
        <div className="flex items-center gap-4 mb-14">
          <span className="font-mono text-[9px] text-silver/40 uppercase tracking-[0.4em]">03 / Services</span>
          <div className="h-px w-12 bg-ink-border" />
        </div>

        {/* Title */}
        <div ref={titleRef} className="mb-20 md:mb-28">
          <div className="overflow-hidden">
            <h2
              className="sv-what leading-[0.88] text-white uppercase"
              style={{ fontFamily: "'Anton',sans-serif", fontSize: 'clamp(52px,9vw,145px)' }}
            >
              WHAT I
            </h2>
          </div>
          <h2
            ref={buildRef}
            className="leading-[0.88]"
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontStyle: 'italic', fontWeight: 300,
              fontSize: 'clamp(52px,9vw,145px)',
              color: 'transparent',
              WebkitTextStroke: '1px rgba(200,200,200,0.2)',
              opacity: 0,
              willChange: 'transform, opacity, filter',
            }}
          >
            Build
          </h2>
        </div>

        {/* Service rows */}
        <div>
          {services.map((s, i) => (
            <ServiceRow key={s.n} s={s} index={i} />
          ))}
          {/* Last line */}
          <div className="h-px w-full"
            style={{ background: 'linear-gradient(90deg, rgba(38,38,38,0.8), transparent)' }}
          />
        </div>

      </div>

      {/* Bottom marquee */}
      <div className="border-y border-ink-border py-3 overflow-hidden">
        <MarqueeTicker items={stack} speed={25} reverse />
      </div>
    </section>
  )
}
