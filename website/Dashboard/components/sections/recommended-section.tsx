'use client'

import { BookOpen, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RecommendedSection() {
  const courses = [
    {
      tag: 'Career path',
      title: 'Full-Stack Engineer',
      description: 'A full-stack engineer can get a project across the board from start to finish, back-end to front-end.',
      stats: 'Includes 51 Courses',
      details: [
        { label: 'with Professional Certification', icon: true },
        { label: 'Beginner Friendly', hours: '330 hours' },
      ],
      tone: 'dark',
    },
    {
      tag: 'Free course',
      title: 'Learn JavaScript',
      description: 'Learn how to use JavaScript, a powerful and flexible programming language for adding website interactivity.',
      stats: 'Free course',
      details: [{ label: 'Beginner Friendly', hours: '10 hours' }],
      tone: 'light',
    },
    {
      tag: 'Free course',
      title: 'Learn HTML',
      description: 'Start at the beginning by learning HTML basics, an important foundation for building web pages and using code.',
      stats: 'Free course',
      details: [{ label: 'Beginner Friendly', hours: '7 hours' }],
      tone: 'light',
    },
  ]

  return (
    <section className="dashboard-section">
      <div className="dashboard-section__header">
        <h2 className="dashboard-section__title">Recommended for you</h2>
        <div className="dashboard-section__meta">
          <span>Related topics:</span>
          <a href="#">HTML & CSS</a>
          <a href="#">JavaScript</a>
          <a href="#">PHP</a>
          <a href="#">Edit</a>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid--recommendations">
        {courses.map((course, idx) => (
          <div
            key={course.title}
            className={`dashboard-recommendation ${
              course.tone === 'dark' ? 'dashboard-recommendation--dark' : ''
            }`}
          >
            <div className="dashboard-recommendation__body">
              <span className="dashboard-recommendation__tag">
                {course.tag.toUpperCase()}
              </span>

              <h3 className="dashboard-recommendation__title">{course.title}</h3>
              <p className="dashboard-recommendation__description">{course.description}</p>
              <div className="dashboard-recommendation__stats">{course.stats}</div>

              <div className="dashboard-recommendation__details">
                {course.details.map((detail) => (
                  <div
                    key={`${course.title}-${detail.label}`}
                    className="dashboard-recommendation__detail"
                  >
                    {detail.icon && <BookOpen />}
                    {detail.hours && <Clock />}
                    <span>{detail.label}</span>
                    {detail.hours && <span>{detail.hours}</span>}
                  </div>
                ))}
              </div>
            </div>

            <Button className="dashboard-recommendation__action" variant="ghost">
              {idx === 0 ? 'View path' : 'View course'}
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}
