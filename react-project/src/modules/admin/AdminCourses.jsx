import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../services/api';

const empty = { name: '', code: '', department: '', semester: '', credits: '', description: '' };

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const d = await adminAPI.getCourses(); setCourses(d.courses || []); } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function save() {
    if (!form.name || !form.code || !form.department) return alert('Name, code and department required.');
    try {
      const body = { ...form, credits: parseInt(form.credits) || 0, code: form.code.toUpperCase() };
      if (editId) await adminAPI.updateCourse(editId, body);
      else await adminAPI.createCourse(body);
      setModal(false); setEditId(null); setForm(empty); load();
    } catch (e) { alert(e.message); }
  }

  async function del(id) {
    if (!confirm('Delete this course?')) return;
    try { await adminAPI.deleteCourse(id); load(); } catch (e) { alert(e.message); }
  }

  function edit(c) {
    setEditId(c._id);
    setForm({ name: c.name, code: c.code, department: c.department, semester: c.semester || '', credits: c.credits || '', description: c.description || '' });
    setModal(true);
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Layout role="admin" title="Courses">
      <div className="page-header-row page-header">
        <div><h1>Courses</h1><p>Manage all academic courses</p></div>
        <button className="btn btn-primary" onClick={() => { setEditId(null); setForm(empty); setModal(true); }}><i className="fas fa-plus"></i> Add Course</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Code</th><th>Department</th><th>Semester</th><th>Credits</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="6"><div className="loading-center"><div className="spinner"></div></div></td></tr>
                : !courses.length ? <tr><td colSpan="6"><div className="empty-state"><i className="fas fa-book"></i><p>No courses yet</p></div></td></tr>
                : courses.map(c => (
                  <tr key={c._id}>
                    <td><strong>{c.name}</strong></td>
                    <td><span className="badge badge-blue">{c.code}</span></td>
                    <td>{c.department}</td>
                    <td>{c.semester || '—'}</td>
                    <td>{c.credits || '—'}</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => edit(c)}><i className="fas fa-edit"></i></button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(c._id)}><i className="fas fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header">
              <h3>{editId ? 'Edit Course' : 'Add Course'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="form-group"><label className="form-label">Course Name *</label>
              <input className="form-input" placeholder="e.g. Data Structures" value={form.name} onChange={e => f('name', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Code *</label>
                <input className="form-input" placeholder="e.g. CS201" value={form.code} onChange={e => f('code', e.target.value.toUpperCase())} />
              </div>
              <div className="form-group"><label className="form-label">Department *</label>
                <input className="form-input" placeholder="e.g. Computer Science" value={form.department} onChange={e => f('department', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Semester</label>
                <select className="form-select" value={form.semester} onChange={e => f('semester', e.target.value)}>
                  <option value="">— Select —</option>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Credits</label>
                <input className="form-input" type="number" min="0" placeholder="e.g. 4" value={form.credits} onChange={e => f('credits', e.target.value)} />
              </div>
            </div>
            <div className="form-group"><label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Brief description…" value={form.description} onChange={e => f('description', e.target.value)} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}><i className="fas fa-save"></i> Save</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
