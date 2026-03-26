import { useState, useEffect } from 'react';
import api from '../api';

const statusClass = { pending: 'badge-pending', confirmed: 'badge-confirmed', cancelled: 'badge-cancelled', completed: 'badge-completed' };

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    api.get('/bookings/my')
      .then((res) => setBookings(res.data.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to cancel');
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>My Bookings</h1>
      {bookings.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>You have no bookings yet. <a href="/grounds">Browse grounds</a> to book.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookings.map((b) => (
            <div key={b._id} className="card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{b.ground?.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {new Date(b.date).toLocaleDateString()} · {b.slotStart} – {b.slotEnd}
                </p>
                <p style={{ fontSize: '0.9rem' }}>₹{b.amount} · <span className={`badge ${statusClass[b.status] || 'badge-pending'}`}>{b.status}</span></p>
              </div>
              {(b.status === 'pending' || b.status === 'confirmed') && (
                <button type="button" className="btn btn-danger" onClick={() => cancelBooking(b._id)}>Cancel</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
