import { useState, useEffect } from 'react';
import API from '../../services/axios';

const T = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif";
const GOLD = '#D4AF37';

function StatCard({ icon, label, value, sub, trend }) {
  return (
    <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: '#666', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px' }}>{label}</p>
          <p style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.5px' }}>{value}</p>
          {sub && <p style={{ color: trend === 'up' ? '#30D158' : trend === 'down' ? '#FF453A' : '#666', fontSize: '0.76rem', margin: 0, fontWeight: 600 }}>{trend === 'up' ? '▲' : trend === 'down' ? '▼' : ''} {sub}</p>}
        </div>
        <span style={{ fontSize: '1.4rem', opacity: 0.7 }}>{icon}</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [suggestions, setSuggestions] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [eventsRes, bookingsRes] = await Promise.all([
        API.get('/events'),
        API.get('/bookings/all/bookings'),
      ]);
      const events = eventsRes.data?.events || eventsRes.data || [];
      const bookings = bookingsRes.data?.bookings || bookingsRes.data || [];

      const paidBookings = bookings.filter(b => b.paymentStatus === 'paid' || b.status === 'confirmed');
      const totalRevenue = paidBookings.reduce((s, b) => s + (b.totalAmount || b.totalPrice || b.amount || 0), 0);
      const confirmed = bookings.filter(b => b.status === 'confirmed');
      const cancelled = bookings.filter(b => b.status === 'cancelled');
      const pending = bookings.filter(b => b.status === 'pending');

      const now = new Date();
      const monthlyData = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthlyData[d.toLocaleString('default', { month: 'short', year: '2-digit' })] = 0;
      }
      paidBookings.forEach(b => {
        const key = new Date(b.createdAt || b.bookingDate).toLocaleString('default', { month: 'short', year: '2-digit' });
        if (monthlyData[key] !== undefined) monthlyData[key] += (b.totalAmount || b.totalPrice || b.amount || 0);
      });

      const thisKey = now.toLocaleString('default', { month: 'short', year: '2-digit' });
      const lastKey = new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleString('default', { month: 'short', year: '2-digit' });
      const thisMonthRev = monthlyData[thisKey] || 0;
      const lastMonthRev = monthlyData[lastKey] || 0;
      const momGrowth = lastMonthRev > 0 ? (((thisMonthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(1) : 0;

      const catMap = {};
      events.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + 1; });

      try {
        const sugRes = await API.get('/suggestions');
        setSuggestions(sugRes.data || []);
      } catch { setSuggestions([]); }

      setData({
        events, bookings, totalRevenue, confirmed, cancelled, pending,
        monthlyData, catMap, thisMonthRev, lastMonthRev, momGrowth,
        totalCost: totalRevenue * 0.30,
        totalProfit: totalRevenue * 0.70,
        thisMonthCost: thisMonthRev * 0.30,
        thisMonthProfit: thisMonthRev * 0.70,
        TARGET: 50000,
        targetPct: Math.min((thisMonthRev / 50000) * 100, 100).toFixed(0),
        totalUsers: [...new Set(bookings.map(b => String(b.userId || b.user)))].filter(Boolean).length,
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await API.patch(`/suggestions/${id}`, { status });
      setSuggestions(prev => prev.map(s => s._id === id ? { ...s, status } : s));
    } catch { alert('Update failed'); }
    finally { setUpdatingId(null); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontFamily: T, flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '40px', height: '40px', border: '2px solid #333', borderTopColor: GOLD, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color: '#555' }}>Loading...</p>
    </div>
  );

  if (!data) return <div style={{ padding: '2rem', color: '#FF453A', fontFamily: T }}>Failed to load dashboard data.</div>;

  const pendingSug = suggestions.filter(s => s.status === 'pending').length;
  const maxRev = Math.max(...Object.values(data.monthlyData), 1);
  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'events', label: 'Events' },
    { id: 'suggestions', label: `Ideas${pendingSug > 0 ? ` (${pendingSug})` : ''}` },
  ];

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: T, color: '#fff', padding: '2.5rem' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <p style={{ color: GOLD, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 6px' }}>Admin Panel</p>
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2rem', margin: 0, letterSpacing: '-1px' }}>Dashboard</h1>
          <p style={{ color: '#555', fontSize: '0.84rem', margin: '4px 0 0' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={fetchDashboard} style={{
          background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#A0A0A0',
          borderRadius: '10px', padding: '9px 20px', cursor: 'pointer', fontFamily: T,
          fontSize: '0.84rem', fontWeight: 600, transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#A0A0A0'; }}>
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '2.5rem', background: '#0d0d0d', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.06)', width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 20px', borderRadius: '9px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.84rem', fontFamily: T, transition: 'all 0.2s',
            background: tab === t.id ? GOLD : 'transparent',
            color: tab === t.id ? '#000' : '#666',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <StatCard icon="💰" label="Total Revenue" value={`₹${data.totalRevenue.toLocaleString()}`} sub={`${data.momGrowth >= 0 ? '+' : ''}${data.momGrowth}% vs last month`} trend={data.momGrowth >= 0 ? 'up' : 'down'} />
            <StatCard icon="🎫" label="Total Bookings" value={data.bookings.length} sub={`${data.confirmed.length} confirmed`} trend="up" />
            <StatCard icon="🎭" label="Total Events" value={data.events.length} sub={`${data.events.filter(e => new Date(e.date) > new Date()).length} upcoming`} />
            <StatCard icon="👥" label="Total Users" value={data.totalUsers} sub="registered" />
            <StatCard icon="✕" label="Cancellations" value={data.cancelled.length} sub={`${((data.cancelled.length / Math.max(data.bookings.length, 1)) * 100).toFixed(0)}% rate`} trend="down" />
            <StatCard icon="⏳" label="Pending" value={data.pending.length} sub="awaiting" />
          </div>

          {/* Revenue Chart */}
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.8rem', marginBottom: '1.5rem' }}>
            <p style={{ color: '#666', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', margin: '0 0 1.5rem' }}>Monthly Revenue</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '160px' }}>
              {Object.entries(data.monthlyData).map(([month, rev], i) => {
                const pct = (rev / maxRev) * 100;
                const isThis = i === Object.keys(data.monthlyData).length - 1;
                return (
                  <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ color: '#555', fontSize: '0.65rem', fontWeight: 600 }}>{rev > 0 ? `₹${rev > 999 ? (rev / 1000).toFixed(0) + 'k' : rev}` : ''}</span>
                    <div style={{ width: '100%', borderRadius: '6px 6px 0 0', background: isThis ? GOLD : '#222', height: `${Math.max(pct, 3)}%`, transition: 'height 0.8s ease' }} />
                    <span style={{ color: isThis ? GOLD : '#444', fontSize: '0.68rem', fontWeight: isThis ? 700 : 500 }}>{month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Target + P&L */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem' }}>
              <p style={{ color: '#666', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', margin: '0 0 1rem' }}>Monthly Target</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ color: '#A0A0A0', fontSize: '0.85rem' }}>₹{data.thisMonthRev.toLocaleString()} / ₹{data.TARGET.toLocaleString()}</span>
                <span style={{ color: data.targetPct >= 100 ? '#30D158' : GOLD, fontWeight: 700, fontSize: '1.1rem' }}>{data.targetPct}%</span>
              </div>
              <div style={{ height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${data.targetPct}%`, background: data.targetPct >= 100 ? '#30D158' : GOLD, borderRadius: '3px', transition: 'width 1s ease' }} />
              </div>
            </div>
            <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem' }}>
              <p style={{ color: '#666', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', margin: '0 0 1rem' }}>Overall P&L</p>
              {[
                { label: 'Gross Revenue', val: `₹${data.totalRevenue.toLocaleString()}`, color: '#fff' },
                { label: 'Cost (30%)', val: `- ₹${Math.round(data.totalCost).toLocaleString()}`, color: '#FF453A' },
                { label: 'Net Profit', val: `₹${Math.round(data.totalProfit).toLocaleString()}`, color: '#30D158' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <span style={{ color: '#555', fontSize: '0.82rem' }}>{item.label}</span>
                  <span style={{ color: item.color, fontWeight: 700, fontSize: '0.85rem' }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── REVENUE ── */}
      {tab === 'revenue' && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'This Month', val: `₹${data.thisMonthRev.toLocaleString()}`, color: GOLD },
              { label: 'This Month Profit', val: `₹${Math.round(data.thisMonthProfit).toLocaleString()}`, color: '#30D158' },
              { label: 'This Month Cost', val: `₹${Math.round(data.thisMonthCost).toLocaleString()}`, color: '#FF453A' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                <p style={{ color: '#555', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px' }}>{item.label}</p>
                <p style={{ color: item.color, fontSize: '1.8rem', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>{item.val}</p>
              </div>
            ))}
          </div>

          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.8rem', marginBottom: '1.5rem' }}>
            <p style={{ color: '#666', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', margin: '0 0 1.5rem' }}>Revenue Chart — Last 6 Months</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '200px' }}>
              {Object.entries(data.monthlyData).map(([month, rev], i) => {
                const pct = (rev / maxRev) * 100;
                const isThis = i === Object.keys(data.monthlyData).length - 1;
                return (
                  <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ color: '#666', fontSize: '0.65rem' }}>{rev > 0 ? `₹${rev > 999 ? (rev / 1000).toFixed(0) + 'k' : rev}` : ''}</span>
                    <div style={{ width: '100%', borderRadius: '6px 6px 0 0', background: isThis ? GOLD : '#1e1e1e', border: `1px solid ${isThis ? GOLD : '#333'}`, height: `${Math.max(pct, 3)}%`, transition: 'height 0.8s ease' }} />
                    <span style={{ color: isThis ? GOLD : '#444', fontSize: '0.68rem', fontWeight: isThis ? 700 : 500 }}>{month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { title: 'Overall Breakdown', rows: [
                { label: 'Gross Revenue', val: `₹${data.totalRevenue.toLocaleString()}`, color: '#fff' },
                { label: 'Operational (30%)', val: `₹${Math.round(data.totalCost).toLocaleString()}`, color: '#FF453A' },
                { label: 'Net Profit', val: `₹${Math.round(data.totalProfit).toLocaleString()}`, color: '#30D158' },
              ]},
              { title: 'Target Analysis', rows: [
                { label: 'Monthly Target', val: `₹${data.TARGET.toLocaleString()}`, color: '#fff' },
                { label: 'This Month', val: `₹${data.thisMonthRev.toLocaleString()}`, color: GOLD },
                { label: 'Achievement', val: `${data.targetPct}%`, color: data.targetPct >= 100 ? '#30D158' : GOLD },
                { label: 'MoM Growth', val: `${data.momGrowth >= 0 ? '+' : ''}${data.momGrowth}%`, color: data.momGrowth >= 0 ? '#30D158' : '#FF453A' },
              ]},
            ].map((panel, pi) => (
              <div key={pi} style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem' }}>
                <p style={{ color: '#666', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', margin: '0 0 1rem' }}>{panel.title}</p>
                {panel.rows.map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < panel.rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <span style={{ color: '#555', fontSize: '0.84rem' }}>{row.label}</span>
                    <span style={{ color: row.color, fontWeight: 700, fontSize: '0.86rem' }}>{row.val}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── EVENTS ── */}
      {tab === 'events' && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.8rem', marginBottom: '1.5rem' }}>
            <p style={{ color: '#666', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', margin: '0 0 1.5rem' }}>By Category</p>
            {Object.entries(data.catMap).map(([cat, count]) => {
              const pct = (count / data.events.length) * 100;
              return (
                <div key={cat} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#A0A0A0', fontSize: '0.84rem', fontWeight: 600 }}>{cat}</span>
                    <span style={{ color: '#555', fontSize: '0.8rem' }}>{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div style={{ height: '5px', background: '#1e1e1e', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: GOLD, borderRadius: '3px', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.8rem' }}>
            <p style={{ color: '#666', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', margin: '0 0 1.5rem' }}>All Events</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto' }}>
              {data.events.map((event, i) => {
                const upcoming = new Date(event.date) > new Date();
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: '#111', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: '36px', height: '36px', background: '#1a1500', border: `1px solid rgba(212,175,55,0.2)`, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD, fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#fff', fontWeight: 600, margin: '0 0 3px', fontSize: '0.9rem' }}>{event.name}</p>
                      <p style={{ color: '#555', fontSize: '0.76rem', margin: 0 }}>{event.category} · {new Date(event.date).toDateString()} · ₹{event.price}</p>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: upcoming ? 'rgba(48,209,88,0.1)' : 'rgba(255,69,58,0.1)', color: upcoming ? '#30D158' : '#FF453A', border: `1px solid ${upcoming ? 'rgba(48,209,88,0.2)' : 'rgba(255,69,58,0.2)'}` }}>
                      {upcoming ? 'Upcoming' : 'Past'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── SUGGESTIONS ── */}
      {tab === 'suggestions' && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { label: 'All', count: suggestions.length, color: '#A0A0A0' },
              { label: 'Pending', count: suggestions.filter(s => s.status === 'pending').length, color: '#FFD60A' },
              { label: 'Approved', count: suggestions.filter(s => s.status === 'approved').length, color: '#30D158' },
              { label: 'Rejected', count: suggestions.filter(s => s.status === 'rejected').length, color: '#FF453A' },
            ].map(item => (
              <span key={item.label} style={{ padding: '6px 14px', borderRadius: '20px', background: '#111', border: '1px solid rgba(255,255,255,0.08)', color: item.color, fontSize: '0.78rem', fontWeight: 700 }}>
                {item.label}: {item.count}
              </span>
            ))}
          </div>

          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.8rem' }}>
            {suggestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#333' }}>
                <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>◈</p>
                <p style={{ fontWeight: 600, color: '#555' }}>No suggestions yet</p>
                <p style={{ fontSize: '0.84rem', marginTop: '6px' }}>User suggestions will appear here</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {suggestions.map(s => (
                  <div key={s._id} style={{
                    padding: '1.4rem', background: '#111', borderRadius: '14px',
                    border: `1px solid ${s.status === 'approved' ? 'rgba(48,209,88,0.2)' : s.status === 'rejected' ? 'rgba(255,69,58,0.15)' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <h4 style={{ color: '#fff', fontWeight: 700, margin: '0 0 8px', fontSize: '0.95rem' }}>{s.title}</h4>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ background: 'rgba(212,175,55,0.1)', color: GOLD, border: '1px solid rgba(212,175,55,0.2)', padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>{s.category}</span>
                          <span style={{
                            padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                            background: s.status === 'approved' ? 'rgba(48,209,88,0.1)' : s.status === 'rejected' ? 'rgba(255,69,58,0.1)' : 'rgba(255,214,10,0.1)',
                            color: s.status === 'approved' ? '#30D158' : s.status === 'rejected' ? '#FF453A' : '#FFD60A',
                          }}>{s.status?.toUpperCase()}</span>
                        </div>
                      </div>
                      <span style={{ color: '#444', fontSize: '0.76rem' }}>{new Date(s.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p style={{ color: '#777', fontSize: '0.86rem', margin: '0 0 12px', lineHeight: 1.7 }}>{s.description}</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {s.expectedVenue && <span style={{ color: '#555', fontSize: '0.76rem' }}>📍 {s.expectedVenue}</span>}
                      {s.expectedDate && <span style={{ color: '#555', fontSize: '0.76rem' }}>📅 {new Date(s.expectedDate).toDateString()}</span>}
                      {s.contactEmail && <span style={{ color: '#555', fontSize: '0.76rem' }}>✉ {s.contactEmail}</span>}
                    </div>
                    {s.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => updateStatus(s._id, 'approved')} disabled={updatingId === s._id}
                          style={{ padding: '8px 18px', background: 'rgba(48,209,88,0.1)', color: '#30D158', border: '1px solid rgba(48,209,88,0.25)', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', fontFamily: T }}>
                          Approve
                        </button>
                        <button onClick={() => updateStatus(s._id, 'rejected')} disabled={updatingId === s._id}
                          style={{ padding: '8px 18px', background: 'rgba(255,69,58,0.08)', color: '#FF453A', border: '1px solid rgba(255,69,58,0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', fontFamily: T }}>
                          Reject
                        </button>
                      </div>
                    )}
                    {s.status !== 'pending' && (
                      <button onClick={() => updateStatus(s._id, 'pending')}
                        style={{ padding: '7px 16px', background: 'transparent', color: '#555', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem', fontFamily: T }}>
                        Reset to Pending
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
