import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import { DriverProvider } from './src/contexts/DriverContext';
import { LocationProvider } from './src/contexts/LocationContext';
import AppNavigator from './src/navigation/AppNavigator';
import { requestPermissions } from './src/services/permissions.service';

export default function App() {
  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <PaperProvider>
      <AuthProvider>
        <DriverProvider>
          <LocationProvider>
            <NavigationContainer>
              <AppNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </LocationProvider>
        </DriverProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
