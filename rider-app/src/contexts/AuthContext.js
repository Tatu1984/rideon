import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api.service';
import SecureStorageService from '../services/secureStorage.service';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStorageService.getAccessToken();
      if (token) {
        const response = await authAPI.getProfile();
        const userData = response.data.data || response.data;
        setUser(userData);
        // Cache user data for offline access
        await SecureStorageService.setUserData(userData);
      }
    } catch (error) {
      // Clear tokens on auth failure
      await SecureStorageService.clearTokens();
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
      const accessToken = data.accessToken || data.token;
      const refreshToken = data.refreshToken;
      const userData = data.user || data.rider;

      // Store tokens securely
      await SecureStorageService.setTokens(accessToken, refreshToken);
      if (userData?.id) {
        await SecureStorageService.setUserId(userData.id);
      }
      await SecureStorageService.setUserData(userData);
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
      const accessToken = responseData.accessToken || responseData.token;
      const refreshToken = responseData.refreshToken;
      const userData = responseData.user || responseData.rider;

      // Store tokens securely
      await SecureStorageService.setTokens(accessToken, refreshToken);
      if (userData?.id) {
        await SecureStorageService.setUserId(userData.id);
      }
      await SecureStorageService.setUserData(userData);
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
    await SecureStorageService.clearAll();
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
