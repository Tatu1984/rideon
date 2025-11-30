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
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await AsyncStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔵 LOGIN ATTEMPT:', email);
      const response = await authAPI.login(email, password);
      console.log('🟢 LOGIN RESPONSE:', JSON.stringify(response.data, null, 2));

      const { token, driver } = response.data.data;
      console.log('🟢 TOKEN:', token);
      console.log('🟢 DRIVER:', JSON.stringify(driver, null, 2));

      await AsyncStorage.setItem('token', token);
      setUser(driver);

      console.log('✅ LOGIN SUCCESS');
      return { success: true };
    } catch (error) {
      console.error('🔴 LOGIN ERROR:', error);
      console.error('🔴 ERROR RESPONSE:', error.response?.data);
      console.error('🔴 ERROR MESSAGE:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed'
      };
    }
  };

  const register = async (data) => {
    try {
      const response = await authAPI.register(data);
      const { token, driver } = response.data.data;

      await AsyncStorage.setItem('token', token);
      setUser(driver);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
