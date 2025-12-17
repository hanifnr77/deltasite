import React, { createContext, useContext, useState, useEffect } from 'react';
// Perhatikan: '../services' berubah jadi './services' atau '../services' tergantung posisi
// Karena file ini ada di folder 'context', dan 'services' ada di luar, maka '../services' sudah benar.
import { fetchSettings } from '../services/storageService';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [serverPassword, setServerPassword] = useState<string>(''); 

  useEffect(() => {
    const initAuth = async () => {
      const storedAuth = localStorage.getItem('deltasite_auth');
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      }

      try {
        const settings = await fetchSettings();
        // Cek apakah server benar-benar mengembalikan password
        if (settings && settings.admin_password) {
          setServerPassword(settings.admin_password);
          console.log("Keamanan: Password server aktif.");
        } else {
           console.warn("Keamanan: Server tidak merespon password, akses admin mungkin terkunci.");
        }
      } catch (err) {
        console.error("Gagal load password.", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (inputPassword: string): Promise<boolean> => {
    if (inputPassword === serverPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('deltasite_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('deltasite_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
