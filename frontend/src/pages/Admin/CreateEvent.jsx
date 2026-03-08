import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/axios';

const CATEGORIES = ['Concert', 'Conference', 'Workshop', 'Sports', 'Exhibition', 'Festival', 'Comedy', 'Theatre', 'Other'];

function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', date: '', time: '',
    venue: '', category: 'Concert',
    totalSeats: '', availableSeats: '', price: '', image: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'totalSeats') {
      setForm(prev => ({
        ...prev,
        totalSeats: value,
        availableSeats: prev.availableSeats === '' || prev.availableSeats === prev.totalSeats ? value : prev.availableSeats
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Convert any date format to YYYY-MM-DD
  const normalizeDate = (raw) => {
    if (!raw) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(raw)) {
      const parts = raw.split(/[-/]/);
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    const d = new Date(raw);
    if (!isNaN(d)) return d.toISOString().split('T')[0];
    return raw;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const total = parseInt(form.totalSeats);
      const available = parseInt(form.availableSeats);
      if (isNaN(total) || isNaN(available)) { setError('Please enter valid seat numbers'); setLoading(false); return; }
      if (available > total) { setError('Available seats cannot be more than total seats'); setLoading(false); return; }
      if (!form.date || form.date.trim() === '') { setError('Please enter a date e.g. 2026-05-10'); setLoading(false); return; }

      const finalDate = normalizeDate(form.date.trim());
      if (!/^\d{4}-\d{2}-\d{2}$/.test(finalDate)) { setError('Invalid date. Use format: 2026-05-10'); setLoading(false); return; }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        date: finalDate,
        time: form.time,
        venue: form.venue.trim(),
        category: form.category,
        totalSeats: total,
        availableSeats: available,
        price: parseFloat(form.price),
        image: form.image.trim(),
        status: 'upcoming',
      };
      console.log('📤 Creating event:', payload);
      await API.post('/events', payload);
      setSuccess('🎉 Event created successfully!');
      setTimeout(() => navigate('/admin/manage-events'), 1500);
    } catch (err) {
      console.error('❌ Error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to create event');
    } finally { setLoading(false); }
  };

  const inp = { width: '100%', padding: '11px 14px', background: 'white', border: '1.5px solid #f0ddd7', borderRadius: '11px', color: '#2d1f1f', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" };
  const lbl = { display: 'block', color: '#6b5a55', fontSize: '0.74rem', fontWeight: '700', marginBottom: '6px' };

  return (
    <div style={{ padding: '2rem', background: '#fdf6f3', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin" style={{ color: '#c9a99a', textDecoration: 'none', fontSize: '0.84rem', fontWeight: '600' }}>← Back to Dashboard</Link>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#2d1f1f', marginTop: '8px', fontFamily: "'Cormorant Garamond', serif" }}>Create New Event</h1>
      </div>

      <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '700px', boxShadow: '0 4px 20px rgba(201,169,154,0.1)', border: '1px solid #f5e8e3' }}>
        {error && <div style={{ background: '#fdeee9', border: '1px solid #f0c4b8', color: '#a05040', padding: '12px 16px', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.84rem' }}>⚠️ {error}</div>}
        {success && <div style={{ background: '#edf5f0', border: '1px solid #b8d8c8', color: '#3a7a5a', padding: '12px 16px', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.84rem' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1.1rem' }}>

            <div>
              <label style={lbl}>EVENT NAME *</label>
              <input name="name" value={form.name} onChange={handleChange} required style={inp} placeholder="e.g. ABCD - Anybody Can Dance" onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
            </div>

            <div>
              <label style={lbl}>DESCRIPTION *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={3} style={{ ...inp, resize: 'vertical' }} placeholder="Describe your event..." onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
            </div>

            {/* DATE + TIME */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={lbl}>DATE *</label>

                {/* ✅ Date picker (Chrome works) */}
                <input type="date" name="date" value={form.date} onChange={handleChange}
                  style={{ ...inp, marginBottom: '8px' }}
                  onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />

                {/* ✅ Text fallback (Edge / manual entry) */}
                <input type="text" name="date" value={form.date} onChange={handleChange}
                  placeholder="Or type: 2026-05-10"
                  style={{ ...inp, background: '#fdf6f3', fontSize: '0.82rem' }}
                  onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />

                {form.date && <p style={{ color: '#3a7a5a', fontSize: '0.68rem', marginTop: '4px', fontWeight: '600' }}>✅ {normalizeDate(form.date)}</p>}
                {!form.date && <p style={{ color: '#e08060', fontSize: '0.68rem', marginTop: '4px' }}>⚠️ Date required — use picker or type below</p>}
              </div>

              <div>
                <label style={lbl}>TIME *</label>
                <input type="time" name="time" value={form.time} onChange={handleChange} required style={inp} onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
                <p style={{ color: '#a08880', fontSize: '0.68rem', marginTop: '4px' }}>e.g. 19:00 = 7 PM</p>
              </div>
            </div>

            <div>
              <label style={lbl}>VENUE *</label>
              <input name="venue" value={form.venue} onChange={handleChange} required style={inp} placeholder="e.g. Grand Auditorium, Mumbai" onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
            </div>

            <div>
              <label style={lbl}>CATEGORY *</label>
              <select name="category" value={form.category} onChange={handleChange} style={inp} onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={lbl}>TOTAL SEATS *</label>
                <input type="number" name="totalSeats" value={form.totalSeats} onChange={handleChange} required min="1" style={inp} placeholder="300" onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
              </div>
              <div>
                <label style={lbl}>AVAILABLE SEATS *</label>
                <input type="number" name="availableSeats" value={form.availableSeats} onChange={handleChange} required min="0" style={inp} placeholder="300" onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
                <p style={{ color: '#c9a99a', fontSize: '0.68rem', marginTop: '3px' }}>← auto-fills from total</p>
              </div>
              <div>
                <label style={lbl}>PRICE (₹) *</label>
                <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" style={inp} placeholder="799" onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
              </div>
            </div>

            <div>
              <label style={lbl}>IMAGE URL (optional)</label>
              <input name="image" value={form.image} onChange={handleChange} style={inp} placeholder="https://images.unsplash.com/..." onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
              <p style={{ color: '#a08880', fontSize: '0.7rem', marginTop: '4px' }}>💡 Leave empty to auto-use category image</p>
            </div>

            {form.image && (
              <div>
                <label style={lbl}>IMAGE PREVIEW</label>
                <img src={form.image} alt="preview" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #f0ddd7' }} onError={e => { e.target.style.display = 'none'; }} />
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" disabled={loading} style={{ flex: 2, background: loading ? 'rgba(201,169,154,0.5)' : 'linear-gradient(135deg, #c9a99a, #b8887a)', color: 'white', border: 'none', padding: '13px', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif", opacity: loading ? 0.7 : 1 }}>
                {loading ? '⏳ Creating...' : '✅ Create Event'}
              </button>
              <Link to="/admin" style={{ flex: 1, background: '#f5e8e3', color: '#a08880', padding: '13px', borderRadius: '12px', textDecoration: 'none', fontWeight: '600', textAlign: 'center', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;
