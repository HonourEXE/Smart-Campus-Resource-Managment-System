import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PortalSwitcherTabs from '../components/PortalSwitcherTabs';

const ResourceManagerLogin = () => {
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
      if (res?.user && res.user.role !== 'resource_manager') {
        setNotice(`Note: Signed in with ${res.user.role.replace('_', ' ')} account. Redirecting to dashboard...`);
        setTimeout(() => navigate('/dashboard'), 1200);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Facility manager login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickManagerLogin = async () => {
    try {
      setLoading(true);
      setError('');
      setNotice('');
      await quickLogin('resource_manager');
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
          <div className="card-glass-manager p-4 p-md-5">
            {/* Role Portal Switcher Tabs */}
            <PortalSwitcherTabs activeRole="resource_manager" />

            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center text-white rounded-4 mb-3"
                style={{
                  width: '58px',
                  height: '58px',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  boxShadow: '0 8px 22px rgba(16, 185, 129, 0.35)',
                }}
              >
                <i className="bi bi-building-gear fs-3"></i>
              </div>
              <div className="d-flex justify-content-center mb-2">
                <span
                  className="badge px-3 py-1 rounded-pill fw-semibold"
                  style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontSize: '0.72rem', letterSpacing: '0.04em' }}
                >
                  <i className="bi bi-shield-check me-1"></i> FACILITY & RESOURCE OPERATIONS
                </span>
              </div>
              <h2 className="fw-bold mb-1" style={{ color: '#064e3b' }}>Facility Manager Sign In</h2>
              <p className="text-muted small">
                Centralized facility control, booking approvals & maintenance dispatch
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
              style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold" style={{ fontSize: '0.75rem', color: '#166534' }}>
                  <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Quick 1-Click Demo Access
                </span>
                <span className="badge bg-white text-secondary border" style={{ fontSize: '0.65rem' }}>
                  Rajesh Verma
                </span>
              </div>
              <button
                type="button"
                onClick={handleQuickManagerLogin}
                disabled={loading}
                className="btn btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                }}
              >
                <i className="bi bi-person-check-fill"></i>
                <span>Sign In as Manager (manager@campus.edu)</span>
              </button>
            </div>

            {/* Manual Form Login */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small text-muted">Operations / Manager Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-light" style={{ borderColor: '#cbd5e1', color: '#059669' }}>
                    <i className="bi bi-envelope-at-fill"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control form-control-dark"
                    placeholder="e.g. manager@campus.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <label className="form-label small text-muted mb-1">Manager Account Password</label>
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>Demo: password123</span>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light" style={{ borderColor: '#cbd5e1', color: '#059669' }}>
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
                className="btn btn-manager-gradient w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Verifying Manager Access...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right"></i>
                    <span>Sign In to Facility Command Center</span>
                  </>
                )}
              </button>
            </form>

            {/* Resource Manager Powers Feature Box */}
            <div className="portal-perk-box mt-4">
              <div className="text-uppercase fw-bold text-muted mb-2" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                <i className="bi bi-sliders text-success me-1"></i> Operations Command Privileges
              </div>
              <div className="portal-perk-item">
                <i className="bi bi-calendar2-check-fill text-success"></i>
                <span><strong>Approval Queue:</strong> Approve or reject pending student & faculty reservations in 1 click.</span>
              </div>
              <div className="portal-perk-item">
                <i className="bi bi-tools text-warning"></i>
                <span><strong>Maintenance Workorders:</strong> Flag assets out-of-service to prevent booking collisions.</span>
              </div>
              <div className="portal-perk-item">
                <i className="bi bi-gear-wide-connected text-primary"></i>
                <span><strong>Facility Catalog:</strong> Add, edit, or adjust room capacities, equipment & schedules.</span>
              </div>
            </div>

            <div className="text-center mt-3">
              <span className="text-muted small">New operations staff member? </span>
              <Link to="/register?role=resource_manager" className="small text-decoration-none fw-semibold" style={{ color: '#059669' }}>
                Register for Facility Staff Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceManagerLogin;
