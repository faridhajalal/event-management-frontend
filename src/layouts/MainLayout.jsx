import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

function MainLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fdf6f3', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <main style={{ flex: 1 }}><Outlet /></main>
      <footer style={{ background: '#2d1f1f', color: 'rgba(255,255,255,0.45)', textAlign: 'center', padding: '1.5rem', fontSize: '0.8rem' }}>
        © 2025 EventHub. Made with 🌸
      </footer>
    </div>
  );
}
export default MainLayout;
