import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { studentAPI } from '../../services/api';

const statusBadge = s => ({ approved: 'badge-green', pending: 'badge-yellow', rejected: 'badge-red' }[s] || 'badge-gray');

export default function StudentAppointments() {
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ faculty_id: '', subject: '', preferred_date: '', preferred_time: '', reason: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const d = await studentAPI.getAppointments(); setAppts(d.appointments || []); } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function book() {
    if (!form.faculty_id || !form.subject || !form.preferred_date || !form.reason) return alert('Fill all required fields.');
    try { await studentAPI.bookAppointment(form); setModal(false); setForm({ faculty_id: '', subject: '', preferred_date: '', preferred_time: '', reason: '' }); load(); }
    catch (e) { alert(e.message); }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Layout role="student" title="Appointments">
      <div className="page-header-row page-header">
        <div><h1>Appointments</h1><p>Request and track faculty appointments</p></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><i className="fas fa-calendar-plus"></i> Book Appointment</button>
      </div>

      {loading ? <div className="loading-center"><div className="spinner"></div></div>
        : !appts.length ? <div className="empty-state"><i className="fas fa-calendar-plus"></i><p>No appointments yet. Book your first one!</p></div>
        : appts.map(a => (
          <div key={a._id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>{a.subject}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Faculty: <strong>{a.faculty_id}</strong></div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span><i className="fas fa-calendar"></i> Requested: {a.preferred_date}{a.preferred_time ? ' ' + a.preferred_time : ''}</span>
                  {a.scheduled_date && <span style={{ color: 'var(--success)' }}><i className="fas fa-check-circle"></i> Scheduled: {a.scheduled_date} {a.scheduled_time} {a.venue ? '@ ' + a.venue : ''}</span>}
                </div>
                <div style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reason: {a.reason}</div>
                {a.rejection_reason && <div style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--danger)' }}>Rejected: {a.rejection_reason}</div>}
              </div>
              <span className={`badge ${statusBadge(a.status)}`}>{a.status}</span>
            </div>
          </div>
        ))}

      {modal && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header"><h3>Book Appointment</h3><button className="modal-close" onClick={() => setModal(false)}><i className="fas fa-times"></i></button></div>
            <div className="form-group"><label className="form-label">Faculty Login ID *</label><input className="form-input" placeholder="e.g. FAC001" value={form.faculty_id} onChange={e => f('faculty_id', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Subject *</label><input className="form-input" placeholder="What is the appointment about?" value={form.subject} onChange={e => f('subject', e.target.value)} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Preferred Date *</label><input className="form-input" type="date" value={form.preferred_date} onChange={e => f('preferred_date', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Preferred Time</label><input className="form-input" type="time" value={form.preferred_time} onChange={e => f('preferred_time', e.target.value)} /></div>
            </div>
            <div className="form-group"><label className="form-label">Reason *</label><textarea className="form-textarea" rows="3" value={form.reason} onChange={e => f('reason', e.target.value)} /></div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={book}><i className="fas fa-paper-plane"></i> Send Request</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
