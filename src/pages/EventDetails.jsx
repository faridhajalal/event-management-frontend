import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/axios';

const T = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif";
const GOLD = '#D4AF37';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => { fetchEvent(); }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await API.get(`/events/${id}`);
      setEvent(res.data?.event || res.data);
    } catch { setError('Event not found.'); }
    finally { setLoading(false); }
  };

  // ── Navigate to payment page instead of booking directly ──
  const bookEvent = () => {
    const total = (event.price || 0) * qty;
    navigate('/payments', {
      state: {
        eventId: id,
        eventName: event.name,
        amount: total,
        seats: qty,
      }
    });
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontFamily: T }}>
      <div style={{ width: '36px', height: '36px', border: '2px solid #222', borderTopColor: GOLD, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error && !event) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontFamily: T, flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: '#FF453A', fontSize: '1rem' }}>{error}</p>
      <button onClick={() => navigate('/home')} style={{ color: GOLD, background: 'transparent', border: `1px solid rgba(212,175,55,0.3)`, borderRadius: '8px', padding: '9px 20px', cursor: 'pointer', fontFamily: T, fontWeight: 600 }}>Back to Home</button>
    </div>
  );

  if (!event) return null;

  const isPast = new Date(event.date) < new Date();
  const total = (event.price || 0) * qty;

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: T, color: '#fff' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Back */}
      <div style={{ padding: '1.5rem 2.5rem 0' }}>
        <button onClick={() => navigate('/home')} style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', fontFamily: T, fontSize: '0.86rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', padding: 0, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#555'}>
          ← Back
        </button>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 2.5rem 4rem', animation: 'fadeUp 0.5s ease' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem', alignItems: 'start' }}>

          {/* Left */}
          <div>
            {/* Image */}
            <div style={{ height: '320px', background: '#111', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '2rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {event.image
                ? <img src={event.image} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '4rem', opacity: 0.1 }}>◈</span>
              }
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
              {event.category && <span style={{ background: 'rgba(212,175,55,0.1)', color: GOLD, border: '1px solid rgba(212,175,55,0.2)', borderRadius: '20px', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{event.category}</span>}
              <span style={{ background: isPast ? 'rgba(255,69,58,0.1)' : 'rgba(48,209,88,0.1)', color: isPast ? '#FF453A' : '#30D158', border: `1px solid ${isPast ? 'rgba(255,69,58,0.2)' : 'rgba(48,209,88,0.2)'}`, borderRadius: '20px', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700 }}>{isPast ? 'Past Event' : 'Upcoming'}</span>
            </div>

            {/* Title */}
            <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.5px', marginBottom: '1.5rem', lineHeight: 1.2 }}>{event.name}</h1>

            {/* Meta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
              {[
                { icon: '📅', label: 'Date', val: new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                { icon: '🕐', label: 'Time', val: event.time || new Date(event.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
                { icon: '📍', label: 'Venue', val: event.venue || event.location || 'TBA' },
                { icon: '👥', label: 'Capacity', val: event.availableSeats ? `${event.availableSeats} seats available` : 'Open' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.9rem', marginTop: '1px' }}>{item.icon}</span>
                  <div>
                    <span style={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '2px' }}>{item.label}</span>
                    <span style={{ color: '#A0A0A0', fontSize: '0.9rem' }}>{item.val}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {event.description && (
              <>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1.5rem' }} />
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>About this event</h3>
                <p style={{ color: '#777', fontSize: '0.92rem', lineHeight: 1.8 }}>{event.description}</p>
              </>
            )}
          </div>

          {/* Right — Booking Card */}
          <div style={{ position: 'sticky', top: '80px' }}>
            <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.8rem' }}>

              <p style={{ color: '#555', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', margin: '0 0 1rem' }}>Book Tickets</p>

              <div style={{ marginBottom: '1.2rem' }}>
                <p style={{ color: GOLD, fontSize: '2rem', fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.5px' }}>
                  {event.price === 0 || event.price === '0' ? 'Free' : `₹${Number(event.price).toLocaleString()}`}
                </p>
                <p style={{ color: '#555', fontSize: '0.8rem', margin: 0 }}>per ticket</p>
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1.2rem' }} />

              {/* Quantity */}
              {!isPast && (
                <div style={{ marginBottom: '1.2rem' }}>
                  <p style={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0 0 8px' }}>Quantity</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: '36px', height: '36px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '1.1rem', fontFamily: T }}>−</button>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' }}>{qty}</span>
                    <button onClick={() => setQty(q => Math.min(10, q + 1))} style={{ width: '36px', height: '36px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '1.1rem', fontFamily: T }}>+</button>
                  </div>
                </div>
              )}

              {/* Total */}
              {event.price > 0 && (
                <div style={{ background: '#111', borderRadius: '10px', padding: '12px 14px', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#555', fontSize: '0.86rem' }}>Total</span>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>₹{total.toLocaleString()}</span>
                </div>
              )}

              {error && (
                <div style={{ background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', color: '#FF453A', fontSize: '0.82rem' }}>{error}</div>
              )}

              <button
                onClick={isPast ? null : bookEvent}
                disabled={isPast}
                style={{
                  width: '100%', padding: '14px',
                  background: isPast ? '#1a1a1a' : GOLD,
                  color: isPast ? '#444' : '#000',
                  border: isPast ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem',
                  cursor: isPast ? 'not-allowed' : 'pointer', fontFamily: T,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => { if (!isPast) e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {isPast ? 'Event Ended' : '🔒 Proceed to Payment'}
              </button>

              {!isPast && (
                <p style={{ textAlign: 'center', color: '#333', fontSize: '0.72rem', marginTop: '0.8rem', letterSpacing: '0.3px' }}>
                  🔐 Secure payment • Card, UPI, Net Banking
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
