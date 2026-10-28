import React, { useState, useEffect } from 'react';
import { getBookings, cancelBooking, decideBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Decision Modal State for Manager/Admin
  const [activeDecisionBooking, setActiveDecisionBooking] = useState(null);
  const [decisionType, setDecisionType] = useState('Approved'); // 'Approved' or 'Rejected'
  const [decisionReason, setDecisionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  const isStaffOrAdmin = ['resource_manager', 'admin'].includes(user?.role);

  useEffect(() => {
    fetchBookingsList();
  }, [statusFilter]);

  const fetchBookingsList = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await getBookings(params);
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      const res = await cancelBooking(bookingId);
      if (res.data.success) {
        setFeedbackMsg({ type: 'success', text: 'Reservation cancelled successfully.' });
        fetchBookingsList();
      }
    } catch (err) {
      setFeedbackMsg({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to cancel reservation.',
      });
    }
  };

  const openDecisionModal = (booking, type) => {
    setActiveDecisionBooking(booking);
    setDecisionType(type);
    setDecisionReason(type === 'Approved' ? 'Approved by facility manager' : 'Conflict with department timetable');
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedbackMsg({ type: '', text: '' });

    try {
      const res = await decideBooking(activeDecisionBooking._id, {
        decision: decisionType,
        reason: decisionReason,
      });

      if (res.data.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Booking marked as ${decisionType.toUpperCase()}!`,
        });
        setActiveDecisionBooking(null);
        fetchBookingsList();
      }
    } catch (err) {
      setFeedbackMsg({
        type: 'danger',
        text: err.response?.data?.message || 'Error executing approval decision.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = bookings.filter((b) => b.status === 'Pending').length;

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">
            {isStaffOrAdmin ? 'Facility Bookings & Approval Queue' : 'My Campus Reservations'}
          </h2>
          <p className="text-muted small mb-0">
            {isStaffOrAdmin
              ? 'Review pending reservation requests, approve faculty/student slots, or manage bookings'
              : 'Track the status of your reservation requests, approvals, and upcoming bookings'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="d-flex flex-wrap gap-2">
          {['All', 'Pending', 'Approved', 'Cancelled', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`btn btn-sm ${statusFilter === status ? 'btn-primary-gradient' : 'btn-secondary-light'}`}
            >
              {status}
              {status === 'Pending' && pendingCount > 0 && (
                <span className="badge bg-warning text-dark ms-2">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {feedbackMsg.text && (
        <div className={`alert alert-${feedbackMsg.type} alert-dismissible fade show small py-2`} role="alert">
          {feedbackMsg.text}
          <button type="button" className="btn-close" onClick={() => setFeedbackMsg({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Bookings Table */}
      <div className="card-glass p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted mt-2">Loading reservations...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-calendar2-x fs-1 mb-2"></i>
            <h5>No bookings match the selected status ({statusFilter})</h5>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark-custom align-middle">
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>Date & Time</th>
                  <th>Purpose</th>
                  {isStaffOrAdmin && <th>Requested By</th>}
                  <th>Status</th>
                  <th>Decision / Notes</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div className="fw-bold text-dark">{b.resourceId?.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {b.resourceId?.type} &bull; {b.resourceId?.location?.building}
                      </div>
                    </td>
                    <td>
                      <div className="text-dark small fw-semibold">
                        {new Date(b.startTime).toLocaleDateString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-primary fw-medium" style={{ fontSize: '0.75rem' }}>
                        {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>
                      <div className="small text-dark fw-medium">{b.purpose}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        Attendees: {b.attendeesCount}
                      </div>
                    </td>
                    {isStaffOrAdmin && (
                      <td>
                        <div className="small text-dark fw-semibold">{b.userId?.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                          <span className="badge bg-light text-primary border border-info text-capitalize">{b.userId?.role}</span> &bull; {b.userId?.department}
                        </div>
                      </td>
                    )}
                    <td>
                      <span className={`badge badge-${b.status.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="small text-muted" style={{ maxWidth: '180px' }}>
                      {b.decisionReason ? (
                        <div>
                          <div className="text-dark" style={{ fontSize: '0.75rem' }}>"{b.decisionReason}"</div>
                          {b.decisionBy && (
                            <div className="text-secondary" style={{ fontSize: '0.68rem' }}>
                              By {b.decisionBy.name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-secondary">&mdash;</span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        {/* Approval actions for Manager & Admin */}
                        {isStaffOrAdmin && b.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => openDecisionModal(b, 'Approved')}
                              className="btn btn-sm btn-success d-flex align-items-center gap-1"
                              title="Approve Booking Request"
                            >
                              <i className="bi bi-check-lg"></i>
                              <span className="d-none d-md-inline">Approve</span>
                            </button>
                            <button
                              onClick={() => openDecisionModal(b, 'Rejected')}
                              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                              title="Reject Booking Request"
                            >
                              <i className="bi bi-x-lg"></i>
                              <span className="d-none d-md-inline">Reject</span>
                            </button>
                          </>
                        )}

                        {/* Cancel Action for eligible bookings */}
                        {['Pending', 'Approved'].includes(b.status) && (
                          <button
                            onClick={() => handleCancel(b._id)}
                            className="btn btn-sm btn-outline-secondary"
                            title="Cancel Booking"
                          >
                            <i className="bi bi-slash-circle me-1"></i>
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {activeDecisionBooking && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(6px)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card-glass">
              <div className="modal-header border-bottom" style={{ borderColor: '#e0f2fe' }}>
                <h5 className="modal-title fw-bold text-dark">
                  {decisionType === 'Approved' ? 'Confirm Booking Approval' : 'Reject Booking Request'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setActiveDecisionBooking(null)}
                ></button>
              </div>

              <form onSubmit={handleDecisionSubmit}>
                <div className="modal-body p-4">
                  <div className="p-3 rounded bg-light border mb-3 small" style={{ borderColor: '#e2e8f0' }}>
                    <div>Facility: <strong>{activeDecisionBooking.resourceId?.name}</strong></div>
                    <div>Requested By: <strong>{activeDecisionBooking.userId?.name}</strong> ({activeDecisionBooking.userId?.email})</div>
                    <div>Purpose: {activeDecisionBooking.purpose}</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted">
                      {decisionType === 'Approved' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
                    </label>
                    <textarea
                      rows="3"
                      className="form-control form-control-dark"
                      placeholder={decisionType === 'Approved' ? 'e.g. Approved for practical session' : 'e.g. Maintenance scheduled / Department priority'}
                      value={decisionReason}
                      onChange={(e) => setDecisionReason(e.target.value)}
                      required={decisionType === 'Rejected'}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-top" style={{ borderColor: '#e0f2fe' }}>
                  <button
                    type="button"
                    className="btn btn-secondary-light"
                    onClick={() => setActiveDecisionBooking(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn ${decisionType === 'Approved' ? 'btn-success' : 'btn-danger'}`}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : `Confirm ${decisionType}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
