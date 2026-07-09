import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../services/api';

export default function AdminFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '', category: 'general', order: 0 });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const d = await adminAPI.getFaqs(); setFaqs(d.faqs || []); } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function save() {
    if (!form.question || !form.answer) return alert('Question and answer required.');
    try {
      await adminAPI.createFaq({ ...form, order: parseInt(form.order) || 0 });
      setModal(false); setForm({ question: '', answer: '', category: 'general', order: 0 }); load();
    } catch (e) { alert(e.message); }
  }

  async function del(id) {
    if (!confirm('Delete this FAQ?')) return;
    try { await adminAPI.deleteFaq(id); load(); } catch (e) { alert(e.message); }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Layout role="admin" title="FAQs">
      <div className="page-header-row page-header">
        <div><h1>FAQs</h1><p>Manage frequently asked questions for students and staff</p></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><i className="fas fa-plus"></i> Add FAQ</button>
      </div>

      <div className="card" style={{ padding: 20 }}>
        {loading ? <div className="loading-center"><div className="spinner"></div></div>
          : !faqs.length ? <div className="empty-state"><i className="fas fa-question-circle"></i><p>No FAQs yet. Add some!</p></div>
          : faqs.map((faq, i) => (
            <div key={faq._id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}><span style={{ color: 'var(--accent)', marginRight: 8 }}>Q{i + 1}.</span>{faq.question}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', paddingLeft: 24 }}>{faq.answer}</div>
                  <div style={{ marginTop: 6 }}><span className="badge badge-blue">{faq.category}</span></div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => del(faq._id)}><i className="fas fa-trash"></i></button>
              </div>
            </div>
          ))}
      </div>

      {modal && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header">
              <h3>Add FAQ</h3>
              <button className="modal-close" onClick={() => setModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="form-group"><label className="form-label">Question *</label>
              <input className="form-input" placeholder="Enter the question" value={form.question} onChange={e => f('question', e.target.value)} />
            </div>
            <div className="form-group"><label className="form-label">Answer *</label>
              <textarea className="form-textarea" rows="4" placeholder="Enter the answer" value={form.answer} onChange={e => f('answer', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => f('category', e.target.value)}>
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="technical">Technical</option>
                  <option value="financial">Financial</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Display Order</label>
                <input className="form-input" type="number" min="0" value={form.order} onChange={e => f('order', e.target.value)} />
              </div>
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
