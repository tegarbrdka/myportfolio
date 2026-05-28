import { useState } from 'react'
import { useLenis } from '../hooks/useLenis'
import Preloader from '../components/ui/Preloader'
import Navbar from '../components/ui/Navbar'
import HeroSection from '../components/sections/HeroSection'
import AboutSection from '../components/sections/AboutSection'
import ServicesSection from '../components/sections/ServicesSection'
import ProjectsSection from '../components/sections/ProjectsSection'
import StatsSection from '../components/sections/StatsSection'
import FooterSection from '../components/sections/FooterSection'

export default function Portfolio() {
  const [loaded, setLoaded] = useState(false)
  useLenis()

  return (
    <div className="bg-void min-h-screen">
      {!loaded && <Preloader onComplete={() => setLoaded(true)} />}
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <ProjectsSection />
        <StatsSection />
        <FooterSection />
      </main>
    </div>
  )
}
