import Button from '../common/Button'

function RatingStars() {
  return (
    <div className="rating-strip" aria-label="Rated 4.7 out of 5">
      <span className="rating-strip__score">G2</span>
      <span className="rating-strip__value">4.7</span>
      <div className="rating-strip__stars" aria-hidden="true">
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span className="rating-strip__stars--muted">★</span>
      </div>
    </div>
  )
}

function HeroContent() {
  return (
    <section className="hero-copy">
      <p className="eyebrow">Data and AI learning platform</p>
      <h1>Learn data and AI skills</h1>
      <p className="hero-copy__text">
        Master in-demand skills in Python, ChatGPT, Power BI, and more
        through interactive courses, real-world projects, and industry
        recognized certifications.
      </p>
      <div className="hero-copy__actions">
        <Button>Start Learning for Free</Button>
        <Button variant="secondary">Download Local Agent</Button>
      </div>
      <RatingStars />
    </section>
  )
}

export default HeroContent
