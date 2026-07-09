import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { studentAPI } from '../../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StudentTimetable() {
  const [tt, setTt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getTimetable().then(d => { setTt(d.timetable); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const byDay = {};
  DAYS.forEach(d => { byDay[d] = []; });
  if (tt?.schedule) {
    (Array.isArray(tt.schedule) ? tt.schedule : Object.entries(tt.schedule).flatMap(([day, slots]) => (slots || []).map(s => ({ ...s, day })))).forEach(s => { if (s.day && byDay[s.day]) byDay[s.day].push(s); });
  }
  const maxRows = Math.max(...Object.values(byDay).map(v => v.length), 1);

  return (
    <Layout role="student" title="Timetable">
      <div className="page-header"><h1>Class Timetable</h1><p>Your weekly class schedule</p></div>

      {loading ? <div className="loading-center"><div className="spinner"></div></div>
        : !tt ? <div className="empty-state"><i className="fas fa-calendar-week"></i><p>No timetable has been assigned for your class yet.</p></div>
        : <>
          <div className="card" style={{ marginBottom: 16, padding: 16 }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>{tt.course}</strong> · {tt.department} · Semester {tt.semester}
            </div>
          </div>
          <div className="card">
            <div className="timetable-grid">
              <table className="timetable-table">
                <thead><tr><th>#</th>{DAYS.map(d => <th key={d}>{d}</th>)}</tr></thead>
                <tbody>
                  {Array.from({ length: maxRows }, (_, i) => (
                    <tr key={i}>
                      <td><small style={{ color: 'var(--text-muted)' }}>{i + 1}</small></td>
                      {DAYS.map(day => {
                        const s = byDay[day][i];
                        return s
                          ? <td key={day}><div className="timetable-slot"><div className="slot-subject">{s.subject || '?'}</div><div className="slot-time">{s.time || ''}</div></div></td>
                          : <td key={day} style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>}
    </Layout>
  );
}
