import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import EarningsScreen from '../screens/main/EarningsScreen';
import TripsScreen from '../screens/main/TripsScreen';
import RatingsScreen from '../screens/main/RatingsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Trip Screens
import TripDetailsScreen from '../screens/trip/TripDetailsScreen';
import ActiveTripScreen from '../screens/trip/ActiveTripScreen';

// Profile Screens
import DocumentsScreen from '../screens/profile/DocumentsScreen';
import VehicleScreen from '../screens/profile/VehicleScreen';
import BankDetailsScreen from '../screens/profile/BankDetailsScreen';
import PerformanceScreen from '../screens/profile/PerformanceScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

// Earnings Screens
import WalletScreen from '../screens/earnings/WalletScreen';
import IncentivesScreen from '../screens/earnings/IncentivesScreen';
import PayoutHistoryScreen from '../screens/earnings/PayoutHistoryScreen';

// Support Screens
import SupportScreen from '../screens/support/SupportScreen';
import SafetyToolkitScreen from '../screens/support/SafetyToolkitScreen';
import IncidentReportScreen from '../screens/support/IncidentReportScreen';
import FAQScreen from '../screens/support/FAQScreen';

// Other Screens
import ReferralScreen from '../screens/main/ReferralScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
  </Stack.Navigator>
);

const MainTabs = () => {
    useEffect(() => {
    StatusBar.setBarStyle('light-content');
  }, [])
  return(<Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#160832',
      tabBarInactiveTintColor: '#9CA3AF',
      headerShown: false,
      tabBarStyle: {
        paddingBottom: 8,
        paddingTop: 8,
        height: 60,
        marginBottom:12,
        elevation: 0,          // Android
        shadowColor: 'transparent', // iOS
        borderTopWidth: 0,     // iOS thin line
      },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Earnings"
      component={EarningsScreen}
      options={{
        tabBarLabel: 'Earnings',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="wallet" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Trips"
      component={TripsScreen}
      options={{
        tabBarLabel: 'Trips',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="car" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Ratings"
      component={RatingsScreen}
      options={{
        tabBarLabel: 'Ratings',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="star" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="person" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>)
    };

const MainStack = () => {
      useEffect(() => {
    StatusBar.setBarStyle('dark-content');
  }, [])
  return(<Stack.Navigator >
    <Stack.Screen
      name="MainTabs"
      component={MainTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="TripDetails"
      component={TripDetailsScreen}
      options={{ title: 'Trip Details' }}
    />
    <Stack.Screen
      name="ActiveTrip"
      component={ActiveTripScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Documents"
      component={DocumentsScreen}
      options={{ title: 'My Documents' }}
    />
    <Stack.Screen
      name="Vehicle"
      component={VehicleScreen}
      options={{ title: 'Vehicle Details' }}
    />
    <Stack.Screen
      name="BankDetails"
      component={BankDetailsScreen}
      options={{ title: 'Bank Details' }}
    />
    <Stack.Screen
      name="Performance"
      component={PerformanceScreen}
      options={{ title: 'Performance & Compliance' }}
    />
    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
    <Stack.Screen
      name="Wallet"
      component={WalletScreen}
      options={{ title: 'Wallet' }}
    />
    <Stack.Screen
      name="Incentives"
      component={IncentivesScreen}
      options={{ title: 'Incentives & Offers' }}
    />
    <Stack.Screen
      name="PayoutHistory"
      component={PayoutHistoryScreen}
      options={{ title: 'Payout History' }}
    />
    <Stack.Screen
      name="Support"
      component={SupportScreen}
      options={{ title: 'Support' }}
    />
    <Stack.Screen
      name="SafetyToolkit"
      component={SafetyToolkitScreen}
      options={{ title: 'Safety Toolkit' }}
    />
    <Stack.Screen
      name="IncidentReport"
      component={IncidentReportScreen}
      options={{ title: 'Report Incident' }}
    />
    <Stack.Screen
      name="FAQ"
      component={FAQScreen}
      options={{ title: 'FAQs' }}
    />
    <Stack.Screen
      name="Referral"
      component={ReferralScreen}
      options={{ title: 'Referral Program',}}

    />
  </Stack.Navigator> 
)};

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#160832" />
      </View>
    );
  }

  return user ? <MainStack /> : <AuthStack />;
}
