import React, { useState, useEffect } from 'react';
import { getResources, getRecommendations, createBooking } from '../services/api';
import ConflictModal from '../components/ConflictModal';
import { useAuth } from '../context/AuthContext';

const Resources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [minCapacity, setMinCapacity] = useState('');

  // Innovation Mode: Smart Recommendation Wizard
  const [showSmartWizard, setShowSmartWizard] = useState(false);
  const [wizardParams, setWizardParams] = useState({
    capacity: 30,
    equipment: '',
    building: '',
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Booking Modal State
  const [selectedResource, setSelectedResource] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '12:00',
    purpose: '',
    attendeesCount: 25,
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Conflict Modal State
  const [conflictData, setConflictData] = useState(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

  useEffect(() => {
    fetchResources();
  }, [selectedType, minCapacity]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedType !== 'All') params.type = selectedType;
      if (minCapacity) params.minCapacity = minCapacity;
      if (searchTerm) params.search = searchTerm;

      const res = await getResources(params);
      if (res.data.success) {
        setResources(res.data.resources);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleFetchRecommendations = async () => {
    try {
      setLoadingRecs(true);
      const res = await getRecommendations(wizardParams);
      if (res.data.success) {
        setRecommendations(res.data.recommendations);
      }
    } catch (err) {
      console.error('Recommendation fetch error:', err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const openBookingModal = (resource) => {
    setSelectedResource(resource);
    setBookingSuccess('');
    setBookingError('');
    setBookingForm((prev) => ({
      ...prev,
      attendeesCount: Math.min(prev.attendeesCount, resource.capacity),
    }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    setBookingLoading(true);

    try {
      const startIso = new Date(`${bookingForm.date}T${bookingForm.startTime}:00`).toISOString();
      const endIso = new Date(`${bookingForm.date}T${bookingForm.endTime}:00`).toISOString();

      const res = await createBooking({
        resourceId: selectedResource._id,
        startTime: startIso,
        endTime: endIso,
        purpose: bookingForm.purpose,
        attendeesCount: bookingForm.attendeesCount,
      });

      if (res.data.success) {
        setBookingSuccess(res.data.message);
        setTimeout(() => {
          setSelectedResource(null);
          setBookingSuccess('');
        }, 2200);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        // HTTP 409 Conflict - Launch Smart Conflict Modal
        setConflictData(err.response.data);
        setIsConflictModalOpen(true);
      } else {
        setBookingError(err.response?.data?.message || 'Failed to submit booking request.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSelectSlotSuggestion = (slot) => {
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);
    const pad = (n) => n.toString().padStart(2, '0');

    setBookingForm((prev) => ({
      ...prev,
      startTime: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
      endTime: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
    }));
    setIsConflictModalOpen(false);
  };

  const handleSelectRoomSuggestion = (room) => {
    setSelectedResource(room);
    setIsConflictModalOpen(false);
  };

  const categories = [
    'All',
    'Classroom',
    'Computer Lab',
    'Seminar Hall',
    'Projector',
    'Sports Facility',
    'Lab Equipment',
    'Conference Room',
  ];

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Header Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Campus Resource Discovery & Booking</h2>
          <p className="text-muted small mb-0">
            Search laboratories, smart classrooms, projectors, and conference halls with conflict detection
          </p>
        </div>

        <button
          onClick={() => {
            setShowSmartWizard(!showSmartWizard);
            if (!showSmartWizard) handleFetchRecommendations();
          }}
          className={`btn ${showSmartWizard ? 'btn-outline-primary' : 'btn-primary-gradient'} d-flex align-items-center gap-2`}
        >
          <i className="bi bi-magic fs-6"></i>
          <span>{showSmartWizard ? 'Close Recommendation Wizard' : 'Smart AI/Rule Recommendation'}</span>
        </button>
      </div>

      {/* Innovation Feature: Smart Recommendation Wizard Panel */}
      {showSmartWizard && (
        <div className="card-glass p-4 mb-4 border" style={{ borderColor: '#7dd3fc', background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)' }}>
          <div className="d-flex align-items-center gap-2 mb-3 text-primary">
            <i className="bi bi-cpu-fill fs-4"></i>
            <h5 className="mb-0 fw-bold">Intelligent Facility Recommendation Engine</h5>
          </div>
          <p className="text-muted small mb-3">
            Specify your event's seating capacity, required equipment, and preferences. The system ranks facilities by suitability score to optimize campus room utilization!
          </p>

          <div className="row g-3 align-items-end mb-4">
            <div className="col-md-3">
              <label className="form-label small text-muted">Required Attendees (Capacity)</label>
              <input
                type="number"
                min="1"
                className="form-control form-control-dark"
                value={wizardParams.capacity}
                onChange={(e) => setWizardParams({ ...wizardParams, capacity: e.target.value })}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label small text-muted">Equipment Needed (Comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Projector, AC, Smart Board"
                className="form-control form-control-dark"
                value={wizardParams.equipment}
                onChange={(e) => setWizardParams({ ...wizardParams, equipment: e.target.value })}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label small text-muted">Preferred Building (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Tech Block A"
                className="form-control form-control-dark"
                value={wizardParams.building}
                onChange={(e) => setWizardParams({ ...wizardParams, building: e.target.value })}
              />
            </div>

            <div className="col-md-2">
              <button
                type="button"
                onClick={handleFetchRecommendations}
                className="btn btn-primary-gradient w-100 fw-semibold"
                disabled={loadingRecs}
              >
                {loadingRecs ? 'Scoring...' : 'Find Matches'}
              </button>
            </div>
          </div>

          {/* Recommendation Results */}
          <div className="row g-3">
            {recommendations.map((rec) => (
              <div key={rec.resource._id} className="col-md-6 col-xl-4">
                <div className="p-3 rounded h-100 d-flex flex-column justify-content-between" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="match-score-badge">
                        <i className="bi bi-stars"></i> {rec.matchScore}% Match
                      </span>
                      <span className="badge bg-light text-primary border" style={{ borderColor: '#bae6fd' }}>{rec.resource.type}</span>
                    </div>

                    <h6 className="fw-bold text-dark mb-1">{rec.resource.name}</h6>
                    <div className="text-muted small mb-2">
                      <i className="bi bi-geo-alt me-1"></i>
                      {rec.resource.location?.building} &bull; Room {rec.resource.location?.roomNumber} (Cap: {rec.resource.capacity})
                    </div>

                    <div className="small mb-2">
                      {rec.reasons.map((r, i) => (
                        <div key={i} className="text-secondary" style={{ fontSize: '0.78rem' }}>
                          <i className="bi bi-check2 text-success me-1"></i> {r}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => openBookingModal(rec.resource)}
                    className="btn btn-sm btn-outline-primary w-100 mt-2"
                  >
                    Select & Book This Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card-glass p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light text-primary" style={{ borderColor: '#cbd5e1' }}>
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control form-control-dark"
                placeholder="Search by facility name, building, equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-dark"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Facility Types' : c}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <input
              type="number"
              placeholder="Min Capacity"
              className="form-control form-control-dark"
              value={minCapacity}
              onChange={(e) => setMinCapacity(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-2">
            <button type="submit" className="btn btn-secondary-light w-100">
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Resource Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted mt-2">Loading campus facilities...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="card-glass p-5 text-center text-muted">
          <i className="bi bi-search fs-1 mb-2"></i>
          <h5>No campus facilities match the criteria</h5>
          <p className="small">Try resetting your filters or search keywords</p>
        </div>
      ) : (
        <div className="row g-4">
          {resources.map((res) => (
            <div key={res._id} className="col-12 col-md-6 col-xl-4">
              <div className="card-glass h-100 d-flex flex-column justify-content-between p-4">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 px-2 py-1">
                      {res.type}
                    </span>
                    <span className={res.status === 'Available' ? 'badge-available' : 'badge-maintenance'}>
                      {res.status}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark mb-1">{res.name}</h5>
                  <div className="text-muted small mb-2">
                    <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                    {res.location?.building}, Floor {res.location?.floor}, Room {res.location?.roomNumber}
                  </div>

                  <p className="text-secondary small mb-3" style={{ minHeight: '40px' }}>
                    {res.description || 'Modern facility equipped for academic coursework, labs, and student meetings.'}
                  </p>

                  <div className="d-flex align-items-center gap-3 mb-3 text-dark small">
                    <div>
                      <i className="bi bi-people-fill text-primary me-1"></i>
                      <strong>{res.capacity}</strong> Seats
                    </div>
                    <div>
                      <i className={`bi ${res.approvalRequired ? 'bi-shield-check text-warning' : 'bi-lightning-charge-fill text-success'} me-1`}></i>
                      {res.approvalRequired ? 'Approval Required' : 'Instant Booking'}
                    </div>
                  </div>

                  {/* Equipment Pills */}
                  <div className="d-flex flex-wrap gap-1 mb-3">
                    {res.equipment?.map((eq, i) => (
                      <span key={i} className="equipment-pill">
                        <i className="bi bi-cpu"></i> {eq}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-top d-flex gap-2" style={{ borderColor: 'var(--surface-border-sky)' }}>
                  <button
                    onClick={() => openBookingModal(res)}
                    className="btn btn-primary-gradient flex-grow-1"
                    disabled={res.status !== 'Available'}
                  >
                    {res.status === 'Available' ? (
                      <>
                        <i className="bi bi-calendar-plus me-1"></i> Book Now
                      </>
                    ) : (
                      <>
                        <i className="bi bi-exclamation-triangle me-1"></i> In Maintenance
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Form Modal */}
      {selectedResource && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(6px)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card-glass">
              <div className="modal-header border-bottom" style={{ borderColor: '#e0f2fe' }}>
                <h5 className="modal-title fw-bold text-dark">
                  Reserve {selectedResource.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedResource(null)}
                ></button>
              </div>

              <form onSubmit={handleBookingSubmit}>
                <div className="modal-body p-4">
                  {bookingSuccess && (
                    <div className="alert alert-success py-2 small d-flex align-items-center gap-2">
                      <i className="bi bi-check-circle-fill"></i>
                      <span>{bookingSuccess}</span>
                    </div>
                  )}

                  {bookingError && (
                    <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
                      <i className="bi bi-exclamation-circle-fill"></i>
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small text-muted">Reservation Date</label>
                    <input
                      type="date"
                      className="form-control form-control-dark"
                      value={bookingForm.date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-muted">Start Time</label>
                      <input
                        type="time"
                        className="form-control form-control-dark"
                        value={bookingForm.startTime}
                        onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-muted">End Time</label>
                      <input
                        type="time"
                        className="form-control form-control-dark"
                        value={bookingForm.endTime}
                        onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted">Expected Attendees</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedResource.capacity}
                      className="form-control form-control-dark"
                      value={bookingForm.attendeesCount}
                      onChange={(e) => setBookingForm({ ...bookingForm, attendeesCount: e.target.value })}
                      required
                    />
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Max capacity for this room: {selectedResource.capacity} seats
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted">Purpose / Event Title</label>
                    <textarea
                      rows="3"
                      placeholder="e.g. Project Review Presentation, Faculty Colloquium, Guest Lecture"
                      className="form-control form-control-dark"
                      value={bookingForm.purpose}
                      onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-top" style={{ borderColor: '#e0f2fe' }}>
                  <button
                    type="button"
                    className="btn btn-secondary-light"
                    onClick={() => setSelectedResource(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary-gradient"
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? 'Checking Availability...' : 'Confirm Reservation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Smart Conflict Resolution Modal */}
      <ConflictModal
        conflictData={conflictData}
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        onSelectSlot={handleSelectSlotSuggestion}
        onSelectRoom={handleSelectRoomSuggestion}
      />
    </div>
  );
};

export default Resources;
