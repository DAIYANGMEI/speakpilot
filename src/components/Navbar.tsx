import { NavLink } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Button } from './Button'

const navItems = [
  { label: 'Product', to: '/' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Scenes', to: '/scenarios' },
  { label: 'Coach', to: '/coach' },
]

export function Navbar() {
  return (
    <header className="navbar">
      <NavLink className="brand" to="/">
        <span className="brand-mark">
          <Sparkles size={18} />
        </span>
        <span>SPEAKPILOT</span>
      </NavLink>

      <nav aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            end={item.to === '/'}
            key={item.to}
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Button to="/login" variant="secondary">
        Log in
      </Button>
    </header>
  )
}
