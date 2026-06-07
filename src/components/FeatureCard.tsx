import { ArrowRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import type { FeatureLink } from '../types'

type FeatureCardProps = {
  feature: FeatureLink
}

export function FeatureCard({ feature }: FeatureCardProps) {
  const location = useLocation()
  const Icon = feature.icon
  const isActive = location.pathname === feature.to

  return (
    <Link className={isActive ? 'feature-card active' : 'feature-card'} to={feature.to}>
      <div className="feature-icon">
        <Icon size={22} />
      </div>
      <div>
        <p>{feature.label}</p>
        <h3>{feature.title}</h3>
        <span>{feature.description}</span>
      </div>
      <ArrowRight className="feature-arrow" size={20} />
    </Link>
  )
}
