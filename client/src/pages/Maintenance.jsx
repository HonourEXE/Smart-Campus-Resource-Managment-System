import React, { useState, useEffect } from 'react';
import { getTickets, createTicket, updateTicket, getResources } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Maintenance = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // New Ticket Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    resourceId: '',
    description: '',
    priority: 'Medium',
    markUnavailable: false,
  });
  const [reportLoading, setReportLoading] = useState(false);

  // Edit/Resolution Modal for Manager & Admin
  const [activeTicket, setActiveTicket] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    status: 'In Progress',
    assignedTo: '',
    resolutionNotes: '',
    setResourceAvailable: true,
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const isStaffOrAdmin = ['resource_manager', 'admin'].includes(user?.role);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;

      const [ticketsRes, resourcesRes] = await Promise.all([
        getTickets(params),
        getResources(),
      ]);

      if (ticketsRes.data.success) setTickets(ticketsRes.data.tickets);
      if (resourcesRes.data.success && resourcesRes.data.resources.length > 0) {
        setResources(resourcesRes.data.resources);
        setReportForm((prev) => ({
          ...prev,
          resourceId: prev.resourceId || resourcesRes.data.resources[0]._id,
        }));
      }
    } catch (err) {
      console.error('Failed to load maintenance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportLoading(true);
    setFeedback({ type: '', text: '' });

    try {
      const res = await createTicket(reportForm);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          text: 'Maintenance fault reported successfully! Our technical team has been notified.',
        });
        setIsReportModalOpen(false);
        setReportForm({
          resourceId: resources[0]?._id || '',
          description: '',
          priority: 'Medium',
          markUnavailable: false,
        });
        fetchData();
      }
    } catch (err) {
      setFeedback({
        type: 'danger',
        text: err.response?.data?.message || 'Error reporting maintenance fault.',
      });
    } finally {
      setReportLoading(false);
    }
  };

  const openUpdateModal = (ticket) => {
    setActiveTicket(ticket);
    setUpdateForm({
      status: ticket.status === 'Open' ? 'In Progress' : 'Resolved',
      assignedTo: ticket.assignedTo || 'Campus AV/IT Technician',
      resolutionNotes: ticket.resolutionNotes || '',
      setResourceAvailable: true,
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setFeedback({ type: '', text: '' });

    try {
      const res = await updateTicket(activeTicket._id, updateForm);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          text: `Ticket updated to ${updateForm.status}! ${updateForm.status === 'Resolved' ? 'Facility automatically restored to Available.' : ''}`,
        });
        setActiveTicket(null);
        fetchData();
      }
    } catch (err) {
      setFeedback({
        type: 'danger',
        text: err.response?.data?.message || 'Error updating ticket status.',
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Equipment & Facility Maintenance Tracking</h2>
          <p className="text-muted small mb-0">
            Report hardware faults, assign technicians, track repair lifecycles, and maintain campus readiness
          </p>
        </div>

        <button
          onClick={() => setIsReportModalOpen(true)}
          className="btn btn-primary-gradient d-flex align-items-center gap-2"
        >
          <i className="bi bi-exclamation-octagon-fill"></i>
          <span>Report Fault / Damage</span>
        </button>
      </div>

      {feedback.text && (
        <div className={`alert alert-${feedback.type} alert-dismissible fade show small py-2`} role="alert">
          {feedback.text}
          <button type="button" className="btn-close" onClick={() => setFeedback({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {['All', 'Open', 'In Progress', 'Resolved'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`btn btn-sm ${statusFilter === st ? 'btn-primary-gradient' : 'btn-secondary-light'}`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="card-glass p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted mt-2">Loading maintenance records...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-tools fs-1 mb-2"></i>
            <h5>No maintenance tickets found ({statusFilter})</h5>
            <p className="small">All campus equipment is operating smoothly.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark-custom align-middle">
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>Fault Description</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Tech</th>
                  <th>Reported By</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div className="fw-bold text-dark">{t.resourceId?.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {t.resourceId?.location?.building} &bull; Room {t.resourceId?.location?.roomNumber}
                      </div>
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <div className="text-dark small">{t.description}</div>
                      {t.resolutionNotes && (
                        <div className="text-success small mt-1" style={{ fontSize: '0.72rem' }}>
                          <i className="bi bi-check2-all me-1"></i> Resolution: "{t.resolutionNotes}"
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          t.priority === 'Urgent'
                            ? 'bg-danger'
                            : t.priority === 'High'
                            ? 'bg-warning text-dark'
                            : t.priority === 'Medium'
                            ? 'bg-info text-dark'
                            : 'bg-secondary'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          t.status === 'Resolved'
                            ? 'bg-success'
                            : t.status === 'In Progress'
                            ? 'bg-warning text-dark'
                            : 'bg-danger'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <div className="small text-dark">{t.assignedTo || 'Unassigned'}</div>
                    </td>
                    <td>
                      <div className="small text-dark fw-semibold">{t.reportedBy?.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {t.reportedBy?.department}
                      </div>
                    </td>
                    <td className="text-end">
                      {isStaffOrAdmin && t.status !== 'Resolved' && (
                        <button
                          onClick={() => openUpdateModal(t)}
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                        >
                          <i className="bi bi-gear-fill"></i>
                          <span>Manage</span>
                        </button>
                      )}
                      {t.status === 'Resolved' && (
                        <span className="text-success small">
                          <i className="bi bi-check-circle-fill me-1"></i> Closed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Fault Modal */}
      {isReportModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(6px)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card-glass">
              <div className="modal-header border-bottom" style={{ borderColor: '#e0f2fe' }}>
                <h5 className="modal-title fw-bold text-dark">Report Broken / Faulty Equipment</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsReportModalOpen(false)}
                ></button>
              </div>

              <form onSubmit={handleReportSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small text-muted">Select Affected Facility</label>
                    <select
                      className="form-select form-select-dark"
                      value={reportForm.resourceId}
                      onChange={(e) => setReportForm({ ...reportForm, resourceId: e.target.value })}
                      required
                    >
                      {resources.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name} ({r.location?.building})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted">Urgency / Priority</label>
                    <select
                      className="form-select form-select-dark"
                      value={reportForm.priority}
                      onChange={(e) => setReportForm({ ...reportForm, priority: e.target.value })}
                    >
                      <option value="Low">Low - Minor cosmetic / non-blocking</option>
                      <option value="Medium">Medium - Feature degraded</option>
                      <option value="High">High - Impairs classes/lectures</option>
                      <option value="Urgent">Urgent - Complete room outage / hazard</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted">Problem Description</label>
                    <textarea
                      rows="4"
                      className="form-control form-control-dark"
                      placeholder="e.g. Projector power failure, AC cooling not functioning, RJ-45 LAN port broken"
                      value={reportForm.description}
                      onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="markUnavailableSwitch"
                      checked={reportForm.markUnavailable}
                      onChange={(e) => setReportForm({ ...reportForm, markUnavailable: e.target.checked })}
                    />
                    <label className="form-check-label text-dark small" htmlFor="markUnavailableSwitch">
                      Mark facility as 'Under Maintenance' immediately (blocks bookings)
                    </label>
                  </div>
                </div>

                <div className="modal-footer border-top" style={{ borderColor: '#e0f2fe' }}>
                  <button
                    type="button"
                    className="btn btn-secondary-light"
                    onClick={() => setIsReportModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary-gradient"
                    disabled={reportLoading}
                  >
                    {reportLoading ? 'Submitting Report...' : 'Submit Maintenance Ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Update Modal for Managers */}
      {activeTicket && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(6px)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card-glass">
              <div className="modal-header border-bottom" style={{ borderColor: '#e0f2fe' }}>
                <h5 className="modal-title fw-bold text-dark">Update Maintenance Ticket</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setActiveTicket(null)}
                ></button>
              </div>

              <form onSubmit={handleUpdateSubmit}>
                <div className="modal-body p-4">
                  <div className="p-3 rounded bg-light border mb-3 small" style={{ borderColor: '#e2e8f0' }}>
                    <div>Facility: <strong>{activeTicket.resourceId?.name}</strong></div>
                    <div>Fault: {activeTicket.description}</div>
                    <div>Reported By: {activeTicket.reportedBy?.name}</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted">Lifecycle Status</label>
                    <select
                      className="form-select form-select-dark"
                      value={updateForm.status}
                      onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                    >
                      <option value="Open">Open - Awaiting Review</option>
                      <option value="In Progress">In Progress - Repair Underway</option>
                      <option value="Resolved">Resolved - Equipment Restored & Tested</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted">Assigned Technician / Team</label>
                    <input
                      type="text"
                      className="form-control form-control-dark"
                      placeholder="e.g. Suresh Kumar (AV Specialist)"
                      value={updateForm.assignedTo}
                      onChange={(e) => setUpdateForm({ ...updateForm, assignedTo: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted">Resolution / Repair Notes</label>
                    <textarea
                      rows="3"
                      className="form-control form-control-dark"
                      placeholder="e.g. Replaced projector HDMI connector and tested with 4K output"
                      value={updateForm.resolutionNotes}
                      onChange={(e) => setUpdateForm({ ...updateForm, resolutionNotes: e.target.value })}
                    ></textarea>
                  </div>

                  {updateForm.status === 'Resolved' && (
                    <div className="alert alert-success py-2 small d-flex align-items-center gap-2">
                      <i className="bi bi-info-circle-fill"></i>
                      <span>Marking Resolved will restore the facility status back to <strong>'Available'</strong>!</span>
                    </div>
                  )}
                </div>

                <div className="modal-footer border-top" style={{ borderColor: '#e0f2fe' }}>
                  <button
                    type="button"
                    className="btn btn-secondary-light"
                    onClick={() => setActiveTicket(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary-gradient"
                    disabled={updateLoading}
                  >
                    {updateLoading ? 'Saving...' : 'Update Ticket'}
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

export default Maintenance;
