import { useState } from 'react'
import { Button } from '../components/Button'
import { Layout } from '../components/Layout'
import { PageHeader } from '../components/PageHeader'
import { Sidebar } from '../components/Sidebar'
import { phraseCategories, phrasesByCategory } from '../data/content'

export function PhrasesPage() {
  const [category, setCategory] = useState(phraseCategories[0])
  const phrases = phrasesByCategory[category]

  return (
    <Layout>
      <section className="tool-layout">
        <Sidebar />
        <main className="tool-main">
          <PageHeader
            description="Collect expressions that can be used directly in speech, then send them into practice."
            eyebrow="Phrases"
            title="Build a phrase bank for real conversations."
          />

          <section className="category-tabs">
            {phraseCategories.map((item) => (
              <button className={item === category ? 'active' : ''} key={item} onClick={() => setCategory(item)} type="button">
                {item}
              </button>
            ))}
          </section>

          <section className="phrase-grid">
            {phrases.map((phrase) => (
              <article className="phrase-card" key={phrase.phrase}>
                <span>{phrase.meaning}</span>
                <h3>{phrase.phrase}</h3>
                <p>{phrase.example}</p>
                <Button to="/free-talk" variant="secondary">
                  Practice in Free Talk
                </Button>
              </article>
            ))}
          </section>
        </main>
      </section>
    </Layout>
  )
}
