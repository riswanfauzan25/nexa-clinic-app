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

  /**
   * Helper mengecek Granular Permission user (Pengecekan berbasis view, create, edit, delete)
   */
  const hasPermission = (module, action = 'view') => {
    if (!user) return false;
    
    // Administrator selalu punya akses penuh ke seluruh modul & aksi
    if (user.role === 'Administrator') return true;

    // Jika user memiliki kustomisasi permissions di database
    if (user.permissions && typeof user.permissions === 'object' && user.permissions[module]) {
      return Array.isArray(user.permissions[module]) && user.permissions[module].includes(action);
    }

    // Default permissions berdasarkan Role (jika belum di-kustom)
    const roleDefaults = {
      Dokter: {
        dashboard: ['view'],
        patients: ['view'],
        registrations: ['view'],
        queues: ['view', 'call', 'edit'],
        'medical-records': ['view', 'create', 'edit']
      },
      'Petugas Pendaftaran': {
        dashboard: ['view'],
        patients: ['view', 'create', 'edit', 'delete'],
        registrations: ['view', 'create', 'edit', 'delete'],
        queues: ['view', 'call', 'edit']
      }
    };

    const rolePerms = roleDefaults[user.role];
    if (rolePerms && rolePerms[module]) {
      return rolePerms[module].includes(action);
    }

    return false;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasPermission }}>
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
