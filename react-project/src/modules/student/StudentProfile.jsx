import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { studentAPI } from '../../services/api';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [pw, setPw] = useState({ old_password: '', new_password: '', confirm: '' });
  const [msg, setMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    studentAPI.getProfile().then(d => {
      const p = d.profile;
      setProfile(p);
      setForm({ name: p.name || '', email: p.email || '', phone: p.phone || '' });
    }).catch(console.error);
  }, []);

  async function saveProfile() {
    try {
      await studentAPI.updateProfile(form);
      setMsg({ type: 'success', text: 'Profile updated!' });
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      u.name = form.name; localStorage.setItem('user', JSON.stringify(u));
    } catch (e) { setMsg({ type: 'error', text: e.message }); }
    setTimeout(() => setMsg(null), 3000);
  }

  async function changePassword() {
    if (pw.new_password !== pw.confirm) return setPwMsg({ type: 'error', text: 'Passwords do not match.' });
    if (pw.new_password.length < 6) return setPwMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
    try {
      await studentAPI.updatePassword({ old_password: pw.old_password, new_password: pw.new_password });
      setPwMsg({ type: 'success', text: 'Password changed!' });
      setPw({ old_password: '', new_password: '', confirm: '' });
    } catch (e) { setPwMsg({ type: 'error', text: e.message }); }
    setTimeout(() => setPwMsg(null), 4000);
  }

  const infoRows = [
    { label: 'Login ID', value: profile?.username, icon: 'fa-id-card' },
    { label: 'Course', value: profile?.course, icon: 'fa-book' },
    { label: 'Semester', value: profile?.semester, icon: 'fa-layer-group' },
    { label: 'Department', value: profile?.department, icon: 'fa-building' },
    { label: 'Roll No', value: profile?.roll_no, icon: 'fa-hashtag' },
  ];

  return (
    <Layout role="student" title="My Profile">
      <div className="page-header"><h1>My Profile</h1><p>Manage your account information</p></div>

      <div className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div className="user-avatar" style={{ width: 64, height: 64, fontSize: '1.5rem' }}>
              {(profile?.name || 'S')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{profile?.name || '—'}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{profile?.course || '—'} · Semester {profile?.semester || '—'}</div>
            </div>
          </div>
          {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'danger'}`} style={{ marginBottom: 16 }}>{msg.text}</div>}
          {['name', 'email', 'phone'].map((k, i) => (
            <div key={k} className="form-group">
              <label className="form-label">{['Full Name', 'Email', 'Phone'][i]}</label>
              <input className="form-input" type={k === 'email' ? 'email' : 'text'} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} />
            </div>
          ))}
          <button className="btn btn-primary" onClick={saveProfile}><i className="fas fa-save"></i> Save Changes</button>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><span className="card-title">Academic Info</span></div>
            {infoRows.map(row => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <i className={`fas ${row.icon}`} style={{ color: 'var(--accent)', width: 20 }}></i>
                <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.label}</div><div style={{ fontWeight: 500 }}>{row.value || '—'}</div></div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Change Password</span></div>
            {pwMsg && <div className={`alert alert-${pwMsg.type === 'success' ? 'success' : 'danger'}`} style={{ marginBottom: 16 }}>{pwMsg.text}</div>}
            {[['old_password', 'Current Password'], ['new_password', 'New Password'], ['confirm', 'Confirm Password']].map(([k, label]) => (
              <div key={k} className="form-group">
                <label className="form-label">{label}</label>
                <input className="form-input" type="password" value={pw[k]} onChange={e => setPw(p => ({ ...p, [k]: e.target.value }))} />
              </div>
            ))}
            <button className="btn btn-primary" onClick={changePassword}><i className="fas fa-lock"></i> Change Password</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
