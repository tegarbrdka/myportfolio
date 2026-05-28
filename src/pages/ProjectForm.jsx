import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { ArrowLeft, Plus, X, Upload, CheckCircle, AlertCircle, Star } from 'lucide-react'
import gsap from 'gsap'

const CATEGORIES = ['Full-Stack', 'Frontend', 'Backend', 'Mobile', 'Web3', 'Data Viz', 'Creative Tools', 'Streaming', 'AI/ML', 'DevOps']

const emptyForm = {
  title: '',
  description: '',
  techStack: [],
  imageUrl: '',
  projectLink: '',
  liveLink: '',
  category: 'Full-Stack',
  featured: false,
}

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('')

  const add = () => {
    const val = input.trim()
    if (val && !tags.includes(val)) {
      onChange([...tags, val])
    }
    setInput('')
  }

  const remove = (tag) => onChange(tags.filter(t => t !== tag))

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="e.g. React, Node.js..."
          className="admin-input flex-1"
        />
        <button type="button" onClick={add} className="admin-btn-ghost px-4">
          <Plus size={14} />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1.5 bg-void-mid border border-void-border text-gray-300 font-mono text-xs px-3 py-1.5">
              {tag}
              <button type="button" onClick={() => remove(tag)} className="text-gray-600 hover:text-red-400 transition-colors">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function ImagePreview({ url }) {
  const [valid, setValid] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!url) { setValid(false); return }
    setLoading(true)
    const img = new Image()
    img.onload = () => { setValid(true); setLoading(false) }
    img.onerror = () => { setValid(false); setLoading(false) }
    img.src = url
  }, [url])

  if (!url) return null

  return (
    <div className="mt-3 aspect-video bg-void-mid border border-void-border overflow-hidden relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border border-cyber-lime border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {valid && !loading && (
        <img src={url} alt="Preview" className="w-full h-full object-cover" />
      )}
      {!valid && !loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle size={20} className="text-gray-700 mx-auto mb-2" />
            <span className="font-mono text-[10px] text-gray-700">Invalid image URL</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProjectForm() {
  const { id } = useParams()
  const isNew = id === 'new'
  const { addProject, updateProject, getProjectById, isAuthenticated } = useProjects()
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState({})
  const cardRef    = useRef(null)
  const fileImgRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/admin'); return }
    if (!isNew) {
      const project = getProjectById(id)
      if (project) setForm({ ...emptyForm, ...project })
      else navigate('/admin/dashboard')
    }
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.1 }
    )
  }, [id, isNew, isAuthenticated])

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.description.trim()) errs.description = 'Description is required'
    if (form.techStack.length === 0) errs.techStack = 'Add at least one technology'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setSaving(true)
    await new Promise(r => setTimeout(r, 500))

    if (isNew) {
      addProject(form)
    } else {
      updateProject(id, form)
    }

    setSaved(true)
    setSaving(false)

    setTimeout(() => navigate('/admin/dashboard'), 1000)
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-void/90 backdrop-blur border-b border-void-border px-6 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/dashboard" className="flex items-center gap-2 font-mono text-xs text-gray-600 hover:text-gray-300 transition-colors uppercase tracking-wider">
            <ArrowLeft size={12} /> Dashboard
          </Link>
          <span className="text-void-border">/</span>
          <span className="font-mono text-xs text-gray-400 uppercase tracking-wider">
            {isNew ? 'New Project' : 'Edit Project'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="admin-btn-ghost py-2 px-4"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || saved}
            className="admin-btn-primary py-2 px-6 flex items-center gap-2 disabled:opacity-70"
          >
            {saved ? (
              <><CheckCircle size={14} /> Saved!</>
            ) : saving ? (
              <><div className="w-3 h-3 border border-black border-t-transparent rounded-full animate-spin" /> Saving...</>
            ) : (
              isNew ? 'Publish Project' : 'Save Changes'
            )}
          </button>
        </div>
      </header>

      <div ref={cardRef} className="max-w-4xl mx-auto px-6 md:px-8 py-10 opacity-0">
        <div className="mb-8">
          <h1 className="font-display text-4xl uppercase text-white tracking-wider">
            {isNew ? 'New Project' : `Edit: ${form.title || '—'}`}
          </h1>
          <p className="font-mono text-xs text-gray-600 mt-1">
            {isNew ? 'Fill in the details to add a new project to your portfolio.' : 'Update the project information below.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <label className="block font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => set('title', e.target.value.toUpperCase())}
                  placeholder="VOID MARKET"
                  className={`admin-input ${errors.title ? 'border-red-500/50' : ''}`}
                />
                {errors.title && <p className="font-mono text-[10px] text-red-400 mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Brief project description..."
                  rows={4}
                  className={`admin-input resize-none ${errors.description ? 'border-red-500/50' : ''}`}
                />
                {errors.description && <p className="font-mono text-[10px] text-red-400 mt-1">{errors.description}</p>}
                <p className="font-mono text-[9px] text-gray-700 mt-1">{form.description.length} / 300 chars</p>
              </div>

              {/* Tech Stack */}
              <div>
                <label className="block font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">
                  Tech Stack * <span className="text-gray-700">(press Enter to add)</span>
                </label>
                <TagInput tags={form.techStack} onChange={v => set('techStack', v)} />
                {errors.techStack && <p className="font-mono text-[10px] text-red-400 mt-1">{errors.techStack}</p>}
              </div>

              {/* Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={form.projectLink}
                    onChange={e => set('projectLink', e.target.value)}
                    placeholder="https://github.com/..."
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={form.liveLink}
                    onChange={e => set('liveLink', e.target.value)}
                    placeholder="https://..."
                    className="admin-input"
                  />
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Category */}
              <div>
                <label className="block font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  className="admin-input"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Image — upload or URL */}
              <div>
                <label className="block font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">
                  Screenshot / Image
                </label>

                {/* Upload button */}
                <div className="flex gap-2 mb-2">
                  <input
                    ref={fileImgRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      // Warn if file is large
                      if (file.size > 2 * 1024 * 1024) {
                        alert('File is large (>2MB). It will be stored as base64 — consider compressing first.')
                      }
                      const reader = new FileReader()
                      reader.onload = ev => set('imageUrl', ev.target.result)
                      reader.readAsDataURL(file)
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileImgRef.current?.click()}
                    className="admin-btn-ghost flex items-center gap-2 flex-1"
                  >
                    <Upload size={13} /> Upload Screenshot
                  </button>
                  {form.imageUrl?.startsWith('data:') && (
                    <button
                      type="button"
                      onClick={() => set('imageUrl', '')}
                      className="admin-btn-ghost px-3 text-red-400 hover:text-red-300"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Or URL */}
                <div className="relative">
                  <input
                    type="text"
                    value={form.imageUrl?.startsWith('data:') ? '' : form.imageUrl}
                    onChange={e => set('imageUrl', e.target.value)}
                    placeholder="Or paste image URL: https://..."
                    className="admin-input"
                    disabled={form.imageUrl?.startsWith('data:')}
                  />
                </div>

                <p className="font-mono text-[9px] text-gray-700 mt-1">
                  {form.imageUrl?.startsWith('data:')
                    ? '✓ Local file uploaded (stored as base64)'
                    : 'Upload a screenshot or paste any image URL'}
                </p>
                <ImagePreview url={form.imageUrl} />
              </div>

              {/* Featured */}
              <div>
                <label className="block font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-2">
                  Options
                </label>
                <button
                  type="button"
                  onClick={() => set('featured', !form.featured)}
                  className={`w-full flex items-center gap-3 p-3 border transition-all ${
                    form.featured
                      ? 'border-cyber-lime/40 bg-cyber-lime/5 text-cyber-lime'
                      : 'border-void-border text-gray-500 hover:border-gray-600'
                  }`}
                >
                  <Star size={13} className={form.featured ? 'fill-cyber-lime' : ''} />
                  <span className="font-mono text-xs uppercase tracking-wider">
                    {form.featured ? 'Featured Project' : 'Mark as Featured'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
