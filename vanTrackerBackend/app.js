// app.js

const express = require('express');
const app = express();
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);
const mongoose = require('mongoose');

// Connect to MongoDB
const dbURI = 'mongodb+srv://geodarth:G&o150105@cluster0.4zerhpi.mongodb.net/?retryWrites=true&w=majority'; // Replace with your MongoDB connection string
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Mongoose model for location data
const locationSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Location = mongoose.model('Location', locationSchema);

// Socket.IO server to handle real-time communication
io.on('connection', (socket) => {
  console.log('A user connected');

  // MongoDB Change Stream to listen for new location data
  const changeStream = Location.watch();
  changeStream.on('change', (change) => {
    if (change.operationType === 'insert') {
      const newLocation = change.fullDocument;
      socket.emit('newLocation', newLocation);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
