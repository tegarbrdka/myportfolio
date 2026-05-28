import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useProjects } from '../../context/ProjectContext'
import { ArrowUpRight, Github } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

/* ── Individual Card ──────────────────────────────────── */
function ProjectCard({ project, index, trackRef }) {
  const cardRef    = useRef(null)
  const imgRef     = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card || window.innerWidth <= 768) return

    /* 3D tilt */
    const onMove = (e) => {
      const r = card.getBoundingClientRect()
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 10
      const y = ((e.clientY - r.top)  / r.height - 0.5) * -10
      gsap.to(card, { rotateY: x, rotateX: y, transformPerspective: 900, duration: 0.5, ease: 'power2.out' })
    }
    const onLeave = () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'power3.out' })
    }
    const onEnter = () => {
      gsap.to(imgRef.current,     { scale: 1.08, duration: 0.8, ease: 'power2.out' })
      gsap.to(overlayRef.current, { opacity: 0.5, duration: 0.4 })
    }
    const onExit = () => {
      gsap.to(imgRef.current,     { scale: 1,   duration: 0.8, ease: 'power2.out' })
      gsap.to(overlayRef.current, { opacity: 0.7, duration: 0.4 })
    }

    card.addEventListener('mousemove',  onMove)
    card.addEventListener('mouseleave', onLeave)
    card.addEventListener('mouseenter', onEnter)
    card.addEventListener('mouseleave', onExit)
    return () => {
      card.removeEventListener('mousemove',  onMove)
      card.removeEventListener('mouseleave', onLeave)
      card.removeEventListener('mouseenter', onEnter)
      card.removeEventListener('mouseleave', onExit)
    }
  }, [])

  const isLarge = index % 3 === 0

  return (
    <div
      ref={cardRef}
      data-cursor="View"
      data-card-index={index}
      className={`project-card group relative overflow-hidden flex-shrink-0 opacity-0
        transition-[filter,transform] duration-500 ease-out
        ${isLarge
          ? 'w-[480px] md:w-[560px] lg:w-[640px]'
          : 'w-[340px] md:w-[400px] lg:w-[460px]'
        }`}
      style={{ transformStyle: 'preserve-3d', aspectRatio: isLarge ? '4/3' : '3/4' }}
    >
      <img
        ref={imgRef}
        src={project.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&q=80'}
        alt={project.title}
        className="absolute inset-0 w-full h-full object-cover"
        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&q=80' }}
      />

      <div ref={overlayRef}
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, #080808 0%, rgba(8,8,8,0.5) 50%, rgba(8,8,8,0.1) 100%)', opacity: 0.7 }}
      />

      {/* Corner number */}
      <div className="absolute top-5 left-5">
        <span className="font-mono text-[10px] text-white/30 tracking-widest">
          {String(index + 1).padStart(2, '0')} / {String(project.year || '2024')}
        </span>
      </div>

      {/* Category badge */}
      <div className="absolute top-5 right-5">
        <span className="font-mono text-[9px] text-white/40 border border-white/10 bg-black/30 backdrop-blur-sm px-2.5 py-1 uppercase tracking-wider">
          {project.category || 'Project'}
        </span>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
        <div className="flex flex-wrap gap-1.5 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-100">
          {(project.techStack || []).slice(0, 3).map(t => (
            <span key={t} className="font-mono text-[9px] text-white/50 border border-white/10 px-2 py-0.5 uppercase">{t}</span>
          ))}
        </div>

        <h3 className="font-display font-light text-white leading-tight mb-2"
          style={{ fontFamily: "'Anton',sans-serif", fontSize: 'clamp(28px, 3vw, 42px)' }}>
          {project.title}
        </h3>

        <p className="font-body text-white/50 text-sm leading-relaxed font-light mb-5 opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-150 line-clamp-2">
          {project.description}
        </p>

        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-200">
          {project.liveLink && (
            <a href={project.liveLink} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 font-mono text-[10px] text-white/70 hover:text-white uppercase tracking-wider transition-colors">
              Live <ArrowUpRight size={11} />
            </a>
          )}
          {project.projectLink && (
            <a href={project.projectLink} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 font-mono text-[10px] text-white/40 hover:text-white/70 uppercase tracking-wider transition-colors">
              <Github size={11} /> Code
            </a>
          )}
        </div>
      </div>

      <div className="absolute inset-0 border border-transparent group-hover:border-white/10 transition-colors duration-500 pointer-events-none" />
    </div>
  )
}

