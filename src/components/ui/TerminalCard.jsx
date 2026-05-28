import { useEffect, useRef, useState } from 'react'

/**
 * TerminalCard — Retro terminal window that auto-types profile info
 * - Typewriter effect on mount (after preloader delay)
 * - Interactive: user can type commands
 * - Supported commands: whoami, skills, contact, clear, help
 * - Floats fixed at bottom-left of viewport
 */

const BOOT_SEQUENCE = [
  { delay: 0,    text: '> Initializing portfolio v3.0...',        color: 'rgba(100,200,120,0.7)' },
  { delay: 400,  text: '> Loading modules... OK',                  color: 'rgba(100,200,120,0.5)' },
  { delay: 800,  text: '$ whoami',                                 color: 'rgba(200,220,255,0.9)' },
  { delay: 1400, text: '  Tegar Baradika',                         color: '#ffffff' },
  { delay: 1700, text: '  Full-Stack Developer & Creative Tech',   color: 'rgba(180,200,255,0.7)' },
  { delay: 2100, text: '$ skills --top',                           color: 'rgba(200,220,255,0.9)' },
  { delay: 2700, text: '  React · Next.js · Node · TypeScript',    color: 'rgba(120,220,180,0.8)' },
  { delay: 3100, text: '  Three.js · GSAP · Tailwind · Postgres',  color: 'rgba(120,220,180,0.8)' },
  { delay: 3600, text: '$ status',                                  color: 'rgba(200,220,255,0.9)' },
  { delay: 4100, text: '  ● Available for freelance',              color: 'rgba(100,220,120,0.9)' },
  { delay: 4500, text: '─'.repeat(36),                             color: 'rgba(200,220,255,0.1)' },
  { delay: 4700, text: '  Type "help" for commands',               color: 'rgba(150,170,220,0.45)' },
]

const COMMANDS = {
  help: [
    '  Available commands:',
    '  whoami    — profile info',
    '  skills    — tech stack',
    '  contact   — get in touch',
    '  work      — selected projects',
    '  clear     — clear terminal',
  ],
  whoami: [
    '  Tegar Baradika',
    '  Full-Stack Developer & Creative Technologist',
    '  Based in Indonesia · Remote-first',
    '  5+ years building digital products',
  ],
  skills: [
    '  Frontend  : React, Next.js, TypeScript, GSAP',
    '  Backend   : Node.js, Express, PostgreSQL',
    '  Creative  : Three.js, WebGL, Canvas API',
    '  Tools     : Git, Docker, Figma, Vercel',
  ],
  contact: [
    '  Email  : tegar@example.com',
    '  GitHub : github.com/tegarbaradika',
    '  LinkedIn: linkedin.com/in/tegarbaradika',
  ],
  work: [
    '  → Portfolio Nexus v3  (this site)',
    '  → E-Commerce Platform  (Next.js + Stripe)',
    '  → Real-time Dashboard  (React + WebSocket)',
    '  → Creative Agency Site (Three.js + GSAP)',
  ],
}

export default function TerminalCard() {
  const [lines, setLines]       = useState([])
  const [input, setInput]       = useState('')
  const [active, setActive]     = useState(false)
  const [booted, setBooted]     = useState(false)
  const bottomRef               = useRef(null)
  const inputRef                = useRef(null)
  const timersRef               = useRef([])

  // Boot sequence typewriter
  useEffect(() => {
    // Wait for preloader (same delay as hero entrance ~3.2s)
    const startDelay = 3400

    BOOT_SEQUENCE.forEach(({ delay, text, color }) => {
      const t = setTimeout(() => {
        setLines(prev => [...prev, { text, color, id: Math.random() }])
        if (delay === BOOT_SEQUENCE[BOOT_SEQUENCE.length - 1].delay) {
          setBooted(true)
        }
      }, startDelay + delay)
      timersRef.current.push(t)
    })

    return () => timersRef.current.forEach(clearTimeout)
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  const handleCommand = (cmd) => {
    const trimmed = cmd.trim().toLowerCase()
    const echo = { text: `$ ${cmd}`, color: 'rgba(200,220,255,0.9)', id: Math.random() }

    if (trimmed === 'clear') {
      setLines([])
      return
    }

    const output = COMMANDS[trimmed]
    if (output) {
      setLines(prev => [
        ...prev,
        echo,
        ...output.map(t => ({ text: t, color: 'rgba(180,210,180,0.8)', id: Math.random() })),
      ])
    } else if (trimmed === '') {
      // do nothing
    } else {
      setLines(prev => [
        ...prev,
        echo,
        { text: `  command not found: ${trimmed}. Type "help"`, color: 'rgba(255,120,100,0.7)', id: Math.random() },
      ])
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommand(input)
      setInput('')
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '6vh',
        left: '3vw',
        zIndex: 15,
        width: 340,
        pointerEvents: 'auto',
      }}
      onClick={() => { setActive(true); inputRef.current?.focus() }}
    >
      {/* Window chrome */}
      <div style={{
        background: 'rgba(10,10,18,0.92)',
        border: `1px solid ${active ? 'rgba(100,180,255,0.3)' : 'rgba(200,220,255,0.1)'}`,
        borderRadius: 10,
        backdropFilter: 'blur(20px)',
        boxShadow: active
          ? '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(100,180,255,0.1) inset, 0 0 40px rgba(80,140,255,0.06)'
          : '0 20px 60px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}>

        {/* Title bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(200,220,255,0.06)',
        }}>
          {/* Traffic lights */}
          {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.8 }} />
          ))}
          <div style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9,
            letterSpacing: '0.2em',
            color: 'rgba(200,220,255,0.35)',
            textTransform: 'uppercase',
            marginRight: 30,
          }}>
            terminal — tegar@portfolio
          </div>
        </div>

        {/* Terminal body */}
        <div style={{
          height: 220,
          overflowY: 'auto',
          padding: '10px 14px',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          lineHeight: 1.7,
          scrollbarWidth: 'none',
        }}>
          {lines.map(line => (
            <div key={line.id} style={{ color: line.color, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {line.text}
            </div>
          ))}

          {/* Input row */}
          {booted && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <span style={{ color: 'rgba(100,200,120,0.8)' }}>$</span>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={() => setActive(true)}
                onBlur={() => setActive(false)}
                spellCheck={false}
                autoComplete="off"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'rgba(200,220,255,0.9)',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  caretColor: 'rgba(100,200,120,0.9)',
                }}
              />
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Glow underneath */}
      <div style={{
        position: 'absolute',
        bottom: -10, left: '10%', right: '10%',
        height: 20,
        background: 'radial-gradient(ellipse at 50% 100%, rgba(80,140,255,0.15), transparent 70%)',
        filter: 'blur(8px)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}
