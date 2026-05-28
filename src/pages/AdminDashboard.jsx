import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { Plus, Edit2, Trash2, LogOut, ExternalLink, Github, LayoutGrid, List, Home, Settings } from 'lucide-react'
import gsap from 'gsap'

function ConfirmModal({ project, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-void-light border border-void-border p-8 max-w-sm w-full z-10">
        <h3 className="font-display text-2xl uppercase text-white mb-2">Delete Project?</h3>
        <p className="font-mono text-xs text-gray-500 mb-6">
          "<span className="text-gray-300">{project?.title}</span>" will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500/20 border border-red-500/40 text-red-400 font-mono text-xs py-3 uppercase tracking-wider hover:bg-red-500/30 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="flex-1 admin-btn-ghost"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { projects, deleteProject, logout, isAuthenticated } = useProjects()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState('grid')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const headerRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin')
      return
    }
    gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
    gsap.fromTo(listRef.current?.children ? Array.from(listRef.current.children) : [],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.2 }
    )
  }, [isAuthenticated, navigate])

  const handleLogout = () => {
    logout()
    navigate('/admin')
  }

  const handleDelete = () => {
    if (deleteTarget) {
      deleteProject(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="min-h-screen bg-void">
      {deleteTarget && (
        <ConfirmModal
          project={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-56 bg-void-light border-r border-void-border z-40 flex flex-col">
        {/* Logo */}
        <div className="p-4 md:p-5 border-b border-void-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyber-lime flex items-center justify-center flex-shrink-0">
              <span className="text-black font-display text-lg leading-none">T</span>
            </div>
            <span className="hidden md:block font-display text-lg tracking-widest text-white">TEGAR</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          <div className="hidden md:block font-mono text-[9px] text-gray-700 uppercase tracking-widest px-3 pt-2 pb-1">
            Navigation
          </div>
          {[
            { icon: LayoutGrid, label: 'Projects', active: true },
          ].map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
                active
                  ? 'bg-cyber-lime/10 text-cyber-lime'
                  : 'text-gray-500 hover:text-white hover:bg-void-mid'
              }`}
            >
              <Icon size={15} />
              <span className="hidden md:block font-mono text-xs uppercase tracking-wider">{label}</span>
            </button>
          ))}

          <div className="pt-3">
            <Link
              to="/admin/settings"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-gray-500 hover:text-white hover:bg-void-mid transition-colors"
            >
              <Settings size={15} />
              <span className="hidden md:block font-mono text-xs uppercase tracking-wider">Settings</span>
            </Link>
            <Link
              to="/"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-gray-500 hover:text-white hover:bg-void-mid transition-colors"
            >
              <Home size={15} />
              <span className="hidden md:block font-mono text-xs uppercase tracking-wider">Portfolio</span>
            </Link>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-void-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:text-red-400 transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden md:block font-mono text-xs uppercase tracking-wider">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-16 md:ml-56 min-h-screen p-6 md:p-8">
        {/* Header */}
        <div ref={headerRef} className="flex items-center justify-between mb-8 opacity-0">
          <div>
            <h1 className="font-display text-3xl md:text-4xl uppercase text-white tracking-wider">Projects</h1>
            <p className="font-mono text-xs text-gray-600 mt-1">
              {projects.length} total · Last updated {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="hidden md:flex items-center border border-void-border rounded">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-void-mid text-white' : 'text-gray-600 hover:text-gray-400'}`}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-void-mid text-white' : 'text-gray-600 hover:text-gray-400'}`}
              >
                <List size={14} />
              </button>
            </div>
            <Link to="/admin/project/new" className="admin-btn-primary flex items-center gap-2">
              <Plus size={14} /> <span className="hidden md:inline">New Project</span>
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: projects.length },
            { label: 'Featured', value: projects.filter(p => p.featured).length },
            { label: 'This Year', value: projects.filter(p => p.year === new Date().getFullYear().toString()).length },
            { label: 'Categories', value: [...new Set(projects.map(p => p.category))].length },
          ].map(stat => (
            <div key={stat.label} className="bg-void-light border border-void-border p-4">
              <div className="font-display text-3xl text-cyber-lime">{stat.value}</div>
              <div className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Projects */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-void-border">
            <div className="font-display text-4xl text-gray-700 mb-3">EMPTY</div>
            <p className="font-mono text-xs text-gray-600 mb-6">No projects yet. Add your first one.</p>
            <Link to="/admin/project/new" className="admin-btn-primary flex items-center gap-2">
              <Plus size={14} /> Add Project
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div ref={listRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {projects.map((project) => (
              <div key={project.id} className="bg-void-light border border-void-border hover:border-void-border/80 transition-colors group opacity-0">
                {/* Image */}
                <div className="h-40 overflow-hidden bg-void-mid relative">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=60' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-void-mid to-transparent" />
                  {project.featured && (
                    <span className="absolute top-3 right-3 font-mono text-[9px] text-cyber-lime border border-cyber-lime/40 bg-void/70 px-2 py-0.5 uppercase">
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-display text-xl text-white uppercase leading-tight">{project.title}</h3>
                    <span className="font-mono text-[9px] text-gray-600 shrink-0">{project.year}</span>
                  </div>
                  <p className="font-body text-xs text-gray-500 line-clamp-2 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(project.techStack || []).slice(0, 3).map(t => (
                      <span key={t} className="tech-tag text-[9px]">{t}</span>
                    ))}
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-void-border">
                    <Link
                      to={`/admin/project/${project.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-void-border text-gray-500 hover:border-cyber-lime/50 hover:text-cyber-lime font-mono text-[10px] uppercase tracking-wider transition-all"
                    >
                      <Edit2 size={11} /> Edit
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(project)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-void-border text-gray-500 hover:border-red-500/50 hover:text-red-400 font-mono text-[10px] uppercase tracking-wider transition-all"
                    >
                      <Trash2 size={11} /> Delete
                    </button>
                    {project.liveLink && (
                      <a href={project.liveLink} target="_blank" rel="noopener noreferrer"
                        className="p-2 border border-void-border text-gray-600 hover:border-gray-500 hover:text-gray-300 transition-all">
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List view
          <div ref={listRef} className="border border-void-border overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-void-mid border-b border-void-border">
              {['Project', 'Category', 'Year', 'Stack', ''].map((h, i) => (
                <div key={i} className={`font-mono text-[9px] text-gray-600 uppercase tracking-widest col-span-${[4, 2, 1, 3, 2][i]}`}>{h}</div>
              ))}
            </div>
            {projects.map((project, i) => (
              <div
                key={project.id}
                className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-void-border hover:bg-void-mid transition-colors items-center opacity-0"
              >
                <div className="col-span-4">
                  <div className="font-mono text-sm text-white">{project.title}</div>
                  <div className="font-mono text-[10px] text-gray-600 mt-0.5 truncate">{project.description?.substring(0, 40)}...</div>
                </div>
                <div className="col-span-2">
                  <span className="font-mono text-[10px] text-gray-500">{project.category}</span>
                </div>
                <div className="col-span-1">
                  <span className="font-mono text-[10px] text-gray-600">{project.year}</span>
                </div>
                <div className="col-span-3 flex flex-wrap gap-1">
                  {(project.techStack || []).slice(0, 2).map(t => (
                    <span key={t} className="tech-tag text-[9px]">{t}</span>
                  ))}
                </div>
                <div className="col-span-2 flex items-center gap-2 justify-end">
                  <Link to={`/admin/project/${project.id}`}
                    className="p-1.5 text-gray-600 hover:text-cyber-lime transition-colors">
                    <Edit2 size={13} />
                  </Link>
                  <button onClick={() => setDeleteTarget(project)}
                    className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
