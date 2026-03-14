import { useState } from 'react';
import API from '../services/axios';

const T = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif";
const CATEGORIES = ['Music', 'Sports', 'Food', 'Art', 'Technology', 'Fashion', 'Education', 'Comedy', 'Dance', 'Other'];

const inputStyle = {
  width: '100%', padding: '13px 16px',
  background: '#111', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', color: '#fff', fontSize: '0.9rem',
  fontFamily: T, outline: 'none', transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block', color: '#A0A0A0', fontSize: '0.78rem',
  fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase',
  marginBottom: '7px',
};

export default function SuggestEvent() {
  const [form, setForm] = useState({
    title: '', category: '', description: '',
    expectedDate: '', expectedVenue: '', expectedAudience: '', contactEmail: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.title || !form.category || !form.description) {
      setError('Title, Category and Description are required.');
      return;
    }
    setLoading(true); setError('');
    try {
      await API.post('/suggestions', form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally { setLoading(false); }
  };

  const reset = () => {
    setSuccess(false);
    setForm({ title: '', category: '', description: '', expectedDate: '', expectedVenue: '', expectedAudience: '', contactEmail: '' });
  };

  if (success) return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: T, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '440px', animation: 'fadeUp 0.5s ease' }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ width: '72px', height: '72px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>✓</div>
        <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.8rem', letterSpacing: '-0.5px', marginBottom: '0.75rem' }}>Suggestion Submitted</h2>
        <p style={{ color: '#A0A0A0', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem' }}>
          Thank you! Our team will review your idea. We'll reach out if your event gets approved.
        </p>
        <button onClick={reset} style={{
          background: '#D4AF37', color: '#000', border: 'none', borderRadius: '10px',
          padding: '12px 32px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: T,
        }}>
          Submit Another
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: T, padding: '3rem 1.5rem' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        input:focus,textarea:focus,select:focus{border-color:#D4AF37 !important}
        input::placeholder,textarea::placeholder{color:#444}
        select option{background:#111;color:#fff}
      `}</style>

      <div style={{ maxWidth: '660px', margin: '0 auto', animation: 'fadeUp 0.5s ease' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-block', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '20px', padding: '5px 14px', marginBottom: '1rem' }}>
            <span style={{ color: '#D4AF37', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Community</span>
          </div>
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2.2rem', letterSpacing: '-1px', marginBottom: '0.5rem' }}>Suggest an Event</h1>
          <p style={{ color: '#A0A0A0', fontSize: '0.95rem', lineHeight: 1.6 }}>Have a great event idea? Submit it below and our team will review it.</p>
        </div>

        {/* Form Card */}
        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2.5rem' }}>

          {error && (
            <div style={{ background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.5rem', color: '#FF453A', fontSize: '0.86rem' }}>
              {error}
            </div>
          )}

          {/* Title + Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
            <div>
              <label style={labelStyle}>Event Title *</label>
              <input name="title" value={form.title} onChange={handle} placeholder="e.g. Indie Music Night" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Category *</label>
              <select name="category" value={form.category} onChange={handle} style={inputStyle}>
                <option value="">Select...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={labelStyle}>Description *</label>
            <textarea name="description" value={form.description} onChange={handle}
              placeholder="Describe the event idea in detail — what it involves, who it's for, why it would be great..."
              rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
          </div>

          {/* Date + Venue */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
            <div>
              <label style={labelStyle}>Expected Date <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input type="date" name="expectedDate" value={form.expectedDate} onChange={handle} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Expected Venue <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input name="expectedVenue" value={form.expectedVenue} onChange={handle} placeholder="City or venue name" style={inputStyle} />
            </div>
          </div>

          {/* Audience + Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '2rem' }}>
            <div>
              <label style={labelStyle}>Expected Audience <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input name="expectedAudience" value={form.expectedAudience} onChange={handle} placeholder="e.g. 500, college students" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Your Email <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input type="email" name="contactEmail" value={form.contactEmail} onChange={handle} placeholder="for updates" style={inputStyle} />
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1.5rem' }} />

          {/* Submit */}
          <button onClick={submit} disabled={loading} style={{
            width: '100%', padding: '14px',
            background: loading ? '#555' : '#D4AF37',
            color: '#000', border: 'none', borderRadius: '10px',
            fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: T, letterSpacing: '0.2px', transition: 'opacity 0.2s',
          }}>
            {loading ? 'Submitting...' : 'Submit Suggestion'}
          </button>
        </div>

        <p style={{ textAlign: 'center', color: '#444', fontSize: '0.78rem', marginTop: '1.5rem' }}>
          All suggestions are reviewed by the NexEvent team within 3–5 business days.
        </p>
      </div>
    </div>
  );
}
