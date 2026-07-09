import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { adminDashboard } from '../../services/api'
import { getUser } from '../../services/api'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const user = getUser()

  useEffect(() => {
    adminDashboard().then(r => setData(r.data)).catch(() => {})
  }, [])

  const ov = data?.system_overview || {}

  return (
    <Layout title="Dashboard">
      <div className="page-header fade-up">
        <h1>Hello, {user?.name || 'Admin'} 👋</h1>
        <p>Here's an overview of your Smart Campus system.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card fade-up delay-1">
          <div className="stat-info">
            <div className="stat-label">Total Students</div>
            <div className="stat-value">{ov.total_students ?? '—'}</div>
          </div>
          <div className="stat-icon blue"><i className="fas fa-user-graduate"></i></div>
        </div>
        <div className="stat-card fade-up delay-2">
          <div className="stat-info">
            <div className="stat-label">Total Faculty</div>
            <div className="stat-value">{ov.total_faculty ?? '—'}</div>
          </div>
          <div className="stat-icon green"><i className="fas fa-chalkboard-teacher"></i></div>
        </div>
        <div className="stat-card fade-up delay-3">
          <div className="stat-info">
            <div className="stat-label">Pending Approvals</div>
            <div className="stat-value">{ov.pending_approvals ?? '—'}</div>
          </div>
          <div className="stat-icon amber"><i className="fas fa-user-clock"></i></div>
        </div>
        <div className="stat-card fade-up delay-4">
          <div className="stat-info">
            <div className="stat-label">Departments</div>
            <div className="stat-value">{ov.total_departments ?? '—'}</div>
          </div>
          <div className="stat-icon purple"><i className="fas fa-building"></i></div>
        </div>
      </div>

      <div className="card fade-up">
        <div className="card-header">
          <span className="card-title"><i className="fas fa-info-circle" style={{color:'var(--accent)',marginRight:8}}></i>Quick Links</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12}}>
          {[
            {label:'Manage Users',icon:'fas fa-users',href:'/admin/users'},
            {label:'Approvals',icon:'fas fa-user-check',href:'/admin/approvals'},
            {label:'Departments',icon:'fas fa-building',href:'/admin/departments'},
            {label:'Courses',icon:'fas fa-graduation-cap',href:'/admin/courses'},
            {label:'Announcements',icon:'fas fa-bullhorn',href:'/admin/announcements'},
            {label:'Events',icon:'fas fa-calendar-star',href:'/admin/events'},
          ].map(l=>(
            <a key={l.href} href={l.href} className="btn btn-secondary" style={{flexDirection:'column',gap:8,padding:'16px',height:'auto'}}>
              <i className={l.icon} style={{fontSize:'1.4rem',color:'var(--accent)'}}></i>
              <span style={{fontSize:'0.8rem'}}>{l.label}</span>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  )
}
