import React, { useState, useEffect } from 'react';
import { getResources, createResource, updateResource } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ResourceManagement = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Classroom',
    building: 'Tech Block A',
    floor: '1st Floor',
    roomNumber: '101',
    capacity: 40,
    equipment: 'Projector, Air Conditioning, Smart Board',
    status: 'Available',
    approvalRequired: true,
    description: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchResourcesList();
  }, []);

  const fetchResourcesList = async () => {
    try {
      setLoading(true);
      const res = await getResources();
      if (res.data.success) {
        setResources(res.data.resources);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingResource(null);
    setFormData({
      name: '',
      type: 'Classroom',
      building: 'Tech Block A',
      floor: '1st Floor',
      roomNumber: '101',
      capacity: 40,
      equipment: 'Projector, Air Conditioning, Smart Board',
      status: 'Available',
      approvalRequired: true,
      description: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (res) => {
    setEditingResource(res);
    setFormData({
      name: res.name,
      type: res.type,
      building: res.location?.building || '',
      floor: res.location?.floor || '',
      roomNumber: res.location?.roomNumber || '',
      capacity: res.capacity,
      equipment: res.equipment?.join(', ') || '',
      status: res.status,
      approvalRequired: res.approvalRequired,
      description: res.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setFeedback({ type: '', text: '' });

    const payload = {
      name: formData.name,
      type: formData.type,
      location: {
        building: formData.building,
        floor: formData.floor,
        roomNumber: formData.roomNumber,
      },
      capacity: parseInt(formData.capacity, 10),
      equipment: formData.equipment.split(',').map((e) => e.trim()).filter(Boolean),
      status: formData.status,
      approvalRequired: formData.approvalRequired,
      description: formData.description,
    };

    try {
      if (editingResource) {
        const res = await updateResource(editingResource._id, payload);
        if (res.data.success) {
          setFeedback({ type: 'success', text: 'Facility updated successfully!' });
        }
      } else {
        const res = await createResource(payload);
        if (res.data.success) {
          setFeedback({ type: 'success', text: 'New facility registered successfully!' });
        }
      }
      setIsModalOpen(false);
      fetchResourcesList();
    } catch (err) {
      setFeedback({
        type: 'danger',
        text: err.response?.data?.message || 'Error saving facility details.',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleDeactivate = async (res) => {
    const nextStatus = res.status === 'Deactivated' ? 'Available' : 'Deactivated';
    if (!window.confirm(`Are you sure you want to mark "${res.name}" as ${nextStatus}?`)) return;

    try {
      await updateResource(res._id, { status: nextStatus });
      fetchResourcesList();
      setFeedback({
        type: 'info',
        text: `Facility status changed to ${nextStatus}.`,
      });
    } catch (err) {
      setFeedback({ type: 'danger', text: err.response?.data?.message || 'Failed to update status.' });
    }
  };

  const resourceTypes = [
    'Classroom',
    'Computer Lab',
    'Seminar Hall',
    'Projector',
    'Sports Facility',
    'Lab Equipment',
    'Auditorium',
    'Conference Room',
  ];

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Campus Facility & Resource Management</h2>
          <p className="text-muted small mb-0">
            Provision new rooms, configure seating capacity, specify equipment, and manage operational status
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary-gradient d-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i>
          <span>Add New Facility</span>
        </button>
      </div>

      {feedback.text && (
        <div className={`alert alert-${feedback.type} alert-dismissible fade show small py-2`} role="alert">
          {feedback.text}
          <button type="button" className="btn-close" onClick={() => setFeedback({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Resource Table */}
      <div className="card-glass p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted mt-2">Loading facility registry...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark-custom align-middle">
              <thead>
                <tr>
                  <th>Facility Name</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Capacity</th>
                  <th>Equipment Inventory</th>
                  <th>Status</th>
                  <th>Policy</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((res) => (
                  <tr key={res._id}>
                    <td>
                      <div className="fw-bold text-dark">{res.name}</div>
                      <div className="text-muted small text-truncate" style={{ maxWidth: '240px' }}>
                        {res.description}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-primary border" style={{ borderColor: '#bae6fd' }}>{res.type}</span>
                    </td>
                    <td>
                      <div className="small text-dark">{res.location?.building}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        Floor {res.location?.floor}, Room {res.location?.roomNumber}
                      </div>
                    </td>
                    <td>
                      <span className="fw-bold text-primary">{res.capacity}</span> <span className="small text-muted">seats</span>
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      <div className="d-flex flex-wrap gap-1">
                        {res.equipment?.slice(0, 3).map((eq, i) => (
                          <span key={i} className="equipment-pill" style={{ fontSize: '0.68rem' }}>
                            {eq}
                          </span>
                        ))}
                        {res.equipment?.length > 3 && (
                          <span className="text-muted small">+{res.equipment.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={res.status === 'Available' ? 'badge-available' : res.status === 'Under Maintenance' ? 'badge-maintenance' : 'badge-rejected'}>
                        {res.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${res.approvalRequired ? 'bg-warning text-dark' : 'bg-success'}`} style={{ fontSize: '0.7rem' }}>
                        {res.approvalRequired ? 'Approval' : 'Auto'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          onClick={() => openEditModal(res)}
                          className="btn btn-sm btn-outline-primary"
                          title="Edit Resource"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          onClick={() => handleToggleDeactivate(res)}
                          className={`btn btn-sm ${res.status === 'Deactivated' ? 'btn-outline-success' : 'btn-outline-danger'}`}
                          title={res.status === 'Deactivated' ? 'Reactivate' : 'Deactivate'}
                        >
                          <i className={`bi ${res.status === 'Deactivated' ? 'bi-check-circle' : 'bi-slash-circle'}`}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(6px)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content card-glass">
              <div className="modal-header border-bottom" style={{ borderColor: '#e0f2fe' }}>
                <h5 className="modal-title fw-bold text-dark">
                  {editingResource ? 'Edit Facility Information' : 'Register New Campus Facility'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsModalOpen(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label small text-muted">Facility Name</label>
                      <input
                        type="text"
                        className="form-control form-control-dark"
                        placeholder="e.g. Alan Turing High-Performance Computing Lab"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small text-muted">Category</label>
                      <select
                        className="form-select form-select-dark"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        {resourceTypes.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small text-muted">Building</label>
                      <input
                        type="text"
                        className="form-control form-control-dark"
                        placeholder="e.g. Science Block A"
                        value={formData.building}
                        onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small text-muted">Floor</label>
                      <input
                        type="text"
                        className="form-control form-control-dark"
                        placeholder="e.g. 2nd Floor"
                        value={formData.floor}
                        onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small text-muted">Room Number</label>
                      <input
                        type="text"
                        className="form-control form-control-dark"
                        placeholder="e.g. CS-204"
                        value={formData.roomNumber}
                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small text-muted">Seating Capacity</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control form-control-dark"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small text-muted">Operational Status</label>
                      <select
                        className="form-select form-select-dark"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Available">Available</option>
                        <option value="Under Maintenance">Under Maintenance</option>
                        <option value="Deactivated">Deactivated</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small text-muted">Reservation Policy</label>
                      <select
                        className="form-select form-select-dark"
                        value={formData.approvalRequired ? 'true' : 'false'}
                        onChange={(e) => setFormData({ ...formData, approvalRequired: e.target.value === 'true' })}
                      >
                        <option value="true">Approval Required by Manager</option>
                        <option value="false">Instant Auto-Approval</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small text-muted">Equipment & Amenities (Comma-separated)</label>
                      <input
                        type="text"
                        className="form-control form-control-dark"
                        placeholder="e.g. 4K Projector, Air Conditioning, Smart Board, Gigabit LAN"
                        value={formData.equipment}
                        onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small text-muted">Description & Special Instructions</label>
                      <textarea
                        rows="3"
                        className="form-control form-control-dark"
                        placeholder="Detailed room specs, audio-visual capabilities, and usage restrictions"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top" style={{ borderColor: '#e0f2fe' }}>
                  <button
                    type="button"
                    className="btn btn-secondary-light"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary-gradient"
                    disabled={submitLoading}
                  >
                    {submitLoading ? 'Saving Facility...' : editingResource ? 'Save Changes' : 'Register Facility'}
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

export default ResourceManagement;
