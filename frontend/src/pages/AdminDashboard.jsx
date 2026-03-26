import { useState, useEffect } from 'react';
import api from '../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [groundRequests, setGroundRequests] = useState([]);
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newGround, setNewGround] = useState({ name: '', type: 'cricket', location: '', address: '', pricePerHour: '', description: '', facilities: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/stats').then((r) => r.data.data).catch(() => null),
      api.get('/grounds/requests').then((r) => r.data.data || []).catch(() => []),
      api.get('/grounds').then((r) => r.data.data || []).catch(() => []),
    ]).then(([s, gr, g]) => {
      setStats(s);
      setGroundRequests(gr);
      setGrounds(g);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const approveGroundRequest = async (id) => {
    try {
      await api.put(`/grounds/${id}/approve`);
      load();
    } catch (err) {
      alert(err.message || 'Failed to approve');
    }
  };

  const rejectGroundRequest = async (id) => {
    try {
      await api.put(`/grounds/${id}/reject`);
      load();
    } catch (err) {
      alert(err.message || 'Failed to reject');
    }
  };

  const handleAddGround = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...newGround,
        pricePerHour: Number(newGround.pricePerHour) || 0,
        facilities: newGround.facilities ? newGround.facilities.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      await api.post('/grounds', payload);
      setNewGround({ name: '', type: 'cricket', location: '', address: '', pricePerHour: '', description: '', facilities: '' });
      load();
    } catch (err) {
      alert(err.message || 'Failed to add ground');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !stats) {
    return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>Admin Dashboard</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['overview', 'ground-requests', 'grounds', 'add-ground'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'add-ground' ? 'Add ground' : tab.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            {tab === 'ground-requests' && groundRequests.length > 0 && (
              <span style={{ marginLeft: '0.35rem', background: 'var(--warning)', color: 'var(--bg)', borderRadius: '999px', padding: '0.1rem 0.4rem', fontSize: '0.75rem' }}>{groundRequests.length}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && stats && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="card"><div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Approved grounds</div><div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stats.groundsCount}</div></div>
            <div className="card"><div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Users</div><div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stats.usersCount}</div></div>
            <div className="card"><div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Bookings</div><div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stats.bookingsCount}</div></div>
            <div className="card"><div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Revenue (₹)</div><div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stats.revenue}</div></div>
          </div>
          {(groundRequests.length > 0) && (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>Pending actions</h3>
              {groundRequests.length > 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}><strong>{groundRequests.length}</strong> ground request(s) waiting for approval.</p>}
            </div>
          )}
        </>
      )}

      {activeTab === 'ground-requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Approve or reject new ground requests submitted by users.</p>
          {groundRequests.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No pending ground requests.</p>
          ) : (
            groundRequests.map((g) => (
              <div key={g._id} className="card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <strong>{g.name}</strong> · {g.type} · {g.location} · ₹{g.pricePerHour}/hr
                  {g.submittedBy && <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginTop: '0.25rem' }}>Requested by: {g.submittedBy.name} ({g.submittedBy.email})</span>}
                </div>
                <span style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => approveGroundRequest(g._id)}>Approve</button>
                  <button type="button" className="btn btn-danger" style={{ padding: '0.4rem 0.8rem' }} onClick={() => rejectGroundRequest(g._id)}>Reject</button>
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'grounds' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {grounds.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No approved grounds.</p> : (
            grounds.map((g) => (
              <div key={g._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><strong>{g.name}</strong> · {g.type} · {g.location} · ₹{g.pricePerHour}/hr</div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'add-ground' && (
        <form onSubmit={handleAddGround} className="card" style={{ maxWidth: '480px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>Add a ground directly (no approval needed for admin).</p>
          <div className="form-group">
            <label>Name</label>
            <input value={newGround.name} onChange={(e) => setNewGround((p) => ({ ...p, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select value={newGround.type} onChange={(e) => setNewGround((p) => ({ ...p, type: e.target.value }))}>
              {['cricket', 'football', 'badminton', 'tennis', 'basketball', 'other'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Location</label>
            <input value={newGround.location} onChange={(e) => setNewGround((p) => ({ ...p, location: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Address (optional)</label>
            <input value={newGround.address} onChange={(e) => setNewGround((p) => ({ ...p, address: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Price per hour (₹)</label>
            <input type="number" min="0" value={newGround.pricePerHour} onChange={(e) => setNewGround((p) => ({ ...p, pricePerHour: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <textarea value={newGround.description} onChange={(e) => setNewGround((p) => ({ ...p, description: e.target.value }))} rows={2} />
          </div>
          <div className="form-group">
            <label>Facilities (comma-separated, optional)</label>
            <input value={newGround.facilities} onChange={(e) => setNewGround((p) => ({ ...p, facilities: e.target.value }))} placeholder="Parking, Lights, Changing rooms" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Adding...' : 'Add ground'}</button>
        </form>
      )}
    </div>
  );
}
