import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import { useLocation } from "../../contexts/LocationContext";
import { useTrip } from "../../contexts/TripContext";
import { Ionicons,FontAwesome6 } from '@expo/vector-icons';
import { COLORS, VEHICLE_TYPES } from "../../config/constants";
import FreeMap from "../../components/MapViewPlaceholder";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const HomeScreen = ({ navigation }) => {
  const { location } = useLocation();
  const { getEstimate, requestTrip, activeTrip } = useTrip();
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [showVehicles, setShowVehicles] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [fareEstimate, setFareEstimate] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);

  useEffect(() => {
    if (activeTrip) {
      navigation.navigate("TripTracking");
    }
  }, [activeTrip]);

const handleSearch = async () => {
  if (!pickupAddress || !dropoffAddress) {
    Alert.alert("Error", "Please enter both pickup and drop-off locations");
    return;
  }

  // ✅ SAFELY extract coordinates
  const pickup = location?.coords
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }
    : {
        latitude: 37.7749,
        longitude: -122.4194,
      };

  const dropoff = {
    latitude: pickup.latitude + 0.01,
    longitude: pickup.longitude + 0.01,
  };

  setPickupCoords(pickup);
  setDropoffCoords(dropoff);
  setShowVehicles(true);
};


  const handleVehicleSelect = async (vehicle) => {
    setSelectedVehicle(vehicle);

    const result = await getEstimate(pickupCoords, dropoffCoords, vehicle.id);
    if (result.success) {
      setFareEstimate(result.estimate);
    }
  };

  const handleConfirmRide = async () => {
    if (!selectedVehicle || !fareEstimate) {
      Alert.alert("Error", "Please select a vehicle type");
      return;
    }

    const tripData = {
      pickupLocation: pickupCoords,
      dropoffLocation: dropoffCoords,
      pickupAddress,
      dropoffAddress,
      vehicleType: selectedVehicle.id,
      fareEstimate: fareEstimate.total || fareEstimate.fare,
    };

    const result = await requestTrip(tripData);
    if (result.success) {
      setShowVehicles(false);
      Alert.alert("Success", "Finding a driver for you...", [
        { text: "OK", onPress: () => navigation.navigate("TripTracking") },
      ]);
    } else {
      Alert.alert("Error", result.error);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
  style="light"
  backgroundColor={COLORS.primary}
  translucent={false}
      />
<View style={{
  width: "100%",
  backgroundColor: COLORS.primary,
  paddingTop: 10,
  paddingBottom: 10,
}}>
  <Image
    source={require('../../../assets/full-logo.png')}
    style={{ width: 120, height: 40, resizeMode: "contain" }}
  />
</View>
      <View style={{paddingHorizontal:10,paddingVertical:10}}>
             <View style={styles.searchBox}>
       <View style={{backgroundColor:"#fff", height:'100%', justifyContent:"center",alignItems:"center", borderRightWidth:0.6, borderRightColor:COLORS.primary,paddingHorizontal:8}}>
       <Ionicons name="location" size={20} color={COLORS.primary}/>
       </View>
         <TextInput
           style={styles.input}
           placeholder="Pickup location"
           placeholderTextColor={COLORS.gray}
           value={pickupAddress}
           onChangeText={setPickupAddress}
         />
       </View>

       <View style={styles.searchBox}>
       <View style={{backgroundColor:"#fff", height:'100%', justifyContent:"center",alignItems:"center", borderRightWidth:0.6, borderRightColor:COLORS.primary,paddingHorizontal:8}}>
       <FontAwesome6 name="location-crosshairs" size={20} color={COLORS.primary}/>
       </View>
         <TextInput
           style={styles.input}
           placeholder="Where to?"
           placeholderTextColor={COLORS.gray}
           value={dropoffAddress}
           onChangeText={setDropoffAddress}
         />
       </View>

       <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
         <Text style={styles.searchButtonText}>Search Rides</Text>
       </TouchableOpacity>
     </View>
      <View style={styles.container}>
        <FreeMap style={styles.map} />
      </View>
            <Modal visible={showVehicles} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose a ride</Text>
              <TouchableOpacity onPress={() => setShowVehicles(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.vehicleList}>
              {VEHICLE_TYPES.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[
                    styles.vehicleCard,
                    selectedVehicle?.id === vehicle.id &&
                      styles.selectedVehicle,
                  ]}
                  onPress={() => handleVehicleSelect(vehicle)}
                >
                  <Text style={styles.vehicleIcon}>{vehicle.icon}</Text>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleName}>{vehicle.name}</Text>
                    <Text style={styles.vehicleETA}>2 mins away</Text>
                  </View>
                  <View style={styles.fareInfo}>
                    <Text style={styles.fareAmount}>
                      $
                      {fareEstimate && selectedVehicle?.id === vehicle.id
                        ? (
                            fareEstimate.total ||
                            fareEstimate.fare ||
                            vehicle.basePrice * 5
                          ).toFixed(2)
                        : (vehicle.basePrice * 5).toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedVehicle && (
              <View style={styles.fareBreakdown}>
                <Text style={styles.breakdownTitle}>Fare Breakdown</Text>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Base Fare</Text>
                  <Text style={styles.breakdownValue}>
                    ${selectedVehicle.basePrice.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Distance (5 km)</Text>
                  <Text style={styles.breakdownValue}>
                    ${(selectedVehicle.basePrice * 2).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Time (10 mins)</Text>
                  <Text style={styles.breakdownValue}>
                    ${(selectedVehicle.basePrice * 1.5).toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.breakdownRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    $
                    {(
                      fareEstimate?.total ||
                      fareEstimate?.fare ||
                      selectedVehicle.basePrice * 5
                    ).toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.confirmButton,
                !selectedVehicle && styles.disabledButton,
              ]}
              onPress={handleConfirmRide}
              disabled={!selectedVehicle}
            >
              <Text style={styles.confirmButtonText}>Confirm Ride</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
    searchBox: {
    height:44,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    // paddingHorizontal: 16,
    // paddingVertical: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow:"hidden",
    borderWidth: 0.5,
    borderColor: COLORS.primary,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    border:1,
    borderColor:COLORS.primary
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  searchButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.dark,
  },
  closeButton: {
    fontSize: 28,
    color: COLORS.gray,
  },
  vehicleList: {
    paddingHorizontal: 20,
  },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedVehicle: {
    borderColor: COLORS.primary,
    backgroundColor: "#F3E8FF",
  },
  vehicleIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.dark,
    marginBottom: 4,
  },
  vehicleETA: {
    fontSize: 14,
    color: COLORS.gray,
  },
  fareInfo: {
    alignItems: "flex-end",
  },
  fareAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  fareBreakdown: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: COLORS.dark,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  breakdownValue: {
    fontSize: 14,
    color: COLORS.dark,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.dark,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  }
});

export default HomeScreen;