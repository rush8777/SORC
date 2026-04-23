import Button from '../common/Button'

const careerCards = [
  {
    title: 'Full-Stack Developer',
    description:
      'Learn to create user interfaces and master key programming languages and frameworks driving today\'s web.',
    accent: 'green',
  },
  {
    title: 'Python Developer',
    description:
      'Learn Python to quickly develop anything from web applications to artificial intelligence.',
    accent: 'gold',
  },
  {
    title: 'Front-End Developer',
    description:
      'Learn front-end development with HTML, CSS, JavaScript, and React to create engaging web applications.',
    accent: 'blue',
  },
  {
    title: 'Back-End Developer',
    description:
      'Master back-end development with JavaScript, Node.js, SQL, and APIs to build scalable applications.',
    accent: 'rose',
  },
]

const courseTags = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Python', 'SQL', 'Swift']

function CareerBadge({ accent }) {
  return <span className={`career-card__badge career-card__badge--${accent}`} aria-hidden="true" />
}

function CourseChip({ label }) {
  return (
    <li className="course-chip">
      <span className="course-chip__mark" aria-hidden="true" />
      <span>{label}</span>
    </li>
  )
}

function WhatYouWillLearnSection() {
  return (
    <section className="what-learn" aria-labelledby="what-learn-title">
      <div className="what-learn__intro">
        <p className="eyebrow">What you&apos;ll learn</p>
        <h2 id="what-learn-title">In-demand skills for modern software development</h2>
      </div>

      <div className="what-learn__grid">
        {careerCards.map((card) => (
          <article key={card.title} className="career-card">
            <div className="career-card__top">
              <span className="career-card__label">Career path</span>
              <CareerBadge accent={card.accent} />
            </div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <span className="career-card__foot">Beginner friendly</span>
          </article>
        ))}
      </div>

      <div className="course-strip">
        <p className="course-strip__label">Courses</p>
        <ul className="course-strip__list">
          {courseTags.map((course) => (
            <CourseChip key={course} label={course} />
          ))}
        </ul>
      </div>

      <div className="learn-quiz">
        <div>
          <h3>Not sure where to start?</h3>
          <p>Take a quick quiz to find a path that fits your goals in only a few minutes.</p>
        </div>
        <Button variant="secondary">Take the quiz</Button>
        <div className="learn-quiz__bot" aria-hidden="true">
          <span className="learn-quiz__bot-head">
            <span />
            <span />
          </span>
          <span className="learn-quiz__bot-body" />
        </div>
      </div>
    </section>
  )
}

export default WhatYouWillLearnSection
