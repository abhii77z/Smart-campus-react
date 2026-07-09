import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../services/api';

const empty = { name: '', code: '', hod: '', description: '' };

export default function AdminDepartments() {
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const d = await adminAPI.getDepartments(); setDepts(d.departments || []); } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function save() {
    if (!form.name || !form.code) return alert('Name and code are required.');
    try {
      if (editId) await adminAPI.updateDepartment(editId, form);
      else await adminAPI.createDepartment(form);
      setModal(false); setEditId(null); setForm(empty); load();
    } catch (e) { alert(e.message); }
  }

  async function del(id) {
    if (!confirm('Delete this department?')) return;
    try { await adminAPI.deleteDepartment(id); load(); } catch (e) { alert(e.message); }
  }

  function edit(d) {
    setEditId(d._id);
    setForm({ name: d.name, code: d.code, hod: d.hod || '', description: d.description || '' });
    setModal(true);
  }

  return (
    <Layout role="admin" title="Departments">
      <div className="page-header-row page-header">
        <div><h1>Departments</h1><p>Manage academic departments and their details</p></div>
        <button className="btn btn-primary" onClick={() => { setEditId(null); setForm(empty); setModal(true); }}><i className="fas fa-plus"></i> Add Department</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Code</th><th>HOD</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="5"><div className="loading-center"><div className="spinner"></div></div></td></tr>
                : !depts.length ? <tr><td colSpan="5"><div className="empty-state"><i className="fas fa-building"></i><p>No departments yet</p></div></td></tr>
                : depts.map(d => (
                  <tr key={d._id}>
                    <td><strong>{d.name}</strong></td>
                    <td><span className="badge badge-blue">{d.code}</span></td>
                    <td>{d.hod || '—'}</td>
                    <td>{d.description || '—'}</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => edit(d)}><i className="fas fa-edit"></i></button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(d._id)}><i className="fas fa-trash"></i></button>
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
              <h3>{editId ? 'Edit Department' : 'Add Department'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="form-group"><label className="form-label">Department Name *</label>
              <input className="form-input" placeholder="e.g. Computer Science & Applications" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Code *</label>
                <input className="form-input" placeholder="e.g. CSA" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
              </div>
              <div className="form-group"><label className="form-label">HOD</label>
                <input className="form-input" placeholder="Head of Department name" value={form.hod} onChange={e => setForm({ ...form, hod: e.target.value })} />
              </div>
            </div>
            <div className="form-group"><label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Brief description…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
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
