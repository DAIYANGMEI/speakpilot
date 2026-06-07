type ScoreCardProps = {
  label: string
  value: string | number
  detail?: string
}

export function ScoreCard({ label, value, detail }: ScoreCardProps) {
  return (
    <article className="score-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </article>
  )
}
