import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Circle,Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const handleMapReady = () => {
    setMapReady(true);
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
      }, 1000);

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
});
