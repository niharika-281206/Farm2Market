import axios from 'axios';
import type { Farmer, Booking, QueueStatus, Procurement, Payment, Notification } from '../types';

const API_URL = import.meta.env.VITE_FARMER_API_URL || '/api';

// Create an axios instance with auth interceptor
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('farmerToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('farmerToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (data: Partial<Farmer>): Promise<{ access_token: string; role: string }> => {
    const response = await apiClient.post('/auth/farmer/register', data);
    return response.data;
  },
  
  verifyOtp: async (mobile: string, otp: string): Promise<{ access_token: string, is_registered: boolean, role: string, user: any }> => {
    const response = await apiClient.post('/auth/farmer/verify-otp', { mobile, otp });
    return response.data;
  },

  login: async (mobile: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/farmer/send-otp', { mobile });
    return response.data;
  }
};

export const farmerService = {
  getProfile: async (): Promise<Farmer | null> => {
    const response = await apiClient.get('/farmer/profile');
    return response.data;
  },
  updateProfile: async (data: Partial<Farmer>): Promise<Farmer> => {
    const response = await apiClient.put('/farmer/profile', data);
    return response.data;
  }
};

export const bookingService = {
  bookSlot: async (data: { centre_id: number; slot_id: number; crop_id: number; expected_quantity: number }): Promise<Booking> => {
    const response = await apiClient.post('/farmer/bookings', data);
    return response.data;
  },

  getAllBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.get('/farmer/bookings');
    return response.data || [];
  },

  getCurrentBooking: async (): Promise<Booking | null> => {
    const response = await apiClient.get('/farmer/bookings');
    if (response.data && response.data.length > 0) {
      // Return most recent active booking
      const active = response.data.find((b: any) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
      return active || null;
    }
    return null;
  }
};

export const commonService = {
  getCentres: async (): Promise<any[]> => {
    const response = await apiClient.get('/centres');
    return response.data;
  },
  getCrops: async (): Promise<any[]> => {
    const response = await apiClient.get('/crops');
    return response.data;
  },
  getPrivateBuyers: async () => {
    const response = await apiClient.get('/farmer/buyers');
    return response.data;
  },
  getAvailableSlots: async (centreId: string | number): Promise<any[]> => {
    const response = await apiClient.get(`/centres/${centreId}/slots`);
    return response.data;
  }
};

export const queueService = {
  getQueueStatus: async (bookingId: string | number): Promise<QueueStatus> => {
    const response = await apiClient.get(`/farmer/bookings/${bookingId}/queue-status`);
    return response.data;
  }
};

export const procurementService = {
  getProcurementDetails: async (): Promise<Procurement[]> => {
    const response = await apiClient.get('/farmer/procurement');
    return response.data;
  }
};

export const paymentService = {
  getPaymentDetails: async (): Promise<Payment[]> => {
    const response = await apiClient.get('/farmer/payments');
    return response.data;
  }
};

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get('/notifications');
    return response.data;
  }
};

