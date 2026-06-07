import { BarChart3, TrendingUp } from 'lucide-react'
import { Layout } from '../components/Layout'
import { PageHeader } from '../components/PageHeader'
import { ScoreCard } from '../components/ScoreCard'
import { Sidebar } from '../components/Sidebar'
import { progressRecords } from '../data/content'

export function ProgressPage() {
  return (
    <Layout>
      <section className="tool-layout">
        <Sidebar />
        <main className="tool-main">
          <PageHeader
            description="A mock progress dashboard for practice history, score movement, and learned vocabulary."
            eyebrow="Progress"
            title="Track your speaking practice."
          />

          <section className="metric-grid progress-overview">
            <ScoreCard label="Total practice sessions" value="18" detail="this month" />
            <ScoreCard label="Average score" value="82" detail="+6 from last week" />
            <ScoreCard label="Vocabulary learned" value="64" detail="useful expressions" />
            <ScoreCard label="Recent streak" value="5 days" detail="keep going" />
          </section>

          <section className="glass-card trend-card">
            <div>
              <BarChart3 size={22} />
              <h2>Fluency trend</h2>
            </div>
            <div className="trend-bars">
              {[52, 60, 68, 72, 78, 82, 86].map((value, index) => (
                <span key={`${value}-${index}`} style={{ height: `${value}%` }} />
              ))}
            </div>
          </section>

          <section className="record-list">
            <div className="block-title">
              <TrendingUp size={18} />
              <h3>Recent practice records</h3>
            </div>
            {progressRecords.map((record) => (
              <article key={`${record.scene}-${record.time}`}>
                <div>
                  <strong>{record.scene}</strong>
                  <span>{record.focus}</span>
                </div>
                <b>{record.score}</b>
                <small>{record.time}</small>
              </article>
            ))}
          </section>
        </main>
      </section>
    </Layout>
  )
}
