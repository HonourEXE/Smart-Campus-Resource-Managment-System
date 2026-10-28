import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [searchParams] = useSearchParams();
  const queryRole = searchParams.get('role');

  const validRoles = ['student', 'faculty', 'resource_manager'];
  const defaultRole = validRoles.includes(queryRole) ? queryRole : 'student';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: defaultRole,
    department: defaultRole === 'faculty' ? 'Electronics & Communication' : defaultRole === 'resource_manager' ? 'Campus Infrastructure' : 'Computer Science',
    phone: '',
  });

  useEffect(() => {
    if (queryRole && validRoles.includes(queryRole)) {
      setFormData((prev) => ({
        ...prev,
        role: queryRole,
        department: queryRole === 'faculty' ? 'Electronics & Communication' : queryRole === 'resource_manager' ? 'Campus Infrastructure' : prev.department,
      }));
    }
  }, [queryRole]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check form details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card-glass p-4 p-md-5">
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center text-white rounded-4 mb-3"
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                  boxShadow: '0 8px 20px rgba(14, 165, 233, 0.3)',
                }}
              >
                <i className="bi bi-person-plus-fill fs-3"></i>
              </div>
              <h2 className="fw-bold mb-1">Create Campus Account</h2>
              <p className="text-muted small">
                Register as a student, faculty, or staff member
              </p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-circle-fill"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small text-muted">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control form-control-dark"
                    placeholder="e.g. Honour David"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small text-muted">Campus Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control form-control-dark"
                    placeholder="e.g. honour@campus.edu"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small text-muted">Role</label>
                  <select
                    name="role"
                    className="form-select form-select-dark"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty Member</option>
                    <option value="resource_manager">Resource Manager</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small text-muted">Department</label>
                  <input
                    type="text"
                    name="department"
                    className="form-control form-control-dark"
                    placeholder="e.g. Computer Science"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small text-muted">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control form-control-dark"
                    placeholder="+91 878 802 4147"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small text-muted">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control form-control-dark"
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>

                <div className="col-12 mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary-gradient w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        <span>Registering...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle"></i>
                        <span>Complete Registration</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="text-center mt-3">
              <span className="text-muted small">Already have an account? </span>
              <div className="d-flex justify-content-center gap-2 mt-1 small">
                <Link to="/login" className="text-primary text-decoration-none fw-semibold">
                  Student Sign In
                </Link>
                <span className="text-muted">•</span>
                <Link to="/login/faculty" className="text-decoration-none fw-semibold" style={{ color: '#4f46e5' }}>
                  Faculty Sign In
                </Link>
                <span className="text-muted">•</span>
                <Link to="/login/resource-manager" className="text-decoration-none fw-semibold" style={{ color: '#059669' }}>
                  Manager Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
