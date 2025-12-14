import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, View, Text } from 'react-native';
import * as Location from 'expo-location';

export default function MapViewPlaceholder() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Get current location
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  if (errorMsg) {
    console.log(errorMsg);
    return <View style={styles.container}><Text>{errorMsg}</Text></View>;
  }

  if (!location) {
    return <View style={styles.container}><Text>Loading map...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        customMapStyle={[
  {
    "elementType": "geometry",
    "stylers": [{"color": "#ffffff"}]  // White background
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{"visibility": "on"}]  // Make sure roads are visible
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{"color": "#000000"}]  // Black road borders
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{"color": "#f0f0f0"}]  // Light gray road fill
  }
]}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
<Marker coordinate={{
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  }} title="Pickup">
  <View style={styles.markerContainer}>
    <Text style={styles.markerText}>📍</Text>
  </View>
</Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
},
markerText: {
  fontSize: 30,
},
dropoffMarker: {
  // You can add different styling for drop-off if needed
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
}
});