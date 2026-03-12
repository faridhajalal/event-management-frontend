import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/axios';

const ANIM_CSS = `
  @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes success { 0%{transform:scale(0) rotate(-15deg);opacity:0} 60%{transform:scale(1.2) rotate(5deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
  @keyframes slideIn { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
`;

function detectBrand(num) {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return { label: 'VISA', color: '#1a1f71' };
  if (/^5[1-5]/.test(n)) return { label: 'MC', color: '#eb001b' };
  if (/^6/.test(n)) return { label: 'RuPay', color: '#097939' };
  if (/^3[47]/.test(n)) return { label: 'AMEX', color: '#007cc3' };
  return { label: '', color: '#c9a99a' };
}

function formatCard(v) { return v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim(); }
function formatExpiry(v) { const c=v.replace(/\D/g,'').slice(0,4); return c.length>=2?c.slice(0,2)+'/'+c.slice(2):c; }

// ── LIVE CARD PREVIEW ──
function CardPreview({ number, name, expiry, cvv, showBack }) {
  const brand = detectBrand(number);
  const display = (number || '').padEnd(19,'•').slice(0,19);
  return (
    <div style={{ perspective:'1000px', width:'100%', height:'170px', marginBottom:'1.5rem' }}>
      <div style={{ position:'relative', width:'100%', height:'100%', transformStyle:'preserve-3d', transition:'transform 0.5s ease', transform: showBack ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        {/* Front */}
        <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', borderRadius:'16px', padding:'1.2rem 1.5rem', background:`linear-gradient(135deg, ${brand.color} 0%, #2d1f1f 100%)`, boxShadow:'0 15px 40px rgba(45,31,31,0.4)', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'-40px', right:'-30px', width:'150px', height:'150px', borderRadius:'50%', background:'rgba(255,255,255,0.07)' }} />
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem' }}>
            <div style={{ width:'36px', height:'26px', background:'linear-gradient(135deg,#f4d03f,#c9a000)', borderRadius:'4px' }} />
            <span style={{ color:'white', fontWeight:'800', fontSize:'0.95rem', letterSpacing:'2px', opacity:0.9 }}>{brand.label || '💳'}</span>
          </div>
          <p style={{ color:'rgba(255,255,255,0.9)', fontSize:'1.05rem', letterSpacing:'3px', fontFamily:'monospace', fontWeight:'600', margin:'0 0 1rem' }}>{display}</p>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <div>
              <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.55rem', letterSpacing:'2px', margin:'0 0 2px' }}>CARD HOLDER</p>
              <p style={{ color:'white', fontSize:'0.78rem', fontWeight:'600', margin:0, letterSpacing:'1px' }}>{name || 'YOUR NAME'}</p>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.55rem', letterSpacing:'2px', margin:'0 0 2px' }}>EXPIRES</p>
              <p style={{ color:'white', fontSize:'0.78rem', fontWeight:'600', margin:0, fontFamily:'monospace' }}>{expiry || 'MM/YY'}</p>
            </div>
          </div>
        </div>
        {/* Back */}
        <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', transform:'rotateY(180deg)', borderRadius:'16px', background:`linear-gradient(135deg, #2d1f1f, ${brand.color})`, boxShadow:'0 15px 40px rgba(45,31,31,0.4)' }}>
          <div style={{ height:'38px', background:'rgba(0,0,0,0.4)', margin:'1.2rem 0 0.8rem' }} />
          <div style={{ padding:'0 1.2rem', display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ flex:1, height:'30px', background:'rgba(255,255,255,0.12)', borderRadius:'3px' }} />
            <div style={{ background:'white', borderRadius:'6px', padding:'5px 12px', fontFamily:'monospace', fontSize:'0.95rem', fontWeight:'800', color:'#2d1f1f', minWidth:'44px', textAlign:'center' }}>{cvv || '•••'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const UPI_APPS = [
  { name:'GPay',    emoji:'🟢', color:'#34a853' },
  { name:'PhonePe', emoji:'🟣', color:'#5f259f' },
  { name:'Paytm',   emoji:'🔵', color:'#00b9f1' },
  { name:'BHIM',    emoji:'🔶', color:'#ff6600' },
];

const BANKS = ['SBI','HDFC','ICICI','Axis','Kotak','PNB'];

// ── PAYMENT MODAL ──────────────────────────────────────────
function PaymentModal({ booking, onClose, onSuccess }) {
  const [method, setMethod] = useState('card');
  const [payStep, setPayStep] = useState('form'); // form | processing | success
  const [showBack, setShowBack] = useState(false);
  const [txnId, setTxnId] = useState('');

  // card
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry]   = useState('');
  const [cvv, setCvv]         = useState('');

  // upi
  const [upiApp, setUpiApp] = useState('');
  const [upiId,  setUpiId]  = useState('');

  // netbanking
  const [bank, setBank] = useState('');

  const [errors, setErrors] = useState({});

  const totalAmount   = booking.totalAmount || 0;
  const convenience   = Math.round(totalAmount * 0.02);
  const grandTotal    = totalAmount + convenience;

  const validate = () => {
    const e = {};
    if (method === 'card') {
      if (cardNum.replace(/\s/g,'').length < 16) e.cardNum = 'Enter valid 16-digit number';
      if (!cardName.trim()) e.cardName = 'Enter cardholder name';
      if (expiry.length < 5) e.expiry = 'Enter MM/YY';
      if (cvv.length < 3) e.cvv = 'Enter CVV';
    }
    if (method === 'upi' && !upiApp && !upiId) e.upi = 'Select UPI app or enter UPI ID';
    if (method === 'upi' && upiId && !upiId.includes('@')) e.upi = 'Enter valid UPI ID';
    if (method === 'netbanking' && !bank) e.bank = 'Select your bank';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setPayStep('processing');
    await new Promise(r => setTimeout(r, 2500));
    const tid = 'TXN' + Date.now();
    setTxnId(tid);
    try {
      await API.post('/payments', {
        booking: booking._id,
        amount: grandTotal,
        paymentMethod: method,
        transactionId: tid,
        status: 'success',
      });
    } catch {}
    setPayStep('success');
  };

  const inp = (err) => ({
    width:'100%', padding:'11px 14px', border:`1.5px solid ${err?'#e74c3c':'#f0ddd7'}`,
    borderRadius:'10px', outline:'none', fontSize:'0.87rem', fontFamily:"'DM Sans',sans-serif",
    background:'#fdf8f6', color:'#2d1f1f', boxSizing:'border-box', transition:'border-color 0.2s',
  });
  const lbl = { color:'#8a6a65', fontSize:'0.7rem', fontWeight:'700', letterSpacing:'0.5px', marginBottom:'5px', display:'block' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(45,31,31,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9000, padding:'1rem', backdropFilter:'blur(4px)' }}
      onClick={e => { if(e.target === e.currentTarget && payStep !== 'processing') onClose(); }}>
      <style>{ANIM_CSS}</style>

      <div style={{ background:'white', borderRadius:'24px', width:'100%', maxWidth:'520px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 30px 80px rgba(45,31,31,0.4)', animation:'fadeUp 0.35s ease' }}>

        {/* ── SUCCESS ── */}
        {payStep === 'success' && (
          <div style={{ padding:'2.5rem', textAlign:'center' }}>
            <div style={{ width:'70px', height:'70px', background:'linear-gradient(135deg,#4ade80,#22c55e)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.2rem', fontSize:'1.8rem', boxShadow:'0 10px 25px rgba(74,222,128,0.35)', animation:'success 0.5s ease forwards' }}>✓</div>
            <h2 style={{ color:'#2d1f1f', fontSize:'1.5rem', fontWeight:'800', margin:'0 0 0.3rem', fontFamily:"'Cormorant Garamond',serif" }}>Payment Successful! 🌸</h2>
            <p style={{ color:'#a08880', fontSize:'0.84rem', margin:'0 0 1.5rem' }}>Booking confirmed!</p>
            <div style={{ background:'#fdf0eb', borderRadius:'14px', padding:'1.2rem', textAlign:'left', marginBottom:'1.5rem' }}>
              {[['Event', booking.event?.name],['Tickets', booking.numberOfTickets],['Amount', `₹${totalAmount}`],['Fee', `₹${convenience}`],['Total Paid', `₹${grandTotal}`],['Method', method.toUpperCase()],['Txn ID', txnId],['Status','✅ SUCCESS']].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #f5e8e3' }}>
                  <span style={{ color:'#a08880', fontSize:'0.77rem' }}>{k}</span>
                  <span style={{ color:'#2d1f1f', fontSize:'0.78rem', fontWeight:'700', maxWidth:'55%', textAlign:'right', wordBreak:'break-all' }}>{v}</span>
                </div>
              ))}
            </div>
            <button onClick={() => { onSuccess(); onClose(); }}
              style={{ width:'100%', padding:'13px', background:'linear-gradient(135deg,#c9a99a,#b8887a)', color:'white', border:'none', borderRadius:'12px', cursor:'pointer', fontWeight:'700', fontSize:'0.92rem', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 6px 20px rgba(201,169,154,0.4)' }}>
              Done 🎉
            </button>
          </div>
        )}

        {/* ── PROCESSING ── */}
        {payStep === 'processing' && (
          <div style={{ padding:'3rem', textAlign:'center' }}>
            <div style={{ width:'60px', height:'60px', border:'4px solid #f0ddd7', borderTopColor:'#c9a99a', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 1.2rem' }} />
            <h3 style={{ color:'#2d1f1f', fontWeight:'700', margin:'0 0 0.4rem' }}>Processing Payment...</h3>
            <p style={{ color:'#a08880', fontSize:'0.84rem' }}>Please wait 🌸</p>
          </div>
        )}

        {/* ── FORM ── */}
        {payStep === 'form' && (
          <div style={{ padding:'1.8rem' }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem', paddingBottom:'1.2rem', borderBottom:'1px solid #f5e8e3' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'40px', height:'40px', background:'linear-gradient(135deg,#c9a99a,#b8887a)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>💳</div>
                <div>
                  <h2 style={{ color:'#2d1f1f', margin:0, fontWeight:'800', fontSize:'1.05rem' }}>Secure Checkout</h2>
                  <p style={{ color:'#a08880', margin:0, fontSize:'0.72rem' }}>🔒 256-bit SSL encrypted</p>
                </div>
              </div>
              <button onClick={onClose} style={{ background:'#f5e8e3', border:'none', width:'32px', height:'32px', borderRadius:'50%', cursor:'pointer', color:'#a08880', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>

            {/* Order mini summary */}
            <div style={{ background:'#fdf0eb', borderRadius:'12px', padding:'12px 16px', marginBottom:'1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ color:'#2d1f1f', fontWeight:'700', fontSize:'0.88rem', margin:'0 0 2px' }}>{booking.event?.name}</p>
                <p style={{ color:'#a08880', fontSize:'0.74rem', margin:0 }}>🎫 {booking.numberOfTickets} ticket{booking.numberOfTickets>1?'s':''} • ₹{totalAmount} + ₹{convenience} fee</p>
              </div>
              <span style={{ color:'#b8887a', fontWeight:'800', fontSize:'1.1rem' }}>₹{grandTotal}</span>
            </div>

            {/* Method Tabs */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px', marginBottom:'1.5rem' }}>
              {[{id:'card',icon:'💳',label:'Card'},{id:'upi',icon:'📱',label:'UPI'},{id:'netbanking',icon:'🏦',label:'Net Banking'}].map(m => (
                <button key={m.id} onClick={() => { setMethod(m.id); setErrors({}); }}
                  style={{ padding:'10px 6px', border:`2px solid ${method===m.id?'#c9a99a':'#f0ddd7'}`, borderRadius:'12px', background:method===m.id?'#fdf0eb':'white', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s' }}>
                  <div style={{ fontSize:'1.1rem', marginBottom:'3px' }}>{m.icon}</div>
                  <div style={{ fontSize:'0.72rem', fontWeight:'700', color:method===m.id?'#b8887a':'#8a6a65' }}>{m.label}</div>
                </button>
              ))}
            </div>

            {/* ── CARD ── */}
            {method === 'card' && (
              <div style={{ animation:'slideIn 0.3s ease' }}>
                <CardPreview number={cardNum} name={cardName} expiry={expiry} cvv={cvv} showBack={showBack} />
                <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                  <div>
                    <label style={lbl}>CARD NUMBER</label>
                    <input value={cardNum} onChange={e=>setCardNum(formatCard(e.target.value))} placeholder="1234 5678 9012 3456"
                      style={{...inp(errors.cardNum),letterSpacing:'2px',fontFamily:'monospace'}}
                      onFocus={e=>{e.target.style.borderColor='#c9a99a';setShowBack(false);}}
                      onBlur={e=>e.target.style.borderColor=errors.cardNum?'#e74c3c':'#f0ddd7'} />
                    {errors.cardNum && <p style={{color:'#e74c3c',fontSize:'0.68rem',margin:'3px 0 0'}}>{errors.cardNum}</p>}
                  </div>
                  <div>
                    <label style={lbl}>NAME ON CARD</label>
                    <input value={cardName} onChange={e=>setCardName(e.target.value.toUpperCase())} placeholder="YOUR NAME"
                      style={{...inp(errors.cardName),textTransform:'uppercase',letterSpacing:'1px'}}
                      onFocus={e=>{e.target.style.borderColor='#c9a99a';setShowBack(false);}}
                      onBlur={e=>e.target.style.borderColor=errors.cardName?'#e74c3c':'#f0ddd7'} />
                    {errors.cardName && <p style={{color:'#e74c3c',fontSize:'0.68rem',margin:'3px 0 0'}}>{errors.cardName}</p>}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                    <div>
                      <label style={lbl}>EXPIRY</label>
                      <input value={expiry} onChange={e=>setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY"
                        style={{...inp(errors.expiry),fontFamily:'monospace',letterSpacing:'2px'}}
                        onFocus={e=>{e.target.style.borderColor='#c9a99a';setShowBack(false);}}
                        onBlur={e=>e.target.style.borderColor=errors.expiry?'#e74c3c':'#f0ddd7'} />
                      {errors.expiry && <p style={{color:'#e74c3c',fontSize:'0.68rem',margin:'3px 0 0'}}>{errors.expiry}</p>}
                    </div>
                    <div>
                      <label style={lbl}>CVV</label>
                      <input value={cvv} onChange={e=>setCvv(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="•••" type="password"
                        style={{...inp(errors.cvv),letterSpacing:'4px',fontFamily:'monospace'}}
                        onFocus={e=>{e.target.style.borderColor='#c9a99a';setShowBack(true);}}
                        onBlur={e=>{e.target.style.borderColor=errors.cvv?'#e74c3c':'#f0ddd7';setShowBack(false);}} />
                      {errors.cvv && <p style={{color:'#e74c3c',fontSize:'0.68rem',margin:'3px 0 0'}}>{errors.cvv}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── UPI ── */}
            {method === 'upi' && (
              <div style={{ animation:'slideIn 0.3s ease' }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px', marginBottom:'1.2rem' }}>
                  {UPI_APPS.map(app => (
                    <button key={app.name} onClick={()=>{setUpiApp(app.name);setUpiId('');setErrors({});}}
                      style={{ padding:'14px 6px', border:`2px solid ${upiApp===app.name?app.color:'#f0ddd7'}`, borderRadius:'12px', background:upiApp===app.name?`${app.color}18`:'white', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s' }}>
                      <div style={{fontSize:'1.4rem',marginBottom:'4px'}}>{app.emoji}</div>
                      <div style={{fontSize:'0.68rem',fontWeight:'700',color:upiApp===app.name?app.color:'#8a6a65'}}>{app.name}</div>
                    </button>
                  ))}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'1rem' }}>
                  <div style={{flex:1,height:'1px',background:'#f0ddd7'}} />
                  <span style={{color:'#c0a0a0',fontSize:'0.72rem'}}>OR ENTER UPI ID</span>
                  <div style={{flex:1,height:'1px',background:'#f0ddd7'}} />
                </div>
                <div>
                  <label style={lbl}>UPI ID</label>
                  <input value={upiId} onChange={e=>{setUpiId(e.target.value);setUpiApp('');setErrors({});}} placeholder="name@paytm / name@gpay"
                    style={inp(errors.upi)}
                    onFocus={e=>e.target.style.borderColor='#c9a99a'}
                    onBlur={e=>e.target.style.borderColor=errors.upi?'#e74c3c':'#f0ddd7'} />
                  {errors.upi && <p style={{color:'#e74c3c',fontSize:'0.68rem',margin:'3px 0 0'}}>{errors.upi}</p>}
                </div>
              </div>
            )}

            {/* ── NET BANKING ── */}
            {method === 'netbanking' && (
              <div style={{ animation:'slideIn 0.3s ease' }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'1rem' }}>
                  {BANKS.map(b => (
                    <button key={b} onClick={()=>{setBank(b);setErrors({});}}
                      style={{ padding:'12px 6px', border:`2px solid ${bank===b?'#c9a99a':'#f0ddd7'}`, borderRadius:'12px', background:bank===b?'#fdf0eb':'white', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s' }}>
                      <div style={{fontSize:'1.3rem',marginBottom:'3px'}}>🏦</div>
                      <div style={{fontSize:'0.7rem',fontWeight:'700',color:bank===b?'#b8887a':'#8a6a65'}}>{b}</div>
                    </button>
                  ))}
                </div>
                {errors.bank && <p style={{color:'#e74c3c',fontSize:'0.68rem'}}>{errors.bank}</p>}
                {bank && <div style={{background:'#fdf0eb',borderRadius:'10px',padding:'10px 14px',display:'flex',alignItems:'center',gap:'8px',animation:'fadeUp 0.3s ease'}}><span>🏦</span><span style={{color:'#b8887a',fontWeight:'600',fontSize:'0.82rem'}}>{bank} selected</span></div>}
              </div>
            )}

            {/* Pay Button */}
            <button onClick={handlePay}
              style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg,#c9a99a,#b8887a)', color:'white', border:'none', borderRadius:'14px', cursor:'pointer', fontWeight:'800', fontSize:'0.95rem', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 8px 25px rgba(201,169,154,0.45)', marginTop:'1.5rem', transition:'all 0.2s' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 12px 30px rgba(201,169,154,0.55)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 8px 25px rgba(201,169,154,0.45)';}}>
              🔒 Pay ₹{grandTotal.toLocaleString('en-IN')} Securely
            </button>

            <div style={{ display:'flex', justifyContent:'center', gap:'1.2rem', marginTop:'0.8rem', flexWrap:'wrap' }}>
              {['🔒 SSL Secure','✅ PCI Compliant','🛡️ Fraud Protected'].map(b=>(
                <span key={b} style={{color:'#c0a0a0',fontSize:'0.67rem',fontWeight:'600'}}>{b}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────
function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await API.get('/bookings/my');
      setBookings(res.data.bookings || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking? This cannot be undone.')) return;
    try {
      await API.put(`/bookings/${id}/cancel`, {});
      fetchBookings();
    } catch (err) { alert(err.response?.data?.message || 'Failed to cancel'); }
  };

  const statusStyle = (s) => ({
    confirmed: { bg:'#edf5f0', color:'#3a7a5a' },
    pending:   { bg:'#fef9ec', color:'#8a7040' },
    cancelled: { bg:'#fdeee9', color:'#a05040' },
  }[s] || { bg:'#f5f5f5', color:'#666' });

  const payStyle = (s) => ({
    paid:     { bg:'#edf5f0', color:'#3a7a5a' },
    unpaid:   { bg:'#fdeee9', color:'#a05040' },
    refunded: { bg:'#e8f0fe', color:'#3060a0' },
  }[s] || { bg:'#f5f5f5', color:'#666' });

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🌸</div>
        <p style={{ color:'#c9a99a', fontFamily:"'DM Sans',sans-serif" }}>Loading your bookings...</p>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:'900px', margin:'0 auto', padding:'2rem', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{ANIM_CSS}</style>

      <div style={{ marginBottom:'2rem' }}>
        <h1 style={{ color:'#2d1f1f', fontSize:'2rem', fontWeight:'700', margin:0, fontFamily:"'Cormorant Garamond',serif" }}>My Bookings</h1>
        <p style={{ color:'#a08880', fontSize:'0.84rem', marginTop:'4px' }}>{bookings.length} booking{bookings.length!==1?'s':''} found</p>
      </div>

      {bookings.length === 0 ? (
        <div style={{ background:'white', borderRadius:'20px', padding:'5rem', textAlign:'center', boxShadow:'0 4px 20px rgba(201,169,154,0.1)', border:'1px solid #f5e8e3' }}>
          <div style={{ fontSize:'3.5rem', marginBottom:'1rem' }}>🎫</div>
          <h2 style={{ color:'#2d1f1f', marginBottom:'0.5rem', fontFamily:"'Cormorant Garamond',serif" }}>No Bookings Yet</h2>
          <p style={{ color:'#a08880', marginBottom:'2rem', fontSize:'0.9rem' }}>Start exploring amazing events!</p>
          <Link to="/home" style={{ background:'linear-gradient(135deg,#c9a99a,#b8887a)', color:'white', padding:'12px 30px', borderRadius:'12px', textDecoration:'none', fontWeight:'600' }}>Browse Events 🌸</Link>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {bookings.map(booking => (
            <div key={booking._id} style={{ background:'white', borderRadius:'18px', padding:'1.3rem', boxShadow:'0 4px 20px rgba(201,169,154,0.1)', border:'1px solid #f5e8e3', display:'grid', gridTemplateColumns:'90px 1fr auto', gap:'1.2rem', alignItems:'center', animation:'fadeUp 0.4s ease' }}>
              <img src={booking.event?.image || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&q=80'} alt={booking.event?.name}
                style={{ width:'90px', height:'70px', objectFit:'cover', borderRadius:'12px' }}
                onError={e=>{e.target.src='https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&q=80';}} />
              <div>
                <h3 style={{ color:'#2d1f1f', fontWeight:'700', fontSize:'0.98rem', marginBottom:'4px' }}>{booking.event?.name}</h3>
                <p style={{ color:'#a08880', fontSize:'0.76rem', marginBottom:'6px' }}>
                  📍 {booking.event?.venue||'—'} &nbsp;•&nbsp;
                  📅 {booking.event?.date?new Date(booking.event.date).toLocaleDateString('en-IN'):'—'} &nbsp;•&nbsp;
                  🎫 {booking.numberOfTickets} ticket{booking.numberOfTickets>1?'s':''} &nbsp;•&nbsp;
                  <strong style={{color:'#c9a99a'}}>₹{booking.totalAmount}</strong>
                </p>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center' }}>
                  <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'0.7rem', fontWeight:'700', background:statusStyle(booking.status).bg, color:statusStyle(booking.status).color }}>{booking.status?.toUpperCase()}</span>
                  <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'0.7rem', fontWeight:'700', background:payStyle(booking.paymentStatus).bg, color:payStyle(booking.paymentStatus).color }}>{booking.paymentStatus?.toUpperCase()}</span>
                  {booking.paymentMethod && <span style={{ color:'#a08880', fontSize:'0.7rem', fontStyle:'italic' }}>via {booking.paymentMethod}</span>}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px', minWidth:'100px' }}>
                {booking.paymentStatus === 'unpaid' && booking.status !== 'cancelled' && (
                  <button onClick={() => setSelectedBooking(booking)}
                    style={{ background:'linear-gradient(135deg,#c9a99a,#b8887a)', color:'white', border:'none', padding:'9px 16px', borderRadius:'10px', cursor:'pointer', fontWeight:'700', fontSize:'0.78rem', fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap', boxShadow:'0 4px 14px rgba(201,169,154,0.4)' }}>
                    💳 Pay Now
                  </button>
                )}
                {booking.paymentStatus === 'paid' && (
                  <span style={{ color:'#3a7a5a', fontSize:'0.78rem', fontWeight:'700', textAlign:'center' }}>✅ Paid</span>
                )}
                {booking.status !== 'cancelled' && (
                  <button onClick={() => handleCancel(booking._id)}
                    style={{ background:'#fdeee9', color:'#a05040', border:'1px solid #f0c4b8', padding:'8px 16px', borderRadius:'10px', cursor:'pointer', fontWeight:'600', fontSize:'0.78rem', fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap' }}>
                    ✕ Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pro Payment Modal */}
      {selectedBooking && (
        <PaymentModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onSuccess={() => fetchBookings()}
        />
      )}
    </div>
  );
}

export default MyBookings;
