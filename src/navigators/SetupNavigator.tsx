import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileSetupScreen from '../screens/Setup/ProfileSetupScreen';
import IncomeSetupScreen from '../screens/Setup/IncomeSetupScreen';

const Stack = createStackNavigator();

const SetupNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: false, // Disable swipe back gesture
      }}
    >
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="IncomeSetup" component={IncomeSetupScreen} />
    </Stack.Navigator>
  );
};

export default SetupNavigator;
