import React, { createContext, useContext, useState, useEffect } from 'react';
import { Operator } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  operator: Operator | null;
  isAuthenticated: boolean;
  login: (id: string, pass: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const session = authService.getCurrentSession();
    if (session) {
      setOperator(session);
    }
    setLoading(false);
  }, []);

  const login = async (id: string, pass: string) => {
    const { operator: user } = await authService.login(id, pass);
    setOperator(user);
  };

  const logout = () => {
    authService.logout();
    setOperator(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{
        operator,
        isAuthenticated: !!operator,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
