import React, { useState, useEffect } from 'react';
import { getResources, getBookings } from '../services/api';
import { Link } from 'react-router-dom';

const CalendarView = () => {
  const [resources, setResources] = useState([]);
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [dayBookings, setDayBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await getResources();
        if (res.data.success && res.data.resources.length > 0) {
          setResources(res.data.resources);
          setSelectedResourceId(res.data.resources[0]._id);
        }
      } catch (err) {
        console.error('Error fetching resources for schedule:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedResourceId) return;
    fetchSchedule();
  }, [selectedResourceId, selectedDate]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await getBookings({
        resourceId: selectedResourceId,
        date: selectedDate,
      });
      if (res.data.success) {
        setDayBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const hours = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
  ];

  const currentResource = resources.find((r) => r._id === selectedResourceId);

  // Helper to test if a given hour bucket has a booking
  const getBookingForHour = (hourStr) => {
    const targetH = parseInt(hourStr.split(':')[0], 10);
    return dayBookings.find((b) => {
      const bStart = new Date(b.startTime).getHours();
      const bEnd = new Date(b.endTime).getHours();
      return targetH >= bStart && targetH < (bEnd || bStart + 1);
    });
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Page Title */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Campus Schedule & Reservation Grid</h2>
          <p className="text-muted small mb-0">
            Real-time visual timetable of classroom, laboratory, and auditorium availability
          </p>
        </div>

        <Link to="/resources" className="btn btn-primary-gradient d-flex align-items-center gap-2">
          <i className="bi bi-calendar-plus"></i>
          <span>Make a Reservation</span>
        </Link>
      </div>

      {/* Control Bar: Facility Selector & Date Picker */}
      <div className="card-glass p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6">
            <label className="form-label small text-muted mb-1">Select Campus Facility</label>
            <select
              className="form-select form-select-dark"
              value={selectedResourceId}
              onChange={(e) => setSelectedResourceId(e.target.value)}
            >
              {resources.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} ({r.type} &bull; Cap: {r.capacity})
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label small text-muted mb-1">Target Date</label>
            <input
              type="date"
              className="form-control form-control-dark"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-2 d-flex align-items-end">
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="btn btn-secondary-dark w-100"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Facility Header Info */}
      {currentResource && (
        <div className="card-glass p-4 mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <div className="d-flex align-items-center gap-2">
                <h4 className="fw-bold text-white mb-0">{currentResource.name}</h4>
                <span className={currentResource.status === 'Available' ? 'badge-available small' : 'badge-maintenance small'}>
                  {currentResource.status}
                </span>
              </div>
              <div className="text-muted small mt-1">
                <i className="bi bi-geo-alt me-1"></i>
                {currentResource.location?.building}, Room {currentResource.location?.roomNumber} &bull; Capacity: {currentResource.capacity} Seats
              </div>
            </div>

            <div className="d-flex gap-3 text-dark small">
              <div className="d-flex align-items-center gap-2">
                <span className="badge rounded-circle p-1 bg-success">&nbsp;</span> Confirmed Booking
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="badge rounded-circle p-1 bg-warning">&nbsp;</span> Pending Approval
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="badge rounded-circle p-1 bg-secondary">&nbsp;</span> Open Slot
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hourly Timeline Grid */}
      <div className="card-glass p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted mt-2">Loading timetable...</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {hours.map((hour) => {
              const booking = getBookingForHour(hour);

              return (
                <div
                  key={hour}
                  className="row g-2 align-items-center p-3 rounded"
                  style={{
                    background: booking
                      ? booking.status === 'Approved'
                        ? '#f0fdf4'
                        : '#fffbeb'
                      : '#ffffff',
                    border: booking
                      ? booking.status === 'Approved'
                        ? '1px solid #86efac'
                        : '1px solid #fde68a'
                      : '1px solid #e2e8f0',
                  }}
                >
                  <div className="col-12 col-md-2">
                    <span className="fw-bold text-dark font-monospace">{hour} - {parseInt(hour.split(':')[0], 10) + 1}:00</span>
                  </div>

                  <div className="col-12 col-md-8">
                    {booking ? (
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <span className={`badge ${booking.status === 'Approved' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {booking.status}
                          </span>
                          <strong className="text-dark">{booking.purpose}</strong>
                        </div>
                        <div className="text-muted small mt-1">
                          Reserved by {booking.userId?.name || 'Authorized Member'} &bull; Attendees: {booking.attendeesCount}
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted small d-flex align-items-center gap-2">
                        <i className="bi bi-dash-circle text-primary"></i>
                        <span>Facility is unreserved during this hour. Available for booking.</span>
                      </div>
                    )}
                  </div>

                  <div className="col-12 col-md-2 text-md-end">
                    {!booking && currentResource?.status === 'Available' && (
                      <Link
                        to="/resources"
                        className="btn btn-sm btn-outline-primary"
                      >
                        Reserve
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
