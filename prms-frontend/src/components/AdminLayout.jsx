import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CircleHelp,
  LogOut,
} from 'lucide-react'
import PageTransition from './PageTransition'
import { useAuth } from '../contexts/AuthContext'
import useBranding from '../hooks/useBranding'
import { buildNavItems, resolveActivePage } from './NavigationConfig'
import NotificationDropdown from './NotificationDropdown'
import ThemeSwitcher from './ThemeSwitcher'
import { getFullUrl } from '../config/apiBaseUrl'
import './AdminLayout.css'

function getTopbarTitle(activePage) {
  const titles = {
    dashboard: 'Admin Dashboard',
    notifications: 'Notification Center',
    users: 'User Management',
    properties: 'Property Management',
    bookings: 'Booking Management',
    finance: 'Finance Console',
    maintenance: 'Maintenance Center',
    messages: 'Admin Messages',
    reports: 'Reports & Audit',
    categories: 'Category Management',
    settings: 'Admin Settings',
    help: 'Admin Help Center',
  }
  return titles[activePage] || 'Admin Dashboard'
}

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { name, logoUrl } = useBranding()

  const role = user?.role || 'Admin'
  const navItems = buildNavItems(role)
  const activePage = resolveActivePage(location.pathname, role)

  const initials = user
    ? (user.full_name || user.name || 'AS').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AS'

  const profileImgUrl = user?.profile_img_url ? getFullUrl(user.profile_img_url) : null;

  function safeNavigate(path) {
    if (location.pathname !== path) navigate(path)
  }

  function handleLogout() {
    logout(navigate)
  }

  return (
    <main className="admin-layout-shell">
      <aside className="admin-layout-sidebar" data-customize-id="global.sidebar">
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
        <header className="admin-layout-topbar" data-customize-id="global.header">
          <div className="admin-layout-brand" onClick={() => safeNavigate('/admin')}>
            <span>{logoUrl ? <img src={logoUrl} alt="logo" style={{height:'32px',width:'32px',borderRadius:'6px',objectFit:'cover'}} /> : null}</span>
            <h2>{name}</h2>
            <p>{getTopbarTitle(activePage)}</p>
          </div>

          <div className="admin-layout-top-actions">
            <NotificationDropdown />
            <ThemeSwitcher />

            <motion.div
              className="admin-layout-avatar"
              whileHover={{ scale: 1.08 }}
              style={{ cursor: 'pointer' }}
              onClick={() => safeNavigate('/admin/profile')}
            >
              {profileImgUrl ? (
                <img
                  src={profileImgUrl}
                  alt={user?.full_name || 'Admin'}
                  className="admin-layout-avatar-img"
                />
              ) : (
                initials
              )}
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
