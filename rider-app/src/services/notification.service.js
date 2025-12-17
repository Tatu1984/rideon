/**
 * Push Notification Service
 * Handles push notification registration, handling, and display
 * Using Expo Notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api.service';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Notification types for the app
const NOTIFICATION_TYPES = {
  TRIP_ACCEPTED: 'trip_accepted',
  DRIVER_ARRIVING: 'driver_arriving',
  DRIVER_ARRIVED: 'driver_arrived',
  TRIP_STARTED: 'trip_started',
  TRIP_COMPLETED: 'trip_completed',
  TRIP_CANCELLED: 'trip_cancelled',
  PAYMENT_RECEIVED: 'payment_received',
  PROMO_OFFER: 'promo_offer',
  SYSTEM: 'system',
};

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  /**
   * Initialize the notification service
   * Call this on app startup
   */
  async initialize() {
    try {
      // Register for push notifications
      const token = await this.registerForPushNotifications();

      // Set up notification listeners
      this.setupNotificationListeners();

      return token;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return null;
    }
  }

  /**
   * Register for push notifications and get the token
   */
  async registerForPushNotifications() {
    let token;

    // Check if running on a physical device
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return null;
    }

    // Check and request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission not granted');
      return null;
    }

    // Get the Expo push token
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Replace with your Expo project ID
      });
      token = tokenData.data;
      this.expoPushToken = token;

      // Send token to backend
      await this.sendTokenToServer(token);
    } catch (error) {
      console.error('Failed to get push token:', error);
    }

    // Set up Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7C3AED',
      });

      await Notifications.setNotificationChannelAsync('trips', {
        name: 'Trip Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7C3AED',
        description: 'Notifications about your trips',
      });

      await Notifications.setNotificationChannelAsync('promotions', {
        name: 'Promotions',
        importance: Notifications.AndroidImportance.DEFAULT,
        description: 'Promotional offers and discounts',
      });
    }

    return token;
  }

  /**
   * Send the push token to the server
   */
  async sendTokenToServer(token) {
    try {
      await api.post('/rider/push-token', {
        token,
        platform: Platform.OS,
        deviceId: Device.deviceName || 'unknown',
      });
      console.log('Push token registered with server');
    } catch (error) {
      console.error('Failed to register push token:', error);
    }
  }

  /**
   * Set up notification listeners
   */
  setupNotificationListeners() {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        this.handleForegroundNotification(notification);
      }
    );

    // Listener for when user interacts with a notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        this.handleNotificationResponse(response);
      }
    );
  }

  /**
   * Handle notification received in foreground
   */
  handleForegroundNotification(notification) {
    const { data, title, body } = notification.request.content;
    console.log('Notification received:', { title, body, data });

    // You can emit an event here that components can listen to
    // For example, using EventEmitter or a state management solution
  }

  /**
   * Handle user interaction with notification
   */
  handleNotificationResponse(response) {
    const { data } = response.notification.request.content;
    console.log('Notification tapped:', data);

    // Handle navigation based on notification type
    if (data?.type) {
      this.navigateToScreen(data.type, data);
    }
  }

  /**
   * Navigate to appropriate screen based on notification type
   */
  navigateToScreen(type, data) {
    // This should be connected to your navigation system
    // You can use a navigation ref or event emitter

    switch (type) {
      case NOTIFICATION_TYPES.TRIP_ACCEPTED:
      case NOTIFICATION_TYPES.DRIVER_ARRIVING:
      case NOTIFICATION_TYPES.DRIVER_ARRIVED:
      case NOTIFICATION_TYPES.TRIP_STARTED:
        // Navigate to trip tracking screen
        console.log('Navigate to trip tracking:', data.tripId);
        break;

      case NOTIFICATION_TYPES.TRIP_COMPLETED:
        // Navigate to trip summary/rating screen
        console.log('Navigate to trip summary:', data.tripId);
        break;

      case NOTIFICATION_TYPES.PAYMENT_RECEIVED:
        // Navigate to payment history
        console.log('Navigate to payment history');
        break;

      case NOTIFICATION_TYPES.PROMO_OFFER:
        // Navigate to promotions screen
        console.log('Navigate to promotions');
        break;

      default:
        // Navigate to home or notifications screen
        console.log('Navigate to home');
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(title, body, data = {}, triggerSeconds = 1) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: { seconds: triggerSeconds },
    });
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get the badge count
   */
  async getBadgeCount() {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Set the badge count
   */
  async setBadgeCount(count) {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Clear the badge
   */
  async clearBadge() {
    await Notifications.setBadgeCountAsync(0);
  }

  /**
   * Clean up listeners (call on app unmount)
   */
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled() {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Get the current push token
   */
  getToken() {
    return this.expoPushToken;
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;

// Export types for use in components
export { NOTIFICATION_TYPES };
