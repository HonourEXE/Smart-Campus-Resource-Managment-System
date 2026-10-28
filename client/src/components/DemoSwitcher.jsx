import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DemoSwitcher = () => {
  const { user, quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = async (role) => {
    try {
      await quickLogin(role);
      navigate('/dashboard');
    } catch (err) {
      console.error('Quick login failed:', err);
    }
  };

  return (
    <div className="demo-bar d-flex flex-wrap align-items-center justify-content-between gap-2">
      <div className="d-flex align-items-center gap-2">
        <span className="badge text-uppercase text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)', fontSize: '0.75rem' }}>
          <i className="bi bi-mortarboard-fill me-1"></i> Evaluation Demo Bar
        </span>
        <span className="d-none d-md-inline fw-semibold" style={{ fontSize: '0.82rem', color: '#0369a1' }}>
          Quick-switch test persona with 1-click:
        </span>
      </div>

      <div className="d-flex flex-wrap align-items-center gap-2">
        <button
          onClick={() => handleRoleSelect('student')}
          className={`demo-chip ${user?.role === 'student' ? 'active' : ''}`}
          title="Switch to Student account (Honour David)"
        >
          <i className="bi bi-person-fill"></i>
          Student
        </button>

        <button
          onClick={() => handleRoleSelect('faculty')}
          className={`demo-chip ${user?.role === 'faculty' ? 'active' : ''}`}
          title="Switch to Faculty account (Dr. Priya Nair)"
        >
          <i className="bi bi-award-fill"></i>
          Faculty
        </button>

        <button
          onClick={() => handleRoleSelect('resource_manager')}
          className={`demo-chip ${user?.role === 'resource_manager' ? 'active' : ''}`}
          title="Switch to Resource Manager account (Rajesh Verma)"
        >
          <i className="bi bi-building-gear"></i>
          Resource Manager
        </button>

        <button
          onClick={() => handleRoleSelect('admin')}
          className={`demo-chip ${user?.role === 'admin' ? 'active' : ''}`}
          title="Switch to Admin account (Dr. Vikram Malhotra)"
        >
          <i className="bi bi-shield-lock-fill"></i>
          Admin
        </button>
      </div>
    </div>
  );
};

export default DemoSwitcher;
