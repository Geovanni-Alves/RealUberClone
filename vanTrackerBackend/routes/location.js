// routes/location.js

const express = require('express');
const router = express.Router();
const Location = require('../models/location');

// API route to save location data
router.post('/locations', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const newLocation = new Location({ latitude, longitude });
    await newLocation.save();
    res.status(201).json(newLocation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
