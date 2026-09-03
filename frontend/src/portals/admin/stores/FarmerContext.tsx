import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

interface FarmerProfile {
  id: number;
  name: string;
  farmer_id: string;
  village: string;
  district: string;
  state: string;
}

interface FarmerContextType {
  profile: FarmerProfile | null;
  fetchProfile: () => Promise<void>;
  loading: boolean;
}

const FarmerContext = createContext<FarmerContextType | undefined>(undefined);

export const FarmerProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/farmer/profile');
      setProfile(res.data);
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <FarmerContext.Provider value={{ profile, fetchProfile, loading }}>
      {children}
    </FarmerContext.Provider>
  );
};

export const useFarmer = () => {
  const context = useContext(FarmerContext);
  if (!context) throw new Error('useFarmer must be used within FarmerProvider');
  return context;
};
