import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../services/api';

export default function AdminSettings() {
  const [form, setForm] = useState({
    institution_name: '', academic_year: '', contact_email: '',
    min_attendance: 75, pass_mark: 40,
    registration_open: true, grievance_enabled: true, appointments_enabled: true,
  });
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    adminAPI.getSettings().then(d => {
      const s = d.settings || {};
      setForm(p => ({ ...p, ...s }));
    }).catch(() => {});
  }, []);

  async function save() {
    try {
      await adminAPI.updateSettings({ ...form, min_attendance: parseInt(form.min_attendance) || 75, pass_mark: parseInt(form.pass_mark) || 40 });
      setMsg({ type: 'success', text: 'Settings saved!' });
    } catch (e) { setMsg({ type: 'error', text: e.message }); }
    setTimeout(() => setMsg(null), 3000);
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Layout role="admin" title="Settings">
      <div className="page-header"><h1>System Settings</h1><p>Configure institution-wide preferences</p></div>

      {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'danger'}`} style={{ marginBottom: 20 }}><i className={`fas fa-${msg.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i> {msg.text}</div>}

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Institution Info</span></div>
          <div className="form-group"><label className="form-label">Institution Name</label>
            <input className="form-input" placeholder="e.g. Smart Campus University" value={form.institution_name} onChange={e => f('institution_name', e.target.value)} />
          </div>
          <div className="form-group"><label className="form-label">Academic Year</label>
            <input className="form-input" placeholder="e.g. 2024-25" value={form.academic_year} onChange={e => f('academic_year', e.target.value)} />
          </div>
          <div className="form-group"><label className="form-label">Contact Email</label>
            <input className="form-input" type="email" placeholder="admin@campus.edu" value={form.contact_email} onChange={e => f('contact_email', e.target.value)} />
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Academic Rules</span></div>
          <div className="form-group"><label className="form-label">Minimum Attendance (%)</label>
            <input className="form-input" type="number" min="0" max="100" value={form.min_attendance} onChange={e => f('min_attendance', e.target.value)} />
          </div>
          <div className="form-group"><label className="form-label">Pass Mark (%)</label>
            <input className="form-input" type="number" min="0" max="100" value={form.pass_mark} onChange={e => f('pass_mark', e.target.value)} />
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Feature Toggles</span></div>
          {[
            { key: 'registration_open', label: 'Open Registration', desc: 'Allow new student/faculty signups' },
            { key: 'grievance_enabled', label: 'Grievance System', desc: 'Enable grievance submission' },
            { key: 'appointments_enabled', label: 'Appointments', desc: 'Allow appointment booking' },
          ].map(item => (
            <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{item.label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!form[item.key]} onChange={e => f(item.key, e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                <span style={{ fontSize: '0.85rem', color: form[item.key] ? 'var(--success)' : 'var(--text-muted)' }}>{form[item.key] ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <button className="btn btn-primary" onClick={save}><i className="fas fa-save"></i> Save Settings</button>
      </div>
    </Layout>
  );
}
