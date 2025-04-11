// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import DashboardScreen from './screens/DashboardScreen';
import CreateEventScreen from './screens/CreateEventScreen'; // Import CreateEventScreen
import { View, Text } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ title: 'Create Account' }}
        />
        <Stack.Screen
          name="Home"
          component={DashboardScreen}
          options={{ title: 'Dashboard', headerRight: () => null }}
        />
        <Stack.Screen
          name="CreateEvent" // Add the CreateEvent screen to the navigator
          component={CreateEventScreen}
          options={{ title: 'Create Event' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}