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
      console.log('Token:', token);
      if (token) {
        const response = await authAPI.getProfile();
        console.log('Profile response:', response.data);
        const userData = response.data.data || response.data;
        setUser(userData);
        await SecureStorageService.setUserData(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      //await SecureStorageService.clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);

      const data = response.data.data || response.data;
      const accessToken = data.token || data.accessToken;
      const refreshToken = data.refreshToken;
      const driver = data.driver || data.user;

      // Store tokens securely
      await SecureStorageService.setTokens(accessToken, refreshToken);
      if (driver?.id) {
        await SecureStorageService.setUserId(driver.id);
      }
      await SecureStorageService.setUserData(driver);
      setUser(driver);

      console.log('✅ LOGIN SUCCESS');
      return { success: true };
    } catch (error) {
      console.error('🔴 LOGIN ERROR:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed'
      };
    }
  };

  const register = async (data) => {
    try {
      const response = await authAPI.register(data);
      const responseData = response.data.data || response.data;
      const accessToken = responseData.token || responseData.accessToken;
      const refreshToken = responseData.refreshToken;
      const driver = responseData.driver || responseData.user;

      // Store tokens securely
      await SecureStorageService.setTokens(accessToken, refreshToken);
      if (driver?.id) {
        await SecureStorageService.setUserId(driver.id);
      }
      await SecureStorageService.setUserData(driver);
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
    await SecureStorageService.clearAll();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
