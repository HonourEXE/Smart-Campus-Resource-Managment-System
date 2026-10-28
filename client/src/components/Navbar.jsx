import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, unreadCount } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-danger text-white';
      case 'resource_manager':
        return 'bg-warning text-dark';
      case 'faculty':
        return 'bg-info text-dark';
      default:
        return 'bg-primary text-white';
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'resource_manager':
        return 'Facility Manager';
      case 'faculty':
        return 'Faculty';
      default:
        return 'Student';
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light navbar-custom">
      <div className="container-fluid px-lg-4">
        <Link to="/dashboard" className="navbar-brand d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center text-white rounded-3"
            style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
            }}
          >
            <i className="bi bi-buildings-fill fs-5"></i>
          </div>
          <div>
            <span className="navbar-brand-gradient">SmartCampus</span>
            <span className="badge bg-light text-primary border ms-2 d-none d-sm-inline" style={{ fontSize: '0.65rem', borderColor: '#bae6fd' }}>
              SCRMS
            </span>
          </div>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarMain">
          {user ? (
            <>
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-1">
                <li className="nav-item">
                  <NavLink to="/dashboard" className="nav-link px-3">
                    <i className="bi bi-grid-1x2-fill me-1"></i> Dashboard
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink to="/resources" className="nav-link px-3">
                    <i className="bi bi-search me-1"></i> Discover & Book
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink to="/calendar" className="nav-link px-3">
                    <i className="bi bi-calendar3 me-1"></i> Schedule
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink to="/bookings" className="nav-link px-3">
                    <i className="bi bi-ticket-detailed me-1"></i>{' '}
                    {['resource_manager', 'admin'].includes(user.role)
                      ? 'Approvals & Bookings'
                      : 'My Bookings'}
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink to="/maintenance" className="nav-link px-3">
                    <i className="bi bi-tools me-1"></i> Maintenance
                  </NavLink>
                </li>

                {['resource_manager', 'admin'].includes(user.role) && (
                  <li className="nav-item">
                    <NavLink to="/manage-resources" className="nav-link px-3">
                      <i className="bi bi-sliders me-1"></i> Manage Facilities
                    </NavLink>
                  </li>
                )}

                {['faculty', 'resource_manager', 'admin'].includes(user.role) && (
                  <li className="nav-item">
                    <NavLink to="/analytics" className="nav-link px-3">
                      <i className="bi bi-bar-chart-line-fill me-1"></i> Analytics
                    </NavLink>
                  </li>
                )}

                {user.role === 'admin' && (
                  <li className="nav-item">
                    <NavLink to="/admin/users" className="nav-link px-3">
                      <i className="bi bi-shield-check me-1"></i> Admin & Audit
                    </NavLink>
                  </li>
                )}
              </ul>

              <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
                {/* Notification Bell */}
                <Link
                  to="/notifications"
                  className="btn btn-secondary-light position-relative p-2 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px' }}
                  title="Notifications"
                >
                  <i className="bi bi-bell-fill fs-6 text-primary"></i>
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Info & Role */}
                <div className="d-flex align-items-center gap-2 border-start ps-3" style={{ borderColor: 'var(--surface-border-sky)' }}>
                  <div className="text-end d-none d-sm-block">
                    <div className="fw-bold text-dark small">{user.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      {user.department}
                    </div>
                  </div>
                  <span className={`badge ${getRoleBadgeClass(user.role)} text-uppercase px-2 py-1`}>
                    {getRoleDisplayName(user.role)}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline-danger btn-sm ms-2"
                    title="Sign Out"
                  >
                    <i className="bi bi-box-arrow-right"></i>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="d-flex align-items-center ms-auto gap-2">
              <div className="dropdown">
                <button
                  className="btn btn-secondary-light dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  id="portalSelectDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-shield-lock-fill text-primary"></i>
                  <span>Portal Sign In</span>
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end shadow-sm border py-2"
                  aria-labelledby="portalSelectDropdown"
                  style={{ minWidth: '240px', borderRadius: '12px', borderColor: 'var(--surface-border-sky)' }}
                >
                  <li>
                    <h6 className="dropdown-header text-uppercase text-muted" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                      Select Campus Portal
                    </h6>
                  </li>
                  <li>
                    <Link to="/login" className="dropdown-item d-flex align-items-center gap-2 py-2">
                      <i className="bi bi-mortarboard-fill text-primary fs-5"></i>
                      <div>
                        <div className="fw-semibold text-dark small">Student Portal</div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Classrooms, labs & sports facilities</div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link to="/login/faculty" className="dropdown-item d-flex align-items-center gap-2 py-2">
                      <i className="bi bi-award-fill text-info fs-5"></i>
                      <div>
                        <div className="fw-semibold text-dark small">Faculty Portal</div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Seminar halls & research labs</div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link to="/login/resource-manager" className="dropdown-item d-flex align-items-center gap-2 py-2">
                      <i className="bi bi-building-gear text-warning fs-5"></i>
                      <div>
                        <div className="fw-semibold text-dark small">Resource Manager</div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Facility operations & approvals</div>
                      </div>
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <Link to="/login/admin" className="dropdown-item d-flex align-items-center gap-2 py-2">
                      <i className="bi bi-shield-lock text-danger fs-5"></i>
                      <div>
                        <div className="fw-semibold text-dark small">Administrator</div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Campus governance & audit logs</div>
                      </div>
                    </Link>
                  </li>
                </ul>
              </div>

              <Link to="/register" className="btn btn-primary-gradient">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
