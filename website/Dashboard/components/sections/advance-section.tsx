'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdvanceSection() {
  const bootcamps = [
    { name: 'Full-Stack Developer' },
    { name: 'AWS Cloud Practitioner' },
    { name: 'AWS-Certified AI Practitioner' },
    { name: 'Building Agentic AI Apps' },
  ]

  return (
    <section className="dashboard-section">
      <h2 className="dashboard-section__title">Advance with expert guidance</h2>

      <div className="dashboard-grid dashboard-grid--feature">
        <div className="dashboard-card">
          <div className="dashboard-card__body">
            <h3 className="dashboard-card__title">Fast-track your career growth with bootcamps</h3>
            <p className="dashboard-card__muted">Learn live from industry experts</p>

            <p className="dashboard-card__description">
              Join live virtual bootcamps led by experts as you gain real-world skills to succeed in tech. Build hands-on experience to continue your growth, earn industry-recognized certifications, and reach your career goals.
            </p>

            <div className="dashboard-card__list">
              <p className="dashboard-card__eyebrow">Trending now</p>
              {bootcamps.map((camp) => (
                <div key={camp.name} className="dashboard-card__list-item">
                  <div className="dashboard-card__dot" />
                  <span>{camp.name}</span>
                </div>
              ))}
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
                <h3 className="dashboard-card__title">Get expert 1:1 coaching to grow your career</h3>
                <p className="dashboard-card__muted">Accelerate your career with personalized 1:1 coaching</p>
              </div>
              <div className="dashboard-card__icon">
                <MessageCircle size={40} />
              </div>
            </div>

            <p className="dashboard-card__description">
              Get personalized feedback from real-world practitioners. Receive tailored guidance to help you prepare, explore new career paths with confidence, and receive tailored support to help you grow faster.
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
