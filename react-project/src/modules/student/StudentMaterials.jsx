import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { studentAPI } from '../../services/api';

const fileIcons = { pdf: 'fa-file-pdf', doc: 'fa-file-word', ppt: 'fa-file-powerpoint', video: 'fa-video', other: 'fa-file' };
const fileColors = { pdf: 'red', doc: 'blue', ppt: 'amber', video: 'purple', other: 'green' };

export default function StudentMaterials() {
  const [all, setAll] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getMaterials().then(d => { setAll(d.materials || []); setFiltered(d.materials || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(all.filter(m => m.title.toLowerCase().includes(q) || (m.course || '').toLowerCase().includes(q)));
  }, [search, all]);

  return (
    <Layout role="student" title="Materials">
      <div className="page-header-row page-header">
        <div><h1>Study Materials</h1><p>Access course resources shared by your faculty</p></div>
        <div className="search-bar"><i className="fas fa-search"></i><input type="text" placeholder="Search materials…" value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>

      {loading ? <div className="loading-center"><div className="spinner"></div></div>
        : !filtered.length ? <div className="empty-state"><i className="fas fa-book-open"></i><p>No study materials available yet</p></div>
        : <div className="grid-auto">
          {filtered.map(m => (
            <div key={m._id} className="card">
              <div className={`stat-icon ${fileColors[m.file_type] || 'blue'}`} style={{ width: 44, height: 44, marginBottom: 12 }}><i className={`fas ${fileIcons[m.file_type] || 'fa-file'}`}></i></div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{m.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{m.description}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>Course: {m.course} · By: {m.uploaded_by}</div>
              <a href={m.file_url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm"><i className="fas fa-external-link-alt"></i> Open Resource</a>
            </div>
          ))}
        </div>}
    </Layout>
  );
}
