import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/axios';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [payMethod, setPayMethod] = useState('card');
  const [paying, setPaying] = useState(false);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await API.get('/bookings/my');
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Fetch bookings error:', err);
    } finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking? This cannot be undone.')) return;
    try {
      await API.put(`/bookings/${id}/cancel`, {});
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handlePayment = async () => {
    setPaying(true);
    try {
      await API.post('/payments', {
        bookingId: selectedBooking._id,
        paymentMethod: payMethod
      });
      alert('✅ Payment successful! 🎉');
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally { setPaying(false); }
  };

  const statusStyle = (status) => ({
    confirmed: { bg: '#edf5f0', color: '#3a7a5a' },
    pending: { bg: '#fef9ec', color: '#8a7040' },
    cancelled: { bg: '#fdeee9', color: '#a05040' },
  }[status] || { bg: '#f5f5f5', color: '#666' });

  const payStyle = (status) => ({
    paid: { bg: '#edf5f0', color: '#3a7a5a' },
    unpaid: { bg: '#fdeee9', color: '#a05040' },
    refunded: { bg: '#e8f0fe', color: '#3060a0' },
  }[status] || { bg: '#f5f5f5', color: '#666' });

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌸</div>
        <p style={{ color: '#c9a99a', fontFamily: "'DM Sans', sans-serif" }}>Loading your bookings...</p>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#2d1f1f', fontSize: '2rem', fontWeight: '700', margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>
          My Bookings
        </h1>
        <p style={{ color: '#a08880', fontSize: '0.84rem', marginTop: '4px' }}>
          {bookings.length} booking{bookings.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Empty State */}
      {bookings.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '20px', padding: '5rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(201,169,154,0.1)', border: '1px solid #f5e8e3' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎫</div>
          <h2 style={{ color: '#2d1f1f', marginBottom: '0.5rem', fontFamily: "'Cormorant Garamond', serif" }}>No Bookings Yet</h2>
          <p style={{ color: '#a08880', marginBottom: '2rem', fontSize: '0.9rem' }}>Start exploring amazing events!</p>
          <Link to="/home" style={{ background: 'linear-gradient(135deg, #c9a99a, #b8887a)', color: 'white', padding: '12px 30px', borderRadius: '12px', textDecoration: 'none', fontWeight: '600' }}>
            Browse Events 🌸
          </Link>
        </div>

      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookings.map(booking => (
            <div key={booking._id} style={{
              background: 'white', borderRadius: '18px', padding: '1.3rem',
              boxShadow: '0 4px 20px rgba(201,169,154,0.1)', border: '1px solid #f5e8e3',
              display: 'grid', gridTemplateColumns: '90px 1fr auto', gap: '1.2rem', alignItems: 'center'
            }}>
              {/* Event Image */}
              <img
                src={booking.event?.image || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&q=80'}
                alt={booking.event?.name}
                style={{ width: '90px', height: '70px', objectFit: 'cover', borderRadius: '12px' }}
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&q=80'; }}
              />

              {/* Booking Info */}
              <div>
                <h3 style={{ color: '#2d1f1f', fontWeight: '700', fontSize: '0.98rem', marginBottom: '4px' }}>
                  {booking.event?.name}
                </h3>
                <p style={{ color: '#a08880', fontSize: '0.76rem', marginBottom: '6px' }}>
                  📍 {booking.event?.venue || '—'} &nbsp;•&nbsp;
                  📅 {booking.event?.date ? new Date(booking.event.date).toLocaleDateString('en-IN') : '—'} &nbsp;•&nbsp;
                  🎫 {booking.numberOfTickets} ticket{booking.numberOfTickets > 1 ? 's' : ''} &nbsp;•&nbsp;
                  <strong style={{ color: '#c9a99a' }}>₹{booking.totalAmount}</strong>
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700',
                    background: statusStyle(booking.status).bg,
                    color: statusStyle(booking.status).color
                  }}>
                    {booking.status?.toUpperCase()}
                  </span>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700',
                    background: payStyle(booking.paymentStatus).bg,
                    color: payStyle(booking.paymentStatus).color
                  }}>
                    {booking.paymentStatus?.toUpperCase()}
                  </span>
                  {booking.paymentMethod && (
                    <span style={{ color: '#a08880', fontSize: '0.7rem', fontStyle: 'italic' }}>
                      via {booking.paymentMethod}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '100px' }}>
                {booking.paymentStatus === 'unpaid' && booking.status !== 'cancelled' && (
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    style={{
                      background: 'linear-gradient(135deg, #8aad9a, #6a9a7a)',
                      color: 'white', border: 'none', padding: '8px 16px',
                      borderRadius: '10px', cursor: 'pointer', fontWeight: '600',
                      fontSize: '0.78rem', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap'
                    }}>
                    💳 Pay Now
                  </button>
                )}
                {booking.status === 'paid' && (
                  <span style={{ color: '#3a7a5a', fontSize: '0.78rem', fontWeight: '700', textAlign: 'center' }}>
                    ✅ Paid
                  </span>
                )}
                {booking.status !== 'cancelled' && (
                  <button
                    onClick={() => handleCancel(booking._id)}
                    style={{
                      background: '#fdeee9', color: '#a05040',
                      border: '1px solid #f0c4b8', padding: '8px 16px',
                      borderRadius: '10px', cursor: 'pointer', fontWeight: '600',
                      fontSize: '0.78rem', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap'
                    }}>
                    ✕ Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Payment Modal ── */}
      {selectedBooking && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(45,31,31,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', padding: '2rem',
            width: '100%', maxWidth: '420px',
            boxShadow: '0 30px 60px rgba(45,31,31,0.3)'
          }}>
            {/* Modal Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: '700', color: '#2d1f1f', margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem' }}>
                Complete Payment
              </h2>
              <p style={{ color: '#a08880', fontSize: '0.84rem', marginTop: '4px' }}>
                {selectedBooking.event?.name}
              </p>
            </div>

            {/* Amount Summary */}
            <div style={{ background: '#fdf6f3', borderRadius: '14px', padding: '1rem', marginBottom: '1.5rem', border: '1px solid #f5e8e3' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a08880', fontSize: '0.84rem', marginBottom: '6px' }}>
                <span>Tickets</span>
                <span>{selectedBooking.numberOfTickets}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a08880', fontSize: '0.84rem', marginBottom: '6px' }}>
                <span>Price per ticket</span>
                <span>₹{selectedBooking.event?.price}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#2d1f1f', borderTop: '2px dashed #f0ddd7', paddingTop: '8px', marginTop: '4px' }}>
                <span>Total</span>
                <span style={{ color: '#c9a99a', fontSize: '1.1rem' }}>₹{selectedBooking.totalAmount}</span>
              </div>
            </div>

            {/* Payment Method */}
            <p style={{ fontWeight: '700', color: '#6b5a55', marginBottom: '10px', fontSize: '0.84rem' }}>
              Payment Method
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1.5rem' }}>
              {[
                { value: 'card', icon: '💳', label: 'Card' },
                { value: 'upi', icon: '📱', label: 'UPI' },
                { value: 'netbanking', icon: '🏦', label: 'Net Banking' },
                { value: 'wallet', icon: '👛', label: 'Wallet' }
              ].map(m => (
                <button key={m.value} onClick={() => setPayMethod(m.value)} style={{
                  padding: '12px', borderRadius: '12px', fontFamily: "'DM Sans', sans-serif",
                  border: `2px solid ${payMethod === m.value ? '#c9a99a' : '#f0ddd7'}`,
                  background: payMethod === m.value ? '#fdeee9' : 'white',
                  color: payMethod === m.value ? '#c9a99a' : '#6b5a55',
                  cursor: 'pointer', fontWeight: '600', fontSize: '0.84rem',
                  transition: 'all 0.2s'
                }}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setSelectedBooking(null); setPaying(false); }}
                style={{
                  flex: 1, background: '#f5e8e3', color: '#a08880', border: 'none',
                  padding: '13px', borderRadius: '12px', cursor: 'pointer',
                  fontWeight: '600', fontFamily: "'DM Sans', sans-serif"
                }}>
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={paying}
                style={{
                  flex: 2,
                  background: paying ? 'rgba(201,169,154,0.5)' : 'linear-gradient(135deg, #c9a99a, #b8887a)',
                  color: 'white', border: 'none', padding: '13px', borderRadius: '12px',
                  cursor: paying ? 'not-allowed' : 'pointer',
                  fontWeight: '700', fontFamily: "'DM Sans', sans-serif",
                  boxShadow: paying ? 'none' : '0 4px 14px rgba(201,169,154,0.4)',
                  opacity: paying ? 0.7 : 1, transition: 'all 0.2s'
                }}>
                {paying ? '⏳ Processing...' : '✅ Confirm Payment'}
              </button>
            </div>

            <p style={{ textAlign: 'center', color: '#c0a0a0', fontSize: '0.72rem', marginTop: '0.8rem' }}>
              🔒 Secure payment • Your data is safe
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;