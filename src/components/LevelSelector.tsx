import { levels } from '../data/content'
import type { LearnerLevel } from '../types'

type LevelSelectorProps = {
  value: LearnerLevel
  onChange: (level: LearnerLevel) => void
}

export function LevelSelector({ value, onChange }: LevelSelectorProps) {
  return (
    <div className="level-selector" aria-label="Level selector">
      {levels.map((level) => (
        <button className={level === value ? 'active' : ''} key={level} onClick={() => onChange(level)} type="button">
          {level}
        </button>
      ))}
    </div>
  )
}
