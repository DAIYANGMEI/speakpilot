import { NavLink, useLocation } from 'react-router-dom'
import { sidebarItems } from '../data/content'

export function Sidebar() {
  const location = useLocation()

  function isItemActive(to: string) {
    if (to === '/scenarios') {
      return location.pathname === '/scenarios' || location.pathname.startsWith('/coach')
    }

    return location.pathname === to
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <p>Coach Mode</p>
        <h2>训练模式</h2>
      </div>
      <nav aria-label="Coach modes">
        {sidebarItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink className={isItemActive(item.to) ? 'sidebar-item active' : 'sidebar-item'} key={item.to} to={item.to}>
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
