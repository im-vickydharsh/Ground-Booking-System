import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';

const TYPES = ['cricket', 'football', 'badminton', 'tennis', 'basketball', 'other'];

export default function Grounds() {
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get('type') || '';
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState(typeFromUrl);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setType(typeFromUrl);
  }, [typeFromUrl]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (search) params.set('search', search);
    api.get(`/grounds?${params}`)
      .then((res) => { if (!cancelled) setGrounds(res.data.data || []); })
      .catch(() => { if (!cancelled) setGrounds([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [type, search]);

  if (loading) {
    return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading grounds...</div>;
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>Sports Grounds</h1>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-group input"
          style={{ maxWidth: '280px', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', minWidth: '140px' }}
        >
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>
      {grounds.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No grounds found.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {grounds.map((g) => (
            <Link key={g._id} to={`/grounds/${g._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ height: '100%', transition: 'border-color 0.2s', overflow: 'hidden' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                {g.imageUrl && (
                  <img src={g.imageUrl} alt={g.name} style={{ width: '100%', height: '160px', objectFit: 'cover', margin: '-1.25rem -1.25rem 1rem -1.25rem', display: 'block' }} />
                )}
                <span className="badge badge-confirmed" style={{ marginBottom: '0.5rem' }}>{g.type}</span>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>{g.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{g.location}</p>
                <p style={{ fontWeight: 600, color: 'var(--accent)' }}>₹{g.pricePerHour}/hr</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
