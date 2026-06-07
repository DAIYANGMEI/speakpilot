import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Scenario } from '../types'

type ScenarioCardProps = {
  scenario: Scenario
}

export function ScenarioCard({ scenario }: ScenarioCardProps) {
  return (
    <Link className={`scenario-card ${scenario.accent}`} to={`/coach/${scenario.id}`}>
      <div className="scenario-visual">
        <img alt="" src={scenario.image} />
        <span>{scenario.level}</span>
      </div>
      <div className="scenario-copy">
        <p>{scenario.titleEn}</p>
        <h3>{scenario.titleZh}</h3>
        <span>{scenario.descriptionEn}</span>
      </div>
      <div className="scenario-role">
        <strong>{scenario.characterName}</strong>
        <small>{scenario.characterRole}</small>
      </div>
      <div className="scenario-skills">
        {scenario.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
      <ArrowRight className="scenario-arrow" size={20} />
    </Link>
  )
}
