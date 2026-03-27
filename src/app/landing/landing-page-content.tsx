import { LandingNavbar } from './components/navbar'
import { HeroSection } from './components/hero-section'
import { StatsSection } from './components/stats-section'
import { FeaturesSection } from './components/features-section'
import { TestimonialsSection } from './components/testimonials-section'
import { FaqSection } from './components/faq-section'
import { CTASection } from './components/cta-section'
import { LandingFooter } from './components/footer'
export function LandingPageContent() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <TestimonialsSection />
        <FaqSection />
        <CTASection />
      </main>

      <LandingFooter />
    </div>
  )
}
