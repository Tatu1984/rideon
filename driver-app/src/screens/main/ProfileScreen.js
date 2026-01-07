import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useDriver } from '../../contexts/DriverContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { isOnline, goOffline } = useDriver();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            if (isOnline) {
              await goOffline();
            }
            await logout();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const profileSections = [
    {
      title: 'Account',
      items: [
        { label: 'Documents', icon: '📄', onPress: () => navigation.navigate('Documents') },
        { label: 'Vehicle Information', icon: '🚗', onPress: () => navigation.navigate('Vehicle') },
        { label: 'Bank Details', icon: '💳', onPress: () => navigation.navigate('BankDetails') },
        { label: 'Performance & Compliance', icon: '📊', onPress: () => navigation.navigate('Performance') },
      ],
    },
    {
      title: 'Earnings',
      items: [
        { label: 'Wallet', icon: '💰', onPress: () => navigation.navigate('Wallet') },
        { label: 'Incentives & Offers', icon: '🎁', onPress: () => navigation.navigate('Incentives') },
        { label: 'Payout History', icon: '📜', onPress: () => navigation.navigate('PayoutHistory') },
        { label: 'Referral Program', icon: '👥', onPress: () => navigation.navigate('Referral') },
      ],
    },
    {
      title: 'Safety & Support',
      items: [
        { label: 'Safety Toolkit', icon: '🛡️', onPress: () => navigation.navigate('SafetyToolkit') },
        { label: 'Report Incident', icon: '⚠️', onPress: () => navigation.navigate('IncidentReport') },
        { label: 'Support Center', icon: '💬', onPress: () => navigation.navigate('Support') },
        { label: 'FAQs', icon: '❓', onPress: () => navigation.navigate('FAQ') },
      ],
    },
    {
      title: 'Settings',
      items: [
        { label: 'App Settings', icon: '⚙️', onPress: () => navigation.navigate('Settings') },
        { label: 'Privacy', icon: '🔒', onPress: () => navigation.navigate('Settings') },
        { label: 'Language', icon: '🌐', onPress: () => navigation.navigate('Settings') },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.profilePicture ? (
            <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'D'}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.userName}>{user?.name || 'Driver Name'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'driver@example.com'}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingIcon}>⭐</Text>
          <Text style={styles.ratingText}>{user?.rating?.toFixed(1) || '5.0'}</Text>
          <Text style={styles.ratingCount}>({user?.totalRatings || 0} ratings)</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{user?.totalTrips || 0}</Text>
          <Text style={styles.statLabel}>Total Trips</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{user?.completionRate || 100}%</Text>
          <Text style={styles.statLabel}>Completion</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{user?.yearsOfService || 0}y</Text>
          <Text style={styles.statLabel}>Experience</Text>
        </View>
      </View>

      {profileSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionContent}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuItemIcon}>{item.icon}</Text>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                </View>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Details</Text>
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleRow}>
            <Text style={styles.vehicleLabel}>Make & Model</Text>
            <Text style={styles.vehicleValue}>
              {user?.vehicle?.make || 'N/A'} {user?.vehicle?.model || ''}
            </Text>
          </View>
          <View style={styles.vehicleRow}>
            <Text style={styles.vehicleLabel}>License Plate</Text>
            <Text style={styles.vehicleValue}>{user?.vehicle?.licensePlate || 'N/A'}</Text>
          </View>
          <View style={styles.vehicleRow}>
            <Text style={styles.vehicleLabel}>Color</Text>
            <Text style={styles.vehicleValue}>{user?.vehicle?.color || 'N/A'}</Text>
          </View>
          <View style={styles.vehicleRow}>
            <Text style={styles.vehicleLabel}>Year</Text>
            <Text style={styles.vehicleValue}>{user?.vehicle?.year || 'N/A'}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#160832',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#160832',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#E9D5FF',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ratingIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 4,
  },
  ratingCount: {
    fontSize: 14,
    color: '#E9D5FF',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#160832',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuItemLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  menuItemArrow: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  vehicleLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  vehicleValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    margin: 16,
    marginTop: 8,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
