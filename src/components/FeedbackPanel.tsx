import { Activity, Gauge, Timer, Volume2 } from 'lucide-react'
import type { CoachFeedback } from '../types'
import { ScoreCard } from './ScoreCard'

type FeedbackPanelProps = {
  feedback: CoachFeedback
  turns: number
  voiceEnabled: boolean
}

export function FeedbackPanel({ feedback, turns, voiceEnabled }: FeedbackPanelProps) {
  const latency =
    feedback.metrics.responseLatencyMs === null ? '--' : `${Math.round(feedback.metrics.responseLatencyMs)}ms`

  return (
    <aside className="feedback-panel">
      <section className="panel-block live-block">
        <p>Live Insight</p>
        <h2>{feedback.score || '--'}</h2>
        <span>{feedback.focusArea}</span>
      </section>

      <section className="metric-grid">
        <ScoreCard label="Voice" value={voiceEnabled ? 'On' : 'Off'} detail={feedback.pronunciation.confidence} />
        <ScoreCard label="Model" value={feedback.provider.source === 'model' ? 'Live' : 'Local'} detail={feedback.provider.model} />
        <ScoreCard label="Latency" value={latency} detail={feedback.metrics.speakingPace} />
        <ScoreCard label="Turns" value={turns} detail="conversation count" />
      </section>

      <section className="panel-block">
        <div className="block-title">
          <Gauge size={18} />
          <h3>Scores</h3>
        </div>
        <div className="score-list">
          <ProgressMetric label="Fluency" value={feedback.metrics.fluency} />
          <ProgressMetric label="Pronunciation" value={feedback.metrics.pronunciation} />
          <ProgressMetric label="Grammar" value={feedback.metrics.grammar} />
          <ProgressMetric label="Vocabulary" value={feedback.metrics.vocabulary} />
          <ProgressMetric label="Interaction" value={feedback.metrics.interaction} />
          <ProgressMetric label="Words" value={feedback.metrics.wordCount} max={40} />
        </div>
      </section>

      <section className="panel-block">
        <div className="block-title">
          <Activity size={18} />
          <h3>Strengths</h3>
        </div>
        <ul>
          {feedback.strengths.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="panel-block">
        <div className="block-title">
          <Timer size={18} />
          <h3>Improvements</h3>
        </div>
        <ul>
          {feedback.improvements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="panel-block voice-note">
        <Volume2 size={18} />
        <div>
          <strong>{feedback.suggestedRewrite}</strong>
          <span>{feedback.pronunciation.advice}</span>
        </div>
      </section>
    </aside>
  )
}

function ProgressMetric({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const percent = Math.max(0, Math.min(100, Math.round((value / max) * 100)))

  return (
    <div className="progress-metric">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="progress-track">
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
