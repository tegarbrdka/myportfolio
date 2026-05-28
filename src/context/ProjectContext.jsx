import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ── Fallback defaults (shown while loading / if DB empty) ─────────
const defaultProfile = {
  name:          'Tegar Baradika',
  title:         'Full-Stack Developer',
  role:          'Creative Technologist',
  badge:         'Full-Stack Developer & Creative Technologist',
  bio:           'I started building for the web because I was frustrated — most software felt either fast but ugly, or beautiful but brittle. Five years later, I obsess over the space between "it works" and "it feels alive."',
  photoUrl:      '/photo.png',
  aboutPhotoUrl: '/photo.png',
  email:         'tegarbrdka@gmail.com',
  instagram:     'https://instagram.com/brdka_',
  github:        'https://github.com/tegarbaradika',
  linkedin:      'https://linkedin.com/in/tegarbaradika',
  quote:         "Code that's fast and beautiful isn't a luxury — it's the baseline.",
}

const defaultStats = [
  { id: '1', value: 5,  suffix: '+',  label: 'Years\nExperience',    labelShort: 'Years',     bar: 100 },
  { id: '2', value: 40, suffix: '+',  label: 'Projects\nDelivered',  labelShort: 'Projects',  bar: 80  },
  { id: '3', value: 98, suffix: '%',  label: 'Client\nSatisfaction', labelShort: 'Remote',    bar: 98  },
  { id: '4', value: 12, suffix: 'k+', label: 'Lines\nDaily',         labelShort: 'Tech stacks', bar: 60 },
]

const defaultMilestones = [
  { id: '1', year: '2024', text: 'Led monolith → microservices migration for fintech platform (500k users)', link: '' },
  { id: '2', year: '2024', text: 'Open-source GSAP plugin reached 3k GitHub stars', link: 'https://github.com' },
  { id: '3', year: '2023', text: 'Built real-time auction system processing $2M+ in transactions', link: '' },
  { id: '4', year: '2023', text: 'Speaker at JSConf Asia — "Animation as UX Philosophy"', link: '' },
  { id: '5', year: '2022', text: 'Co-founded SaaS product, scaled to $20k MRR before acquisition', link: '' },
  { id: '6', year: '2021', text: 'Joined top-tier agency — delivered 15+ enterprise projects', link: '' },
]

const defaultProjects = [
  {
    id: '1', title: 'VOID MARKET',
    description: 'Full-stack e-commerce platform with real-time inventory, AI-powered recommendations, and immersive AR try-on features.',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'TensorFlow'],
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    projectLink: 'https://github.com', liveLink: 'https://demo.com',
    year: '2024', category: 'Full-Stack', featured: true,
  },
  {
    id: '2', title: 'NEURAL DASH',
    description: 'Real-time analytics dashboard for ML model performance monitoring. WebSocket-driven live data visualization.',
    techStack: ['Vue.js', 'Python', 'FastAPI', 'D3.js'],
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    projectLink: 'https://github.com', liveLink: 'https://demo.com',
    year: '2024', category: 'Data Viz', featured: true,
  },
  {
    id: '3', title: 'CYPHER OS',
    description: 'Decentralized identity management system built on Web3 infrastructure. Zero-knowledge proof authentication.',
    techStack: ['Next.js', 'Solidity', 'IPFS', 'ethers.js'],
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
    projectLink: 'https://github.com', liveLink: 'https://demo.com',
    year: '2023', category: 'Web3', featured: true,
  },
]

// ── DB row → app shape converters ─────────────────────────────────
const rowToProfile = (row) => ({
  name:          row.name          || defaultProfile.name,
  title:         row.title         || defaultProfile.title,
  role:          row.role          || defaultProfile.role,
  badge:         row.badge         || defaultProfile.badge,
  bio:           row.bio           || defaultProfile.bio,
  photoUrl:      row.photo_url     || defaultProfile.photoUrl,
  aboutPhotoUrl: row.about_photo_url || defaultProfile.aboutPhotoUrl,
  email:         row.email         || defaultProfile.email,
  instagram:     row.instagram     || defaultProfile.instagram,
  github:        row.github        || defaultProfile.github,
  linkedin:      row.linkedin      || defaultProfile.linkedin,
  quote:         row.quote         || defaultProfile.quote,
})

