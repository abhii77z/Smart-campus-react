import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { studentAPI } from '../../services/api';

const catColors = { academic: 'blue', facility: 'amber', personal: 'purple', harassment: 'red', other: 'gray' };
const statusBadge = s => ({ open: 'badge-yellow', 'in-progress': 'badge-blue', resolved: 'badge-green', closed: 'badge-gray' }[s] || 'badge-gray');
const fmt = d => d ? new Date(d.$date || d).toLocaleDateString() : '—';

export default function StudentGrievances() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ category: 'academic', description: '', priority: 'normal', assigned_to: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const d = await studentAPI.getGrievances(); setGrievances(d.grievances || []); } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function submit() {
    if (!form.category || !form.description) return alert('Category and description required.');
    try { await studentAPI.submitGrievance(form); setModal(false); setForm({ category: 'academic', description: '', priority: 'normal', assigned_to: '' }); load(); }
    catch (e) { alert(e.message); }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Layout role="student" title="Grievances">
      <div className="page-header-row page-header">
        <div><h1>Grievances</h1><p>Submit concerns — your identity is kept anonymous</p></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><i className="fas fa-plus"></i> Submit Grievance</button>
      </div>

      {loading ? <div className="loading-center"><div className="spinner"></div></div>
        : !grievances.length ? <div className="empty-state"><i className="fas fa-lock"></i><p>No grievances submitted yet</p></div>
        : grievances.map(g => (
          <div key={g._id} className="card" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className={`badge badge-${catColors[g.category] || 'gray'}`}>{g.category}</span>
                <span className={`badge ${statusBadge(g.status)}`}>{g.status}</span>
                <span className={`badge badge-${g.priority === 'high' ? 'red' : 'gray'}`}>{g.priority}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fmt(g.submitted_at)}</div>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.6 }}>{g.description}</div>
            {g.response
              ? <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, marginBottom: 4 }}><i className="fas fa-reply"></i> Faculty Response</div>
                  <div style={{ fontSize: '0.875rem' }}>{g.response}</div>
                </div>
              : <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><i className="fas fa-clock"></i> Awaiting faculty response…</div>}
          </div>
        ))}

      {modal && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header"><h3>Submit Grievance</h3><button className="modal-close" onClick={() => setModal(false)}><i className="fas fa-times"></i></button></div>
            <div className="alert alert-info" style={{ marginBottom: 16, fontSize: '0.85rem' }}><i className="fas fa-shield-alt"></i> Your grievance will be submitted anonymously</div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Category *</label>
                <select className="form-select" value={form.category} onChange={e => f('category', e.target.value)}>
                  {['academic', 'facility', 'personal', 'harassment', 'other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Priority</label>
                <select className="form-select" value={form.priority} onChange={e => f('priority', e.target.value)}>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Assign to Faculty (optional)</label>
              <input className="form-input" placeholder="Faculty login ID (optional)" value={form.assigned_to} onChange={e => f('assigned_to', e.target.value)} />
            </div>
            <div className="form-group"><label className="form-label">Description *</label>
              <textarea className="form-textarea" rows="5" placeholder="Describe your concern in detail…" value={form.description} onChange={e => f('description', e.target.value)} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit}><i className="fas fa-paper-plane"></i> Submit</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
