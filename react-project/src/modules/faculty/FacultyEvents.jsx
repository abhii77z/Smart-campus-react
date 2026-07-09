import { useState } from 'react';
import Layout from '../../components/Layout';
import { facultyAPI } from '../../services/api';

export default function FacultyEvents() {
  const [form, setForm] = useState({ title: '', description: '', event_date: '', event_time: '', venue: '', poster_url: '' });
  const [msg, setMsg] = useState(null);

  async function submit() {
    if (!form.title || !form.description || !form.event_date || !form.poster_url) return alert('Fill all required fields.');
    try {
      const d = await facultyAPI.createEvent(form);
      setMsg({ type: 'success', text: d.message || 'Event submitted for approval!' });
      setForm({ title: '', description: '', event_date: '', event_time: '', venue: '', poster_url: '' });
    } catch (e) { setMsg({ type: 'error', text: e.message }); }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Layout role="faculty" title="Events">
      <div className="page-header"><h1>Submit Event Poster</h1><p>Submit campus events for admin approval</p></div>

      {msg && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'danger'}`} style={{ marginBottom: 20 }}>
        <i className={`fas fa-${msg.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i> {msg.text}
      </div>}

      <div className="grid-2">
        <div className="card">
          <div className="form-group"><label className="form-label">Event Title *</label><input className="form-input" placeholder="e.g. Annual Tech Fest" value={form.title} onChange={e => f('title', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Description *</label><textarea className="form-textarea" rows="3" placeholder="Brief description of the event…" value={form.description} onChange={e => f('description', e.target.value)} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Date *</label><input className="form-input" type="date" value={form.event_date} onChange={e => f('event_date', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Time</label><input className="form-input" type="time" value={form.event_time} onChange={e => f('event_time', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Venue</label><input className="form-input" placeholder="e.g. Main Auditorium" value={form.venue} onChange={e => f('venue', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Poster URL *</label><input className="form-input" placeholder="https://…" value={form.poster_url} onChange={e => f('poster_url', e.target.value)} /></div>
          <button className="btn btn-primary" onClick={submit}><i className="fas fa-paper-plane"></i> Submit for Approval</button>
        </div>

        {form.poster_url && (
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="card-header"><span className="card-title">Poster Preview</span></div>
            <img src={form.poster_url} alt="Poster Preview" style={{ maxWidth: '100%', borderRadius: 8, marginTop: 12 }} onError={e => e.target.style.display = 'none'} />
          </div>
        )}
      </div>
    </Layout>
  );
}
