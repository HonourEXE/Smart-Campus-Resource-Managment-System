import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole, getAuditLogs } from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'audit'
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'users') {
        const res = await getAllUsers();
        if (res.data.success) setUsers(res.data.users);
      } else {
        const res = await getAuditLogs();
        if (res.data.success) setAuditLogs(res.data.logs);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await updateUserRole(userId, { role: newRole });
      if (res.data.success) {
        setFeedback({ type: 'success', text: `User role changed to ${newRole.toUpperCase()}.` });
        fetchAdminData();
      }
    } catch (err) {
      setFeedback({ type: 'danger', text: err.response?.data?.message || 'Failed to update user role.' });
    }
  };

  const handleToggleActive = async (userId, currentActive) => {
    try {
      const res = await updateUserRole(userId, { isActive: !currentActive });
      if (res.data.success) {
        setFeedback({
          type: 'info',
          text: `User account ${!currentActive ? 'activated' : 'deactivated'}.`,
        });
        fetchAdminData();
      }
    } catch (err) {
      setFeedback({ type: 'danger', text: err.response?.data?.message || 'Failed to update status.' });
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Title */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Administrative Control & Security Audit</h2>
          <p className="text-muted small mb-0">
            RBAC role delegation, account lifecycle, and immutable security audit records
          </p>
        </div>

        {/* Tab Controls */}
        <div className="btn-group">
          <button
            onClick={() => setActiveTab('users')}
            className={`btn ${activeTab === 'users' ? 'btn-primary-gradient' : 'btn-secondary-light'}`}
          >
            <i className="bi bi-people-fill me-1"></i> User Management
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`btn ${activeTab === 'audit' ? 'btn-primary-gradient' : 'btn-secondary-light'}`}
          >
            <i className="bi bi-shield-lock-fill me-1"></i> Audit Logs
          </button>
        </div>
      </div>

      {feedback.text && (
        <div className={`alert alert-${feedback.type} alert-dismissible fade show small py-2`} role="alert">
          {feedback.text}
          <button type="button" className="btn-close" onClick={() => setFeedback({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Main View Card */}
      <div className="card-glass p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted mt-2">Loading administrative records...</p>
          </div>
        ) : activeTab === 'users' ? (
          /* User Management Table */
          <div className="table-responsive">
            <table className="table table-dark-custom align-middle">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Department</th>
                  <th>Current Role</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th className="text-end">Assign Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="fw-bold text-dark">{u.name}</div>
                      <div className="text-muted small">{u.email}</div>
                    </td>
                    <td className="small text-dark">{u.department}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'bg-danger' : u.role === 'resource_manager' ? 'bg-warning text-dark' : u.role === 'faculty' ? 'bg-info text-dark' : 'bg-primary'} text-uppercase`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-available' : 'badge-rejected'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="small text-muted">
                      {new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end align-items-center gap-2">
                        <select
                          className="form-select form-select-sm form-select-dark"
                          style={{ width: '150px' }}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        >
                          <option value="student">Student</option>
                          <option value="faculty">Faculty</option>
                          <option value="resource_manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>

                        <button
                          onClick={() => handleToggleActive(u._id, u.isActive)}
                          className={`btn btn-sm ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          title={u.isActive ? 'Deactivate account' : 'Activate account'}
                        >
                          <i className={`bi ${u.isActive ? 'bi-person-x-fill' : 'bi-person-check-fill'}`}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Audit Logs Table */
          <div className="table-responsive">
            <table className="table table-dark-custom align-middle">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Actor</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log._id}>
                      <td className="small text-muted font-monospace">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <span className="badge bg-secondary font-monospace" style={{ fontSize: '0.72rem' }}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-light border text-primary" style={{ borderColor: '#bae6fd' }}>
                          {log.entityType}
                        </span>
                      </td>
                      <td>
                        <div className="small text-dark fw-semibold">{log.actorId?.name || 'System / Guest'}</div>
                        <div className="text-muted" style={{ fontSize: '0.68rem' }}>
                          {log.actorId?.role} &bull; {log.actorId?.email}
                        </div>
                      </td>
                      <td className="small text-dark font-monospace" style={{ maxWidth: '300px' }}>
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
