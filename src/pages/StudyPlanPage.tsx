import { useState } from 'react'
import { Button } from '../components/Button'
import { Layout } from '../components/Layout'
import { LevelSelector } from '../components/LevelSelector'
import { PageHeader } from '../components/PageHeader'
import { Sidebar } from '../components/Sidebar'
import { mockStudyPlan } from '../data/content'
import type { LearnerLevel } from '../types'

const goals = ['Daily conversation', 'Business English', 'Interview', 'Travel']
const dailyTimes = ['10 minutes', '20 minutes', '30 minutes']

export function StudyPlanPage() {
  const [level, setLevel] = useState<LearnerLevel>('B1')
  const [goal, setGoal] = useState(goals[0])
  const [dailyTime, setDailyTime] = useState(dailyTimes[1])
  const [generated, setGenerated] = useState(false)

  return (
    <Layout>
      <section className="tool-layout">
        <Sidebar />
        <main className="tool-main">
          <PageHeader
            description="Choose your level, target situation, and daily time to generate a focused seven-day plan."
            eyebrow="Study Plan"
            title="Build a small plan you can actually finish."
          />

          <section className="glass-card plan-builder">
            <div>
              <span>Level</span>
              <LevelSelector onChange={setLevel} value={level} />
            </div>
            <SelectGroup label="Goal" onSelect={setGoal} options={goals} value={goal} />
            <SelectGroup label="Daily time" onSelect={setDailyTime} options={dailyTimes} value={dailyTime} />
            <Button onClick={() => setGenerated(true)}>Generate Plan</Button>
          </section>

          {generated ? (
            <section className="timeline-card">
              <p>
                {level} · {goal} · {dailyTime}
              </p>
              {mockStudyPlan.map((item) => (
                <article key={item}>
                  <span />
                  <p>{item}</p>
                </article>
              ))}
            </section>
          ) : null}
        </main>
      </section>
    </Layout>
  )
}

function SelectGroup({
  label,
  options,
  value,
  onSelect,
}: {
  label: string
  options: string[]
  value: string
  onSelect: (option: string) => void
}) {
  return (
    <div className="select-group">
      <span>{label}</span>
      <div>
        {options.map((option) => (
          <button className={option === value ? 'active' : ''} key={option} onClick={() => onSelect(option)} type="button">
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
