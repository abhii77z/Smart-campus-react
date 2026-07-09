import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../services/api';

const priorityBadge = p => ({ high: 'badge-amber', urgent: 'badge-red', normal: 'badge-gray' }[p] || 'badge-gray');
const fmtDT = d => d ? new Date(d.$date || d).toLocaleString() : '—';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', target_audience: 'all', priority: 'normal' });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const d = await adminAPI.getAnnouncements(); setAnnouncements(d.announcements || []); } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function save() {
    if (!form.title || !form.content) return alert('Title and content required.');
    try {
      await adminAPI.createAnnouncement(form);
      setModal(false); setForm({ title: '', content: '', target_audience: 'all', priority: 'normal' }); load();
    } catch (e) { alert(e.message); }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Layout role="admin" title="Announcements">
      <div className="page-header-row page-header">
        <div><h1>Announcements</h1><p>Post notices and updates for students and faculty</p></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><i className="fas fa-plus"></i> New Announcement</button>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        {loading ? <div className="loading-center"><div className="spinner"></div></div>
          : !announcements.length ? <div className="empty-state"><i className="fas fa-bullhorn"></i><p>No announcements yet</p></div>
          : announcements.map(a => (
            <div key={a._id} className="list-item" style={{ marginBottom: 12 }}>
              <div className="list-item-icon" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent)', width: 42, height: 42 }}><i className="fas fa-bullhorn"></i></div>
              <div className="list-item-content">
                <div className="list-item-title" style={{ fontSize: '1rem' }}>{a.title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '6px 0' }}>{a.content}</div>
                <div className="list-item-meta">
                  <span className={`badge ${priorityBadge(a.priority)}`}>{a.priority}</span>
                  &nbsp;·&nbsp; For: <strong>{a.target_audience}</strong>
                  &nbsp;·&nbsp; {fmtDT(a.created_at)}
                  &nbsp;·&nbsp; By: {a.created_by}
                </div>
              </div>
            </div>
          ))}
      </div>

      {modal && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header">
              <h3>New Announcement</h3>
              <button className="modal-close" onClick={() => setModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="form-group"><label className="form-label">Title *</label>
              <input className="form-input" placeholder="Announcement title" value={form.title} onChange={e => f('title', e.target.value)} />
            </div>
            <div className="form-group"><label className="form-label">Content *</label>
              <textarea className="form-textarea" rows="4" placeholder="Write your announcement here…" value={form.content} onChange={e => f('content', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Target Audience</label>
                <select className="form-select" value={form.target_audience} onChange={e => f('target_audience', e.target.value)}>
                  <option value="all">All</option>
                  <option value="students">Students</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Priority</label>
                <select className="form-select" value={form.priority} onChange={e => f('priority', e.target.value)}>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}><i className="fas fa-paper-plane"></i> Publish</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
