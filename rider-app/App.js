import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { TripProvider } from './src/contexts/TripContext';
import { LocationProvider } from './src/contexts/LocationContext';
import AppNavigator from './src/navigation/AppNavigator';
import { STRIPE_PUBLISHABLE_KEY } from './src/config/constants';

export default function App() {
  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.rideon"
    >
      <AuthProvider>
        <LocationProvider>
          <TripProvider>
            <NavigationContainer>
              <AppNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </TripProvider>
        </LocationProvider>
      </AuthProvider>
    </StripeProvider>
  );
}
