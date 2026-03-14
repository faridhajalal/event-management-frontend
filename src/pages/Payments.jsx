import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/axios';

const T = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif";
const GOLD = '#D4AF37';

const CSS = `
  @keyframes slideUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes checkPop { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
  @keyframes glow     { 0%,100%{box-shadow:0 0 0 0 rgba(212,175,55,0.4)} 70%{box-shadow:0 0 0 12px rgba(212,175,55,0)} }
  * { box-sizing: border-box; }
  input::placeholder { color: #444; }
  select option { background: #111; color: #fff; }
`;

function formatCard(v) { return v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim(); }
function formatExpiry(v) { const x=v.replace(/\D/g,'').slice(0,4); return x.length>=2?x.slice(0,2)+'/'+x.slice(2):x; }
function detectBrand(n) {
  const s=(n||'').replace(/\s/g,'');
  if(/^4/.test(s))    return { label:'VISA',   color:'#1a1f71' };
  if(/^5[1-5]/.test(s)) return { label:'MC',   color:'#eb001b' };
  if(/^6/.test(s))    return { label:'RuPay',  color:'#1e7f3c' };
  if(/^3[47]/.test(s)) return { label:'AMEX',  color:'#007bc1' };
  return { label:'', color:'#1a1a1a' };
}

function CardVisual({ number, name, expiry, cvv, flipped }) {
  const brand = detectBrand(number);
  const raw = (number||'').replace(/\s/g,'').padEnd(16,'•');
  const parts = [raw.slice(0,4), raw.slice(4,8), raw.slice(8,12), raw.slice(12,16)];

  return (
    <div style={{ perspective:'1000px', width:'100%', maxWidth:'360px', margin:'0 auto 2rem', height:'195px' }}>
      <div style={{ width:'100%', height:'100%', position:'relative', transformStyle:'preserve-3d', transition:'transform 0.6s ease', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        {/* Front */}
        <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden', borderRadius:'18px', background:`linear-gradient(135deg, #1a1a1a, #0d0d0d)`, border:`1px solid rgba(212,175,55,0.2)`, padding:'1.5rem', boxShadow:'0 20px 60px rgba(0,0,0,0.6)', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'200px', height:'200px', borderRadius:'50%', background:'rgba(212,175,55,0.04)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', bottom:'-40px', left:'-40px', width:'150px', height:'150px', borderRadius:'50%', background:'rgba(212,175,55,0.03)', pointerEvents:'none' }}/>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.4rem' }}>
            <div style={{ width:'40px', height:'28px', borderRadius:'5px', background:`linear-gradient(135deg, ${GOLD}, #b8960c)`, boxShadow:'0 2px 8px rgba(212,175,55,0.3)' }}/>
            <span style={{ color: brand.label ? GOLD : '#333', fontFamily:'monospace', fontWeight:'700', fontSize:'0.9rem', letterSpacing:'2px' }}>{brand.label}</span>
          </div>
          <p style={{ color:'#fff', fontFamily:'monospace', fontSize:'1rem', letterSpacing:'3px', margin:'0 0 1.4rem', textShadow:'0 2px 4px rgba(0,0,0,0.5)' }}>{parts.join(' ')}</p>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <div>
              <p style={{ color:'#555', fontSize:'0.58rem', margin:'0 0 3px', letterSpacing:'2px', textTransform:'uppercase' }}>Card Holder</p>
              <p style={{ color:'#fff', fontWeight:'600', fontSize:'0.82rem', margin:0, textTransform:'uppercase', letterSpacing:'1px' }}>{name||'YOUR NAME'}</p>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ color:'#555', fontSize:'0.58rem', margin:'0 0 3px', letterSpacing:'2px', textTransform:'uppercase' }}>Expires</p>
              <p style={{ color:GOLD, fontFamily:'monospace', fontWeight:'700', fontSize:'0.82rem', margin:0 }}>{expiry||'MM/YY'}</p>
            </div>
          </div>
        </div>
        {/* Back */}
        <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden', borderRadius:'18px', background:'linear-gradient(135deg, #1a1a1a, #0d0d0d)', border:'1px solid rgba(212,175,55,0.2)', transform:'rotateY(180deg)', overflow:'hidden' }}>
          <div style={{ width:'100%', height:'42px', background:'rgba(255,255,255,0.06)', marginTop:'28px' }}/>
          <div style={{ padding:'1rem 1.5rem', display:'flex', justifyContent:'flex-end', alignItems:'center', gap:'12px', marginTop:'8px' }}>
            <div style={{ flex:1, height:'34px', background:'rgba(255,255,255,0.04)', borderRadius:'4px', border:'1px solid rgba(255,255,255,0.06)' }}/>
            <div style={{ background:'#111', border:`1px solid rgba(212,175,55,0.3)`, borderRadius:'6px', padding:'6px 16px' }}>
              <p style={{ color:GOLD, fontFamily:'monospace', fontWeight:'700', fontSize:'0.88rem', margin:0 }}>{cvv?'•'.repeat(cvv.length):'•••'}</p>
            </div>
          </div>
          <p style={{ textAlign:'center', color:'#444', fontSize:'0.62rem', letterSpacing:'1px', textTransform:'uppercase' }}>CVV / CVC</p>
        </div>
      </div>
    </div>
  );
}

