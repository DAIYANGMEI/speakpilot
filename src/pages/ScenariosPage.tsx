import { Layout } from '../components/Layout'
import { PageHeader } from '../components/PageHeader'
import { ScenarioCard } from '../components/ScenarioCard'
import { scenarios } from '../data/content'

export function ScenariosPage() {
  return (
    <Layout>
      <PageHeader
        description="Pick a role, enter the conversation, and practice the exact situation you expect to face."
        eyebrow="Scenario Library"
        title="Jump into the exact conversation you need."
      />
      <section className="scenario-grid">
        {scenarios.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </section>
    </Layout>
  )
}
