import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { facultyAPI } from '../../services/api';

const fmtDT = d => d ? new Date(d.$date || d).toLocaleString() : '—';

export default function FacultyAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', course: '', content: '', semester: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const d = await facultyAPI.getAnnouncements(); setAnnouncements(d.announcements || []); } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function save() {
    if (!form.title || !form.course || !form.content) return alert('Title, course and content required.');
    try { await facultyAPI.createAnnouncement(form); setModal(false); setForm({ title: '', course: '', content: '', semester: '' }); load(); }
    catch (e) { alert(e.message); }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Layout role="faculty" title="Announcements">
      <div className="page-header-row page-header">
        <div><h1>Announcements</h1><p>Post updates and notices for your class</p></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><i className="fas fa-plus"></i> New Announcement</button>
      </div>

      <div className="card" style={{ padding: 20 }}>
        {loading ? <div className="loading-center"><div className="spinner"></div></div>
          : !announcements.length ? <div className="empty-state"><i className="fas fa-bullhorn"></i><p>No announcements yet</p></div>
          : announcements.map(a => (
            <div key={a._id} className="list-item" style={{ marginBottom: 10 }}>
              <div className="list-item-icon" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent)', width: 42, height: 42 }}><i className="fas fa-bullhorn"></i></div>
              <div className="list-item-content">
                <div className="list-item-title">{a.title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0' }}>{a.content}</div>
                <div className="list-item-meta">Course: <strong>{a.course}</strong> · {fmtDT(a.created_at)}</div>
              </div>
            </div>
          ))}
      </div>

      {modal && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header"><h3>New Announcement</h3><button className="modal-close" onClick={() => setModal(false)}><i className="fas fa-times"></i></button></div>
            <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={e => f('title', e.target.value)} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Course *</label><input className="form-input" placeholder="e.g. BCA" value={form.course} onChange={e => f('course', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Semester</label>
                <select className="form-select" value={form.semester} onChange={e => f('semester', e.target.value)}>
                  <option value="">All</option>{[1,2,3,4,5,6].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Content *</label><textarea className="form-textarea" rows="4" value={form.content} onChange={e => f('content', e.target.value)} /></div>
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
