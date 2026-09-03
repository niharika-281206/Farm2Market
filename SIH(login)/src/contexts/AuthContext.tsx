import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Farmer } from '../types';
import { authService, farmerService } from '../api/apiService';
import toast from 'react-hot-toast';

interface AuthContextType {
  farmer: Farmer | null;
  loading: boolean;
  login: (mobile: string, otp: string) => Promise<boolean>;
  logout: () => void;
  register: (mobile: string, otp: string) => Promise<boolean>;
  updateFarmer: (updatedData: Partial<Farmer>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if logged in on mount
    const token = localStorage.getItem('farmerToken');
    if (token) {
      farmerService.getProfile().then(data => {
        setFarmer(data);
        setLoading(false);
      }).catch(() => {
        localStorage.removeItem('farmerToken');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (mobile: string, otp: string) => {
    try {
      const res = await authService.verifyOtp(mobile, otp);
      if (res.success) {
        setFarmer(res.farmer);
        localStorage.setItem('farmerToken', res.token);
        toast.success('Login successful!');
        return true;
      }
      return false;
    } catch (error) {
      toast.error('Login failed');
      return false;
    }
  };

  const register = async (mobile: string, otp: string) => {
    return login(mobile, otp); // using same mock verify flow for simplicity
  };

  const logout = () => {
    setFarmer(null);
    localStorage.removeItem('farmerToken');
    toast.success('Logged out successfully');
  };

  const updateFarmer = (updatedData: Partial<Farmer>) => {
    if (farmer) {
      setFarmer({ ...farmer, ...updatedData });
    }
  };

  return (
    <AuthContext.Provider value={{ farmer, loading, login, logout, register, updateFarmer }}>
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
