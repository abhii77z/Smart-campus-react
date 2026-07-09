import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../../services/api'

const DEPARTMENTS = ['Computer Science & Applications', 'Mathematics', 'Physics', 'Chemistry', 'Commerce', 'English']
const COURSES = ['BCA', 'BSc CS', 'BSc Maths', 'BCom', 'BA English']
const SEMESTERS = ['1', '2', '3', '4', '5', '6']

export default function Signup() {
  const navigate = useNavigate()
  const [role, setRole] = useState('student')
  const [form, setForm] = useState({
    name: '', username: '', email: '', phone: '', department: '',
    course: '', semester: '', roll_no: '',
    designation: '', specialization: '',
    password: '', confirm_password: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError(''); setSuccess('')
    if (!form.name || !form.username || !form.email || !form.department || !form.password) {
      setError('Please fill all required fields.'); return
    }
    if (form.password !== form.confirm_password) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (role === 'student' && (!form.course || !form.semester)) { setError('Please select your course and semester.'); return }
    setLoading(true)
    try {
      await register(role, form)
      setSuccess('Registration submitted — awaiting admin approval.')
      setTimeout(() => navigate('/login'), 2500)
    } catch (e) {
      setError(e.response?.data?.error || 'Registration failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content fade-up">
          <div className="big-logo">📝</div>
          <h1>Join Smart Campus</h1>
          <p>Create your account to access the complete digital campus experience at Mar Elias College.</p>
          <div className="auth-feature-list">
            <div className="auth-feature"><i className="fas fa-shield-alt"></i> Secure role-based access</div>
            <div className="auth-feature"><i className="fas fa-clock"></i> Account activation within 24 hours</div>
            <div className="auth-feature"><i className="fas fa-mobile-alt"></i> Access from any device</div>
            <div className="auth-feature"><i className="fas fa-lock"></i> Your data stays private</div>
          </div>
        </div>
      </div>

      <div className="auth-right" style={{ overflowY: 'auto' }}>
        <div className="auth-box fade-up" style={{ maxWidth: 440 }}>
          <h2>Create Account</h2>
          <p className="auth-sub">Register as a student or faculty member</p>

          <div className="auth-toggle">
            <button className={`auth-toggle-btn ${role === 'student' ? 'active' : ''}`} onClick={() => setRole('student')}>Student</button>
            <button className={`auth-toggle-btn ${role === 'faculty' ? 'active' : ''}`} onClick={() => setRole('faculty')}>Faculty</button>
          </div>

          {error && <div className="alert alert-danger"><i className="fas fa-exclamation-circle"></i> {error}</div>}
          {success && <div className="alert alert-success"><i className="fas fa-check-circle"></i> {success}</div>}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input className="form-input" placeholder="e.g. STU2025001" value={form.username} onChange={e => set('username', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" className="form-input" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="tel" className="form-input" placeholder="10-digit number" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Department *</label>
            <select className="form-select" value={form.department} onChange={e => set('department', e.target.value)}>
              <option value="">Select Department</option>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          {role === 'student' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Course *</label>
                  <select className="form-select" value={form.course} onChange={e => set('course', e.target.value)}>
                    <option value="">Select Course</option>
                    {COURSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Semester *</label>
                  <select className="form-select" value={form.semester} onChange={e => set('semester', e.target.value)}>
                    <option value="">Select</option>
                    {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Roll No</label>
                <input className="form-input" placeholder="College roll number" value={form.roll_no} onChange={e => set('roll_no', e.target.value)} />
              </div>
            </>
          )}

          {role === 'faculty' && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Designation</label>
                <input className="form-input" placeholder="e.g. Assistant Professor" value={form.designation} onChange={e => set('designation', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Specialization</label>
                <input className="form-input" placeholder="Your specialization" value={form.specialization} onChange={e => set('specialization', e.target.value)} />
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input type="password" className="form-input" placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input type="password" className="form-input" placeholder="Re-enter password" value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)} />
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 8 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <><i className="fas fa-spinner fa-spin"></i> Submitting…</> : <><i className="fas fa-user-plus"></i> Register</>}
          </button>

          <div className="auth-link" style={{ marginTop: 20 }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
