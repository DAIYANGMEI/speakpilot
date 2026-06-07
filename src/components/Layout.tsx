import type { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { StudyCompanion } from './StudyCompanion'

type LayoutProps = {
  children: ReactNode
  compact?: boolean
}

export function Layout({ children, compact = false }: LayoutProps) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className={compact ? 'page page-compact' : 'page'}>{children}</main>
      <StudyCompanion />
    </div>
  )
}
