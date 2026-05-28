import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useProjects } from '../../context/ProjectContext'

gsap.registerPlugin(ScrollTrigger)

const skills = [
  {
    cat: 'Frontend', color: 'rgba(120,180,255,0.85)',
    items: [
      { name: 'React',      icon: 'https://cdn.simpleicons.org/react/ffffff' },
      { name: 'Next.js',    icon: 'https://cdn.simpleicons.org/nextdotjs/ffffff' },
      { name: 'TypeScript', icon: 'https://cdn.simpleicons.org/typescript/ffffff' },
      { name: 'GSAP',       icon: 'https://cdn.simpleicons.org/greensock/ffffff' },
      { name: 'Three.js',   icon: 'https://cdn.simpleicons.org/threedotjs/ffffff' },
      { name: 'WebGL',      icon: null },
    ],
  },
  {
    cat: 'Backend', color: 'rgba(120,220,160,0.85)',
    items: [
      { name: 'Node.js',    icon: 'https://cdn.simpleicons.org/nodedotjs/ffffff' },
      { name: 'Python',     icon: 'https://cdn.simpleicons.org/python/ffffff' },
      { name: 'FastAPI',    icon: 'https://cdn.simpleicons.org/fastapi/ffffff' },
      { name: 'PostgreSQL', icon: 'https://cdn.simpleicons.org/postgresql/ffffff' },
      { name: 'Redis',      icon: 'https://cdn.simpleicons.org/redis/ffffff' },
      { name: 'GraphQL',    icon: 'https://cdn.simpleicons.org/graphql/ffffff' },
    ],
  },
  {
    cat: 'DevOps', color: 'rgba(220,160,120,0.85)',
    items: [
      { name: 'Docker',     icon: 'https://cdn.simpleicons.org/docker/ffffff' },
      { name: 'AWS',        icon: 'https://cdn.simpleicons.org/amazonwebservices/ffffff' },
      { name: 'CI/CD',      icon: null },
      { name: 'Kubernetes', icon: 'https://cdn.simpleicons.org/kubernetes/ffffff' },
      { name: 'Terraform',  icon: 'https://cdn.simpleicons.org/terraform/ffffff' },
      { name: 'Vercel',     icon: 'https://cdn.simpleicons.org/vercel/ffffff' },
    ],
  },
  {
    cat: 'Craft', color: 'rgba(200,140,255,0.85)',
    items: [
      { name: 'Figma',         icon: 'https://cdn.simpleicons.org/figma/ffffff' },
      { name: 'Motion Design', icon: null },
      { name: 'UI Systems',    icon: null },
      { name: 'Accessibility', icon: null },
      { name: 'Performance',   icon: null },
      { name: 'Web Vitals',    icon: null },
    ],
  },
]

const statsData = [
  { target: 5,   suffix: '+',  label: 'Years'    },
  { target: 40,  suffix: '+',  label: 'Projects' },
  { target: 100, suffix: '%',  label: 'Remote'   },
]

