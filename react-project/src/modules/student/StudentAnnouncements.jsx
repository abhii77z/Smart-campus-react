import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { studentAPI } from '../../services/api';

const fmtDT = d => d ? new Date(d.$date || d).toLocaleString() : '—';
const prioBadge = p => ({ high: 'badge-amber', urgent: 'badge-red', normal: 'badge-gray' }[p] || 'badge-gray');

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getAnnouncements().then(d => { setAnnouncements(d.announcements || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <Layout role="student" title="Announcements">
      <div className="page-header"><h1>Announcements</h1><p>Stay up to date with campus news and notices</p></div>

      {loading ? <div className="loading-center"><div className="spinner"></div></div>
        : !announcements.length ? <div className="empty-state"><i className="fas fa-bullhorn"></i><p>No announcements yet</p></div>
        : announcements.map(a => (
          <div key={a._id} className="card" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <span className={`badge ${prioBadge(a.priority)}`}>{a.priority}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>For: {a.target_audience}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 6 }}>{a.title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{a.content}</div>
                <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fmtDT(a.created_at)} · By: {a.created_by}</div>
              </div>
            </div>
          </div>
        ))}
    </Layout>
  );
}
