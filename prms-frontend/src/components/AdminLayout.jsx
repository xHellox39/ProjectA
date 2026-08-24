import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CircleHelp,
  LogOut,
  Search,
} from 'lucide-react'
import PageTransition from './PageTransition'
import { useAuth } from '../contexts/AuthContext'
import { buildNavItems, resolveActivePage } from './NavigationConfig'
import NotificationDropdown from './NotificationDropdown'
import './AdminLayout.css'

function getTopbarTitle(activePage) {
  const titles = {
    dashboard: 'Admin Dashboard',
    users: 'User Management',
    properties: 'Property Management',
    bookings: 'Booking Management',
    finance: 'Finance Console',
    maintenance: 'Maintenance Center',
    messages: 'Admin Messages',
    reports: 'Reports & Audit',
    settings: 'Admin Settings',
    help: 'Admin Help Center',
  }
  return titles[activePage] || 'Admin Dashboard'
}

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const role = user?.role || 'Admin'
  const navItems = buildNavItems(role)
  const activePage = resolveActivePage(location.pathname, role)

  const initials = user
    ? (user.full_name || user.name || 'AS').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AS'
  const displayName = user?.full_name || user?.name || '—'

  function safeNavigate(path) {
    if (location.pathname !== path) navigate(path)
  }

  function handleLogout() {
    logout(navigate)
  }

  return (
    <main className="admin-layout-shell">
      <aside className="admin-layout-sidebar">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.key
          return (
            <motion.button
              type="button"
              key={item.key}
              className={`admin-layout-side-btn ${isActive ? 'active' : ''}`}
              onClick={() => safeNavigate(item.path)}
              title={item.label}
              whileTap={{ scale: 0.96 }}
            >
              <Icon size={25} />
              <span>{item.label}</span>
            </motion.button>
          )
        })}

        <div className="admin-layout-side-spacer"></div>

        <motion.button
          type="button"
          className={`admin-layout-side-btn ${activePage === 'help' ? 'active' : ''}`}
          onClick={() => safeNavigate('/admin/help')}
          title="Help"
          whileTap={{ scale: 0.96 }}
        >
          <CircleHelp size={24} />
          <span>Help</span>
        </motion.button>

        <motion.button
          type="button"
          className="admin-layout-side-btn logout"
          onClick={handleLogout}
          title="Logout"
          whileTap={{ scale: 0.96 }}
        >
          <LogOut size={24} />
          <span>Logout</span>
        </motion.button>
      </aside>

      <section className="admin-layout-main">
        <header className="admin-layout-topbar">
          <div className="admin-layout-brand" onClick={() => safeNavigate('/admin')}>
            <h2>PRMS</h2>
            <span></span>
            <p>{getTopbarTitle(activePage)}</p>
          </div>

          <div className="admin-layout-search">
            <Search size={22} />
            <input type="text" placeholder="Search..." />
          </div>

          <div className="admin-layout-top-actions">
            <NotificationDropdown />

            <motion.div className="admin-layout-profile" whileHover={{ scale: 1.02 }}>
              <div>
                <h3>{displayName}</h3>
                <p>{role}</p>
              </div>

              <div className="admin-layout-avatar">{initials}</div>
            </motion.div>
          </div>
        </header>

        <div className="admin-layout-content">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </section>
    </main>
  )
}

export default AdminLayout
