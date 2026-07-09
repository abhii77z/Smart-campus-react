import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { facultyAPI } from '../../services/api';

export default function FacultyAttendance() {
  const [tab, setTab] = useState('mark');
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [course, setCourse] = useState('');
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState('Morning');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [report, setReport] = useState([]);
  const [reportCourse, setReportCourse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    facultyAPI.getCourses().then(d => setCourses(d.courses || [])).catch(console.error);
  }, []);

  async function loadSubjects(c) {
    setCourse(c); setSubject(''); setSubjects([]);
    if (!c) return;
    try { const d = await facultyAPI.getSubjects(c); setSubjects(d.subjects || []); } catch (e) { console.error(e); }
  }

  async function loadStudents() {
    if (!course || !subject) return alert('Select course and subject first.');
    setLoading(true);
    try {
      const d = await facultyAPI.getStudents(course, semester);
      setStudents(d.students || []);
      setAttendance({});
    } catch (e) { alert(e.message); }
    setLoading(false);
  }

  function setStatus(username, name, status) {
    setAttendance(p => ({ ...p, [username]: { username, student_name: name, status } }));
  }

  function markAll(status) {
    const all = {};
    students.forEach(s => { all[s.username] = { username: s.username, student_name: s.name || s.username, status }; });
    setAttendance(all);
  }

  async function submit() {
    const arr = Object.values(attendance);
    if (!arr.length) return alert('Mark attendance for at least one student.');
    try {
      await facultyAPI.submitAttendance({ course, subject, date, session, semester, attendance_data: arr });
      alert('Attendance submitted!');
      setAttendance({});
    } catch (e) { alert(e.message); }
  }

  async function loadReport() {
    try {
      const d = await facultyAPI.getAttendanceReport(reportCourse);
      setReport(d.attendance_report || []);
    } catch (e) { alert(e.message); }
  }

  return (
    <Layout role="faculty" title="Attendance">
      <div className="page-header"><h1>Attendance Management</h1><p>Mark and review class attendance records</p></div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'mark' ? 'active' : ''}`} onClick={() => setTab('mark')}>Mark Attendance</button>
        <button className={`tab-btn ${tab === 'report' ? 'active' : ''}`} onClick={() => setTab('report')}>View Report</button>
      </div>

      {tab === 'mark' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Course *</label>
                <select className="form-select" value={course} onChange={e => loadSubjects(e.target.value)}>
                  <option value="">— Select Course —</option>
                  {courses.map(c => <option key={c._id || c.name} value={c.name || c.code}>{c.name || c.code}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Semester</label>
                <select className="form-select" value={semester} onChange={e => setSemester(e.target.value)}>
                  <option value="">— All Semesters —</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={String(s)}>Semester {s}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Subject *</label>
                <select className="form-select" value={subject} onChange={e => setSubject(e.target.value)}>
                  <option value="">— Select Subject —</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Date</label>
                <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="form-group"><label className="form-label">Session</label>
                <select className="form-select" value={session} onChange={e => setSession(e.target.value)}>
                  {['Morning', 'Afternoon', 'Evening'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" onClick={loadStudents} disabled={loading}>
              <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-users'}`}></i> Load Students
            </button>
          </div>

          {students.length > 0 && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Student List ({students.length} students)</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-success btn-sm" onClick={() => markAll('present')}>All Present</button>
                  <button className="btn btn-danger btn-sm" onClick={() => markAll('absent')}>All Absent</button>
                </div>
              </div>
              {students.map(s => {
                const status = attendance[s.username]?.status;
                return (
                  <div key={s.username} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>{(s.name || s.username)[0].toUpperCase()}</div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{s.name || s.username}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.roll_no ? s.roll_no + ' · ' : ''}{s.course}{s.semester ? ' · Sem ' + s.semester : ''}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-success btn-sm" style={{ opacity: status === 'present' ? 1 : 0.4 }} onClick={() => setStatus(s.username, s.name || s.username, 'present')}>P</button>
                      <button className="btn btn-danger btn-sm" style={{ opacity: status === 'absent' ? 1 : 0.4 }} onClick={() => setStatus(s.username, s.name || s.username, 'absent')}>A</button>
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: 16 }}>
                <button className="btn btn-primary" onClick={submit}><i className="fas fa-check-circle"></i> Submit Attendance</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'report' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label className="form-label">Filter by Course</label>
                <select className="form-select" value={reportCourse} onChange={e => setReportCourse(e.target.value)}>
                  <option value="">All Courses</option>
                  {courses.map(c => <option key={c._id || c.name} value={c.name || c.code}>{c.name || c.code}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" onClick={loadReport}><i className="fas fa-search"></i> Load</button>
            </div>
          </div>
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Course</th><th>Subject</th><th>Session</th><th>Present/Total</th></tr></thead>
                <tbody>
                  {!report.length
                    ? <tr><td colSpan="5"><div className="empty-state"><i className="fas fa-clipboard-list"></i><p>No records found</p></div></td></tr>
                    : report.map((r, i) => {
                      const total = (r.attendance_data || []).length;
                      const present = (r.attendance_data || []).filter(a => a.status === 'present').length;
                      return <tr key={i}><td>{r.date}</td><td>{r.course}</td><td><strong>{r.subject || '—'}</strong></td><td>{r.session}</td><td><span className="badge badge-green">{present}/{total}</span></td></tr>;
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
