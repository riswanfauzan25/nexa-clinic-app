import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nexa_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('nexa_token');
      const savedUser = localStorage.getItem('nexa_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        try {
          // Verifikasi keaslian token ke server
          const response = await api.get('/me');
          if (response.success) {
            setUser(response.data);
            localStorage.setItem('nexa_user', JSON.stringify(response.data));
          }
        } catch (err) {
          console.error('Session expired:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/login', { username, password });
      if (response.success) {
        const { token: jwtToken, user: userData } = response.data;
        setToken(jwtToken);
        setUser(userData);
        localStorage.setItem('nexa_token', jwtToken);
        localStorage.setItem('nexa_user', JSON.stringify(userData));
        return { success: true, user: userData, message: response.message };
      }
      return { success: false, message: response.message || 'Login gagal' };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Terjadi kesalahan saat login'
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setUser(null);
      setToken('');
      localStorage.removeItem('nexa_token');
      localStorage.removeItem('nexa_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
