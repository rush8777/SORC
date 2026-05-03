'use client'

import { useState } from 'react'
import Header from '@/components/header'
import Sidebar from '@/components/sidebar'
import AdvanceSection from '@/components/sections/advance-section'
import KeepLearningSection from '@/components/sections/keep-learning-section'
import FollowProgressSection from '@/components/sections/follow-progress-section'
import RecommendedSection from '@/components/sections/recommended-section'
import DiscoverFeaturesSection from '@/components/sections/discover-features-section'
import ProjectsSection from '@/components/sections/projects-section'
import Footer from '@/components/footer'

export default function Home() {
  const [activeView, setActiveView] = useState<'dashboard' | 'projects' | 'project-detail'>('dashboard')

  const handleSidebarNavigate = (view: 'dashboard' | 'projects') => {
    setActiveView(view)
  }

  return (
    <div className="dashboard-page">
      <Header />
      <div className="dashboard-shell">
        <Sidebar activeItem={activeView === 'dashboard' ? 'dashboard' : 'projects'} onNavigate={handleSidebarNavigate} />
        <main className="dashboard-main">
          <div className="dashboard-content">
            {activeView === 'dashboard' ? (
              <>
                <AdvanceSection />
                <KeepLearningSection />
                <FollowProgressSection />
                <RecommendedSection />
                <DiscoverFeaturesSection />
              </>
            ) : activeView === 'projects' ? (
              <ProjectsSection onOpenProject={() => setActiveView('project-detail')} />
            ) : (
              <ProjectsSection
                showDetail
                onOpenProject={() => setActiveView('project-detail')}
                onBackToProjects={() => setActiveView('projects')}
              />
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
