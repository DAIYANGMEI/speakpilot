import { ArrowRight, PlayCircle } from 'lucide-react'
import { Button } from '../components/Button'
import { Layout } from '../components/Layout'
import { landingStats } from '../data/content'
import heroProductPromo from '../assets/hero-product-promo.png'

export function LandingPage() {
  return (
    <Layout compact>
      <section className="landing-hero">
        <div className="hero-copy">
          <p className="eyebrow">AI English speaking coach</p>
          <h1>
            Your English, <span>under control</span>
          </h1>
          <strong>
            Practice real conversations, get instant correction, and hear a natural coach reply in one smooth flow.
          </strong>
          <div className="hero-actions">
            <Button icon={<PlayCircle size={20} />} to="/dashboard">
              Start Practice
            </Button>
            <Button icon={<ArrowRight size={20} />} to="/scenarios" variant="secondary">
              Explore Scenes
            </Button>
          </div>
          <div className="landing-stats">
            {landingStats.map((stat) => {
              const Icon = stat.icon

              return (
                <article key={stat.label}>
                  <Icon size={22} />
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              )
            })}
          </div>
        </div>

        <div className="hero-card hero-product-shot" aria-label="SpeakPilot product preview">
          <img alt="SpeakPilot AI English coach promotional product preview" src={heroProductPromo} />
        </div>
      </section>
    </Layout>
  )
}
