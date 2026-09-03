import axios from 'axios';
import type { Farmer, Booking, QueueStatus, Procurement, Payment, Notification } from '../types';

const API_URL = '/api';

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

export const authService = {
  register: async (data: Partial<Farmer>): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post('/auth/farmer/register', data);
      return response.data;
    } catch {
      return { success: true, message: 'OTP sent (Demo mode)' };
    }
  },
  
  verifyOtp: async (mobile: string, otp: string): Promise<{ success: boolean; farmer: Farmer, token: string }> => {
    // Fallback for demo OTPs
    if (otp === '1234' || otp === '123456') {
      return { 
        success: true, 
        farmer: {
          id: 'demo-1',
          farmerId: 'FARM-1234',
          name: 'Demo Farmer',
          mobile,
          state: 'Andhra Pradesh',
          district: 'Guntur',
          village: 'Tenali'
        }, 
        token: 'demo-jwt-token' 
      };
    }
    const response = await apiClient.post('/auth/farmer/verify-otp', { mobile, otp });
    return response.data;
  },

  login: async (mobile: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post('/auth/farmer/login', { mobile });
      return response.data;
    } catch {
      return { success: true, message: 'OTP sent (Demo mode)' };
    }
  }
};

export const farmerService = {
  getProfile: async (): Promise<Farmer | null> => {
    try {
      const response = await apiClient.get('/farmer/profile');
      return response.data;
    } catch {
      return null;
    }
  },
  updateProfile: async (data: Partial<Farmer>): Promise<Farmer> => {
    const response = await apiClient.put('/farmer/profile', data);
    return response.data;
  }
};

let mockCurrentBooking: Booking | null = null;

export const bookingService = {
  getAvailableSlots: async (centre: string, date: string): Promise<{time: string, available: number}[]> => {
    try {
      const response = await apiClient.get('/slots', { params: { centre, date } });
      return response.data;
    } catch {
      // Demo Fallback
      return [
        { time: '09:00 AM - 10:00 AM', available: 5 },
        { time: '10:00 AM - 11:00 AM', available: 8 },
        { time: '11:00 AM - 12:00 PM', available: 12 },
        { time: '02:00 PM - 03:00 PM', available: 0 },
        { time: '03:00 PM - 04:00 PM', available: 4 },
      ];
    }
  },
  
  bookSlot: async (data: Partial<Booking>): Promise<Booking> => {
    try {
      const response = await apiClient.post('/bookings', data);
      mockCurrentBooking = response.data;
      return response.data;
    } catch {
      // Demo Fallback
      mockCurrentBooking = {
        id: 'mock-b1',
        farmerId: 'demo-1',
        crop: data.crop || 'Paddy',
        quantity: data.quantity || 10,
        centre: data.centre || 'Centre 1',
        date: data.date || '2026-09-01',
        timeSlot: data.timeSlot || '10:00 AM - 11:00 AM',
        tokenNumber: 'PDC-' + Math.floor(1000 + Math.random() * 9000),
        status: 'WAITING'
      } as Booking;
      return mockCurrentBooking;
    }
  },

  getCurrentBooking: async (): Promise<Booking | null> => {
    try {
      const response = await apiClient.get('/farmer/dashboard'); // Assuming dashboard returns current booking
      return response.data.currentBooking || null;
    } catch {
      return mockCurrentBooking;
    }
  }
};

export const queueService = {
  getQueueStatus: async (tokenNumber: string): Promise<QueueStatus> => {
    try {
      const response = await apiClient.get(`/queue/${tokenNumber}`);
      return response.data;
    } catch {
      return {
        currentToken: 'PDC-1018',
        farmerToken: tokenNumber,
        peopleAhead: 6,
        estimatedWaitMinutes: 35,
        status: 'WAITING'
      };
    }
  }
};

export const procurementService = {
  getProcurementDetails: async (): Promise<Procurement | null> => {
    try {
      const response = await apiClient.get('/procurement');
      return response.data;
    } catch {
      if (!mockCurrentBooking) return null;
      return {
        id: 'mock-pr1',
        bookingId: mockCurrentBooking.id,
        crop: mockCurrentBooking.crop,
        bookedQuantity: mockCurrentBooking.quantity,
        actualQuantity: mockCurrentBooking.quantity + 0.5,
        rate: 2200,
        totalAmount: (mockCurrentBooking.quantity + 0.5) * 2200,
        status: 'VERIFIED'
      };
    }
  }
};

export const paymentService = {
  getPaymentDetails: async (): Promise<Payment | null> => {
    try {
      const response = await apiClient.get('/payments');
      return response.data;
    } catch {
      if (!mockCurrentBooking) return null;
      return {
        id: 'mock-pay1',
        bookingId: mockCurrentBooking.id,
        amount: (mockCurrentBooking.quantity + 0.5) * 2200,
        status: 'PROCESSING',
        transactionId: 'TXN' + Math.floor(Math.random() * 1000000),
        date: new Date().toISOString()
      };
    }
  }
};

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await apiClient.get('/notifications');
      return response.data;
    } catch {
      return [];
    }
  }
};
