import { StyleSheet, Text, View, Dimensions } from 'react-native'
import React from 'react'

import RootNavigator from './src/navigations/RootNavigator';
import { OriginContextProvider, DestinationContextProvider } from './src/contexts/contexts';


const App = () => {
  return (
    <DestinationContextProvider>
      <OriginContextProvider>
        <RootNavigator />
      </OriginContextProvider>
    </DestinationContextProvider>
  )
}

export default App

const styles = StyleSheet.create({
  
  container:{
    flex:1
  }
  
})