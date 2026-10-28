import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PortalSwitcherTabs from '../components/PortalSwitcherTabs';

const Login = () => {
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
      if (res?.user && res.user.role !== 'student') {
        setNotice(`Note: Signed in with ${res.user.role.replace('_', ' ')} account. Redirecting to your dashboard...`);
        setTimeout(() => navigate('/dashboard'), 1200);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStudentLogin = async () => {
    try {
      setLoading(true);
      setError('');
      setNotice('');
      await quickLogin('student');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = async (role) => {
    try {
      setLoading(true);
      setError('');
      setNotice('');
      await quickLogin(role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
          <div className="card-glass p-4 p-md-5">
            {/* Role Portal Switcher Tabs */}
            <PortalSwitcherTabs activeRole="student" />

            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center text-white rounded-4 mb-3"
                style={{
                  width: '58px',
                  height: '58px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                  boxShadow: '0 8px 22px rgba(14, 165, 233, 0.35)',
                }}
              >
                <i className="bi bi-mortarboard-fill fs-3"></i>
              </div>
              <div className="d-flex justify-content-center mb-2">
                <span
                  className="badge px-3 py-1 rounded-pill fw-semibold"
                  style={{ background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', fontSize: '0.72rem', letterSpacing: '0.04em' }}
                >
                  <i className="bi bi-person-fill me-1"></i> STUDENT CAMPUS PORTAL
                </span>
              </div>
              <h2 className="fw-bold mb-1">Student Sign In</h2>
              <p className="text-muted small">
                Book study spaces, computer labs, sports arenas & equipment
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
              style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold" style={{ fontSize: '0.75rem', color: '#0369a1' }}>
                  <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Quick 1-Click Demo Access
                </span>
                <span className="badge bg-white text-secondary border" style={{ fontSize: '0.65rem' }}>
                  Honour David
                </span>
              </div>
              <button
                type="button"
                onClick={handleQuickStudentLogin}
                disabled={loading}
                className="btn btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(14, 165, 233, 0.25)',
                }}
              >
                <i className="bi bi-person-check-fill"></i>
                <span>Sign In as Student (student@campus.edu)</span>
              </button>
            </div>

            {/* Manual Form Login */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small text-muted">Campus Student Email</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-primary" style={{ borderColor: '#cbd5e1' }}>
                    <i className="bi bi-envelope-fill"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control form-control-dark"
                    placeholder="e.g. student@campus.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <label className="form-label small text-muted mb-1">Student Account Password</label>
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>Demo: password123</span>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light text-primary" style={{ borderColor: '#cbd5e1' }}>
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
                className="btn btn-primary-gradient w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right"></i>
                    <span>Sign In to Student Dashboard</span>
                  </>
                )}
              </button>
            </form>

            {/* Student Privileges Feature Box */}
            <div className="portal-perk-box mt-4">
              <div className="text-uppercase fw-bold text-muted mb-2" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                <i className="bi bi-mortarboard text-primary me-1"></i> Student Portal Features
              </div>
              <div className="portal-perk-item">
                <i className="bi bi-calendar-check text-primary"></i>
                <span><strong>Instant Reservations:</strong> Reserve open classrooms, study pods & computer workstations.</span>
              </div>
              <div className="portal-perk-item">
                <i className="bi bi-shield-check text-success"></i>
                <span><strong>Live Clash Detection:</strong> Immediate notice if a timeslot overlaps or is under maintenance.</span>
              </div>
              <div className="portal-perk-item">
                <i className="bi bi-lightbulb-fill text-warning"></i>
                <span><strong>Smart Recommendations:</strong> AI-powered suggestions tailored to team size and amenities.</span>
              </div>
            </div>

            <div className="text-center mt-3">
              <span className="text-muted small">Don't have an account? </span>
              <Link to="/register?role=student" className="small text-primary text-decoration-none fw-semibold">
                Register as Student
              </Link>
            </div>

            {/* Quick Evaluation Demo Accounts */}
            <div className="mt-4 pt-3 border-top" style={{ borderColor: 'var(--surface-border-sky)' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-uppercase fw-bold text-muted" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                  <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Switch Portal Persona
                </span>
                <span className="badge bg-light text-secondary border" style={{ fontSize: '0.65rem' }}>Pass: password123</span>
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <Link
                    to="/login/faculty"
                    className="btn btn-outline-info btn-sm w-100 text-start py-2 px-2 text-decoration-none"
                  >
                    <div className="fw-bold small text-dark"><i className="bi bi-award-fill me-1 text-info"></i> Faculty Portal</div>
                    <div className="text-muted" style={{ fontSize: '0.68rem' }}>faculty@campus.edu</div>
                  </Link>
                </div>

                <div className="col-6">
                  <Link
                    to="/login/resource-manager"
                    className="btn btn-outline-warning btn-sm w-100 text-start py-2 px-2 text-decoration-none"
                  >
                    <div className="fw-bold small text-dark"><i className="bi bi-building-gear me-1 text-warning"></i> Manager Portal</div>
                    <div className="text-muted" style={{ fontSize: '0.68rem' }}>manager@campus.edu</div>
                  </Link>
                </div>

                <div className="col-6">
                  <Link
                    to="/login/admin"
                    className="btn btn-outline-danger btn-sm w-100 text-start py-2 px-2 text-decoration-none"
                  >
                    <div className="fw-bold small text-dark"><i className="bi bi-shield-lock-fill me-1 text-danger"></i> Admin Portal</div>
                    <div className="text-muted" style={{ fontSize: '0.68rem' }}>admin@campus.edu</div>
                  </Link>
                </div>

                <div className="col-6">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('student')}
                    className="btn btn-outline-primary btn-sm w-100 text-start py-2 px-2 active"
                  >
                    <div className="fw-bold small text-dark"><i className="bi bi-person-fill me-1 text-primary"></i> Quick Student</div>
                    <div className="text-muted" style={{ fontSize: '0.68rem' }}>student@campus.edu</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
