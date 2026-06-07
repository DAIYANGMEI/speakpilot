import { BookOpen, Brain, MessageSquareText, Sparkles, X } from 'lucide-react'
import { useState } from 'react'

type CompanionTab = 'memory' | 'review' | 'phrases'
type CompanionMood = 'idle' | 'hop' | 'wave' | 'spin' | 'sparkle' | 'peek'

const tabs = [
  {
    id: 'memory',
    label: '记忆',
    icon: BookOpen,
    title: 'Today memory card',
    body: 'I would like to check in, please.',
  },
  {
    id: 'review',
    label: '复习',
    icon: Brain,
    title: 'Review cue',
    body: 'Try one answer with because, then ask a follow-up question.',
  },
  {
    id: 'phrases',
    label: '短语',
    icon: MessageSquareText,
    title: 'Useful phrase',
    body: 'Could you please help me confirm the booking?',
  },
] satisfies Array<{
  id: CompanionTab
  label: string
  icon: typeof BookOpen
  title: string
  body: string
}>

export function StudyCompanion() {
  const [isOpen, setIsOpen] = useState(false)
  const [tab, setTab] = useState<CompanionTab>('memory')
  const [mood, setMood] = useState<CompanionMood>('idle')
  const [actionCount, setActionCount] = useState(0)
  const activeTab = tabs.find((item) => item.id === tab) ?? tabs[0]

  function nudge() {
    const moods: CompanionMood[] = ['hop', 'wave', 'spin', 'sparkle', 'peek']
    const nextCount = actionCount + 1
    setActionCount(nextCount)
    setMood(moods[nextCount % moods.length])
    setIsOpen(true)
  }

  return (
    <div className="study-companion">
      {isOpen ? (
        <section className="companion-panel">
          <header>
            <div>
              <p>Study Companion</p>
              <h2>练习小助手</h2>
            </div>
            <button aria-label="Close companion" onClick={() => setIsOpen(false)} type="button">
              <X size={18} />
            </button>
          </header>

          <div className="companion-tabs">
            {tabs.map((item) => {
              const Icon = item.icon

              return (
                <button className={item.id === tab ? 'active' : ''} key={item.id} onClick={() => setTab(item.id)} type="button">
                  <Icon size={16} />
                  {item.label}
                </button>
              )
            })}
          </div>

          <article>
            <span>{activeTab.title}</span>
            <strong>{activeTab.body}</strong>
          </article>
        </section>
      ) : null}

      <button
        aria-label="Open study companion"
        className={`companion-orb mood-${mood}`}
        onClick={nudge}
        type="button"
      >
        <span className="companion-shadow" />
        <span className="companion-body">
          <span className="companion-ears">
            <i />
            <i />
          </span>
          <span className="companion-arms">
            <i />
            <i />
          </span>
          <span className="companion-face">
            <i />
            <i />
            <em />
            <em />
            <b />
          </span>
          <span className="companion-gloss" />
        </span>
        <span className="companion-bubble">{isOpen ? activeTab.label : 'Hi'}</span>
        <Sparkles className="companion-sparkle" size={18} />
      </button>
    </div>
  )
}
