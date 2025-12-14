import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api.service';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await authAPI.getProfile();
        setUser(response.data.data || response.data);
      }
    } catch (error) {
      //console.error('Auth check failed:', error);
      await AsyncStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔵 Rider Login:', email);
      const response = await authAPI.login(email, password);
      console.log('🟢 Response:', response.data);

      // Handle both response formats
      const data = response.data.data || response.data;
      const token = data.accessToken || data.token;
      const userData = data.user || data.rider;

      await AsyncStorage.setItem('token', token);
      setUser(userData);

      console.log('✅ Login successful');
      return { success: true };
    } catch (error) {
      console.error('🔴 Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  };

  const register = async (data) => {
    try {
      console.log('🔵 Rider Register:', data);
      const response = await authAPI.register(data);
      console.log('🟢 Response:', response.data);

      const responseData = response.data.data || response.data;
      const token = responseData.accessToken || responseData.token;
      const userData = responseData.user || responseData.rider;

      await AsyncStorage.setItem('token', token);
      setUser(userData);

      console.log('✅ Registration successful');
      return { success: true };
    } catch (error) {
      console.error('🔴 Registration error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      const userData = response.data.data || response.data;
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Update failed',
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
