import React, { createContext, useState, useEffect, useContext } from 'react';
import type { User } from '../types';
import { api } from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface AuthContextData {
  user: User | null;
  signed: boolean;
  login(token: string): void;
  logout(): void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storagedToken = localStorage.getItem('@OpenVote:token');

    if (storagedToken) {
      try {
        const decoded = jwtDecode<User>(storagedToken);
        setUser(decoded);
      } catch (err) {
        localStorage.removeItem('@OpenVote:token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('@OpenVote:token', token);
    const decoded = jwtDecode<User>(token);
    setUser(decoded);
  };

  const logout = () => {
    localStorage.removeItem('@OpenVote:token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
