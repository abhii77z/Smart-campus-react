import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { adminUsers, adminDeleteUser, adminDepartments } from '../../services/api'
import { adminAPI } from '../../services/api'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  // Department assignment state
  const [deptModal, setDeptModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [departments, setDepartments] = useState([])
  const [selectedDept, setSelectedDept] = useState('')
  const [assigning, setAssigning] = useState(false)

  const load = () => {
    setLoading(true)
    adminUsers().then(r => setUsers(r.data.users || [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  // Load departments once
  useEffect(() => {
    adminDepartments().then(r => setDepartments(r.data.departments || [])).catch(console.error)
  }, [])

  const del = async (id) => {
    if (!window.confirm('Delete this user?')) return
    await adminDeleteUser(id)
    load()
  }

  const openDeptModal = (user) => {
    setSelectedUser(user)
    setSelectedDept(user.department || '')
    setDeptModal(true)
  }

  const assignDept = async () => {
    if (!selectedDept) return alert('Please select a department.')
    setAssigning(true)
    try {
      await adminAPI.assignDepartment(selectedUser._id, { department: selectedDept })
      setDeptModal(false)
      setSelectedUser(null)
      load()
    } catch (e) {
      alert(e.response?.data?.error || e.message)
    }
    setAssigning(false)
  }

  const filtered = users.filter(u => {
    const matchRole = filter === 'all' || u.usertype === filter
    const matchSearch = !search || [u.name, u.username, u.email, u.department].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    return matchRole && matchSearch
  })

  const statusBadge = (s) => {
    const map = { approved: 'badge-green', pending: 'badge-amber', rejected: 'badge-red' }
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>
  }

  return (
    <Layout title="Users">
      <div className="page-header-row fade-up" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: 4 }}>All Users</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage student and faculty accounts</p>
        </div>
      </div>

      <div className="card fade-up">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <i className="fas fa-search"></i>
            <input placeholder="Search name, username, email…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['all', 'student', 'faculty'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
                {f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? <div className="loading-center"><div className="spinner"></div></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Username</th><th>Role</th><th>Department</th><th>Email</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No users found</td></tr>
                ) : filtered.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name || '—'}</td>
                    <td><code style={{ fontSize: '0.8rem' }}>{u.username}</code></td>
                    <td><span className={`badge ${u.usertype === 'admin' ? 'badge-purple' : u.usertype === 'faculty' ? 'badge-blue' : 'badge-green'}`}>{u.usertype}</span></td>
                    <td>
                      {u.department ? (
                        <span className="badge badge-blue">{u.department}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Not assigned</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{u.email || '—'}</td>
                    <td>{statusBadge(u.status || 'approved')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openDeptModal(u)} title="Assign Department">
                          <i className="fas fa-building"></i>
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => del(u._id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Department Modal */}
      {deptModal && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header">
              <h3>Assign Department</h3>
              <button className="modal-close" onClick={() => setDeptModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div style={{ padding: '0 0 8px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>
                Assign a department to <strong>{selectedUser?.name || selectedUser?.username}</strong>
                {selectedUser?.usertype && <span className={`badge ${selectedUser.usertype === 'faculty' ? 'badge-blue' : 'badge-green'}`} style={{ marginLeft: 8 }}>{selectedUser.usertype}</span>}
              </p>
            </div>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select className="form-select" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                <option value="">— Select Department —</option>
                {departments.map(d => (
                  <option key={d._id} value={d.name}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeptModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={assignDept} disabled={assigning}>
                <i className={`fas ${assigning ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> {assigning ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
