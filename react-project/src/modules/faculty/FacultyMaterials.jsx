import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { facultyAPI } from '../../services/api';

const fileIcons = { pdf: 'fa-file-pdf', doc: 'fa-file-word', ppt: 'fa-file-powerpoint', video: 'fa-video', other: 'fa-file' };
const fileColors = { pdf: 'red', doc: 'blue', ppt: 'amber', video: 'purple', other: 'green' };
const empty = { title: '', course: '', file_url: '', file_type: 'pdf', semester: '', description: '' };

export default function FacultyMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const d = await facultyAPI.getMaterials(); setMaterials(d.materials || []); } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function save() {
    if (!form.title || !form.course || !form.file_url) return alert('Fill all required fields.');
    try { await facultyAPI.uploadMaterial(form); setModal(false); setForm(empty); load(); } catch (e) { alert(e.message); }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Layout role="faculty" title="Materials">
      <div className="page-header-row page-header">
        <div><h1>Study Materials</h1><p>Upload and manage course resources for your students</p></div>
        <button className="btn btn-primary" onClick={() => { setForm(empty); setModal(true); }}><i className="fas fa-upload"></i> Upload Material</button>
      </div>

      {loading ? <div className="loading-center"><div className="spinner"></div></div>
        : !materials.length ? <div className="empty-state"><i className="fas fa-folder-open"></i><p>No materials uploaded yet</p></div>
        : <div className="grid-auto">
          {materials.map(m => (
            <div key={m._id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div className={`stat-icon ${fileColors[m.file_type] || 'blue'}`} style={{ width: 44, height: 44, flexShrink: 0 }}>
                  <i className={`fas ${fileIcons[m.file_type] || 'fa-file'}`}></i>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{m.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{m.description}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Course: {m.course}{m.semester ? ` · Sem ${m.semester}` : ''}</div>
                  <div style={{ marginTop: 10 }}><a href={m.file_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm"><i className="fas fa-external-link-alt"></i> Open</a></div>
                </div>
              </div>
            </div>
          ))}
        </div>}

      {modal && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header"><h3>Upload Material</h3><button className="modal-close" onClick={() => setModal(false)}><i className="fas fa-times"></i></button></div>
            <div className="form-group"><label className="form-label">Title *</label><input className="form-input" placeholder="e.g. Unit 1 Notes" value={form.title} onChange={e => f('title', e.target.value)} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Course *</label><input className="form-input" placeholder="e.g. BCA" value={form.course} onChange={e => f('course', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Semester</label>
                <select className="form-select" value={form.semester} onChange={e => f('semester', e.target.value)}>
                  <option value="">—</option>{[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">File URL *</label><input className="form-input" placeholder="https://drive.google.com/..." value={form.file_url} onChange={e => f('file_url', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">File Type</label>
                <select className="form-select" value={form.file_type} onChange={e => f('file_type', e.target.value)}>
                  {['pdf', 'doc', 'ppt', 'video', 'other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows="2" value={form.description} onChange={e => f('description', e.target.value)} /></div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}><i className="fas fa-upload"></i> Upload</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
