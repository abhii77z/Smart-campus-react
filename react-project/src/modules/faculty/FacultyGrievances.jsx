import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { facultyAPI } from '../../services/api';

const catColors = { academic: 'blue', facility: 'amber', personal: 'purple', harassment: 'red', other: 'gray' };
const statusBadge = s => ({ open: 'badge-yellow', 'in-progress': 'badge-blue', resolved: 'badge-green', closed: 'badge-gray' }[s] || 'badge-gray');
const fmt = d => d ? new Date(d.$date || d).toLocaleDateString() : '—';

export default function FacultyGrievances() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondId, setRespondId] = useState(null);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('in-progress');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const d = await facultyAPI.getGrievances(); setGrievances(d.grievances || []); } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function submit() {
    if (!response.trim()) return alert('Please write a response.');
    try { await facultyAPI.respondGrievance(respondId, { response, status }); setRespondId(null); setResponse(''); load(); }
    catch (e) { alert(e.message); }
  }

  return (
    <Layout role="faculty" title="Grievances">
      <div className="page-header"><h1>Grievances</h1><p>Review and respond to student grievances assigned to you</p></div>

      {loading ? <div className="loading-center"><div className="spinner"></div></div>
        : !grievances.length ? <div className="empty-state"><i className="fas fa-inbox"></i><p>No grievances assigned to you</p></div>
        : grievances.map(g => (
          <div key={g._id} className="card" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <div>
                <span className={`badge badge-${catColors[g.category] || 'gray'}`}>{g.category}</span>
                &nbsp;<span className={`badge ${statusBadge(g.status)}`}>{g.status}</span>
                <span className={`badge badge-${g.priority === 'high' ? 'red' : 'gray'}`} style={{ marginLeft: 4 }}>{g.priority} priority</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fmt(g.submitted_at)}</div>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.6 }}>{g.description}</div>
            {g.response
              ? <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-sm)', padding: 10, fontSize: '0.85rem' }}>
                  <strong style={{ color: 'var(--success)' }}>Your response:</strong> {g.response}
                </div>
              : <button className="btn btn-primary btn-sm" onClick={() => { setRespondId(g._id); setResponse(''); setStatus('in-progress'); }}><i className="fas fa-reply"></i> Respond</button>}
          </div>
        ))}

      {respondId && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header"><h3>Respond to Grievance</h3><button className="modal-close" onClick={() => setRespondId(null)}><i className="fas fa-times"></i></button></div>
            <div className="form-group"><label className="form-label">Your Response *</label><textarea className="form-textarea" rows="4" value={response} onChange={e => setResponse(e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Update Status</label>
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRespondId(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit}><i className="fas fa-paper-plane"></i> Submit Response</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
