import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

export const requestPermissions = async () => {
  try {
    // Request location permissions
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus === 'granted') {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      console.log('Location permissions:', { foregroundStatus, backgroundStatus });
    }

    // Request notification permissions
    const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
    console.log('Notification permission:', notificationStatus);

    return {
      location: foregroundStatus === 'granted',
      background: true,
      notifications: notificationStatus === 'granted'
    };
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return { location: false, background: false, notifications: false };
  }
};
