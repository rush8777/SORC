import Header from './components/layout/Header'
import HeroContent from './components/hero/HeroContent'
import SignupCard from './components/hero/SignupCard'
import HowItWorksSection from './components/sections/HowItWorksSection'

function App() {
  return (
    <div className="page-shell">
      <div className="page-grid" aria-hidden="true" />
      <Header />
      <main>
        <section className="hero-layout">
          <HeroContent />
          <SignupCard />
        </section>
        <HowItWorksSection />
      </main>
    </div>
  )
}

export default App
