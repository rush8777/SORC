import Header from './components/layout/Header'
import HeroContent from './components/hero/HeroContent'
import SignupCard from './components/hero/SignupCard'
import HowItWorksSection from './components/sections/HowItWorksSection'
import WhatYouWillLearnSection from './components/sections/WhatYouWillLearnSection'

function App() {
  return (
    <div className="page-shell">
      <div className="page-shell__inner">
        <div className="page-grid" aria-hidden="true" />
        <Header />
        <main>
          <section className="hero-layout">
            <HeroContent />
            <SignupCard />
          </section>
          <HowItWorksSection />
          <WhatYouWillLearnSection />
        </main>
      </div>
    </div>
  )
}

export default App
