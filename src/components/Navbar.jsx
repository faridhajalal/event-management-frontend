import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const T = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif";
const GOLD = '#D4AF37';

export default function Navbar() {
  const navigate = useNavigate();
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '62px',
        fontFamily: T,
      }}>
        {/* Logo */}
        <Link to="/home" style={{ fontWeight: 700, fontSize: '1.25rem', color: '#fff', textDecoration: 'none', letterSpacing: '-0.5px' }}>
          Nex<span style={{ color: GOLD }}>Event</span>
        </Link>

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          {[
            { to: '/home', label: 'Home' },
            { to: '/my-bookings', label: 'My Bookings' },
            { to: '/suggest-event', label: 'Suggest', gold: true },
          ].map(({ to, label, gold }) => (
            <Link key={to} to={to} style={{ color: '#A0A0A0', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = gold ? GOLD : '#fff'}
              onMouseLeave={e => e.target.style.color = '#A0A0A0'}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Avatar */}
          <button onClick={() => setShowProfile(true)} style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: user?.profilePhoto ? 'transparent' : 'rgba(212,175,55,0.15)',
            border: `1px solid rgba(212,175,55,0.3)`,
            cursor: 'pointer', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0, flexShrink: 0,
          }}>
            {user?.profilePhoto
              ? <img src={user.profilePhoto} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: GOLD, fontSize: '0.72rem', fontWeight: 700 }}>{initials}</span>
            }
          </button>

          <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
            {user?.name || user?.email?.split('@')[0] || 'User'}
          </span>

          <button onClick={() => setShowConfirm(true)} style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
            color: '#A0A0A0', borderRadius: '8px', padding: '7px 18px',
            cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
            fontFamily: T, transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF453A'; e.currentTarget.style.color = '#FF453A'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#A0A0A0'; }}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── SIGN OUT CONFIRMATION MODAL ── */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T, animation: 'fadeIn 0.2s ease',
        }} onClick={() => setShowConfirm(false)}>
          <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes popUp{from{opacity:0;transform:scale(0.92) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '360px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
            animation: 'popUp 0.25s ease',
          }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', margin: '0 auto 1.2rem' }}>
              👋
            </div>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.15rem', textAlign: 'center', margin: '0 0 8px' }}>
              Ready to leave?
            </h3>
            <p style={{ color: '#666', fontSize: '0.86rem', textAlign: 'center', margin: '0 0 1.8rem', lineHeight: 1.6 }}>
              You'll be signed out of your NexEvent account.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowConfirm(false)} style={{
                flex: 1, padding: '12px', background: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                color: '#A0A0A0', cursor: 'pointer', fontWeight: 600,
                fontSize: '0.9rem', fontFamily: T, transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#A0A0A0'}>
                Stay
              </button>
              <button onClick={logout} style={{
                flex: 1, padding: '12px', background: 'rgba(255,69,58,0.1)',
                border: '1px solid rgba(255,69,58,0.25)', borderRadius: '10px',
                color: '#FF453A', cursor: 'pointer', fontWeight: 700,
                fontSize: '0.9rem', fontFamily: T, transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,69,58,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,69,58,0.1)'; }}>
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PROFILE MODAL ── */}
      {showProfile && (
        <ProfileModal user={user} onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}

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
      // Save to backend
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, profilePhoto: photo }),
      });
      // Update localStorage
      const existing = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...existing, name, profilePhoto: photo }));
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); window.location.reload(); }, 1200);
    } catch {
      alert('Failed to save profile.');
    } finally { setSaving(false); }
  };

  const initials = (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
      animation: 'fadeIn 0.2s ease',
    }} onClick={onClose}>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes popUp{from{opacity:0;transform:scale(0.92) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '22px', padding: '2rem', width: '100%', maxWidth: '380px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
        animation: 'popUp 0.25s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
          <div>
            <p style={{ color: GOLD, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 4px' }}>My Profile</p>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>Edit Profile</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}>✕</button>
        </div>

        {/* Avatar Upload */}
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
              📷
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
            </label>
          </div>
          <p style={{ color: '#555', fontSize: '0.76rem', margin: 0 }}>Click camera to change photo</p>
        </div>

        {/* Name */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#666', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '7px' }}>Display Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px', background: '#111',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
              color: '#fff', fontSize: '0.9rem', fontFamily: 'inherit',
              outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = GOLD}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>

        {/* Email (read-only) */}
        <div style={{ marginBottom: '1.8rem' }}>
          <label style={{ display: 'block', color: '#666', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '7px' }}>Email</label>
          <div style={{ padding: '12px 14px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: '#555', fontSize: '0.9rem' }}>
            {user?.email || '—'}
          </div>
        </div>

        {/* Role badge */}
        <div style={{ marginBottom: '1.8rem' }}>
          <span style={{
            background: user?.role === 'admin' ? 'rgba(212,175,55,0.1)' : 'rgba(48,209,88,0.1)',
            color: user?.role === 'admin' ? GOLD : '#30D158',
            border: `1px solid ${user?.role === 'admin' ? 'rgba(212,175,55,0.25)' : 'rgba(48,209,88,0.25)'}`,
            borderRadius: '20px', padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            {user?.role || 'user'}
          </span>
        </div>

        <button onClick={save} disabled={saving || saved} style={{
          width: '100%', padding: '13px',
          background: saved ? 'rgba(48,209,88,0.15)' : GOLD,
          color: saved ? '#30D158' : '#000',
          border: saved ? '1px solid rgba(48,209,88,0.3)' : 'none',
          borderRadius: '10px', fontWeight: 700, fontSize: '0.92rem',
          cursor: saving || saved ? 'default' : 'pointer', fontFamily: 'inherit',
          transition: 'all 0.3s',
        }}>
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
