import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import { studentAPI } from '../../services/api';

export default function StudentFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => { doSearch(''); }, []);

  function handleSearch(q) {
    setSearch(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(q), 300);
  }

  async function doSearch(q) {
    setLoading(true);
    try { const d = await studentAPI.getFaqs(q); setFaqs(d.faqs || []); } catch (e) { console.error(e); }
    setLoading(false);
  }

  return (
    <Layout role="student" title="FAQs">
      <div className="page-header-row page-header">
        <div><h1>FAQs</h1><p>Find answers to common questions</p></div>
        <div className="search-bar"><i className="fas fa-search"></i><input type="text" placeholder="Search FAQs…" value={search} onChange={e => handleSearch(e.target.value)} /></div>
      </div>

      {loading ? <div className="loading-center"><div className="spinner"></div></div>
        : !faqs.length
          ? <div className="empty-state"><i className="fas fa-search"></i><p>{search ? `No results for "${search}"` : 'No FAQs available'}</p></div>
          : faqs.map((faq, i) => (
            <div key={faq._id} className="card" style={{ marginBottom: 10, cursor: 'pointer' }} onClick={() => setOpen(open === i ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1 }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 700, minWidth: 28 }}>Q.</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{faq.question}</div>
                    {open === i && <div style={{ marginTop: 10, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}><strong style={{ color: 'var(--success)' }}>A.</strong> {faq.answer}</div>}
                  </div>
                </div>
                <i className={`fas fa-chevron-${open === i ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)', marginTop: 2 }}></i>
              </div>
              {faq.category && <div style={{ marginTop: open === i ? 10 : 6 }}><span className="badge badge-blue">{faq.category}</span></div>}
            </div>
          ))}
    </Layout>
  );
}
