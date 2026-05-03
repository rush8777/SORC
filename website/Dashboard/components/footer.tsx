'use client'

import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="dashboard-footer">
      <div className="dashboard-footer__inner">
        <div className="dashboard-footer__grid">
          <div>
            <h4 className="dashboard-footer__title">Company</h4>
            <ul className="dashboard-footer__list">
              <li><a href="#">About</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Affiliates</a></li>
              <li><a href="#">Partnerships</a></li>
            </ul>
          </div>

          <div>
            <h4 className="dashboard-footer__title">Resources</h4>
            <ul className="dashboard-footer__list">
              <li><a href="#">AI Builder</a></li>
              <li><a href="#">Articles</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Cheatsheets</a></li>
              <li><a href="#">Code challenges</a></li>
              <li><a href="#">Docs</a></li>
              <li><a href="#">Projects</a></li>
            </ul>
          </div>

          <div>
            <h4 className="dashboard-footer__title">Plans</h4>
            <ul className="dashboard-footer__list">
              <li><a href="#">For individuals</a></li>
              <li><a href="#">For students</a></li>
              <li><a href="#">For business</a></li>
              <li><a href="#">Discounts</a></li>
            </ul>
          </div>

          <div>
            <h4 className="dashboard-footer__title">Subjects</h4>
            <ul className="dashboard-footer__list">
              <li><a href="#">AI</a></li>
              <li><a href="#">Cloud computing</a></li>
              <li><a href="#">Code Foundations</a></li>
              <li><a href="#">Computer science</a></li>
              <li><a href="#">Cybersecurity</a></li>
            </ul>
          </div>

          <div>
            <h4 className="dashboard-footer__title">Languages</h4>
            <ul className="dashboard-footer__list">
              <li><a href="#">Bash</a></li>
              <li><a href="#">C</a></li>
              <li><a href="#">C++</a></li>
              <li><a href="#">Go</a></li>
              <li><a href="#">HTML & CSS</a></li>
            </ul>
          </div>

          <div>
            <h4 className="dashboard-footer__title">Career building</h4>
            <ul className="dashboard-footer__list">
              <li><a href="#">Career paths</a></li>
              <li><a href="#">Career Center</a></li>
              <li><a href="#">Interview prep</a></li>
              <li><a href="#">Bootcamps</a></li>
            </ul>
          </div>
        </div>

        <div className="dashboard-footer__bottom">
          <div className="dashboard-footer__socials">
            <Twitter />
            <Facebook />
            <Instagram />
            <Linkedin />
          </div>

          <div>
            <p>Made with love in NYC © 2025 Codecademy</p>
          </div>

          <div className="dashboard-footer__legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Cookie Policy</a>
            <a href="#">Do Not Sell My Personal Information</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
