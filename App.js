import { StyleSheet, Text, View, Dimensions } from 'react-native'
import React from 'react'

import RootNavigator from './src/navigations/RootNavigator';
import { OriginContextProvider } from './src/contexts/contexts';


const App = () => {
  return (
    <OriginContextProvider>
      <RootNavigator />
    </OriginContextProvider>
  )
}

export default App

const styles = StyleSheet.create({
  
  container:{
    flex:1
  }
  
})