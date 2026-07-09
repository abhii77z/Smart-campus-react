import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getUser, clearUser } from '../services/api'

const navConfig = {
  admin: [
    {
      section: 'Overview', items: [
        { to: '/admin/dashboard', icon: 'fas fa-th-large', label: 'Dashboard' },
      ]
    },
    {
      section: 'Management', items: [
        { to: '/admin/users', icon: 'fas fa-users', label: 'Users' },
        { to: '/admin/approvals', icon: 'fas fa-user-check', label: 'Approvals' },
        { to: '/admin/departments', icon: 'fas fa-building', label: 'Departments' },
        { to: '/admin/courses', icon: 'fas fa-graduation-cap', label: 'Courses' },
      ]
    },
    {
      section: 'Campus', items: [
        { to: '/admin/announcements', icon: 'fas fa-bullhorn', label: 'Announcements' },
        { to: '/admin/events', icon: 'fas fa-calendar-star', label: 'Events' },
        { to: '/admin/timetable', icon: 'fas fa-calendar-week', label: 'Timetable' },
        { to: '/admin/faqs', icon: 'fas fa-question-circle', label: 'FAQs' },
      ]
    },
    {
      section: 'System', items: [
        { to: '/admin/settings', icon: 'fas fa-cog', label: 'Settings' },
      ]
    },
  ],
  faculty: [
    {
      section: 'Overview', items: [
        { to: '/faculty/dashboard', icon: 'fas fa-th-large', label: 'Dashboard' },
      ]
    },
    {
      section: 'Academics', items: [
        { to: '/faculty/timetable', icon: 'fas fa-calendar-week', label: 'Timetable' },
        { to: '/faculty/attendance', icon: 'fas fa-clipboard-check', label: 'Attendance' },
        { to: '/faculty/exams', icon: 'fas fa-file-alt', label: 'Exams' },
        { to: '/faculty/materials', icon: 'fas fa-book-open', label: 'Materials' },
      ]
    },
    {
      section: 'Campus', items: [
        { to: '/faculty/announcements', icon: 'fas fa-bullhorn', label: 'Announcements' },
        { to: '/faculty/events', icon: 'fas fa-calendar-star', label: 'Events' },
      ]
    },
    {
      section: 'Services', items: [
        { to: '/faculty/appointments', icon: 'fas fa-calendar-plus', label: 'Appointments' },
        { to: '/faculty/grievances', icon: 'fas fa-lock', label: 'Grievances' },
        { to: '/faculty/anonymous-reports', icon: 'fas fa-user-secret', label: 'Anonymous Reports' },
      ]
    },
    {
      section: 'Account', items: [
        { to: '/faculty/profile', icon: 'fas fa-user-edit', label: 'My Profile' },
      ]
    },
  ],
  student: [
    {
      section: 'Overview', items: [
        { to: '/student/dashboard', icon: 'fas fa-th-large', label: 'Dashboard' },
      ]
    },
    {
      section: 'Academics', items: [
        { to: '/student/timetable', icon: 'fas fa-calendar-week', label: 'Timetable' },
        { to: '/student/attendance', icon: 'fas fa-clipboard-check', label: 'Attendance' },
        { to: '/student/exams', icon: 'fas fa-file-alt', label: 'Exam Schedule' },
        { to: '/student/materials', icon: 'fas fa-book-open', label: 'Study Materials' },
      ]
    },
    {
      section: 'Campus', items: [
        { to: '/student/announcements', icon: 'fas fa-bullhorn', label: 'Announcements' },
        { to: '/student/events', icon: 'fas fa-calendar-star', label: 'Events' },
        { to: '/student/faqs', icon: 'fas fa-question-circle', label: 'FAQ Assistant' },
      ]
    },
    {
      section: 'Services', items: [
        { to: '/student/appointments', icon: 'fas fa-calendar-plus', label: 'Appointments' },
        { to: '/student/grievances', icon: 'fas fa-lock', label: 'Grievances' },
        { to: '/student/anonymous-reports', icon: 'fas fa-user-secret', label: 'Anonymous Reports' },
      ]
    },
    {
      section: 'Account', items: [
        { to: '/student/profile', icon: 'fas fa-user-edit', label: 'My Profile' },
      ]
    },
  ],
}

const portalLabel = { admin: 'Admin Portal', faculty: 'Faculty Portal', student: 'Student Portal' }

export default function Layout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const user = getUser()
  const role = user?.role || 'student'
  const nav = navConfig[role] || navConfig.student

  const logout = () => {
    clearUser()
    navigate('/login')
  }

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  return (
    <>
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <div className="app-layout">
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`} id="sidebar">
          <div className="sidebar-brand">
            <div className="brand-logo">
              <div className="brand-icon">🎓</div>
              <div className="brand-text">
                <div className="brand-name">Smart Campus</div>
                <div className="brand-sub">{portalLabel[role]}</div>
              </div>
            </div>
          </div>

          <div className="sidebar-user">
            <div className="user-avatar">{(user?.name || 'U')[0].toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user?.name || user?.username || 'User'}</div>
              <div className="user-role">{role}</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {nav.map(group => (
              <div key={group.section}>
                <div className="nav-section-label">{group.section}</div>
                {group.items.map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`nav-item ${location.pathname === item.to ? 'active' : ''}`}
                  >
                    <i className={item.icon}></i>
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="logout-btn" onClick={logout}>
              <i className="fas fa-sign-out-alt"></i> Sign Out
            </button>
          </div>
        </nav>

        <div className="main-content">
          <header className="top-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                className="sidebar-toggle icon-btn"
                onClick={() => setSidebarOpen(o => !o)}
              >
                <i className="fas fa-bars"></i>
              </button>
              <div className="header-title">{title}</div>
            </div>
            <div className="header-actions">
              <Link
                to={`/${role}/profile`}
                className="icon-btn"
              >
                <i className="fas fa-user-circle"></i>
              </Link>
            </div>
          </header>

          <div className="page-content">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
