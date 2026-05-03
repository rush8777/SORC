'use client'

import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function FollowProgressSection() {
  return (
    <section className="dashboard-section">
      <h2 className="dashboard-section__title">Follow your progress</h2>

      <div className="dashboard-grid dashboard-grid--progress">
        <div className="dashboard-card">
          <div className="dashboard-card__body dashboard-progress__summary">
            <div>
              <h3 className="dashboard-card__title">Subjects and languages</h3>
              <p>Take action to stay motivated</p>
              <p className="dashboard-goal__copy">
                Move forward in your learning and watch your skills grow.
              </p>
              <a href="#" className="dashboard-inline-link">
                Continue in Learning Django Using Generative AI Help
              </a>
            </div>
          </div>
        </div>

        <div className="dashboard-stack">
          <div className="dashboard-card">
            <div className="dashboard-card__body dashboard-card__body--compact">
              <h3 className="dashboard-card__title">No weekly target set yet</h3>
            </div>
            <Button className="dashboard-card__action dashboard-card__action--accent">
              Set target
            </Button>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card__body">
              <div className="dashboard-goal">
                <h3 className="dashboard-card__title">Your goal</h3>
                <button className="dashboard-goal__edit">Edit</button>
              </div>
              <p className="dashboard-goal__copy">Build a project</p>
            </div>
          </div>

          <div className="dashboard-align-end">
            <a href="#" className="dashboard-inline-link">
              View achievements
              <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
