'use client'

import {
  BookOpen,
  Calendar,
  FolderOpen,
  LayoutDashboard,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type SidebarProps = {
  activeItem: 'dashboard' | 'projects'
  onNavigate: (view: 'dashboard' | 'projects') => void
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

        <a href="#" className="dashboard-sidebar__item">
          <BookOpen size={20} />
          <span>My learning</span>
        </a>

        <a href="#" className="dashboard-sidebar__item">
          <Zap size={20} />
          <span>AI Builder</span>
          <span className="dashboard-sidebar__pill dashboard-sidebar__pill--new">New</span>
        </a>

        <a href="#" className="dashboard-sidebar__item">
          <TrendingUp size={20} />
          <span>Skills tracking</span>
        </a>

        <a href="#" className="dashboard-sidebar__item">
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

        <a href="#" className="dashboard-sidebar__item">
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
