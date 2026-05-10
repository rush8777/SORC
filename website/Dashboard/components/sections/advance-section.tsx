'use client'

import { Brain, Lightbulb, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdvanceSection() {
  const bootcamps = [
    { name: 'Full-Stack Developer', icon: '/assets/icons/fullstack-icon.svg' },
    { name: 'AWS Cloud Practitioner', icon: '/assets/icons/aws-icon.svg' },
    { name: 'AWS-Certified AI Practitioner', icon: '/assets/icons/ai-practitioner-icon.svg' },
    { name: 'Building Agentic AI Apps', icon: '/assets/icons/agentic-ai-icon.svg' },
  ]

  return (
    <section className="dashboard-section">
      <h2 className="dashboard-section__title">Advance with expert guidance</h2>

      <div className="dashboard-grid dashboard-grid--feature">
        <div className="dashboard-card">
          <div className="dashboard-card__body">
            <h3 className="dashboard-card__title">Don't Let AI Conquer Your Development Skills</h3>
            <p className="dashboard-card__muted">Feels less productive when AI does 90% of the work</p>

            <p className="dashboard-card__description">
              Take back control of your coding journey by building projects from scratch. Develop real problem-solving skills and maintain your productivity by writing meaningful code. Learn to think like a developer, not just prompt like a user, and build the confidence that comes from genuine mastery.
            </p>

            <div className="dashboard-card__list">
              <p className="dashboard-card__eyebrow">Trending now</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {bootcamps.map((camp) => (
                  <div key={camp.name} className="dashboard-card__list-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img 
                      src={camp.icon} 
                      alt={camp.name} 
                      style={{ 
                        width: '16px', 
                        height: '16px', 
                        display: 'block'
                      }} 
                    />
                    <span>{camp.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button className="dashboard-card__action dashboard-card__action--primary">
            Explore all bootcamps
          </Button>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card__body">
            <div className="dashboard-card__split">
              <div>
                <h3 className="dashboard-card__title">Reclaim Your Independence</h3>
                <p className="dashboard-card__muted">Break free from AI dependency</p>
              </div>
              <div className="dashboard-card__icon">
                <Brain size={40} style={{ color: '#000000' }} />
              </div>
            </div>

            <p className="dashboard-card__description">
              Learn to solve problems independently and debug your own code. Develop critical thinking skills that AI can't replace and build confidence to tackle any challenge.
            </p>
          </div>

          <Button className="dashboard-card__action dashboard-card__action--primary">
            Explore coaching
          </Button>
        </div>
      </div>
    </section>
  )
}