/* ── Section ──────────────────────────────────────────── */
export default function ProjectsSection() {
  const sectionRef   = useRef(null)
  const containerRef = useRef(null)
  const trackRef     = useRef(null)
  const titleRef     = useRef(null)
  const projectsRef  = useRef(null)
  const progressRef  = useRef(null)
  const progressBarRef = useRef(null)
  const { projects } = useProjects()

  // ── Drag state ──────────────────────────────────────────────────
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 })

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.matchMedia('(max-width:768px)').matches

      // ── Title: "Selected" char-by-char ──────────────────────────
      const selectedEl = titleRef.current?.querySelector('.t-selected')
      const projectsEl = titleRef.current?.querySelector('.t-projects')

      if (selectedEl) {
        const chars = selectedEl.textContent.split('')
        selectedEl.innerHTML = chars.map(c =>
          `<span style="display:inline-block;overflow:hidden;vertical-align:bottom"><span style="display:inline-block">${c === ' ' ? '&nbsp;' : c}</span></span>`
        ).join('')

        gsap.fromTo(
          selectedEl.querySelectorAll('span > span'),
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0, opacity: 1,
            duration: 0.75, stagger: 0.04, ease: 'power4.out',
            scrollTrigger: { trigger: titleRef.current, start: 'top 88%' },
          }
        )
      }

      // "Projects" — blur reveal + idle float
      if (projectsEl) {
        gsap.fromTo(projectsEl,
          { opacity: 0, x: -40, filter: 'blur(12px)' },
          {
            opacity: 1, x: 0, filter: 'blur(0px)',
            duration: 1.2, ease: 'power3.out', delay: 0.3,
            scrollTrigger: { trigger: titleRef.current, start: 'top 88%' },
            onComplete: () => {
              gsap.to(projectsEl, {
                y: -7, duration: 3.2, repeat: -1, yoyo: true, ease: 'sine.inOut',
              })
              gsap.to(projectsEl, {
                WebkitTextStroke: '1px rgba(200,200,200,0.42)',
                duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.5,
              })
            },
          }
        )
      }

      if (!isMobile) {
        const track = trackRef.current
        if (!track) return
        const scrollDist = track.scrollWidth - (containerRef.current?.offsetWidth || 0) + 80

        // ── Horizontal scroll pin ──────────────────────────────────
        const st = ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top top',
          end: () => `+=${scrollDist + window.innerHeight * 0.5}`,
          scrub: 1.5,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Progress bar
            if (progressBarRef.current) {
              progressBarRef.current.style.transform = `scaleX(${self.progress})`
            }

            // Active card highlight
            const cards = track.querySelectorAll('.project-card')
            const cx    = window.innerWidth / 2
            cards.forEach(card => {
              const r    = card.getBoundingClientRect()
              const cardCx = r.left + r.width / 2
              const dist   = Math.abs(cardCx - cx)
              const maxD   = window.innerWidth * 0.6
              const t      = Math.max(0, 1 - dist / maxD)
              // brightness + scale based on proximity to center
              card.style.filter    = `brightness(${0.45 + t * 0.55})`
              card.style.transform = `scale(${0.94 + t * 0.06})`
            })
          },
        })

        gsap.to(track, {
          x: -scrollDist,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: () => `+=${scrollDist + window.innerHeight * 0.5}`,
            scrub: 1.5,
            invalidateOnRefresh: true,
          },
        })

        // Cards entrance — clipPath wipe
        gsap.fromTo(track.querySelectorAll('.project-card'),
          { opacity: 0, y: 60, clipPath: 'inset(100% 0% 0% 0%)' },
          {
            opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1, stagger: 0.12, ease: 'power4.out',
            scrollTrigger: { trigger: containerRef.current, start: 'top 80%', once: true },
          }
        )
      } else {
        gsap.fromTo(trackRef.current?.querySelectorAll('.project-card'),
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out',
            scrollTrigger: { trigger: trackRef.current, start: 'top 80%' },
          }
        )
      }
    }, sectionRef)

    // ── Drag to scroll (desktop) ─────────────────────────────────
    const container = containerRef.current
    if (!container || window.innerWidth <= 768) return () => ctx.revert()

    const onMouseDown = (e) => {
      drag.current.active     = true
      drag.current.startX     = e.clientX
      drag.current.scrollLeft = gsap.getProperty(trackRef.current, 'x') || 0
      container.style.cursor  = 'grabbing'
    }
    const onMouseMove = (e) => {
      if (!drag.current.active) return
      const dx   = e.clientX - drag.current.startX
      const newX = drag.current.scrollLeft + dx
      const track = trackRef.current
      if (!track) return
      const maxX = -(track.scrollWidth - container.offsetWidth + 80)
      const clampedX = Math.max(maxX, Math.min(0, newX))
      gsap.to(track, { x: clampedX, duration: 0.1, ease: 'none', overwrite: true })
    }
    const onMouseUp = () => {
      drag.current.active    = false
      container.style.cursor = 'grab'
    }

    container.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove',    onMouseMove)
    window.addEventListener('mouseup',      onMouseUp)
    container.style.cursor = 'grab'

    return () => {
      ctx.revert()
      container.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove',    onMouseMove)
      window.removeEventListener('mouseup',      onMouseUp)
    }
  }, [projects])

  return (
    <section ref={sectionRef} id="projects" style={{ background: '#080808' }}>

      {/* Header */}
      <div className="px-8 md:px-16 lg:px-24 pt-24 md:pt-36 pb-12 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <span className="font-mono text-[9px] text-silver/40 uppercase tracking-[0.4em]">05 / Work</span>
          <div className="h-px w-12 bg-ink-border" />
        </div>

        <div ref={titleRef} className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="overflow-hidden">
              <h2
                className="t-selected leading-[0.88] text-white uppercase"
                style={{ fontFamily: "'Anton',sans-serif", fontSize: 'clamp(56px,10vw,160px)' }}
              >
                Selected
              </h2>
            </div>
            <h2
              className="t-projects leading-[0.88]"
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontStyle: 'italic', fontWeight: 300,
                fontSize: 'clamp(56px,10vw,160px)',
                color: 'transparent',
                WebkitTextStroke: '1px rgba(200,200,200,0.25)',
                opacity: 0,
                willChange: 'transform, opacity, filter',
              }}
            >
              Projects
            </h2>
          </div>

          <div className="max-w-xs">
            <p className="font-body text-silver-dim/50 text-sm leading-relaxed font-light mb-3">
              A curated collection of work spanning full-stack engineering and creative technology.
            </p>
            <span className="font-mono text-[9px] text-silver-dim/30 uppercase tracking-wider">
              — Drag or scroll to traverse —
            </span>
          </div>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div
        ref={progressRef}
        className="mx-8 md:mx-16 lg:mx-24 mb-8 h-px bg-ink-border overflow-hidden"
      >
        <div
          ref={progressBarRef}
          className="h-full origin-left"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(200,200,200,0.6) 40%, rgba(200,200,200,0.9) 60%, transparent)',
            transform: 'scaleX(0)',
          }}
        />
      </div>

      {/* ── Pinnable track ── */}
      <div ref={containerRef} className="horizontal-scroll-container overflow-hidden">
        <div
          ref={trackRef}
          className="flex items-end gap-5 px-8 md:px-16 lg:px-24 pb-24 md:pb-36 pt-4 md:flex-nowrap flex-wrap"
          style={{ willChange: 'transform' }}
        >
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} trackRef={trackRef} />
          ))}

          {/* ── CTA end card ── */}
          <div
            className="project-card flex-shrink-0 w-[260px] md:w-[300px] border border-ink-border
                       flex flex-col items-center justify-center p-10 gap-6 opacity-0
                       group hover:border-silver/20 transition-colors duration-500"
            style={{ aspectRatio: '3/4' }}
          >
            {/* Animated plus */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 border border-ink-border group-hover:border-silver/30
                              rotate-0 group-hover:rotate-45 transition-all duration-500" />
              <span
                className="font-light text-silver-dim/30 group-hover:text-silver/60 transition-colors duration-300 text-2xl"
                style={{ fontFamily: "'Cormorant Garamond',serif" }}
              >
                +
              </span>
            </div>

            <div className="text-center space-y-2">
              <div className="font-mono text-[10px] text-silver-dim/30 group-hover:text-silver/50
                              uppercase tracking-widest transition-colors duration-300">
                Have a project?
              </div>
              <button
                onClick={() => document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 font-mono text-[10px] text-silver/20
                           group-hover:text-silver/70 uppercase tracking-wider transition-colors duration-300
                           hover:gap-3"
              >
                Start here <ArrowUpRight size={10} />
              </button>
            </div>

            {/* Corner marks */}
            <span className="absolute top-3 left-3 w-3 h-3 border-t border-l border-silver/10 group-hover:border-silver/25 transition-colors duration-500" />
            <span className="absolute top-3 right-3 w-3 h-3 border-t border-r border-silver/10 group-hover:border-silver/25 transition-colors duration-500" />
            <span className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-silver/10 group-hover:border-silver/25 transition-colors duration-500" />
            <span className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-silver/10 group-hover:border-silver/25 transition-colors duration-500" />
          </div>
        </div>
      </div>
    </section>
  )
}
