import { useEffect, useState } from 'react'

const AUTO_ADVANCE_MS = 6000
const TIMER_INTERVAL_MS = 100
const RING_RADIUS = 17
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

const detailCards = [
  {
    kicker: 'Learn',
    title: 'Step-by-step guidance',
    description:
      'Move through compact lessons with clear explanations, visual cues, and a pace that never feels overwhelming.',
    featured: true,
  },
  {
    kicker: 'Practice',
    title: 'Hands-on practice',
    description:
      'Apply each idea immediately with guided prompts, code checks, and just enough support to keep momentum high.',
  },
  {
    kicker: 'Build',
    title: 'Real-world projects',
    description:
      'Turn lessons into portfolio-ready work that feels relevant to the roles and tools you actually want to grow into.',
  },
]

const benefitCards = [
  {
    tone: 'violet',
    eyebrow: 'Interactive',
    icon: 'stack',
    title: 'Learn by doing',
    description:
      'You learn through clear instructions and explanations by writing real code and solving problems like a software developer.',
  },
  {
    tone: 'cyan',
    eyebrow: 'Personalized',
    icon: 'bot',
    title: 'Get AI-powered guidance',
    description:
      'With precise feedback and hints that adapt to your progress, Mimo helps you keep moving forward when you are stuck.',
  },
  {
    tone: 'gold',
    eyebrow: 'Career-oriented',
    icon: 'badge',
    title: 'Reach professional goals',
    description:
      'Build a portfolio, earn certificates, and join live sessions designed to help you move toward a career in software development.',
  },
]

function BenefitIcon({ icon }) {
  if (icon === 'stack') {
    return (
      <span className="benefit-icon benefit-icon--stack" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    )
  }

  if (icon === 'bot') {
    return (
      <span className="benefit-icon benefit-icon--bot" aria-hidden="true">
        <span className="benefit-icon__bot-head">
          <span />
          <span />
        </span>
        <span className="benefit-icon__bot-body" />
      </span>
    )
  }

  return (
    <span className="benefit-icon benefit-icon--badge" aria-hidden="true">
      <span className="benefit-icon__badge-top" />
      <span className="benefit-icon__badge-core" />
      <span className="benefit-icon__badge-ribbon benefit-icon__badge-ribbon--left" />
      <span className="benefit-icon__badge-ribbon benefit-icon__badge-ribbon--right" />
    </span>
  )
}

function ProgressRing({ remainingMs }) {
  const progress = remainingMs / AUTO_ADVANCE_MS
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress)
  const countdown = Math.max(1, Math.ceil(remainingMs / 1000))

  return (
    <span className="workflow-card__timer" aria-hidden="true">
      <svg viewBox="0 0 40 40">
        <circle className="workflow-card__timer-track" cx="20" cy="20" r={RING_RADIUS} />
        <circle
          className="workflow-card__timer-progress"
          cx="20"
          cy="20"
          r={RING_RADIUS}
          style={{
            strokeDasharray: RING_CIRCUMFERENCE,
            strokeDashoffset: dashOffset,
          }}
        />
      </svg>
      <span>{countdown}</span>
    </span>
  )
}

function LessonPreview() {
  return (
    <div className="lesson-preview" aria-hidden="true">
      <div className="lesson-preview__window">
        <div className="lesson-preview__chrome">
          <span className="lesson-preview__close" />
          <div className="lesson-preview__tabs">
            <span className="lesson-preview__tab lesson-preview__tab--active" />
            <span className="lesson-preview__tab" />
            <span className="lesson-preview__tab" />
            <span className="lesson-preview__tab lesson-preview__tab--long" />
          </div>
          <span className="lesson-preview__spark" />
        </div>
        <div className="lesson-preview__body">
          <p className="lesson-preview__caption">
            HTML also allows us to add images to a webpage.
          </p>
          <div className="lesson-preview__exercise">
            <span className="lesson-preview__exercise-label">Browser</span>
            <div className="lesson-preview__exercise-frame">
              <p>Photography competition winner</p>
              <div className="lesson-preview__photo">
                <span className="lesson-preview__photo-glow" />
              </div>
            </div>
          </div>
          <span className="lesson-preview__cursor" />
        </div>
        <div className="lesson-preview__footer">
          <div className="lesson-preview__bot">
            <span className="lesson-preview__bot-head" />
            <span className="lesson-preview__bot-body" />
          </div>
          <button className="lesson-preview__cta" type="button">
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

function HowItWorksSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [remainingMs, setRemainingMs] = useState(AUTO_ADVANCE_MS)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRemainingMs((currentRemainingMs) => {
        if (currentRemainingMs <= TIMER_INTERVAL_MS) {
          setActiveIndex((currentIndex) => (currentIndex + 1) % detailCards.length)
          return AUTO_ADVANCE_MS
        }

        return currentRemainingMs - TIMER_INTERVAL_MS
      })
    }, TIMER_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [])

  function handleCardSelect(index) {
    setActiveIndex(index)
    setRemainingMs(AUTO_ADVANCE_MS)
  }

  return (
    <section className="how-it-works" aria-labelledby="how-it-works-title">
      <div className="container">
        <div className="how-it-works__inner">
          <div className="how-it-works__intro">
            <p className="eyebrow">How it works</p>
            <h2 id="how-it-works-title">
              A modern way to learn to code and develop software
            </h2>
          </div>

          <div className="how-it-works__top">
            <LessonPreview />

            <div className="how-it-works__rail">
              <div className="workflow-track" aria-hidden="true">
                {detailCards.map((card, index) => (
                  <span
                    key={card.title}
                    className={index === activeIndex ? 'workflow-track__dot workflow-track__dot--active' : 'workflow-track__dot'}
                  />
                ))}
              </div>

              {detailCards.map((card, index) => (
                <article
                  key={card.title}
                  className={`workflow-card ${index === activeIndex ? 'workflow-card--active' : ''}`.trim()}
                >
                  <button
                    className="workflow-card__trigger"
                    type="button"
                    onClick={() => handleCardSelect(index)}
                  >
                    <div className="workflow-card__head">
                      <span className="workflow-card__badge">{card.kicker}</span>
                      {index === activeIndex ? <ProgressRing remainingMs={remainingMs} /> : null}
                    </div>
                    <h3>{card.title}</h3>
                    <div className="workflow-card__body">
                      <div className="workflow-card__body-inner">
                        <p>{card.description}</p>
                      </div>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          </div>

          <div className="how-it-works__bottom">
            {benefitCards.map((card) => (
              <article key={card.title} className={`benefit-card benefit-card--${card.tone}`}>
                <p className="benefit-card__eyebrow">{card.eyebrow}</p>
                <BenefitIcon icon={card.icon} />
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
