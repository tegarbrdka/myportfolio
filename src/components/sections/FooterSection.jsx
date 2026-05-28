import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { Github, Linkedin, Instagram, Mail, ArrowUpRight, ArrowUp } from 'lucide-react'
import { useProjects } from '../../context/ProjectContext'

gsap.registerPlugin(ScrollTrigger)

export default function FooterSection() {
  const { profile } = useProjects()

  // Build socials dynamically from profile
  const socials = [
    { icon: Github,    label: 'GitHub',    sub: profile.github?.replace('https://github.com/', '@') || '@tegarbaradika',   href: profile.github    || 'https://github.com/tegarbaradika' },
    { icon: Linkedin,  label: 'LinkedIn',  sub: profile.name  || 'Tegar Baradika',                                          href: profile.linkedin  || 'https://linkedin.com/in/tegarbaradika' },
    { icon: Instagram, label: 'Instagram', sub: profile.instagram?.replace('https://instagram.com/', '@') || '@brdka_',     href: profile.instagram || 'https://instagram.com/brdka_' },
    { icon: Mail,      label: 'Email',     sub: profile.email || 'tegarbrdka@gmail.com',                                    href: `mailto:${profile.email || 'tegarbrdka@gmail.com'}` },
  ]
  const sectionRef  = useRef(null)
  const curtainRef  = useRef(null)
  const contentRef  = useRef(null)
  const bigRef      = useRef(null)
  const titleRef    = useRef(null)
  const emailRef    = useRef(null)
  const backTopRef  = useRef(null)

  const [form, setForm]       = useState({ name: '', email: '', message: '' })
  const [showForm, setShowForm] = useState(false)
  const [sent, setSent]       = useState(false)
  const formRef = useRef(null)

  // ── Back to top visibility ──────────────────────────────────────
  const [showBack, setShowBack] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowBack(window.scrollY > window.innerHeight)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Form toggle animation ───────────────────────────────────────
  useEffect(() => {
    if (!formRef.current) return
    if (showForm) {
      gsap.fromTo(formRef.current,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.5, ease: 'power3.out' }
      )
    } else {
      gsap.to(formRef.current, { height: 0, opacity: 0, duration: 0.35, ease: 'power3.in' })
    }
  }, [showForm])

  // ── Submit: build mailto URL ────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault()
    const email   = profile.email || 'tegarbrdka@gmail.com'
    const subject = encodeURIComponent(`Portfolio inquiry from ${form.name}`)
    const body    = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
    )
    window.open(`mailto:${email}?subject=${subject}&body=${body}`)
    setSent(true)
    setTimeout(() => { setSent(false); setShowForm(false); setForm({ name: '', email: '', message: '' }) }, 3000)
  }

  // ── GSAP animations ─────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.matchMedia('(max-width:768px)').matches

      // Curtain unveil
      if (!isMobile) {
        gsap.fromTo(curtainRef.current,
          { yPercent: 0 },
          {
            yPercent: -100, ease: 'none',
            scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'top top', scrub: 1 },
          }
        )
      }

      // Watermark drift
      if (!isMobile && bigRef.current) {
        gsap.fromTo(bigRef.current,
          { xPercent: 4 },
          {
            xPercent: -4, ease: 'none',
            scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1.5 },
          }
        )
      }

      // Content items
      gsap.fromTo(contentRef.current?.querySelectorAll('.ft-item'),
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: contentRef.current, start: 'top 85%' },
        }
      )

      // ── Title: "GOT A" char-by-char ──────────────────────────────
      if (titleRef.current) {
        const gotEl     = titleRef.current.querySelector('.t-got')
        const projectEl = titleRef.current.querySelector('.t-project')

        if (gotEl) {
          const chars = gotEl.textContent.split('')
          gotEl.innerHTML = chars.map(c =>
            `<span style="display:inline-block;overflow:hidden;vertical-align:bottom"><span style="display:inline-block">${c === ' ' ? '&nbsp;' : c}</span></span>`
          ).join('')
          gsap.fromTo(
            gotEl.querySelectorAll('span > span'),
            { yPercent: 110, opacity: 0 },
            {
              yPercent: 0, opacity: 1,
              duration: 0.75, stagger: 0.05, ease: 'power4.out',
              scrollTrigger: { trigger: titleRef.current, start: 'top 88%' },
            }
          )
        }

        if (projectEl) {
          gsap.fromTo(projectEl,
            { opacity: 0, x: -40, filter: 'blur(12px)' },
            {
              opacity: 1, x: 0, filter: 'blur(0px)',
              duration: 1.2, ease: 'power3.out', delay: 0.3,
              scrollTrigger: { trigger: titleRef.current, start: 'top 88%' },
            }
          )
        }
      }

      // ── Email magnetic effect ────────────────────────────────────
      const emailEl = emailRef.current
      if (emailEl && !isMobile) {
        const onMove = (e) => {
          const r  = emailEl.getBoundingClientRect()
          const cx = r.left + r.width  / 2
          const cy = r.top  + r.height / 2
          const dx = (e.clientX - cx) / (r.width  / 2)
          const dy = (e.clientY - cy) / (r.height / 2)
          const dist = Math.sqrt(dx*dx + dy*dy)
          if (dist < 1.5) {
            gsap.to(emailEl, { x: dx * 12, y: dy * 6, duration: 0.4, ease: 'power2.out' })
          }
        }
        const onLeave = () => gsap.to(emailEl, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
        window.addEventListener('mousemove', onMove)
        emailEl.addEventListener('mouseleave', onLeave)
        return () => {
          window.removeEventListener('mousemove', onMove)
          emailEl.removeEventListener('mouseleave', onLeave)
        }
      }

    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <>
      {/* ── Back to top ── */}
      <button
        ref={backTopRef}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 z-50 w-10 h-10 border border-ink-border
                   flex items-center justify-center
                   hover:border-silver/40 hover:bg-white/5
                   transition-all duration-300 group"
        style={{
          opacity: showBack ? 1 : 0,
          transform: showBack ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.4s, transform 0.4s',
          pointerEvents: showBack ? 'auto' : 'none',
        }}
        aria-label="Back to top"
      >
        <ArrowUp size={13} className="text-silver/30 group-hover:text-silver/70 transition-colors" />
      </button>

      <section
        ref={sectionRef}
        id="footer"
        className="relative overflow-hidden"
        style={{ background: '#161616' }}
      >
        {/* Curtain */}
        <div ref={curtainRef} className="absolute inset-0 z-10 pointer-events-none" style={{ background: '#080808' }} />

        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #262626 40%, #262626 60%, transparent)' }}
        />

        {/* Watermark */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none select-none">
          <div ref={bigRef}
            className="whitespace-nowrap font-light leading-none"
            style={{
              fontFamily: "'Anton',sans-serif",
              fontSize: 'clamp(80px, 14vw, 200px)',
              color: 'transparent',
              WebkitTextStroke: '1px rgba(38,38,38,0.8)',
            }}>
            LET'S BUILD — TOGETHER —&nbsp;
          </div>
        </div>

        <div ref={contentRef} className="relative z-20 px-8 md:px-16 lg:px-24 pt-24 md:pt-36 pb-16 max-w-[1600px] mx-auto">

          {/* Label */}
          <div className="ft-item opacity-0 mb-12">
            <span className="font-mono text-[9px] text-silver/40 uppercase tracking-[0.4em]">06 / Contact</span>
          </div>

          {/* ── Title ── */}
          <div ref={titleRef} className="ft-item opacity-0 mb-10">
            <div className="overflow-hidden">
              <h2
                className="t-got leading-[0.88] text-white uppercase"
                style={{ fontFamily: "'Anton',sans-serif", fontSize: 'clamp(52px,10vw,160px)' }}
              >
                GOT A
              </h2>
            </div>
            <h2
              className="t-project leading-[0.88]"
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontStyle: 'italic', fontWeight: 300,
                fontSize: 'clamp(52px,10vw,160px)',
                color: 'transparent',
                WebkitTextStroke: '1px rgba(200,200,200,0.3)',
                opacity: 0,
                willChange: 'transform, opacity, filter',
              }}
            >
              Project?
            </h2>
          </div>

          {/* ── Email CTA ── */}
          <div className="ft-item opacity-0 mb-10">
            <a
              ref={emailRef}
              href={`mailto:${profile.email || 'tegarbrdka@gmail.com'}`}
              data-cursor="Mail"
              className="group inline-flex items-center gap-5"
              style={{ willChange: 'transform' }}
            >
              {/* Split text hover effect */}
              <div className="relative overflow-hidden" style={{ fontSize: 'clamp(20px,3vw,42px)' }}>
                <span className="block font-body font-light text-silver-dim/50
                                 group-hover:-translate-y-full transition-transform duration-400 ease-out">
                  {profile.email || 'tegarbrdka@gmail.com'}
                </span>
                <span className="absolute inset-0 block font-body font-light text-silver
                                 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out">
                  {profile.email || 'tegarbrdka@gmail.com'}
                </span>
              </div>
              <div className="w-10 h-10 border border-ink-border group-hover:bg-white group-hover:border-white
                              flex items-center justify-center transition-all duration-300">
                <ArrowUpRight size={16} className="text-silver-dim group-hover:text-ink transition-colors duration-300" />
              </div>
            </a>
          </div>

          {/* ── Contact form toggle ── */}
          <div className="ft-item opacity-0 mb-16 md:mb-24">
            <button
              onClick={() => setShowForm(v => !v)}
              className="group flex items-center gap-3 font-mono text-[10px] text-silver/30
                         hover:text-silver/60 uppercase tracking-[0.3em] transition-colors duration-300"
            >
              <span
                className="w-4 h-px bg-silver/20 group-hover:w-8 group-hover:bg-silver/50
                           transition-all duration-400"
              />
              {showForm ? 'Close form' : 'Or send a message'}
              <span className={`transition-transform duration-300 ${showForm ? 'rotate-45' : ''}`}>+</span>
            </button>

            {/* Form */}
            <div ref={formRef} style={{ height: 0, opacity: 0, overflow: 'hidden' }}>
              <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-[8px] text-silver/30 uppercase tracking-[0.2em] block mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your name"
                      className="w-full bg-transparent border border-ink-border px-4 py-3
                                 font-mono text-sm text-silver/70 placeholder-silver/20
                                 focus:outline-none focus:border-silver/30 transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[8px] text-silver/30 uppercase tracking-[0.2em] block mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="w-full bg-transparent border border-ink-border px-4 py-3
                                 font-mono text-sm text-silver/70 placeholder-silver/20
                                 focus:outline-none focus:border-silver/30 transition-colors duration-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-mono text-[8px] text-silver/30 uppercase tracking-[0.2em] block mb-2">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Tell me about your project..."
                    className="w-full bg-transparent border border-ink-border px-4 py-3
                               font-mono text-sm text-silver/70 placeholder-silver/20
                               focus:outline-none focus:border-silver/30 transition-colors duration-200
                               resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="group relative border border-ink-border text-silver font-mono text-[10px]
                             px-8 py-3 uppercase tracking-[0.3em] overflow-hidden
                             hover:border-white/40 transition-colors duration-300"
                >
                  <span className="absolute inset-0 bg-white translate-x-[-101%] group-hover:translate-x-0
                                   transition-transform duration-300 ease-out" />
                  <span className="relative z-10 group-hover:text-ink transition-colors duration-150">
                    {sent ? '✓ Opening email...' : 'Send message →'}
                  </span>
                </button>
              </form>
            </div>
          </div>

          {/* Divider */}
          <div className="ft-item opacity-0 h-px mb-10"
            style={{ background: 'linear-gradient(90deg, #262626, transparent)' }}
          />

          {/* ── Bottom row ── */}
          <div className="ft-item opacity-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

            {/* Monogram */}
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 border border-ink-border flex items-center justify-center">
                <span className="font-display text-xl font-light text-white"
                  style={{ fontFamily: "'Cormorant Garamond',serif" }}>T</span>
                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-silver/20" />
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-silver/20" />
              </div>
              <div>
                <div className="font-mono text-[10px] text-silver/50 tracking-[0.3em] uppercase">{profile.name}</div>
                <div className="font-mono text-[8px] text-silver/20 tracking-[0.2em] uppercase">Creative Tech Hub</div>
              </div>
            </div>

            {/* ── Socials with label ── */}
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, label, sub, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noreferrer"
                  aria-label={label}
                  className="group relative flex items-center gap-2 border border-ink-border
                             hover:border-silver/30 px-3 py-2 transition-all duration-300
                             overflow-hidden"
                >
                  <Icon size={12} className="text-silver-dim/30 group-hover:text-silver/60 transition-colors flex-shrink-0" />
                  {/* Label slides in on hover */}
                  <div className="max-w-0 group-hover:max-w-[120px] overflow-hidden transition-all duration-300 ease-out">
                    <span className="font-mono text-[8px] text-silver/50 uppercase tracking-wider whitespace-nowrap pl-0.5">
                      {sub}
                    </span>
                  </div>
                </a>
              ))}
            </div>

            <div className="font-mono text-[9px] text-silver/20 uppercase tracking-widest">
              © {new Date().getFullYear()} {profile.name}
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
