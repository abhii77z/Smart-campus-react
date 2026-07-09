import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { studentAPI } from '../../services/api';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    studentAPI.getDashboard().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const pct = data?.attendance_summary?.percentage || 0;
  const total = data?.attendance_summary?.total_classes || 0;
  const attended = data?.attendance_summary?.attended || 0;
  const circumference = 226;
  const offset = circumference - (pct / 100) * circumference;
  const ringColor = pct < 75 ? 'var(--danger)' : pct < 90 ? 'var(--warning)' : 'var(--success)';
  const barClass = `progress-fill ${pct < 75 ? 'red' : pct < 90 ? 'amber' : 'green'}`;

  return (
    <Layout role="student" title="Dashboard">
      <div className="page-header fade-up">
        <h1>Welcome back 👋</h1>
        <p id="student-info">{user.course || ''}{user.semester ? ` · Semester ${user.semester}` : ''} · {user.department || ''}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card fade-up" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="var(--border)" strokeWidth="8" />
              <circle cx="40" cy="40" r="36" fill="none" stroke={ringColor} strokeWidth="8"
                strokeDasharray={circumference} strokeDashoffset={loading ? circumference : offset}
                strokeLinecap="round" transform="rotate(-90 40 40)" style={{ transition: 'stroke-dashoffset 0.8s' }} />
              <text x="40" y="44" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">{loading ? '—' : pct + '%'}</text>
            </svg>
            <div>
              <div className="stat-label">Overall Attendance</div>
              <div className="stat-value">{loading ? '—' : pct + '%'}</div>
              <div className="stat-sub">{loading ? '' : `${attended} of ${total} classes attended`}</div>
              <div className="progress-bar" style={{ marginTop: 8, width: 180 }}>
                <div className={barClass} style={{ width: loading ? '0%' : pct + '%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {[
          { label: 'Upcoming Exams', value: data?.upcoming_exams?.length, icon: 'fa-file-alt', color: 'amber', to: '/student/exams' },
          { label: 'Appointments', value: data?.appointments?.length, icon: 'fa-calendar', color: 'blue', to: '/student/appointments' },
        ].map((s, i) => (
          <Link key={i} to={s.to} className={`stat-card fade-up delay-${i + 1}`} style={{ textDecoration: 'none' }}>
            <div className="stat-info"><div className="stat-label">{s.label}</div><div className="stat-value">{loading ? '—' : s.value ?? '—'}</div></div>
            <div className={`stat-icon ${s.color}`}><i className={`fas ${s.icon}`}></i></div>
          </Link>
        ))}
      </div>

      <div className="grid-2">
        <div className="card fade-up">
          <div className="card-header">
            <span className="card-title"><i className="fas fa-bullhorn" style={{ color: 'var(--accent)', marginRight: 8 }}></i>Recent Announcements</span>
            <Link to="/student/announcements" className="btn btn-secondary btn-sm">View all</Link>
          </div>
          {loading ? <div className="loading-center"><div className="spinner"></div></div>
            : !data?.recent_announcements?.length
              ? <div className="empty-state" style={{ padding: 20 }}><i className="fas fa-bullhorn"></i><p>No announcements</p></div>
              : data.recent_announcements.map(a => (
                <div key={a._id} className="list-item" style={{ marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 2 }}>{a.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.content?.slice(0, 80)}…</div>
                  </div>
                </div>
              ))}
        </div>

        <div className="card fade-up delay-1">
          <div className="card-header">
            <span className="card-title"><i className="fas fa-file-alt" style={{ color: 'var(--warning)', marginRight: 8 }}></i>Upcoming Exams</span>
            <Link to="/student/exams" className="btn btn-secondary btn-sm">View all</Link>
          </div>
          {loading ? <div className="loading-center"><div className="spinner"></div></div>
            : !data?.upcoming_exams?.length
              ? <div className="empty-state" style={{ padding: 20 }}><i className="fas fa-check-circle" style={{ color: 'var(--success)' }}></i><p>No upcoming exams</p></div>
              : data.upcoming_exams.map(e => (
                <div key={e._id} className="list-item" style={{ marginBottom: 8 }}>
                  <div className="list-item-icon" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', width: 38, height: 38 }}><i className="fas fa-file-alt"></i></div>
                  <div className="list-item-content">
                    <div className="list-item-title">{e.exam_name}</div>
                    <div className="list-item-meta">{e.course} · {e.exam_date} {e.exam_time}</div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </Layout>
  );
}
