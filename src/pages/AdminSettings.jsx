import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import {
  ArrowLeft, Save, Plus, Trash2, Home, LayoutGrid,
  Settings, User, BarChart2, Clock, Lock, CheckCircle,
  AlertCircle, Upload, X, Crop, Loader
} from 'lucide-react'
import gsap from 'gsap'
import ImageCropper from '../components/ui/ImageCropper'
import { supabase } from '../lib/supabase'

// ── Upload cropped base64 → Supabase Storage, return public URL ───
async function uploadToStorage(base64DataUrl, filename) {
  // Convert base64 → Blob
  const res      = await fetch(base64DataUrl)
  const blob     = await res.blob()
  const ext      = blob.type.includes('png') ? 'png' : 'jpg'
  const path     = `${filename}-${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('photos')
    .upload(path, blob, { upsert: true, contentType: blob.type })

  if (error) throw error

  const { data } = supabase.storage.from('photos').getPublicUrl(path)
  return data.publicUrl
}

// ── Sidebar nav items ─────────────────────────────────────────────
const NAV = [
  { id: 'profile',    icon: User,     label: 'Profile' },
  { id: 'photo',      icon: Upload,   label: 'Photo' },
  { id: 'stats',      icon: BarChart2,label: 'Stats' },
  { id: 'milestones', icon: Clock,    label: 'Milestones' },
  { id: 'password',   icon: Lock,     label: 'Password' },
]

// ── Toast notification ────────────────────────────────────────────
function Toast({ msg, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 border font-mono text-xs uppercase tracking-wider
      ${type === 'success'
        ? 'bg-void-light border-cyber-lime/40 text-cyber-lime'
        : 'bg-void-light border-red-500/40 text-red-400'}`}>
      {type === 'success' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
      {msg}
    </div>
  )
}

