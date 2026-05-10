'use client'

import {
  Calendar,
  FolderOpen,
  LayoutDashboard,
  Play,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type SidebarProps = {
  activeItem: 'dashboard' | 'projects' | 'ai-builder' | 'playground'
  onNavigate: (view: 'dashboard' | 'projects' | 'ai-builder' | 'playground') => void
}

export default function Sidebar({ activeItem, onNavigate }: SidebarProps) {
  return (
    <aside className="dashboard-sidebar">
      <nav className="dashboard-sidebar__nav" aria-label="Dashboard navigation">
        <button
          type="button"
          className={activeItem === 'dashboard' ? 'dashboard-sidebar__item--active' : 'dashboard-sidebar__item'}
          onClick={() => onNavigate('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          className={activeItem === 'playground' ? 'dashboard-sidebar__item--active' : 'dashboard-sidebar__item'}
          onClick={() => onNavigate('playground')}
        >
          <Play size={20} />
          <span>PlayGround</span>
        </button>

        <button
          type="button"
          className={activeItem === 'ai-builder' ? 'dashboard-sidebar__item--active' : 'dashboard-sidebar__item'}
          onClick={() => onNavigate('ai-builder')}
        >
          <Zap size={20} />
          <span>Agent</span>
          <span className="dashboard-sidebar__pill dashboard-sidebar__pill--new">New</span>
        </button>

        <a href="#" className="dashboard-sidebar__item">
          <TrendingUp size={20} />
          <span>Skills tracking</span>
        </a>

        <a
          href="#"
          className="dashboard-sidebar__item"
          onClick={(event) => {
            event.preventDefault()
            window.alert('Coming soon')
          }}
        >
          <Calendar size={20} />
          <span>Events</span>
        </a>

        <button
          type="button"
          className={activeItem === 'projects' ? 'dashboard-sidebar__item--active' : 'dashboard-sidebar__item'}
          onClick={() => onNavigate('projects')}
        >
          <FolderOpen size={20} />
          <span>Projects</span>
          <span className="dashboard-sidebar__pill dashboard-sidebar__pill--premium">Premium</span>
        </button>

        <a
          href="#"
          className="dashboard-sidebar__item"
          onClick={(event) => {
            event.preventDefault()
            window.alert('Coming soon')
          }}
        >
          <Users size={20} />
          <span>Workspaces</span>
        </a>
      </nav>

      <div className="dashboard-sidebar__cta">
        <Button className="dashboard-card__action dashboard-card__action--primary">
          Try Plus or Pro with a 7-day free trial
        </Button>

        <div className="dashboard-sidebar__copy">
          <p>Go deeper and learn job-ready skills. Practice with real-world projects, take assessments, and earn certifications.</p>
          <a href="#" className="dashboard-sidebar__link">Explore Teams</a>
        </div>

        <p className="dashboard-sidebar__copy">
          Learning for work? Try Codecademy Teams built for learning with coworkers.
        </p>
      </div>
    </aside>
  )
}
