import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/axios';

const T = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif";
const GOLD = '#D4AF37';
const CATEGORIES = ['Music', 'Sports', 'Food', 'Art', 'Technology', 'Fashion', 'Education', 'Comedy', 'Dance', 'Other'];

const inp = { width: '100%', padding: '13px 16px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', fontFamily: T, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' };
const lbl = { display: 'block', color: '#555', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '7px' };
const fg = e => e.target.style.borderColor = GOLD;
const fb = e => e.target.style.borderColor = 'rgba(255,255,255,0.1)';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', category: '', date: '', time: '', venue: '', price: '', capacity: '', description: '', image: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.name || !form.category || !form.date || !form.venue) { setError('Name, Category, Date and Venue are required.'); return; }
    setLoading(true); setError('');
    try {
      await API.post('/events', form);
      navigate('/admin/manage-events');
    } catch (err) { setError(err.response?.data?.message || 'Failed to create event.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: T, color: '#fff', padding: '2.5rem' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} input::placeholder,textarea::placeholder{color:#333} select option{background:#111}`}</style>
      <div style={{ maxWidth: '720px', animation: 'fadeUp 0.4s ease' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ color: GOLD, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 6px' }}>Admin</p>
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2rem', margin: 0, letterSpacing: '-1px' }}>Create Event</h1>
        </div>
        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2.5rem' }}>
          {error && <div style={{ background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.5rem', color: '#FF453A', fontSize: '0.86rem' }}>{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
            <div><label style={lbl}>Event Name *</label><input name="name" value={form.name} onChange={handle} placeholder="Event title" style={inp} onFocus={fg} onBlur={fb} /></div>
            <div><label style={lbl}>Category *</label><select name="category" value={form.category} onChange={handle} style={inp} onFocus={fg} onBlur={fb}><option value="">Select...</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
            <div><label style={lbl}>Date *</label><input type="date" name="date" value={form.date} onChange={handle} style={inp} onFocus={fg} onBlur={fb} /></div>
            <div><label style={lbl}>Time</label><input type="time" name="time" value={form.time} onChange={handle} style={inp} onFocus={fg} onBlur={fb} /></div>
          </div>
          <div style={{ marginBottom: '1.2rem' }}><label style={lbl}>Venue *</label><input name="venue" value={form.venue} onChange={handle} placeholder="Venue name and city" style={inp} onFocus={fg} onBlur={fb} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
            <div><label style={lbl}>Price (₹)</label><input type="number" name="price" value={form.price} onChange={handle} placeholder="0 for free" style={inp} onFocus={fg} onBlur={fb} /></div>
            <div><label style={lbl}>Capacity</label><input type="number" name="capacity" value={form.capacity} onChange={handle} placeholder="Max attendees" style={inp} onFocus={fg} onBlur={fb} /></div>
          </div>
          <div style={{ marginBottom: '1.2rem' }}><label style={lbl}>Image URL</label><input name="image" value={form.image} onChange={handle} placeholder="https://..." style={inp} onFocus={fg} onBlur={fb} /></div>
          <div style={{ marginBottom: '2rem' }}><label style={lbl}>Description</label><textarea name="description" value={form.description} onChange={handle} placeholder="Tell attendees what to expect..." rows={4} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} onFocus={fg} onBlur={fb} /></div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1.5rem' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={submit} disabled={loading} style={{ flex: 1, padding: '14px', background: loading ? '#555' : GOLD, color: '#000', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: T }}>
              {loading ? 'Creating...' : 'Create Event'}
            </button>
            <button onClick={() => navigate('/admin/manage-events')} style={{ padding: '14px 24px', background: 'transparent', color: '#555', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', cursor: 'pointer', fontFamily: T, fontWeight: 600 }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
