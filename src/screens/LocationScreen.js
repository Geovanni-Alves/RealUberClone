// LocationScreen.js
import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import io from 'socket.io-client';

const SERVER_URL = 'http://192.168.1.77:3000'; // Replace 'your_server_ip' with the IP address of your backend server

const LocationScreen = () => {
  useEffect(() => {
    // Connect to the Socket.IO server
    const socket = io(SERVER_URL);

    // Listen for locationChange events from the server
    socket.on('locationChange', (data) => {
      console.log('Received location update:', data);
      // Handle the received location update in your React Native app
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  // Function to send location data to the backend server
  const sendLocationToServer = () => {
    // Simulate sending location data (replace this with your actual location logic)
    const currentLatitude = 40.7128; // Example latitude
    const currentLongitude = -74.0060; // Example longitude

    fetch('http://192.168.1.77:3000/api/locations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ latitude: currentLatitude, longitude: currentLongitude }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
      })
      .catch((error) => {
        console.error('Error sending location:', error);
      });
  };

  return (
    <View>
      <Text>Location Screen</Text>
      <Button title="Send Location" onPress={sendLocationToServer} />
    </View>
  );
};

export default LocationScreen;
