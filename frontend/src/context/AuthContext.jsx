import { createContext, useContext, useMemo, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const saveSession = (payload) => {
    localStorage.setItem('token', payload.token);
    localStorage.setItem('user', JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  };

  const login = async (form) => {
    const { data } = await api.post('/auth/login', form);
    saveSession(data);
  };

  const signup = async (form) => {
    const { data } = await api.post('/auth/signup', form);
    saveSession(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, login, signup, logout }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
