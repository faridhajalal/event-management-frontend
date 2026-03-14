import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

const T = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif";
const GOLD = '#D4AF37';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: '◈' },
  { to: '/admin/create-event', label: 'Create Event', icon: '+' },
  { to: '/admin/manage-events', label: 'Manage Events', icon: '⊞' },
  { to: '/admin/bookings', label: 'All Bookings', icon: '🎫' },
];

function ProfileModal({ user, onClose }) {
  const [photo, setPhoto] = useState(user?.profilePhoto || null);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, profilePhoto: photo }),
      });
      const existing = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...existing, name, profilePhoto: photo }));
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); window.location.reload(); }, 1200);
    } catch {
      alert('Failed to save profile.');
    } finally { setSaving(false); }
  };

  const initials = (name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: T, animation: 'fadeIn 0.2s ease',
    }} onClick={onClose}>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes popUp{from{opacity:0;transform:scale(0.92) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '22px', padding: '2rem', width: '100%', maxWidth: '380px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.8)', animation: 'popUp 0.25s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
          <div>
            <p style={{ color: GOLD, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 4px' }}>Admin Profile</p>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>Edit Profile</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.8rem' }}>
          <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: photo ? 'transparent' : 'rgba(212,175,55,0.1)',
              border: `2px solid rgba(212,175,55,0.3)`,
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {photo
                ? <img src={photo} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: GOLD, fontSize: '1.5rem', fontWeight: 700 }}>{initials}</span>
              }
            </div>
            <label style={{
              position: 'absolute', bottom: 0, right: 0,
              width: '26px', height: '26px', borderRadius: '50%',
              background: GOLD, border: '2px solid #0d0d0d',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '0.7rem',
            }}>
              📷<input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
            </label>
          </div>
          <p style={{ color: '#555', fontSize: '0.76rem', margin: 0 }}>Click camera to change photo</p>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#666', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '7px' }}>Display Name</label>
          <input value={name} onChange={e => setName(e.target.value)} style={{
            width: '100%', padding: '12px 14px', background: '#111',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
            color: '#fff', fontSize: '0.9rem', fontFamily: T,
            outline: 'none', boxSizing: 'border-box',
          }}
            onFocus={e => e.target.style.borderColor = GOLD}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
        </div>

        <div style={{ marginBottom: '1.8rem' }}>
          <label style={{ display: 'block', color: '#666', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '7px' }}>Email</label>
          <div style={{ padding: '12px 14px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: '#555', fontSize: '0.9rem' }}>
            {user?.email || '—'}
          </div>
        </div>

        <div style={{ marginBottom: '1.8rem' }}>
          <span style={{ background: 'rgba(212,175,55,0.1)', color: GOLD, border: '1px solid rgba(212,175,55,0.25)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Admin
          </span>
        </div>

        <button onClick={save} disabled={saving || saved} style={{
          width: '100%', padding: '13px',
          background: saved ? 'rgba(48,209,88,0.15)' : GOLD,
          color: saved ? '#30D158' : '#000',
          border: saved ? '1px solid rgba(48,209,88,0.3)' : 'none',
          borderRadius: '10px', fontWeight: 700, fontSize: '0.92rem',
          cursor: saving || saved ? 'default' : 'pointer', fontFamily: T, transition: 'all 0.3s',
        }}>
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const initials = (user?.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#000', fontFamily: T }}>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes popUp{from{opacity:0;transform:scale(0.92) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>

      {/* Sidebar */}
      <div style={{
        width: '220px', background: '#0a0a0a',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', margin: 0, letterSpacing: '-0.3px' }}>
            Nex<span style={{ color: GOLD }}>Event</span>
          </p>
          <p style={{ color: '#444', fontSize: '0.7rem', margin: '3px 0 0', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Admin Panel</p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_ITEMS.map(({ to, label, icon }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px', textDecoration: 'none',
                background: active ? 'rgba(212,175,55,0.1)' : 'transparent',
                color: active ? GOLD : '#555',
                fontSize: '0.84rem', fontWeight: active ? 700 : 500,
                transition: 'all 0.2s',
                border: active ? '1px solid rgba(212,175,55,0.15)' : '1px solid transparent',
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#555'; e.currentTarget.style.background = 'transparent'; } }}>
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => setShowProfile(true)} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            width: '100%', padding: '10px', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px',
            cursor: 'pointer', marginBottom: '8px', transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: user?.profilePhoto ? 'transparent' : 'rgba(212,175,55,0.15)',
              border: '1px solid rgba(212,175,55,0.3)',
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {user?.profilePhoto
                ? <img src={user.profilePhoto} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: GOLD, fontSize: '0.65rem', fontWeight: 700 }}>{initials}</span>
              }
            </div>
            <div style={{ textAlign: 'left', overflow: 'hidden' }}>
              <p style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Admin'}
              </p>
              <p style={{ color: '#444', fontSize: '0.68rem', margin: 0 }}>Edit profile</p>
            </div>
          </button>

          <button onClick={() => setShowConfirm(true)} style={{
            width: '100%', padding: '9px', background: 'transparent',
            border: '1px solid rgba(255,69,58,0.15)', borderRadius: '8px',
            color: '#555', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
            fontFamily: T, transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#FF453A'; e.currentTarget.style.borderColor = 'rgba(255,69,58,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = 'rgba(255,69,58,0.15)'; }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </div>

      {/* Sign Out Confirmation */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T, animation: 'fadeIn 0.2s ease',
        }} onClick={() => setShowConfirm(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '360px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.8)', animation: 'popUp 0.25s ease',
          }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', margin: '0 auto 1.2rem' }}>
              👋
            </div>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.15rem', textAlign: 'center', margin: '0 0 8px' }}>Ready to leave?</h3>
            <p style={{ color: '#666', fontSize: '0.86rem', textAlign: 'center', margin: '0 0 1.8rem', lineHeight: 1.6 }}>
              You'll be signed out of the admin panel.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowConfirm(false)} style={{
                flex: 1, padding: '12px', background: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                color: '#A0A0A0', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', fontFamily: T,
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#A0A0A0'}>
                Stay
              </button>
              <button onClick={logout} style={{
                flex: 1, padding: '12px', background: 'rgba(255,69,58,0.1)',
                border: '1px solid rgba(255,69,58,0.25)', borderRadius: '10px',
                color: '#FF453A', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', fontFamily: T,
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,69,58,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,69,58,0.1)'}>
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}
    </div>
  );
}
