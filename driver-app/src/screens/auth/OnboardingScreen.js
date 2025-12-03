import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const OnboardingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>RideOn Driver</Text>
        <Text style={styles.title}>Start Earning Today</Text>
        <Text style={styles.subtitle}>
          Join thousands of drivers earning on their own schedule
        </Text>

        <View style={styles.features}>
          <Text style={styles.feature}>✓ Flexible hours</Text>
          <Text style={styles.feature}>✓ Weekly payouts</Text>
          <Text style={styles.feature}>✓ 24/7 support</Text>
          <Text style={styles.feature}>✓ Bonuses & promotions</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  features: {
    width: '100%',
    paddingHorizontal: 40,
  },
  feature: {
    fontSize: 18,
    color: '#333',
    marginBottom: 12,
  },
  footer: {
    padding: 20,
  },
  button: {
    backgroundColor: '#7C3AED',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginButton: {
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#7C3AED',
    fontSize: 14,
  },
});

export default OnboardingScreen;
