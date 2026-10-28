import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PortalSwitcherTabs from '../components/PortalSwitcherTabs';

const FacultyLogin = () => {
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
      if (res?.user && res.user.role !== 'faculty') {
        setNotice(`Note: Signed in with ${res.user.role.replace('_', ' ')} account. Redirecting to dashboard...`);
        setTimeout(() => navigate('/dashboard'), 1200);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Faculty login failed. Please check institutional credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFacultyLogin = async () => {
    try {
      setLoading(true);
      setError('');
      setNotice('');
      await quickLogin('faculty');
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
          <div className="card-glass-faculty p-4 p-md-5">
            {/* Role Portal Switcher Tabs */}
            <PortalSwitcherTabs activeRole="faculty" />

            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center text-white rounded-4 mb-3"
                style={{
                  width: '58px',
                  height: '58px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
                  boxShadow: '0 8px 22px rgba(79, 70, 229, 0.35)',
                }}
              >
                <i className="bi bi-award-fill fs-3"></i>
              </div>
              <div className="d-flex justify-content-center mb-2">
                <span
                  className="badge px-3 py-1 rounded-pill fw-semibold"
                  style={{ background: '#ede9fe', color: '#4f46e5', border: '1px solid #ddd6fe', fontSize: '0.72rem', letterSpacing: '0.04em' }}
                >
                  <i className="bi bi-mortarboard-fill me-1"></i> FACULTY & ACADEMIC PORTAL
                </span>
              </div>
              <h2 className="fw-bold mb-1" style={{ color: '#1e1b4b' }}>Faculty Sign In</h2>
              <p className="text-muted small">
                Priority seminar reservations, research labs & lecture hall equipment
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
              style={{ background: '#f5f3ff', borderColor: '#ddd6fe' }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold" style={{ fontSize: '0.75rem', color: '#5b21b6' }}>
                  <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Quick 1-Click Demo Access
                </span>
                <span className="badge bg-white text-secondary border" style={{ fontSize: '0.65rem' }}>
                  Dr. Priya Nair
                </span>
              </div>
              <button
                type="button"
                onClick={handleQuickFacultyLogin}
                disabled={loading}
                className="btn btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                }}
              >
                <i className="bi bi-person-check-fill"></i>
                <span>Sign In as Faculty (faculty@campus.edu)</span>
              </button>
            </div>

            {/* Manual Form Login */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small text-muted">Institutional Faculty Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-light" style={{ borderColor: '#cbd5e1', color: '#4f46e5' }}>
                    <i className="bi bi-envelope-at-fill"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control form-control-dark"
                    placeholder="e.g. faculty@campus.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <label className="form-label small text-muted mb-1">Academic Portal Password</label>
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>Demo: password123</span>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light" style={{ borderColor: '#cbd5e1', color: '#4f46e5' }}>
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
                className="btn btn-faculty-gradient w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Authenticating Faculty...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right"></i>
                    <span>Sign In to Faculty Dashboard</span>
                  </>
                )}
              </button>
            </form>

            {/* Faculty Privileges Feature Box */}
            <div className="portal-perk-box mt-4">
              <div className="text-uppercase fw-bold text-muted mb-2" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                <i className="bi bi-check2-all text-primary me-1"></i> Faculty Access Privileges
              </div>
              <div className="portal-perk-item">
                <i className="bi bi-building-check text-success"></i>
                <span><strong>High-Priority Allocation:</strong> Direct reservations for seminar halls & computer labs.</span>
              </div>
              <div className="portal-perk-item">
                <i className="bi bi-bar-chart-fill text-info"></i>
                <span><strong>Resource Analytics:</strong> Departmental usage metrics, peak times, and asset logs.</span>
              </div>
              <div className="portal-perk-item">
                <i className="bi bi-tools text-warning"></i>
                <span><strong>Maintenance Flagging:</strong> Report faulty projector lamps or broken workstations directly.</span>
              </div>
            </div>

            <div className="text-center mt-3">
              <span className="text-muted small">New faculty member or researcher? </span>
              <Link to="/register?role=faculty" className="small text-decoration-none fw-semibold" style={{ color: '#4f46e5' }}>
                Register for Faculty Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyLogin;
