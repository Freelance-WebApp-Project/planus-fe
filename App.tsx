import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './src/hoc/AuthContext';
import AppNavigator from './src/navigators/AppNavigator';
import { toastConfig } from './src/config/toast.config';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <Toast config={toastConfig} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
