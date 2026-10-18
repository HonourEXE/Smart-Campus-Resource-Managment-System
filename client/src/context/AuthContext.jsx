import React, { createContext, useState, useEffect, useContext } from 'react';
import { login, register, getMe, getNotifications } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await getMe();
          if (res.data.success) {
            setUser(res.data.user);
            fetchUnreadCount();
          }
        } catch (error) {
          console.warn('Auth token expired or invalid:', error.message);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const fetchUnreadCount = async () => {
    try {
      const res = await getNotifications();
      if (res.data.success) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch {
      // ignore in background
    }
  };

  const loginUser = async (email, password) => {
    const res = await login({ email, password });
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      fetchUnreadCount();
      return res.data;
    }
  };

  const registerUser = async (formData) => {
    const res = await register(formData);
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      fetchUnreadCount();
      return res.data;
    }
  };

  const quickLogin = async (role) => {
    const roleMap = {
      student: { email: 'student@campus.edu', password: 'password123' },
      faculty: { email: 'faculty@campus.edu', password: 'password123' },
      resource_manager: { email: 'manager@campus.edu', password: 'password123' },
      admin: { email: 'admin@campus.edu', password: 'password123' },
    };

    const creds = roleMap[role];
    if (creds) {
      return await loginUser(creds.email, creds.password);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setUnreadCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        unreadCount,
        loginUser,
        registerUser,
        quickLogin,
        logout,
        refreshUser: fetchUnreadCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
