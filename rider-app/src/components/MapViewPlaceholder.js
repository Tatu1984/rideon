import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Placeholder for MapView when using Expo Go
// react-native-maps requires native build and doesn't work in Expo Go
export default function MapViewPlaceholder({ children, style, ...props }) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.placeholder}>
        <Text style={styles.title}>📍 Map View</Text>
        <Text style={styles.subtitle}>
          Map functionality requires a custom development build
        </Text>
        <Text style={styles.info}>
          Using Expo Go - maps are disabled
        </Text>
      </View>
      {children}
    </View>
  );
}

export function Marker({ coordinate, title, description, children }) {
  return (
    <View style={styles.marker}>
      <Text style={styles.markerText}>📍</Text>
      {children}
    </View>
  );
}

export const PROVIDER_GOOGLE = 'google';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxWidth: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  info: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  marker: {
    position: 'absolute',
  },
  markerText: {
    fontSize: 30,
  },
});
