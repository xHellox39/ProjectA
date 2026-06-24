import { useEffect } from 'react'
import { useSettings } from '../contexts/SettingsContext'
import {
  Download,
  Gauge,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  WalletCards,
} from 'lucide-react'
import './AdminDashboard.css'

function AdminDashboard() {
  const { settings } = useSettings()
  useEffect(() => {
    localStorage.setItem('prmsDashboardPath', '/admin')
  }, [])

  const users = [
    {
      initials: 'JD',
      name: 'Julianna DeWitt',
      email: 'julianna.d@prms.com',
      role: 'Landlord',
      status: 'Verified',
      activity: '2 mins ago',
    },
    {
      initials: 'MC',
      name: 'Marcus Chen',
      email: 'm.chen@outlook.com',
      role: 'Tenant',
      status: 'Pending KYC',
      activity: '1 hour ago',
    },
    {
      initials: 'SA',
      name: 'Sarah Al-Zaid',
      email: 'admin.sarah@prms.sys',
      role: 'Admin',
      status: 'Active',
      activity: 'Now',
    },
  ]

  const auditLogs = [
    {
      time: '14:22:01',
      title: 'USER_LOGIN_SUCCESS',
      detail: 'UID: 4421-XB | IP: 192.168.1.104',
      type: 'success',
    },
    {
      time: '14:21:45',
      title: 'AUTH_FAILURE_RESTRICTED',
      detail: 'Unauthorized API attempt on financials',
      type: 'danger',
    },
    {
      time: '14:20:12',
      title: 'TRANSACTION_CLEARED',
      detail: 'Ref: RM-8892 | RM 12,500.00',
      type: 'success',
    },
  ]

  return (
    <>
      <section className="admin-dash-hero">
        <div>
          <h1>System Health Console</h1>
          <p>Infrastructure monitoring and global operations audit overview.</p>
        </div>

        <div className="admin-dash-actions">
          <button type="button" className="admin-dash-light-btn">
            <SlidersHorizontal size={18} />
            Filter
          </button>

          <button type="button" className="admin-dash-dark-btn">
            <Download size={18} />
            Export
          </button>
        </div>
      </section>

      <section className="admin-dash-metrics">
        <article className="admin-dash-metric-card">
          <div className="admin-dash-metric-icon green">
            <Gauge size={27} />
          </div>

          <div>
            <p>Uptime</p>
            <h3>99.98%</h3>
          </div>

          <div className="admin-dash-progress">
            <span></span>
          </div>
        </article>

        <article className="admin-dash-metric-card">
          <div className="admin-dash-metric-icon purple">
            <WalletCards size={27} />
          </div>

          <div>
            <p>Transactions</p>
            <h3>RM 4.2M</h3>
          </div>

          <strong className="admin-dash-growth">+12%</strong>
        </article>

        <article className="admin-dash-metric-card">
          <div className="admin-dash-metric-icon blue">
            <Users size={27} />
          </div>

          <div>
            <p>Active Users</p>
            <h3>12,482</h3>
          </div>
        </article>

        <article className="admin-dash-metric-card">
          <div className="admin-dash-metric-icon red">
            <ShieldCheck size={27} />
          </div>

          <div>
            <p>Integrity</p>
            <h3>Secure</h3>
          </div>

          <strong className="admin-dash-alert">2 Alerts</strong>
        </article>
      </section>

      <section className="admin-dash-lower">
        <article className="admin-dash-directory">
          <div className="admin-dash-panel-header">
            <h2>User Directory</h2>

            <div className="admin-dash-search">
              <Search size={17} />
              <input type="text" placeholder="Search users..." />
            </div>
          </div>

          <div className="admin-dash-table">
            <div className="admin-dash-table-head">
              <p>User</p>
              <p>Role</p>
              <p>Status</p>
              <p>Activity</p>
            </div>

            {users.map((user) => (
              <div className="admin-dash-table-row" key={user.email}>
                <div className="admin-dash-user-cell">
                  <div className="admin-dash-user-avatar">{user.initials}</div>

                  <div>
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                  </div>
                </div>

                <div>
                  <span className={`admin-dash-role ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </div>

                <div>
                  <span
                    className={`admin-dash-status ${
                      user.status === 'Pending KYC' ? 'pending' : 'active'
                    }`}
                  >
                    {user.status}
                  </span>
                </div>

                <p className="admin-dash-activity">{user.activity}</p>
              </div>
            ))}
          </div>
        </article>

        <aside className="admin-dash-right">
          <article className="admin-dash-audit">
            <div className="admin-dash-audit-header">
              <h2>Global Audit Log</h2>
              <span>
                <i></i>
                LIVE
              </span>
            </div>

            <div className="admin-dash-audit-list">
              {auditLogs.map((log) => (
                <div
                  className={`admin-dash-audit-item ${log.type}`}
                  key={`${log.time}-${log.title}`}
                >
                  <p>{log.time}</p>

                  <div>
                    <h3>{log.title}</h3>
                    <span>{log.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="admin-dash-notes">
            <h2>Operational Notes</h2>
            <p>12 clusters online across Southeast Asia.</p>

            <div className="admin-dash-clusters">
              <div>
                <span>KL</span>
                <strong>8.2k</strong>
              </div>

              <div>
                <span>SG</span>
                <strong>4.1k</strong>
              </div>
            </div>
          </article>
        </aside>
      </section>
    </>
  )
}

export default AdminDashboard