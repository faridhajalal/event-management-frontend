import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/axios';

const CATEGORIES = ['All', 'Concert', 'Conference', 'Workshop', 'Sports', 'Exhibition', 'Festival', 'Comedy', 'Theatre', 'Other'];

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

const FLOWER_CSS = `
  @keyframes floatA { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(12deg)} }
  @keyframes floatB { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-9px) rotate(-9deg)} }
  @keyframes floatC { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-18px) rotate(18deg)} }
  @keyframes floatD { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-11px) rotate(-14deg)} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
`;

const BG_FLOWERS = [
  { f: '🌸', top: '8%',  left: '3%',  size: '2rem',   anim: 'floatA', dur: '4s',   op: 0.18 },
  { f: '🌺', top: '15%', left: '92%', size: '1.8rem',  anim: 'floatB', dur: '5s',   op: 0.15 },
  { f: '🌼', top: '35%', left: '1%',  size: '1.5rem',  anim: 'floatC', dur: '6s',   op: 0.12 },
  { f: '🌷', top: '55%', left: '95%', size: '1.6rem',  anim: 'floatD', dur: '4.5s', op: 0.14 },
  { f: '🌸', top: '70%', left: '2%',  size: '1.4rem',  anim: 'floatA', dur: '5.5s', op: 0.10 },
  { f: '💮', top: '80%', left: '94%', size: '1.5rem',  anim: 'floatB', dur: '3.8s', op: 0.13 },
  { f: '🌺', top: '90%', left: '4%',  size: '1.6rem',  anim: 'floatC', dur: '4.2s', op: 0.10 },
  { f: '🌸', top: '45%', left: '97%', size: '1.3rem',  anim: 'floatD', dur: '6.5s', op: 0.09 },
];

function PageFlowers() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {BG_FLOWERS.map((fl, i) => (
        <span key={i} style={{ position: 'fixed', top: fl.top, left: fl.left, fontSize: fl.size, opacity: fl.op, animation: `${fl.anim} ${fl.dur} ease-in-out infinite`, animationDelay: `${i * 0.4}s` }}>{fl.f}</span>
      ))}
    </div>
  );
}

// ⭐ Star Rating Display
function StarRating({ rating, count }) {
  if (!rating) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
      <div style={{ display: 'flex', gap: '1px' }}>
        {[1,2,3,4,5].map(s => (
          <span key={s} style={{ fontSize: '0.72rem', color: s <= Math.round(rating) ? '#f4a340' : '#ddd' }}>★</span>
        ))}
      </div>
      <span style={{ color: '#a08880', fontSize: '0.7rem' }}>{parseFloat(rating).toFixed(1)} ({count})</span>
    </div>
  );
}

function BookButton({ event }) {
  const navigate = useNavigate();
  if (event.availableSeats === 0) {
    return (
      <div style={{ background: '#f5e8e3', color: '#c0a0a0', padding: '11px', borderRadius: '12px', textAlign: 'center', fontWeight: '600', fontSize: '0.84rem' }}>
        😔 Sold Out
      </div>
    );
  }
  return (
    <button onClick={() => navigate(`/events/${event._id}`)}
      style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg, #c9a99a, #b8887a)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '0.84rem', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 14px rgba(201,169,154,0.35)', transition: 'all 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
      🎟️ Book Now
    </button>
  );
}

