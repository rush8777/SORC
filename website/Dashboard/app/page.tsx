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
import AiBuilderSection from '@/components/sections/ai-builder-section'
import PlaygroundSection from '@/components/sections/playground-section'
import Footer from '@/components/footer'
import { getEditorAppUrl } from '@shared/integration/api'

type DashboardView = 'dashboard' | 'projects' | 'project-detail' | 'ai-builder' | 'playground'

type DashboardRoute = {
  view: DashboardView
  projectId: string | null
}

export default function Home() {
  const [route, setRoute] = useState<DashboardRoute>(() => readDashboardRoute())
  const [isHeaderHidden, setIsHeaderHidden] = useState(false)

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

  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const updateHeaderVisibility = () => {
      const currentScrollY = window.scrollY
      const scrollDelta = currentScrollY - lastScrollY
      
      // Only apply scroll behavior in AI Builder section
      if (route.view === 'ai-builder') {
        // Hide header when scrolling down, show when scrolling up
        // Only hide if scrolled past 100px and delta is significant
        if (currentScrollY > 100 && scrollDelta > 5) {
          setIsHeaderHidden(true)
        } else if (scrollDelta < -5 || currentScrollY <= 100) {
          setIsHeaderHidden(false)
        }
      } else {
        // Always show header in other sections
        setIsHeaderHidden(false)
      }
      
      lastScrollY = currentScrollY
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateHeaderVisibility)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [route.view])

  const handleSidebarNavigate = (view: 'dashboard' | 'projects' | 'ai-builder' | 'playground') => {
    if (view === 'dashboard') {
      navigateToDashboardRoute('#/dashboard')
    } else if (view === 'projects') {
      navigateToDashboardRoute('#/projects')
    } else if (view === 'playground') {
      navigateToDashboardRoute('#/playground')
    } else {
      navigateToDashboardRoute('#/ai-builder')
    }
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
      <Header hidden={isHeaderHidden} />
      <div className="dashboard-shell">
        <Sidebar
          activeItem={
            route.view === 'dashboard' || route.view === 'projects' || route.view === 'ai-builder' || route.view === 'playground'
              ? route.view
              : 'dashboard'
          }
          onNavigate={handleSidebarNavigate}
        />
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
            ) : route.view === 'playground' ? (
              <PlaygroundSection />
            ) : route.view === 'ai-builder' ? (
              <AiBuilderSection />
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

  if (normalizedHash === '#/playground') {
    return { view: 'playground', projectId: null }
  }

  if (normalizedHash === '#/ai-builder') {
    return { view: 'ai-builder', projectId: null }
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