export default function AdminSettings() {
  const navigate = useNavigate()
  const {
    isAuthenticated, profile, updateProfile,
    stats, updateStats,
    milestones, addMilestone, deleteMilestone, updateMilestones,
    changePassword,
  } = useProjects()

  const [tab, setTab]     = useState('profile')
  const [toast, setToast] = useState(null)
  const contentRef        = useRef(null)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/admin'); return }
    gsap.fromTo(contentRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
    )
  }, [isAuthenticated, navigate])

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  // ── Profile state ─────────────────────────────────────────────
  const [prof, setProf] = useState({ ...profile })
  const saveProfile = () => {
    updateProfile(prof)
    showToast('Profile saved')
  }

  // ── Photo state (Hero) ────────────────────────────────────────
  const [heroPreview,   setHeroPreview]   = useState(profile.photoUrl)
  const [heroInput,     setHeroInput]     = useState(profile.photoUrl)
  const [heroUploading, setHeroUploading] = useState(false)
  const heroFileRef  = useRef(null)
  const [heroCropSrc, setHeroCropSrc] = useState(null)

  const handleHeroUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setHeroCropSrc(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleHeroCropped = (cropped) => {
    setHeroPreview(cropped)
    setHeroInput(cropped)   // temp base64 for preview
    setHeroCropSrc(null)
  }

  const saveHeroPhoto = async () => {
    try {
      setHeroUploading(true)
      let url = heroInput
      // If it's base64, upload to Storage first
      if (heroInput.startsWith('data:')) {
        url = await uploadToStorage(heroInput, 'hero')
        setHeroPreview(url)
        setHeroInput(url)
      }
      await updateProfile({ photoUrl: url })
      showToast('Hero photo updated')
    } catch (err) {
      showToast('Upload failed: ' + err.message, 'error')
    } finally {
      setHeroUploading(false)
    }
  }

  // ── Photo state (About) ───────────────────────────────────────
  const [aboutPreview,   setAboutPreview]   = useState(profile.aboutPhotoUrl || profile.photoUrl)
  const [aboutInput,     setAboutInput]     = useState(profile.aboutPhotoUrl || profile.photoUrl)
  const [aboutUploading, setAboutUploading] = useState(false)
  const aboutFileRef  = useRef(null)
  const [aboutCropSrc, setAboutCropSrc] = useState(null)

  const handleAboutUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAboutCropSrc(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleAboutCropped = (cropped) => {
    setAboutPreview(cropped)
    setAboutInput(cropped)
    setAboutCropSrc(null)
  }

  const saveAboutPhoto = async () => {
    try {
      setAboutUploading(true)
      let url = aboutInput
      if (aboutInput.startsWith('data:')) {
        url = await uploadToStorage(aboutInput, 'about')
        setAboutPreview(url)
        setAboutInput(url)
      }
      await updateProfile({ aboutPhotoUrl: url })
      showToast('About photo updated')
    } catch (err) {
      showToast('Upload failed: ' + err.message, 'error')
    } finally {
      setAboutUploading(false)
    }
  }

  // ── Stats state ───────────────────────────────────────────────
  const [localStats, setLocalStats] = useState(stats.map(s => ({ ...s })))
  const saveStats = () => {
    updateStats(localStats)
    showToast('Stats saved')
  }

  // ── Milestones state ──────────────────────────────────────────
  const [localMilestones, setLocalMilestones] = useState(milestones.map(m => ({ ...m })))
  const [newMilestone, setNewMilestone] = useState({ year: new Date().getFullYear().toString(), text: '', link: '' })

  const saveMilestones = () => {
    updateMilestones(localMilestones)
    showToast('Milestones saved')
  }

  const handleAddMilestone = () => {
    if (!newMilestone.text.trim()) return
    const m = { ...newMilestone, id: Date.now().toString() }
    const updated = [m, ...localMilestones]
    setLocalMilestones(updated)
    updateMilestones(updated)
    setNewMilestone({ year: new Date().getFullYear().toString(), text: '', link: '' })
    showToast('Milestone added')
  }

  const handleDeleteMilestone = (id) => {
    const updated = localMilestones.filter(m => m.id !== id)
    setLocalMilestones(updated)
    updateMilestones(updated)
    showToast('Milestone removed')
  }

  // ── Password state ────────────────────────────────────────────
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const savePassword = () => {
    if (pw.next !== pw.confirm) { showToast('Passwords do not match', 'error'); return }
    if (pw.next.length < 6)    { showToast('Min 6 characters', 'error'); return }
    const result = changePassword(pw.current, pw.next)
    if (result.success) {
      showToast('Password changed')
      setPw({ current: '', next: '', confirm: '' })
    } else {
      showToast(result.error, 'error')
    }
  }

  return (
    <div className="min-h-screen bg-void flex">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Image Croppers ── */}
      {heroCropSrc && (
        <ImageCropper
          src={heroCropSrc}
          aspectRatio={3 / 4}
          label="Crop Hero Photo"
          onCrop={handleHeroCropped}
          onCancel={() => setHeroCropSrc(null)}
        />
      )}
      {aboutCropSrc && (
        <ImageCropper
          src={aboutCropSrc}
          aspectRatio={3 / 4}
          label="Crop About Photo"
          onCrop={handleAboutCropped}
          onCancel={() => setAboutCropSrc(null)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-56 bg-void-light border-r border-void-border z-40 flex flex-col">
        <div className="p-4 md:p-5 border-b border-void-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyber-lime flex items-center justify-center flex-shrink-0">
              <span className="text-black font-display text-lg leading-none">T</span>
            </div>
            <span className="hidden md:block font-display text-lg tracking-widest text-white">TEGAR</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <div className="hidden md:block font-mono text-[9px] text-gray-700 uppercase tracking-widest px-3 pt-2 pb-1">
            Settings
          </div>
          {NAV.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
                tab === id
                  ? 'bg-cyber-lime/10 text-cyber-lime'
                  : 'text-gray-500 hover:text-white hover:bg-void-mid'
              }`}
            >
              <Icon size={15} />
              <span className="hidden md:block font-mono text-xs uppercase tracking-wider">{label}</span>
            </button>
          ))}

          <div className="pt-3 border-t border-void-border mt-3">
            <Link to="/admin/dashboard"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-gray-500 hover:text-white hover:bg-void-mid transition-colors">
              <LayoutGrid size={15} />
              <span className="hidden md:block font-mono text-xs uppercase tracking-wider">Projects</span>
            </Link>
            <Link to="/"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-gray-500 hover:text-white hover:bg-void-mid transition-colors">
              <Home size={15} />
              <span className="hidden md:block font-mono text-xs uppercase tracking-wider">Portfolio</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* ── Main ── */}
      <main className="ml-16 md:ml-56 flex-1 p-6 md:p-10">
        <div ref={contentRef} className="max-w-2xl mx-auto opacity-0">

          {/* ── PROFILE ── */}
          {tab === 'profile' && (
            <div>
              <h1 className="font-display text-3xl uppercase text-white tracking-wider mb-2">Profile</h1>
              <p className="font-mono text-xs text-gray-600 mb-8">Edit your name, title, bio, and contact info.</p>

              <div className="space-y-5">
                {[
                  { key: 'name',      label: 'Full Name',          placeholder: 'Tegar Baradika' },
                  { key: 'title',     label: 'Title (Card)',        placeholder: 'Full-Stack Developer' },
                  { key: 'role',      label: 'Role (Card sub)',     placeholder: 'Creative Technologist' },
                  { key: 'badge',     label: 'Hero Badge Text',     placeholder: 'Full-Stack Developer & Creative Technologist' },
                  { key: 'email',     label: 'Email',               placeholder: 'tegarbrdka@gmail.com' },
                  { key: 'instagram', label: 'Instagram URL',       placeholder: 'https://instagram.com/brdka_' },
                  { key: 'github',    label: 'GitHub URL',          placeholder: 'https://github.com/...' },
                  { key: 'linkedin',  label: 'LinkedIn URL',        placeholder: 'https://linkedin.com/in/...' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">{label}</label>
                    <input
                      type="text"
                      value={prof[key] || ''}
                      onChange={e => setProf(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="admin-input"
                    />
                  </div>
                ))}

                <div>
                  <label className="block font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">Bio / About Text</label>
                  <textarea
                    rows={5}
                    value={prof.bio || ''}
                    onChange={e => setProf(p => ({ ...p, bio: e.target.value }))}
                    className="admin-input resize-none"
                    placeholder="Your bio..."
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">Philosophy Quote</label>
                  <input
                    type="text"
                    value={prof.quote || ''}
                    onChange={e => setProf(p => ({ ...p, quote: e.target.value }))}
                    className="admin-input"
                    placeholder="Code that's fast and beautiful..."
                  />
                </div>

                <button onClick={saveProfile} className="admin-btn-primary flex items-center gap-2">
                  <Save size={13} /> Save Profile
                </button>
              </div>
            </div>
          )}

          {/* ── PHOTO ── */}
          {tab === 'photo' && (
            <div>
              <h1 className="font-display text-3xl uppercase text-white tracking-wider mb-2">Photo</h1>
              <p className="font-mono text-xs text-gray-600 mb-8">Manage photos for Hero card and About section separately.</p>

              {/* ── Hero Photo ── */}
              <div className="mb-10 pb-10 border-b border-void-border">
                <div className="font-mono text-[10px] text-cyber-lime/70 uppercase tracking-widest mb-5">
                  Hero Section — ID Card
                </div>
                <p className="font-mono text-[10px] text-gray-600 mb-5">
                  Shown on the holographic card (top-right of hero).
                </p>

                {/* Preview + Crop button */}
                <div className="flex items-end gap-4 mb-5">
                  <div className="w-36 aspect-[3/4] overflow-hidden border border-void-border bg-void-mid relative flex-shrink-0">
                    {heroPreview ? (
                      <img src={heroPreview} alt="Hero preview" className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-mono text-xs text-gray-700">No photo</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 font-mono text-[8px] text-white/40 uppercase tracking-wider">Hero</div>
                  </div>
                  {heroPreview && (
                    <button
                      onClick={() => setHeroCropSrc(heroPreview)}
                      className="admin-btn-ghost flex items-center gap-2 self-start"
                    >
                      <Crop size={13} /> Crop / Reposition
                    </button>
                  )}
                </div>

                <input ref={heroFileRef} type="file" accept="image/*" onChange={handleHeroUpload} className="hidden" />
                <button onClick={() => heroFileRef.current?.click()} className="admin-btn-ghost flex items-center gap-2 mb-2">
                  <Upload size={13} /> Choose File
                </button>
                <p className="font-mono text-[9px] text-gray-700 mb-4">JPG, PNG, WebP — file opens crop tool automatically</p>

                <label className="block font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">Or paste image URL</label>
                <input
                  type="text"
                  value={heroInput.startsWith('data:') ? '' : heroInput}
                  onChange={e => { setHeroInput(e.target.value); setHeroPreview(e.target.value) }}
                  placeholder="/photo.png or https://..."
                  className="admin-input mb-4"
                />
                <button onClick={saveHeroPhoto} disabled={heroUploading} className="admin-btn-primary flex items-center gap-2 disabled:opacity-50">
                  {heroUploading ? <><Loader size={13} className="animate-spin" /> Uploading...</> : <><Save size={13} /> Save Hero Photo</>}
                </button>
              </div>

              {/* ── About Photo ── */}
              <div>
                <div className="font-mono text-[10px] text-cyber-lime/70 uppercase tracking-widest mb-5">
                  About Section — Profile Photo
                </div>
                <p className="font-mono text-[10px] text-gray-600 mb-5">
                  Shown in the About section (left column).
                </p>

                {/* Preview + Crop button */}
                <div className="flex items-end gap-4 mb-5">
                  <div className="w-36 aspect-[3/4] overflow-hidden border border-void-border bg-void-mid relative flex-shrink-0">
                    {aboutPreview ? (
                      <img src={aboutPreview} alt="About preview" className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-mono text-xs text-gray-700">No photo</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 font-mono text-[8px] text-white/40 uppercase tracking-wider">About</div>
                  </div>
                  {aboutPreview && (
                    <button
                      onClick={() => setAboutCropSrc(aboutPreview)}
                      className="admin-btn-ghost flex items-center gap-2 self-start"
                    >
                      <Crop size={13} /> Crop / Reposition
                    </button>
                  )}
                </div>

                <input ref={aboutFileRef} type="file" accept="image/*" onChange={handleAboutUpload} className="hidden" />
                <button onClick={() => aboutFileRef.current?.click()} className="admin-btn-ghost flex items-center gap-2 mb-2">
                  <Upload size={13} /> Choose File
                </button>
                <p className="font-mono text-[9px] text-gray-700 mb-4">JPG, PNG, WebP — file opens crop tool automatically</p>

                <label className="block font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">Or paste image URL</label>
                <input
                  type="text"
                  value={aboutInput.startsWith('data:') ? '' : aboutInput}
                  onChange={e => { setAboutInput(e.target.value); setAboutPreview(e.target.value) }}
                  placeholder="/photo.png or https://..."
                  className="admin-input mb-4"
                />
                <button onClick={saveAboutPhoto} disabled={aboutUploading} className="admin-btn-primary flex items-center gap-2 disabled:opacity-50">
                  {aboutUploading ? <><Loader size={13} className="animate-spin" /> Uploading...</> : <><Save size={13} /> Save About Photo</>}
                </button>
              </div>
            </div>
          )}

          {/* ── STATS ── */}
          {tab === 'stats' && (
            <div>
              <h1 className="font-display text-3xl uppercase text-white tracking-wider mb-2">Stats</h1>
              <p className="font-mono text-xs text-gray-600 mb-8">Edit the impact numbers shown in the Impact section.</p>

              <div className="space-y-4">
                {localStats.map((s, i) => (
                  <div key={s.id} className="bg-void-light border border-void-border p-5">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block font-mono text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">Value</label>
                        <input
                          type="number"
                          value={s.value}
                          onChange={e => {
                            const updated = [...localStats]
                            updated[i] = { ...s, value: Number(e.target.value) }
                            setLocalStats(updated)
                          }}
                          className="admin-input"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">Suffix</label>
                        <input
                          type="text"
                          value={s.suffix}
                          onChange={e => {
                            const updated = [...localStats]
                            updated[i] = { ...s, suffix: e.target.value }
                            setLocalStats(updated)
                          }}
                          className="admin-input"
                          placeholder="+ or % or k+"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">Bar %</label>
                        <input
                          type="number"
                          min="0" max="100"
                          value={s.bar}
                          onChange={e => {
                            const updated = [...localStats]
                            updated[i] = { ...s, bar: Number(e.target.value) }
                            setLocalStats(updated)
                          }}
                          className="admin-input"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block font-mono text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">Label</label>
                      <input
                        type="text"
                        value={s.label}
                        onChange={e => {
                          const updated = [...localStats]
                          updated[i] = { ...s, label: e.target.value }
                          setLocalStats(updated)
                        }}
                        className="admin-input"
                        placeholder="Years\nExperience"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={saveStats} className="admin-btn-primary flex items-center gap-2 mt-6">
                <Save size={13} /> Save Stats
              </button>
            </div>
          )}

          {/* ── MILESTONES ── */}
          {tab === 'milestones' && (
            <div>
              <h1 className="font-display text-3xl uppercase text-white tracking-wider mb-2">Milestones</h1>
              <p className="font-mono text-xs text-gray-600 mb-8">Manage your career timeline.</p>

              {/* Add new */}
              <div className="bg-void-light border border-void-border p-5 mb-6">
                <div className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-4">Add Milestone</div>
                <div className="grid grid-cols-4 gap-3 mb-3">
                  <div>
                    <label className="block font-mono text-[9px] text-gray-700 uppercase tracking-widest mb-1.5">Year</label>
                    <input
                      type="text"
                      value={newMilestone.year}
                      onChange={e => setNewMilestone(m => ({ ...m, year: e.target.value }))}
                      className="admin-input"
                      placeholder="2024"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block font-mono text-[9px] text-gray-700 uppercase tracking-widest mb-1.5">Description</label>
                    <input
                      type="text"
                      value={newMilestone.text}
                      onChange={e => setNewMilestone(m => ({ ...m, text: e.target.value }))}
                      className="admin-input"
                      placeholder="What did you achieve?"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block font-mono text-[9px] text-gray-700 uppercase tracking-widest mb-1.5">Link (optional)</label>
                  <input
                    type="url"
                    value={newMilestone.link}
                    onChange={e => setNewMilestone(m => ({ ...m, link: e.target.value }))}
                    className="admin-input"
                    placeholder="https://github.com/..."
                  />
                </div>
                <button onClick={handleAddMilestone} className="admin-btn-primary flex items-center gap-2">
                  <Plus size={13} /> Add
                </button>
              </div>

              {/* List */}
              <div className="space-y-2">
                {localMilestones.map((m, i) => (
                  <div key={m.id} className="flex items-start gap-4 border border-void-border p-4 group hover:border-void-border/80 transition-colors">
                    <div className="flex-shrink-0 font-mono text-[10px] text-gray-600 w-10 pt-0.5">{m.year}</div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={m.text}
                        onChange={e => {
                          const updated = [...localMilestones]
                          updated[i] = { ...m, text: e.target.value }
                          setLocalMilestones(updated)
                        }}
                        className="w-full bg-transparent font-mono text-xs text-gray-300 focus:outline-none focus:text-white transition-colors"
                      />
                      {m.link && (
                        <div className="font-mono text-[9px] text-gray-700 mt-0.5 truncate">{m.link}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteMilestone(m.id)}
                      className="flex-shrink-0 text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={saveMilestones} className="admin-btn-primary flex items-center gap-2 mt-6">
                <Save size={13} /> Save Milestones
              </button>
            </div>
          )}

          {/* ── PASSWORD ── */}
          {tab === 'password' && (
            <div>
              <h1 className="font-display text-3xl uppercase text-white tracking-wider mb-2">Password</h1>
              <p className="font-mono text-xs text-gray-600 mb-8">Change your admin panel password.</p>

              <div className="space-y-5 max-w-sm">
                <div>
                  <label className="block font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">Current Password</label>
                  <input
                    type="password"
                    value={pw.current}
                    onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
                    className="admin-input"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">New Password</label>
                  <input
                    type="password"
                    value={pw.next}
                    onChange={e => setPw(p => ({ ...p, next: e.target.value }))}
                    className="admin-input"
                    placeholder="Min 6 characters"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={pw.confirm}
                    onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                    className="admin-input"
                    placeholder="Repeat new password"
                  />
                </div>
                <button onClick={savePassword} className="admin-btn-primary flex items-center gap-2">
                  <Lock size={13} /> Change Password
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
