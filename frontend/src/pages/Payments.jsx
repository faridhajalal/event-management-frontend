import { useState, useEffect } from 'react';
import API from '../services/axios';

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await API.get('/payments/my');
        setPayments(res.data.payments || []);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading)
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
          <p>Loading payments...</p>
        </div>
      </div>
    );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1
        style={{
          color: 'white',
          fontSize: '2rem',
          fontWeight: '800',
          marginBottom: '2rem',
        }}
      >
        My Payments
      </h1>

      {payments.length === 0 ? (
        <div
          style={{
            background: 'rgba(255,255,255,0.07)',
            borderRadius: '16px',
            padding: '4rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>No payments yet</p>
        </div>
      ) : (
        <div
          style={{
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.85rem',
            }}
          >
            <thead>
              <tr style={{ background: 'rgba(124,58,237,0.3)' }}>
                {['Transaction ID', 'Event', 'Amount', 'Method', 'Status', 'Date'].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: '14px 16px',
                        color: 'rgba(255,255,255,0.8)',
                        fontWeight: '600',
                        fontSize: '0.75rem',
                        textAlign: 'left',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, i) => (
                <tr
                  key={payment._id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.03)',
                  }}
                >
                  <td
                    style={{
                      padding: '14px 16px',
                      color: 'rgba(255,255,255,0.5)',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                    }}
                  >
                    {payment.transactionId?.slice(-10)}
                  </td>
                  <td
                    style={{
                      padding: '14px 16px',
                      color: 'white',
                      fontWeight: '500',
                    }}
                  >
                    {payment.booking?.event?.name || 'N/A'}
                  </td>
                  <td
                    style={{
                      padding: '14px 16px',
                      color: '#a78bfa',
                      fontWeight: '700',
                    }}
                  >
                    ₹{payment.amount}
                  </td>
                  <td
                    style={{
                      padding: '14px 16px',
                      color: 'rgba(255,255,255,0.7)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {payment.paymentMethod}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.72rem',
                        fontWeight: '600',
                        background:
                          payment.status === 'success' ? '#d1fae5' : '#fee2e2',
                        color: payment.status === 'success' ? '#065f46' : '#991b1b',
                      }}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '14px 16px',
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.8rem',
                    }}
                  >
                    {new Date(payment.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Payments;