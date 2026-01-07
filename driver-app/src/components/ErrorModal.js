// src/components/ErrorModal.js
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { COLORS } from '../config/constants';

const { width } = Dimensions.get('window');

const ErrorModal = ({ visible, message, onClose, duration = 3000 }) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset values for the animation
      scaleValue.setValue(0);
      opacityValue.setValue(0);

      // Start the animation
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          speed: 10,
          bounciness: 15,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
      ]).start();

      // Auto-hide after duration
      const timer = setTimeout(() => {
        hideModal();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideModal = () => {
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.container,
          {
            opacity: opacityValue,
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        <View style={styles.content}>
          <Text style={styles.message}>{message}</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: width * 0.85,
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderLeftWidth: 6,
    borderLeftColor: COLORS.danger,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    color: COLORS.dark,
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
    lineHeight: 22,
  },
});

export default ErrorModal;