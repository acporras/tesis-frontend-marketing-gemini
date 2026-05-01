import React, { createContext, useState, useEffect } from 'react';
import type { Usuario } from '../types';

interface AuthContextType {
  usuario: Usuario | null;
  cargando: boolean;
  login: (user: Usuario, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Check for stored session on load
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('usuario');

    if (token && storedUser) {
      try {
        setUsuario(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('usuario');
        localStorage.removeItem('access_token');
      }
    }
    setCargando(false);
  }, []);

  const login = (user: Usuario, token: string) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('usuario', JSON.stringify(user));
    setUsuario(user);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
