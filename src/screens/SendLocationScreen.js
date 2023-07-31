import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';

const SERVER_URL = 'http://192.168.1.77:3000'; // Needs to change for a cloud service which will host the backend server

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [sharingStatus, setSharingStatus] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: 1 });
      setLocation(location);
    })();
  }, []);

  const handleMapReady = () => {
    setMapReady(true);
  };

  
  const handleGoBack = () => {
    navigation.goBack();
  };

  const getInitialRegion = () => ({
    latitude: 49.2827,
    longitude: -123.1207,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const getZoomedInRegion = (location) => ({
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.002,
    longitudeDelta: 0.002,
  });

  let mapRef = null;

  useEffect(() => {
    if (location && mapReady) {
      // Automatically zoom in after 2 seconds
      const zoomTimeout = setTimeout(() => {
        mapRef.animateToRegion(getZoomedInRegion(location), 1000);
      }, 500);

      // Clear the timeout to avoid zooming if the component unmounts before the 2 seconds
      return () => clearTimeout(zoomTimeout);
    }
  }, [location, mapReady]);

  const toggleSharing = () => {
    setSharingStatus((prevStatus) => !prevStatus); // Toggle the sharing status (start or stop sharing)
  };

  useEffect(() => {
    if (sharingStatus) {
      console.log('Starting location watch');
      const subscription = Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 0.010,
        },
        (location) => {
          console.log('Sending location', location);
          //sendLocation(location);
          // Implement your logic to send the location data to the server here
        }
      );
      setLocationSubscription(subscription);
      // Start sending location updates to the server every 5 seconds
      const id = setInterval(() => {
        if (locationSubscription) {
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }).then((location) => {
            console.log('Sending location', location);
            //sendLocation(location);
          });
        }
      }, 5000);
      setIntervalId(id);


    } else {
      console.log('Stopping location watch');
      if (locationSubscription) {
        locationSubscription.remove();
        
      }
      setLocationSubscription(null);
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }

    // Clean up the location subscription when the component unmounts

  }, [sharingStatus]);

  useEffect(() => {
    // Clean up the location subscription when the component unmounts
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const sendLocation = (location) => {
    if (location?.coords) {
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;

      fetch(`${SERVER_URL}/api/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message);
        })
        .catch((error) => {
          console.error('Error sending:', error);
        });
    }
  };

  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={getInitialRegion()}
          provider={PROVIDER_GOOGLE}
          onMapReady={handleMapReady}
          ref={(ref) => (mapRef = ref)}
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="You are here"
            />
          )}
          {location && (
            <Circle
              center={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              radius={50} // Change the value to adjust the circle radius
              fillColor="rgba(100,100,255,0.3)" // Change the color and opacity of the circle
            />
          )}
        </MapView>

        {!mapReady && (
          <View style={styles.loadingContainer}>
            {location ? (
              <>
                <Text>Loading...</Text>
                <ActivityIndicator size="small" color="#0000ff" />
              </>
            ) : (
              <Text>Getting Location...</Text>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
        {location && (
          <TouchableOpacity style={styles.shareButton} onPress={sendLocation}>
            <Text style={styles.shareButtonText}>Save Location (Mongo DB)</Text>
          </TouchableOpacity>
        )}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={sharingStatus ? styles.stopButton : styles.startButton}
            onPress={toggleSharing}
          >
            <Text style={styles.buttonText}>
              {sharingStatus ? 'Stop Sharing' : 'Start Sharing'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  goBackButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    zIndex: 1,
  },
  goBackButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  shareButton: {
    position: 'absolute',
    top: 20,
    right: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    zIndex: 1,
  },
  shareButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  stopButton: {
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
