import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const { refreshUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotificationsList();
  }, []);

  const fetchNotificationsList = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      fetchNotificationsList();
      refreshUser();
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      fetchNotificationsList();
      refreshUser();
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_update':
        return 'bi-calendar-check text-success';
      case 'maintenance_update':
        return 'bi-tools text-warning';
      case 'conflict_alert':
        return 'bi-exclamation-triangle text-danger';
      default:
        return 'bi-info-circle text-info';
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <span>In-App Notifications</span>
            {unreadCount > 0 && (
              <span className="badge bg-danger rounded-pill fs-6">{unreadCount} New</span>
            )}
          </h2>
          <p className="text-muted small mb-0">
            Real-time automated alerts regarding booking confirmations, approvals, and facility maintenance
          </p>
        </div>

        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-secondary-light btn-sm">
            <i className="bi bi-check2-all me-1"></i> Mark All as Read
          </button>
        )}
      </div>

      <div className="card-glass p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted mt-2">Loading alerts...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-bell-slash fs-1 mb-2"></i>
            <h5>No notifications yet</h5>
            <p className="small">You're all caught up!</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className="p-3 rounded d-flex justify-content-between align-items-center gap-3"
                style={{
                  background: notif.isRead ? '#ffffff' : '#f0f9ff',
                  border: notif.isRead ? '1px solid #e2e8f0' : '1px solid #7dd3fc',
                  boxShadow: notif.isRead ? 'none' : '0 2px 8px rgba(14, 165, 233, 0.1)',
                }}
              >
                <div className="d-flex align-items-start gap-3">
                  <div className="fs-4 mt-1">
                    <i className={`bi ${getNotificationIcon(notif.type)}`}></i>
                  </div>
                  <div>
                    <div className={`small ${notif.isRead ? 'text-muted' : 'text-dark fw-bold'}`}>
                      {notif.message}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      {new Date(notif.createdAt).toLocaleString()} &bull; Type: {notif.type}
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {notif.link && (
                    <Link to={notif.link} className="btn btn-sm btn-outline-primary">
                      View
                    </Link>
                  )}
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkRead(notif._id)}
                      className="btn btn-sm btn-outline-secondary"
                      title="Mark as read"
                    >
                      <i className="bi bi-check2"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
