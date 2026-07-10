
const express = require('express');
const Table = require('../models/Table');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const tables = await Table.find({ isActive: true });
    res.json(tables);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', protect, admin, async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;
    const existingTable = await Table.findOne({ tableNumber, isActive: true });
    if (existingTable) {
      return res.status(400).json({ message: 'Table with this number already exists' });
    }
    const table = await Table.create({ tableNumber, capacity });
    res.status(201).json(table);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;
    if (tableNumber) {
      const conflict = await Table.findOne({ tableNumber, isActive: true, _id: { $ne: req.params.id } });
      if (conflict) {
        return res.status(400).json({ message: 'Table with this number already exists' });
      }
    }
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json(table);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
