import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/axios';

const FLOWER_CSS = `
  @keyframes floatA { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(12deg)} }
  @keyframes floatB { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-9px) rotate(-9deg)} }
  @keyframes floatC { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-18px) rotate(18deg)} }
  @keyframes floatD { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-11px) rotate(-14deg)} }
`;

const BG_FLOWERS = [
  { f: '🌸', top: '10%', left: '2%',  size: '1.8rem', anim: 'floatA', dur: '4s',   op: 0.12 },
  { f: '🌺', top: '20%', left: '95%', size: '1.6rem', anim: 'floatB', dur: '5s',   op: 0.10 },
  { f: '🌼', top: '40%', left: '1%',  size: '1.4rem', anim: 'floatC', dur: '6s',   op: 0.10 },
  { f: '🌷', top: '60%', left: '96%', size: '1.5rem', anim: 'floatD', dur: '4.5s', op: 0.12 },
  { f: '💮', top: '75%', left: '2%',  size: '1.3rem', anim: 'floatA', dur: '5.5s', op: 0.09 },
  { f: '🌸', top: '85%', left: '94%', size: '1.6rem', anim: 'floatB', dur: '3.8s', op: 0.11 },
];

function PageFlowers() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {BG_FLOWERS.map((fl, i) => (
        <span key={i} style={{
          position: 'fixed', top: fl.top, left: fl.left,
          fontSize: fl.size, opacity: fl.op,
          animation: `${fl.anim} ${fl.dur} ease-in-out infinite`,
          animationDelay: `${i * 0.5}s`
        }}>{fl.f}</span>
      ))}
    </div>
  );
}

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState(1);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!id || id === 'undefined') { navigate('/home'); return; }
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await API.get(`/events/${id}`);
      setEvent(res.data.event);
    } catch { setError('Event not found'); }
    finally { setLoading(false); }
  };

  const handleBook = async () => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    setError(''); setBooking(true);
    try {
      await API.post('/bookings', { eventId: id, numberOfTickets: tickets });
      setSuccess('🎉 Booking confirmed! Redirecting...');
      setTimeout(() => navigate('/my-bookings'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally { setBooking(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', background: '#fdf6f3' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌸</div>
        <p style={{ color: '#c9a99a', fontFamily: "'DM Sans', sans-serif" }}>Loading event...</p>
      </div>
    </div>
  );

  if (error && !event) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', background: '#fdf6f3' }}>
      <div style={{ textAlign: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
        <h2 style={{ color: '#2d1f1f' }}>Event Not Found</h2>
        <button onClick={() => navigate('/home')} style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #c9a99a, #b8887a)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>← Go Back</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#fdf6f3', fontFamily: "'DM Sans', sans-serif", position: 'relative' }}>
      <style>{FLOWER_CSS}</style>
      <PageFlowers />

      {/* Hero */}
      <div style={{ position: 'relative', height: '380px', zIndex: 1 }}>
        <img src={event.image || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80'}
          alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(45,31,31,0.88) 0%, rgba(45,31,31,0.3) 60%, transparent 100%)' }} />

        {['🌸','🌺','🌼','🌷'].map((f, i) => (
          <span key={i} style={{
            position: 'absolute', fontSize: '1.2rem', opacity: 0.3,
            top: `${15 + i * 20}%`, right: `${3 + i * 2}%`,
            animation: `floatA ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`, pointerEvents: 'none'
          }}>{f}</span>
        ))}

        <button onClick={() => navigate('/home')} style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'rgba(253,246,243,0.9)', backdropFilter: 'blur(10px)', border: 'none', color: '#c9a99a', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif", zIndex: 2 }}>
          ← Back
        </button>
        <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', color: 'white', zIndex: 2 }}>
          <span style={{ background: 'rgba(201,169,154,0.9)', padding: '5px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '10px', display: 'inline-block' }}>{event.category}</span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '700', marginTop: '8px', fontFamily: "'Cormorant Garamond', serif" }}>{event.name}</h1>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start', position: 'relative', zIndex: 1 }}>

        {/* Left */}
        <div>
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.8rem', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(201,169,154,0.1)', border: '1px solid #f5e8e3', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '10px', right: '14px', fontSize: '1.4rem', opacity: 0.15, pointerEvents: 'none' }}>🌸</div>
            <h2 style={{ color: '#2d1f1f', fontWeight: '700', marginBottom: '1rem', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem' }}>About This Event</h2>
            <p style={{ color: '#6b5a55', lineHeight: '1.8', fontSize: '0.9rem' }}>{event.description || 'Join us for an amazing experience you will never forget!'}</p>
          </div>

          <div style={{ background: 'white', borderRadius: '20px', padding: '1.8rem', boxShadow: '0 4px 20px rgba(201,169,154,0.1)', border: '1px solid #f5e8e3', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '10px', right: '14px', fontSize: '1.4rem', opacity: 0.15, pointerEvents: 'none' }}>🌺</div>
            <h2 style={{ color: '#2d1f1f', fontWeight: '700', marginBottom: '1.2rem', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem' }}>Event Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { icon: '📅', label: 'DATE', value: new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                { icon: '🕐', label: 'TIME', value: event.time },
                { icon: '📍', label: 'VENUE', value: event.venue },
                { icon: '🏷️', label: 'CATEGORY', value: event.category },
                { icon: '🎫', label: 'AVAILABLE', value: `${event.availableSeats} seats left` },
                { icon: '💰', label: 'PRICE', value: `₹${event.price} per ticket` },
              ].map(item => (
                <div key={item.label} style={{ background: '#fdf6f3', borderRadius: '14px', padding: '1rem', display: 'flex', gap: '10px', alignItems: 'flex-start', border: '1px solid #f5e8e3' }}>
                  <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                  <div>
                    <p style={{ color: '#c0a0a0', fontSize: '0.68rem', marginBottom: '3px', fontWeight: '700', letterSpacing: '0.5px' }}>{item.label}</p>
                    <p style={{ color: '#2d1f1f', fontWeight: '600', fontSize: '0.84rem', margin: 0 }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Booking Card */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.8rem', boxShadow: '0 8px 30px rgba(201,169,154,0.2)', border: '1px solid #f5e8e3', position: 'sticky', top: '90px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '10px', right: '14px', fontSize: '1.6rem', opacity: 0.15, pointerEvents: 'none' }}>🌸</div>
          <div style={{ position: 'absolute', bottom: '10px', left: '14px', fontSize: '1.2rem', opacity: 0.12, pointerEvents: 'none' }}>🌺</div>

          <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '2px dashed #f5e8e3' }}>
            <p style={{ color: '#c9a99a', fontSize: '2.5rem', fontWeight: '800', margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>₹{event.price}</p>
            <p style={{ color: '#a08880', fontSize: '0.8rem', margin: 0 }}>per ticket • EventHub 🌸</p>
          </div>

          {error && <div style={{ background: '#fdeee9', border: '1px solid #f0c4b8', color: '#a05040', padding: '11px 14px', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.82rem' }}>⚠️ {error}</div>}
          {success && <div style={{ background: '#edf5f0', border: '1px solid #b8d8c8', color: '#3a7a5a', padding: '11px 14px', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.82rem' }}>{success}</div>}

          {event.availableSeats > 0 ? (
            <>
              <div style={{ marginBottom: '1.2rem' }}>
                <p style={{ color: '#6b5a55', fontSize: '0.82rem', fontWeight: '600', marginBottom: '10px' }}>Select Tickets 🎟️</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#fdf6f3', borderRadius: '14px', padding: '10px 16px', border: '1px solid #f5e8e3', justifyContent: 'space-between' }}>
                  <button onClick={() => setTickets(Math.max(1, tickets - 1))} style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'white', border: '1.5px solid #f0ddd7', color: '#c9a99a', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ color: '#2d1f1f', fontWeight: '800', fontSize: '1.5rem' }}>{tickets}</span>
                    <p style={{ color: '#a08880', fontSize: '0.7rem', margin: 0 }}>ticket{tickets > 1 ? 's' : ''}</p>
                  </div>
                  <button onClick={() => setTickets(Math.min(event.availableSeats, tickets + 1))} style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'white', border: '1.5px solid #f0ddd7', color: '#c9a99a', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
              </div>

              <div style={{ background: '#fdf6f3', borderRadius: '14px', padding: '1rem', marginBottom: '1.2rem', border: '1px solid #f5e8e3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a08880', fontSize: '0.82rem', marginBottom: '6px' }}>
                  <span>₹{event.price} × {tickets}</span><span>₹{event.price * tickets}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8aad9a', fontSize: '0.82rem', marginBottom: '6px' }}>
                  <span>Convenience fee</span><span>FREE 🎁</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px dashed #f0ddd7', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: '#2d1f1f', fontWeight: '700' }}>Total</span>
                  <span style={{ color: '#c9a99a', fontWeight: '800', fontSize: '1.1rem' }}>₹{event.price * tickets}</span>
                </div>
              </div>

              <button onClick={handleBook} disabled={booking || !!success} style={{
                width: '100%', padding: '14px',
                background: booking || success ? 'rgba(201,169,154,0.5)' : 'linear-gradient(135deg, #c9a99a, #b8887a)',
                color: 'white', border: 'none', borderRadius: '14px',
                cursor: booking || success ? 'not-allowed' : 'pointer',
                fontWeight: '700', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif",
                boxShadow: '0 6px 20px rgba(201,169,154,0.4)'
              }}>
                {booking ? '⏳ Confirming...' : success ? '✅ Booked!' : '🌸 Confirm Booking'}
              </button>
              <p style={{ textAlign: 'center', color: '#c0a0a0', fontSize: '0.72rem', marginTop: '0.8rem' }}>🔒 Secure booking • Instant confirmation</p>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', background: '#fdf6f3', borderRadius: '14px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>😔</div>
              <p style={{ color: '#a08880' }}>This event is sold out.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
