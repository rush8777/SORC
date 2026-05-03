'use client'

import { ChevronRight, Users, Zap } from 'lucide-react'

export default function DiscoverFeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: 'Interview Simulator',
      description: 'Practice your interviewing skills and get real-time, AI-powered feedback.',
    },
    {
      icon: Users,
      title: 'Job-readiness checker',
      description: 'Analyze any job posting to check for the skills you need to advance your career.',
    },
    {
      icon: Users,
      title: 'Refer a friend',
      description: 'Help a friend get 50% off an annual plan, and you get a gift card worth $20 USD.',
    },
    {
      icon: Users,
      title: 'Clubs',
      description: 'Connect with peers around the globe, find club-curated events, and help one another.',
    },
  ]

  return (
    <section className="dashboard-section">
      <h2 className="dashboard-section__title">Discover more features</h2>

      <div className="dashboard-grid dashboard-grid--discover">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div key={feature.title} className="dashboard-feature-card">
              <div className="dashboard-feature-card__icon">
                <Icon size={24} />
              </div>
              <div>
                <h3 className="dashboard-feature-card__title">{feature.title}</h3>
                <p className="dashboard-feature-card__description">{feature.description}</p>
                <button className="dashboard-feature-card__chevron" aria-label={`Open ${feature.title}`}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
