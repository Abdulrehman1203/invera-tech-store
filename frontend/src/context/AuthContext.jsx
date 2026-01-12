import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser({ isAuthenticated: true });
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (loginValue, password) => {
    try {
      const response = await apiClient.post('/token/', {
        login: loginValue,
        password,
      });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      const userData = response.data.user || { isAuthenticated: true };
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.detail ||
          error.response?.data?.non_field_errors?.[0] ||
          'Invalid credentials',
      };
    }
  }, []);

  const register = useCallback(async (formData) => {
    try {
      await apiClient.post('/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
      });
      return { success: true };
    } catch (error) {
      const errorData = error.response?.data;
      let errorMessage = 'Registration failed';

      if (errorData) {
        if (errorData.username) {
          errorMessage = errorData.username[0];
        } else if (errorData.email) {
          errorMessage = errorData.email[0];
        } else if (errorData.password) {
          errorMessage = errorData.password[0];
        } else if (errorData.confirm_password) {
          errorMessage = errorData.confirm_password[0];
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      }

      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
