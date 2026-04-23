import { navGroups } from '../../data/navigation'
import Button from '../common/Button'

function LogoMark() {
  return (
    <div className="brand" aria-label="datacamp">
      <span className="brand__mark" aria-hidden="true">
        <span className="brand__bar brand__bar--one" />
        <span className="brand__bar brand__bar--two" />
      </span>
      <span className="brand__word">datacamp</span>
    </div>
  )
}

function HeaderActions() {
  return (
    <div className="header-actions">
      <button className="icon-action" aria-label="Search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11 4a7 7 0 1 0 4.9 12l4.05 4.05 1.4-1.4L17.3 14.6A7 7 0 0 0 11 4Zm0 2a5 5 0 1 1 0 10a5 5 0 0 1 0-10Z" />
        </svg>
      </button>
      <button className="language-switch" aria-label="Language">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm6.93 9h-3.05a15.58 15.58 0 0 0-1.27-5A8.03 8.03 0 0 1 18.93 11ZM12 4.06c.9 1.1 1.95 3.48 2.3 6.94H9.7C10.05 7.54 11.1 5.16 12 4.06ZM4.07 13h3.05a15.58 15.58 0 0 0 1.27 5A8.03 8.03 0 0 1 4.07 13Zm3.05-2H4.07a8.03 8.03 0 0 1 4.32-5a15.58 15.58 0 0 0-1.27 5Zm1.01 2h4.74c-.35 3.46-1.4 5.84-2.3 6.94c-.9-1.1-1.95-3.48-2.44-6.94Zm0-2c.49-3.46 1.54-5.84 2.44-6.94c.9 1.1 1.95 3.48 2.3 6.94Zm6.48 7a15.58 15.58 0 0 0 1.27-5h3.05a8.03 8.03 0 0 1-4.32 5Z" />
        </svg>
        <span>EN</span>
      </button>
      <Button variant="ghost">Log In</Button>
      <Button variant="light">Get Started</Button>
    </div>
  )
}

function Header() {
  return (
    <header className="site-header">
      <LogoMark />
      <nav className="site-nav" aria-label="Primary">
        {navGroups.map((item) => (
          <a
            key={item.label}
            href="/"
            className={`site-nav__link ${item.accent ? 'site-nav__link--accent' : ''}`.trim()}
            onClick={(event) => event.preventDefault()}
          >
            <span>{item.label}</span>
            {item.hasDropdown ? (
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2 4.25 6 8l4-3.75" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </a>
        ))}
      </nav>
      <HeaderActions />
    </header>
  )
}

export default Header
