import { socialProviders } from '../../data/navigation'
import Button from '../common/Button'

function SocialGlyph({ provider }) {
  if (provider === 'Apple') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15.2 2.5c.1 1-.3 2-1 2.8-.8.9-1.9 1.5-3 1.4-.1-1 .4-2.1 1.1-2.8.8-.8 2-1.4 2.9-1.4ZM18.2 12.8c0-2 1.7-3 1.8-3.1-1-1.5-2.7-1.7-3.2-1.7-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.6 0-3 .9-3.8 2.3-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.3 3 2.2 1.2-.1 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.1 3-2.2.9-1.3 1.3-2.5 1.3-2.6-.1 0-3.3-1.3-3.3-4.4Z" />
      </svg>
    )
  }

  if (provider === 'Google') {
    return <span className="provider-glyph provider-glyph--google">G</span>
  }

  if (provider === 'LinkedIn') {
    return <span className="provider-glyph provider-glyph--linkedin">in</span>
  }

  return <span className="provider-glyph provider-glyph--facebook">f</span>
}

function SignupCard() {
  return (
    <section className="signup-card">
      <h2>Create Your Free Account</h2>
      <div className="provider-grid">
        {socialProviders.map((provider) => (
          <button
            key={provider.name}
            className="provider-button"
            aria-label={`Continue with ${provider.name}`}
          >
            <SocialGlyph provider={provider.name} />
          </button>
        ))}
      </div>
      <div className="signup-card__divider">
        <span>or</span>
      </div>
      <form className="signup-form">
        <label className="field">
          <span>Email Address</span>
          <input type="email" placeholder="Email Address" />
        </label>
        <label className="field">
          <span>Password</span>
          <span className="field__input-wrap">
            <input type="password" placeholder="Password" />
            <button type="button" className="field__eye" aria-label="Show password">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5C6.5 5 2.1 9.2 1 12c1.1 2.8 5.5 7 11 7s9.9-4.2 11-7c-1.1-2.8-5.5-7-11-7Zm0 11a4 4 0 1 1 0-8a4 4 0 0 1 0 8Zm0-2.2A1.8 1.8 0 1 0 12 10a1.8 1.8 0 0 0 0 3.6Z" />
              </svg>
            </button>
          </span>
        </label>
        <Button className="signup-form__submit">Start Learning for Free</Button>
      </form>
      <p className="signup-card__terms">
        By continuing, you accept our <a href="/">Terms of Use</a>, our{' '}
        <a href="/">Privacy Policy</a> and that your data is stored in the USA.
      </p>
    </section>
  )
}

export default SignupCard
