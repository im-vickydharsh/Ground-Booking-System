import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0.75rem 0',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <Link to="/" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text)', textDecoration: 'none' }}>
            Ground Booking
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link to="/grounds" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Grounds</Link>
            {user ? (
              <>
                <Link to="/bookings" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>My Bookings</Link>
                {!isAdmin && (
                  <Link to="/request-ground" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Request ground</Link>
                )}
                {isAdmin && (
                  <Link to="/admin" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Admin</Link>
                )}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.name}</span>
                <button type="button" className="btn btn-secondary" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main style={{ flex: 1, padding: '1.5rem 0' }}>
        <Outlet />
      </main>
      <footer style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        padding: '1rem 0',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
      }}>
        <div className="container">Ground Booking System &copy; {new Date().getFullYear()}</div>
      </footer>
    </div>
  );
}
