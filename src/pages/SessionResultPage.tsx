import { useLocation } from 'react-router-dom'
import { Button } from '../components/Button'
import { Layout } from '../components/Layout'
import { PageHeader } from '../components/PageHeader'
import { ScoreCard } from '../components/ScoreCard'
import { initialFeedback, resultCorrections } from '../data/content'
import type { CoachFeedback } from '../types'

type ResultState = {
  feedback?: CoachFeedback
  title?: string
  turns?: number
}

export function SessionResultPage() {
  const location = useLocation()
  const state = (location.state ?? {}) as ResultState
  const feedback = state.feedback ?? initialFeedback

  return (
    <Layout>
      <PageHeader
        action={
          <Button to="/dashboard" variant="secondary">
            Back to Dashboard
          </Button>
        }
        description={`Session: ${state.title ?? 'Practice session'} · ${state.turns ?? 0} turns`}
        eyebrow="Session Result"
        title="Review your speaking result."
      />

      <section className="metric-grid result-overview">
        <ScoreCard label="Fluency score" value={feedback.metrics.fluency || 82} />
        <ScoreCard label="Pronunciation score" value={feedback.metrics.pronunciation || feedback.pronunciation.score || 78} />
        <ScoreCard label="Grammar score" value={feedback.metrics.grammar || 80} />
        <ScoreCard label="Vocabulary score" value={feedback.metrics.vocabulary || 76} />
      </section>

      <section className="result-layout">
        <article className="glass-card">
          <h2>Corrections</h2>
          {(feedback.corrections.length > 1 ? feedback.corrections : []).map((item) => (
            <div className="correction-row" key={item.issue}>
              <span>{item.issue}</span>
              <strong>{item.suggestion}</strong>
              <p>{item.reason}</p>
            </div>
          ))}
          {feedback.corrections.length <= 1
            ? resultCorrections.map((item) => (
                <div className="correction-row" key={item.before}>
                  <span>{item.before}</span>
                  <strong>{item.after}</strong>
                  <p>{item.note}</p>
                </div>
              ))
            : null}
        </article>

        <article className="glass-card">
          <h2>Better expressions</h2>
          <p>{feedback.suggestedRewrite}</p>
          <h3>Useful phrases</h3>
          <ul>
            {feedback.vocabulary.map((item) => (
              <li key={item.phrase}>
                <strong>{item.phrase}</strong>
                <span>{item.meaning}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="glass-card">
          <h2>Next practice prompt</h2>
          <p>{feedback.nextPrompt}</p>
          <h3>Homework</h3>
          <ul>
            {feedback.sessionSummary.homework.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </Layout>
  )
}
