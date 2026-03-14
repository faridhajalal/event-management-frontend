import { useState, useEffect } from 'react';
import API from '../../services/axios';

const T = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif";
const GOLD = '#D4AF37';

const STATUS_COLOR = {
  confirmed: { bg: 'rgba(48,209,88,0.1)',  color: '#30D158', border: 'rgba(48,209,88,0.2)' },
  pending:   { bg: 'rgba(255,214,10,0.1)', color: '#FFD60A', border: 'rgba(255,214,10,0.2)' },
  cancelled: { bg: 'rgba(255,69,58,0.1)',  color: '#FF453A', border: 'rgba(255,69,58,0.2)' },
  booked:    { bg: 'rgba(48,209,88,0.1)',  color: '#30D158', border: 'rgba(48,209,88,0.2)' },
};

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await API.get('/bookings/all/bookings');
      setBookings(res.data?.bookings || res.data || []);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  };

  const filtered = bookings
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b => {
      const name = b.event?.name || b.eventName || '';
      const user = b.user?.name || b.user?.email || b.userName || '';
      return name.toLowerCase().includes(search.toLowerCase()) || user.toLowerCase().includes(search.toLowerCase());
    });

  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed' || b.paymentStatus === 'paid')
    .reduce((s, b) => s + (b.totalAmount || b.totalPrice || b.amount || 0), 0);

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: T, color: '#fff', padding: '2.5rem' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}} input::placeholder{color:#333}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ color: GOLD, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 6px' }}>Admin</p>
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2rem', margin: 0, letterSpacing: '-1px' }}>All Bookings</h1>
        </div>
        {/* Stats */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total', val: bookings.length, color: '#fff' },
            { label: 'Confirmed', val: bookings.filter(b => b.status === 'confirmed').length, color: '#30D158' },
            { label: 'Revenue', val: `₹${totalRevenue.toLocaleString()}`, color: GOLD },
          ].map((s, i) => (
            <div key={i} style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '0.8rem 1.2rem', textAlign: 'center' }}>
              <p style={{ color: '#555', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>{s.label}</p>
              <p style={{ color: s.color, fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{s.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by event or user..."
          style={{ padding: '11px 16px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '0.88rem', fontFamily: T, outline: 'none', width: '280px', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = GOLD}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
        <div style={{ display: 'flex', gap: '4px', background: '#0d0d0d', borderRadius: '10px', padding: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
          {['all', 'confirmed', 'pending', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 14px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem', fontFamily: T, textTransform: 'capitalize', background: filter === f ? GOLD : 'transparent', color: filter === f ? '#000' : '#555', transition: 'all 0.2s' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ width: '36px', height: '36px', border: '2px solid #222', borderTopColor: GOLD, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#333' }}>
          <p style={{ color: '#555', fontWeight: 600 }}>No bookings found</p>
        </div>
      ) : (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 0.8fr 1fr', gap: '1rem', padding: '0 1rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Event', 'User', 'Tickets', 'Amount', 'Status'].map(h => (
              <span key={h} style={{ color: '#444', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h}</span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((b, i) => {
              const sc = STATUS_COLOR[b.status] || STATUS_COLOR.pending;
              const amount = b.totalAmount || b.totalPrice || b.amount || 0;
              return (
                <div key={b._id || i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 0.8fr 1fr', gap: '1rem', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#0d0d0d'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div>
                    <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem', margin: '0 0 3px' }}>{b.event?.name || b.eventName || 'Event'}</p>
                    <p style={{ color: '#444', fontSize: '0.75rem', margin: 0 }}>{new Date(b.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p style={{ color: '#A0A0A0', fontSize: '0.85rem', margin: '0 0 2px', fontWeight: 500 }}>{b.user?.name || b.userName || 'User'}</p>
                    <p style={{ color: '#444', fontSize: '0.75rem', margin: 0 }}>{b.user?.email || b.userEmail || ''}</p>
                  </div>
                  <span style={{ color: '#A0A0A0', fontSize: '0.85rem' }}>{b.quantity || 1}</span>
                  <span style={{ color: GOLD, fontWeight: 700, fontSize: '0.88rem' }}>{amount > 0 ? `₹${amount.toLocaleString()}` : 'Free'}</span>
                  <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, textTransform: 'uppercase', display: 'inline-block' }}>
                    {b.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
