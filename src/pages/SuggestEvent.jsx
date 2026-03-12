import { useState } from 'react';
import API from '../services/axios';

const CATEGORIES = ['Music', 'Sports', 'Food', 'Art', 'Technology', 'Fashion', 'Education', 'Comedy', 'Dance', 'Other'];

export default function SuggestEvent() {
  const [form, setForm] = useState({
    title: '', category: '', description: '',
    expectedDate: '', expectedVenue: '', expectedAudience: '', contactEmail: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.title || !form.category || !form.description) {
      setError('Please fill in Title, Category and Description.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await API.post('/suggestions', form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSuccess(false);
    setForm({ title: '', category: '', description: '', expectedDate: '', expectedVenue: '', expectedAudience: '', contactEmail: '' });
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '12px',
    border: '1.5px solid #f0ddd7', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif",
    background: '#fdf8f6', color: '#2d1f1f', outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
  };

  const labelStyle = {
    color: '#6b5a55', fontSize: '0.82rem', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block',
  };

  // ── Success Screen ────────────────────────────────────────────
  if (success) return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdf8f6', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '3rem', textAlign: 'center', boxShadow: '0 8px 40px rgba(201,169,154,0.2)', border: '1px solid #f0ddd7', maxWidth: '480px', width: '100%', animation: 'fadeIn 0.5s ease' }}>
        <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ color: '#2d1f1f', fontWeight: '800', fontSize: '1.6rem', margin: '0 0 12px', fontFamily: "'Cormorant Garamond', serif" }}>Suggestion Submitted!</h2>
        <p style={{ color: '#a08880', fontSize: '0.9rem', margin: '0 0 2rem', lineHeight: '1.6' }}>
          Thank you! Our team will review your idea and get back to you. 🌸
        </p>
        <button onClick={reset} style={{ background: 'linear-gradient(135deg, #c9a99a, #b8887a)', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(201,169,154,0.4)' }}>
          💡 Submit Another
        </button>
      </div>
    </div>
  );

  // ── Form ──────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#fdf8f6', padding: '2rem 1rem' }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        input:focus, textarea:focus, select:focus { border-color: #c9a99a !important; box-shadow: 0 0 0 3px rgba(201,169,154,0.15); }
      `}</style>

      <div style={{ maxWidth: '680px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>💡</div>
          <h1 style={{ color: '#2d1f1f', fontWeight: '800', fontSize: '2rem', margin: '0 0 8px', fontFamily: "'Cormorant Garamond', serif" }}>Suggest an Event</h1>
          <p style={{ color: '#a08880', fontSize: '0.9rem', margin: 0 }}>Have a great event idea? Share it with us and we might make it happen! 🌸</p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 8px 40px rgba(201,169,154,0.15)', border: '1px solid #f0ddd7' }}>

          {/* Error */}
          {error && (
            <div style={{ background: '#fdeee9', border: '1px solid #f0c4b8', borderRadius: '12px', padding: '12px 16px', marginBottom: '1.5rem', color: '#c0392b', fontSize: '0.86rem', fontWeight: '600' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Row 1: Title + Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
            <div>
              <label style={labelStyle}>Event Title *</label>
              <input name="title" value={form.title} onChange={handle} placeholder="e.g. Indie Music Night" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Category *</label>
              <select name="category" value={form.category} onChange={handle} style={inputStyle}>
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={labelStyle}>Description * <span style={{ color: '#a08880', textTransform: 'none', fontWeight: '500', letterSpacing: 0 }}>(tell us more about this event idea)</span></label>
            <textarea name="description" value={form.description} onChange={handle} placeholder="Describe the event — what it would be like, why people would love it..." rows={4}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }} />
          </div>

          {/* Row 2: Date + Venue */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
            <div>
              <label style={labelStyle}>Expected Date <span style={{ color: '#a08880', textTransform: 'none', fontWeight: '400' }}>(optional)</span></label>
              <input type="date" name="expectedDate" value={form.expectedDate} onChange={handle} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Expected Venue <span style={{ color: '#a08880', textTransform: 'none', fontWeight: '400' }}>(optional)</span></label>
              <input name="expectedVenue" value={form.expectedVenue} onChange={handle} placeholder="e.g. Kochi, Indoor Arena" style={inputStyle} />
            </div>
          </div>

          {/* Row 3: Audience + Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '2rem' }}>
            <div>
              <label style={labelStyle}>Expected Audience <span style={{ color: '#a08880', textTransform: 'none', fontWeight: '400' }}>(optional)</span></label>
              <input name="expectedAudience" value={form.expectedAudience} onChange={handle} placeholder="e.g. 500 people, College students" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Your Email <span style={{ color: '#a08880', textTransform: 'none', fontWeight: '400' }}>(optional)</span></label>
              <input type="email" name="contactEmail" value={form.contactEmail} onChange={handle} placeholder="we'll update you if approved" style={inputStyle} />
            </div>
          </div>

          {/* Submit */}
          <button onClick={submit} disabled={loading} style={{
            width: '100%', padding: '14px', background: loading ? '#d4b8b0' : 'linear-gradient(135deg, #c9a99a, #b8887a)',
            color: 'white', border: 'none', borderRadius: '14px', cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '700', fontSize: '1rem', boxShadow: '0 4px 14px rgba(201,169,154,0.4)', transition: 'opacity 0.2s',
          }}>
            {loading ? '⏳ Submitting...' : '💡 Submit My Suggestion'}
          </button>

        </div>

        {/* Note */}
        <p style={{ textAlign: 'center', color: '#a08880', fontSize: '0.8rem', marginTop: '1.5rem' }}>
          🌸 All suggestions are reviewed by our team. We'll notify you if your idea gets approved!
        </p>
      </div>
    </div>
  );
}
