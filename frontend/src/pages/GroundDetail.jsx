import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function GroundDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ground, setGround] = useState(null);
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get(`/grounds/${id}`)
      .then((res) => setGround(res.data.data))
      .catch(() => setGround(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !date) return;
    api.get(`/bookings/slots?groundId=${id}&date=${date}`)
      .then((res) => setSlots(res.data.data || []))
      .catch(() => setSlots([]));
    setSelectedSlot(null);
  }, [id, date]);

  const handleBook = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedSlot) {
      setMessage({ type: 'error', text: 'Select a time slot' });
      return;
    }
    setBookingLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post('/bookings', {
        groundId: id,
        date,
        slotStart: selectedSlot.start,
        slotEnd: selectedSlot.end,
        notes: notes.trim() || undefined,
      });
      setMessage({ type: 'success', text: 'Booking confirmed.' });
      setSelectedSlot(null);
      setNotes('');
      api.get(`/bookings/slots?groundId=${id}&date=${date}`).then((res) => setSlots(res.data.data || []));
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Booking failed' });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading || !ground) {
    return <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>{ground ? 'Loading...' : 'Ground not found.'}</div>;
  }

  const minDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="container">
      <div style={{ marginBottom: '1.5rem' }}>
        {ground.imageUrl && (
          <img src={ground.imageUrl} alt={ground.name} style={{ width: '100%', maxWidth: '720px', height: '320px', objectFit: 'cover', borderRadius: 'var(--radius)', marginBottom: '1rem', display: 'block' }} />
        )}
        <span className="badge badge-confirmed">{ground.type}</span>
        <h1 style={{ marginTop: '0.5rem', fontSize: '1.75rem' }}>{ground.name}</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>{ground.location}</p>
        {ground.address && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{ground.address}</p>}
        {ground.description && <p style={{ marginTop: '0.75rem' }}>{ground.description}</p>}
        {ground.facilities?.length > 0 && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Facilities: {ground.facilities.join(', ')}
          </p>
        )}
        <p style={{ marginTop: '0.5rem', fontWeight: 600, color: 'var(--accent)' }}>₹{ground.pricePerHour} per hour</p>
      </div>

      <div className="card" style={{ maxWidth: '520px' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Book a slot</h2>
        <div className="form-group">
          <label>Date</label>
          <input type="date" value={date} min={minDate} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Available slots</label>
          {slots.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No slots available for this date.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {slots.map((slot) => (
                <button
                  key={`${slot.start}-${slot.end}`}
                  type="button"
                  className={`btn ${selectedSlot?.start === slot.start ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.5rem 0.9rem' }}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot.start} – {slot.end} (₹{slot.pricePerSlot})
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Any special requests..." />
        </div>
        {message.text && (
          <p style={{ color: message.type === 'error' ? 'var(--danger)' : 'var(--success)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>{message.text}</p>
        )}
        <button type="button" className="btn btn-primary" onClick={handleBook} disabled={bookingLoading || !selectedSlot}>
          {bookingLoading ? 'Booking...' : 'Confirm booking'}
        </button>
      </div>
    </div>
  );
}
