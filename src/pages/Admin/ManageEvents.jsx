import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/axios';

const CATEGORIES = ['Concert', 'Conference', 'Workshop', 'Sports', 'Exhibition', 'Festival', 'Comedy', 'Theatre', 'Other'];

const CATEGORY_IMAGES = {
  Concert: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&q=80',
  Festival: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80',
  Sports: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80',
  Workshop: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80',
  Conference: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
  Exhibition: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80',
  Comedy: 'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=600&q=80',
  Theatre: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&q=80',
  Other: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80',
};

function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editEvent, setEditEvent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const res = await API.get('/events');
      setEvents(res.data.events || []);
    } catch (err) {
      console.error('Fetch events error:', err);
    } finally { setLoading(false); }
  };

  // ✅ Pre-fill ALL saved data when clicking Edit
  const openEdit = (event) => {
    // Format date to YYYY-MM-DD for input type="date"
    let dateValue = '';
    if (event.date) {
      const d = new Date(event.date);
      if (!isNaN(d)) {
        dateValue = d.toISOString().split('T')[0]; // Always YYYY-MM-DD
      }
    }

    setEditForm({
      name: event.name || '',
      description: event.description || '',
      date: dateValue,
      time: event.time || '',
      venue: event.venue || '',
      category: event.category || 'Concert',
      totalSeats: event.totalSeats?.toString() || '',
      availableSeats: event.availableSeats?.toString() || '',
      price: event.price?.toString() || '',
      image: event.image || '',
      status: event.status || 'upcoming',
    });
    setEditEvent(event);
    setError('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const total = parseInt(editForm.totalSeats);
      const available = parseInt(editForm.availableSeats);
      if (available > total) {
        setError('Available seats cannot exceed total seats');
        setSaving(false); return;
      }

      await API.put(`/events/${editEvent._id}`, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        date: editForm.date,
        time: editForm.time,
        venue: editForm.venue.trim(),
        category: editForm.category,
        totalSeats: total,
        availableSeats: available,
        price: parseFloat(editForm.price),
        image: editForm.image.trim(),
        status: editForm.status,
      });

      setSuccess('✅ Event updated successfully!');
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
      setSuccess('🗑️ Event deleted!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const getImage = (event) => event.image?.trim() || CATEGORY_IMAGES[event.category] || CATEGORY_IMAGES.Other;

  const inp = {
    width: '100%', padding: '10px 13px',
    background: 'white', border: '1.5px solid #f0ddd7',
    borderRadius: '10px', color: '#2d1f1f', fontSize: '0.87rem',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: "'DM Sans', sans-serif",
  };

  const lbl = {
    display: 'block', color: '#6b5a55',
    fontSize: '0.72rem', fontWeight: '700', marginBottom: '5px',
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌸</div>
        <p style={{ color: '#c9a99a', fontFamily: "'DM Sans', sans-serif" }}>Loading events...</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '2rem', background: '#fdf6f3', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#2d1f1f', margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>
            Manage Events
          </h1>
          <p style={{ color: '#a08880', fontSize: '0.83rem', marginTop: '4px' }}>
            {events.length} event{events.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link to="/admin/create-event" style={{
          background: 'linear-gradient(135deg, #c9a99a, #b8887a)', color: 'white',
          padding: '10px 20px', borderRadius: '12px', textDecoration: 'none',
          fontWeight: '700', fontSize: '0.85rem',
        }}>
          + Create Event
        </Link>
      </div>

      {/* Alerts */}
      {success && (
        <div style={{ background: '#edf5f0', border: '1px solid #b8d8c8', color: '#3a7a5a', padding: '12px 16px', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.84rem' }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ background: '#fdeee9', border: '1px solid #f0c4b8', color: '#a05040', padding: '12px 16px', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.84rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Events List */}
      {events.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '20px', padding: '4rem', textAlign: 'center', border: '1px solid #f5e8e3' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌸</div>
          <h3 style={{ color: '#2d1f1f', fontFamily: "'Cormorant Garamond', serif", marginBottom: '0.5rem' }}>No Events Yet</h3>
          <p style={{ color: '#a08880', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Create your first event to get started!</p>
          <Link to="/admin/create-event" style={{ background: 'linear-gradient(135deg, #c9a99a, #b8887a)', color: 'white', padding: '11px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: '700' }}>
            + Create Event
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {events.map(event => (
            <div key={event._id} style={{ background: 'white', borderRadius: '16px', padding: '1.2rem', boxShadow: '0 2px 12px rgba(201,169,154,0.1)', border: '1px solid #f5e8e3', display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '1rem', alignItems: 'center' }}>

              <img src={getImage(event)} alt={event.name}
                style={{ width: '80px', height: '65px', objectFit: 'cover', borderRadius: '10px' }}
                onError={e => { e.target.src = CATEGORY_IMAGES.Other; }} />

              <div>
                <h3 style={{ color: '#2d1f1f', fontWeight: '700', fontSize: '0.95rem', marginBottom: '3px' }}>{event.name}</h3>
                <p style={{ color: '#a08880', fontSize: '0.75rem', marginBottom: '3px' }}>
                  📅 {new Date(event.date).toLocaleDateString('en-IN')} • 🕐 {event.time} • 📍 {event.venue}
                </p>
                <p style={{ color: '#a08880', fontSize: '0.75rem' }}>
                  🎭 {event.category} • 💺 {event.availableSeats}/{event.totalSeats} seats • ₹{event.price}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openEdit(event)} style={{ padding: '8px 16px', background: '#fdf6f3', border: '1px solid #f0ddd7', borderRadius: '10px', color: '#c9a99a', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>
                  ✏️ Edit
                </button>
                <button onClick={() => setDeleteId(event._id)} style={{ padding: '8px 16px', background: '#fdeee9', border: '1px solid #f0c4b8', borderRadius: '10px', color: '#a05040', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(45,31,31,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 60px rgba(45,31,31,0.3)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#2d1f1f', fontWeight: '700', fontSize: '1.3rem', margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>
                ✏️ Edit Event
              </h2>
              <button onClick={() => setEditEvent(null)} style={{ background: '#f5e8e3', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: '#a08880', fontSize: '1rem' }}>✕</button>
            </div>

            {error && (
              <div style={{ background: '#fdeee9', border: '1px solid #f0c4b8', color: '#a05040', padding: '10px 14px', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.83rem' }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: 'grid', gap: '1rem' }}>

              {/* Name */}
              <div>
                <label style={lbl}>EVENT NAME *</label>
                <input name="name" value={editForm.name} onChange={handleEditChange} style={inp}
                  onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
              </div>

              {/* Description */}
              <div>
                <label style={lbl}>DESCRIPTION</label>
                <textarea name="description" value={editForm.description} onChange={handleEditChange}
                  rows={3} style={{ ...inp, resize: 'vertical' }}
                  onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
              </div>

              {/* Date & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={lbl}>DATE *</label>
                  <input type="date" name="date" value={editForm.date} onChange={handleEditChange} style={inp}
                    onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
                  {editForm.date && <p style={{ color: '#a08880', fontSize: '0.68rem', marginTop: '3px' }}>✅ {editForm.date}</p>}
                </div>
                <div>
                  <label style={lbl}>TIME *</label>
                  <input type="time" name="time" value={editForm.time} onChange={handleEditChange} style={inp}
                    onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
                </div>
              </div>

              {/* Venue */}
              <div>
                <label style={lbl}>VENUE *</label>
                <input name="venue" value={editForm.venue} onChange={handleEditChange} style={inp}
                  onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
              </div>

              {/* Category & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={lbl}>CATEGORY *</label>
                  <select name="category" value={editForm.category} onChange={handleEditChange} style={inp}
                    onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>STATUS</label>
                  <select name="status" value={editForm.status} onChange={handleEditChange} style={inp}
                    onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'}>
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
                  <label style={lbl}>TOTAL SEATS *</label>
                  <input type="number" name="totalSeats" value={editForm.totalSeats} onChange={handleEditChange} min="1" style={inp}
                    onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
                </div>
                <div>
                  <label style={lbl}>AVAILABLE SEATS *</label>
                  <input type="number" name="availableSeats" value={editForm.availableSeats} onChange={handleEditChange} min="0" style={inp}
                    onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
                </div>
                <div>
                  <label style={lbl}>PRICE (₹) *</label>
                  <input type="number" name="price" value={editForm.price} onChange={handleEditChange} min="0" style={inp}
                    onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label style={lbl}>IMAGE URL</label>
                <input name="image" value={editForm.image} onChange={handleEditChange} style={inp}
                  placeholder="https://images.unsplash.com/..."
                  onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
              </div>

              {/* Image Preview */}
              {editForm.image && (
                <img src={editForm.image} alt="preview"
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #f0ddd7' }}
                  onError={e => { e.target.style.display = 'none'; }} />
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                <button onClick={() => setEditEvent(null)} style={{ flex: 1, padding: '12px', background: '#f5e8e3', color: '#a08880', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem' }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '12px', background: saving ? '#ddd' : 'linear-gradient(135deg, #c9a99a, #b8887a)', color: 'white', border: 'none', borderRadius: '12px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.88rem', boxShadow: '0 4px 14px rgba(201,169,154,0.35)' }}>
                  {saving ? '⏳ Saving...' : '✅ Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(45,31,31,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '360px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(45,31,31,0.3)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🗑️</div>
            <h3 style={{ color: '#2d1f1f', fontWeight: '700', marginBottom: '0.5rem', fontFamily: "'Cormorant Garamond', serif" }}>Delete Event?</h3>
            <p style={{ color: '#a08880', fontSize: '0.85rem', marginBottom: '1.5rem' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '12px', background: '#f5e8e3', color: '#a08880', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #e08080, #c06060)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700' }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageEvents;

