import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Building2,
  CalendarDays,
  Grid2X2,
  LogOut,
  Settings as SettingsIcon,
  ShieldCheck,
  WalletCards,
  Wrench,
} from 'lucide-react'
import './Settings.css'

function Settings() {
  const navigate = useNavigate()
  const dashboardPath = localStorage.getItem('prmsDashboardPath') || '/admin'

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="side-icon" onClick={() => navigate(dashboardPath)}>
          <Grid2X2 size={28} />
        </div>

        <div className="side-icon" onClick={() => navigate('/properties')}>
          <Building2 size={26} />
        </div>

        <div className="side-icon">
          <CalendarDays size={26} />
        </div>

        <div className="side-icon">
          <WalletCards size={26} />
        </div>

        <div className="side-icon">
          <Wrench size={26} />
        </div>

        <div className="side-icon active">
          <SettingsIcon size={26} />
        </div>

        <div className="side-bottom">
          <div className="side-icon logout" onClick={() => navigate('/login')}>
            <LogOut size={25} />
          </div>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div className="admin-brand" onClick={() => navigate(dashboardPath)}>
            <h2>PRMS</h2>
            <span></span>
            <p>PRMS Settings</p>
          </div>

          <div className="admin-top-actions">
            <Bell size={24} />
            <div className="profile-avatar">AS</div>
          </div>
        </header>

        <div className="admin-content">
          <div className="admin-title-row">
            <div>
              <h1>Settings</h1>
              <p>Manage account preferences, security, notifications, and system options.</p>
            </div>
          </div>

          <section className="settings-grid">
            <div className="settings-card">
              <div className="settings-card-icon purple">
                <SettingsIcon size={28} />
              </div>

              <h2>Account Settings</h2>
              <p>Update profile details, email address, contact number, and password.</p>

              <button type="button">Manage Account</button>
            </div>

            <div className="settings-card">
              <div className="settings-card-icon blue">
                <Bell size={28} />
              </div>

              <h2>Notification Settings</h2>
              <p>Control alerts for rent, bookings, maintenance updates, and reminders.</p>

              <button type="button">Manage Notifications</button>
            </div>

            <div className="settings-card">
              <div className="settings-card-icon red">
                <ShieldCheck size={28} />
              </div>

              <h2>Security Settings</h2>
              <p>Review login activity, enable verification, and manage session access.</p>

              <button type="button">Manage Security</button>
            </div>

            <div className="settings-card">
              <div className="settings-card-icon green">
                <Building2 size={28} />
              </div>

              <h2>System Preferences</h2>
              <p>Adjust dashboard layout, property display, language, and system theme.</p>

              <button type="button" onClick={() => {
                const base = dashboardPath === '/tenant' ? '/tenant' : dashboardPath === '/landlord' ? '/landlord' : '/admin';
                navigate(`${base}/settings/customizer`);
              }}>Manage Preferences</button>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}

export default Settings