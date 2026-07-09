import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../services/api';

export default function AdminApprovals() {
  const [tab, setTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(allUsers.filter(u => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)));
  }, [search, allUsers]);

  async function loadData() {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([adminAPI.getPendingUsers(), adminAPI.getUsers()]);
      setPending(p.pending_users || []);
      setAllUsers(a.users || []);
      setFiltered(a.users || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function approve(id) {
    try {
      await adminAPI.approveUser(id);
      setPending(prev => prev.filter(u => u._id !== id));
      loadData();
    } catch (e) { alert(e.message); }
  }

  async function reject(id) {
    if (!confirm('Reject this registration?')) return;
    try {
      await adminAPI.rejectUser(id);
      setPending(prev => prev.filter(u => u._id !== id));
    } catch (e) { alert(e.message); }
  }

  async function deleteUser(id) {
    if (!confirm('Permanently delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      loadData();
    } catch (e) { alert(e.message); }
  }

  const fmt = d => d ? new Date(d.$date || d).toLocaleDateString() : '—';
  const statusBadge = s => ({ approved: 'badge-green', pending: 'badge-yellow', rejected: 'badge-red' }[s] || 'badge-blue');

  return (
    <Layout role="admin" title="Account Approvals">
      <div className="page-header-row page-header">
        <div><h1>Account Approvals</h1><p>Review and approve pending student &amp; faculty registrations</p></div>
        <div className="search-bar"><i className="fas fa-search"></i>
          <input type="text" placeholder="Search by name or ID…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>Pending ({pending.length})</button>
        <button className={`tab-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All Users</button>
      </div>

      {tab === 'pending' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Login ID</th><th>Role</th><th>Department</th><th>Registered</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan="6"><div className="loading-center"><div className="spinner"></div></div></td></tr>
                  : !pending.length ? <tr><td colSpan="6"><div className="empty-state"><i className="fas fa-check-circle" style={{color:'var(--success)'}}></i><p>No pending registrations</p></div></td></tr>
                  : pending.map(u => (
                    <tr key={u._id}>
                      <td><strong>{u.name}</strong></td>
                      <td><code style={{fontSize:'0.8rem',color:'var(--accent)'}}>{u.username}</code></td>
                      <td><span className="badge badge-blue">{u.usertype}</span></td>
                      <td>{u.department || '—'}</td>
                      <td>{fmt(u.created_at)}</td>
                      <td style={{display:'flex',gap:6}}>
                        <button className="btn btn-success btn-sm" onClick={() => approve(u._id)}><i className="fas fa-check"></i> Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => reject(u._id)}><i className="fas fa-times"></i> Reject</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'all' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Login ID</th><th>Role</th><th>Department</th><th>Status</th><th>Registered</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan="7"><div className="loading-center"><div className="spinner"></div></div></td></tr>
                  : !filtered.length ? <tr><td colSpan="7"><div className="empty-state"><i className="fas fa-users"></i><p>No users found</p></div></td></tr>
                  : filtered.map(u => (
                    <tr key={u._id}>
                      <td><strong>{u.name}</strong></td>
                      <td><code style={{fontSize:'0.8rem',color:'var(--accent)'}}>{u.username}</code></td>
                      <td><span className="badge badge-blue">{u.usertype}</span></td>
                      <td>{u.department || '—'}</td>
                      <td><span className={`badge ${statusBadge(u.status)}`}>{u.status}</span></td>
                      <td>{fmt(u.created_at)}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id)}><i className="fas fa-trash"></i></button></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
