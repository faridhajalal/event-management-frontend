import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/axios';

const ANIM_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
  @keyframes slideUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes checkPop { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
  @keyframes pulse    { 0%,100%{box-shadow:0 0 0 0 rgba(201,169,154,0.5)} 70%{box-shadow:0 0 0 12px rgba(201,169,154,0)} }
  * { box-sizing: border-box; }
`;

function formatCard(v){ return v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim(); }
function formatExpiry(v){ const x=v.replace(/\D/g,'').slice(0,4); return x.length>=2?x.slice(0,2)+'/'+x.slice(2):x; }
function detectBrand(n){
  const s=(n||'').replace(/\s/g,'');
  if(/^4/.test(s)) return {label:'VISA',gradient:'linear-gradient(135deg,#1a1f71,#2b5be0)'};
  if(/^5[1-5]/.test(s)) return {label:'MC',gradient:'linear-gradient(135deg,#eb001b,#f79e1b)'};
  if(/^6/.test(s)) return {label:'RuPay',gradient:'linear-gradient(135deg,#1e7f3c,#57b846)'};
  if(/^3[47]/.test(s)) return {label:'AMEX',gradient:'linear-gradient(135deg,#007bc1,#00b4d8)'};
  return {label:'',gradient:'linear-gradient(135deg,#c9a99a,#8d5a52)'};
}

function CardVisual({ number, name, expiry, cvv, flipped }) {
  const brand = detectBrand(number);
  const raw = (number||'').replace(/\s/g,'').padEnd(16,'•');
  const parts = [raw.slice(0,4), raw.slice(4,8), raw.slice(8,12), raw.slice(12,16)];
  return (
    <div style={{perspective:'1000px',width:'100%',maxWidth:'360px',margin:'0 auto 2rem',height:'200px'}}>
      <div style={{width:'100%',height:'100%',position:'relative',transformStyle:'preserve-3d',transition:'transform 0.6s ease',transform:flipped?'rotateY(180deg)':'rotateY(0deg)'}}>
        <div style={{position:'absolute',inset:0,backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',borderRadius:'20px',background:brand.gradient,padding:'1.6rem',boxShadow:'0 20px 60px rgba(0,0,0,0.28)',overflow:'hidden'}}>
          <div style={{position:'absolute',top:'-40px',right:'-40px',width:'180px',height:'180px',borderRadius:'50%',background:'rgba(255,255,255,0.07)',pointerEvents:'none'}}/>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.6rem'}}>
            <div style={{width:'42px',height:'30px',borderRadius:'6px',background:'linear-gradient(135deg,#ffd700,#ffa500)',boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}}/>
            <span style={{color:'rgba(255,255,255,0.9)',fontFamily:"'Space Mono',monospace",fontWeight:'700',fontSize:'1rem'}}>{brand.label}</span>
          </div>
          <p style={{color:'white',fontFamily:"'Space Mono',monospace",fontSize:'1.05rem',letterSpacing:'3px',margin:'0 0 1.4rem',textShadow:'0 2px 4px rgba(0,0,0,0.2)'}}>{parts.join(' ')}</p>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <div>
              <p style={{color:'rgba(255,255,255,0.5)',fontSize:'0.6rem',margin:'0 0 2px',fontFamily:"'Sora',sans-serif",letterSpacing:'2px'}}>CARD HOLDER</p>
              <p style={{color:'white',fontFamily:"'Sora',sans-serif",fontWeight:'600',fontSize:'0.85rem',margin:0,textTransform:'uppercase'}}>{name||'YOUR NAME'}</p>
            </div>
            <div style={{textAlign:'right'}}>
              <p style={{color:'rgba(255,255,255,0.5)',fontSize:'0.6rem',margin:'0 0 2px',fontFamily:"'Sora',sans-serif",letterSpacing:'2px'}}>EXPIRES</p>
              <p style={{color:'white',fontFamily:"'Space Mono',monospace",fontWeight:'700',fontSize:'0.85rem',margin:0}}>{expiry||'MM/YY'}</p>
            </div>
          </div>
        </div>
        <div style={{position:'absolute',inset:0,backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',borderRadius:'20px',background:brand.gradient,transform:'rotateY(180deg)',overflow:'hidden'}}>
          <div style={{width:'100%',height:'44px',background:'rgba(0,0,0,0.4)',marginTop:'30px'}}/>
          <div style={{padding:'1rem 1.6rem',display:'flex',justifyContent:'flex-end',alignItems:'center',gap:'12px',marginTop:'10px'}}>
            <div style={{flex:1,height:'36px',background:'rgba(255,255,255,0.15)',borderRadius:'4px'}}/>
            <div style={{background:'white',borderRadius:'6px',padding:'6px 18px'}}>
              <p style={{color:'#333',fontFamily:"'Space Mono',monospace",fontWeight:'700',fontSize:'0.9rem',margin:0}}>{cvv?'•'.repeat(cvv.length):'•••'}</p>
            </div>
          </div>
          <p style={{textAlign:'center',color:'rgba(255,255,255,0.5)',fontSize:'0.65rem',fontFamily:"'Sora',sans-serif",letterSpacing:'1px'}}>CVV / CVC</p>
        </div>
      </div>
    </div>
  );
}

export default function Payments() {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventName='Event Booking', amount=0, eventId='', seats=1 } = location.state || {};
  const [method, setMethod] = useState('card');
  const [step, setStep] = useState(1);
  const [flipped, setFlipped] = useState(false);
  const [txnId] = useState('TXN'+Date.now());
  const [card, setCard] = useState({number:'',name:'',expiry:'',cvv:''});
  const [errors, setErrors] = useState({});
  const [upiId, setUpiId] = useState('');
  const [upiApp, setUpiApp] = useState('');
  const [bank, setBank] = useState('');

  const UPI_APPS = [
    {id:'gpay',    label:'GPay',    color:'#4285F4', emoji:'🔵'},
    {id:'phonepe', label:'PhonePe', color:'#5f259f', emoji:'🟣'},
    {id:'paytm',   label:'Paytm',   color:'#002970', emoji:'🔷'},
    {id:'bhim',    label:'BHIM',    color:'#ff6600', emoji:'🟠'},
  ];
  const BANKS = ['State Bank of India','HDFC Bank','ICICI Bank','Axis Bank','Kotak Mahindra','Punjab National Bank','Bank of Baroda','Canara Bank'];

  const validate = () => {
    const e = {};
    if (method==='card') {
      if ((card.number||'').replace(/\s/g,'').length<16) e.number='Enter valid 16-digit number';
      if (!(card.name||'').trim()) e.name='Enter cardholder name';
      if ((card.expiry||'').length<5) e.expiry='Enter valid MM/YY';
      if ((card.cvv||'').length<3) e.cvv='Enter valid CVV';
    } else if (method==='upi') {
      if (!upiApp && !upiId.trim()) e.upi='Select a UPI app or enter UPI ID';
    } else if (method==='netbanking') {
      if (!bank) e.bank='Please select your bank';
    }
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setStep(3);
    await new Promise(r => setTimeout(r,2500));
    try {
      const user = JSON.parse(localStorage.getItem('user')||'{}');
      await API.post('/bookings',{event:eventId,seats,totalAmount:amount,paymentMethod:method,transactionId:txnId,userId:user._id});
    } catch {}
    setStep(4);
  };

  const inp = (err) => ({width:'100%',padding:'13px 16px',border:`1.5px solid ${err?'#e74c3c':'#f0ddd7'}`,borderRadius:'12px',outline:'none',fontSize:'0.9rem',fontFamily:"'Sora',sans-serif",color:'#2d1f1f',background:'#fdfaf9',transition:'border-color 0.2s'});
  const lbl = {display:'block',color:'#8a6a65',fontSize:'0.72rem',fontWeight:'600',marginBottom:'6px',letterSpacing:'1px',fontFamily:"'Sora',sans-serif"};

  if (step===4) return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#fdf6f3,#f5e8e3)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Sora',sans-serif",padding:'2rem'}}>
      <style>{ANIM_CSS}</style>
      <div style={{background:'white',borderRadius:'28px',padding:'3rem 2.5rem',maxWidth:'440px',width:'100%',textAlign:'center',boxShadow:'0 30px 80px rgba(201,169,154,0.25)',animation:'slideUp 0.5s ease'}}>
        <div style={{width:'80px',height:'80px',background:'linear-gradient(135deg,#c9a99a,#b8887a)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.5rem',fontSize:'2rem',color:'white',animation:'checkPop 0.5s ease 0.2s both'}}>✓</div>
        <h2 style={{color:'#2d1f1f',fontSize:'1.6rem',fontWeight:'700',margin:'0 0 0.4rem'}}>Payment Successful!</h2>
        <p style={{color:'#a08880',fontSize:'0.88rem',margin:'0 0 2rem'}}>Your booking is confirmed 🌸</p>
        <div style={{background:'#fdf6f3',borderRadius:'16px',padding:'1.4rem',marginBottom:'1.5rem',textAlign:'left'}}>
          {[['Event',eventName],['Amount Paid',`₹${amount}`],['Seats',seats],['Payment Method',method==='card'?'💳 Card':method==='upi'?'📱 UPI':'🏦 Net Banking'],['Transaction ID',txnId],['Status','✅ Success']].map(([label,value],i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:i<5?'1px solid #f0ddd7':'none',gap:'1rem'}}>
              <span style={{color:'#a08880',fontSize:'0.8rem',flexShrink:0}}>{label}</span>
              <span style={{color:'#2d1f1f',fontWeight:'600',fontSize:'0.82rem',textAlign:'right',fontFamily:label==='Transaction ID'?"'Space Mono',monospace":'inherit',wordBreak:'break-all'}}>{String(value)}</span>
            </div>
          ))}
        </div>
        <button onClick={()=>navigate('/my-bookings')} style={{width:'100%',padding:'14px',background:'linear-gradient(135deg,#c9a99a,#b8887a)',color:'white',border:'none',borderRadius:'14px',cursor:'pointer',fontWeight:'700',fontSize:'0.95rem',fontFamily:"'Sora',sans-serif",boxShadow:'0 8px 24px rgba(201,169,154,0.4)'}}>View My Bookings 🎟️</button>
        <button onClick={()=>navigate('/home')} style={{width:'100%',padding:'12px',background:'transparent',color:'#b8887a',border:'1.5px solid #f0ddd7',borderRadius:'14px',cursor:'pointer',fontWeight:'600',fontSize:'0.88rem',fontFamily:"'Sora',sans-serif",marginTop:'10px'}}>Back to Home</button>
      </div>
    </div>
  );

  if (step===3) return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#fdf6f3,#f5e8e3)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Sora',sans-serif"}}>
      <style>{ANIM_CSS}</style>
      <div style={{textAlign:'center',animation:'fadeIn 0.4s ease'}}>
        <div style={{width:'72px',height:'72px',border:'4px solid #f0ddd7',borderTop:'4px solid #c9a99a',borderRadius:'50%',margin:'0 auto 1.5rem',animation:'spin 0.8s linear infinite'}}/>
        <h3 style={{color:'#2d1f1f',fontWeight:'700',fontSize:'1.2rem',margin:'0 0 0.4rem'}}>Processing Payment...</h3>
        <p style={{color:'#a08880',fontSize:'0.85rem'}}>Please do not close this window 🌸</p>
        <p style={{color:'#c9a99a',fontSize:'0.8rem',marginTop:'0.5rem',fontFamily:"'Space Mono',monospace"}}>₹{amount} • {eventName}</p>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#fdf6f3 0%,#f5e8e3 100%)',fontFamily:"'Sora',sans-serif",padding:'2rem 1rem'}}>
      <style>{ANIM_CSS}</style>
      <div style={{maxWidth:'520px',margin:'0 auto',animation:'slideUp 0.4s ease'}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(201,169,154,0.15)',border:'1px solid rgba(201,169,154,0.3)',borderRadius:'20px',padding:'6px 16px',marginBottom:'1rem'}}>
            <span style={{fontSize:'0.75rem',color:'#b8887a',fontWeight:'600',letterSpacing:'1px'}}>🔒 SECURE PAYMENT</span>
          </div>
          <h1 style={{color:'#2d1f1f',fontSize:'1.8rem',fontWeight:'700',margin:'0 0 0.3rem'}}>Complete Payment</h1>
          <p style={{color:'#a08880',fontSize:'0.88rem',margin:0}}>{eventName} • <strong style={{color:'#c9a99a'}}>₹{amount}</strong> • {seats} seat{seats>1?'s':''}</p>
        </div>

        {method==='card' && <CardVisual number={card.number} name={card.name} expiry={card.expiry} cvv={card.cvv} flipped={flipped}/>}

        <div style={{background:'white',borderRadius:'24px',padding:'2rem',boxShadow:'0 20px 60px rgba(201,169,154,0.18)',border:'1px solid #f0ddd7'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginBottom:'1.8rem'}}>
            {[['card','💳 Card'],['upi','📱 UPI'],['netbanking','🏦 Net Banking']].map(([id,label])=>(
              <button key={id} onClick={()=>{setMethod(id);setErrors({});}}
                style={{padding:'10px 4px',borderRadius:'12px',border:`2px solid ${method===id?'#c9a99a':'#f0ddd7'}`,background:method===id?'linear-gradient(135deg,#fdf0eb,#f5e0d8)':'white',color:method===id?'#b8887a':'#a08880',fontWeight:'600',fontSize:'0.76rem',cursor:'pointer',fontFamily:"'Sora',sans-serif",transition:'all 0.2s'}}>{label}</button>
            ))}
          </div>

          {method==='card' && (
            <div style={{display:'flex',flexDirection:'column',gap:'1rem',animation:'fadeIn 0.3s ease'}}>
              <div>
                <label style={lbl}>CARD NUMBER</label>
                <input value={card.number} onChange={e=>setCard(p=>({...p,number:formatCard(e.target.value)}))} placeholder="1234 5678 9012 3456" maxLength={19} style={inp(errors.number)} onFocus={e=>e.target.style.borderColor='#c9a99a'} onBlur={e=>e.target.style.borderColor=errors.number?'#e74c3c':'#f0ddd7'}/>
                {errors.number && <p style={{color:'#e74c3c',fontSize:'0.72rem',margin:'4px 0 0'}}>{errors.number}</p>}
              </div>
              <div>
                <label style={lbl}>CARDHOLDER NAME</label>
                <input value={card.name} onChange={e=>setCard(p=>({...p,name:e.target.value}))} placeholder="As printed on card" style={inp(errors.name)} onFocus={e=>e.target.style.borderColor='#c9a99a'} onBlur={e=>e.target.style.borderColor=errors.name?'#e74c3c':'#f0ddd7'}/>
                {errors.name && <p style={{color:'#e74c3c',fontSize:'0.72rem',margin:'4px 0 0'}}>{errors.name}</p>}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div>
                  <label style={lbl}>EXPIRY DATE</label>
                  <input value={card.expiry} onChange={e=>setCard(p=>({...p,expiry:formatExpiry(e.target.value)}))} placeholder="MM/YY" maxLength={5} style={inp(errors.expiry)} onFocus={e=>e.target.style.borderColor='#c9a99a'} onBlur={e=>e.target.style.borderColor=errors.expiry?'#e74c3c':'#f0ddd7'}/>
                  {errors.expiry && <p style={{color:'#e74c3c',fontSize:'0.72rem',margin:'4px 0 0'}}>{errors.expiry}</p>}
                </div>
                <div>
                  <label style={lbl}>CVV / CVC</label>
                  <input value={card.cvv} onChange={e=>setCard(p=>({...p,cvv:e.target.value.replace(/\D/g,'').slice(0,4)}))} placeholder="•••" maxLength={4} type="password" style={inp(errors.cvv)} onFocus={e=>{setFlipped(true);e.target.style.borderColor='#c9a99a';}} onBlur={e=>{setFlipped(false);e.target.style.borderColor=errors.cvv?'#e74c3c':'#f0ddd7';}}/>
                  {errors.cvv && <p style={{color:'#e74c3c',fontSize:'0.72rem',margin:'4px 0 0'}}>{errors.cvv}</p>}
                </div>
              </div>
            </div>
          )}

          {method==='upi' && (
            <div style={{animation:'fadeIn 0.3s ease'}}>
              <p style={{...lbl,marginBottom:'10px'}}>CHOOSE UPI APP</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'1.2rem'}}>
                {UPI_APPS.map(app=>(
                  <button key={app.id} onClick={()=>{setUpiApp(app.id);setErrors({});}}
                    style={{padding:'14px',borderRadius:'14px',border:`2px solid ${upiApp===app.id?app.color:'#f0ddd7'}`,background:upiApp===app.id?`${app.color}18`:'white',cursor:'pointer',fontFamily:"'Sora',sans-serif",fontWeight:'600',fontSize:'0.85rem',color:upiApp===app.id?app.color:'#a08880',transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                    {app.emoji} {app.label}
                  </button>
                ))}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'12px',margin:'1rem 0'}}>
                <div style={{flex:1,height:'1px',background:'#f0ddd7'}}/>
                <span style={{color:'#c0a0a0',fontSize:'0.75rem',fontWeight:'600'}}>OR</span>
                <div style={{flex:1,height:'1px',background:'#f0ddd7'}}/>
              </div>
              <label style={lbl}>ENTER UPI ID MANUALLY</label>
              <input value={upiId} onChange={e=>{setUpiId(e.target.value);setErrors({});}} placeholder="name@upi" style={inp(errors.upi)} onFocus={e=>e.target.style.borderColor='#c9a99a'} onBlur={e=>e.target.style.borderColor='#f0ddd7'}/>
              {errors.upi && <p style={{color:'#e74c3c',fontSize:'0.72rem',margin:'4px 0 0'}}>{errors.upi}</p>}
            </div>
          )}

          {method==='netbanking' && (
            <div style={{animation:'fadeIn 0.3s ease'}}>
              <label style={lbl}>SELECT YOUR BANK</label>
              <div style={{display:'flex',flexDirection:'column',gap:'8px',maxHeight:'260px',overflowY:'auto'}}>
                {BANKS.map(b=>(
                  <button key={b} onClick={()=>{setBank(b);setErrors({});}}
                    style={{padding:'13px 16px',borderRadius:'12px',border:`2px solid ${bank===b?'#c9a99a':'#f0ddd7'}`,background:bank===b?'linear-gradient(135deg,#fdf0eb,#f5e0d8)':'white',cursor:'pointer',fontFamily:"'Sora',sans-serif",fontWeight:'500',fontSize:'0.85rem',color:bank===b?'#b8887a':'#6b5555',textAlign:'left',transition:'all 0.2s',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    🏦 {b} {bank===b && <span style={{color:'#c9a99a',fontWeight:'700'}}>✓</span>}
                  </button>
                ))}
              </div>
              {errors.bank && <p style={{color:'#e74c3c',fontSize:'0.72rem',margin:'8px 0 0'}}>{errors.bank}</p>}
            </div>
          )}

          <div style={{background:'#fdf6f3',borderRadius:'12px',padding:'12px 16px',margin:'1.4rem 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{color:'#a08880',fontSize:'0.83rem'}}>Total Amount</span>
            <span style={{color:'#2d1f1f',fontWeight:'700',fontSize:'1.1rem',fontFamily:"'Space Mono',monospace"}}>₹{amount}</span>
          </div>

          <button onClick={handlePay} style={{width:'100%',padding:'16px',background:'linear-gradient(135deg,#c9a99a,#b8887a)',color:'white',border:'none',borderRadius:'14px',cursor:'pointer',fontWeight:'700',fontSize:'1rem',fontFamily:"'Sora',sans-serif",boxShadow:'0 8px 24px rgba(201,169,154,0.45)',letterSpacing:'0.5px',animation:'pulse 2s ease infinite'}}>
            🔒 Pay ₹{amount}
          </button>
          <p style={{textAlign:'center',color:'#c0a0a0',fontSize:'0.7rem',marginTop:'0.8rem',fontFamily:"'Sora',sans-serif"}}>🔐 256-bit SSL Encrypted • Safe & Secure</p>
        </div>

        <button onClick={()=>navigate(-1)} style={{width:'100%',padding:'12px',background:'transparent',color:'#b8887a',border:'none',cursor:'pointer',fontSize:'0.85rem',fontFamily:"'Sora',sans-serif",marginTop:'1rem',fontWeight:'500'}}>← Cancel & Go Back</button>
      </div>
    </div>
  );
}
