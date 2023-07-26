const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;

const mongoUri = 'mongodb+srv://Geodarth:G&o150105@cluster0.un7fnzw.mongodb.net/'; // Replace with your MongoDB connection string
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

const locationSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Location = mongoose.model('Location', locationSchema);

// Set up WebSocket connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('location', (data) => {
    // Save location data to MongoDB
    const { latitude, longitude } = data;
    const location = new Location({ latitude, longitude });
    location.save((err) => {
      if (err) {
        console.error('Error saving location data:', err);
      }
    });
  });
});

// Start the server
http.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
