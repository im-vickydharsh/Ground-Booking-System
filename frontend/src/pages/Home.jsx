import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container">
      <section style={{
        textAlign: 'center',
        padding: '3rem 1rem 4rem',
        maxWidth: '700px',
        margin: '0 auto',
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 700 }}>
          Book Sports Grounds in Minutes
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          Find cricket grounds, football fields, badminton courts and more. Check availability and reserve your slot online.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/grounds" className="btn btn-primary" style={{ padding: '0.9rem 1.5rem' }}>
            Browse Grounds
          </Link>
          <Link to="/register" className="btn btn-secondary" style={{ padding: '0.9rem 1.5rem' }}>
            Create Account
          </Link>
        </div>
      </section>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
        {['Cricket', 'Football', 'Badminton', 'Tennis'].map((sport) => (
          <Link
            key={sport}
            to={`/grounds?type=${sport.toLowerCase()}`}
            className="card"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.background = 'var(--surface-hover)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--surface)';
            }}
          >
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>{sport}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>View available {sport.toLowerCase()} grounds</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
