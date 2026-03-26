import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function RequestGround() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', type: 'cricket', location: '', address: '', pricePerHour: '', description: '', facilities: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        pricePerHour: Number(form.pricePerHour) || 0,
        facilities: form.facilities ? form.facilities.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      await api.post('/grounds', payload);
      setSuccess(true);
      setForm({ name: '', type: 'cricket', location: '', address: '', pricePerHour: '', description: '', facilities: '' });
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="container" style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--success)' }}>Request submitted</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Your ground request has been sent to the admin. You will be notified once it is approved.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => { setSuccess(false); navigate('/grounds'); }}>
            Browse grounds
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '520px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>Request a new ground</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Submit details for a new ground. An admin will review and approve it before it appears on the site.</p>
      <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
        {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
        <div className="form-group">
          <label>Name</label>
          <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label>Type</label>
          <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
            {['cricket', 'football', 'badminton', 'tennis', 'basketball', 'other'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Location</label>
          <input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label>Address (optional)</label>
          <input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Price per hour (₹)</label>
          <input type="number" min="0" value={form.pricePerHour} onChange={(e) => setForm((p) => ({ ...p, pricePerHour: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label>Description (optional)</label>
          <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} />
        </div>
        <div className="form-group">
          <label>Facilities (comma-separated, optional)</label>
          <input value={form.facilities} onChange={(e) => setForm((p) => ({ ...p, facilities: e.target.value }))} placeholder="Parking, Lights, Changing rooms" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Submitting...' : 'Submit request'}</button>
      </form>
    </div>
  );
}
