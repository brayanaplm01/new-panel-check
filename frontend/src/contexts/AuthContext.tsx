"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Cambiado a false inicialmente
  const [mounted, setMounted] = useState(false);

  // Verificar si el componente está montado (evita problemas de SSR)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Verificar si hay una sesión guardada al cargar (solo en el cliente)
  useEffect(() => {
    if (!mounted) return;
    
    const checkAuth = () => {
      try {
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('auth_user');
          const storedToken = localStorage.getItem('auth_token');
          
          if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
        }
      }
    };

    checkAuth();
  }, [mounted]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulamos una llamada a la API
      const response = await new Promise<{ success: boolean; user?: User; token?: string }>((resolve) => {
        setTimeout(() => {
          // Credenciales de demo - en producción esto vendría del backend
          if (email === 'admin@checkmedia.com' && password === 'admin123') {
            resolve({
              success: true,
              user: {
                id: '1',
                email: 'admin@checkmedia.com',
                name: 'Administrador',
                role: 'admin'
              },
              token: 'demo_token_' + Date.now()
            });
          } else if (email === 'usuario@checkmedia.com' && password === 'user123') {
            resolve({
              success: true,
              user: {
                id: '2',
                email: 'usuario@checkmedia.com',
                name: 'Usuario',
                role: 'user'
              },
              token: 'demo_token_' + Date.now()
            });
          } else {
            resolve({ success: false });
          }
        }, 1000); // Simular delay de red
      });

      if (response.success && response.user && response.token) {
        setUser(response.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_user', JSON.stringify(response.user));
          localStorage.setItem('auth_token', response.token);
        }
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
    }
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};