const rowToStat = (row) => ({
  id:         row.id,
  value:      row.value,
  suffix:     row.suffix,
  label:      row.label,
  labelShort: row.label_short,
  bar:        row.bar,
})

const rowToMilestone = (row) => ({
  id:   row.id,
  year: row.year,
  text: row.text,
  link: row.link || '',
})

const rowToProject = (row) => ({
  id:          row.id,
  title:       row.title,
  description: row.description,
  techStack:   row.tech_stack || [],
  imageUrl:    row.image_url,
  projectLink: row.project_link,
  liveLink:    row.live_link,
  year:        row.year,
  category:    row.category,
  featured:    row.featured,
})

// ── Auth key (localStorage only for session) ──────────────────────
const AUTH_KEY = 'tegar_auth'

const ProjectContext = createContext(null)

export function ProjectProvider({ children }) {
  const [profile,        setProfile]        = useState(defaultProfile)
  const [stats,          setStats]          = useState(defaultStats)
  const [milestones,     setMilestones]     = useState(defaultMilestones)
  const [projects,       setProjects]       = useState(defaultProjects)
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem(AUTH_KEY) === 'true'
  )
  const [loading, setLoading] = useState(true)

  // ── Fetch all data from Supabase on mount ─────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profRes, statsRes, milesRes, projRes] = await Promise.all([
          supabase.from('profile').select('*').limit(1).single(),
          supabase.from('stats').select('*').order('sort_order'),
          supabase.from('milestones').select('*').order('sort_order'),
          supabase.from('projects').select('*').order('sort_order'),
        ])

        if (profRes.data)  setProfile(rowToProfile(profRes.data))
        if (statsRes.data?.length)     setStats(statsRes.data.map(rowToStat))
        if (milesRes.data?.length)     setMilestones(milesRes.data.map(rowToMilestone))
        if (projRes.data?.length)      setProjects(projRes.data.map(rowToProject))
      } catch (err) {
        console.warn('Supabase fetch failed, using defaults:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // ── Auth ──────────────────────────────────────────────────────
  const login = async (username, password) => {
    if (username !== 'admin') return { success: false, error: 'Invalid credentials' }
    const { data, error } = await supabase
      .from('settings')
      .select('password')
      .limit(1)
      .single()
    if (error || !data) return { success: false, error: 'Could not verify credentials' }
    if (data.password !== password) return { success: false, error: 'Invalid credentials' }
    setIsAuthenticated(true)
    localStorage.setItem(AUTH_KEY, 'true')
    return { success: true }
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem(AUTH_KEY)
  }

  const changePassword = async (currentPw, newPw) => {
    const { data, error } = await supabase
      .from('settings')
      .select('password')
      .limit(1)
      .single()
    if (error || !data) return { success: false, error: 'Could not verify password' }
    if (data.password !== currentPw) return { success: false, error: 'Current password is incorrect' }
    const { error: updateErr } = await supabase
      .from('settings')
      .update({ password: newPw })
      .eq('password', currentPw)
    if (updateErr) return { success: false, error: 'Failed to update password' }
    return { success: true }
  }

  // ── Profile ───────────────────────────────────────────────────
  const updateProfile = async (updates) => {
    // Map camelCase → snake_case for DB
    const dbUpdates = {}
    if (updates.name          !== undefined) dbUpdates.name            = updates.name
    if (updates.title         !== undefined) dbUpdates.title           = updates.title
    if (updates.role          !== undefined) dbUpdates.role            = updates.role
    if (updates.badge         !== undefined) dbUpdates.badge           = updates.badge
    if (updates.bio           !== undefined) dbUpdates.bio             = updates.bio
    if (updates.photoUrl      !== undefined) dbUpdates.photo_url       = updates.photoUrl
    if (updates.aboutPhotoUrl !== undefined) dbUpdates.about_photo_url = updates.aboutPhotoUrl
    if (updates.email         !== undefined) dbUpdates.email           = updates.email
    if (updates.instagram     !== undefined) dbUpdates.instagram       = updates.instagram
    if (updates.github        !== undefined) dbUpdates.github          = updates.github
    if (updates.linkedin      !== undefined) dbUpdates.linkedin        = updates.linkedin
    if (updates.quote         !== undefined) dbUpdates.quote           = updates.quote
    dbUpdates.updated_at = new Date().toISOString()

    // Optimistic update
    setProfile(prev => ({ ...prev, ...updates }))

    const { error } = await supabase
      .from('profile')
      .update(dbUpdates)
      .not('id', 'is', null)
    if (error) console.error('Profile update failed:', error)
  }

  // ── Stats ─────────────────────────────────────────────────────
  const updateStats = async (newStats) => {
    setStats(newStats)
    for (const s of newStats) {
      await supabase.from('stats').upsert({
        id:          s.id,
        value:       s.value,
        suffix:      s.suffix,
        label:       s.label,
        label_short: s.labelShort,
        bar:         s.bar,
      })
    }
  }

  // ── Milestones ────────────────────────────────────────────────
  const updateMilestones = async (newMilestones) => {
    setMilestones(newMilestones)
    // Delete all and re-insert (simplest approach)
    await supabase.from('milestones').delete().not('id', 'is', null)
    if (newMilestones.length > 0) {
      await supabase.from('milestones').insert(
        newMilestones.map((m, i) => ({
          id:         m.id,
          year:       m.year,
          text:       m.text,
          link:       m.link || '',
          sort_order: i,
        }))
      )
    }
  }

  const addMilestone = async (milestone) => {
    const newM = { ...milestone, id: Date.now().toString() }
    const updated = [newM, ...milestones]
    await updateMilestones(updated)
  }

  const deleteMilestone = async (id) => {
    const updated = milestones.filter(m => m.id !== id)
    await updateMilestones(updated)
  }

  // ── Projects ──────────────────────────────────────────────────
  const addProject = async (project) => {
    const newProject = {
      ...project,
      id:   Date.now().toString(),
      year: new Date().getFullYear().toString(),
    }
    setProjects(prev => [newProject, ...prev])
    const { error } = await supabase.from('projects').insert({
      id:           newProject.id,
      title:        newProject.title,
      description:  newProject.description,
      tech_stack:   newProject.techStack,
      image_url:    newProject.imageUrl,
      project_link: newProject.projectLink,
      live_link:    newProject.liveLink,
      year:         newProject.year,
      category:     newProject.category,
      featured:     newProject.featured || false,
      sort_order:   0,
    })
    if (error) console.error('Add project failed:', error)
    return newProject
  }

  const updateProject = async (id, updates) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
    const dbUpdates = {}
    if (updates.title       !== undefined) dbUpdates.title        = updates.title
    if (updates.description !== undefined) dbUpdates.description  = updates.description
    if (updates.techStack   !== undefined) dbUpdates.tech_stack   = updates.techStack
    if (updates.imageUrl    !== undefined) dbUpdates.image_url    = updates.imageUrl
    if (updates.projectLink !== undefined) dbUpdates.project_link = updates.projectLink
    if (updates.liveLink    !== undefined) dbUpdates.live_link    = updates.liveLink
    if (updates.year        !== undefined) dbUpdates.year         = updates.year
    if (updates.category    !== undefined) dbUpdates.category     = updates.category
    if (updates.featured    !== undefined) dbUpdates.featured     = updates.featured
    const { error } = await supabase.from('projects').update(dbUpdates).eq('id', id)
    if (error) console.error('Update project failed:', error)
  }

  const deleteProject = async (id) => {
    setProjects(prev => prev.filter(p => p.id !== id))
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) console.error('Delete project failed:', error)
  }

  const reorderProjects = async (newOrder) => {
    setProjects(newOrder)
    for (let i = 0; i < newOrder.length; i++) {
      await supabase.from('projects').update({ sort_order: i }).eq('id', newOrder[i].id)
    }
  }

  const getProjectById = (id) => projects.find(p => p.id === id)

  return (
    <ProjectContext.Provider value={{
      loading,
      // Projects
      projects,
      addProject,
      updateProject,
      deleteProject,
      reorderProjects,
      getProjectById,
      // Auth
      isAuthenticated,
      login,
      logout,
      changePassword,
      // Profile
      profile,
      updateProfile,
      // Stats & Milestones
      stats,
      milestones,
      updateStats,
      updateMilestones,
      addMilestone,
      deleteMilestone,
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectContext)
  if (!context) throw new Error('useProjects must be used within ProjectProvider')
  return context
}
