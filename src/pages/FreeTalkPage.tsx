import { useState } from 'react'
import { ChatBox } from '../components/ChatBox'
import { FeedbackPanel } from '../components/FeedbackPanel'
import { Layout } from '../components/Layout'
import { LevelSelector } from '../components/LevelSelector'
import { Sidebar } from '../components/Sidebar'
import { freeTalkRoles, initialFeedback } from '../data/content'
import type { CoachFeedback, LearnerLevel } from '../types'

export function FreeTalkPage() {
  const [selectedRole, setSelectedRole] = useState(freeTalkRoles[0])
  const [feedback, setFeedback] = useState<CoachFeedback>(initialFeedback)
  const [turns, setTurns] = useState(0)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [level, setLevel] = useState<LearnerLevel>('B1')

  return (
    <Layout>
      <section className="coach-layout">
        <Sidebar />
        <main className="coach-main">
          <div className="coach-toolbar">
            <div>
              <p>Free Talk</p>
              <h1>自由对话</h1>
            </div>
            <LevelSelector onChange={setLevel} value={level} />
          </div>

          <section className="role-selector">
            {freeTalkRoles.map((role) => (
              <button
                className={role.title === selectedRole.title ? 'active' : ''}
                key={role.title}
                onClick={() => setSelectedRole(role)}
                type="button"
              >
                {role.title}
              </button>
            ))}
          </section>

          <ChatBox
            key={selectedRole.title}
            mode="freeTalk"
            onFeedbackChange={setFeedback}
            onTurnsChange={setTurns}
            onVoiceChange={setVoiceEnabled}
            openingMessage="Let us talk freely. What is something you worked on or enjoyed recently?"
            placeholder="Tell me anything you want to discuss, then ask a follow-up question."
            roleName={selectedRole.title}
            rolePrompt={selectedRole.prompt}
            subtitle="No fixed scene. Build natural conversation rhythm."
            targetLevel={level}
            title={selectedRole.title}
          />
        </main>
        <FeedbackPanel feedback={feedback} turns={turns} voiceEnabled={voiceEnabled} />
      </section>
    </Layout>
  )
}