function EventCard({ event, ratings }) {
  const getImage = () => {
    if (event.image && event.image.trim() !== '') return event.image;
    return CATEGORY_IMAGES[event.category] || CATEGORY_IMAGES.Other;
  };

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const eventDate = new Date(event.date); eventDate.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

  const getDaysBadge = () => {
    if (daysUntil < 0) return null;
    if (daysUntil === 0) return { text: '🔴 Today!', bg: 'rgba(220,60,60,0.92)' };
    if (daysUntil === 1) return { text: '🟠 Tomorrow', bg: 'rgba(220,130,40,0.92)' };
    if (daysUntil <= 7) return { text: `🟡 In ${daysUntil} days`, bg: 'rgba(180,140,40,0.92)' };
    return null;
  };

  const badge = getDaysBadge();
  const eventRatings = ratings[event._id] || { avg: 0, count: 0 };

  return (
    <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(201,169,154,0.12)', border: '1px solid #f5e8e3', transition: 'all 0.3s', position: 'relative', zIndex: 1 }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(201,169,154,0.25)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,169,154,0.12)'; }}>
      <div style={{ position: 'relative', height: '195px', overflow: 'hidden', background: '#f5e8e3' }}>
        <img src={getImage()} alt={event.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.07)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          onError={e => { e.target.src = CATEGORY_IMAGES.Other; }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(45,31,31,0.6) 0%, transparent 60%)' }} />
        <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(253,246,243,0.93)', backdropFilter: 'blur(10px)', color: '#c9a99a', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700' }}>{event.category}</span>
        {badge && event.availableSeats > 0 && (
          <span style={{ position: 'absolute', top: '12px', right: '12px', background: badge.bg, color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: '700' }}>{badge.text}</span>
        )}
        {event.availableSeats === 0 && (
          <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(200,70,70,0.92)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: '700' }}>SOLD OUT</span>
        )}
        <span style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(253,246,243,0.96)', color: '#c9a99a', padding: '5px 13px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '800' }}>₹{event.price}</span>
      </div>
      <div style={{ padding: '1.2rem' }}>
        <h3 style={{ color: '#2d1f1f', fontWeight: '700', fontSize: '0.98rem', marginBottom: '0.4rem', lineHeight: '1.35' }}>{event.name}</h3>
        {/* ⭐ Star Rating */}
        {eventRatings.count > 0 && <StarRating rating={eventRatings.avg} count={eventRatings.count} />}
        <p style={{ color: '#a08880', fontSize: '0.76rem', marginBottom: '0.3rem' }}>📅 {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {event.time}</p>
        <p style={{ color: '#a08880', fontSize: '0.76rem', marginBottom: '1rem' }}>📍 {event.venue}</p>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: '#c0a0a0', fontSize: '0.68rem' }}>Availability</span>
            <span style={{ color: '#a08880', fontSize: '0.68rem', fontWeight: '600' }}>{event.availableSeats}/{event.totalSeats}</span>
          </div>
          <div style={{ background: '#f5e8e3', borderRadius: '10px', height: '5px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '10px', width: `${event.totalSeats > 0 ? (event.availableSeats / event.totalSeats) * 100 : 0}%`, background: event.availableSeats === 0 ? '#dc6060' : event.availableSeats / event.totalSeats < 0.2 ? '#e8a87c' : 'linear-gradient(90deg, #c9a99a, #e8c4b8)' }} />
          </div>
        </div>
        <BookButton event={event} />
      </div>
    </div>
  );
}

