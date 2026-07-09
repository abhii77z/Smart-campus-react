import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { facultyAPI } from '../../services/api';

const typeColors = { internal: 'badge-blue', external: 'badge-purple', viva: 'badge-amber', practical: 'badge-green' };
const empty = { course: '', exam_name: '', exam_type: 'internal', exam_date: '', exam_time: '', duration: '', venue: '', syllabus: '', max_marks: '' };

export default function FacultyExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const d = await facultyAPI.getExams(); setExams(d.exams || []); } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function save() {
    if (!form.course || !form.exam_name || !form.exam_date || !form.exam_time) return alert('Fill required fields.');
    try {
      await facultyAPI.createExam({ ...form, max_marks: parseInt(form.max_marks) || 0 });
      setModal(false); setForm(empty); load();
    } catch (e) { alert(e.message); }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Layout role="faculty" title="Exams">
      <div className="page-header-row page-header">
        <div><h1>Exam Schedule</h1><p>Schedule and manage upcoming exams for your courses</p></div>
        <button className="btn btn-primary" onClick={() => { setForm(empty); setModal(true); }}><i className="fas fa-plus"></i> Schedule Exam</button>
      </div>

      {loading ? <div className="loading-center"><div className="spinner"></div></div>
        : !exams.length ? <div className="empty-state"><i className="fas fa-file-alt"></i><p>No exams scheduled yet</p></div>
        : <div className="card"><div className="table-wrap"><table>
          <thead><tr><th>Course</th><th>Exam</th><th>Type</th><th>Date</th><th>Time</th><th>Venue</th><th>Marks</th></tr></thead>
          <tbody>
            {exams.map(e => (
              <tr key={e._id}>
                <td>{e.course}</td>
                <td><strong>{e.exam_name}</strong></td>
                <td><span className={`badge ${typeColors[e.exam_type] || 'badge-gray'}`}>{e.exam_type}</span></td>
                <td>{e.exam_date}</td>
                <td>{e.exam_time}</td>
                <td>{e.venue || '—'}</td>
                <td>{e.max_marks || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table></div></div>}

      {modal && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header"><h3>Schedule Exam</h3><button className="modal-close" onClick={() => setModal(false)}><i className="fas fa-times"></i></button></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Course *</label><input className="form-input" placeholder="e.g. BCA" value={form.course} onChange={e => f('course', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Exam Name *</label><input className="form-input" placeholder="e.g. Mid-Term" value={form.exam_name} onChange={e => f('exam_name', e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Type</label>
                <select className="form-select" value={form.exam_type} onChange={e => f('exam_type', e.target.value)}>
                  {['internal', 'external', 'viva', 'practical'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Max Marks</label><input className="form-input" type="number" value={form.max_marks} onChange={e => f('max_marks', e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Date *</label><input className="form-input" type="date" value={form.exam_date} onChange={e => f('exam_date', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Time *</label><input className="form-input" type="time" value={form.exam_time} onChange={e => f('exam_time', e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Duration</label><input className="form-input" placeholder="e.g. 3 hours" value={form.duration} onChange={e => f('duration', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Venue</label><input className="form-input" placeholder="e.g. Hall A" value={form.venue} onChange={e => f('venue', e.target.value)} /></div>
            </div>
            <div className="form-group"><label className="form-label">Syllabus / Notes</label><textarea className="form-textarea" rows="3" value={form.syllabus} onChange={e => f('syllabus', e.target.value)} /></div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}><i className="fas fa-save"></i> Save</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
