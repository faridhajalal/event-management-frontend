import { useState, useEffect } from 'react';
import API from '../../services/axios';

const CSS = `
  @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes growUp { from{height:0} to{height:var(--h)} }
`;

function BarChart({ monthlyData }) {
  const entries = Object.entries(monthlyData);
  const max = Math.max(...entries.map(([,v]) => v), 1);
  const COLORS = ['#f093fb','#4facfe','#43e97b','#f6d365','#c9a99a','#fa709a'];
  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:'14px', height:'220px', padding:'0 10px 0 40px', position:'relative' }}>
        {[0,25,50,75,100].map(pct => (
          <div key={pct} style={{ position:'absolute', left:0, bottom:`${pct}%`, fontSize:'0.62rem', color:'#ccc', fontWeight:'600', transform:'translateY(50%)' }}>
            ₹{((max * pct / 100)/1000).toFixed(0)}k
          </div>
        ))}
        {[25,50,75,100].map(pct => (
          <div key={pct} style={{ position:'absolute', left:'40px', right:0, bottom:`${pct}%`, height:'1px', background:'#f0f0f0' }} />
        ))}
        {entries.map(([month, val], i) => {
          const pct = (val / max) * 100;
          const isThis = i === entries.length - 1;
          return (
            <div key={month} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', height:'100%', justifyContent:'flex-end' }}>
              <span style={{ color:'#2d1f1f', fontSize:'0.65rem', fontWeight:'700' }}>
                {val > 0 ? `₹${val > 999 ? (val/1000).toFixed(0)+'k' : val}` : ''}
              </span>
              <div style={{ width:'100%', borderRadius:'8px 8px 0 0', background: isThis ? `linear-gradient(180deg,${COLORS[i]},${COLORS[i]}cc)` : `linear-gradient(180deg,#e0e0e0,#d0d0d0)`, height:`${Math.max(pct, 2)}%`, boxShadow: isThis ? `0 -4px 14px ${COLORS[i]}60` : 'none', transition:'height 1s ease' }} />
              <span style={{ color: isThis ? COLORS[i] : '#aaa', fontSize:'0.68rem', fontWeight: isThis ? '800' : '500' }}>{month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PLChart({ monthlyData }) {
  const entries = Object.entries(monthlyData);
  const revenues = entries.map(([,v]) => v);
  const profits  = revenues.map(v => v * 0.70);
  const costs    = revenues.map(v => v * 0.30);
  const max      = Math.max(...revenues, 1);
  const W = 500; const H = 180;
  const pad = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const toX = i => pad.left + (i / (entries.length - 1)) * chartW;
  const toY = v => pad.top + chartH - (v / max) * chartH;
  const line = arr => arr.map((v,i) => `${i===0?'M':'L'}${toX(i)},${toY(v)}`).join(' ');
  const area = arr => `${line(arr)} L${toX(arr.length-1)},${pad.top+chartH} L${toX(0)},${pad.top+chartH} Z`;
  const LINES = [
    { values: revenues, color: '#c9a99a', label: 'Revenue', fill: '#c9a99a20' },
    { values: profits,  color: '#4caf50', label: 'Profit',  fill: '#4caf5020' },
    { values: costs,    color: '#f44336', label: 'Cost',    fill: '#f4433620' },
  ];
  return (
    <div>
      <div style={{ display:'flex', gap:'20px', marginBottom:'1rem', flexWrap:'wrap' }}>
        {LINES.map(l => (
          <div key={l.label} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <div style={{ width:'24px', height:'3px', background:l.color, borderRadius:'2px' }} />
            <span style={{ color:'#6b5a55', fontSize:'0.78rem', fontWeight:'600' }}>{l.label}</span>
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'auto', overflow:'visible' }}>
        {[0,25,50,75,100].map(pct => {
          const y = pad.top + chartH - (pct/100)*chartH;
          return (
            <g key={pct}>
              <line x1={pad.left} y1={y} x2={W-pad.right} y2={y} stroke="#f0f0f0" strokeWidth="1" />
              <text x={pad.left-6} y={y+4} textAnchor="end" fontSize="9" fill="#ccc">₹{((max*pct/100)/1000).toFixed(0)}k</text>
            </g>
          );
        })}
        {entries.map(([month,], i) => (
          <text key={month} x={toX(i)} y={H-4} textAnchor="middle" fontSize="9" fill="#aaa" fontWeight="500">{month}</text>
        ))}
        {LINES.map(l => <path key={l.label+'-area'} d={area(l.values)} fill={l.fill} />)}
        {LINES.map(l => <path key={l.label} d={line(l.values)} fill="none" stroke={l.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />)}
        {LINES.map(l => l.values.map((v,i) => <circle key={`${l.label}-${i}`} cx={toX(i)} cy={toY(v)} r="4" fill={l.color} stroke="white" strokeWidth="2" />))}
      </svg>
    </div>
  );
}

function TargetGauge({ current, target }) {
  const pct = Math.min((current / target) * 100, 100);
  const remaining = Math.max(target - current, 0);
  const R = 80; const cx = 110; const cy = 100;
  const circumference = Math.PI * R;
  const progress = (pct / 100) * circumference;
  const color = pct >= 100 ? '#4caf50' : pct >= 75 ? '#ff9800' : pct >= 50 ? '#c9a99a' : '#f44336';
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem' }}>
      <svg width="220" height="120" viewBox="0 0 220 120">
        <path d={`M ${cx-R} ${cy} A ${R} ${R} 0 0 1 ${cx+R} ${cy}`} fill="none" stroke="#f0ddd7" strokeWidth="20" strokeLinecap="round" />
        <path d={`M ${cx-R} ${cy} A ${R} ${R} 0 0 1 ${cx+R} ${cy}`} fill="none" stroke={color} strokeWidth="20" strokeLinecap="round" strokeDasharray={`${progress} ${circumference}`} style={{ transition:'stroke-dasharray 1.5s ease' }} />
        <text x={cx} y={cy-10} textAnchor="middle" fontSize="28" fontWeight="900" fill="#2d1f1f" fontFamily="Cormorant Garamond, serif">{pct.toFixed(0)}%</text>
        <text x={cx} y={cy+12} textAnchor="middle" fontSize="10" fill="#a08880" fontWeight="600">{pct >= 100 ? '🎉 Target Met!' : 'of target'}</text>
      </svg>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem', width:'100%' }}>
        {[
          { label:'Target',    val:`₹${target.toLocaleString()}`,    color:'#2d1f1f' },
          { label:'Achieved',  val:`₹${current.toLocaleString()}`,   color },
          { label:'Remaining', val:`₹${remaining.toLocaleString()}`, color:'#f44336' },
        ].map((item,i) => (
          <div key={i} style={{ textAlign:'center', background:'#fdf8f6', borderRadius:'14px', padding:'12px 8px', border:'1px solid #f0ddd7' }}>
            <p style={{ color:'#a08880', fontSize:'0.68rem', fontWeight:'700', textTransform:'uppercase', margin:'0 0 4px' }}>{item.label}</p>
            <p style={{ color:item.color, fontSize:'0.92rem', fontWeight:'800', margin:0 }}>{item.val}</p>
          </div>
        ))}
      </div>
      <div style={{ width:'100%' }}>
        <div style={{ height:'10px', background:'#f0ddd7', borderRadius:'5px', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${color},${color}cc)`, borderRadius:'5px', transition:'width 1.5s ease' }} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color, trend }) {
  return (
    <div style={{ background:'white', borderRadius:'20px', padding:'1.6rem', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:'1px solid #f0ddd7', animation:'fadeIn 0.5s ease', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'-20px', right:'-20px', width:'80px', height:'80px', borderRadius:'50%', background:color, opacity:0.1 }} />
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <p style={{ color:'#a08880', fontSize:'0.73rem', fontWeight:'600', textTransform:'uppercase', margin:'0 0 8px', letterSpacing:'0.5px' }}>{label}</p>
          <p style={{ color:'#2d1f1f', fontSize:'2rem', fontWeight:'800', margin:'0 0 8px', fontFamily:"'Cormorant Garamond',serif", lineHeight:1 }}>{value}</p>
          {sub && <p style={{ color:trend==='up'?'#2e7d52':trend==='down'?'#c0392b':'#a08880', fontSize:'0.74rem', margin:0, fontWeight:'600' }}>{trend==='up'?'▲':trend==='down'?'▼':''} {sub}</p>}
        </div>
        <div style={{ width:'48px', height:'48px', background:color, borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', opacity:0.85 }}>{icon}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('overview');
  const [suggestions, setSuggestions] = useState([]);
  const [updatingId, setUpdatingId]   = useState(null);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [eventsRes, bookingsRes] = await Promise.all([
        API.get('/events'),
        API.get('/bookings/all/bookings'),
      ]);
      const events   = eventsRes.data?.events   || eventsRes.data   || [];
      const bookings = bookingsRes.data?.bookings || bookingsRes.data || [];

      const paidBookings      = bookings.filter(b => b.paymentStatus==='paid' || b.status==='confirmed');
      const totalRevenue      = paidBookings.reduce((s,b)=>s+(b.totalAmount||b.totalPrice||b.amount||0),0);
      const confirmedBookings = bookings.filter(b=>b.status==='confirmed');
      const cancelledBookings = bookings.filter(b=>b.status==='cancelled');
      const pendingBookings   = bookings.filter(b=>b.status==='pending');

      const now = new Date();
      const monthlyData = {};
      for (let i=5;i>=0;i--) {
        const d = new Date(now.getFullYear(),now.getMonth()-i,1);
        monthlyData[d.toLocaleString('default',{month:'short',year:'2-digit'})] = 0;
      }
      paidBookings.forEach(b=>{
        const key = new Date(b.createdAt||b.bookingDate).toLocaleString('default',{month:'short',year:'2-digit'});
        if (monthlyData[key]!==undefined) monthlyData[key]+=(b.totalAmount||b.totalPrice||b.amount||0);
      });

      const thisMonthKey    = now.toLocaleString('default',{month:'short',year:'2-digit'});
      const lastMonthKey    = new Date(now.getFullYear(),now.getMonth()-1,1).toLocaleString('default',{month:'short',year:'2-digit'});
      const thisMonthRev    = monthlyData[thisMonthKey]||0;
      const lastMonthRev    = monthlyData[lastMonthKey]||0;
      const momGrowth       = lastMonthRev>0?(((thisMonthRev-lastMonthRev)/lastMonthRev)*100).toFixed(1):0;
      const thisMonthCost   = thisMonthRev*0.30;
      const thisMonthProfit = thisMonthRev-thisMonthCost;
      const totalCost       = totalRevenue*0.30;
      const totalProfit     = totalRevenue-totalCost;
      const TARGET_MONTHLY  = 50000;
      const targetAchieved  = Math.min((thisMonthRev/TARGET_MONTHLY)*100,100).toFixed(0);
      const catMap={};
      events.forEach(e=>{ catMap[e.category]=(catMap[e.category]||0)+1; });

      try {
        const sugRes = await API.get('/suggestions');
        setSuggestions(sugRes.data||[]);
      } catch { setSuggestions([]); }

      setData({
        events, bookings, totalRevenue, totalCost, totalProfit,
        confirmedBookings, cancelledBookings, pendingBookings,
        monthlyData, catMap, TARGET_MONTHLY,
        thisMonthRev, thisMonthCost, thisMonthProfit,
        isProfit: thisMonthProfit>=0, totalIsProfit: totalProfit>=0,
        targetAchieved, momGrowth,
        totalUsers: [...new Set(bookings.map(b=>String(b.userId||b.user)))].filter(Boolean).length,
      });
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await API.patch(`/suggestions/${id}`, { status });
      setSuggestions(prev=>prev.map(s=>s._id===id?{...s,status}:s));
    } catch { alert('Failed to update'); }
    finally { setUpdatingId(null); }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:'1rem' }}>
      <div style={{ fontSize:'3rem' }}>🌸</div>
      <p style={{ color:'#a08880', fontWeight:'600' }}>Loading dashboard...</p>
    </div>
  );
  if (!data) return <div style={{ padding:'2rem', color:'#a05040' }}>❌ Failed to load.</div>;

  const pendingSug = suggestions.filter(s=>s.status==='pending').length;

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", padding:'2.5rem', background:'#fdf8f6', minHeight:'100vh', overflowY:'auto' }}>
      <style>{CSS}</style>
      <div style={{ marginBottom:'2.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 style={{ color:'#2d1f1f', fontWeight:'800', fontSize:'2.2rem', margin:'0 0 6px', fontFamily:"'Cormorant Garamond',serif" }}>📊 Admin Dashboard</h1>
          <p style={{ color:'#a08880', fontSize:'0.88rem', margin:0 }}>📅 {new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
        </div>
        <button onClick={fetchDashboard} style={{ background:'linear-gradient(135deg,#c9a99a,#b8887a)', color:'white', border:'none', padding:'10px 22px', borderRadius:'14px', cursor:'pointer', fontWeight:'700', fontSize:'0.86rem', boxShadow:'0 4px 14px rgba(201,169,154,0.4)' }}>🔄 Refresh</button>
      </div>

      <div style={{ display:'flex', gap:'10px', marginBottom:'2.5rem', flexWrap:'wrap' }}>
        {[
          {id:'overview',    label:'🏠 Overview'},
          {id:'revenue',     label:'💰 Revenue'},
          {id:'events',      label:'🎭 Events'},
          {id:'suggestions', label:`💡 Ideas${pendingSug>0?` (${pendingSug})`:''}`},
        ].map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ padding:'10px 24px', borderRadius:'20px', border:'none', cursor:'pointer', fontWeight:'700', fontSize:'0.86rem', transition:'all 0.2s ease', background:activeTab===tab.id?'linear-gradient(135deg,#c9a99a,#b8887a)':'white', color:activeTab===tab.id?'white':'#a08880', boxShadow:activeTab===tab.id?'0 4px 14px rgba(201,169,154,0.4)':'0 2px 8px rgba(0,0,0,0.06)' }}>{tab.label}</button>
        ))}
      </div>

      {activeTab==='overview' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.5rem', marginBottom:'3rem' }}>
            <StatCard icon="💰" label="Total Revenue"  value={`₹${data.totalRevenue.toLocaleString()}`}  sub={`${data.momGrowth>=0?'+':''}${data.momGrowth}% vs last month`} trend={data.momGrowth>=0?'up':'down'} color="#c9a99a" />
            <StatCard icon="🎫" label="Total Bookings" value={data.bookings.length}                      sub={`${data.confirmedBookings.length} confirmed`} trend="up" color="#9ab8c9" />
            <StatCard icon="🎭" label="Total Events"   value={data.events.length}                        sub={`${data.events.filter(e=>new Date(e.date)>new Date()).length} upcoming`} color="#c9b89a" />
            <StatCard icon="👥" label="Total Users"    value={data.totalUsers}                           sub="registered users" color="#b8c9a9" />
            <StatCard icon="❌" label="Cancellations"  value={data.cancelledBookings.length}             sub={`${((data.cancelledBookings.length/Math.max(data.bookings.length,1))*100).toFixed(0)}% rate`} trend="down" color="#c9a9a9" />
            <StatCard icon="⏳" label="Pending"        value={data.pendingBookings.length}               sub="awaiting confirmation" color="#c9c9a9" />
          </div>
          <h2 style={{ color:'#2d1f1f', fontWeight:'700', fontSize:'1.2rem', margin:'0 0 1.5rem', fontFamily:"'Cormorant Garamond',serif" }}>📊 Monthly Revenue</h2>
          <div style={{ background:'white', borderRadius:'24px', padding:'2.5rem', boxShadow:'0 4px 24px rgba(0,0,0,0.07)', border:'1px solid #f0ddd7', marginBottom:'3rem' }}><BarChart monthlyData={data.monthlyData} /></div>
          <h2 style={{ color:'#2d1f1f', fontWeight:'700', fontSize:'1.2rem', margin:'0 0 1.5rem', fontFamily:"'Cormorant Garamond',serif" }}>📈 P&L Overview</h2>
          <div style={{ background:'white', borderRadius:'24px', padding:'2.5rem', boxShadow:'0 4px 24px rgba(0,0,0,0.07)', border:'1px solid #f0ddd7', marginBottom:'3rem' }}><PLChart monthlyData={data.monthlyData} /></div>
          <h2 style={{ color:'#2d1f1f', fontWeight:'700', fontSize:'1.2rem', margin:'0 0 1.5rem', fontFamily:"'Cormorant Garamond',serif" }}>🎯 This Month Target</h2>
          <div style={{ background:'white', borderRadius:'24px', padding:'2.5rem', boxShadow:'0 4px 24px rgba(0,0,0,0.07)', border:'1px solid #f0ddd7', marginBottom:'3rem' }}><TargetGauge current={data.thisMonthRev} target={data.TARGET_MONTHLY} /></div>
          <h2 style={{ color:'#2d1f1f', fontWeight:'700', fontSize:'1.2rem', margin:'0 0 1.5rem', fontFamily:"'Cormorant Garamond',serif" }}>Overall P&L</h2>
          <div style={{ background:data.totalIsProfit?'linear-gradient(135deg,#edf7f0,#d4edda)':'linear-gradient(135deg,#fdeee9,#fad4cc)', borderRadius:'20px', padding:'2rem', border:`1px solid ${data.totalIsProfit?'#b8ddc8':'#f0c4b8'}`, marginBottom:'2rem' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1.5rem' }}>
              <div style={{ display:'flex', gap:'3rem', flexWrap:'wrap' }}>
                {[
                  {k:'GROSS REVENUE',    v:`₹${data.totalRevenue.toLocaleString()}`,                                                                     c:'#2d1f1f'},
                  {k:'TOTAL COST (30%)', v:`- ₹${Math.round(data.totalCost).toLocaleString()}`,                                                           c:'#c0392b'},
                  {k:`NET ${data.totalIsProfit?'PROFIT':'LOSS'}`, v:`₹${Math.abs(Math.round(data.totalProfit)).toLocaleString()}`, c:data.totalIsProfit?'#2e7d52':'#c0392b'},
                ].map(item=>(
                  <div key={item.k}>
                    <p style={{ color:'#a08880', fontSize:'0.7rem', margin:'0 0 6px', fontWeight:'700', letterSpacing:'0.5px' }}>{item.k}</p>
                    <p style={{ color:item.c, fontWeight:'800', fontSize:'1.3rem', margin:0 }}>{item.v}</p>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:'4rem' }}>{data.totalIsProfit?'💹':'📉'}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab==='revenue' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.5rem', marginBottom:'3rem' }}>
            {[
              {label:'This Month Revenue', val:`₹${data.thisMonthRev.toLocaleString()}`,                                          color:'#b8887a', bg:'#fdf0eb'},
              {label:data.isProfit?'Profit':'Loss', val:`₹${Math.round(Math.abs(data.thisMonthProfit)).toLocaleString()}`,         color:data.isProfit?'#2e7d52':'#c0392b', bg:data.isProfit?'#edf7f0':'#fdeee9'},
              {label:'This Month Cost',    val:`₹${Math.round(data.thisMonthCost).toLocaleString()}`,                             color:'#8a7040', bg:'#fef9ec'},
            ].map((item,i)=>(
              <div key={i} style={{ background:item.bg, borderRadius:'20px', padding:'1.8rem', border:'1px solid #f0ddd7', textAlign:'center' }}>
                <p style={{ color:'#a08880', fontSize:'0.76rem', fontWeight:'700', margin:'0 0 12px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{item.label}</p>
                <p style={{ color:item.color, fontSize:'2.2rem', fontWeight:'800', margin:0, fontFamily:"'Cormorant Garamond',serif" }}>{item.val}</p>
              </div>
            ))}
          </div>
          <h2 style={{ color:'#2d1f1f', fontWeight:'700', fontSize:'1.2rem', margin:'0 0 1.5rem', fontFamily:"'Cormorant Garamond',serif" }}>📊 Revenue Chart</h2>
          <div style={{ background:'white', borderRadius:'24px', padding:'2.5rem', boxShadow:'0 4px 24px rgba(0,0,0,0.07)', border:'1px solid #f0ddd7', marginBottom:'3rem' }}><BarChart monthlyData={data.monthlyData} /></div>
          <h2 style={{ color:'#2d1f1f', fontWeight:'700', fontSize:'1.2rem', margin:'0 0 1.5rem', fontFamily:"'Cormorant Garamond',serif" }}>📈 P&L Chart</h2>
          <div style={{ background:'white', borderRadius:'24px', padding:'2.5rem', boxShadow:'0 4px 24px rgba(0,0,0,0.07)', border:'1px solid #f0ddd7', marginBottom:'3rem' }}><PLChart monthlyData={data.monthlyData} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'2rem' }}>
            <div style={{ background:'white', borderRadius:'20px', padding:'2rem', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:'1px solid #f0ddd7' }}>
              <h3 style={{ color:'#2d1f1f', fontWeight:'700', marginBottom:'1.5rem', fontSize:'1.05rem' }}>💰 Overall Breakdown</h3>
              {[
                {label:'Gross Revenue',     val:`₹${data.totalRevenue.toLocaleString()}`,                               color:'#2e7d52'},
                {label:'Operational (30%)', val:`₹${Math.round(data.totalCost).toLocaleString()}`,                      color:'#c0392b'},
                {label:data.totalIsProfit?'Net Profit ✅':'Net Loss ❌', val:`₹${Math.abs(Math.round(data.totalProfit)).toLocaleString()}`, color:data.totalIsProfit?'#2e7d52':'#c0392b'},
              ].map((item,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'16px 0', borderBottom:i<2?'1px solid #f0ddd7':'none' }}>
                  <span style={{ color:'#6b5a55', fontSize:'0.88rem' }}>{item.label}</span>
                  <span style={{ color:item.color, fontWeight:'700', fontSize:'0.92rem' }}>{item.val}</span>
                </div>
              ))}
            </div>
            <div style={{ background:'white', borderRadius:'20px', padding:'2rem', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:'1px solid #f0ddd7' }}>
              <h3 style={{ color:'#2d1f1f', fontWeight:'700', marginBottom:'1.5rem', fontSize:'1.05rem' }}>🎯 Target Analysis</h3>
              {[
                {label:'Monthly Target',    val:`₹${data.TARGET_MONTHLY.toLocaleString()}`},
                {label:'This Month Earned', val:`₹${data.thisMonthRev.toLocaleString()}`},
                {label:'Achievement',       val:`${data.targetAchieved}%`, color:data.targetAchieved>=100?'#2e7d52':'#c9a99a'},
                {label:'Remaining',         val:`₹${Math.max(0,data.TARGET_MONTHLY-data.thisMonthRev).toLocaleString()}`, color:'#c0392b'},
                {label:'MoM Growth',        val:`${data.momGrowth>=0?'+':''}${data.momGrowth}%`, color:data.momGrowth>=0?'#2e7d52':'#c0392b'},
              ].map((item,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'14px 0', borderBottom:i<4?'1px solid #f0ddd7':'none' }}>
                  <span style={{ color:'#6b5a55', fontSize:'0.86rem' }}>{item.label}</span>
                  <span style={{ color:item.color||'#2d1f1f', fontWeight:'700', fontSize:'0.88rem' }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab==='events' && (
        <div>
          <h2 style={{ color:'#2d1f1f', fontWeight:'700', fontSize:'1.2rem', margin:'0 0 1.5rem', fontFamily:"'Cormorant Garamond',serif" }}>🎭 Events by Category</h2>
          <div style={{ background:'white', borderRadius:'20px', padding:'2rem', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:'1px solid #f0ddd7', marginBottom:'3rem' }}>
            {Object.entries(data.catMap).map(([cat,count])=>{
              const pct=(count/data.events.length)*100;
              return (
                <div key={cat} style={{ marginBottom:'18px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                    <span style={{ color:'#6b5a55', fontSize:'0.86rem', fontWeight:'600' }}>{cat}</span>
                    <span style={{ color:'#a08880', fontSize:'0.84rem' }}>{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div style={{ height:'10px', background:'#f0ddd7', borderRadius:'5px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#c9a99a,#b8887a)', borderRadius:'5px', transition:'width 0.8s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
          <h2 style={{ color:'#2d1f1f', fontWeight:'700', fontSize:'1.2rem', margin:'0 0 1.5rem', fontFamily:"'Cormorant Garamond',serif" }}>🏆 All Events</h2>
          <div style={{ background:'white', borderRadius:'20px', padding:'2rem', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:'1px solid #f0ddd7', marginBottom:'2rem' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {data.events.map((event,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'16px', padding:'16px 18px', background:'#fdf8f6', borderRadius:'16px', border:'1px solid #f0ddd7' }}>
                  <div style={{ width:'46px', height:'46px', background:'linear-gradient(135deg,#c9a99a,#b8887a)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'700', fontSize:'0.9rem', flexShrink:0 }}>{i+1}</div>
                  <div style={{ flex:1 }}>
                    <p style={{ color:'#2d1f1f', fontWeight:'600', margin:'0 0 5px', fontSize:'0.92rem' }}>{event.name}</p>
                    <p style={{ color:'#a08880', fontSize:'0.78rem', margin:0 }}>{event.category} • {new Date(event.date).toDateString()} • ₹{event.price}</p>
                  </div>
                  <span style={{ padding:'5px 14px', borderRadius:'20px', fontSize:'0.74rem', fontWeight:'700', background:new Date(event.date)>new Date()?'#edf7f0':'#fdeee9', color:new Date(event.date)>new Date()?'#2e7d52':'#c0392b' }}>{new Date(event.date)>new Date()?'Upcoming':'Past'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab==='suggestions' && (
        <div>
          <div style={{ display:'flex', gap:'10px', marginBottom:'2rem', flexWrap:'wrap' }}>
            {[
              {label:'All',      count:suggestions.length,                                  color:'#a08880'},
              {label:'Pending',  count:suggestions.filter(s=>s.status==='pending').length,  color:'#8a7040'},
              {label:'Approved', count:suggestions.filter(s=>s.status==='approved').length, color:'#2e7d52'},
              {label:'Rejected', count:suggestions.filter(s=>s.status==='rejected').length, color:'#c0392b'},
            ].map(item=>(
              <span key={item.label} style={{ padding:'7px 16px', borderRadius:'20px', background:'#fdf0eb', color:item.color, fontSize:'0.78rem', fontWeight:'700' }}>{item.label}: {item.count}</span>
            ))}
          </div>
          <div style={{ background:'white', borderRadius:'20px', padding:'2rem', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:'1px solid #f0ddd7' }}>
            {suggestions.length===0 ? (
              <div style={{ textAlign:'center', padding:'4rem', color:'#a08880' }}>
                <div style={{ fontSize:'3.5rem', marginBottom:'1rem' }}>💡</div>
                <p style={{ fontWeight:'600', fontSize:'1rem' }}>No suggestions yet!</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
                {suggestions.map(s=>(
                  <div key={s._id} style={{ padding:'1.6rem', background:'#fdf8f6', borderRadius:'16px', border:`1px solid ${s.status==='approved'?'#b8ddc8':s.status==='rejected'?'#f0c4b8':'#f0ddd7'}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px', flexWrap:'wrap', gap:'8px' }}>
                      <div>
                        <h4 style={{ color:'#2d1f1f', fontWeight:'700', margin:'0 0 8px', fontSize:'0.97rem' }}>{s.title}</h4>
                        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                          <span style={{ background:'#fdf0eb', color:'#b8887a', padding:'4px 12px', borderRadius:'20px', fontSize:'0.72rem', fontWeight:'600' }}>{s.category}</span>
                          <span style={{ padding:'4px 12px', borderRadius:'20px', fontSize:'0.72rem', fontWeight:'700', background:s.status==='approved'?'#edf7f0':s.status==='rejected'?'#fdeee9':'#fef9ec', color:s.status==='approved'?'#2e7d52':s.status==='rejected'?'#c0392b':'#8a7040' }}>{s.status?.toUpperCase()}</span>
                        </div>
                      </div>
                      <span style={{ color:'#a08880', fontSize:'0.78rem' }}>{new Date(s.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <p style={{ color:'#6b5a55', fontSize:'0.86rem', margin:'10px 0 16px', lineHeight:'1.7' }}>{s.description}</p>
                    {s.status==='pending' && (
                      <div style={{ display:'flex', gap:'10px' }}>
                        <button onClick={()=>updateStatus(s._id,'approved')} disabled={updatingId===s._id} style={{ padding:'9px 20px', background:'linear-gradient(135deg,#4caf50,#2e7d52)', color:'white', border:'none', borderRadius:'12px', cursor:'pointer', fontWeight:'700', fontSize:'0.82rem' }}>✅ Approve</button>
                        <button onClick={()=>updateStatus(s._id,'rejected')} disabled={updatingId===s._id} style={{ padding:'9px 20px', background:'#fdeee9', color:'#c0392b', border:'1px solid #f0c4b8', borderRadius:'12px', cursor:'pointer', fontWeight:'700', fontSize:'0.82rem' }}>❌ Reject</button>
                      </div>
                    )}
                    {s.status!=='pending' && (
                      <button onClick={()=>updateStatus(s._id,'pending')} style={{ padding:'7px 16px', background:'white', color:'#a08880', border:'1px solid #f0ddd7', borderRadius:'10px', cursor:'pointer', fontWeight:'600', fontSize:'0.78rem' }}>🔄 Reset</button>
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