export default function AboutSection() {
  const { profile } = useProjects()
  const sectionRef  = useRef(null)
  const imgWrapRef  = useRef(null)
  const imgRef      = useRef(null)
  const grainRef    = useRef(null)
  const skillsRef   = useRef(null)
  const textRef     = useRef(null)
  const titleRef    = useRef(null)
  const statsRef    = useRef(null)
  const labelRef    = useRef(null)
  const dividerRef  = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.matchMedia('(max-width:768px)').matches

      // ── 1. Section label slide in ──────────────────────────────────
      gsap.fromTo(labelRef.current,
        { opacity: 0, x: -20 },
        {
          opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: labelRef.current, start: 'top 92%' },
        }
      )

      // ── 2. Title: char-by-char split animation ─────────────────────
      if (titleRef.current) {
        const aboutEl = titleRef.current.querySelector('.title-about')
        const workEl  = titleRef.current.querySelector('.title-work')

        // "ABOUT" — tiap huruf naik dari bawah dengan stagger
        if (aboutEl) {
          const chars = aboutEl.textContent.split('')
          aboutEl.innerHTML = chars.map(c =>
            `<span style="display:inline-block;overflow:hidden;vertical-align:bottom"><span style="display:inline-block">${c === ' ' ? '&nbsp;' : c}</span></span>`
          ).join('')

          const innerSpans = aboutEl.querySelectorAll('span > span')

          // Entrance
          gsap.fromTo(
            innerSpans,
            { yPercent: 110, opacity: 0, rotateX: -40 },
            {
              yPercent: 0, opacity: 1, rotateX: 0,
              duration: 0.8, stagger: 0.06,
              ease: 'power4.out',
              delay: 0.1,
              scrollTrigger: { trigger: titleRef.current, start: 'top bottom', once: true },
              // Setelah entrance selesai → idle float per huruf
              onComplete: () => {
                // Glitch random sesekali
                const glitch = () => {
                  const idx  = Math.floor(Math.random() * innerSpans.length)
                  const span = innerSpans[idx]
                  if (!span) return

                  gsap.timeline()
                    .to(span, { x: (Math.random() - 0.5) * 8, skewX: 6,  opacity: 0.4, duration: 0.04, ease: 'none' })
                    .to(span, { x: (Math.random() - 0.5) * 6, skewX: -4, opacity: 1,   duration: 0.04, ease: 'none' })
                    .to(span, { x: 0, skewX: 0, opacity: 1, duration: 0.08, ease: 'power2.out' })

                  setTimeout(glitch, 1800 + Math.random() * 3000)
                }
                setTimeout(glitch, 2000)
              },
            }
          )
        }

        // "the work" — blur reveal + slide dari kiri
        if (workEl) {
          gsap.fromTo(workEl,
            { opacity: 0, x: -40, filter: 'blur(12px)' },
            {
              opacity: 1, x: 0, filter: 'blur(0px)',
              duration: 1.2, ease: 'power3.out', delay: 0.35,
              scrollTrigger: { trigger: titleRef.current, start: 'top bottom', once: true },
              onComplete: () => {
                // Idle: float naik turun pelan, sedikit lebih lambat dari "ABOUT"
                gsap.to(workEl, {
                  y: -8,
                  duration: 3.2,
                  repeat: -1,
                  yoyo: true,
                  ease: 'sine.inOut',
                  delay: 0.5,
                })
                // Idle: opacity breathe — outline text sedikit bernapas
                gsap.to(workEl, {
                  WebkitTextStroke: '1px rgba(200,200,200,0.45)',
                  duration: 2.5,
                  repeat: -1,
                  yoyo: true,
                  ease: 'sine.inOut',
                  delay: 0.8,
                })
              },
            }
          )
        }
      }

      // ── 3. Divider line sweep ──────────────────────────────────────
      gsap.fromTo(dividerRef.current,
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: dividerRef.current, start: 'top 90%' },
        }
      )

      // ── 4. Narasi: word-by-word reveal ─────────────────────────────
      if (textRef.current && !isMobile) {
        // Collect text nodes, preserve <strong> tags
        const walker = document.createTreeWalker(textRef.current, NodeFilter.SHOW_TEXT)
        const textNodes = []
        let node
        while ((node = walker.nextNode())) textNodes.push(node)

        textNodes.forEach(tn => {
          const words = tn.textContent.split(/(\s+)/)
          const frag  = document.createDocumentFragment()
          words.forEach(word => {
            if (/^\s+$/.test(word)) {
              frag.appendChild(document.createTextNode(word))
            } else {
              const wrap = document.createElement('span')
              wrap.style.cssText = 'overflow:hidden;display:inline-block;vertical-align:bottom'
              const inner = document.createElement('span')
              inner.style.cssText = 'display:inline-block'
              inner.textContent = word
              wrap.appendChild(inner)
              frag.appendChild(wrap)
            }
          })
          tn.parentNode.replaceChild(frag, tn)
        })

        gsap.fromTo(
          textRef.current.querySelectorAll('span > span'),
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0, opacity: 1,
            duration: 0.55, stagger: 0.012, ease: 'power3.out',
            scrollTrigger: { trigger: textRef.current, start: 'top 85%' },
          }
        )
      } else if (textRef.current) {
        gsap.fromTo(textRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: textRef.current, start: 'top 88%' },
          }
        )
      }

      // ── 5. Stats count-up ──────────────────────────────────────────
      if (statsRef.current) {
        gsap.fromTo(statsRef.current,
          { opacity: 0, y: 16 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
            scrollTrigger: { trigger: statsRef.current, start: 'top 88%' },
          }
        )

        statsRef.current.querySelectorAll('.stat-num').forEach(el => {
          const target = parseFloat(el.dataset.target)
          const obj    = { v: 0 }
          gsap.to(obj, {
            v: target, duration: 2, ease: 'power2.out',
            onUpdate() { el.textContent = Math.floor(obj.v) },
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          })
        })
      }

      // ── 6. Photo clip reveal ───────────────────────────────────────
      gsap.fromTo(imgWrapRef.current,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.4, ease: 'power4.inOut',
          scrollTrigger: { trigger: imgWrapRef.current, start: 'top 85%' },
        }
      )

      // ── 7. Grain fade in ───────────────────────────────────────────
      gsap.fromTo(grainRef.current,
        { opacity: 0 },
        {
          opacity: 0.07, duration: 1.4,
          scrollTrigger: { trigger: imgWrapRef.current, start: 'top 85%' },
        }
      )

      // ── 8. Photo parallax on scroll ────────────────────────────────
      if (!isMobile && imgRef.current) {
        gsap.to(imgRef.current, {
          yPercent: -10, ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom', end: 'bottom top', scrub: 1.5,
          },
        })
      }

      // ── 9. Skills: category line sweep + item stagger ──────────────
      if (skillsRef.current) {
        const groups = skillsRef.current.querySelectorAll('.sk-group')
        groups.forEach((group, gi) => {
          // Category label sweep
          const catLine = group.querySelector('.cat-line')
          if (catLine) {
            gsap.fromTo(catLine,
              { scaleX: 0 },
              {
                scaleX: 1, duration: 0.6, ease: 'power3.out',
                scrollTrigger: { trigger: group, start: 'top 88%' },
              }
            )
          }

          // Group fade in
          gsap.fromTo(group,
            { opacity: 0, y: 24 },
            {
              opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
              delay: gi * 0.06,
              scrollTrigger: { trigger: skillsRef.current, start: 'top 82%' },
            }
          )

          // Items stagger
          const items = group.querySelectorAll('.sk-item')
          gsap.fromTo(items,
            { opacity: 0, x: -10 },
            {
              opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out',
              scrollTrigger: { trigger: group, start: 'top 85%' },
            }
          )
        })
      }
    }, sectionRef)

    // ── 10. Photo mouse tilt (outside GSAP context) ─────────────────
    const wrap = imgWrapRef.current
    if (!wrap || window.innerWidth <= 768) return ctx.revert.bind(ctx)

    const onMouseMove = (e) => {
      const rect = wrap.getBoundingClientRect()
      const cx   = rect.left + rect.width  / 2
      const cy   = rect.top  + rect.height / 2
      const dx   = (e.clientX - cx) / (rect.width  / 2)
      const dy   = (e.clientY - cy) / (rect.height / 2)
      gsap.to(imgRef.current, {
        x: dx * 8, y: dy * 6,
        duration: 0.6, ease: 'power2.out',
      })
    }
    const onMouseLeave = () => {
      gsap.to(imgRef.current, { x: 0, y: 0, duration: 0.8, ease: 'power3.out' })
    }

    wrap.addEventListener('mousemove',  onMouseMove)
    wrap.addEventListener('mouseleave', onMouseLeave)

    return () => {
      ctx.revert()
      wrap.removeEventListener('mousemove',  onMouseMove)
      wrap.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-28 md:py-40 overflow-hidden"
      style={{ background: '#0F0F0F' }}
    >
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #262626 40%, #262626 60%, transparent)' }}
      />

      <div className="px-8 md:px-16 lg:px-24 max-w-[1600px] mx-auto">

        {/* Label */}
        <div ref={labelRef} className="flex items-center gap-4 mb-16 opacity-0">
          <span className="font-mono text-[9px] text-silver/40 uppercase tracking-[0.4em]">02 / About</span>
          <div className="h-px w-12 bg-ink-border" />
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start mb-24 lg:mb-36">

          {/* LEFT — foto, lebih kecil */}
          <div className="lg:col-span-4">
            <div
              ref={imgWrapRef}
              className="relative w-full overflow-hidden"
              style={{ aspectRatio: '3 / 4', clipPath: 'inset(100% 0% 0% 0%)', cursor: 'none', maxWidth: 320 }}
            >
            <div ref={imgRef} className="absolute inset-0 w-full h-[110%] -top-[5%]">
              <img
                src={profile.aboutPhotoUrl || profile.photoUrl || '/photo.png'}
                alt={profile.name}
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center 10%' }}
              />
              {/* Grain */}
              <div
                ref={grainRef}
                className="absolute inset-0 pointer-events-none"
                style={{
                  opacity: 0,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat',
                  backgroundSize: '160px 160px',
                  mixBlendMode: 'overlay',
                }}
              />
              {/* Vignette */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 60%, transparent 35%, rgba(15,15,15,0.5) 100%)' }}
              />
            </div>
            {/* Corner marks */}
            <span className="absolute top-3 left-3 w-5 h-5 border-t border-l border-silver/25 z-10" />
            <span className="absolute top-3 right-3 w-5 h-5 border-t border-r border-silver/25 z-10" />
            <span className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-silver/25 z-10" />
            <span className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-silver/25 z-10" />
          </div>
          </div>

          {/* RIGHT — konten */}
          <div className="lg:col-span-8 flex flex-col justify-center gap-10 lg:pt-4">

            {/* Title */}
            <div ref={titleRef}>
              <div className="overflow-hidden">
                <h2
                  className="title-about leading-[0.88] text-white uppercase"
                  style={{ fontFamily: "'Anton',sans-serif", fontSize: 'clamp(52px, 7vw, 120px)' }}
                >
                  ABOUT
                </h2>
              </div>
              <h2
                className="title-work leading-[0.88]"
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontStyle: 'italic', fontWeight: 300,
                  fontSize: 'clamp(52px, 7vw, 120px)',
                  color: 'transparent',
                  WebkitTextStroke: '1px rgba(200,200,200,0.22)',
                  opacity: 0,
                  willChange: 'transform, opacity, filter',
                }}
              >
                the work
              </h2>
            </div>

            {/* Divider */}
            <div
              ref={dividerRef}
              className="h-px w-16 origin-left opacity-0"
              style={{ background: 'linear-gradient(90deg, rgba(200,200,200,0.3), transparent)' }}
            />

            {/* Narasi */}
            <p
              ref={textRef}
              className="font-body text-silver-dim/60 text-lg md:text-xl leading-relaxed font-light max-w-xl"
            >
              {profile.bio}
            </p>

            {/* Stats count-up */}
            <div ref={statsRef} className="flex items-center gap-10 pt-2 opacity-0">
              {statsData.map(s => (
                <div key={s.label}>
                  <div className="flex items-end gap-0.5">
                    <span
                      className="stat-num font-light text-white tabular-nums"
                      data-target={s.target}
                      style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px, 3vw, 40px)' }}
                    >
                      0
                    </span>
                    <span
                      className="font-light text-silver/50 pb-1"
                      style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(18px, 2vw, 26px)' }}
                    >
                      {s.suffix}
                    </span>
                  </div>
                  <div className="font-mono text-[8px] text-silver/30 uppercase tracking-[0.25em] mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Skills grid ── */}
        <div
          ref={skillsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-ink-border pt-16"
        >
          {skills.map(g => (
            <div key={g.cat} className="sk-group opacity-0">
              {/* Category header with sweep line */}
              <div className="mb-5 pb-3 relative">
                <div className="font-mono text-[9px] text-silver/40 uppercase tracking-[0.3em]">
                  {g.cat}
                </div>
                {/* Sweep line */}
                <div
                  className="cat-line absolute bottom-0 left-0 right-0 h-px origin-left"
                  style={{ background: `linear-gradient(90deg, ${g.color.replace('0.85', '0.3')}, transparent)` }}
                />
              </div>
              <ul className="space-y-2.5">
                {g.items.map((item, idx) => (
                  <li
                    key={item.name}
                    className="sk-item font-body text-sm font-light flex items-center gap-2.5
                               transition-all duration-200 ease-out text-silver-dim/50
                               hover:translate-x-1.5 cursor-default opacity-0"
                    style={{ transitionDelay: `${idx * 15}ms` }}
                    onMouseEnter={e => { e.currentTarget.style.color = g.color }}
                    onMouseLeave={e => { e.currentTarget.style.color = '' }}
                  >
                    {/* Logo atau dot */}
                    {item.icon ? (
                      <img
                        src={item.icon}
                        alt={item.name}
                        width={12}
                        height={12}
                        className="flex-shrink-0 opacity-30 transition-opacity duration-200"
                        style={{ filter: 'brightness(0) invert(1)' }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.8' }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '0.3' }}
                      />
                    ) : (
                      <span className="w-1 h-1 rounded-full flex-shrink-0 bg-ink-muted" />
                    )}
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
