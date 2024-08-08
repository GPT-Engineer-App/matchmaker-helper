import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Check if user is logged in (e.g., by checking localStorage or a token)
    const token = localStorage.getItem('authToken');
    if (token) {
      // Validate token with backend
      // For now, we'll just set a mock user
      setUser({ id: '1', name: 'John Doe' });
    }
  }, []);

  const login = async (email, password) => {
    // Implement actual login logic here
    // For now, we'll just set a mock user and token
    setUser({ id: '1', name: 'John Doe' });
    localStorage.setItem('authToken', 'mock-token');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const addNotification = (notification) => {
    setNotifications(prev => [...prev, notification]);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, notifications, addNotification }}>
      {children}
    </AuthContext.Provider>
  );
};
