import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

function DashboardLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fdf6f3', fontFamily: "'DM Sans', sans-serif" }}>
      <AdminSidebar />
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
export default DashboardLayout;
