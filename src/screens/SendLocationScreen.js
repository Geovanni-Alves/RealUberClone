import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Circle,Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import io from 'socket.io-client';
//import axios from 'axios';

const SERVER_URL = 'http://192.168.1.77:3000' // needs to change for a cloud service which will host the backend server
//const socket = io(SERVER_URL);


export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  
  //const isAndroid = Platform.OS == 'android';
  
  // Call the function to check the server status
 
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({accuracy: 1 });
      setLocation(location);
    })();
  }, []);
  
  const updateLocationAutomatically = useCallback(async () => {
    if (location?.coords?.accuracy < 50) {
      // If the accuracy is sufficient (e.g., less than 50 meters), stop the automatic updates
      return;
    }

    // If the accuracy is not sufficient, update the location with higher accuracy
    const newLocation = await getLocation(Location.Accuracy.High);
    setLocation(newLocation);
  }, [location]);

  useEffect(() => {
    let timerId;
    if (mapReady && !timerId) {
      // Start the automatic location updates after 5 seconds (adjust the interval as needed)
      timerId = setInterval(updateLocationAutomatically, 5000);
    }

    return () => {
      // Clean up the timer when the component unmounts
      clearInterval(timerId);
    };
  }, [mapReady, updateLocationAutomatically]);



  const handleMapReady = () => {
    setMapReady(true);
  };

  const sendLocation = () => {
    const lat = location.coords.latitude;
    const lng = location.coords.longitude;

    fetch(`${SERVER_URL}/api/locations`,{
        method: 'POST',
        headers: {
          'Content-Type':'application/json',
        },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
      })
      .catch((error) => {
        console.error('Error sending :', error);
      });
    
  };

    const handleRegionChangeComplete = () => {
      // Implement any additional logic you need when the region changes
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

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={getInitialRegion()}
                provider = {PROVIDER_GOOGLE}
                onMapReady={handleMapReady}
                onRegionChangeComplete={handleRegionChangeComplete}
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
            {location &&
              <TouchableOpacity style={styles.shareButton} onPress={sendLocation}>
                  <Text style={styles.shareButtonText}>Share Location (Mongo DB)</Text>
              </TouchableOpacity>
            }
        </View>    
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    position:'absolute',
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
});
