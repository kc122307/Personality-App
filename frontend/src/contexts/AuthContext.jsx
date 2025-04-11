import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(); // Create Auth Context

export const useAuth = () => useContext(AuthContext); // Hook for using auth

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const { data } = await api.get('/auth/me');
        setUser(data.data);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // ✅ Login Function with Error Handling
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data.user);
    } catch (err) {
      console.error('Login Error:', err.response?.data?.message || err.message);
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  // ✅ Signup Function with Fixed Field Names and Error Handling
  const signup = async (userData) => {
    try {
      const { data } = await api.post('/auth/signup', {
        username: userData.username, // ✅ Ensure correct field name
        email: userData.email,
        password: userData.password,
      });

      localStorage.setItem('token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data.user);
    } catch (err) {
      console.error('Signup Error:', err.response?.data?.message || err.message);
      throw new Error(err.response?.data?.message || 'Signup failed');
    }
  };

  // ✅ Logout Function
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
