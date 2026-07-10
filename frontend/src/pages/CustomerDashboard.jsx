import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const timeSlots = ['12:00', '13:00', '14:00', '18:00', '19:00', '20:00', '21:00'];

const CustomerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [reservedTableIds, setReservedTableIds] = useState([]);
  const [newReservation, setNewReservation] = useState({
    table: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '12:00',
    numberOfGuests: 1
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    fetchReservations();
    fetchTables();
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [newReservation.date, newReservation.timeSlot]);

  const fetchReservations = async () => {
    axios.get(`${API_URL}/reservations/my-reservations`, {
      headers: getAuthHeaders()
    }).then(res => setReservations(res.data)).catch(err => console.error(err));
  };

  const fetchTables = async () => {
    axios.get(`${API_URL}/tables`, {
      headers: getAuthHeaders()
    }).then(res => setTables(res.data)).catch(err => console.error(err));
  };

  const fetchAvailability = async () => {
    try {
      const response = await axios.get(`${API_URL}/reservations/availability`, {
        headers: getAuthHeaders(),
        params: {
          date: newReservation.date,
          timeSlot: newReservation.timeSlot
        }
      });
      setReservedTableIds(response.data.reservedTableIds);
      setNewReservation(prev => ({ ...prev, table: '' }));
    } catch (err) {
      console.error(err);
    }
  };

  const isTableAvailable = (tableId) => {
    return !reservedTableIds.some(id => id == tableId);
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post(`${API_URL}/reservations`, newReservation, {
        headers: getAuthHeaders()
      });
      setSuccess('Reservation created successfully!');
      fetchReservations();
      fetchAvailability();
      setNewReservation({
        table: '',
        date: new Date().toISOString().split('T')[0],
        timeSlot: '12:00',
        numberOfGuests: 1
      });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create reservation');
    }
  };

  const handleCancelReservation = async (id) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await axios.delete(`${API_URL}/reservations/${id}`, {
          headers: getAuthHeaders()
        });
        setSuccess('Reservation cancelled successfully');
        fetchReservations();
        fetchAvailability();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to cancel reservation');
      }
    }
  };

  return (
    <div className="container">
      <h1 style={{ color: 'white', marginBottom: '2rem', fontSize: '2.5rem', fontWeight: 800 }}>
        Welcome, {user?.name}
      </h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3>New Reservation</h3>
          </div>
          <form onSubmit={handleCreateReservation}>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={newReservation.date}
                onChange={(e) => setNewReservation({ ...newReservation, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Time Slot</label>
              <select
                value={newReservation.timeSlot}
                onChange={(e) => setNewReservation({ ...newReservation, timeSlot: e.target.value })}
                required
              >
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Select Table</label>
              <select
                value={newReservation.table}
                onChange={(e) => setNewReservation({ ...newReservation, table: e.target.value })}
                required
              >
                <option value="">Choose a table</option>
                {tables.map(table => {
                  const available = isTableAvailable(table._id);
                  return (
                    <option key={table._id} value={table._id} disabled={!available}>
                      Table {table.tableNumber} (Capacity: {table.capacity}) {!available ? ' - Already Booked' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="form-group">
              <label>Number of Guests</label>
              <input
                type="number"
                min="1"
                value={newReservation.numberOfGuests}
                onChange={(e) => setNewReservation({ ...newReservation, numberOfGuests: parseInt(e.target.value) })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Reserve Table
            </button>
          </form>
        </div>

        <div className="stat-card">
          <h4>My Reservations</h4>
          <h2>{reservations.length}</h2>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>My Reservations</h3>
        </div>
        {reservations.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            You have no reservations yet.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
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
                      {res.status === 'confirmed' && (
                        <div className="table-actions">
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancelReservation(res._id)}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
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

export default CustomerDashboard;
