import { useState, useEffect } from 'react';
import API from '../../services/axios';

const FLOWER_CSS = `
  @keyframes floatA { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(12deg)} }
  @keyframes floatB { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-9px) rotate(-9deg)} }
`;

function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/bookings/all/bookings')
      .then(res => setBookings(res.data.bookings || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter(b =>
    b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    b.event?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (s) => ({ confirmed: { bg: '#edf5f0', color: '#3a7a5a' }, pending: { bg: '#fef9ec', color: '#8a7040' }, cancelled: { bg: '#fdeee9', color: '#a05040' } }[s] || { bg: '#f5f5f5', color: '#666' });
  const payBadge    = (s) => ({ paid: { bg: '#edf5f0', color: '#3a7a5a' }, unpaid: { bg: '#fdeee9', color: '#a05040' }, refunded: { bg: '#e8f0fe', color: '#3060a0' } }[s] || { bg: '#f5f5f5', color: '#666' });

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#fdf6f3' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌸</div>
        <p style={{ color: '#c9a99a', fontFamily: "'DM Sans', sans-serif" }}>Loading bookings...</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '2rem', background: '#fdf6f3', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", position: 'relative' }}>
      <style>{FLOWER_CSS}</style>

      {/* Background flowers */}
      {[
        { f: '🌸', top: '8%',  right: '1%',  size: '1.8rem', anim: 'floatA', dur: '4s',   op: 0.10 },
        { f: '🌺', top: '35%', right: '1%',  size: '1.5rem', anim: 'floatB', dur: '5.5s', op: 0.08 },
        { f: '🌷', top: '65%', right: '1%',  size: '1.4rem', anim: 'floatA', dur: '6s',   op: 0.09 },
        { f: '🌼', top: '85%', right: '1%',  size: '1.3rem', anim: 'floatB', dur: '4.5s', op: 0.08 },
      ].map((fl, i) => (
        <span key={i} style={{ position: 'fixed', top: fl.top, right: fl.right, fontSize: fl.size, opacity: fl.op, animation: `${fl.anim} ${fl.dur} ease-in-out infinite`, animationDelay: `${i * 0.7}s`, pointerEvents: 'none', zIndex: 0 }}>{fl.f}</span>
      ))}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#2d1f1f', margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>
              All Bookings 🌸
            </h1>
            <p style={{ color: '#a08880', fontSize: '0.84rem', marginTop: '4px' }}>{filtered.length} of {bookings.length} bookings</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1.5px solid #f0ddd7', borderRadius: '12px', padding: '8px 14px', minWidth: '250px' }}>
            <span>🔍</span>
            <input type="text" placeholder="Search user, email, event..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '0.84rem', color: '#2d1f1f', background: 'transparent', width: '100%' }} />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total',     value: bookings.length,                                            color: '#c9a99a', flower: '🌸' },
            { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length,       color: '#3a7a5a', flower: '🌺' },
            { label: 'Paid',      value: bookings.filter(b => b.paymentStatus === 'paid').length,     color: '#3a7a5a', flower: '🌼' },
            { label: 'Unpaid',    value: bookings.filter(b => b.paymentStatus === 'unpaid').length,   color: '#a05040', flower: '🌷' },
            { label: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length,       color: '#a05040', flower: '💮' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: '14px', padding: '1rem', textAlign: 'center', boxShadow: '0 2px 10px rgba(201,169,154,0.08)', border: '1px solid #f5e8e3', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '4px', right: '6px', fontSize: '0.9rem', opacity: 0.15 }}>{s.flower}</div>
              <p style={{ color: s.color, fontWeight: '800', fontSize: '1.6rem', margin: 0 }}>{s.value}</p>
              <p style={{ color: '#a08880', fontSize: '0.72rem', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(201,169,154,0.1)', border: '1px solid #f5e8e3', overflow: 'hidden', position: 'relative' }}>
          {/* Table header flower accent */}
          <div style={{ position: 'absolute', top: '10px', right: '16px', fontSize: '1rem', opacity: 0.3, zIndex: 2, pointerEvents: 'none' }}>🌸 🌺 🌼</div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #c9a99a, #b8887a)' }}>
                  {['USER', 'EMAIL', 'EVENT', 'SEATS', 'AMOUNT', 'BOOKING STATUS', 'PAYMENT METHOD', 'PAYMENT STATUS'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: 'white', fontWeight: '700', fontSize: '0.7rem', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#a08880' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌷</div>
                      No bookings found
                    </td>
                  </tr>
                ) : filtered.map((b, i) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid #f5e8e3', background: i % 2 === 0 ? 'white' : '#fffaf8', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fdf6f3'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#fffaf8'}
                  >
                    <td style={{ padding: '13px 16px', fontWeight: '700', color: '#2d1f1f', whiteSpace: 'nowrap' }}>{b.user?.name || '—'}</td>
                    <td style={{ padding: '13px 16px', color: '#a08880', fontSize: '0.78rem' }}>{b.user?.email || '—'}</td>
                    <td style={{ padding: '13px 16px', color: '#6b5a55', fontWeight: '500' }}>{b.event?.name || '—'}</td>
                    <td style={{ padding: '13px 16px', color: '#6b5a55', textAlign: 'center', fontWeight: '600' }}>{b.numberOfTickets}</td>
                    <td style={{ padding: '13px 16px', fontWeight: '800', color: '#c9a99a', whiteSpace: 'nowrap' }}>₹{b.totalAmount}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', background: statusBadge(b.status).bg, color: statusBadge(b.status).color, whiteSpace: 'nowrap' }}>
                        {b.status?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', color: '#6b5a55', fontSize: '0.78rem', textTransform: 'capitalize' }}>
                      {b.paymentMethod || <span style={{ color: '#c0a0a0' }}>—</span>}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', background: payBadge(b.paymentStatus).bg, color: payBadge(b.paymentStatus).color, whiteSpace: 'nowrap' }}>
                        {b.paymentStatus?.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AllBookings;
