import { useState, useEffect } from 'react';
import API from '../services/axios';

const T = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif";
const GOLD = '#D4AF37';

const ANIM = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin   { to{transform:rotate(360deg)} }
`;

const STATUS_COLOR = {
  confirmed: { bg:'rgba(48,209,88,0.1)',  color:'#30D158', border:'rgba(48,209,88,0.2)' },
  pending:   { bg:'rgba(255,214,10,0.1)', color:'#FFD60A', border:'rgba(255,214,10,0.2)' },
  cancelled: { bg:'rgba(255,69,58,0.1)',  color:'#FF453A', border:'rgba(255,69,58,0.2)' },
  booked:    { bg:'rgba(48,209,88,0.1)',  color:'#30D158', border:'rgba(48,209,88,0.2)' },
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      // ✅ Fixed endpoint: /bookings/my (not /bookings/my-bookings)
      const res = await API.get('/bookings/my');
      setBookings(res.data?.bookings || res.data || []);
    } catch (err) {
      console.error('Fetch bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await API.put(`/bookings/${id}/cancel`);
      fetchBookings();
    } catch { alert('Failed to cancel.'); }
  };

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  return (
    <div style={{ background:'#000', minHeight:'100vh', fontFamily:T, color:'#fff', padding:'2.5rem' }}>
      <style>{ANIM}</style>

      {/* Header */}
      <div style={{ marginBottom:'2.5rem' }}>
        <p style={{ color:GOLD, fontSize:'0.72rem', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', margin:'0 0 6px' }}>Account</p>
        <h1 style={{ color:'#fff', fontWeight:700, fontSize:'2rem', margin:0, letterSpacing:'-1px' }}>My Bookings</h1>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'2rem', background:'#0d0d0d', borderRadius:'12px', padding:'4px', border:'1px solid rgba(255,255,255,0.06)', width:'fit-content' }}>
        {['all','confirmed','pending','cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:'8px 18px', borderRadius:'9px', border:'none',
            cursor:'pointer', fontWeight:600, fontSize:'0.82rem',
            fontFamily:T, textTransform:'capitalize',
            background: filter===f ? GOLD : 'transparent',
            color: filter===f ? '#000' : '#555',
            transition:'all 0.2s',
          }}>{f}</button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'40vh' }}>
          <div style={{ width:'36px', height:'36px', border:'2px solid #222', borderTopColor:GOLD, borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'5rem', color:'#333' }}>
          <p style={{ fontSize:'2rem', marginBottom:'1rem' }}>◈</p>
          <p style={{ color:'#555', fontWeight:600, fontSize:'1rem' }}>No bookings found</p>
          <p style={{ color:'#333', fontSize:'0.84rem', marginTop:'6px' }}>
            {filter !== 'all' ? `No ${filter} bookings` : 'Book an event to get started!'}
          </p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px', animation:'fadeUp 0.4s ease' }}>
          {filtered.map((b, i) => {
            const sc     = STATUS_COLOR[b.status] || STATUS_COLOR.pending;
            const amount = b.totalAmount || b.totalPrice || b.amount || 0;
            const tickets = b.numberOfTickets || b.quantity || 1;
            return (
              <div key={b._id || i} style={{
                background:'#0d0d0d', border:'1px solid rgba(255,255,255,0.07)',
                borderRadius:'16px', padding:'1.4rem',
                display:'flex', alignItems:'center', gap:'1.5rem', flexWrap:'wrap',
              }}>
                {/* Event image thumbnail */}
                {b.event?.image && (
                  <div style={{ width:'60px', height:'60px', borderRadius:'10px', overflow:'hidden', flexShrink:0 }}>
                    <img src={b.event.image} alt={b.event.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </div>
                )}

                {/* Info */}
                <div style={{ flex:1, minWidth:'200px' }}>
                  <h3 style={{ color:'#fff', fontWeight:700, fontSize:'0.97rem', margin:'0 0 6px' }}>
                    {b.event?.name || 'Event'}
                  </h3>
                  <div style={{ display:'flex', gap:'1.2rem', flexWrap:'wrap' }}>
                    {b.event?.date && (
                      <span style={{ color:'#555', fontSize:'0.8rem' }}>
                        📅 {new Date(b.event.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </span>
                    )}
                    {b.event?.venue && (
                      <span style={{ color:'#555', fontSize:'0.8rem' }}>📍 {b.event.venue}</span>
                    )}
                    <span style={{ color:'#555', fontSize:'0.8rem' }}>
                      🎫 {tickets} ticket{tickets > 1 ? 's' : ''}
                    </span>
                    {amount > 0 && (
                      <span style={{ color:GOLD, fontSize:'0.82rem', fontWeight:700 }}>
                        ₹{amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
                  <span style={{
                    padding:'5px 12px', borderRadius:'20px',
                    fontSize:'0.72rem', fontWeight:700,
                    background:sc.bg, color:sc.color,
                    border:`1px solid ${sc.border}`,
                    textTransform:'uppercase',
                  }}>{b.status}</span>

                  {b.status !== 'cancelled' && (
                    <button onClick={() => cancel(b._id)} style={{
                      padding:'8px 16px', background:'transparent',
                      color:'#FF453A', border:'1px solid rgba(255,69,58,0.2)',
                      borderRadius:'8px', cursor:'pointer',
                      fontWeight:600, fontSize:'0.82rem', fontFamily:T,
                      transition:'background 0.2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,69,58,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
