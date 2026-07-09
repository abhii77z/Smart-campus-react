import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { studentAPI } from '../../services/api';

export default function StudentEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getEvents().then(d => { setEvents(d.events || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <Layout role="student" title="Events">
      <div className="page-header"><h1>Campus Events</h1><p>Upcoming events and activities on campus</p></div>

      {loading ? <div className="loading-center"><div className="spinner"></div></div>
        : !events.length ? <div className="empty-state"><i className="fas fa-calendar-star"></i><p>No events yet. Check back soon!</p></div>
        : <div className="grid-auto">
          {events.map(e => (
            <div key={e._id} className="card">
              {e.poster_url && <img src={e.poster_url} alt="Poster" style={{ width: '100%', borderRadius: 8, marginBottom: 12 }} onError={ev => ev.target.style.display = 'none'} />}
              {!e.poster_url && <div style={{ width: '100%', height: 100, background: 'linear-gradient(135deg,#1e3a5f,#1e1b4b)', borderRadius: 8, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>📅</div>}
              <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 6 }}>{e.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 10 }}>{e.description}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span><i className="fas fa-calendar"></i> {e.event_date}{e.event_time ? ` · ${e.event_time}` : ''}</span>
                {e.venue && <span><i className="fas fa-map-marker-alt"></i> {e.venue}</span>}
                <span><i className="fas fa-user"></i> {e.uploaded_by}</span>
              </div>
            </div>
          ))}
        </div>}
    </Layout>
  );
}
