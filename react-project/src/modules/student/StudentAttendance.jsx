import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { studentAPI } from '../../services/api';

export default function StudentAttendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getAttendance().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const s = data?.summary || {};
  const pct = s.percentage || 0;
  const barClass = `progress-fill ${pct < 75 ? 'red' : pct < 90 ? 'amber' : 'green'}`;
  const needed = pct < 75 ? Math.ceil((0.75 * s.total_classes - s.attended) / 0.25) : 0;

  return (
    <Layout role="student" title="Attendance">
      <div className="page-header"><h1>My Attendance</h1><p>Track your class attendance records</p></div>

      {loading ? <div className="loading-center"><div className="spinner"></div></div> : (
        <>
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            {[
              { label: 'Attendance %', value: pct + '%', icon: 'fa-chart-pie', color: pct < 75 ? 'red' : 'green' },
              { label: 'Classes Attended', value: s.attended || 0, icon: 'fa-check-circle', color: 'green' },
              { label: 'Total Classes', value: s.total_classes || 0, icon: 'fa-calendar', color: 'blue' },
              { label: 'Absent', value: (s.total_classes || 0) - (s.attended || 0), icon: 'fa-times-circle', color: 'red' },
            ].map((item, i) => (
              <div key={i} className="stat-card">
                <div className="stat-info"><div className="stat-label">{item.label}</div><div className="stat-value">{item.value}</div></div>
                <div className={`stat-icon ${item.color}`}><i className={`fas ${item.icon}`}></i></div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 600 }}>Overall Attendance</span>
              <span className={`badge ${pct >= 75 ? 'badge-green' : 'badge-red'}`}>{pct >= 75 ? 'Good Standing' : 'Below Requirement'}</span>
            </div>
            <div className="progress-bar"><div className={barClass} style={{ width: pct + '%' }}></div></div>
            <div style={{ marginTop: 10, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {pct >= 75 ? `You are above the 75% requirement. Keep it up!` : `You need approximately ${needed} more consecutive attendances to reach 75%.`}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Attendance Records</span></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Course</th><th>Subject</th><th>Session</th><th>Status</th></tr></thead>
                <tbody>
                  {!data?.attendance_records?.length
                    ? <tr><td colSpan="5"><div className="empty-state"><i className="fas fa-clipboard-list"></i><p>No records found</p></div></td></tr>
                    : data.attendance_records.map((r, i) => {
                      const myRecord = r.attendance_data?.[0];
                      const status = myRecord?.status || 'unknown';
                      return <tr key={i}><td>{r.date}</td><td>{r.course}</td><td>{r.subject || '—'}</td><td>{r.session}</td><td><span className={`badge ${status === 'present' ? 'badge-green' : 'badge-red'}`}>{status}</span></td></tr>;
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
