import React from 'react';

const ConflictModal = ({ conflictData, isOpen, onClose, onSelectSlot, onSelectRoom }) => {
  if (!isOpen || !conflictData) return null;

  const { message, conflicts = [], suggestions = {} } = conflictData;
  const { alternativeSlots = [], alternativeRooms = [] } = suggestions;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(6px)' }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content card-glass border-danger shadow-lg">
          <div className="modal-header border-bottom border-danger bg-danger bg-opacity-10">
            <h5 className="modal-title text-danger d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill fs-4"></i>
              Booking Conflict Detected (HTTP 409)
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-4">
            <div className="conflict-highlight-card mb-4">
              <h6 className="text-danger fw-bold mb-1">Schedule Overlap Alert</h6>
              <p className="small text-dark mb-2">{message}</p>
              {conflicts.length > 0 && (
                <div className="bg-light border border-warning p-2 rounded small text-dark">
                  <i className="bi bi-calendar-x text-warning me-1"></i>
                  Conflicting Reservation: <strong>{new Date(conflicts[0].startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(conflicts[0].endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> ({conflicts[0].purpose})
                </div>
              )}
            </div>

            <div className="row g-4">
              {/* Innovation 1: Alternative Time Slots for Same Resource */}
              <div className="col-md-6">
                <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                  <i className="bi bi-clock-history fs-5"></i>
                  <h6 className="mb-0 fw-bold">Alternative Time Slots</h6>
                </div>
                <p className="text-muted small mb-3">
                  Open slots for this facility on the same day:
                </p>

                {alternativeSlots.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {alternativeSlots.map((slot, idx) => (
                      <div
                        key={idx}
                        className="suggestion-card d-flex justify-content-between align-items-center"
                        onClick={() => onSelectSlot(slot)}
                      >
                        <div>
                          <div className="fw-bold text-dark small">{slot.formatted}</div>
                          <div className="text-success" style={{ fontSize: '0.72rem' }}>
                            <i className="bi bi-check-circle-fill me-1"></i> Available Slot
                          </div>
                        </div>
                        <button className="btn btn-sm btn-outline-success">
                          Select
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted small p-3 bg-light rounded border">
                    No other open slots found on this date.
                  </div>
                )}
              </div>

              {/* Innovation 2: Alternative Suitable Rooms */}
              <div className="col-md-6">
                <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                  <i className="bi bi-door-open-fill fs-5"></i>
                  <h6 className="mb-0 fw-bold">Alternative Facilities</h6>
                </div>
                <p className="text-muted small mb-3">
                  Similar facilities available during your requested window:
                </p>

                {alternativeRooms.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {alternativeRooms.map((room) => (
                      <div
                        key={room._id}
                        className="suggestion-card d-flex justify-content-between align-items-center"
                        onClick={() => onSelectRoom(room)}
                      >
                        <div>
                          <div className="fw-bold text-dark small">{room.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                            <i className="bi bi-people-fill me-1"></i> Capacity: {room.capacity} | {room.location}
                          </div>
                        </div>
                        <button className="btn btn-sm btn-outline-primary">
                          Switch
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted small p-3 bg-light rounded border">
                    No alternative facilities available at this exact time.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer border-top" style={{ borderColor: '#e0f2fe' }}>
            <button type="button" className="btn btn-secondary-light" onClick={onClose}>
              Modify Booking Details Manually
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;
