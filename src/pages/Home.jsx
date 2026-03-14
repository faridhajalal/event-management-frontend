import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/axios';

const T = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif";

const CATEGORIES = ['All', 'Music', 'Sports', 'Food', 'Art', 'Technology', 'Fashion', 'Education', 'Comedy', 'Dance'];

export default function Home() {
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchEvents(); }, []);

  useEffect(() => {
    let result = events;
    if (category !== 'All') result = result.filter(e => e.category === category);
    if (search) result = result.filter(e => e.name?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [events, category, search]);

  const fetchEvents = async () => {
    try {
      const res = await API.get('/events');
      const data = res.data?.events || res.data || [];
      setEvents(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: T, color: '#fff' }}>

      {/* Hero */}
      <div style={{ padding: '5rem 2.5rem 4rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '20px', padding: '5px 14px', marginBottom: '1.5rem' }}>
          <span style={{ color: '#D4AF37', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Premium Events Platform</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: '1.2rem' }}>
          Discover Events<br />
          <span style={{ color: '#D4AF37' }}>Worth Attending.</span>
        </h1>
        <p style={{ color: '#A0A0A0', fontSize: '1.1rem', maxWidth: '520px', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Browse curated events across music, tech, sports and more. Book instantly, experience unforgettably.
        </p>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '480px' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#555', fontSize: '1rem' }}>⌕</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search events..."
            style={{
              width: '100%', padding: '14px 16px 14px 44px',
              background: '#111', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', color: '#fff', fontSize: '0.92rem',
              fontFamily: T, outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = '#D4AF37'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>
      </div>

      {/* Suggest Event Banner */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2.5rem 3rem' }}>
        <div onClick={() => navigate('/suggest-event')} style={{
          background: 'linear-gradient(135deg, #1a1500 0%, #111 100%)',
          border: '1px solid rgba(212,175,55,0.25)', borderRadius: '16px',
          padding: '1.2rem 2rem', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', cursor: 'pointer', transition: 'border-color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.25)'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(212,175,55,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>💡</div>
            <div>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>Have an event idea?</p>
              <p style={{ color: '#A0A0A0', fontSize: '0.8rem', margin: 0 }}>Submit a suggestion and we might make it happen</p>
            </div>
          </div>
          <span style={{ color: '#D4AF37', fontSize: '0.85rem', fontWeight: 600 }}>Suggest →</span>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2.5rem 2.5rem' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: '8px 18px', borderRadius: '20px', border: '1px solid',
              borderColor: category === cat ? '#D4AF37' : 'rgba(255,255,255,0.1)',
              background: category === cat ? 'rgba(212,175,55,0.12)' : 'transparent',
              color: category === cat ? '#D4AF37' : '#A0A0A0',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: T, transition: 'all 0.2s',
            }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2.5rem 5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#555' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>◌</div>
            <p>Loading events...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#555' }}>
            <p style={{ fontSize: '1.1rem' }}>No events found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {filtered.map((event, i) => (
              <EventCard key={event._id || i} event={event} onClick={() => navigate(`/events/${event._id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, onClick }) {
  const [hovered, setHovered] = useState(false);
  const isPast = new Date(event.date) < new Date();

  return (
    <div onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#1a1a1a' : '#111',
        border: `1px solid ${hovered ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.25s', transform: hovered ? 'translateY(-3px)' : 'none',
      }}>
      {/* Image or placeholder */}
      <div style={{
        height: '180px', background: 'linear-gradient(135deg, #1a1500, #0d0d0d)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {event.image ? (
          <img src={event.image} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '3rem', opacity: 0.3 }}>◈</span>
        )}
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <span style={{
            background: isPast ? 'rgba(255,69,58,0.15)' : 'rgba(48,209,88,0.15)',
            color: isPast ? '#FF453A' : '#30D158',
            border: `1px solid ${isPast ? 'rgba(255,69,58,0.3)' : 'rgba(48,209,88,0.3)'}`,
            borderRadius: '20px', padding: '4px 10px', fontSize: '0.7rem', fontWeight: 700,
          }}>
            {isPast ? 'Past' : 'Upcoming'}
          </span>
        </div>
        {event.category && (
          <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
            <span style={{
              background: 'rgba(212,175,55,0.12)', color: '#D4AF37',
              border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: '20px', padding: '4px 10px', fontSize: '0.7rem', fontWeight: 700,
            }}>
              {event.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '1.2rem' }}>
        <h3 style={{ color: '#fff', fontWeight: 600, fontSize: '1rem', marginBottom: '8px', lineHeight: 1.3 }}>
          {event.name}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '1rem' }}>
          <span style={{ color: '#A0A0A0', fontSize: '0.8rem' }}>
            📅 {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          {event.venue && <span style={{ color: '#A0A0A0', fontSize: '0.8rem' }}>📍 {event.venue}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#D4AF37', fontWeight: 700, fontSize: '1rem' }}>
            {event.price === 0 || event.price === '0' ? 'Free' : `₹${Number(event.price).toLocaleString()}`}
          </span>
          <span style={{ color: hovered ? '#D4AF37' : '#555', fontSize: '0.82rem', fontWeight: 600, transition: 'color 0.2s' }}>
            View Details →
          </span>
        </div>
      </div>
    </div>
  );
}
