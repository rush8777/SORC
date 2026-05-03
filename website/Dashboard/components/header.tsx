'use client'

import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header__inner">
        <div className="dashboard-brand">
          <div className="dashboard-brand__mark" />
          <span className="dashboard-brand__text">Codecademy</span>
        </div>

        <div className="dashboard-header__actions">
          <label className="dashboard-header__search" aria-label="Search the dashboard">
            <Search size={16} />
            <input type="text" placeholder="Search" />
          </label>

          <button className="dashboard-header__icon" aria-label="Notifications">
            <Bell size={18} />
            <span className="dashboard-header__icon-badge" />
          </button>

          <button className="dashboard-header__avatar" aria-label="Profile" />

          <Button>Start free trial</Button>
        </div>
      </div>
    </header>
  )
}
