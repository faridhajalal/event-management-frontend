import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/axios';

const T = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif";
const GOLD = '#D4AF37';

const CATEGORIES = ['Concert', 'Conference', 'Workshop', 'Sports', 'Exhibition', 'Festival', 'Comedy', 'Theatre', 'Other'];

const CATEGORY_IMAGES = {
  Concert:    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80',
  Festival:   'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80',
  Sports:     'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80',
  Workshop:   'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80',
  Conference: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
  Exhibition: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80',
  Comedy:     'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=600&q=80',
  Theatre:    'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&q=80',
  Other:      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80',
};

function ManageEvents() {
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editEvent, setEditEvent] = useState(null);
  const [editForm, setEditForm]   = useState({});
  const [saving, setSaving]     = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const res = await API.get('/events');
      setEvents(res.data.events || res.data || []);
    } catch (err) { console.error('Fetch events error:', err); }
    finally { setLoading(false); }
  };

  const openEdit = (event) => {
    let dateValue = '';
    if (event.date) {
      const d = new Date(event.date);
      if (!isNaN(d)) dateValue = d.toISOString().split('T')[0];
    }
    setEditForm({
      name:           event.name || '',
      description:    event.description || '',
      date:           dateValue,
      time:           event.time || '',
      venue:          event.venue || '',
      category:       event.category || 'Concert',
      totalSeats:     event.totalSeats?.toString() || '',
      availableSeats: event.availableSeats?.toString() || '',
      price:          event.price?.toString() || '',
      image:          event.image || '',
      status:         event.status || 'upcoming',
    });
    setEditEvent(event);
    setError('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const total     = parseInt(editForm.totalSeats);
      const available = parseInt(editForm.availableSeats);
      if (available > total) { setError('Available seats cannot exceed total seats'); setSaving(false); return; }

      await API.put(`/events/${editEvent._id}`, {
        name:           editForm.name.trim(),
        description:    editForm.description.trim(),
        date:           editForm.date,
        time:           editForm.time,
        venue:          editForm.venue.trim(),
        category:       editForm.category,
        totalSeats:     total,
        availableSeats: available,
        price:          parseFloat(editForm.price),
        image:          editForm.image.trim(),
        status:         editForm.status,
      });

      setSuccess('Event updated successfully!');
      setEditEvent(null);
      fetchEvents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/events/${id}`);
      setDeleteId(null);
      fetchEvents();
      setSuccess('Event deleted!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const getImage = (event) => event.image?.trim() || CATEGORY_IMAGES[event.category] || CATEGORY_IMAGES.Other;

  const inp = {
    width: '100%', padding: '10px 13px',
    background: '#111', border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', color: '#fff', fontSize: '0.87rem',
    outline: 'none', boxSizing: 'border-box', fontFamily: T,
    transition: 'border-color 0.2s',
  };

  const lbl = {
    display: 'block', color: '#555',
    fontSize: '0.72rem', fontWeight: 700,
    marginBottom: '5px', letterSpacing: '0.8px', textTransform: 'uppercase',
  };

  const fg = e => e.target.style.borderColor = GOLD;
  const fb = e => e.target.style.borderColor = 'rgba(255,255,255,0.1)';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: T }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '36px', height: '36px', border: '2px solid #222', borderTop: `2px solid ${GOLD}`, borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color: '#555' }}>Loading events...</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '2.5rem', background: '#000', minHeight: '100vh', fontFamily: T, color: '#fff' }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        input::placeholder, textarea::placeholder { color: #333; }
        select option { background: #111; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p style={{ color: GOLD, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 6px' }}>Admin</p>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-1px' }}>Manage Events</h1>
          <p style={{ color: '#555', fontSize: '0.83rem', marginTop: '4px' }}>{events.length} event{events.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/admin/create-event" style={{ background: GOLD, color: '#000', padding: '11px 22px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem', fontFamily: T }}>
          + Create Event
        </Link>
      </div>

      {/* Alerts */}
      {success && (
        <div style={{ background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.2)', color: '#30D158', padding: '12px 16px', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.84rem' }}>
          ✓ {success}
        </div>
      )}
      {error && !editEvent && (
        <div style={{ background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.2)', color: '#FF453A', padding: '12px 16px', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.84rem' }}>
          ⚠ {error}
        </div>
      )}

      {/* Events List */}
      {events.length === 0 ? (
        <div style={{ background: '#0d0d0d', borderRadius: '20px', padding: '4rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.2 }}>◈</p>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>No Events Yet</h3>
          <p style={{ color: '#555', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Create your first event to get started!</p>
          <Link to="/admin/create-event" style={{ background: GOLD, color: '#000', padding: '11px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700 }}>
            + Create Event
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '10px', animation: 'fadeUp 0.4s ease' }}>
          {events.map(event => (
            <div key={event._id} style={{ background: '#0d0d0d', borderRadius: '16px', padding: '1.2rem', border: '1px solid rgba(255,255,255,0.07)', display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '1rem', alignItems: 'center' }}>

              <img src={getImage(event)} alt={event.name}
                style={{ width: '80px', height: '65px', objectFit: 'cover', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)' }}
                onError={e => { e.target.src = CATEGORY_IMAGES.Other; }} />

              <div>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 4px' }}>{event.name}</h3>
                <p style={{ color: '#555', fontSize: '0.75rem', margin: '0 0 3px' }}>
                  📅 {new Date(event.date).toLocaleDateString('en-IN')} · 🕐 {event.time} · 📍 {event.venue}
                </p>
                <p style={{ color: '#555', fontSize: '0.75rem', margin: 0 }}>
                  🎭 {event.category} · 💺 {event.availableSeats}/{event.totalSeats} seats · <span style={{ color: GOLD, fontWeight: 700 }}>₹{event.price}</span>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openEdit(event)} style={{ padding: '8px 16px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '10px', color: GOLD, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', fontFamily: T, transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(212,175,55,0.08)'}>
                  ✏️ Edit
                </button>
                <button onClick={() => setDeleteId(event._id)} style={{ padding: '8px 16px', background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: '10px', color: '#FF453A', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', fontFamily: T, transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,69,58,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,69,58,0.08)'}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#0d0d0d', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 80px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', animation: 'slideUp 0.3s ease' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.3rem', margin: 0 }}>✏️ Edit Event</h2>
              <button onClick={() => setEditEvent(null)} style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: '#666', fontSize: '1rem', fontFamily: T }}>✕</button>
            </div>

            {error && (
              <div style={{ background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.2)', color: '#FF453A', padding: '10px 14px', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.83rem' }}>
                ⚠ {error}
              </div>
            )}

            <div style={{ display: 'grid', gap: '1rem' }}>

              {/* Name */}
              <div>
                <label style={lbl}>Event Name *</label>
                <input name="name" value={editForm.name} onChange={handleEditChange} style={inp} onFocus={fg} onBlur={fb} />
              </div>

              {/* Description */}
              <div>
                <label style={lbl}>Description</label>
                <textarea name="description" value={editForm.description} onChange={handleEditChange} rows={3} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} onFocus={fg} onBlur={fb} />
              </div>

              {/* Date & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={lbl}>Date *</label>
                  <input type="date" name="date" value={editForm.date} onChange={handleEditChange} style={inp} onFocus={fg} onBlur={fb} />
                  {editForm.date && <p style={{ color: '#555', fontSize: '0.68rem', marginTop: '3px' }}>✓ {editForm.date}</p>}
                </div>
                <div>
                  <label style={lbl}>Time *</label>
                  <input type="time" name="time" value={editForm.time} onChange={handleEditChange} style={inp} onFocus={fg} onBlur={fb} />
                </div>
              </div>

              {/* Venue */}
              <div>
                <label style={lbl}>Venue *</label>
                <input name="venue" value={editForm.venue} onChange={handleEditChange} style={inp} onFocus={fg} onBlur={fb} />
              </div>

              {/* Category & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={lbl}>Category *</label>
                  <select name="category" value={editForm.category} onChange={handleEditChange} style={inp} onFocus={fg} onBlur={fb}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Status</label>
                  <select name="status" value={editForm.status} onChange={handleEditChange} style={inp} onFocus={fg} onBlur={fb}>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Seats & Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={lbl}>Total Seats *</label>
                  <input type="number" name="totalSeats" value={editForm.totalSeats} onChange={handleEditChange} min="1" style={inp} onFocus={fg} onBlur={fb} />
                </div>
                <div>
                  <label style={lbl}>Available *</label>
                  <input type="number" name="availableSeats" value={editForm.availableSeats} onChange={handleEditChange} min="0" style={inp} onFocus={fg} onBlur={fb} />
                </div>
                <div>
                  <label style={lbl}>Price (₹) *</label>
                  <input type="number" name="price" value={editForm.price} onChange={handleEditChange} min="0" style={inp} onFocus={fg} onBlur={fb} />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label style={lbl}>Image URL</label>
                <input name="image" value={editForm.image} onChange={handleEditChange} style={inp} placeholder="https://images.unsplash.com/..." onFocus={fg} onBlur={fb} />
              </div>

              {/* Image Preview */}
              {editForm.image && (
                <img src={editForm.image} alt="preview"
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' }}
                  onError={e => { e.target.style.display = 'none'; }} />
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                <button onClick={() => setEditEvent(null)} style={{ flex: 1, padding: '12px', background: '#1a1a1a', color: '#555', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', fontFamily: T }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '12px', background: saving ? '#555' : GOLD, color: saving ? '#888' : '#000', border: 'none', borderRadius: '12px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.88rem', fontFamily: T, boxShadow: saving ? 'none' : '0 4px 14px rgba(212,175,55,0.3)' }}>
                  {saving ? '⏳ Saving...' : '✓ Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#0d0d0d', borderRadius: '20px', padding: '2rem', maxWidth: '360px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.08)', animation: 'slideUp 0.3s ease' }}>
            <div style={{ width: '56px', height: '56px', background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1rem' }}>🗑️</div>
            <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '0.5rem', fontFamily: T }}>Delete Event?</h3>
            <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: '1.5rem' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '12px', background: '#1a1a1a', color: '#555', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontFamily: T }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{ flex: 2, padding: '12px', background: 'rgba(255,69,58,0.15)', color: '#FF453A', border: '1px solid rgba(255,69,58,0.3)', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontFamily: T }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageEvents;
