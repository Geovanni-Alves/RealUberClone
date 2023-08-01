import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
//import RequestScreen from '../screens/RequestScreen'
import DestinationScreen from '../screens/DestinationScreen';
import SendLocationScreen from '../screens/SendLocationScreen';
//import LocationScreen from '../screens/LocationScreen';

const Home = createNativeStackNavigator();

export function HomeStack(){
    return(
        <Home.Navigator>
            <Home.Screen
                name = "HomeScreen"
                component={HomeScreen}
                options ={{headerShown:false}}
            />
            <Home.Screen
                name = "DestinationScreen"
                component={DestinationScreen}
                options ={{headerShown:false}}
            />
            <Home.Screen
                name = "SendLocationScreen"
                component={SendLocationScreen}
                options ={{headerShown:false}}
            />
        </Home.Navigator>
    )
}