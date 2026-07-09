import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login, setUser } from '../../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fillDemo = (id, pw) => setForm({ username: id, password: pw })

  const handleSubmit = async () => {
    setError('')
    if (!form.username || !form.password) { setError('Please enter your username and password.'); return }
    setLoading(true)
    try {
      const res = await login({ username: form.username, password: form.password })
      const user = res.data.user
      setUser(user)
      if (user.role === 'admin') navigate('/admin/dashboard')
      else if (user.role === 'faculty') navigate('/faculty/dashboard')
      else navigate('/student/dashboard')
    } catch (e) {
      setError(e.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content fade-up">
          <div className="big-logo">🎓</div>
          <h1>Smart Campus</h1>
          <p>A unified digital platform for students, faculty, and administrators at Mar Elias College, Kottappady.</p>
          <div className="auth-feature-list">
            <div className="auth-feature"><i className="fas fa-calendar-alt"></i> Personalized timetables &amp; exam schedules</div>
            <div className="auth-feature"><i className="fas fa-clipboard-check"></i> Real-time attendance tracking</div>
            <div className="auth-feature"><i className="fas fa-comments"></i> Appointment &amp; grievance management</div>
            <div className="auth-feature"><i className="fas fa-bullhorn"></i> Announcements &amp; event gallery</div>
            <div className="auth-feature"><i className="fas fa-book-open"></i> Course materials &amp; resources</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box fade-up">
          <h2>Welcome back</h2>
          <p className="auth-sub">Sign in to your Smart Campus account</p>

          {error && <div className="alert alert-danger"><i className="fas fa-exclamation-circle"></i>{error}</div>}

          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-icon-wrap">
              <i className="fas fa-user input-icon"></i>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrap">
              <i className="fas fa-lock input-icon"></i>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <><i className="fas fa-spinner fa-spin"></i> Signing in…</> : <><i className="fas fa-sign-in-alt"></i> Sign In</>}
          </button>

          <div className="auth-link" style={{ marginTop: 20 }}>
            Don't have an account? <Link to="/signup">Register here</Link>
          </div>

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 10 }}>Demo Credentials</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => fillDemo('admin', 'admin123')}>Admin</button>
              <button className="btn btn-secondary btn-sm" onClick={() => fillDemo('fac_arun', 'faculty@123')}>Faculty</button>
              <button className="btn btn-secondary btn-sm" onClick={() => fillDemo('stu_adithyan', 'student@123')}>Student</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
