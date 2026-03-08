import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// ── Confirm Modal ──────────────────────────────────
function ConfirmModal({ message, subtext, onConfirm, onCancel, confirmLabel = 'Yes 🌸', icon = '🌸' }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(45,31,31,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 30px 60px rgba(45,31,31,0.3)', position: 'relative', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ position: 'absolute', top: '12px', left: '16px',  fontSize: '1.2rem', opacity: 0.2 }}>🌸</div>
        <div style={{ position: 'absolute', top: '12px', right: '16px', fontSize: '1.2rem', opacity: 0.2 }}>🌺</div>
        <div style={{ position: 'absolute', bottom: '12px', left: '16px',  fontSize: '1rem', opacity: 0.15 }}>🌼</div>
        <div style={{ position: 'absolute', bottom: '12px', right: '16px', fontSize: '1rem', opacity: 0.15 }}>🌷</div>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{icon}</div>
        <h2 style={{ color: '#2d1f1f', fontWeight: '700', fontSize: '1.3rem', marginBottom: '0.5rem', fontFamily: "'Cormorant Garamond', serif" }}>{message}</h2>
        <p style={{ color: '#a08880', fontSize: '0.88rem', marginBottom: '2rem', lineHeight: '1.6' }}>{subtext}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '13px', background: '#f5e8e3', color: '#a08880', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '600', fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg, #c9a99a, #b8887a)', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 14px rgba(201,169,154,0.4)' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isActive = (p) => location.pathname === p;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menu = [
    { path: '/admin',                icon: '📊', label: 'Overview' },
    { path: '/admin/create-event',   icon: '➕', label: 'Create Event' },
    { path: '/admin/manage-events',  icon: '📝', label: 'Manage Events' },
    { path: '/admin/bookings',       icon: '🎫', label: 'All Bookings' },
  ];

  const handleLogoutConfirmed = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  return (
    <>
      {showLogoutConfirm && (
        <ConfirmModal
          icon="👑"
          message="Leave Admin Panel?"
          subtext="Are you sure you want to logout? You'll need your admin credentials to get back in. 🌸"
          confirmLabel="Yes, Logout 👋"
          onConfirm={handleLogoutConfirmed}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}

      <aside style={{ width: '230px', minHeight: '100vh', background: '#2d1f1f', display: 'flex', flexDirection: 'column', flexShrink: 0, fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden' }}>

        {/* Sidebar flower decorations */}
        <div style={{ position: 'absolute', bottom: '80px', right: '10px', fontSize: '2rem', opacity: 0.07, pointerEvents: 'none', transform: 'rotate(15deg)' }}>🌸</div>
        <div style={{ position: 'absolute', top: '50%', right: '8px', fontSize: '1.5rem', opacity: 0.06, pointerEvents: 'none', transform: 'rotate(-10deg)' }}>🌺</div>
        <div style={{ position: 'absolute', top: '30%', left: '8px', fontSize: '1.2rem', opacity: 0.05, pointerEvents: 'none' }}>🌼</div>

        {/* Logo */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(201,169,154,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.2rem' }}>
            <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #c9a99a, #e8c4b8)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🌸</div>
            <div>
              <div style={{ color: 'white', fontWeight: '700', fontSize: '1rem', fontFamily: "'Cormorant Garamond', serif" }}>EventHub</div>
              <div style={{ color: '#c9a99a', fontSize: '0.65rem', fontWeight: '500' }}>Admin Panel 🌸</div>
            </div>
          </div>
          {/* Admin profile */}
          <div style={{ background: 'rgba(201,169,154,0.1)', border: '1px solid rgba(201,169,154,0.2)', borderRadius: '12px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #c9a99a, #e8c4b8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>👤</div>
            <div>
              <div style={{ color: 'white', fontSize: '0.82rem', fontWeight: '600' }}>{user.name || 'Admin'}</div>
              <div style={{ color: '#c9a99a', fontSize: '0.65rem' }}>Administrator 🌺</div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>
          {menu.map(item => (
            <Link key={item.path} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '11px 14px', borderRadius: '12px', marginBottom: '4px',
              textDecoration: 'none', fontSize: '0.85rem', fontWeight: '500',
              background: isActive(item.path) ? 'linear-gradient(135deg, #c9a99a, #b8887a)' : 'transparent',
              color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.2s',
              boxShadow: isActive(item.path) ? '0 4px 15px rgba(201,169,154,0.3)' : 'none'
            }}>
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              <span>{item.label}</span>
              {isActive(item.path) && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.7 }}>🌸</span>}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(201,169,154,0.1)' }}>
          <button onClick={() => setShowLogoutConfirm(true)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 14px', borderRadius: '10px',
            background: 'rgba(220,80,80,0.1)', border: '1px solid rgba(220,80,80,0.2)',
            color: '#e08080', cursor: 'pointer', fontSize: '0.83rem', fontWeight: '500',
            fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,80,80,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,80,80,0.1)'}
          >
            🚪 Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
