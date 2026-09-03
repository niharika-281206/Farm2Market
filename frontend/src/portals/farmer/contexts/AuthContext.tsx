import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Farmer } from '../types';
import { authService, farmerService } from '../api/apiService';
import toast from 'react-hot-toast';

interface AuthContextType {
  farmer: Farmer | null;
  loading: boolean;
  sendOtp: (mobile: string) => Promise<boolean>;
  verifyOtp: (mobile: string, otp: string) => Promise<{ success: boolean; is_registered?: boolean }>;
  register: (data: Partial<Farmer>) => Promise<boolean>;
  logout: () => void;
  updateFarmer: (updatedData: Partial<Farmer>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('farmerToken');
    if (token) {
      try {
        // Simple JWT decode to check role
        const payloadBase64 = token.split('.')[1];
        const payload = JSON.parse(atob(payloadBase64));
        
        if (payload.role === 'UNREGISTERED_FARMER') {
          // Token is valid but user is unregistered. Don't fetch profile, just finish loading.
          setLoading(false);
          return;
        }
      } catch (e) {
        // If parsing fails, proceed normally to let the API handle it
      }

      farmerService.getProfile().then(data => {
        setFarmer(data);
        setLoading(false);
      }).catch((error) => {
        // ALWAYS remove token on error to prevent infinite redirect loops
        // (if backend is down or returns 500, we don't want to get stuck in a redirect loop)
        localStorage.removeItem('farmerToken');
        setFarmer(null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const sendOtp = async (mobile: string) => {
    try {
      await authService.login(mobile);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to send OTP');
      return false;
    }
  };

  const verifyOtp = async (mobile: string, otp: string) => {
    try {
      const res = await authService.verifyOtp(mobile, otp);
      if (res.access_token) {
        localStorage.setItem('farmerToken', res.access_token);
        if (res.is_registered) {
          setFarmer(res.user);
        }
        return { success: true, is_registered: res.is_registered };
      }
      return { success: false };
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'OTP Verification failed');
      return { success: false };
    }
  };

  const register = async (data: Partial<Farmer>) => {
    try {
      const res = await authService.register(data);
      if (res.access_token) {
        localStorage.setItem('farmerToken', res.access_token);
        // fetch full profile
        const profile = await farmerService.getProfile();
        setFarmer(profile);
        toast.success('Registration successful!');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    setFarmer(null);
    localStorage.removeItem('farmerToken');
    toast.success('Logged out successfully');
    window.location.href = '/';
  };

  const updateFarmer = (updatedData: Partial<Farmer>) => {
    if (farmer) {
      setFarmer({ ...farmer, ...updatedData });
    }
  };

  return (
    <AuthContext.Provider value={{ farmer, loading, sendOtp, verifyOtp, register, logout, updateFarmer }}>
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
