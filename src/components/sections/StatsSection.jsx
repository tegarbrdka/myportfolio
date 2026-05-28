import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useProjects } from '../../context/ProjectContext'

gsap.registerPlugin(ScrollTrigger)



export default function StatsSection() {
  const { stats, milestones, profile } = useProjects()
  const sectionRef  = useRef(null)
  const titleRef    = useRef(null)
  const statsRef    = useRef(null)
  const tlRef       = useRef(null)
  const tlLineRef   = useRef(null)
  const quoteRef    = useRef(null)
  const badgeRef    = useRef(null)
  const [time, setTime] = useState('')

  // Live WIB clock
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const wib = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
      const h   = String(wib.getHours()).padStart(2, '0')
      const m   = String(wib.getMinutes()).padStart(2, '0')
      setTime(`${h}:${m} WIB`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── 1. Title heading ──────────────────────────────────────────
      const impactEl = titleRef.current?.querySelector('.t-impact')
      const numbersEl = titleRef.current?.querySelector('.t-numbers')

      if (impactEl) {
        const chars = impactEl.textContent.split('')
        impactEl.innerHTML = chars.map(c =>
          `<span style="display:inline-block;overflow:hidden;vertical-align:bottom"><span style="display:inline-block">${c === ' ' ? '&nbsp;' : c}</span></span>`
        ).join('')
        gsap.fromTo(
          impactEl.querySelectorAll('span > span'),
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0, opacity: 1,
            duration: 0.75, stagger: 0.05, ease: 'power4.out',
            scrollTrigger: { trigger: titleRef.current, start: 'top 88%' },
          }
        )
      }

      if (numbersEl) {
        gsap.fromTo(numbersEl,
          { opacity: 0, x: -40, filter: 'blur(10px)' },
          {
            opacity: 1, x: 0, filter: 'blur(0px)',
            duration: 1.1, ease: 'power3.out', delay: 0.3,
            scrollTrigger: { trigger: titleRef.current, start: 'top 88%' },
            onComplete: () => {
              gsap.to(numbersEl, {
                y: -6, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut',
              })
            },
          }
        )
      }

      // ── 2. Stat cards entrance + count-up ─────────────────────────
      gsap.fromTo(statsRef.current?.querySelectorAll('.st-card'),
        { opacity: 0, y: 40, clipPath: 'inset(100% 0% 0% 0%)' },
        {
          opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.8, stagger: 0.1, ease: 'power4.out',
          scrollTrigger: { trigger: statsRef.current, start: 'top 82%' },
        }
      )

      statsRef.current?.querySelectorAll('.st-num').forEach(el => {
        const target = parseFloat(el.dataset.t)
        const obj    = { v: 0 }
        gsap.to(obj, {
          v: target, duration: 2.5, ease: 'power2.out',
          onUpdate() { el.textContent = Math.floor(obj.v) },
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })
      })

      // Bar fill animation
      statsRef.current?.querySelectorAll('.st-bar-fill').forEach(el => {
        const w = el.dataset.w
        gsap.fromTo(el,
          { width: '0%' },
          {
            width: `${w}%`, duration: 2, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }
        )
      })

      // ── 3. Timeline vertical line draw ────────────────────────────
      if (tlLineRef.current) {
        gsap.fromTo(tlLineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1, duration: 1.5, ease: 'power3.out',
            scrollTrigger: { trigger: tlRef.current, start: 'top 82%' },
          }
        )
      }

      // Timeline items stagger
      gsap.fromTo(tlRef.current?.querySelectorAll('.tl-item'),
        { opacity: 0, x: -20 },
        {
          opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: tlRef.current, start: 'top 82%' },
        }
      )

      // Timeline dots pulse in
      tlRef.current?.querySelectorAll('.tl-dot').forEach((dot, i) => {
        gsap.fromTo(dot,
          { scale: 0, opacity: 0 },
          {
            scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)',
            delay: i * 0.1,
            scrollTrigger: { trigger: tlRef.current, start: 'top 82%' },
          }
        )
      })

      // ── 4. Quote word-by-word reveal ──────────────────────────────
      if (quoteRef.current) {
        const blockquote = quoteRef.current.querySelector('blockquote')
        if (blockquote) {
          const words = blockquote.textContent.split(' ')
          blockquote.innerHTML = words.map(w =>
            `<span style="overflow:hidden;display:inline-block;vertical-align:bottom"><span style="display:inline-block">${w}</span></span>`
          ).join(' ')

          gsap.fromTo(
            blockquote.querySelectorAll('span > span'),
            { yPercent: 110, opacity: 0 },
            {
              yPercent: 0, opacity: 1,
              duration: 0.6, stagger: 0.025, ease: 'power3.out',
              scrollTrigger: { trigger: quoteRef.current, start: 'top 85%' },
            }
          )
        }

        // Label fade
        gsap.fromTo(quoteRef.current.querySelector('.quote-label'),
          { opacity: 0, x: -16 },
          {
            opacity: 1, x: 0, duration: 0.6, ease: 'power2.out',
            scrollTrigger: { trigger: quoteRef.current, start: 'top 88%' },
          }
        )
      }

      // ── 5. Badge entrance ─────────────────────────────────────────
      gsap.fromTo(badgeRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: badgeRef.current, start: 'top 88%' },
        }
      )

    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-40 overflow-hidden"
      style={{ background: '#0F0F0F' }}
    >
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #262626 40%, #262626 60%, transparent)' }}
      />

      <div className="px-8 md:px-16 lg:px-24 max-w-[1600px] mx-auto">

        {/* Label */}
        <div className="flex items-center gap-4 mb-16">
          <span className="font-mono text-[9px] text-silver/40 uppercase tracking-[0.4em]">04 / Impact</span>
          <div className="h-px w-12 bg-ink-border" />
        </div>

        {/* ── Heading ── */}
        <div ref={titleRef} className="mb-20 md:mb-28">
          <div className="overflow-hidden">
            <h2
              className="t-impact leading-[0.88] text-white uppercase"
              style={{ fontFamily: "'Anton',sans-serif", fontSize: 'clamp(52px,9vw,145px)' }}
            >
              IMPACT
            </h2>
          </div>
          <h2
            className="t-numbers leading-[0.88]"
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
            & numbers
          </h2>
        </div>

        {/* ── Stat cards ── */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink-border mb-24 md:mb-36">
          {stats.map((s) => (
            <div
              key={s.id}
              className="st-card bg-[#0F0F0F] p-8 md:p-12 opacity-0 group relative overflow-hidden
                         transition-colors duration-500 hover:bg-[#141414]"
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.03), transparent 70%)` }}
              />

              <div className="flex items-end gap-1 mb-3 relative z-10">
                <span
                  className="st-num font-display font-light text-white tabular-nums leading-none
                             group-hover:scale-105 transition-transform duration-300 origin-bottom-left"
                  data-t={s.value}
                  style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(48px,6vw,88px)' }}
                >
                  0
                </span>
                <span
                  className="font-mono text-silver/40 pb-1 group-hover:text-silver/60 transition-colors duration-300"
                  style={{ fontSize: 'clamp(20px,3vw,36px)' }}
                >
                  {s.suffix}
                </span>
              </div>

              <div className="font-mono text-[9px] text-silver/30 uppercase tracking-[0.3em] whitespace-pre-line leading-loose mb-4 relative z-10">
                {s.label}
              </div>

              {/* Progress bar */}
              <div className="relative z-10 h-px bg-ink-border overflow-hidden">
                <div
                  className="st-bar-fill h-full"
                  data-w={s.bar}
                  style={{ background: 'rgba(255,255,255,0.2)', width: '0%' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          {/* Timeline */}
          <div>
            <h3 className="font-body font-light text-white/60 text-sm uppercase tracking-[0.3em] mb-10">
              Milestones
            </h3>
            <div ref={tlRef} className="relative">
              {/* Vertical line */}
              <div
                ref={tlLineRef}
                className="absolute left-[3.25rem] top-0 bottom-0 w-px origin-top"
                style={{ background: 'linear-gradient(to bottom, rgba(38,38,38,0.8), transparent)' }}
              />

              <div className="space-y-0">
                {milestones.map((item, i) => (
                  <div
                    key={item.id || i}
                    className="tl-item group flex gap-8 border-b border-ink-border py-5 last:border-0 opacity-0 relative"
                  >
                    {/* Year */}
                    <div className="flex-shrink-0 font-mono text-[9px] text-silver/25 group-hover:text-silver/55
                                    transition-colors pt-0.5 w-8">
                      {item.year}
                    </div>

                    {/* Dot on timeline */}
                    <div className="flex-shrink-0 flex items-start pt-1.5">
                      <div className="tl-dot relative w-2 h-2 scale-0">
                        <div className="w-2 h-2 rounded-full bg-ink-border group-hover:bg-silver/40 transition-colors duration-300" />
                        <div className="absolute inset-0 w-2 h-2 rounded-full bg-silver/20 opacity-0 group-hover:opacity-100 group-hover:scale-[2.5] transition-all duration-500" />
                      </div>
                    </div>

                    {/* Text + link */}
                    <div className="flex items-start justify-between gap-4 flex-1">
                      <p className="font-body text-sm text-silver-dim/40 group-hover:text-silver-dim/75
                                    transition-colors duration-300 leading-relaxed font-light">
                        {item.text}
                      </p>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 font-mono text-[8px] text-silver/20 hover:text-silver/60
                                     uppercase tracking-[0.2em] transition-colors duration-200 pt-0.5"
                          onClick={e => e.stopPropagation()}
                        >
                          ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quote + availability */}
          <div className="flex flex-col justify-between gap-12">

            {/* Quote */}
            <div ref={quoteRef}>
              <div className="quote-label font-mono text-[9px] text-silver/25 uppercase tracking-[0.3em] mb-6 opacity-0">
                — Philosophy
              </div>
              <blockquote
                className="font-light text-white/70 leading-snug"
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(28px, 3.5vw, 52px)',
                }}
              >
                "{profile?.quote}"
              </blockquote>
            </div>

            {/* ── Available badge ── */}
            <div
              ref={badgeRef}
              className="border border-ink-border p-6 flex items-start gap-5
                         hover:border-silver/20 transition-colors duration-300 opacity-0 group"
            >
              {/* Pulse dot */}
              <div className="relative flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-white/60" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-white/20 animate-ping" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs text-white/70 uppercase tracking-[0.2em] mb-1">
                  Available for Work
                </div>
                <div className="font-mono text-[9px] text-silver/30 uppercase tracking-wider mb-3">
                  Freelance & Full-time · Open to remote
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[8px] text-silver/20 uppercase tracking-wider">Local time</span>
                    <span className="font-mono text-[8px] text-silver/50">{time}</span>
                  </div>
                  <div className="w-px h-3 bg-ink-border" />
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[8px] text-silver/20 uppercase tracking-wider">Response</span>
                    <span className="font-mono text-[8px] text-silver/50">&lt; 24h</span>
                  </div>
                  <div className="w-px h-3 bg-ink-border" />
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[8px] text-silver/20 uppercase tracking-wider">Zone</span>
                    <span className="font-mono text-[8px] text-silver/50">GMT+7</span>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="font-mono text-silver/30 text-sm">→</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
