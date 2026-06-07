import { Rocket } from 'lucide-react'
import { Button } from '../components/Button'
import { FeatureCard } from '../components/FeatureCard'
import { Layout } from '../components/Layout'
import { PageHeader } from '../components/PageHeader'
import { featureLinks } from '../data/content'
import { useRuntimeStatus } from '../hooks/useRuntimeStatus'

export function DashboardPage() {
  const { runtime, isChecking } = useRuntimeStatus()
  const user = window.localStorage.getItem('speakpilot-user') || 'Guest'

  return (
    <Layout>
      <section className="dashboard-top">
        <div>
          <p>SPEAKPILOT</p>
          <h1>英语口语教练</h1>
        </div>
        <div className="status-pills">
          <span className={runtime?.configured ? 'ready' : 'local'}>
            {isChecking ? 'Checking Model' : runtime?.configured ? 'Model Ready' : 'Local Fallback'}
          </span>
          <span>{user}</span>
        </div>
      </section>

      <PageHeader
        action={
          <Button icon={<Rocket size={20} />} to="/coach">
            Open Coach
          </Button>
        }
        description="Choose a focused practice mode. Each page is separated so the product feels like a real learning system instead of one long scroll."
        eyebrow="Dashboard"
        title="What would you like to practice today?"
      />

      <section className="feature-grid">
        {featureLinks.map((feature) => (
          <FeatureCard feature={feature} key={feature.to} />
        ))}
      </section>
    </Layout>
  )
}
