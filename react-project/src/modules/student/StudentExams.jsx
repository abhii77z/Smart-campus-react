import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { studentAPI } from '../../services/api';

const typeColors = { internal: 'blue', external: 'purple', viva: 'amber', practical: 'green' };
const today = new Date().toISOString().split('T')[0];

export default function StudentExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getExams().then(d => { setExams(d.exams || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const upcoming = exams.filter(e => e.exam_date >= today);
  const past = exams.filter(e => e.exam_date < today);

  return (
    <Layout role="student" title="Exams">
      <div className="page-header"><h1>Exam Schedule</h1><p>View your upcoming and past exams</p></div>

      {loading ? <div className="loading-center"><div className="spinner"></div></div>
        : !exams.length ? <div className="empty-state"><i className="fas fa-check-circle" style={{ color: 'var(--success)' }}></i><p>No exams scheduled currently</p></div>
        : <>
          {upcoming.length > 0 && (
            <>
              <h3 style={{ marginBottom: 14, fontSize: '1rem' }}>Upcoming ({upcoming.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {upcoming.map(e => (
                  <div key={e._id} className="card" style={{ borderLeft: `4px solid var(--${typeColors[e.exam_type] || 'accent'})` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>{e.exam_name}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{e.course}</div>
                        <div style={{ display: 'flex', gap: 14, fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                          <span><i className="fas fa-calendar"></i> {e.exam_date}</span>
                          <span><i className="fas fa-clock"></i> {e.exam_time}</span>
                          {e.venue && <span><i className="fas fa-map-marker-alt"></i> {e.venue}</span>}
                          {e.duration && <span><i className="fas fa-hourglass"></i> {e.duration}</span>}
                          <span><i className="fas fa-star"></i> Max: {e.max_marks || '—'}</span>
                        </div>
                        {e.syllabus && <div style={{ marginTop: 8, padding: 8, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}><strong>Syllabus:</strong> {e.syllabus}</div>}
                      </div>
                      <span className={`badge badge-${typeColors[e.exam_type] || 'gray'}`}>{e.exam_type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {past.length > 0 && (
            <>
              <h3 style={{ marginBottom: 14, fontSize: '1rem', color: 'var(--text-muted)' }}>Past Exams</h3>
              <div className="card"><div className="table-wrap"><table>
                <thead><tr><th>Name</th><th>Course</th><th>Type</th><th>Date</th><th>Time</th><th>Venue</th></tr></thead>
                <tbody>
                  {past.map(e => (
                    <tr key={e._id}>
                      <td>{e.exam_name}</td><td>{e.course}</td>
                      <td><span className={`badge badge-${typeColors[e.exam_type] || 'gray'}`}>{e.exam_type}</span></td>
                      <td>{e.exam_date}</td><td>{e.exam_time}</td><td>{e.venue || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div></div>
            </>
          )}
        </>}
    </Layout>
  );
}
