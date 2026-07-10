
const express = require('express');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// Availability endpoint
router.get('/availability', protect, async (req, res) => {
  try {
    const { date, timeSlot } = req.query;
    if (!date || !timeSlot) {
      return res.status(400).json({ message: 'Date and timeSlot are required' });
    }
    
    const reservedTables = await Reservation.find({ 
      date, 
      timeSlot, 
      status: 'confirmed' 
    }).select('table');
    const reservedTableIds = reservedTables.map(r => r.table.toString());
    
    res.json({ reservedTableIds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's reservations
router.get('/my-reservations', protect, async (req, res) => {
  try {
    const reservations = await Reservation.find({ customer: req.user._id })
      .populate('table')
      .populate('customer', 'name email');
    res.json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all reservations (admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const { date } = req.query;
    const filter = date ? { date } : {};
    const reservations = await Reservation.find(filter)
      .populate('table')
      .populate('customer', 'name email');
    res.json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a reservation
router.post('/', protect, async (req, res) => {
  try {
    const { table, date, timeSlot, numberOfGuests } = req.body;

    // Check table exists and has capacity
    const tableDoc = await Table.findById(table);
    if (!tableDoc) {
      return res.status(404).json({ message: 'Table not found' });
    }
    if (tableDoc.capacity < numberOfGuests) {
      return res.status(400).json({ message: 'Table capacity insufficient for number of guests' });
    }

    // Check for conflicts
    const conflict = await Reservation.findOne({
      table,
      date,
      timeSlot,
      status: 'confirmed'
    });
    if (conflict) {
      return res.status(400).json({ message: 'Table is already reserved for this date and time' });
    }

    const reservation = await Reservation.create({
      customer: req.user._id,
      table,
      date,
      timeSlot,
      numberOfGuests
    });

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('table')
      .populate('customer', 'name email');

    res.status(201).json(populatedReservation);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message, error: error.message });
  }
});

// Update a reservation
router.put('/:id', protect, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && reservation.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this reservation' });
    }

    // Check table and capacity if changing table or guests
    if (req.body.table || req.body.numberOfGuests) {
      const tableId = req.body.table || reservation.table;
      const tableDoc = await Table.findById(tableId);
      if (!tableDoc) {
        return res.status(404).json({ message: 'Table not found' });
      }
      const guests = req.body.numberOfGuests || reservation.numberOfGuests;
      if (tableDoc.capacity < guests) {
        return res.status(400).json({ message: 'Table capacity insufficient for number of guests' });
      }
    }

    // Check for conflicts if changing table, date, or time
    if (req.body.table || req.body.date || req.body.timeSlot) {
      const updatedTable = req.body.table || reservation.table;
      const updatedDate = req.body.date || reservation.date;
      const updatedTimeSlot = req.body.timeSlot || reservation.timeSlot;

      const conflict = await Reservation.findOne({
        _id: { $ne: req.params.id },
        table: updatedTable,
        date: updatedDate,
        timeSlot: updatedTimeSlot,
        status: 'confirmed'
      });
      if (conflict) {
        return res.status(400).json({ message: 'Table is already reserved for this date and time' });
      }
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('table').populate('customer', 'name email');

    res.json(updatedReservation);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message, error: error.message });
  }
});

// Cancel a reservation
router.delete('/:id', protect, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && reservation.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
    }

    await Reservation.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    res.json({ message: 'Reservation cancelled' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
