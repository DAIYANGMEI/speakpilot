import { Navigate, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { ChatBox } from '../components/ChatBox'
import { FeedbackPanel } from '../components/FeedbackPanel'
import { Layout } from '../components/Layout'
import { LevelSelector } from '../components/LevelSelector'
import { Sidebar } from '../components/Sidebar'
import { initialFeedback, scenarios } from '../data/content'
import type { CoachFeedback, LearnerLevel } from '../types'

export function CoachPage() {
  const { scenarioId } = useParams()
  const scenario = useMemo(
    () => scenarios.find((item) => item.id === (scenarioId ?? 'airport-checkin')),
    [scenarioId],
  )
  const [feedback, setFeedback] = useState<CoachFeedback>(initialFeedback)
  const [turns, setTurns] = useState(0)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [level, setLevel] = useState<LearnerLevel>('B1')

  if (!scenario) {
    return <Navigate replace to="/scenarios" />
  }

  return (
    <Layout>
      <section className="coach-layout">
        <Sidebar />
        <main className="coach-main">
          <div className="coach-toolbar">
            <div>
              <p>{scenario.titleEn}</p>
              <h1>{scenario.titleZh}</h1>
            </div>
            <LevelSelector onChange={setLevel} value={level} />
          </div>
          <ChatBox
            key={scenario.id}
            mode="scenario"
            onFeedbackChange={setFeedback}
            onTurnsChange={setTurns}
            onVoiceChange={setVoiceEnabled}
            openingMessage={scenario.openingMessage}
            placeholder="Answer the coach in English."
            roleName={scenario.characterName}
            rolePrompt={scenario.systemPrompt}
            scenario={scenario}
            subtitle={`${scenario.characterName}, ${scenario.characterRole}`}
            targetLevel={level}
            title={scenario.titleZh}
          />
        </main>
        <FeedbackPanel feedback={feedback} turns={turns} voiceEnabled={voiceEnabled} />
      </section>
    </Layout>
  )
}
