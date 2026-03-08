import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      color: 'rgba(255,255,255,0.7)', padding: '3rem 2rem 1.5rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ color: '#a78bfa', fontWeight: '700', marginBottom: '1rem' }}>🎉 EventEase</h3>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>Discover and book amazing events near you. Your next great experience is just a click away.</p>
          </div>
          <div>
            <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '1rem' }}>Quick Links</h4>
            {['/home', '/my-bookings'].map((path, i) => (
              <Link key={i} to={path} style={{ display: 'block', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                {['Home', 'My Bookings'][i]}
              </Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '1rem' }}>Contact</h4>
            <p style={{ fontSize: '0.85rem' }}>📧 events@eventhub.com</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>📞 +91 98765 43210</p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem' }}>
          © 2025 EventEase. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
export default Footer;