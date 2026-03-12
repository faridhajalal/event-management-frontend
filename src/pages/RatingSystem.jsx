import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/axios';

const FLOWER_CSS = `
  @keyframes floatA { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(12deg)} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes successPop { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
`;

const CARD_TYPES = {
  visa: { pattern: /^4/, color: '#1a1f71', label: 'VISA' },
  mastercard: { pattern: /^5[1-5]/, color: '#eb001b', label: 'MC' },
  amex: { pattern: /^3[47]/, color: '#007bc1', label: 'AMEX' },
  rupay: { pattern: /^6/, color: '#2e7d32', label: 'RuPay' },
};

function detectCard(num) {
  for (const [type, data] of Object.entries(CARD_TYPES)) {
    if (data.pattern.test(num.replace(/\s/g, ''))) return { type, ...data };
  }
  return null;
}

function formatCard(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(val) {
  const v = val.replace(/\D/g, '').slice(0, 4);
  return v.length >= 2 ? v.slice(0, 2) + '/' + v.slice(2) : v;
}

export default function Payments() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get booking details from navigation state
  const { eventName, amount, eventId, seats } = location.state || {
    eventName: 'Event Ticket',
    amount: 999,
    eventId: null,
    seats: 1,
  };

  const [step, setStep] = useState('method'); // method | card | upi | processing | success
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const cardType = detectCard(cardNum);
  const totalAmount = amount || 999;

  const validateCard = () => {
    const num = cardNum.replace(/\s/g, '');
    if (num.length < 16) return 'Please enter a valid 16-digit card number';
    if (!expiry.match(/^\d{2}\/\d{2}$/)) return 'Please enter expiry as MM/YY';
    const [mm, yy] = expiry.split('/');
    if (parseInt(mm) > 12 || parseInt(mm) < 1) return 'Invalid expiry month';
    if (cvv.length < 3) return 'Please enter a valid CVV';
    if (!cardName.trim()) return 'Please enter cardholder name';
    return null;
  };

  const validateUpi = () => {
    if (!upiId.includes('@')) return 'Please enter a valid UPI ID (e.g. name@upi)';
    return null;
  };

  const processPayment = async () => {
    setError('');
    let err = null;
    if (paymentMethod === 'card') err = validateCard();
    if (paymentMethod === 'upi') err = validateUpi();
    if (err) { setError(err); return; }

    setStep('processing');

    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 2500));

    try {
      // Save booking to backend
      if (eventId) {
        await API.post('/bookings', {
          eventId,
          seats,
          totalPrice: totalAmount,
          paymentMethod,
          paymentStatus: 'completed',
          transactionId: 'TXN' + Date.now(),
        });
      }
      setStep('success');
    } catch (err) {
      // Even if booking save fails, show success for demo
      setStep('success');
    }
  };

  // ===== STEP: Payment Method Selection =====
  if (step === 'method') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdf6f3, #f9ede8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{FLOWER_CSS}</style>
      <div style={{ maxWidth: '420px', width: '100%', animation: 'fadeIn 0.4s ease' }}>

        {/* Order Summary */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 4px 20px rgba(201,169,154,0.2)', border: '1px solid #f0ddd7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #c9a99a, #b8887a)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🌸</div>
            <span style={{ fontWeight: '700', color: '#2d1f1f', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>EventHub Pay</span>
          </div>
          <div style={{ background: '#fdf8f6', borderRadius: '14px', padding: '1rem' }}>
            <p style={{ color: '#a08880', fontSize: '0.78rem', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: '600' }}>Order Summary</p>
            <p style={{ color: '#2d1f1f', fontWeight: '700', margin: '0 0 4px', fontSize: '0.95rem' }}>🎫 {eventName}</p>
            <p style={{ color: '#a08880', fontSize: '0.82rem', margin: '0 0 10px' }}>{seats} ticket{seats > 1 ? 's' : ''}</p>
            <div style={{ borderTop: '1px solid #f0ddd7', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b5a55', fontWeight: '600', fontSize: '0.88rem' }}>Total Amount</span>
              <span style={{ color: '#b8887a', fontWeight: '800', fontSize: '1.2rem' }}>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(201,169,154,0.2)', border: '1px solid #f0ddd7' }}>
          <h3 style={{ color: '#2d1f1f', fontWeight: '700', marginBottom: '1.2rem', fontSize: '1rem' }}>Choose Payment Method</h3>

          {[
            { id: 'card', icon: '💳', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay, Amex' },
            { id: 'upi', icon: '📱', label: 'UPI Payment', sub: 'GPay, PhonePe, Paytm, BHIM' },
            { id: 'netbanking', icon: '🏦', label: 'Net Banking', sub: 'All major banks supported' },
          ].map(m => (
            <div key={m.id} onClick={() => { setPaymentMethod(m.id); if (m.id !== 'netbanking') setStep(m.id); else { setStep('processing'); setTimeout(() => setStep('success'), 2500); } }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', border: '1.5px solid #f0ddd7', borderRadius: '14px', marginBottom: '10px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a99a'; e.currentTarget.style.background = '#fdf8f6'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0ddd7'; e.currentTarget.style.background = 'white'; }}>
              <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #fdf0eb, #f5e0d8)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>{m.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#2d1f1f', fontWeight: '600', margin: 0, fontSize: '0.9rem' }}>{m.label}</p>
                <p style={{ color: '#a08880', fontSize: '0.75rem', margin: 0 }}>{m.sub}</p>
              </div>
              <span style={{ color: '#c9a99a', fontSize: '1.1rem' }}>›</span>
            </div>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.8rem' }}>🔒</span>
            <p style={{ color: '#a08880', fontSize: '0.75rem', margin: 0 }}>Secured by 256-bit SSL encryption</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ===== STEP: Card Payment =====
  if (step === 'card') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdf6f3, #f9ede8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{FLOWER_CSS}</style>
      <div style={{ maxWidth: '420px', width: '100%', animation: 'fadeIn 0.4s ease' }}>

        {/* Card Preview */}
        <div style={{ background: 'linear-gradient(135deg, #c9a99a, #8a5a4a)', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.2rem', boxShadow: '0 10px 30px rgba(201,169,154,0.4)', color: 'white', position: 'relative', overflow: 'hidden', minHeight: '160px' }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '-20px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🌸</span>
            {cardType && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>{cardType.label}</span>}
          </div>
          <p style={{ fontFamily: 'monospace', fontSize: '1.15rem', letterSpacing: '3px', margin: '0 0 1rem', opacity: 0.9 }}>{cardNum || '•••• •••• •••• ••••'}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.65rem', opacity: 0.7, margin: '0 0 2px', textTransform: 'uppercase' }}>Card Holder</p>
              <p style={{ fontSize: '0.85rem', fontWeight: '600', margin: 0 }}>{cardName || 'YOUR NAME'}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.65rem', opacity: 0.7, margin: '0 0 2px', textTransform: 'uppercase' }}>Expires</p>
              <p style={{ fontSize: '0.85rem', fontWeight: '600', margin: 0 }}>{expiry || 'MM/YY'}</p>
            </div>
          </div>
        </div>

        {/* Card Form */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(201,169,154,0.2)', border: '1px solid #f0ddd7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
            <h3 style={{ color: '#2d1f1f', fontWeight: '700', margin: 0, fontSize: '1rem' }}>Card Details</h3>
            <span style={{ color: '#b8887a', fontWeight: '800', fontSize: '1rem' }}>₹{totalAmount.toLocaleString()}</span>
          </div>

          {error && <div style={{ background: '#fdeee9', border: '1px solid #f0c4b8', color: '#a05040', padding: '10px 13px', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.82rem' }}>⚠️ {error}</div>}

          {/* Card Number */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#6b5a55', fontSize: '0.74rem', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>Card Number</label>
            <input value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={19}
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #f0ddd7', borderRadius: '12px', fontSize: '0.95rem', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', color: '#2d1f1f' }}
              onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#6b5a55', fontSize: '0.74rem', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>Expiry Date</label>
              <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" maxLength={5}
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #f0ddd7', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', color: '#2d1f1f' }}
                onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#6b5a55', fontSize: '0.74rem', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>CVV</label>
              <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="•••" type="password" maxLength={4}
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #f0ddd7', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', color: '#2d1f1f' }}
                onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
            </div>
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', color: '#6b5a55', fontSize: '0.74rem', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>Cardholder Name</label>
            <input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Name on card"
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #f0ddd7', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', color: '#2d1f1f' }}
              onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
          </div>

          <button onClick={processPayment}
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #c9a99a, #b8887a)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 6px 20px rgba(201,169,154,0.4)', marginBottom: '10px' }}>
            🔒 Pay ₹{totalAmount.toLocaleString()}
          </button>
          <button onClick={() => setStep('method')}
            style={{ width: '100%', padding: '10px', background: 'transparent', color: '#a08880', border: 'none', cursor: 'pointer', fontSize: '0.84rem' }}>
            ← Back to payment methods
          </button>
        </div>
      </div>
    </div>
  );

  // ===== STEP: UPI Payment =====
  if (step === 'upi') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdf6f3, #f9ede8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{FLOWER_CSS}</style>
      <div style={{ maxWidth: '400px', width: '100%', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(201,169,154,0.2)', border: '1px solid #f0ddd7' }}>
          <h3 style={{ color: '#2d1f1f', fontWeight: '700', marginBottom: '0.5rem', fontSize: '1rem' }}>📱 UPI Payment</h3>
          <p style={{ color: '#a08880', fontSize: '0.82rem', marginBottom: '1.5rem' }}>Pay ₹{totalAmount.toLocaleString()} using UPI</p>

          {/* UPI Apps */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1.5rem' }}>
            {[{ name: 'GPay', icon: '🟢', color: '#34a853' }, { name: 'PhonePe', icon: '🟣', color: '#5f259f' }, { name: 'Paytm', icon: '🔵', color: '#00baf2' }, { name: 'BHIM', icon: '🟠', color: '#ff6b35' }].map(app => (
              <div key={app.name} onClick={() => setUpiId(`user@${app.name.toLowerCase()}`)}
                style={{ padding: '10px 6px', border: '1.5px solid #f0ddd7', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a99a'; e.currentTarget.style.background = '#fdf8f6'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0ddd7'; e.currentTarget.style.background = 'white'; }}>
                <p style={{ fontSize: '1.5rem', margin: '0 0 4px' }}>{app.icon}</p>
                <p style={{ color: '#6b5a55', fontSize: '0.7rem', fontWeight: '600', margin: 0 }}>{app.name}</p>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', color: '#6b5a55', fontSize: '0.74rem', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>Enter UPI ID</label>
            <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi"
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #f0ddd7', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', color: '#2d1f1f' }}
              onFocus={e => e.target.style.borderColor = '#c9a99a'} onBlur={e => e.target.style.borderColor = '#f0ddd7'} />
          </div>

          {error && <div style={{ background: '#fdeee9', border: '1px solid #f0c4b8', color: '#a05040', padding: '10px 13px', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.82rem' }}>⚠️ {error}</div>}

          <button onClick={processPayment}
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #c9a99a, #b8887a)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 6px 20px rgba(201,169,154,0.4)', marginBottom: '10px' }}>
            💸 Pay ₹{totalAmount.toLocaleString()} via UPI
          </button>
          <button onClick={() => setStep('method')}
            style={{ width: '100%', padding: '10px', background: 'transparent', color: '#a08880', border: 'none', cursor: 'pointer', fontSize: '0.84rem' }}>
            ← Back to payment methods
          </button>
        </div>
      </div>
    </div>
  );

  // ===== STEP: Processing =====
  if (step === 'processing') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdf6f3, #f9ede8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{FLOWER_CSS}</style>
      <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ width: '80px', height: '80px', border: '4px solid #f0ddd7', borderTop: '4px solid #c9a99a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }} />
        <h3 style={{ color: '#2d1f1f', fontWeight: '700', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', marginBottom: '0.5rem' }}>Processing Payment...</h3>
        <p style={{ color: '#a08880', fontSize: '0.88rem' }}>Please wait, do not close this page 🌸</p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '1rem' }}>
          {['🔒 Secure', '⚡ Fast', '✅ Safe'].map((t, i) => (
            <span key={i} style={{ background: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', color: '#a08880', fontWeight: '600', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );

  // ===== STEP: Success =====
  if (step === 'success') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdf6f3, #f9ede8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{FLOWER_CSS}</style>
      <div style={{ maxWidth: '420px', width: '100%', textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
        <div style={{ background: 'white', borderRadius: '28px', padding: '2.5rem', boxShadow: '0 20px 60px rgba(201,169,154,0.3)', border: '1px solid #f0ddd7' }}>
          <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #4ade80, #22c55e)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem', animation: 'successPop 0.5s ease', boxShadow: '0 8px 25px rgba(74,222,128,0.4)' }}>✅</div>
          <h2 style={{ color: '#2d1f1f', fontWeight: '700', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', marginBottom: '0.5rem' }}>Payment Successful!</h2>
          <p style={{ color: '#a08880', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Your booking is confirmed 🌸</p>

          {/* Receipt */}
          <div style={{ background: '#fdf8f6', borderRadius: '16px', padding: '1.2rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            {[
              { label: 'Event', value: eventName },
              { label: 'Tickets', value: `${seats} ticket${seats > 1 ? 's' : ''}` },
              { label: 'Amount Paid', value: `₹${totalAmount.toLocaleString()}`, bold: true, color: '#2e7d52' },
              { label: 'Payment Method', value: paymentMethod === 'card' ? '💳 Card' : paymentMethod === 'upi' ? '📱 UPI' : '🏦 Net Banking' },
              { label: 'Transaction ID', value: 'TXN' + Date.now().toString().slice(-8) },
              { label: 'Status', value: '✅ Confirmed', color: '#2e7d52', bold: true },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 5 ? '1px solid #f0ddd7' : 'none' }}>
                <span style={{ color: '#a08880', fontSize: '0.8rem' }}>{item.label}</span>
                <span style={{ color: item.color || '#2d1f1f', fontWeight: item.bold ? '700' : '500', fontSize: '0.83rem' }}>{item.value}</span>
              </div>
            ))}
          </div>

          <button onClick={() => navigate('/my-bookings')}
            style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #c9a99a, #b8887a)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '0.92rem', cursor: 'pointer', boxShadow: '0 6px 20px rgba(201,169,154,0.4)', marginBottom: '10px' }}>
            🎫 View My Bookings
          </button>
          <button onClick={() => navigate('/home')}
            style={{ width: '100%', padding: '10px', background: 'transparent', color: '#a08880', border: 'none', cursor: 'pointer', fontSize: '0.84rem' }}>
            🏠 Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
