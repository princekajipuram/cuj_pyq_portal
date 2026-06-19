import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data);
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('[AuthContext] Failed to validate session token', err.message);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Signup action
  const signup = async (name, email, password) => {
    try {
      const res = await api.post('/auth/signup', { name, email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser({
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role
        });
        return { success: true };
      }
    } catch (error) {
      const serverMsg = error.response?.data?.message;
      const validationMsg = error.response?.data?.errors?.[0]?.message;
      return {
        success: false,
        message: serverMsg || validationMsg || 'Registration failed'
      };
    }
  };

  // Login action
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser({
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role
        });
        return { success: true };
      }
    } catch (error) {
      const serverMsg = error.response?.data?.message;
      const validationMsg = error.response?.data?.errors?.[0]?.message;
      return {
        success: false,
        message: serverMsg || validationMsg || 'Invalid credentials'
      };
    }
  };

  // Logout action
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
        isAdmin: user?.role === 'admin' && user?.email?.toLowerCase() === 'admin@cuj.edu'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
