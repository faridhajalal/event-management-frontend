import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EventDetails from "./pages/EventDetails";
import MyBookings from "./pages/MyBookings";
import Payments from "./pages/Payments";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import CreateEvent from "./pages/Admin/CreateEvent";
import ManageEvents from "./pages/Admin/ManageEvents";
import AllBookings from "./pages/Admin/AllBookings";
import SuggestEvent from "./pages/SuggestEvent";
import FeedbackChatbot from "./components/Feedbackchatbot";

const getUser = () => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } };
const getToken = () => localStorage.getItem('token');

function GuestOnly({ children }) {
  if (!getToken()) return children;
  return getUser().role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/home" replace />;
}

function UserOnly({ children }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  if (getUser().role === 'admin') return <Navigate to="/admin" replace />;
  return children;
}

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
        <Route path="/" element={
          !token ? <Navigate to="/login" replace /> :
          role === 'admin' ? <Navigate to="/admin" replace /> :
          <Navigate to="/home" replace />
        } />

        <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

        {/* USER pages */}
        <Route element={<UserOnly><MainLayout /></UserOnly>}>
          <Route path="/home" element={<Home />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/suggest-event" element={<SuggestEvent />} />
          <Route path="/payments" element={<Payments />} />
        </Route>

        {/* ADMIN pages */}
        <Route path="/admin" element={<AdminOnly><DashboardLayout /></AdminOnly>}>
          <Route index element={<AdminDashboard />} />
          <Route path="create-event" element={<CreateEvent />} />
          <Route path="manage-events" element={<ManageEvents />} />
          <Route path="bookings" element={<AllBookings />} />
        </Route>

        <Route path="*" element={
          !token ? <Navigate to="/login" replace /> :
          role === 'admin' ? <Navigate to="/admin" replace /> :
          <Navigate to="/home" replace />
        } />
      </Routes>

      {/* 🌸 Feedback Chatbot - shows on ALL pages when logged in */}
      {token && <FeedbackChatbot />}
    </Router>
  );
}

export default App;
