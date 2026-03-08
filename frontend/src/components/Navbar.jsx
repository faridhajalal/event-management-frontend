import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const FLOWER_CSS = `
  @keyframes floatA { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-8px) rotate(8deg)} }
`;

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(45,31,31,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '360px', width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(45,31,31,0.3)', position: 'relative', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', top: 8, left: 12, fontSize: '1.2rem', opacity: 0.2 }}>🌸</span>
        <span style={{ position: 'absolute', top: 8, right: 12, fontSize: '1.2rem', opacity: 0.2 }}>🌺</span>
        <span style={{ position: 'absolute', bottom: 8, left: 12, fontSize: '1rem', opacity: 0.15 }}>🌼</span>
        <span style={{ position: 'absolute', bottom: 8, right: 12, fontSize: '1rem', opacity: 0.15 }}>🌷</span>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.7rem' }}>👋</div>
        <h3 style={{ color: '#2d1f1f', fontWeight: '700', fontSize: '1.2rem', marginBottom: '0.4rem', fontFamily: "'Cormorant Garamond', serif" }}>Leaving so soon?</h3>
        <p style={{ color: '#a08880', fontSize: '0.84rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>Are you sure you want to log out of EventHub? We'll miss you! 🌸</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px', background: '#f5e8e3', color: '#a08880', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>Stay</button>
          <button onClick={onConfirm} style={{ flex: 2, padding: '11px', background: 'linear-gradient(135deg, #c9a99a, #b8887a)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}>Yes, Logout 👋</button>
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogout, setShowLogout] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowLogout(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/home', label: '🏠 Home' },
    { path: '/my-bookings', label: '🎫 My Bookings' },
  ];

  return (
    <>
      <style>{FLOWER_CSS}</style>
      {showLogout && <ConfirmModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}

      <nav style={{
        background: 'rgba(255,250,248,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #f0ddd7',
        padding: '0 2rem',
        height: '65px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 20px rgba(201,169,154,0.12)',
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* Logo */}
        <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #c9a99a, #e8c4b8)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', animation: 'floatA 4s ease-in-out infinite' }}>🌸</div>
          <span style={{ fontWeight: '700', fontSize: '1.15rem', color: '#2d1f1f', fontFamily: "'Cormorant Garamond', serif" }}>
            Event<span style={{ color: '#c9a99a' }}>Hub</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} style={{
              padding: '8px 16px', borderRadius: '10px', textDecoration: 'none',
              fontSize: '0.85rem', fontWeight: '500', transition: 'all 0.2s',
              background: isActive(link.path) ? 'linear-gradient(135deg, #c9a99a, #e8c4b8)' : 'transparent',
              color: isActive(link.path) ? 'white' : '#6b5a55',
            }}>{link.label}</Link>
          ))}
        </div>

        {/* User Profile */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #fdf6f3, #f9ede8)', border: '1.5px solid #f0ddd7', borderRadius: '50px', padding: '6px 14px 6px 6px', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#c9a99a'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#f0ddd7'}
          >
            {/* Avatar */}
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #c9a99a, #b8887a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '0.85rem', flexShrink: 0 }}>
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <span style={{ color: '#2d1f1f', fontWeight: '600', fontSize: '0.85rem', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name || 'User'}
            </span>
            <span style={{ color: '#c9a99a', fontSize: '0.7rem' }}>{showProfile ? '▲' : '▼'}</span>
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', background: 'white', borderRadius: '18px', boxShadow: '0 20px 60px rgba(201,169,154,0.3)', border: '1px solid #f0ddd7', minWidth: '260px', overflow: 'hidden', zIndex: 200 }}>

              {/* Profile Header */}
              <div style={{ background: 'linear-gradient(135deg, #c9a99a, #b8887a)', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                <span style={{ position: 'absolute', top: 8, right: 12, fontSize: '1.2rem', opacity: 0.3 }}>🌸</span>
                <span style={{ position: 'absolute', bottom: 8, left: 12, fontSize: '1rem', opacity: 0.25 }}>🌺</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                  <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '1.3rem', border: '2px solid rgba(255,255,255,0.4)' }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <p style={{ color: 'white', fontWeight: '700', fontSize: '1rem', margin: 0 }}>{user.name || 'User'}</p>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', margin: 0 }}>{user.email || ''}</p>
                    <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.65rem', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', marginTop: '4px' }}>
                      {user.role === 'admin' ? '👑 Admin' : '🌸 Member'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div style={{ padding: '1rem' }}>
                {[
                  { icon: '👤', label: 'Full Name', value: user.name || '—' },
                  { icon: '✉️', label: 'Email', value: user.email || '—' },
                  { icon: '🎭', label: 'Role', value: user.role === 'admin' ? 'Administrator' : 'Member' },
                  { icon: '🆔', label: 'User ID', value: user.id ? user.id.slice(-8).toUpperCase() : '—' },
                ].map((detail, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '10px', marginBottom: '4px', background: '#fdf6f3' }}>
                    <span style={{ fontSize: '1rem', width: '24px', textAlign: 'center' }}>{detail.icon}</span>
                    <div>
                      <p style={{ color: '#a08880', fontSize: '0.68rem', margin: 0, fontWeight: '600' }}>{detail.label}</p>
                      <p style={{ color: '#2d1f1f', fontSize: '0.82rem', margin: 0, fontWeight: '600' }}>{detail.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ padding: '0 1rem 1rem' }}>
                <Link to="/my-bookings" onClick={() => setShowProfile(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#fdf6f3', borderRadius: '12px', textDecoration: 'none', color: '#6b5a55', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', border: '1px solid #f5e8e3' }}>
                  🎫 My Bookings
                </Link>
                <button onClick={() => { setShowProfile(false); setShowLogout(true); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#fdeee9', border: '1px solid #f0c4b8', borderRadius: '12px', color: '#a05040', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
                  👋 Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;

