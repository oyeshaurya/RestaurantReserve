import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const timeSlots = ['12:00', '13:00', '14:00', '18:00', '19:00', '20:00', '21:00'];

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [editingReservation, setEditingReservation] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [newTable, setNewTable] = useState({ tableNumber: '', capacity: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    fetchReservations();
    fetchTables();
  }, [dateFilter]);

  const fetchReservations = async () => {
    const params = dateFilter ? { date: dateFilter } : {};
    axios.get(`${API_URL}/reservations`, {
      headers: getAuthHeaders(),
      params
    }).then(res => setReservations(res.data)).catch(err => console.error(err));
  };

  const fetchTables = async () => {
    axios.get(`${API_URL}/tables`, {
      headers: getAuthHeaders()
    }).then(res => setTables(res.data)).catch(err => console.error(err));
  };

  const handleCreateTable = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post(`${API_URL}/tables`, newTable, {
        headers: getAuthHeaders()
      });
      setSuccess('Table created successfully!');
      fetchTables();
      setNewTable({ tableNumber: '', capacity: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create table');
    }
  };

  const handleUpdateTable = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.put(`${API_URL}/tables/${editingTable._id}`, editingTable, {
        headers: getAuthHeaders()
      });
      setSuccess('Table updated successfully');
      fetchTables();
      setEditingTable(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update table');
    }
  };

  const handleDeleteTable = async (id) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await axios.delete(`${API_URL}/tables/${id}`, {
          headers: getAuthHeaders()
        });
        setSuccess('Table deleted successfully');
        fetchTables();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete table');
      }
    }
  };

  const handleUpdateReservation = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.put(`${API_URL}/reservations/${editingReservation._id}`, editingReservation, {
        headers: getAuthHeaders()
      });
      setSuccess('Reservation updated');
      fetchReservations();
      setEditingReservation(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update reservation');
    }
  };

  const handleCancelReservation = async (id) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await axios.delete(`${API_URL}/reservations/${id}`, {
          headers: getAuthHeaders()
        });
        setSuccess('Reservation cancelled');
        fetchReservations();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to cancel reservation');
      }
    }
  };

  return (
    <div className="container">
      <h1 style={{ color: 'white', marginBottom: '2rem', fontSize: '2.5rem', fontWeight: 800 }}>
        Admin Dashboard
      </h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="dashboard-grid">
        <div className="stat-card">
          <h4>Total Reservations</h4>
          <h2>{reservations.length}</h2>
        </div>
        <div className="stat-card">
          <h4>Total Tables</h4>
          <h2>{tables.length}</h2>
        </div>
      </div>

      {/* Table Management */}
      <div className="card">
        <div className="card-header">
          <h3>Manage Tables</h3>
        </div>
        <form onSubmit={editingTable ? handleUpdateTable : handleCreateTable} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
              <label>Table Number</label>
              <input
                type="number"
                placeholder="Table Number"
                value={editingTable ? editingTable.tableNumber : newTable.tableNumber}
                onChange={(e) => editingTable
                  ? setEditingTable({ ...editingTable, tableNumber: parseInt(e.target.value) })
                  : setNewTable({ ...newTable, tableNumber: parseInt(e.target.value) })
                }
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
              <label>Capacity</label>
              <input
                type="number"
                placeholder="Capacity"
                value={editingTable ? editingTable.capacity : newTable.capacity}
                onChange={(e) => editingTable
                  ? setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) })
                  : setNewTable({ ...newTable, capacity: parseInt(e.target.value) })
                }
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">
                {editingTable ? 'Update' : 'Add Table'}
              </button>
              {editingTable && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingTable(null)}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        {tables.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            No tables yet. Add your first table!
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Table Number</th>
                  <th>Capacity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tables.map(table => (
                  <tr key={table._id}>
                    <td>{table.tableNumber}</td>
                    <td>{table.capacity}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingTable(table)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteTable(table._id)}
                        >
                          Delete
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

      {/* Reservations Management */}
      <div className="card">
        <div className="card-header">
          <h3>Reservations</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Filter by Date"
            />
            {dateFilter && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setDateFilter('')}
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {editingReservation && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Edit Reservation</h3>
                <button
                  className="modal-close"
                  onClick={() => setEditingReservation(null)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleUpdateReservation}>
                <div className="form-group">
                  <label>Table</label>
                  <select
                    value={editingReservation.table._id || editingReservation.table}
                    onChange={(e) => setEditingReservation({ ...editingReservation, table: e.target.value })}
                    required
                  >
                    {tables.map(table => (
                      <option key={table._id} value={table._id}>
                        Table {table.tableNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={new Date(editingReservation.date).toISOString().split('T')[0]}
                    onChange={(e) => setEditingReservation({ ...editingReservation, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time Slot</label>
                  <select
                    value={editingReservation.timeSlot}
                    onChange={(e) => setEditingReservation({ ...editingReservation, timeSlot: e.target.value })}
                    required
                  >
                    {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Number of Guests</label>
                  <input
                    type="number"
                    min="1"
                    value={editingReservation.numberOfGuests}
                    onChange={(e) => setEditingReservation({ ...editingReservation, numberOfGuests: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={editingReservation.status}
                    onChange={(e) => setEditingReservation({ ...editingReservation, status: e.target.value })}
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingReservation(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {reservations.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            No reservations found.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Table</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(res => (
                  <tr key={res._id}>
                    <td>{res.customer?.name || 'N/A'}</td>
                    <td>Table {res.table?.tableNumber || 'N/A'}</td>
                    <td>{new Date(res.date).toLocaleDateString()}</td>
                    <td>{res.timeSlot}</td>
                    <td>{res.numberOfGuests}</td>
                    <td>
                      <span className={`badge badge-${res.status === 'confirmed' ? 'confirmed' : 'cancelled'}`}>
                        {res.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingReservation(res)}
                        >
                          Edit
                        </button>
                        {res.status === 'confirmed' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancelReservation(res._id)}
                          >
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
    </div>
  );
};

export default AdminDashboard;
