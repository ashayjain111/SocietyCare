import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import FloatingChatbot from './components/common/FloatingChatbot';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ResidentDashboard from './pages/ResidentDashboard';
import NewRequest from './pages/NewRequest';
import MyRequests from './pages/MyRequests';
import RequestDetail from './pages/RequestDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminRequests from './pages/AdminRequests';
import AdminResidents from './pages/AdminResidents';
import AdminPersonnel from './pages/AdminPersonnel';
import AdminPayments from './pages/AdminPayments';
import AdminAnnouncements from './pages/AdminAnnouncements';
import StaffDashboard from './pages/StaffDashboard';
import Payments from './pages/Payments';
import Visitors from './pages/Visitors';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

function AppLayout({ children }) {
  return (
    <div className="min-h-screen" style={{ background: '#f0f4ff' }}>
      <Navbar />
      <main className="page-enter">{children}</main>
      <FloatingChatbot />
    </div>
  );
}

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'staff') return <Navigate to="/staff" />;
  return <Navigate to="/dashboard" />;
}

function ErrorPage({ code, title, message, showHome = true }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="text-8xl font-black text-gradient mb-4">{code}</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500 text-sm mb-8">{message}</p>
        {showHome && (
          <div className="flex items-center justify-center space-x-3">
            <Link to="/" className="btn btn-primary px-6 py-2.5 text-sm">Go Home</Link>
            <button onClick={() => window.history.back()}
              className="btn btn-ghost px-6 py-2.5 text-sm">Go Back</button>
          </div>
        )}
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Home redirect */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Resident routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute roles={['resident']}>
          <AppLayout><ResidentDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/new-request" element={
        <ProtectedRoute roles={['resident']}>
          <AppLayout><NewRequest /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/my-requests" element={
        <ProtectedRoute roles={['resident']}>
          <AppLayout><MyRequests /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/requests/:id" element={
        <ProtectedRoute>
          <AppLayout><RequestDetail /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/payments" element={
        <ProtectedRoute roles={['resident']}>
          <AppLayout><Payments /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/visitors" element={
        <ProtectedRoute roles={['resident']}>
          <AppLayout><Visitors /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><AdminDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/requests" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><AdminRequests /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/residents" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><AdminResidents /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/personnel" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><AdminPersonnel /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/payments" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><AdminPayments /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/announcements" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><AdminAnnouncements /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Staff routes */}
      <Route path="/staff" element={
        <ProtectedRoute roles={['staff']}>
          <AppLayout><StaffDashboard /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Shared routes */}
      <Route path="/profile" element={
        <ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute><AppLayout><Notifications /></AppLayout></ProtectedRoute>
      } />

      {/* Error pages */}
      <Route path="/unauthorized" element={
        <ErrorPage
          code="403"
          title="Access Denied"
          message="You don't have permission to view this page. Contact your administrator if you think this is a mistake."
        />
      } />
      <Route path="*" element={
        <ErrorPage
          code="404"
          title="Page Not Found"
          message="The page you're looking for doesn't exist or has been moved."
        />
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '10px',
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '13px',
              padding: '10px 14px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
