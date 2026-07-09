import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { facultyAPI } from '../../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function FacultyTimetable() {
    const [tt, setTt] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        facultyAPI.getTimetable()
            .then(d => { setTt(d.timetable); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const byDay = {};
    DAYS.forEach(d => { byDay[d] = []; });
    if (tt?.schedule) {
        if (Array.isArray(tt.schedule)) {
            tt.schedule.forEach(s => { if (s.day && byDay[s.day]) byDay[s.day].push(s); });
        } else {
            Object.entries(tt.schedule).forEach(([day, slots]) => {
                (slots || []).forEach(s => { if (byDay[day]) byDay[day].push({ ...s, day }); });
            });
        }
    }
    const maxRows = Math.max(...Object.values(byDay).map(v => v.length), 1);

    return (
        <Layout role="faculty" title="Timetable">
            <div className="page-header"><h1>Teaching Timetable</h1><p>Your weekly teaching schedule</p></div>

            {loading ? <div className="loading-center"><div className="spinner"></div></div>
                : !tt ? (
                    <div className="empty-state">
                        <i className="fas fa-calendar-week" style={{ fontSize: '2.5rem', marginBottom: 12 }}></i>
                        <p>No timetable assigned for your department yet.</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Contact admin to create your department's faculty timetable.</p>
                    </div>
                ) : <>
                    <div className="card" style={{ marginBottom: 16, padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <span className="badge badge-blue">Faculty Timetable</span>
                            <strong>{tt.department}</strong>
                            {tt.effective_from && <span>· Effective from {tt.effective_from}</span>}
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
                                                    ? <td key={day}>
                                                        <div className="timetable-slot">
                                                            <div className="slot-subject">{s.subject || '?'}</div>
                                                            <div className="slot-time">{s.time || ''}{s.faculty ? ` · ${s.faculty}` : ''}</div>
                                                        </div>
                                                    </td>
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
