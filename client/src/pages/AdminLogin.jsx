import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PortalSwitcherTabs from '../components/PortalSwitcherTabs';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser, quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      const res = await loginUser(email, password);
      if (res?.user && res.user.role !== 'admin') {
        setNotice(`Note: Signed in with ${res.user.role.replace('_', ' ')} account. Redirecting to dashboard...`);
        setTimeout(() => navigate('/dashboard'), 1200);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Administrator login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    try {
      setLoading(true);
      setError('');
      setNotice('');
      await quickLogin('admin');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Quick demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
          <div className="card-glass-admin p-4 p-md-5">
            {/* Role Portal Switcher Tabs */}
            <PortalSwitcherTabs activeRole="admin" />

            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center text-white rounded-4 mb-3"
                style={{
                  width: '58px',
                  height: '58px',
                  background: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)',
                  boxShadow: '0 8px 22px rgba(220, 38, 38, 0.35)',
                }}
              >
                <i className="bi bi-shield-lock-fill fs-3"></i>
              </div>
              <div className="d-flex justify-content-center mb-2">
                <span
                  className="badge px-3 py-1 rounded-pill fw-semibold"
                  style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '0.72rem', letterSpacing: '0.04em' }}
                >
                  <i className="bi bi-shield-check me-1"></i> SYSTEM GOVERNANCE & SECURITY
                </span>
              </div>
              <h2 className="fw-bold mb-1" style={{ color: '#7f1d1d' }}>Administrator Sign In</h2>
              <p className="text-muted small">
                User management, RBAC enforcement, system audit logs & governance
              </p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-circle-fill"></i>
                <span>{error}</span>
              </div>
            )}

            {notice && (
              <div className="alert alert-info py-2 small d-flex align-items-center gap-2">
                <i className="bi bi-info-circle-fill"></i>
                <span>{notice}</span>
              </div>
            )}

            {/* Quick 1-Click Evaluation Login */}
            <div
              className="p-3 mb-4 rounded-3 border"
              style={{ background: '#fef2f2', borderColor: '#fecaca' }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold" style={{ fontSize: '0.75rem', color: '#991b1b' }}>
                  <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Quick 1-Click Demo Access
                </span>
                <span className="badge bg-white text-secondary border" style={{ fontSize: '0.65rem' }}>
                  Dr. Vikram Malhotra
                </span>
              </div>
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                disabled={loading}
                className="btn btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)',
                }}
              >
                <i className="bi bi-person-check-fill"></i>
                <span>Sign In as Administrator (admin@campus.edu)</span>
              </button>
            </div>

            {/* Manual Form Login */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small text-muted">Admin Account Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-light" style={{ borderColor: '#cbd5e1', color: '#dc2626' }}>
                    <i className="bi bi-shield-lock-fill"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control form-control-dark"
                    placeholder="e.g. admin@campus.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <label className="form-label small text-muted mb-1">Root / Administrator Password</label>
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>Demo: password123</span>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light" style={{ borderColor: '#cbd5e1', color: '#dc2626' }}>
                    <i className="bi bi-key-fill"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control form-control-dark"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-admin-gradient w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Verifying Security Clearance...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-shield-check"></i>
                    <span>Sign In to System Console</span>
                  </>
                )}
              </button>
            </form>

            {/* Administrator Privileges Feature Box */}
            <div className="portal-perk-box mt-4">
              <div className="text-uppercase fw-bold text-muted mb-2" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                <i className="bi bi-shield-shaded text-danger me-1"></i> Root Governance Capabilities
              </div>
              <div className="portal-perk-item">
                <i className="bi bi-people-fill text-danger"></i>
                <span><strong>User Directory:</strong> Create, promote, activate or deactivate accounts campus-wide.</span>
              </div>
              <div className="portal-perk-item">
                <i className="bi bi-journal-text text-primary"></i>
                <span><strong>Audit Logs:</strong> Complete tamper-evident record of all system events and operations.</span>
              </div>
              <div className="portal-perk-item">
                <i className="bi bi-hdd-network-fill text-secondary"></i>
                <span><strong>System Oversight:</strong> Full override capabilities across all campus facilities.</span>
              </div>
            </div>

            <div className="text-center mt-3">
              <span className="text-muted small">Return to </span>
              <Link to="/login" className="small text-decoration-none fw-semibold" style={{ color: '#0284c7' }}>
                Student Campus Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
