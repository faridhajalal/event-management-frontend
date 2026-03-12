import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://eventhub-backend-o5w4.onrender.com/api';

const FLOWER_CSS = `
  @keyframes floatA { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(12deg)} }
  @keyframes floatB { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-9px) rotate(-9deg)} }
  @keyframes floatC { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-18px) rotate(18deg)} }
  @keyframes floatD { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-11px) rotate(-14deg)} }
`;

const BG_FLOWERS = [
  { f: '🌸', t: '5%',  l: '3%',  a: 'floatA', d: '4s',   op: 0.35, size: '2rem' },
  { f: '🌺', t: '10%', l: '88%', a: 'floatB', d: '5s',   op: 0.30, size: '1.8rem' },
  { f: '🌼', t: '78%', l: '2%',  a: 'floatC', d: '6s',   op: 0.28, size: '1.6rem' },
  { f: '🌷', t: '82%', l: '90%', a: 'floatA', d: '4.5s', op: 0.30, size: '1.7rem' },
  { f: '💮', t: '45%', l: '1%',  a: 'floatB', d: '3.8s', op: 0.25, size: '1.5rem' },
  { f: '🌸', t: '42%', l: '94%', a: 'floatC', d: '5.5s', op: 0.28, size: '1.6rem' },
  { f: '🌺', t: '25%', l: '5%',  a: 'floatD', d: '4.2s', op: 0.22, size: '1.4rem' },
  { f: '🌼', t: '60%', l: '92%', a: 'floatA', d: '5.8s', op: 0.20, size: '1.3rem' },
  { f: '🌷', t: '20%', l: '91%', a: 'floatB', d: '3.5s', op: 0.25, size: '1.5rem' },
  { f: '🌸', t: '70%', l: '4%',  a: 'floatC', d: '6.2s', op: 0.22, size: '1.4rem' },
];

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setError('');
    setShowConfirm(true);
  };

  const doLogin = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError('');
    try {
      
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.user.role === 'admin') navigate('/admin');
      else navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', background: 'linear-gradient(135deg, #fdf6f3 0%, #f9ede8 50%, #f5e0d8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{FLOWER_CSS}</style>

      {BG_FLOWERS.map((fl, i) => (
        <span key={i} style={{ position: 'absolute', top: fl.t, left: fl.l, fontSize: fl.size, opacity: fl.op, animation: `${fl.a} ${fl.d} ease-in-out infinite`, animationDelay: `${i * 0.3}s`, pointerEvents: 'none', zIndex: 0 }}>{fl.f}</span>
      ))}

      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(45,31,31,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 30px 60px rgba(45,31,31,0.3)', position: 'relative', overflow: 'hidden' }}>
            <span style={{ position: 'absolute', top: 10, left: 14, fontSize: '1.3rem', opacity: 0.25 }}>🌸</span>
            <span style={{ position: 'absolute', top: 10, right: 14, fontSize: '1.3rem', opacity: 0.25 }}>🌺</span>
            <span style={{ position: 'absolute', bottom: 10, left: 14, fontSize: '1.1rem', opacity: 0.18 }}>🌼</span>
            <span style={{ position: 'absolute', bottom: 10, right: 14, fontSize: '1.1rem', opacity: 0.18 }}>🌷</span>
            <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>🌸</div>
            <h3 style={{ color: '#2d1f1f', fontWeight: '700', fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: "'Cormorant Garamond', serif" }}>Ready to Sign In?</h3>
            <p style={{ color: '#a08880', fontSize: '0.86rem', marginBottom: '1.8rem', lineHeight: '1.6' }}>Welcome back! Signing in as <strong>{email}</strong></p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: '12px', background: '#f5e8e3', color: '#a08880', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '0.86rem' }}>Cancel</button>
              <button onClick={doLogin} style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #c9a99a, #b8887a)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '0.86rem', boxShadow: '0 4px 14px rgba(201,169,154,0.4)' }}>Yes, Sign In 🌸</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', maxWidth: '840px', width: '95%', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 30px 80px rgba(201,169,154,0.35)', border: '1px solid #f0ddd7', position: 'relative', zIndex: 1 }}>

        <div style={{ background: 'linear-gradient(150deg, #c9a99a 0%, #b8887a 50%, #a0706a 100%)', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          {['🌸','🌺','🌼','🌷'].map((f, i) => (
            <span key={i} style={{ position: 'absolute', fontSize: '1.4rem', opacity: 0.25, top: `${12 + i * 22}%`, left: `${4 + i * 4}%`, animation: `floatA ${3.5 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.4}s`, pointerEvents: 'none' }}>{f}</span>
          ))}
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>🌸</div>
            <h2 style={{ color: 'white', fontSize: '1.9rem', fontWeight: '700', marginBottom: '1rem', lineHeight: '1.3', fontFamily: "'Cormorant Garamond', serif" }}>Welcome Back to EventHub!</h2>
            <p style={{ color: 'rgba(255,255,255,0.78)', lineHeight: '1.7', marginBottom: '1.8rem', fontSize: '0.87rem' }}>Discover beautiful events, book tickets effortlessly.</p>
            {[
              { icon: '🎭', text: 'Explore curated events' },
              { icon: '🎫', text: 'Instant ticket booking' },
              { icon: '💝', text: 'Secure & easy payments' },
              { icon: '📅', text: 'Track all your bookings' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '11px' }}>
                <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>{item.icon}</div>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.82rem', fontWeight: '500' }}>{item.text}</span>
              </div>
            ))}
            <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '11px 15px' }}>
              <p style={{ color: 'white', fontSize: '0.76rem', margin: 0 }}>👑 <strong>Admin?</strong> Use your admin email to access the admin panel.</p>
            </div>
          </div>
        </div>

        <div style={{ background: '#fffaf8', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <span style={{ position: 'absolute', bottom: '12px', right: '16px', fontSize: '1.5rem', opacity: 0.1, pointerEvents: 'none' }}>🌸</span>
          <span style={{ position: 'absolute', top: '12px', right: '16px', fontSize: '1.1rem', opacity: 0.08, pointerEvents: 'none' }}>🌺</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
            <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #c9a99a, #e8c4b8)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🌸</div>
            <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#2d1f1f', fontFamily: "'Cormorant Garamond', serif" }}>Event<span style={{ color: '#c9a99a' }}>Hub</span></span>
          </div>

          <h1 style={{ color: '#2d1f1f', fontSize: '1.7rem', fontWeight: '700', marginBottom: '0.3rem', fontFamily: "'Cormorant Garamond', serif" }}>Sign In</h1>
          <p style={{ color: '#a08880', fontSize: '0.84rem', marginBottom: '1.6rem' }}>Welcome back! 🌷</p>

          {error && (
            <div style={{ background: '#fdeee9', border: '1px solid #f0c4b8', color: '#a05040', padding: '11px 14px', borderRadius: '10px', marginBottom: '1.2rem', fontSize: '0.83rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#6b5a55', fontSize: '0.74rem', fontWeight: '600', marginBottom: '6px' }}>EMAIL ADDRESS</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem' }}>✉️</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'white', border: '1.5px solid #f0ddd7', borderRadius: '11px', color: '#2d1f1f', fontSize: '0.87rem', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
              </div>
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', color: '#6b5a55', fontSize: '0.74rem', fontWeight: '600', marginBottom: '6px' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem' }}>🔑</span>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Your password"
                  style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'white', border: '1.5px solid #f0ddd7', borderRadius: '11px', color: '#2d1f1f', fontSize: '0.87rem', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: loading ? '#ddd' : 'linear-gradient(135deg, #c9a99a, #b8887a)', color: 'white', border: 'none', borderRadius: '11px', fontWeight: '700', fontSize: '0.92rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 6px 20px rgba(201,169,154,0.4)' }}>
              {loading ? '✨ Signing in...' : '🌸 Sign In'}
            </button>
          </form>

          <p style={{ marginTop: '1.4rem', textAlign: 'center', color: '#a08880', fontSize: '0.83rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#c9a99a', fontWeight: '700', textDecoration: 'none' }}>Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
