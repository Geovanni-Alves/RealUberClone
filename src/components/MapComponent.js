import { Text, View, StyleSheet } from 'react-native'
import React, { Component } from 'react'
import { mapStyle } from "../global/mapStyle";
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';

export class MapComponent extends Component {
  render() {
    return (
      <View>
        <MapView
     
            provider = {PROVIDER_GOOGLE}
            style = {styles.map}
            customMapStyle = {mapStyle}
            >
            
          </MapView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
    map:{
        height:"100%",
        width:"100%"
    },
})

export default MapComponent