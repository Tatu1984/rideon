import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../config/constants';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import TripsScreen from '../screens/main/TripsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import WalletScreen from '../screens/main/WalletScreen';
import OffersScreen from '../screens/main/OffersScreen';

// Booking Screens
import BookingScreen from '../screens/booking/BookingScreen';
import VehicleSelectionScreen from '../screens/booking/VehicleSelectionScreen';
import ScheduleRideScreen from '../screens/booking/ScheduleRideScreen';
import FareBreakdownScreen from '../screens/booking/FareBreakdownScreen';

// Trip Screens
import TripTrackingScreen from '../screens/trip/TripTrackingScreen';
import TripDetailsScreen from '../screens/trip/TripDetailsScreen';
import RateTripScreen from '../screens/trip/RateTripScreen';
import LostItemScreen from '../screens/trip/LostItemScreen';

// Payment Screens
import PaymentMethodsScreen from '../screens/payment/PaymentMethodsScreen';
import AddCardScreen from '../screens/payment/AddCardScreen';
import TransactionHistoryScreen from '../screens/payment/TransactionHistoryScreen';
import SplitFareScreen from '../screens/payment/SplitFareScreen';

// Account Screens
import EditProfileScreen from '../screens/account/EditProfileScreen';
import EmergencyContactsScreen from '../screens/account/EmergencyContactsScreen';
import FavoriteDriversScreen from '../screens/account/FavoriteDriversScreen';
import PreferencesScreen from '../screens/account/PreferencesScreen';
import KYCScreen from '../screens/account/KYCScreen';

// Safety Screens
import SafetyToolkitScreen from '../screens/safety/SafetyToolkitScreen';
import ShareTripScreen from '../screens/safety/ShareTripScreen';
import RideCheckScreen from '../screens/safety/RideCheckScreen';
import ReportSafetyScreen from '../screens/safety/ReportSafetyScreen';

// Support Screens
import SupportScreen from '../screens/support/SupportScreen';
import TicketsScreen from '../screens/support/TicketsScreen';
import FAQScreen from '../screens/support/FAQScreen';
import ChatSupportScreen from '../screens/support/ChatSupportScreen';

// Rewards Screens
import RewardsScreen from '../screens/rewards/RewardsScreen';
import ReferralScreen from '../screens/rewards/ReferralScreen';
import MembershipScreen from '../screens/rewards/MembershipScreen';

// Settings Screens
import SettingsScreen from '../screens/settings/SettingsScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';
import AccessibilityScreen from '../screens/settings/AccessibilityScreen';
import PrivacyScreen from '../screens/settings/PrivacyScreen';

// Engagement Screens
import RideStatsScreen from '../screens/engagement/RideStatsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Trips"
        component={TripsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
          tabBarLabel: 'Trips',
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
          tabBarLabel: 'Wallet',
        }}
      />
      <Tab.Screen
        name="Offers"
        component={OffersScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="gift" size={size} color={color} />
          ),
          tabBarLabel: 'Offers',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  console.log(user)
  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />

          {/* Booking Screens */}
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="VehicleSelection" component={VehicleSelectionScreen} />
          <Stack.Screen name="ScheduleRide" component={ScheduleRideScreen} />
          <Stack.Screen name="FareBreakdown" component={FareBreakdownScreen} />

          {/* Trip Screens */}
          <Stack.Screen name="TripTracking" component={TripTrackingScreen} />
          <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
          <Stack.Screen name="RateTrip" component={RateTripScreen} />
          <Stack.Screen name="LostItem" component={LostItemScreen} />

          {/* Payment Screens */}
          <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
          <Stack.Screen name="AddCard" component={AddCardScreen} />
          <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
          <Stack.Screen name="SplitFare" component={SplitFareScreen} />

          {/* Account Screens */}
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
          <Stack.Screen name="FavoriteDrivers" component={FavoriteDriversScreen} />
          <Stack.Screen name="Preferences" component={PreferencesScreen} />
          <Stack.Screen name="KYC" component={KYCScreen} />

          {/* Safety Screens */}
          <Stack.Screen name="SafetyToolkit" component={SafetyToolkitScreen} />
          <Stack.Screen name="ShareTrip" component={ShareTripScreen} />
          <Stack.Screen name="RideCheck" component={RideCheckScreen} />
          <Stack.Screen name="ReportSafety" component={ReportSafetyScreen} />

          {/* Support Screens */}
          <Stack.Screen name="Support" component={SupportScreen} />
          <Stack.Screen name="Tickets" component={TicketsScreen} />
          <Stack.Screen name="FAQ" component={FAQScreen} />
          <Stack.Screen name="ChatSupport" component={ChatSupportScreen} />

          {/* Rewards Screens */}
          <Stack.Screen name="Rewards" component={RewardsScreen} />
          <Stack.Screen name="Referral" component={ReferralScreen} />
          <Stack.Screen name="Membership" component={MembershipScreen} />

          {/* Settings Screens */}
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
          <Stack.Screen name="Accessibility" component={AccessibilityScreen} />
          <Stack.Screen name="Privacy" component={PrivacyScreen} />

          {/* Engagement Screens */}
          <Stack.Screen name="RideStats" component={RideStatsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
