import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

export default function FreeMap() {
  const [loc, setLoc] = useState(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const position = await Location.getCurrentPositionAsync({});
      setLoc(position.coords);

      const geo = await Location.reverseGeocodeAsync({
        latitude: position?.coords?.latitude || 37.7749,
        longitude: position?.coords?.longitude || -122.4194,
      });

      if (geo.length > 0) {
        const place = geo[0];
        setAddress(
          `${place.name || ""} ${place.street || ""}, ${
            place.city || place.region || ""
          }`
        );
      }
    })();
  }, []);

  // 🔑 IMPORTANT: return early BEFORE html is created
  if (!loc) return null;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .marker-wrapper { display: flex; flex-direction: column; align-items: center; }
    .marker-label {
      background: white;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 13px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      margin-bottom: 4px;
      white-space: nowrap;
    }
    .marker-pin { font-size: 28px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map').setView([${loc?.latitude ||37.7749}, ${loc?.longitude || -122.4194}], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    L.marker([${loc?.latitude || 37.7749}, ${loc?.longitude || -122.4194}], {
      icon: L.divIcon({
        html: \`
          <div class="marker-wrapper">
            <div class="marker-label">${address.toUpperCase()}</div>
            <div class="marker-pin">📍</div>
          </div>
        \`,
        className: '',
        iconAnchor: [16, 40]
      })
    }).addTo(map);
  </script>
</body>
</html>
`;

  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html }}
      javaScriptEnabled
      style={{ flex: 1 }}
    />
  );
}

