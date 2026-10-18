import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser, quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginUser(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = async (role) => {
    try {
      setLoading(true);
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
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center text-white rounded-4 mb-3"
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)',
                }}
              >
                <i className="bi bi-shield-lock-fill fs-3"></i>
              </div>
              <h2 className="fw-bold mb-1">Campus Portal Sign In</h2>
              <p className="text-muted small">
                Access real-time reservations, approvals, and smart campus facilities
              </p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-circle-fill"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small text-muted">Campus Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
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
                <label className="form-label small text-muted">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
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
                    <span>Sign In to Dashboard</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-3">
              <span className="text-muted small">Don't have an account? </span>
              <Link to="/register" className="small text-info text-decoration-none fw-semibold">
                Register here
              </Link>
            </div>

            {/* Quick Evaluation Demo Accounts */}
            <div className="mt-4 pt-3 border-top border-secondary">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-uppercase fw-bold text-muted" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                  <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Quick Demo Logins
                </span>
                <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>Pass: password123</span>
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('student')}
                    className="btn btn-outline-primary btn-sm w-100 text-start py-2 px-2"
                  >
                    <div className="fw-bold small text-white">Student</div>
                    <div className="text-muted" style={{ fontSize: '0.68rem' }}>student@campus.edu</div>
                  </button>
                </div>

                <div className="col-6">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('faculty')}
                    className="btn btn-outline-info btn-sm w-100 text-start py-2 px-2"
                  >
                    <div className="fw-bold small text-white">Faculty</div>
                    <div className="text-muted" style={{ fontSize: '0.68rem' }}>faculty@campus.edu</div>
                  </button>
                </div>

                <div className="col-6">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('resource_manager')}
                    className="btn btn-outline-warning btn-sm w-100 text-start py-2 px-2"
                  >
                    <div className="fw-bold small text-white">Manager</div>
                    <div className="text-muted" style={{ fontSize: '0.68rem' }}>manager@campus.edu</div>
                  </button>
                </div>

                <div className="col-6">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin')}
                    className="btn btn-outline-danger btn-sm w-100 text-start py-2 px-2"
                  >
                    <div className="fw-bold small text-white">Admin</div>
                    <div className="text-muted" style={{ fontSize: '0.68rem' }}>admin@campus.edu</div>
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
