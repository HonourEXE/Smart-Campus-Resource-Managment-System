import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="container py-5 text-center">
        <div className="card-glass p-5 mx-auto" style={{ maxWidth: '520px' }}>
          <i className="bi bi-shield-lock-fill text-danger" style={{ fontSize: '3.5rem' }}></i>
          <h2 className="mt-3">Access Restricted</h2>
          <p className="text-muted mt-2">
            Your current role (<span className="badge bg-secondary">{user.role}</span>) does not have authorization to view this administrative page.
          </p>
          <div className="mt-4">
            <Navigate to="/dashboard" replace />
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
