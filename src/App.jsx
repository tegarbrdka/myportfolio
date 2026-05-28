import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ProjectProvider } from './context/ProjectContext'
import CustomCursor from './components/ui/CustomCursor'
import Portfolio    from './pages/Portfolio'
import AdminLogin   from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminSettings  from './pages/AdminSettings'
import ProjectForm  from './pages/ProjectForm'

function GrainOverlay() {
  return <div className="grain-overlay" aria-hidden="true" />
}

function ScrollReset() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <ProjectProvider>
      <BrowserRouter>
        <GrainOverlay />
        <CustomCursor />
        <ScrollReset />
        <Routes>
          <Route path="/"                    element={<Portfolio />} />
          <Route path="/admin"               element={<AdminLogin />} />
          <Route path="/admin/dashboard"     element={<AdminDashboard />} />
          <Route path="/admin/settings"      element={<AdminSettings />} />
          <Route path="/admin/project/:id"   element={<ProjectForm />} />
          <Route path="*"                    element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ProjectProvider>
  )
}
