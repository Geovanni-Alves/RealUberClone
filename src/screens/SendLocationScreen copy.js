import { StyleSheet, Text, View } from 'react-native'
import React, {useState,useEffect} from 'react'
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {GOOGLE_MAPS_APIKEY} from "@env";
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';

const SendLocationScreen = () => {
const [userLocation, setUserLocation] = useState(null);


useEffect(() => {
        (async () => {
        // permissions check
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        // do something when permission is denied
        return;
    }

        const location = await Location.getCurrentPositionAsync();
        setUserLocation(location);
        })()
    }, [])
    console.log(userLocation);
    return (
      <SafeAreaView style={styles.container}>
        <MapView 
            style={{width: '100%', height: '100%'}}
            provider = {PROVIDER_GOOGLE}
            showsUserLocation = {true}
            followsUserLocation= {true}
            animateToRegion={userLocation && userLocation.coords}
            
            >
            {userLocation && <Marker coordinate={userLocation.coords} />}
        </MapView>
      </SafeAreaView>
    );
  }

export default SendLocationScreen

const styles = StyleSheet.create({})