import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { Eye, EyeOff, Terminal, ArrowLeft, AlertCircle } from 'lucide-react'
import gsap from 'gsap'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useProjects()
  const navigate = useNavigate()
  const cardRef = useRef(null)
  const formRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard')
      return
    }
    // Entrance animation
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 }
    )
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(username, password)
    if (result.success) {
      gsap.to(cardRef.current, {
        borderColor: '#CCFF00',
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        onComplete: () => navigate('/admin/dashboard'),
      })
    } else {
      setError(result.error)
      gsap.to(formRef.current, {
        x: [-10, 10, -8, 8, -4, 4, 0],
        duration: 0.5,
        ease: 'power1.inOut',
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(204,255,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(204,255,0,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, #CCFF00 0%, transparent 70%)' }}
      />

      <div ref={cardRef} className="relative z-10 w-full max-w-md opacity-0">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-xs text-gray-600 hover:text-gray-300 transition-colors uppercase tracking-wider mb-8"
        >
          <ArrowLeft size={12} /> Back to Portfolio
        </Link>

        {/* Card */}
        <div className="bg-void-light border border-void-border p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-void-border">
            <div className="w-10 h-10 bg-cyber-lime flex items-center justify-center">
              <Terminal size={16} className="text-black" />
            </div>
            <div>
              <h1 className="font-display text-2xl tracking-wider text-white uppercase">Admin Panel</h1>
              <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest">Tegar Baradika CMS v1.0</p>
            </div>
          </div>

          

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                className="admin-input"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="admin-input pr-12"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 font-mono text-xs">
                <AlertCircle size={12} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="admin-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border border-black border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Access Panel'
              )}
            </button>
          </form>
        </div>

        <p className="text-center font-mono text-[10px] text-gray-700 mt-4 uppercase tracking-widest">
          Restricted Area — Authorized Users Only
        </p>
      </div>
    </div>
  )
}
