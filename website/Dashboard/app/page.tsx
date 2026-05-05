'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/header'
import Sidebar from '@/components/sidebar'
import AdvanceSection from '@/components/sections/advance-section'
import KeepLearningSection from '@/components/sections/keep-learning-section'
import FollowProgressSection from '@/components/sections/follow-progress-section'
import RecommendedSection from '@/components/sections/recommended-section'
import DiscoverFeaturesSection from '@/components/sections/discover-features-section'
import ProjectsSection from '@/components/sections/projects-section'
import Footer from '@/components/footer'
import { getEditorAppUrl } from '@shared/integration/api'

type DashboardView = 'dashboard' | 'projects' | 'project-detail'

type DashboardRoute = {
  view: DashboardView
  projectId: string | null
}

export default function Home() {
  const [route, setRoute] = useState<DashboardRoute>(() => readDashboardRoute())

  useEffect(() => {
    const syncRoute = () => {
      setRoute(readDashboardRoute())
    }

    window.addEventListener('hashchange', syncRoute)
    syncRoute()

    return () => {
      window.removeEventListener('hashchange', syncRoute)
    }
  }, [])

  const handleSidebarNavigate = (view: 'dashboard' | 'projects') => {
    navigateToDashboardRoute(view === 'dashboard' ? '#/dashboard' : '#/projects')
  }

  const handleOpenProject = (projectId: string) => {
    navigateToDashboardRoute(`#/projects/${projectId}`)
  }

  const handleBackToProjects = () => {
    navigateToDashboardRoute('#/projects')
  }

  const handleOpenLesson = (projectId: string, lessonId: string) => {
    window.location.assign(getEditorAppUrl(projectId, lessonId))
  }

  return (
    <div className="dashboard-page">
      <Header />
      <div className="dashboard-shell">
        <Sidebar activeItem={route.view === 'dashboard' ? 'dashboard' : 'projects'} onNavigate={handleSidebarNavigate} />
        <main className="dashboard-main">
          <div className="dashboard-content">
            {route.view === 'dashboard' ? (
              <>
                <AdvanceSection />
                <KeepLearningSection />
                <FollowProgressSection />
                <RecommendedSection />
                <DiscoverFeaturesSection />
              </>
            ) : route.view === 'projects' ? (
              <ProjectsSection onOpenProject={handleOpenProject} onOpenLesson={handleOpenLesson} />
            ) : (
              <ProjectsSection
                showDetail
                selectedProjectId={route.projectId}
                onOpenProject={handleOpenProject}
                onOpenLesson={handleOpenLesson}
                onBackToProjects={handleBackToProjects}
              />
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}

function readDashboardRoute(): DashboardRoute {
  if (typeof window === 'undefined') {
    return { view: 'dashboard', projectId: null }
  }

  const normalizedHash = window.location.hash || '#/dashboard'
  const projectMatch = normalizedHash.match(/^#\/projects\/([^/]+)$/)
  if (projectMatch?.[1]) {
    return {
      view: 'project-detail',
      projectId: decodeURIComponent(projectMatch[1]),
    }
  }

  if (normalizedHash === '#/projects') {
    return { view: 'projects', projectId: null }
  }

  return { view: 'dashboard', projectId: null }
}

function navigateToDashboardRoute(hash: string) {
  if (typeof window === 'undefined') {
    return
  }

  if (window.location.hash === hash) {
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    return
  }

  window.location.hash = hash
}
