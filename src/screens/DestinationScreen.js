import { Avatar, Icon } from 'react-native-elements';
import { StyleSheet, Text, View, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import React, { useContext, useRef, useState, useEffect } from 'react';
import { colors, parameters } from '../global/styles';
import { GOOGLE_MAPS_APIKEY } from "@env";
import { OriginContext, DestinationContext } from '../contexts/contexts';
import * as Location from 'expo-location';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const DestinationScreen = ({ navigation }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const { dispatchOrigin } = useContext(OriginContext);
  const { dispatchDestination } = useContext(DestinationContext);

  const textInput1 = useRef(4);
  const textInput2 = useRef(5);

  const [destination, setDestination] = useState(false);
  const [fromInputDisabled, setFromInputDisabled] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy=1 });
      setCurrentLocation(location);
    })();
  }, []);

  const getCurrentLocationName = async () => {
    try {
      if (currentLocation) {
        const location = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        if (location.length > 0) {
          return `${location[0].name}, ${location[0].street}, ${location[0].city}, ${location[0].region}, ${location[0].country}`;
        }
      }
    } catch (error) {
      console.error('Error fetching current location name:', error);
    }
    return 'Current Location';
  };

  const handleUseCurrentLocation = async () => {
    dispatchOrigin({
      type: 'ADD_ORIGIN',
      payload: {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: await getCurrentLocationName(),
        name: 'Current Location',
      },
    });

    // Set the "From" input disabled only when destination is set
    if (!destination) {
      setFromInputDisabled(true);
    }

    setDestination(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.viewGobackArrow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon
            type="material-community"
            name="arrow-left"
            color={colors.grey1}
            size={32}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.currentLocationContainer}>
        {currentLocation && !fromInputDisabled && (
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={handleUseCurrentLocation}
          >
            <Text style={styles.currentLocationButtonText}>Use Current Location</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.fromInputContainer}>
        <GooglePlacesAutocomplete
          nearbyPlacesAPI='GooglePlacesSearch'
          placeholder={currentLocation ? 'Current Location' : 'From...'}
          listViewDisplayed="auto"
          debounce={400}
          ref={textInput1}
          minLength={2}
          enablePoweredByContainer={false}
          fetchDetails={true}
          autoFocus={true}
          styles={autoComplete}
          query={{
            key: GOOGLE_MAPS_APIKEY,
            Language: 'en',
          }}
          onPress={(data, details = null) => {
            dispatchOrigin({
              type: 'ADD_ORIGIN',
              payload: {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
                address: details.formatted_address,
                name: details.name,
              },
            });

            // Set the "From" input disabled only when destination is set
            if (!destination) {
              setFromInputDisabled(true);
            }

            setDestination(true);
          }}
        />
      </View>
      <View style={styles.goingToInputContainer}>
          {destination === true && (
            <GooglePlacesAutocomplete
              nearbyPlacesAPI='GooglePlacesSearch'
              placeholder='Going to...'
              listViewDisplayed="auto"
              debounce={400}
              currentLocationLabel='Current location'
              ref={textInput2}
              minLength={2}
              enablePoweredByContainer={false}
              fetchDetails={true}
              autoFocus={true}
              styles={autoComplete}
              query={{
                key: GOOGLE_MAPS_APIKEY,
                Language: 'en',
              }}
              onPress={(data, details = null) => {
                dispatchDestination({
                  type: 'ADD_DESTINATION',
                  payload: {
                    latitude: details.geometry.location.lat,
                    longitude: details.geometry.location.lng,
                    address: details.formatted_address,
                    name: details.name,
                  },
                });
                navigation.navigate('SendLocationScreen', { state: 0 });
              }}
            />
            )}
      </View>
    </SafeAreaView>
  );
};

export default DestinationScreen;

const styles = StyleSheet.create({
  viewGobackArrow: {
    alignItems: 'flex-start',
    paddingLeft: 15,
    paddingTop: 15, // Add padding top to the arrow container
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
    padding: 20, // Add some padding to the container
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  currentLocationContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  fromInputContainer: {
    marginBottom: 10,
    width:300,
  },
  goingToInputContainer: {
    paddingTop: 40,
    width:300,
  },
  currentLocationButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  currentLocationButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: 'bold',
  },
  view1: {
    position: 'absolute',
    top: 25,
    left: 12,
    backgroundColor: colors.white,
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'left',
    alignItems: 'left',
    marginTop: 1,
    zIndex: 10,
  },
  view3: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 10,
    backgroundColor: colors.white,
    height: 30,
    zIndex: 10,
  },
  view6: {
    backgroundColor: colors.grey6,
    flex: 1,
    width: SCREEN_WIDTH * 0.7,
    height: 40,
    justifyContent: 'center',
    marginTop: 10,
    paddingLeft: 0,
  },
  view2: {
    backgroundColor: colors.white,
    zIndex: 4,
    paddingBottom: 10,
    left: 2,
  },

  view24: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
    paddingHorizontal: 20,
  },

  view25: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  flatlist: {
    marginTop: 20,
    zIndex: 17,
    elevation: 8,
  },
});

const autoComplete = {
  textInput: {
    backgroundColor: colors.grey6,
    height: 50,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 15,
    flex: 2,
    borderWidth: 1,
    marginHorizontal: 15,
  },
  container: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: colors.white,
  },

  textInputContainer: {
    flexDirection: 'row',
  },
};
