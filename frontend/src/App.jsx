import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EventDetails from "./pages/EventDetails";
import MyBookings from "./pages/MyBookings";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import CreateEvent from "./pages/Admin/CreateEvent";
import ManageEvents from "./pages/Admin/ManageEvents";
import AllBookings from "./pages/Admin/AllBookings";

const getUser = () => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } };
const getToken = () => localStorage.getItem('token');

// Not logged in → login page
function GuestOnly({ children }) {
  if (!getToken()) return children;
  return getUser().role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/home" replace />;
}

// Logged in users only (NOT admin)
function UserOnly({ children }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  if (getUser().role === 'admin') return <Navigate to="/admin" replace />;
  return children;
}

// Admin only
function AdminOnly({ children }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  if (getUser().role !== 'admin') return <Navigate to="/home" replace />;
  return children;
}

function App() {
  const token = getToken();
  const role = getUser().role;

  return (
    <Router>
      <Routes>
        {/* Root: auto redirect based on role */}
        <Route path="/" element={
          !token ? <Navigate to="/login" replace /> :
          role === 'admin' ? <Navigate to="/admin" replace /> :
          <Navigate to="/home" replace />
        } />

        {/* Auth pages - guests only */}
        <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

        {/* USER pages */}
        <Route element={<UserOnly><MainLayout /></UserOnly>}>
          <Route path="/home" element={<Home />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Route>

        {/* ADMIN pages */}
        <Route path="/admin" element={<AdminOnly><DashboardLayout /></AdminOnly>}>
          <Route index element={<AdminDashboard />} />
          <Route path="create-event" element={<CreateEvent />} />
          <Route path="manage-events" element={<ManageEvents />} />
          <Route path="bookings" element={<AllBookings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={
          !token ? <Navigate to="/login" replace /> :
          role === 'admin' ? <Navigate to="/admin" replace /> :
          <Navigate to="/home" replace />
        } />
      </Routes>
    </Router>
  );
}

export default App;
