import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../services/api';

const statusBadge = s => ({ approved: 'badge-green', pending: 'badge-yellow', rejected: 'badge-red' }[s] || 'badge-gray');

function EventCard({ ev, onApprove, onReject }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ width: 120, height: 90, borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg,#1e3a5f,#1e1b4b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>📅</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{ev.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{ev.description}</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span><i className="fas fa-calendar"></i> {ev.event_date}</span>
                {ev.event_time && <span><i className="fas fa-clock"></i> {ev.event_time}</span>}
                {ev.venue && <span><i className="fas fa-map-marker-alt"></i> {ev.venue}</span>}
                <span><i className="fas fa-user"></i> {ev.uploaded_by}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <span className={`badge ${statusBadge(ev.status)}`}>{ev.status}</span>
              {ev.status === 'pending' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-success btn-sm" onClick={() => onApprove(ev._id)}><i className="fas fa-check"></i> Approve</button>
                  <button className="btn btn-danger btn-sm" onClick={() => onReject(ev._id)}><i className="fas fa-times"></i> Reject</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [rejectId, setRejectId] = useState(null);
  const [reason, setReason] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const d = await adminAPI.getEvents(); setEvents(d.events || []); } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function approve(id) {
    try { await adminAPI.approveEvent(id); load(); } catch (e) { alert(e.message); }
  }

  async function reject() {
    try { await adminAPI.rejectEvent(rejectId, { reason }); setRejectId(null); setReason(''); load(); } catch (e) { alert(e.message); }
  }

  const pending = events.filter(e => e.status === 'pending');
  const approved = events.filter(e => e.status === 'approved');
  const shown = tab === 'pending' ? pending : tab === 'approved' ? approved : events;

  return (
    <Layout role="admin" title="Events">
      <div className="page-header-row page-header">
        <div><h1>Events</h1><p>Review and approve faculty event submissions</p></div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>Pending ({pending.length})</button>
        <button className={`tab-btn ${tab === 'approved' ? 'active' : ''}`} onClick={() => setTab('approved')}>Approved</button>
        <button className={`tab-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All Events</button>
      </div>

      <div style={{ paddingTop: 16 }}>
        {loading ? <div className="loading-center"><div className="spinner"></div></div>
          : !shown.length ? <div className="empty-state"><i className="fas fa-calendar"></i><p>No events here</p></div>
          : shown.map(ev => <EventCard key={ev._id} ev={ev} onApprove={approve} onReject={id => { setRejectId(id); setReason(''); }} />)}
      </div>

      {rejectId && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header">
              <h3>Reject Event</h3>
              <button className="modal-close" onClick={() => setRejectId(null)}><i className="fas fa-times"></i></button>
            </div>
            <div className="form-group"><label className="form-label">Reason (optional)</label>
              <textarea className="form-textarea" rows="3" placeholder="Reason for rejection…" value={reason} onChange={e => setReason(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRejectId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={reject}><i className="fas fa-times"></i> Reject</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
