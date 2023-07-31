// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = 3000;
const MONGODB_URI = 'mongodb+srv://geodarth:G&o150105@cluster0.4zerhpi.mongodb.net/vanTracker?retryWrites=true&w=majority'; // Replace 'your_db_name' with your MongoDB database name

//console.log(server);

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Create a MongoDB schema and model for the location data
const locationSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  timestamp: { type: Date, default: Date.now },
});
const Location = mongoose.model('Location', locationSchema);

// Express middleware to parse JSON data
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the server!');
});

// API endpoint to receive location data
app.post('/api/locations', (req, res) => {
  const { latitude, longitude } = req.body;
  
  // Save the location data to MongoDB
  const location = new Location({ latitude, longitude });
  location.save()
    .then(() => {
      // Emit a Socket.IO event to notify clients about the new location data
      io.emit('locationChange', { latitude, longitude });
      res.status(200).json({ message: 'Location saved successfully' });
    })
    .catch((err) => {
      console.error('Error saving location:', err);
      res.status(500).json({ error: 'Error saving location' });
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server started on http://127.0.0.1:${PORT}`);
});