function EventSection({ title, subtitle, icon, events, ratings }) {
  if (events.length === 0) return null;
  return (
    <div style={{ marginBottom: '3rem', position: 'relative' }}>
      <div style={{ position: 'absolute', right: 0, top: '-5px', opacity: 0.2, fontSize: '1.2rem', pointerEvents: 'none' }}>🌸 🌺 🌷</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.2rem' }}>
        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #c9a99a, #e8c4b8)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{icon}</div>
        <div>
          <h2 style={{ color: '#2d1f1f', fontSize: '1.35rem', fontWeight: '700', margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>{title}</h2>
          <p style={{ color: '#a08880', fontSize: '0.78rem', margin: 0 }}>{subtitle}</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {events.map(event => <EventCard key={event._id} event={event} ratings={ratings} />)}
      </div>
    </div>
  );
}

function Home() {
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const isSearching = search !== '' || locationFilter !== '' || category !== 'All';

  useEffect(() => { fetchEvents(); }, []);

  useEffect(() => {
    let result = events;
    if (search) result = result.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
    if (locationFilter) result = result.filter(e => e.venue.toLowerCase().includes(locationFilter.toLowerCase()));
    if (category !== 'All') result = result.filter(e => e.category === category);
    setFiltered(result);
  }, [search, locationFilter, category, events]);

  const fetchEvents = async () => {
    try {
      const res = await API.get('/events');
      const sorted = (res.data.events || []).sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(sorted);
      setFiltered(sorted);
      // Fetch ratings for each event
      fetchRatings(sorted);
    } catch { setEvents([]); setFiltered([]); }
    finally { setLoading(false); }
  };

  const fetchRatings = async (eventList) => {
    const ratingsMap = {};
    await Promise.all(eventList.map(async (event) => {
      try {
        const res = await API.get(`/ratings/${event._id}`);
        const data = res.data || [];
        if (data.length > 0) {
          const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
          ratingsMap[event._id] = { avg: avg.toFixed(1), count: data.length };
        }
      } catch { }
    }));
    setRatings(ratingsMap);
  };

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const thisWeekEnd = new Date(today); thisWeekEnd.setDate(today.getDate() + 7);
  const thisMonthEnd = new Date(today); thisMonthEnd.setDate(today.getDate() + 30);

  const todayEvents     = events.filter(e => { const d = new Date(e.date); d.setHours(0,0,0,0); return d.getTime() === today.getTime(); });
  const thisWeekEvents  = events.filter(e => { const d = new Date(e.date); d.setHours(0,0,0,0); return d > today && d <= thisWeekEnd; });
  const thisMonthEvents = events.filter(e => { const d = new Date(e.date); d.setHours(0,0,0,0); return d > thisWeekEnd && d <= thisMonthEnd; });
  const upcomingEvents  = events.filter(e => { const d = new Date(e.date); d.setHours(0,0,0,0); return d > thisMonthEnd; });
  const pastEvents      = events.filter(e => { const d = new Date(e.date); d.setHours(0,0,0,0); return d < today; });

  return (
    <div style={{ minHeight: '100vh', background: '#fdf6f3', fontFamily: "'DM Sans', sans-serif", position: 'relative' }}>
      <style>{FLOWER_CSS}</style>
      <PageFlowers />

      {/* ── HERO ── */}
      <section style={{ background: 'linear-gradient(135deg, #2d1f1f 0%, #4a2f2f 50%, #3d2525 100%)', padding: '5rem 2rem', position: 'relative', overflow: 'hidden' }}>
        {['🌸','🌺','🌼','🌷','💮','🌸','🌺'].map((f, i) => (
          <span key={i} style={{ position: 'absolute', fontSize: `${1 + (i % 3) * 0.5}rem`, opacity: 0.15 + (i % 3) * 0.05, left: `${4 + i * 13}%`, top: `${15 + (i % 4) * 18}%`, animation: `float${['A','B','C','D'][i%4]} ${3.5 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.3}s`, pointerEvents: 'none' }}>{f}</span>
        ))}
        <div style={{ position: 'absolute', top: '-80px', right: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,154,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(201,169,154,0.2)', border: '1px solid rgba(201,169,154,0.3)', borderRadius: '20px', padding: '6px 18px', marginBottom: '1.2rem' }}>
            <span style={{ color: '#e8c4b8', fontSize: '0.78rem', fontWeight: '600', letterSpacing: '2px' }}>🌸 DISCOVER AMAZING EXPERIENCES 🌸</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: '700', color: 'white', lineHeight: '1.2', marginBottom: '1rem', fontFamily: "'Cormorant Garamond', serif" }}>
            Find & Book Your<br /><span style={{ color: '#e8c4b8' }}>Dream Events</span> 🌸
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
            Concerts, festivals, workshops and more — all in one beautiful place.
          </p>

          {/* Search Bar */}
          <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(201,169,154,0.25)', borderRadius: '18px', padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', maxWidth: '700px', margin: '0 auto 2.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '120px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🔍</span>
              <input type="text" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '0.88rem', width: '100%' }} />
            </div>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ flex: 1, minWidth: '120px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📍</span>
              <input type="text" placeholder="City or venue..." value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '0.88rem', width: '100%' }} />
            </div>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)' }} />
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '0.84rem', cursor: 'pointer' }}>
              {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#2d1f1f', color: 'white' }}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
            {[{ num: `${events.length}+`, label: 'Events' }, { num: '10K+', label: 'Attendees' }, { num: '50+', label: 'Cities' }].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ color: '#e8c4b8', fontWeight: '700', fontSize: '1.4rem', margin: 0 }}>{s.num}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUGGEST EVENT BANNER ── */}
      <section style={{ background: 'linear-gradient(135deg, #fdf0eb, #f5e0d8)', padding: '1.5rem 2rem', borderBottom: '1px solid #f0ddd7', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #c9a99a, #b8887a)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>💡</div>
            <div>
              <h3 style={{ color: '#2d1f1f', fontWeight: '700', margin: 0, fontSize: '0.98rem' }}>Have an event idea?</h3>
              <p style={{ color: '#a08880', margin: 0, fontSize: '0.8rem' }}>Suggest an event and we might make it happen! 🌸</p>
            </div>
          </div>
          <Link to="/suggest-event" style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #c9a99a, #b8887a)', color: 'white', borderRadius: '25px', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem', boxShadow: '0 4px 14px rgba(201,169,154,0.4)', whiteSpace: 'nowrap' }}>
            💡 Suggest Event →
          </Link>
        </div>
      </section>

      {/* ── CATEGORY PILLS ── */}
      <section style={{ background: 'white', padding: '1rem 2rem', borderBottom: '1px solid #f0ddd7', boxShadow: '0 2px 10px rgba(201,169,154,0.1)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px', alignItems: 'center' }}>
          <span style={{ flexShrink: 0, fontSize: '1rem', opacity: 0.4 }}>🌸</span>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{ padding: '7px 18px', borderRadius: '20px', border: '1.5px solid', cursor: 'pointer', fontWeight: '500', fontSize: '0.8rem', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif", borderColor: category === cat ? '#c9a99a' : '#f0ddd7', background: category === cat ? 'linear-gradient(135deg, #c9a99a, #e8c4b8)' : 'white', color: category === cat ? 'white' : '#8a6a65', boxShadow: category === cat ? '0 4px 12px rgba(201,169,154,0.3)' : 'none', transition: 'all 0.2s' }}>{cat}</button>
          ))}
          <span style={{ flexShrink: 0, fontSize: '1rem', opacity: 0.4 }}>🌺</span>
          {isSearching && (
            <button onClick={() => { setSearch(''); setLocationFilter(''); setCategory('All'); }} style={{ padding: '7px 16px', borderRadius: '20px', border: '1.5px solid #f0ddd7', cursor: 'pointer', fontWeight: '600', fontSize: '0.78rem', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif", background: '#fdeee9', color: '#c9a99a' }}>✕ Clear</button>
          )}
        </div>
      </section>

      {/* ── EVENTS ── */}
      <section style={{ padding: '3rem 2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '6rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌸</div>
              <p style={{ color: '#c9a99a' }}>Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '6rem', background: 'white', borderRadius: '24px', border: '1px solid #f5e8e3' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌷🌸🌺</div>
              <h3 style={{ color: '#2d1f1f', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Events Yet</h3>
              <p style={{ color: '#a08880', fontSize: '0.88rem' }}>Admin is setting up amazing events. Check back soon! 🌸</p>
            </div>
          ) : isSearching ? (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: '#2d1f1f', fontSize: '1.4rem', fontWeight: '700', margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>🔍 Search Results</h2>
                <p style={{ color: '#a08880', fontSize: '0.83rem', marginTop: '4px' }}>{filtered.length} event{filtered.length !== 1 ? 's' : ''} found</p>
              </div>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '20px', border: '1px solid #f5e8e3' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌷</div>
                  <p style={{ color: '#a08880' }}>No events match your search.</p>
                  <button onClick={() => { setSearch(''); setLocationFilter(''); setCategory('All'); }} style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #c9a99a, #b8887a)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontFamily: "'DM Sans', sans-serif" }}>Clear Filters</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {filtered.map(event => <EventCard key={event._id} event={event} ratings={ratings} />)}
                </div>
              )}
            </div>
          ) : (
            <div>
              <EventSection title="🔴 Happening Today"  subtitle={`${todayEvents.length} event${todayEvents.length !== 1 ? 's' : ''} today`}          icon="🔴" events={todayEvents}     ratings={ratings} />
              <EventSection title="📅 This Week"        subtitle={`${thisWeekEvents.length} events in next 7 days`}                                     icon="📅" events={thisWeekEvents}  ratings={ratings} />
              <EventSection title="🌸 This Month"       subtitle={`${thisMonthEvents.length} events this month`}                                        icon="🌸" events={thisMonthEvents} ratings={ratings} />
              <EventSection title="✨ Upcoming Events"  subtitle={`${upcomingEvents.length} events planned ahead`}                                      icon="✨" events={upcomingEvents}  ratings={ratings} />
              {pastEvents.length > 0 && <EventSection title="📁 Past Events" subtitle={`${pastEvents.length} completed events`}                         icon="📁" events={pastEvents}      ratings={ratings} />}
            </div>
          )}
        </div>
      </section>

      {/* ── FEEDBACK CTA ── */}
      <section style={{ background: 'white', padding: '2rem', borderTop: '1px solid #f0ddd7', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #c9a99a, #b8887a)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>💬</div>
            <div>
              <h3 style={{ color: '#2d1f1f', fontWeight: '700', margin: 0, fontSize: '0.98rem' }}>Share your feedback!</h3>
              <p style={{ color: '#a08880', margin: 0, fontSize: '0.8rem' }}>Click the 💬 button on the bottom right to chat with us 🌸</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['⭐ Rate Events', '💡 Suggest Events', '💬 Give Feedback'].map((item, i) => (
              <span key={i} style={{ padding: '6px 14px', background: '#fdf0eb', border: '1px solid #f0ddd7', borderRadius: '20px', fontSize: '0.75rem', color: '#b8887a', fontWeight: '600' }}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'linear-gradient(135deg, #c9a99a 0%, #b8887a 100%)', padding: '5rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', zIndex: 1 }}>
        {['🌸','🌺','🌼','🌷','🌸','💮','🌺','🌸'].map((f, i) => (
          <span key={i} style={{ position: 'absolute', fontSize: `${0.9 + (i % 3) * 0.4}rem`, opacity: 0.2, left: `${i * 13}%`, top: `${10 + (i % 3) * 30}%`, animation: `float${['A','B','C','D'][i%4]} ${4 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.5}s`, pointerEvents: 'none' }}>{f}</span>
        ))}
        <div style={{ maxWidth: '550px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌸</div>
          <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: '700', marginBottom: '0.8rem', fontFamily: "'Cormorant Garamond', serif" }}>Start Your Journey Today</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', fontSize: '0.92rem' }}>Join our community and never miss an amazing event again.</p>
          <Link to="/register" style={{ background: 'white', color: '#c9a99a', padding: '14px 40px', borderRadius: '30px', textDecoration: 'none', fontWeight: '700', fontSize: '0.95rem', display: 'inline-block', boxShadow: '0 8px 25px rgba(45,31,31,0.2)' }}>
            Sign Up Free 🌸
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
