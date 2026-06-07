import { useState } from 'react'
import { Button } from '../components/Button'
import { Layout } from '../components/Layout'
import { PageHeader } from '../components/PageHeader'
import { Sidebar } from '../components/Sidebar'

export function GrammarClinicPage() {
  const [text, setText] = useState('I very like this project because it can help me speaking English.')
  const [checked, setChecked] = useState(false)

  return (
    <Layout>
      <section className="tool-layout">
        <Sidebar />
        <main className="tool-main">
          <PageHeader
            description="Paste one sentence and review a corrected, more natural version."
            eyebrow="Grammar Clinic"
            title="Make your sentence sound natural."
          />
          <section className="glass-card form-card">
            <textarea onChange={(event) => setText(event.target.value)} value={text} />
            <Button onClick={() => setChecked(true)}>Check Grammar</Button>
          </section>

          {checked ? (
            <section className="result-grid">
              <ResultBlock label="Original sentence" value={text} />
              <ResultBlock
                label="Corrected sentence"
                value="I really like this project because it can help me improve my spoken English."
              />
              <ResultBlock
                label="Explanation"
                value='"Very like" is not natural in English. Use "really like". After "help me", use the base verb "improve".'
              />
              <ResultBlock
                label="More natural expression"
                value="I really like this project because it gives learners a practical way to improve spoken English."
              />
              <ResultBlock
                label="Example sentence"
                value="This tool helps me practice English in realistic situations before I use it in real life."
              />
            </section>
          ) : null}
        </main>
      </section>
    </Layout>
  )
}

function ResultBlock({ label, value }: { label: string; value: string }) {
  return (
    <article className="result-block">
      <span>{label}</span>
      <p>{value}</p>
    </article>
  )
}
