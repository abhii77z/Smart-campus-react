import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminTimetable() {
  const [ttType, setTtType] = useState('student');
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [details, setDetails] = useState({ department: '', course: '', semester: '', effective_from: '' });
  const [slots, setSlots] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedList, setSavedList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    adminAPI.getDepartments().then(d => setDepartments(d.departments || [])).catch(console.error);
    adminAPI.getCourses().then(d => setCourses(d.courses || [])).catch(console.error);
    loadSaved();
  }, []);

  async function loadSaved() {
    setLoadingList(true);
    try { const d = await adminAPI.getTimetables(); setSavedList(d.timetables || []); } catch (e) { console.error(e); }
    setLoadingList(false);
  }

  function addSlot() {
    setSlots(prev => [...prev, { id: Date.now(), day: 'Monday', subject: '', time: '', faculty: '' }]);
  }
  function removeSlot(id) { setSlots(prev => prev.filter(s => s.id !== id)); }
  function updateSlot(id, field, value) {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  async function save() {
    if (!details.department) return alert('Department is required.');
    if (ttType === 'student' && (!details.course || !details.semester)) return alert('Course and semester are required for student timetable.');
    if (!slots.length) return alert('Add at least one time slot.');
    setSaving(true);
    try {
      const schedule = {};
      DAYS.forEach(d => { schedule[d] = slots.filter(s => s.day === d).map(s => ({ subject: s.subject, time: s.time, faculty: s.faculty })); });
      await adminAPI.createTimetable({
        timetable_type: ttType,
        department: details.department,
        course: ttType === 'student' ? details.course : '',
        semester: ttType === 'student' ? details.semester : '',
        effective_from: details.effective_from,
        schedule,
      });
      alert('Timetable saved!');
      loadSaved();
    } catch (e) { alert(e.message); }
    setSaving(false);
  }

  async function deleteTt(id) {
    if (!confirm('Delete this timetable?')) return;
    try { await adminAPI.deleteTimetable(id); loadSaved(); } catch (e) { alert(e.message); }
  }

  const d = (k, v) => setDetails(p => ({ ...p, [k]: v }));

  // Schedule preview
  const byDay = {};
  DAYS.forEach(day => { byDay[day] = slots.filter(s => s.day === day); });
  const maxRows = Math.max(...Object.values(byDay).map(v => v.length), 1);

  // Filter courses by selected department
  const deptCourses = details.department ? courses.filter(c => c.department === details.department) : courses;

  return (
    <Layout role="admin" title="Timetable Management">
      <div className="page-header"><h1>Timetable Management</h1><p>Create and manage class schedules for departments</p></div>

      {/* Type Toggle */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab-btn ${ttType === 'student' ? 'active' : ''}`} onClick={() => setTtType('student')}>
          <i className="fas fa-user-graduate"></i> Student Timetable
        </button>
        <button className={`tab-btn ${ttType === 'faculty' ? 'active' : ''}`} onClick={() => setTtType('faculty')}>
          <i className="fas fa-chalkboard-teacher"></i> Faculty Timetable
        </button>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Details Card */}
        <div className="card">
          <div className="card-header"><span className="card-title">Schedule Details</span></div>
          <div className="form-group"><label className="form-label">Department *</label>
            <select className="form-select" value={details.department} onChange={e => d('department', e.target.value)}>
              <option value="">— Select Department —</option>
              {departments.map(dp => <option key={dp._id} value={dp.name}>{dp.name} ({dp.code})</option>)}
            </select>
          </div>
          {ttType === 'student' && (
            <div className="form-row">
              <div className="form-group"><label className="form-label">Course *</label>
                <select className="form-select" value={details.course} onChange={e => d('course', e.target.value)}>
                  <option value="">— Select Course —</option>
                  {deptCourses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Semester *</label>
                <select className="form-select" value={details.semester} onChange={e => d('semester', e.target.value)}>
                  <option value="">Select</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={String(s)}>{s}</option>)}
                </select>
              </div>
            </div>
          )}
          <div className="form-group"><label className="form-label">Effective From</label>
            <input className="form-input" type="date" value={details.effective_from} onChange={e => d('effective_from', e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            <i className={`fas ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> Save Timetable
          </button>
        </div>

        {/* Slot Builder */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Weekly Schedule Builder</span>
            <button className="btn btn-secondary btn-sm" onClick={addSlot}><i className="fas fa-plus"></i> Add Slot</button>
          </div>
          {!slots.length
            ? <div className="empty-state" style={{ padding: 20 }}><i className="fas fa-calendar"></i><p>No slots added yet</p></div>
            : slots.map(s => (
              <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 1fr auto', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                <select className="form-select" style={{ fontSize: '0.8rem' }} value={s.day} onChange={e => updateSlot(s.id, 'day', e.target.value)}>
                  {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
                <input className="form-input" style={{ fontSize: '0.8rem' }} placeholder="Subject" value={s.subject} onChange={e => updateSlot(s.id, 'subject', e.target.value)} />
                <input className="form-input" style={{ fontSize: '0.8rem' }} placeholder="Time" value={s.time} onChange={e => updateSlot(s.id, 'time', e.target.value)} />
                <input className="form-input" style={{ fontSize: '0.8rem' }} placeholder="Faculty name" value={s.faculty} onChange={e => updateSlot(s.id, 'faculty', e.target.value)} />
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => removeSlot(s.id)}><i className="fas fa-times"></i></button>
              </div>
            ))
          }
          <div className="alert alert-info" style={{ marginTop: 8, fontSize: '0.8rem' }}>Add time slots for each day with subject, time, and faculty name.</div>
        </div>
      </div>

      {/* Preview */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><span className="card-title">Schedule Preview</span></div>
        <div className="timetable-grid">
          <table className="timetable-table">
            <thead><tr><th>#</th>{DAYS.map(d => <th key={d}>{d}</th>)}</tr></thead>
            <tbody>
              {Array.from({ length: maxRows }, (_, i) => (
                <tr key={i}>
                  <td><small style={{ color: 'var(--text-muted)' }}>{i + 1}</small></td>
                  {DAYS.map(day => {
                    const slot = byDay[day][i];
                    return slot
                      ? <td key={day}><div className="timetable-slot"><div className="slot-subject">{slot.subject || '?'}</div><div className="slot-time">{slot.time}{slot.faculty ? ` · ${slot.faculty}` : ''}</div></div></td>
                      : <td key={day}>—</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Saved Timetables */}
      <div className="card">
        <div className="card-header"><span className="card-title">Saved Timetables</span></div>
        {loadingList ? <div className="loading-center"><div className="spinner"></div></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Type</th><th>Department</th><th>Course</th><th>Semester</th><th>Effective From</th><th>Actions</th></tr></thead>
              <tbody>
                {!savedList.length
                  ? <tr><td colSpan="6"><div className="empty-state"><i className="fas fa-calendar-week"></i><p>No timetables saved yet</p></div></td></tr>
                  : savedList.map(t => (
                    <tr key={t._id}>
                      <td><span className={`badge ${t.timetable_type === 'faculty' ? 'badge-blue' : 'badge-green'}`}>{t.timetable_type || 'student'}</span></td>
                      <td><strong>{t.department}</strong></td>
                      <td>{t.course || '—'}</td>
                      <td>{t.semester || '—'}</td>
                      <td>{t.effective_from || '—'}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteTt(t._id)}><i className="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
