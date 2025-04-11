import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LogBox } from 'react-native';

// Screens
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import DashboardScreen from './screens/DashboardScreen';
import CreateEventScreen from './screens/CreateEventScreen';
import EditEventScreen from './screens/EditEventScreen';
import FavoriteEventsScreen from './screens/FavoriteEventsScreen';
import EventDetailScreen from './screens/EventDetailScreen';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="SignIn"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#F8F9FA',
            },
            headerTintColor: '#6C63FF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{
              title: 'Create Account',
              headerBackTitle: 'Back'
            }}
          />
          <Stack.Screen
            name="Home"
            component={DashboardScreen}
            options={{
              title: 'My Events',
              headerRight: () => null,
              headerBackVisible: false
            }}
          />
          <Stack.Screen
            name="CreateEvent"
            component={CreateEventScreen}
            options={{
              title: 'Create Event',
              headerBackTitle: 'Cancel',
              headerTintColor: '#6C63FF',
              headerTitleStyle: {
                fontWeight: 'bold',
              }
            }}
          />
          <Stack.Screen
            name="EditEvent"
            component={EditEventScreen}
            options={{
              title: 'Edit Event',
              headerBackTitle: 'Back',
              headerTintColor: '#6C63FF',
              headerTitleStyle: {
                fontWeight: 'bold',
              }
            }}
          />
          <Stack.Screen
            name="FavoriteEvents"
            component={FavoriteEventsScreen}
            options={{
              title: 'Favorites',
              headerBackTitle: 'Back'
            }}
          />
          <Stack.Screen
            name="EventDetail"
            component={EventDetailScreen}
            options={{
              title: 'Event Details',
              headerBackTitle: 'Back'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}