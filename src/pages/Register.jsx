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
  { f: '🌸', t: '6%',  l: '90%', a: 'floatA', d: '4s',   op: 0.35, size: '2rem' },
  { f: '🌺', t: '12%', l: '2%',  a: 'floatB', d: '5s',   op: 0.30, size: '1.8rem' },
  { f: '🌼', t: '75%', l: '92%', a: 'floatC', d: '6s',   op: 0.28, size: '1.6rem' },
  { f: '🌷', t: '80%', l: '3%',  a: 'floatA', d: '4.5s', op: 0.30, size: '1.7rem' },
  { f: '💮', t: '42%', l: '95%', a: 'floatB', d: '3.8s', op: 0.25, size: '1.5rem' },
  { f: '🌸', t: '38%', l: '1%',  a: 'floatC', d: '5.5s', op: 0.28, size: '1.6rem' },
  { f: '🌺', t: '22%', l: '94%', a: 'floatD', d: '4.2s', op: 0.22, size: '1.4rem' },
  { f: '🌼', t: '58%', l: '4%',  a: 'floatA', d: '5.8s', op: 0.20, size: '1.3rem' },
  { f: '🌷', t: '18%', l: '5%',  a: 'floatB', d: '3.5s', op: 0.25, size: '1.5rem' },
  { f: '🌸', t: '65%', l: '91%', a: 'floatC', d: '6.2s', op: 0.22, size: '1.4rem' },
];

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match!'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setShowConfirm(true);
  };

  const doRegister = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError('');
    try {
      // ✅ Uses env variable — works locally AND on Render
      const response = await axios.post(`${API_URL}/auth/signup`, { name, email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
            <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>🚀</div>
            <h3 style={{ color: '#2d1f1f', fontWeight: '700', fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: "'Cormorant Garamond', serif" }}>Create Your Account?</h3>
            <p style={{ color: '#a08880', fontSize: '0.86rem', marginBottom: '1.8rem', lineHeight: '1.6' }}>Welcome <strong>{name}</strong>! Joining EventHub with <strong>{email}</strong></p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: '12px', background: '#f5e8e3', color: '#a08880', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '0.86rem' }}>Go Back</button>
              <button onClick={doRegister} style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #c9a99a, #b8887a)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '0.86rem', boxShadow: '0 4px 14px rgba(201,169,154,0.4)' }}>Yes, Create Account 🌸</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', maxWidth: '840px', width: '95%', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 30px 80px rgba(201,169,154,0.35)', border: '1px solid #f0ddd7', position: 'relative', zIndex: 1 }}>

        <div style={{ background: '#fffaf8', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <span style={{ position: 'absolute', bottom: '12px', right: '16px', fontSize: '1.3rem', opacity: 0.1, pointerEvents: 'none' }}>🌷</span>
          <span style={{ position: 'absolute', top: '12px', left: '16px', fontSize: '1rem', opacity: 0.08, pointerEvents: 'none' }}>🌸</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.4rem' }}>
            <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #c9a99a, #e8c4b8)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🌸</div>
            <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#2d1f1f', fontFamily: "'Cormorant Garamond', serif" }}>Event<span style={{ color: '#c9a99a' }}>Hub</span></span>
          </div>

          <h1 style={{ color: '#2d1f1f', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.3rem', fontFamily: "'Cormorant Garamond', serif" }}>Create Account</h1>
          <p style={{ color: '#a08880', fontSize: '0.84rem', marginBottom: '1rem' }}>Join our lovely community 🌷</p>

          {error && (
            <div style={{ background: '#fdeee9', border: '1px solid #f0c4b8', color: '#a05040', padding: '10px 13px', borderRadius: '10px', marginBottom: '0.9rem', fontSize: '0.82rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {[
              { label: 'FULL NAME', type: 'text', val: name, set: setName, icon: '👤', ph: 'Your name' },
              { label: 'EMAIL ADDRESS', type: 'email', val: email, set: setEmail, icon: '✉️', ph: 'you@example.com' },
              { label: 'PASSWORD', type: 'password', val: password, set: setPassword, icon: '🔑', ph: 'Min 6 characters' },
              { label: 'CONFIRM PASSWORD', type: 'password', val: confirmPassword, set: setConfirmPassword, icon: '✅', ph: 'Repeat password' },
            ].map((field, i) => (
              <div key={i} style={{ marginBottom: '0.8rem' }}>
                <label style={{ display: 'block', color: '#6b5a55', fontSize: '0.72rem', fontWeight: '600', marginBottom: '5px' }}>{field.label}</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem' }}>{field.icon}</span>
                  <input type={field.type} value={field.val} onChange={e => field.set(e.target.value)} required placeholder={field.ph}
                    style={{ width: '100%', padding: '10px 12px 10px 38px', background: 'white', border: '1.5px solid #f0ddd7', borderRadius: '10px', color: '#2d1f1f', fontSize: '0.86rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: loading ? '#ddd' : 'linear-gradient(135deg, #c9a99a, #b8887a)', color: 'white', border: 'none', borderRadius: '11px', fontWeight: '700', fontSize: '0.91rem', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.4rem', boxShadow: '0 6px 20px rgba(201,169,154,0.4)' }}>
              {loading ? '✨ Creating...' : '🌸 Create Account'}
            </button>
          </form>

          <p style={{ marginTop: '1rem', textAlign: 'center', color: '#a08880', fontSize: '0.83rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#c9a99a', fontWeight: '700', textDecoration: 'none' }}>Sign In →</Link>
          </p>
        </div>

        <div style={{ background: 'linear-gradient(150deg, #c9a99a 0%, #b8887a 50%, #a0706a 100%)', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          {['🌸','🌺','🌼','🌷'].map((f, i) => (
            <span key={i} style={{ position: 'absolute', fontSize: '1.3rem', opacity: 0.25, top: `${10 + i * 22}%`, right: `${5 + i * 3}%`, animation: `floatB ${3.5 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.4}s`, pointerEvents: 'none' }}>{f}</span>
          ))}
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚀</div>
            <h2 style={{ color: 'white', fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.8rem', lineHeight: '1.3', fontFamily: "'Cormorant Garamond', serif" }}>Join EventHub!</h2>
            <p style={{ color: 'rgba(255,255,255,0.78)', lineHeight: '1.7', marginBottom: '1.5rem', fontSize: '0.86rem' }}>Explore and book amazing events. Free forever.</p>
            {[
              { icon: '🆓', text: 'Free to join always' },
              { icon: '🔔', text: 'Event notifications' },
              { icon: '🎟️', text: 'Instant booking' },
              { icon: '💝', text: 'Exclusive deals' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '11px' }}>
                <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>{item.icon}</div>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.82rem', fontWeight: '500' }}>{item.text}</span>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '1.5rem' }}>
              {[{ num: '10K+', label: 'Members' }, { num: '500+', label: 'Events' }, { num: '50K+', label: 'Tickets' }, { num: '4.9★', label: 'Rating' }].map((s, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
                  <p style={{ color: 'white', fontWeight: '800', fontSize: '1rem', margin: 0 }}>{s.num}</p>
                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.68rem', margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
