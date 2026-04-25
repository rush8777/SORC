const productLinks = ['Features', 'Pricing', 'Integrations', 'Changelog']
const resourceLinks = ['Documentation', 'Tutorials', 'Blog', 'Support']
const companyLinks = ['About', 'Careers', 'Contact', 'Partners']
const legalLinks = ['Privacy policy', 'Terms of service', 'Cookie settings']
const socialLinks = ['X', 'In', 'Ig', 'Gh']

function FooterLinkGroup({ title, links }) {
  return (
    <div className="footer-links__group">
      <p>{title}</p>
      <ul>
        {links.map((link) => (
          <li key={link}>
            <a href="/">{link}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FooterSection() {
  return (
    <section className="site-endcap" aria-labelledby="site-endcap-title">
      <div className="site-endcap__cta">
        <h2 id="site-endcap-title">Ready to see the Omnistra agent in action?</h2>
        <p>
          Omnistra agents handle complex workflows at scale while maintaining over 90% resolution
          accuracy in production.
        </p>
        <a className="site-endcap__button" href="/">
          Contact us
        </a>
      </div>

      <footer className="site-footer">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <a className="footer-brand" href="/">
              <span className="footer-brand__mark" aria-hidden="true">
                <span className="footer-brand__cube footer-brand__cube--one" />
                <span className="footer-brand__cube footer-brand__cube--two" />
              </span>
              <span className="footer-brand__word">Omnistra</span>
            </a>

            <p>
              Omnistra agents handle complex workflows at scale while maintaining over 90%
              resolution accuracy in production.
            </p>

            <ul className="site-footer__socials" aria-label="Social links">
              {socialLinks.map((label) => (
                <li key={label}>
                  <a href="/" aria-label={label}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-links">
            <FooterLinkGroup title="Product" links={productLinks} />
            <FooterLinkGroup title="Resources" links={resourceLinks} />
            <FooterLinkGroup title="Company" links={companyLinks} />
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>2025 Omnistra. All rights reserved.</p>
          <ul className="site-footer__legal">
            {legalLinks.map((link) => (
              <li key={link}>
                <a href="/">{link}</a>
              </li>
            ))}
          </ul>
        </div>
      </footer>

      <span className="site-endcap__watermark" aria-hidden="true">
        Omnistra
      </span>
    </section>
  )
}

export default FooterSection
