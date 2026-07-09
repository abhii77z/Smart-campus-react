import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { studentAPI } from '../../services/api';

const STORAGE_KEY = 'sc_anon_report_tokens';
const catColors = { academic: 'blue', facility: 'amber', personal: 'purple', harassment: 'red', general: 'gray' };
const fmt = d => d ? new Date(d).toLocaleDateString() : '—';

function getTokens() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
}
function saveToken(token) {
    const tokens = getTokens();
    tokens.push(token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export default function StudentAnonymousReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({ category: 'academic', subject: '', message: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        const tokens = getTokens();
        if (tokens.length === 0) { setReports([]); setLoading(false); return; }
        try {
            const d = await studentAPI.getAnonymousReports(tokens.join(','));
            setReports(d.reports || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    async function submit() {
        if (!form.message.trim()) return alert('Message is required.');
        setSubmitting(true);
        try {
            const d = await studentAPI.submitAnonymousReport(form);
            if (d.report_token) saveToken(d.report_token);
            setModal(false);
            setForm({ category: 'academic', subject: '', message: '' });
            load();
        } catch (e) {
            alert(e.response?.data?.error || e.message);
        }
        setSubmitting(false);
    }

    const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

    return (
        <Layout role="student" title="Anonymous Reports">
            <div className="page-header-row page-header">
                <div>
                    <h1>Anonymous Reports</h1>
                    <p>Send anonymous feedback to your department's faculty</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModal(true)}>
                    <i className="fas fa-plus"></i> New Report
                </button>
            </div>

            {/* Anonymity notice */}
            <div className="alert alert-info fade-up" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="fas fa-shield-alt" style={{ fontSize: '1.2rem' }}></i>
                <div>
                    <strong>Your identity is completely hidden.</strong> Reports are sent without your name or username.
                    Faculty can only see the message and your department.
                </div>
            </div>

            {loading ? <div className="loading-center"><div className="spinner"></div></div>
                : !reports.length ? (
                    <div className="empty-state">
                        <i className="fas fa-user-secret" style={{ fontSize: '2.5rem', marginBottom: 12 }}></i>
                        <p>No anonymous reports yet</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Your reports are 100% anonymous — faculty will never see your identity.</p>
                    </div>
                ) : reports.map(r => (
                    <div key={r._id} className="card fade-up" style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                                <span className={`badge badge-${catColors[r.category] || 'gray'}`}>{r.category}</span>
                                <span className={`badge ${r.status === 'responded' ? 'badge-green' : 'badge-amber'}`}>{r.status}</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmt(r.created_at)}</div>
                        </div>
                        {r.subject && <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 6 }}>{r.subject}</div>}
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.6 }}>{r.message}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                            <i className="fas fa-building"></i> Sent to <strong>{r.department}</strong> department
                        </div>
                        {r.response ? (
                            <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, marginBottom: 4 }}><i className="fas fa-reply"></i> Faculty Response</div>
                                <div style={{ fontSize: '0.875rem' }}>{r.response}</div>
                            </div>
                        ) : (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><i className="fas fa-clock"></i> Awaiting faculty response…</div>
                        )}
                    </div>
                ))}

            {/* Submit Report Modal */}
            {modal && (
                <div className="modal-overlay active">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Submit Anonymous Report</h3>
                            <button className="modal-close" onClick={() => setModal(false)}><i className="fas fa-times"></i></button>
                        </div>
                        <div className="alert alert-info" style={{ marginBottom: 16, fontSize: '0.85rem' }}>
                            <i className="fas fa-shield-alt"></i> Your identity will <strong>not</strong> be stored or shared with anyone. Faculty will only see the message and department.
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-select" value={form.category} onChange={e => f('category', e.target.value)}>
                                {['academic', 'facility', 'personal', 'harassment', 'general'].map(c => (
                                    <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Subject (optional)</label>
                            <input className="form-input" placeholder="Brief subject line…" value={form.subject} onChange={e => f('subject', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Message *</label>
                            <textarea className="form-textarea" rows="5" placeholder="Describe your concern in detail…" value={form.message} onChange={e => f('message', e.target.value)} />
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={submit} disabled={submitting}>
                                <i className={`fas ${submitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i> {submitting ? 'Submitting…' : 'Submit Anonymously'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
