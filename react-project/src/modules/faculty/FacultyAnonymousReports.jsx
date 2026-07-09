import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { facultyAPI } from '../../services/api';

const catColors = { academic: 'blue', facility: 'amber', personal: 'purple', harassment: 'red', general: 'gray' };
const fmt = d => d ? new Date(d).toLocaleDateString() : '—';

export default function FacultyAnonymousReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [respondingId, setRespondingId] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        try {
            const d = await facultyAPI.getAnonymousReports();
            setReports(d.reports || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    async function submitResponse(reportId) {
        if (!responseText.trim()) return alert('Response text is required.');
        setSubmitting(true);
        try {
            await facultyAPI.respondAnonymousReport(reportId, { response: responseText });
            setRespondingId(null);
            setResponseText('');
            load();
        } catch (e) { alert(e.response?.data?.error || e.message); }
        setSubmitting(false);
    }

    const filtered = reports.filter(r => filter === 'all' || r.status === filter);
    const pendingCount = reports.filter(r => r.status === 'pending').length;

    return (
        <Layout role="faculty" title="Anonymous Reports">
            <div className="page-header-row page-header">
                <div>
                    <h1>Anonymous Reports</h1>
                    <p>View anonymous student feedback for your department</p>
                </div>
                {pendingCount > 0 && (
                    <span className="badge badge-amber" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                        {pendingCount} pending
                    </span>
                )}
            </div>

            {/* Anonymity notice */}
            <div className="alert alert-info fade-up" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="fas fa-user-secret" style={{ fontSize: '1.2rem' }}></i>
                <div>
                    <strong>All reports are anonymous.</strong> Student identities are not stored or trackable.
                    Reports are routed by department only.
                </div>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[['all', 'All'], ['pending', 'Pending'], ['responded', 'Responded']].map(([val, label]) => (
                    <button key={val} className={`btn btn-sm ${filter === val ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(val)}>
                        {label}
                    </button>
                ))}
            </div>

            {loading ? <div className="loading-center"><div className="spinner"></div></div>
                : !filtered.length ? (
                    <div className="empty-state">
                        <i className="fas fa-inbox" style={{ fontSize: '2.5rem', marginBottom: 12 }}></i>
                        <p>{filter === 'all' ? 'No anonymous reports yet' : `No ${filter} reports`}</p>
                    </div>
                ) : filtered.map(r => (
                    <div key={r._id} className="card fade-up" style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                                <span className="badge badge-purple"><i className="fas fa-user-secret" style={{ marginRight: 4 }}></i> Anonymous</span>
                                <span className={`badge badge-${catColors[r.category] || 'gray'}`}>{r.category}</span>
                                <span className={`badge ${r.status === 'responded' ? 'badge-green' : 'badge-amber'}`}>{r.status}</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmt(r.created_at)}</div>
                        </div>

                        {r.subject && <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 6 }}>{r.subject}</div>}
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.6 }}>{r.message}</div>

                        {r.response ? (
                            <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, marginBottom: 4 }}><i className="fas fa-reply"></i> Your Response</div>
                                <div style={{ fontSize: '0.875rem' }}>{r.response}</div>
                                {r.responded_at && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6 }}>Responded on {fmt(r.responded_at)}</div>}
                            </div>
                        ) : respondingId === r._id ? (
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 8 }}>
                                <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label className="form-label">Your Response</label>
                                    <textarea className="form-textarea" rows="3" placeholder="Write your response to this anonymous report…" value={responseText} onChange={e => setResponseText(e.target.value)} />
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn btn-primary btn-sm" onClick={() => submitResponse(r._id)} disabled={submitting}>
                                        <i className={`fas ${submitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i> {submitting ? 'Sending…' : 'Send Response'}
                                    </button>
                                    <button className="btn btn-secondary btn-sm" onClick={() => { setRespondingId(null); setResponseText(''); }}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <button className="btn btn-secondary btn-sm" onClick={() => { setRespondingId(r._id); setResponseText(''); }} style={{ marginTop: 4 }}>
                                <i className="fas fa-reply"></i> Respond
                            </button>
                        )}
                    </div>
                ))}
        </Layout>
    );
}
