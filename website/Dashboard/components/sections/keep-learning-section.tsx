'use client'

import { ChevronRight } from 'lucide-react'

export default function KeepLearningSection() {
  return (
    <section className="dashboard-section">
      <h2 className="dashboard-section__title">Keep learning</h2>

      <div className="dashboard-card">
        <div className="dashboard-status">
          <span>In progress</span>
        </div>

        <div className="dashboard-card__body">
          <div>
            <span className="dashboard-card__eyebrow">Course</span>
            <h3 className="dashboard-card__title">Learning Django Using Generative AI Help</h3>
          </div>

          <p className="dashboard-card__description">
            Learn Django using generative AI tools. Dive into Django&apos;s MTV architecture, use AI tools for project setup, and create a robust web application.
          </p>
        </div>

        <div className="dashboard-card__footer">
          <a href="#" className="dashboard-inline-link dashboard-text-link--small">
            Resume
            <ChevronRight size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}
