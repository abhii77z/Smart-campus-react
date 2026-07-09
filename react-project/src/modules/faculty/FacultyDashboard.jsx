import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { facultyAPI } from '../../services/api';

export default function FacultyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    facultyAPI.getDashboard().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const quickActions = [
    { to: '/faculty/attendance', icon: 'fa-clipboard-check', color: 'rgba(59,130,246,0.1)', iconColor: 'var(--accent)', title: 'Mark Attendance', sub: "Record today's class attendance" },
    { to: '/faculty/exams', icon: 'fa-file-alt', color: 'rgba(16,185,129,0.1)', iconColor: 'var(--success)', title: 'Submit Exam Details', sub: 'Schedule an upcoming exam' },
    { to: '/faculty/materials', icon: 'fa-upload', color: 'rgba(124,58,237,0.1)', iconColor: '#7c3aed', title: 'Upload Materials', sub: 'Share study resources' },
    { to: '/faculty/announcements', icon: 'fa-bullhorn', color: 'rgba(245,158,11,0.1)', iconColor: 'var(--warning)', title: 'Post Announcement', sub: 'Notify your class' },
    { to: '/faculty/events', icon: 'fa-calendar-plus', color: 'rgba(239,68,68,0.1)', iconColor: 'var(--danger)', title: 'Upload Event Poster', sub: 'Submit for admin approval' },
  ];

  return (
    <Layout role="faculty" title="Dashboard">
      <div className="page-header fade-up">
        <h1>Welcome back 👋</h1>
        <p>{user.department || ''} · {user.designation || 'Faculty'}</p>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Pending Appointments', value: data?.pending_appointments ?? '—', sub: 'Awaiting response', icon: 'fa-calendar-clock', color: 'amber' },
          { label: 'Pending Grievances', value: data?.pending_grievances ?? '—', sub: 'Assigned to you', icon: 'fa-inbox', color: 'red' },
          { label: 'Students Taught', value: data?.student_metrics?.students_taught ?? '—', sub: 'In your department', icon: 'fa-user-graduate', color: 'blue' },
          { label: 'My Announcements', value: data?.recent_announcements?.length ?? '—', sub: 'Published', icon: 'fa-bullhorn', color: 'green' },
        ].map((s, i) => (
          <div key={i} className={`stat-card fade-up delay-${i + 1}`}>
            <div className="stat-info"><div className="stat-label">{s.label}</div><div className="stat-value">{loading ? '—' : s.value}</div><div className="stat-sub">{s.sub}</div></div>
            <div className={`stat-icon ${s.color}`}><i className={`fas ${s.icon}`}></i></div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card fade-up">
          <div className="card-header">
            <span className="card-title"><i className="fas fa-calendar-check" style={{ color: 'var(--warning)', marginRight: 8 }}></i>Pending Appointments</span>
            <Link to="/faculty/appointments" className="btn btn-secondary btn-sm">View all</Link>
          </div>
          {loading ? <div className="loading-center"><div className="spinner"></div></div>
            : !(data?.pending_appointments_list?.length)
              ? <div className="empty-state" style={{ padding: 20 }}><i className="fas fa-calendar-check" style={{ color: 'var(--success)' }}></i><p>No pending appointments</p></div>
              : data.pending_appointments_list.map(a => (
                <div key={a._id} className="list-item">
                  <div className="user-avatar" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>{(a.student_name || 'S')[0]}</div>
                  <div className="list-item-content">
                    <div className="list-item-title">{a.student_name || a.student_id}</div>
                    <div className="list-item-meta">{a.subject} · Preferred: {a.preferred_date}</div>
                  </div>
                  <Link to="/faculty/appointments" className="btn btn-primary btn-sm">View</Link>
                </div>
              ))}
        </div>

        <div className="card fade-up delay-1">
          <div className="card-header"><span className="card-title"><i className="fas fa-bolt" style={{ color: 'var(--warning)', marginRight: 8 }}></i>Quick Actions</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {quickActions.map(a => (
              <Link key={a.to} to={a.to} className="list-item">
                <div className="list-item-icon" style={{ background: a.color, color: a.iconColor }}><i className={`fas ${a.icon}`}></i></div>
                <div className="list-item-content"><div className="list-item-title">{a.title}</div><div className="list-item-meta">{a.sub}</div></div>
                <i className="fas fa-chevron-right" style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}></i>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
