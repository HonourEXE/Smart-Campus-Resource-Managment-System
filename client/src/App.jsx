import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DemoSwitcher from './components/DemoSwitcher';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import CalendarView from './pages/CalendarView';
import Bookings from './pages/Bookings';
import Maintenance from './pages/Maintenance';
import ResourceManagement from './pages/ResourceManagement';
import Analytics from './pages/Analytics';
import AdminUsers from './pages/AdminUsers';
import Notifications from './pages/Notifications';

const AppContent = () => {
  const { user } = useAuth();

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Demo Quick-Switch Bar for Evaluation Testing */}
      <DemoSwitcher />

      {/* Main Navbar */}
      <Navbar />

      {/* Main Routed Content */}
      <main className="flex-grow-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

          {/* Protected Routes for All Authenticated Campus Roles */}
          <Route element={<ProtectedRoute allowedRoles={['student', 'faculty', 'resource_manager', 'admin']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Protected Routes for Resource Managers & Admins */}
          <Route element={<ProtectedRoute allowedRoles={['resource_manager', 'admin']} />}>
            <Route path="/manage-resources" element={<ResourceManagement />} />
          </Route>

          {/* Protected Routes for Analytics (Faculty, Resource Manager, Admin) */}
          <Route element={<ProtectedRoute allowedRoles={['faculty', 'resource_manager', 'admin']} />}>
            <Route path="/analytics" element={<Analytics />} />
          </Route>

          {/* Protected Routes for System Administrator Only */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>

          {/* Default Route */}
          <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
          <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
