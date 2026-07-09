import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { facultyAPI } from '../../services/api';

const statusBadge = s => ({ approved: 'badge-green', pending: 'badge-yellow', rejected: 'badge-red' }[s] || 'badge-gray');

function ApptCard({ a, onApprove, onReject }) {
  return (
    <div className="list-item" style={{ marginBottom: 10 }}>
      <div className="user-avatar" style={{ width: 40, height: 40 }}>{(a.student_name || 'S')[0]}</div>
      <div className="list-item-content">
        <div className="list-item-title">{a.student_name || a.student_id} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>— {a.subject}</span></div>
        <div className="list-item-meta">Preferred: <strong>{a.preferred_date}{a.preferred_time ? ' ' + a.preferred_time : ''}</strong> · Reason: {a.reason}</div>
        {a.scheduled_date && <div style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: 4 }}><i className="fas fa-calendar-check"></i> Scheduled: {a.scheduled_date} {a.scheduled_time} {a.venue ? '@ ' + a.venue : ''}</div>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <span className={`badge ${statusBadge(a.status)}`}>{a.status}</span>
        {a.status === 'pending' && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-success btn-sm" onClick={() => onApprove(a._id)}><i className="fas fa-check"></i></button>
            <button className="btn btn-danger btn-sm" onClick={() => onReject(a._id)}><i className="fas fa-times"></i></button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FacultyAppointments() {
  const [appts, setAppts] = useState([]);
  const [tab, setTab] = useState('pending');
  const [approveId, setApproveId] = useState(null);
  const [schedForm, setSchedForm] = useState({ scheduled_date: '', scheduled_time: '', venue: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    try { const d = await facultyAPI.getAppointments(); setAppts(d.appointments || []); } catch (e) { console.error(e); }
  }

  async function approve() {
    try { await facultyAPI.approveAppointment(approveId, schedForm); setApproveId(null); load(); } catch (e) { alert(e.message); }
  }

  async function reject(id) {
    const reason = prompt('Reason for rejection (optional):') || '';
    try { await facultyAPI.rejectAppointment(id, { reason }); load(); } catch (e) { alert(e.message); }
  }

  const pending = appts.filter(a => a.status === 'pending');
  const approved = appts.filter(a => a.status === 'approved');
  const shown = tab === 'pending' ? pending : tab === 'approved' ? approved : appts;

  return (
    <Layout role="faculty" title="Appointments">
      <div className="page-header"><h1>Appointments</h1><p>Manage student appointment requests</p></div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>Pending ({pending.length})</button>
        <button className={`tab-btn ${tab === 'approved' ? 'active' : ''}`} onClick={() => setTab('approved')}>Approved</button>
        <button className={`tab-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All</button>
      </div>

      <div className="card" style={{ marginTop: 16, padding: 16 }}>
        {!shown.length
          ? <div className="empty-state"><i className="fas fa-calendar"></i><p>No appointments here</p></div>
          : shown.map(a => <ApptCard key={a._id} a={a} onApprove={id => { setApproveId(id); setSchedForm({ scheduled_date: '', scheduled_time: '', venue: '' }); }} onReject={reject} />)}
      </div>

      {approveId && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header"><h3>Approve Appointment</h3><button className="modal-close" onClick={() => setApproveId(null)}><i className="fas fa-times"></i></button></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={schedForm.scheduled_date} onChange={e => setSchedForm(p => ({ ...p, scheduled_date: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Time</label><input className="form-input" type="time" value={schedForm.scheduled_time} onChange={e => setSchedForm(p => ({ ...p, scheduled_time: e.target.value }))} /></div>
            </div>
            <div className="form-group"><label className="form-label">Venue</label><input className="form-input" placeholder="e.g. Staff Room 201" value={schedForm.venue} onChange={e => setSchedForm(p => ({ ...p, venue: e.target.value }))} /></div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setApproveId(null)}>Cancel</button>
              <button className="btn btn-success" onClick={approve}><i className="fas fa-check"></i> Approve</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