const UPI_APPS = [
  { id:'gpay',    label:'GPay',    emoji:'🔵' },
  { id:'phonepe', label:'PhonePe', emoji:'🟣' },
  { id:'paytm',   label:'Paytm',   emoji:'🔷' },
  { id:'bhim',    label:'BHIM',    emoji:'🟠' },
];
const BANKS = ['State Bank of India','HDFC Bank','ICICI Bank','Axis Bank','Kotak Mahindra','Punjab National Bank','Bank of Baroda','Canara Bank'];

export default function Payments() {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventName='Event Booking', amount=0, eventId='', seats=1 } = location.state || {};
  const [method, setMethod]   = useState('card');
  const [step, setStep]       = useState(1);
  const [flipped, setFlipped] = useState(false);
  const [txnId] = useState('TXN' + Date.now());
  const [card, setCard] = useState({ number:'', name:'', expiry:'', cvv:'' });
  const [errors, setErrors]   = useState({});
  const [upiId, setUpiId]     = useState('');
  const [upiApp, setUpiApp]   = useState('');
  const [bank, setBank]       = useState('');

  const inp = (err) => ({
    width:'100%', padding:'12px 14px',
    background:'#111', border:`1px solid ${err ? 'rgba(255,69,58,0.5)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius:'10px', color:'#fff', fontSize:'0.9rem', fontFamily:T,
    outline:'none', transition:'border-color 0.2s',
  });

  const validate = () => {
    const e = {};
    if (method==='card') {
      if ((card.number||'').replace(/\s/g,'').length < 16) e.number = 'Enter valid 16-digit number';
      if (!(card.name||'').trim()) e.name = 'Enter cardholder name';
      if ((card.expiry||'').length < 5) e.expiry = 'Enter valid MM/YY';
      if ((card.cvv||'').length < 3)   e.cvv   = 'Enter valid CVV';
    } else if (method==='upi') {
      if (!upiApp && !upiId.trim()) e.upi = 'Select a UPI app or enter UPI ID';
    } else if (method==='netbanking') {
      if (!bank) e.bank = 'Please select your bank';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setStep(3);
    await new Promise(r => setTimeout(r, 2500));
    try {
      await API.post('/bookings', { eventId, quantity: seats });
    } catch {}
    setStep(4);
  };

  /* ── SUCCESS ── */
  if (step === 4) return (
    <div style={{ minHeight:'100vh', background:'#000', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T, padding:'2rem' }}>
      <style>{CSS}</style>
      <div style={{ background:'#0d0d0d', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'24px', padding:'2.5rem 2rem', maxWidth:'420px', width:'100%', textAlign:'center', boxShadow:'0 30px 80px rgba(0,0,0,0.6)', animation:'slideUp 0.5s ease' }}>
        <div style={{ width:'72px', height:'72px', background:'rgba(48,209,88,0.1)', border:'1px solid rgba(48,209,88,0.25)', borderRadius:'18px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem', fontSize:'1.8rem', animation:'checkPop 0.5s ease 0.2s both' }}>✓</div>
        <h2 style={{ color:'#fff', fontSize:'1.5rem', fontWeight:'700', margin:'0 0 6px', letterSpacing:'-0.5px' }}>Payment Successful!</h2>
        <p style={{ color:'#555', fontSize:'0.86rem', margin:'0 0 2rem' }}>Your booking is confirmed 🎉</p>
        <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'1.2rem', marginBottom:'1.5rem', textAlign:'left' }}>
          {[
            ['Event', eventName],
            ['Amount Paid', `₹${amount}`],
            ['Seats', seats],
            ['Payment', method==='card'?'💳 Card':method==='upi'?'📱 UPI':'🏦 Net Banking'],
            ['Transaction ID', txnId],
            ['Status', '✅ Success'],
          ].map(([label, value], i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.05)' : 'none', gap:'1rem' }}>
              <span style={{ color:'#555', fontSize:'0.8rem', flexShrink:0 }}>{label}</span>
              <span style={{ color: label==='Status' ? '#30D158' : '#fff', fontWeight:'600', fontSize:'0.82rem', textAlign:'right', wordBreak:'break-all' }}>{String(value)}</span>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('/my-bookings')} style={{ width:'100%', padding:'13px', background:GOLD, color:'#000', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'700', fontSize:'0.92rem', fontFamily:T, marginBottom:'10px' }}>
          View My Bookings 🎟️
        </button>
        <button onClick={() => navigate('/home')} style={{ width:'100%', padding:'11px', background:'transparent', color:'#555', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', cursor:'pointer', fontWeight:'600', fontSize:'0.86rem', fontFamily:T }}>
          Back to Home
        </button>
      </div>
    </div>
  );

  /* ── PROCESSING ── */
  if (step === 3) return (
    <div style={{ minHeight:'100vh', background:'#000', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T }}>
      <style>{CSS}</style>
      <div style={{ textAlign:'center', animation:'fadeIn 0.4s ease' }}>
        <div style={{ width:'64px', height:'64px', border:'3px solid #222', borderTop:`3px solid ${GOLD}`, borderRadius:'50%', margin:'0 auto 1.5rem', animation:'spin 0.8s linear infinite' }}/>
        <h3 style={{ color:'#fff', fontWeight:'700', fontSize:'1.2rem', margin:'0 0 6px' }}>Processing Payment...</h3>
        <p style={{ color:'#555', fontSize:'0.85rem', margin:'0 0 8px' }}>Please do not close this window</p>
        <p style={{ color:GOLD, fontSize:'0.8rem', fontFamily:'monospace' }}>₹{amount} • {eventName}</p>
      </div>
    </div>
  );

  /* ── MAIN ── */
  return (
    <div style={{ minHeight:'100vh', background:'#000', fontFamily:T, padding:'2rem 1rem', color:'#fff' }}>
      <style>{CSS}</style>
      <div style={{ maxWidth:'500px', margin:'0 auto', animation:'slideUp 0.4s ease' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'20px', padding:'5px 14px', marginBottom:'1rem' }}>
            <span style={{ fontSize:'0.72rem', color:GOLD, fontWeight:'700', letterSpacing:'1.5px', textTransform:'uppercase' }}>🔒 Secure Payment</span>
          </div>
          <h1 style={{ color:'#fff', fontSize:'1.7rem', fontWeight:'700', margin:'0 0 6px', letterSpacing:'-0.5px' }}>Complete Payment</h1>
          <p style={{ color:'#555', fontSize:'0.88rem', margin:0 }}>
            {eventName} • <span style={{ color:GOLD, fontWeight:'700' }}>₹{amount}</span> • {seats} seat{seats > 1 ? 's' : ''}
          </p>
        </div>

        {/* Card Visual */}
        {method === 'card' && (
          <CardVisual number={card.number} name={card.name} expiry={card.expiry} cvv={card.cvv} flipped={flipped} />
        )}

        {/* Card */}
        <div style={{ background:'#0d0d0d', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', padding:'1.8rem', boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}>

          {/* Method Tabs */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginBottom:'1.8rem' }}>
            {[['card','💳 Card'],['upi','📱 UPI'],['netbanking','🏦 Net Banking']].map(([id, label]) => (
              <button key={id} onClick={() => { setMethod(id); setErrors({}); }} style={{
                padding:'10px 4px', borderRadius:'10px',
                border: `1px solid ${method===id ? GOLD : 'rgba(255,255,255,0.08)'}`,
                background: method===id ? 'rgba(212,175,55,0.1)' : 'transparent',
                color: method===id ? GOLD : '#555',
                fontWeight:'600', fontSize:'0.75rem', cursor:'pointer', fontFamily:T,
                transition:'all 0.2s',
              }}>{label}</button>
            ))}
          </div>

          {/* ── CARD FORM ── */}
          {method === 'card' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem', animation:'fadeIn 0.3s ease' }}>
              <div>
                <label style={{ display:'block', color:'#555', fontSize:'0.7rem', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px' }}>Card Number</label>
                <input value={card.number} onChange={e => setCard(p => ({...p, number:formatCard(e.target.value)}))}
                  placeholder="1234 5678 9012 3456" maxLength={19} style={inp(errors.number)}
                  onFocus={e => e.target.style.borderColor = GOLD}
                  onBlur={e => e.target.style.borderColor = errors.number ? 'rgba(255,69,58,0.5)' : 'rgba(255,255,255,0.1)'} />
                {errors.number && <p style={{ color:'#FF453A', fontSize:'0.72rem', margin:'4px 0 0' }}>{errors.number}</p>}
              </div>
              <div>
                <label style={{ display:'block', color:'#555', fontSize:'0.7rem', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px' }}>Cardholder Name</label>
                <input value={card.name} onChange={e => setCard(p => ({...p, name:e.target.value}))}
                  placeholder="As printed on card" style={inp(errors.name)}
                  onFocus={e => e.target.style.borderColor = GOLD}
                  onBlur={e => e.target.style.borderColor = errors.name ? 'rgba(255,69,58,0.5)' : 'rgba(255,255,255,0.1)'} />
                {errors.name && <p style={{ color:'#FF453A', fontSize:'0.72rem', margin:'4px 0 0' }}>{errors.name}</p>}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div>
                  <label style={{ display:'block', color:'#555', fontSize:'0.7rem', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px' }}>Expiry</label>
                  <input value={card.expiry} onChange={e => setCard(p => ({...p, expiry:formatExpiry(e.target.value)}))}
                    placeholder="MM/YY" maxLength={5} style={inp(errors.expiry)}
                    onFocus={e => e.target.style.borderColor = GOLD}
                    onBlur={e => e.target.style.borderColor = errors.expiry ? 'rgba(255,69,58,0.5)' : 'rgba(255,255,255,0.1)'} />
                  {errors.expiry && <p style={{ color:'#FF453A', fontSize:'0.72rem', margin:'4px 0 0' }}>{errors.expiry}</p>}
                </div>
                <div>
                  <label style={{ display:'block', color:'#555', fontSize:'0.7rem', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px' }}>CVV</label>
                  <input value={card.cvv} onChange={e => setCard(p => ({...p, cvv:e.target.value.replace(/\D/g,'').slice(0,4)}))}
                    placeholder="•••" maxLength={4} type="password" style={inp(errors.cvv)}
                    onFocus={e => { setFlipped(true); e.target.style.borderColor = GOLD; }}
                    onBlur={e => { setFlipped(false); e.target.style.borderColor = errors.cvv ? 'rgba(255,69,58,0.5)' : 'rgba(255,255,255,0.1)'; }} />
                  {errors.cvv && <p style={{ color:'#FF453A', fontSize:'0.72rem', margin:'4px 0 0' }}>{errors.cvv}</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── UPI ── */}
          {method === 'upi' && (
            <div style={{ animation:'fadeIn 0.3s ease' }}>
              <p style={{ color:'#555', fontSize:'0.7rem', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>Choose UPI App</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'1.2rem' }}>
                {UPI_APPS.map(app => (
                  <button key={app.id} onClick={() => { setUpiApp(app.id); setErrors({}); }} style={{
                    padding:'13px', borderRadius:'12px',
                    border:`1px solid ${upiApp===app.id ? GOLD : 'rgba(255,255,255,0.08)'}`,
                    background: upiApp===app.id ? 'rgba(212,175,55,0.1)' : '#111',
                    cursor:'pointer', fontFamily:T, fontWeight:'600', fontSize:'0.85rem',
                    color: upiApp===app.id ? GOLD : '#555',
                    transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                  }}>
                    {app.emoji} {app.label}
                  </button>
                ))}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'1rem 0' }}>
                <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.06)' }}/>
                <span style={{ color:'#333', fontSize:'0.72rem', fontWeight:'700' }}>OR</span>
                <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.06)' }}/>
              </div>
              <label style={{ display:'block', color:'#555', fontSize:'0.7rem', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px' }}>UPI ID</label>
              <input value={upiId} onChange={e => { setUpiId(e.target.value); setErrors({}); }}
                placeholder="name@upi" style={inp(errors.upi)}
                onFocus={e => e.target.style.borderColor = GOLD}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              {errors.upi && <p style={{ color:'#FF453A', fontSize:'0.72rem', margin:'4px 0 0' }}>{errors.upi}</p>}
            </div>
          )}

          {/* ── NET BANKING ── */}
          {method === 'netbanking' && (
            <div style={{ animation:'fadeIn 0.3s ease' }}>
              <label style={{ display:'block', color:'#555', fontSize:'0.7rem', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>Select Bank</label>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxHeight:'260px', overflowY:'auto' }}>
                {BANKS.map(b => (
                  <button key={b} onClick={() => { setBank(b); setErrors({}); }} style={{
                    padding:'12px 14px', borderRadius:'10px',
                    border:`1px solid ${bank===b ? GOLD : 'rgba(255,255,255,0.06)'}`,
                    background: bank===b ? 'rgba(212,175,55,0.08)' : '#111',
                    cursor:'pointer', fontFamily:T, fontWeight:'500', fontSize:'0.85rem',
                    color: bank===b ? GOLD : '#A0A0A0',
                    textAlign:'left', transition:'all 0.2s',
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                  }}>
                    🏦 {b} {bank===b && <span style={{ color:GOLD, fontWeight:'700' }}>✓</span>}
                  </button>
                ))}
              </div>
              {errors.bank && <p style={{ color:'#FF453A', fontSize:'0.72rem', margin:'8px 0 0' }}>{errors.bank}</p>}
            </div>
          )}

          {/* Total */}
          <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'10px', padding:'12px 14px', margin:'1.5rem 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ color:'#555', fontSize:'0.84rem' }}>Total Amount</span>
            <span style={{ color:GOLD, fontWeight:'700', fontSize:'1.1rem' }}>₹{amount}</span>
          </div>

          {/* Pay Button */}
          <button onClick={handlePay} style={{
            width:'100%', padding:'14px',
            background:GOLD, color:'#000',
            border:'none', borderRadius:'10px',
            cursor:'pointer', fontWeight:'700', fontSize:'0.95rem', fontFamily:T,
            letterSpacing:'0.3px', animation:'glow 2s ease infinite',
            transition:'opacity 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            🔒 Pay ₹{amount}
          </button>
          <p style={{ textAlign:'center', color:'#333', fontSize:'0.7rem', marginTop:'0.8rem', letterSpacing:'0.5px' }}>
            🔐 256-bit SSL Encrypted • Safe & Secure
          </p>
        </div>

        <button onClick={() => navigate(-1)} style={{ width:'100%', padding:'12px', background:'transparent', color:'#555', border:'none', cursor:'pointer', fontSize:'0.85rem', fontFamily:T, marginTop:'1rem', fontWeight:'500', transition:'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#555'}>
          ← Cancel & Go Back
        </button>
      </div>
    </div>
  );
}
