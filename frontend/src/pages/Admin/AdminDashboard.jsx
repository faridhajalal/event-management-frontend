import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/axios';

const FLOWER_CSS = `
  @keyframes floatA { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(12deg)} }
  @keyframes floatB { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-9px) rotate(-9deg)} }
  @keyframes floatC { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-18px) rotate(18deg)} }
  @keyframes floatD { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-11px) rotate(-14deg)} }
`;

function AdminDashboard() {
  const [stats, setStats] = useState({ events: 0, bookings: 0, revenue: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [evRes, bkRes] = await Promise.all([
        API.get('/events'),
        API.get('/bookings/all/bookings'),
      ]);
      const bookings = bkRes.data.bookings || [];
      const revenue = bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0);
      setStats({ events: evRes.data.count || 0, bookings: bookings.length, revenue });
      setRecent(bookings.slice(0, 6));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#fdf6f3' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌸</div>
        <p style={{ color: '#c9a99a', fontFamily: "'DM Sans', sans-serif" }}>Loading...</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '2rem', background: '#fdf6f3', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", position: 'relative' }}>
      <style>{FLOWER_CSS}</style>

      {/* Background flower decorations */}
      {[
        { f: '🌸', top: '5%',  right: '2%',  size: '2rem',   anim: 'floatA', dur: '4s',   op: 0.10 },
        { f: '🌺', top: '25%', right: '1%',  size: '1.6rem', anim: 'floatB', dur: '5s',   op: 0.08 },
        { f: '🌼', top: '50%', right: '2%',  size: '1.4rem', anim: 'floatC', dur: '6s',   op: 0.08 },
        { f: '🌷', top: '75%', right: '1%',  size: '1.5rem', anim: 'floatD', dur: '4.5s', op: 0.09 },
      ].map((fl, i) => (
        <span key={i} style={{
          position: 'fixed', top: fl.top, right: fl.right,
          fontSize: fl.size, opacity: fl.op,
          animation: `${fl.anim} ${fl.dur} ease-in-out infinite`,
          animationDelay: `${i * 0.6}s`, pointerEvents: 'none', zIndex: 0
        }}>{fl.f}</span>
      ))}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#2d1f1f', margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>
              Dashboard Overview 🌸
            </h1>
            <p style={{ color: '#a08880', fontSize: '0.84rem', marginTop: '4px' }}>Welcome back, Admin! 🌺</p>
          </div>
          <div style={{ fontSize: '1.5rem', opacity: 0.3 }}>🌸 🌺 🌼 🌷</div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Events', value: stats.events, icon: '🎭', color: '#c9a99a', bg: '#fdeee9', flower: '🌸' },
            { label: 'Total Bookings', value: stats.bookings, icon: '🎫', color: '#3a7a5a', bg: '#edf5f0', flower: '🌺' },
            { label: 'Revenue Collected', value: `₹${stats.revenue.toLocaleString()}`, icon: '💰', color: '#8a6a30', bg: '#fdf5e6', flower: '🌼' },
          ].map(card => (
            <div key={card.label} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(201,169,154,0.1)', border: '1px solid #f5e8e3', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
              {/* Corner flower */}
              <div style={{ position: 'absolute', top: '8px', right: '50px', fontSize: '1.2rem', opacity: 0.12, pointerEvents: 'none' }}>{card.flower}</div>
              <div>
                <p style={{ color: '#a08880', fontSize: '0.78rem', marginBottom: '6px' }}>{card.label}</p>
                <p style={{ color: card.color, fontSize: '1.9rem', fontWeight: '800', margin: 0 }}>{card.value}</p>
              </div>
              <div style={{ background: card.bg, width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{card.icon}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { to: '/admin/create-event',  icon: '➕', label: 'Create New Event', color: '#c9a99a', bg: '#fdeee9', flower: '🌸' },
            { to: '/admin/manage-events', icon: '📝', label: 'Manage Events',    color: '#3a7a5a', bg: '#edf5f0', flower: '🌺' },
            { to: '/admin/bookings',      icon: '🎫', label: 'View Bookings',    color: '#8a6a30', bg: '#fdf5e6', flower: '🌼' },
          ].map(action => (
            <Link key={action.to} to={action.to} style={{
              background: 'white', borderRadius: '16px', padding: '1.4rem',
              textDecoration: 'none', textAlign: 'center',
              boxShadow: '0 2px 12px rgba(201,169,154,0.1)',
              border: `2px solid ${action.bg}`, display: 'block', transition: 'all 0.2s',
              position: 'relative', overflow: 'hidden'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = action.color; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = action.bg; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ position: 'absolute', top: '6px', right: '10px', fontSize: '1rem', opacity: 0.15 }}>{action.flower}</div>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{action.icon}</div>
              <p style={{ color: action.color, fontWeight: '700', fontSize: '0.85rem', margin: 0 }}>{action.label}</p>
            </Link>
          ))}
        </div>

        {/* Recent Bookings */}
        <div style={{ background: 'white', borderRadius: '18px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(201,169,154,0.1)', border: '1px solid #f5e8e3', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '12px', right: '60px', fontSize: '1.4rem', opacity: 0.12, pointerEvents: 'none' }}>🌸 🌺</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h2 style={{ fontWeight: '700', color: '#2d1f1f', margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem' }}>Recent Bookings</h2>
            <Link to="/admin/bookings" style={{ color: '#c9a99a', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none' }}>View All →</Link>
          </div>

          {recent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#a08880' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌷</div>
              <p>No bookings yet</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #fdf6f3, #f9ede8)' }}>
                    {['USER', 'EMAIL', 'EVENT', 'SEATS', 'AMOUNT', 'STATUS'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#a08880', fontWeight: '700', fontSize: '0.7rem', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((b, i) => (
                    <tr key={b._id} style={{ borderBottom: '1px solid #f5e8e3', background: i % 2 === 0 ? 'white' : '#fffaf8' }}>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#2d1f1f' }}>{b.user?.name}</td>
                      <td style={{ padding: '12px 14px', color: '#a08880', fontSize: '0.78rem' }}>{b.user?.email}</td>
                      <td style={{ padding: '12px 14px', color: '#6b5a55' }}>{b.event?.name}</td>
                      <td style={{ padding: '12px 14px', color: '#6b5a55', textAlign: 'center' }}>{b.numberOfTickets}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '800', color: '#c9a99a' }}>₹{b.totalAmount}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', background: b.status === 'confirmed' ? '#edf5f0' : b.status === 'pending' ? '#fef9ec' : '#fdeee9', color: b.status === 'confirmed' ? '#3a7a5a' : b.status === 'pending' ? '#8a7040' : '#a05040' }}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default AdminDashboard;

