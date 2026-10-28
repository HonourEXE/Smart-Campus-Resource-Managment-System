import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAnalyticsOverview, getBookings, getTickets, getResources } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [recentResources, setRecentResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const isStaffOrAdmin = ['resource_manager', 'admin'].includes(user?.role);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (isStaffOrAdmin || user?.role === 'faculty') {
          const analyticsRes = await getAnalyticsOverview();
          if (analyticsRes.data.success) {
            setStats(analyticsRes.data);
          }
        }

        const bookingsRes = await getBookings({ limit: 5 });
        if (bookingsRes.data.success) {
          setMyBookings(bookingsRes.data.bookings.slice(0, 5));
        }

        const ticketsRes = await getTickets({ limit: 4 });
        if (ticketsRes.data.success) {
          setMyTickets(ticketsRes.data.tickets.slice(0, 4));
        }

        const resRes = await getResources({ limit: 4 });
        if (resRes.data.success) {
          setRecentResources(resRes.data.resources.slice(0, 4));
        }
      } catch (err) {
        console.error('Dashboard data load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.role]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary my-5" role="status"></div>
        <div className="text-muted">Loading campus command center...</div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Welcome Banner */}
      <div className="card-glass p-4 mb-4 border" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 60%, #e0f2fe 100%)', borderColor: 'var(--surface-border-sky)' }}>
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h2 className="mb-0 fw-bold text-dark">Welcome back, {user?.name}!</h2>
              <span className="badge bg-primary text-uppercase px-2">{user?.role}</span>
            </div>
            <p className="text-muted mb-0 small">
              Department of {user?.department} | Centralized Smart Campus Dashboard
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Link to="/resources" className="btn btn-primary-gradient d-flex align-items-center gap-2">
              <i className="bi bi-search"></i>
              <span>Book Facility</span>
            </Link>

            <Link to="/maintenance" className="btn btn-secondary-light d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-octagon text-warning"></i>
              <span>Report Fault</span>
            </Link>

            {isStaffOrAdmin && (
              <Link to="/manage-resources" className="btn btn-outline-primary d-flex align-items-center gap-2">
                <i className="bi bi-plus-circle"></i>
                <span>Add Facility</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="row g-3 mb-4">
        {isStaffOrAdmin ? (
          <>
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="stat-card primary">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small text-uppercase fw-semibold">Campus Resources</div>
                    <div className="stat-val text-dark mt-1">{stats?.summary?.totalResources || 0}</div>
                    <div className="text-success small mt-1">
                      <i className="bi bi-check-circle me-1"></i>
                      {stats?.summary?.availableResources || 0} Available
                    </div>
                  </div>
                  <div className="stat-icon bg-primary bg-opacity-10 text-primary">
                    <i className="bi bi-buildings"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="stat-card success">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small text-uppercase fw-semibold">Active Bookings</div>
                    <div className="stat-val text-dark mt-1">{stats?.summary?.approvedBookings || 0}</div>
                    <div className="text-muted small mt-1">
                      Total: {stats?.summary?.totalBookings || 0} recorded
                    </div>
                  </div>
                  <div className="stat-icon bg-success bg-opacity-10 text-success">
                    <i className="bi bi-calendar-check"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="stat-card warning">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small text-uppercase fw-semibold">Pending Approvals</div>
                    <div className="stat-val text-warning mt-1">{stats?.summary?.pendingBookings || 0}</div>
                    <div className="text-warning small mt-1">
                      <Link to="/bookings" className="text-warning text-decoration-none">
                        Review Requests <i className="bi bi-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                  <div className="stat-icon bg-warning bg-opacity-10 text-warning">
                    <i className="bi bi-hourglass-split"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="stat-card danger">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small text-uppercase fw-semibold">Open Maintenance</div>
                    <div className="stat-val text-danger mt-1">
                      {(stats?.summary?.openTickets || 0) + (stats?.summary?.inProgressTickets || 0)}
                    </div>
                    <div className="text-danger small mt-1">
                      <Link to="/maintenance" className="text-danger text-decoration-none">
                        View Tickets <i className="bi bi-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                  <div className="stat-icon bg-danger bg-opacity-10 text-danger">
                    <i className="bi bi-wrench-adjustable"></i>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="stat-card primary">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small text-uppercase fw-semibold">My Total Bookings</div>
                    <div className="stat-val text-dark mt-1">{myBookings.length}</div>
                    <div className="text-muted small mt-1">Historical & Active</div>
                  </div>
                  <div className="stat-icon bg-primary bg-opacity-10 text-primary">
                    <i className="bi bi-journal-bookmark-fill"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="stat-card success">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small text-uppercase fw-semibold">Confirmed Bookings</div>
                    <div className="stat-val text-success mt-1">
                      {myBookings.filter((b) => b.status === 'Approved').length}
                    </div>
                    <div className="text-success small mt-1">Ready for check-in</div>
                  </div>
                  <div className="stat-icon bg-success bg-opacity-10 text-success">
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="stat-card warning">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small text-uppercase fw-semibold">Awaiting Approval</div>
                    <div className="stat-val text-warning mt-1">
                      {myBookings.filter((b) => b.status === 'Pending').length}
                    </div>
                    <div className="text-warning small mt-1">Under review</div>
                  </div>
                  <div className="stat-icon bg-warning bg-opacity-10 text-warning">
                    <i className="bi bi-clock-history"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="stat-card purple">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small text-uppercase fw-semibold">My Reported Issues</div>
                    <div className="stat-val text-dark mt-1">{myTickets.length}</div>
                    <div className="text-info small mt-1">
                      <Link to="/maintenance" className="text-info text-decoration-none">
                        Track Status <i className="bi bi-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                  <div className="stat-icon bg-info bg-opacity-10 text-primary">
                    <i className="bi bi-tools"></i>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="row g-4">
        {/* Left Column: Recent Bookings */}
        <div className="col-lg-8">
          <div className="card-glass p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <i className="bi bi-calendar-event text-primary"></i>
                {isStaffOrAdmin ? 'Recent Campus Bookings' : 'My Upcoming Reservations'}
              </h5>
              <Link to="/bookings" className="btn btn-sm btn-outline-primary">
                View All <i className="bi bi-chevron-right"></i>
              </Link>
            </div>

            {myBookings.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-calendar-x fs-1 text-secondary mb-2"></i>
                <p>No reservations recorded yet.</p>
                <Link to="/resources" className="btn btn-sm btn-primary-gradient">
                  Explore & Reserve a Room
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark-custom align-middle">
                  <thead>
                    <tr>
                      <th>Facility</th>
                      <th>Scheduled Slot</th>
                      <th>Purpose</th>
                      {isStaffOrAdmin && <th>Reserved By</th>}
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myBookings.map((b) => (
                      <tr key={b._id}>
                        <td>
                          <div className="fw-bold text-dark">{b.resourceId?.name || 'Campus Facility'}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {b.resourceId?.type} &bull; {b.resourceId?.location?.building}
                          </div>
                        </td>
                        <td>
                          <div className="text-dark small">
                            {new Date(b.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="small text-truncate" style={{ maxWidth: '160px' }}>
                          {b.purpose}
                        </td>
                        {isStaffOrAdmin && (
                          <td>
                            <div className="small text-dark fw-semibold">{b.userId?.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                              {b.userId?.role}
                            </div>
                          </td>
                        )}
                        <td>
                          <span className={`badge badge-${b.status.toLowerCase()}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Featured Campus Facilities & Maintenance Status */}
        <div className="col-lg-4">
          <div className="d-flex flex-column gap-4 h-100">
            {/* Quick Available Facilities */}
            <div className="card-glass p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-lightning-charge-fill text-warning"></i>
                  Key Campus Venues
                </h5>
                <Link to="/resources" className="text-primary small text-decoration-none fw-semibold">
                  All
                </Link>
              </div>

              <div className="d-flex flex-column gap-3">
                {recentResources.map((res) => (
                  <div key={res._id} className="p-3 rounded" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-semibold text-dark small">{res.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {res.location?.building} &bull; Capacity: {res.capacity}
                        </div>
                      </div>
                      <span className={res.status === 'Available' ? 'badge-available small' : 'badge-maintenance small'}>
                        {res.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Maintenance Activity */}
            <div className="card-glass p-4 flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-tools text-danger"></i>
                  Active Maintenance
                </h5>
                <Link to="/maintenance" className="text-primary small text-decoration-none fw-semibold">
                  Tickets
                </Link>
              </div>

              {myTickets.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  <i className="bi bi-check-circle text-success fs-3 mb-2 d-block"></i>
                  All facilities running without reported faults!
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {myTickets.map((t) => (
                    <div key={t._id} className="p-3 rounded border small bg-light" style={{ borderColor: '#e2e8f0' }}>
                      <div className="d-flex justify-content-between">
                        <strong className="text-dark text-truncate" style={{ maxWidth: '180px' }}>
                          {t.resourceId?.name}
                        </strong>
                        <span className={`badge ${t.priority === 'Urgent' ? 'bg-danger' : t.priority === 'High' ? 'bg-warning text-dark' : 'bg-secondary'}`} style={{ fontSize: '0.65rem' }}>
                          {t.priority}
                        </span>
                      </div>
                      <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                        {t.description}
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-2" style={{ fontSize: '0.7rem' }}>
                        <span className="text-primary fw-medium">Status: {t.status}</span>
                        <span className="text-secondary">{t.assignedTo || 'Unassigned'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
