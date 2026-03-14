import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/axios';

const T = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif";

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      const res = await API.post('/auth/login', form);
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate(user.role === 'admin' ? '/admin' : '/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  const inp = {
    width: '100%', padding: '14px 16px', background: '#111',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
    color: '#fff', fontSize: '0.92rem', fontFamily: T, outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: T, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}} input::placeholder{color:#444}`}</style>
      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeUp 0.5s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontWeight: 700, fontSize: '1.8rem', letterSpacing: '-0.5px', color: '#fff', margin: 0 }}>Nex<span style={{ color: '#D4AF37' }}>Event</span></h1>
          <p style={{ color: '#A0A0A0', fontSize: '0.9rem', marginTop: '8px' }}>Sign in to your account</p>
        </div>
        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2rem' }}>
          {error && <div style={{ background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.5rem', color: '#FF453A', fontSize: '0.86rem' }}>{error}</div>}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#A0A0A0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '7px' }}>Email</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" style={inp}
              onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#A0A0A0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '7px' }}>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" style={inp}
              onKeyDown={e => e.key === 'Enter' && submit()}
              onFocus={e => e.target.style.borderColor = '#D4AF37'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1.5rem' }} />
          <button onClick={submit} disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? '#555' : '#D4AF37', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: T }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
        <p style={{ textAlign: 'center', color: '#A0A0A0', fontSize: '0.85rem', marginTop: '1.5rem' }}>
          Don't have an account? <Link to="/register" style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
