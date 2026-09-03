import axios from 'axios';
import type { Farmer, Booking, QueueStatus, Procurement, Payment, Notification } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create an axios instance (can be used when backend is ready)
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Delay helper to simulate network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data Storage (in-memory for the mock layer)
let currentFarmer: Farmer | null = null;
let currentBooking: Booking | null = null;

const mockNotifications: Notification[] = [
  { id: '1', message: 'Welcome to the Farmer Portal!', type: 'INFO', read: false, timestamp: new Date().toISOString() }
];

export const authService = {
  register: async (_data: Partial<Farmer>): Promise<{ success: boolean; message: string }> => {
    await delay(1000);
    // Simulate successful registration and OTP request
    return { success: true, message: 'OTP sent to mobile number' };
  },
  
  verifyOtp: async (mobile: string, _otp: string): Promise<{ success: boolean; farmer: Farmer, token: string }> => {
    await delay(1000);
    const newFarmer: Farmer = {
      id: 'f1',
      farmerId: 'FARM-' + Math.floor(Math.random() * 10000),
      name: 'Ramesh Kumar',
      mobile,
      state: 'Andhra Pradesh',
      district: 'Guntur',
      village: 'Tenali'
    };
    currentFarmer = newFarmer;
    return { success: true, farmer: newFarmer, token: 'mock-jwt-token' };
  },

  login: async (_mobile: string): Promise<{ success: boolean; message: string }> => {
    await delay(1000);
    return { success: true, message: 'OTP sent' };
  }
};

export const farmerService = {
  getProfile: async (): Promise<Farmer | null> => {
    await delay(500);
    return currentFarmer;
  },
  updateProfile: async (data: Partial<Farmer>): Promise<Farmer> => {
    await delay(1000);
    if (currentFarmer) {
      currentFarmer = { ...currentFarmer, ...data };
    }
    return currentFarmer!;
  }
};

export const bookingService = {
  getAvailableSlots: async (_centre: string, _date: string) => {
    await delay(500);
    return [
      { time: '09:00 AM - 10:00 AM', available: 5 },
      { time: '10:00 AM - 11:00 AM', available: 8 },
      { time: '11:00 AM - 12:00 PM', available: 12 },
      { time: '02:00 PM - 03:00 PM', available: 0 },
      { time: '03:00 PM - 04:00 PM', available: 4 },
    ];
  },
  
  bookSlot: async (data: Partial<Booking>): Promise<Booking> => {
    await delay(1500);
    const newBooking: Booking = {
      id: 'b1',
      farmerId: currentFarmer?.id || 'f1',
      crop: data.crop || 'Paddy',
      quantity: data.quantity || 10,
      centre: data.centre || 'Centre 1',
      date: data.date || '2026-09-01',
      timeSlot: data.timeSlot || '10:00 AM - 11:00 AM',
      tokenNumber: 'PDC-' + Math.floor(1000 + Math.random() * 9000),
      status: 'WAITING'
    };
    currentBooking = newBooking;
    return newBooking;
  },

  getCurrentBooking: async (): Promise<Booking | null> => {
    await delay(500);
    return currentBooking;
  }
};

export const queueService = {
  getQueueStatus: async (tokenNumber: string): Promise<QueueStatus> => {
    await delay(500);
    return {
      currentToken: 'PDC-1018',
      farmerToken: tokenNumber,
      peopleAhead: 6,
      estimatedWaitMinutes: 35,
      status: 'WAITING'
    };
  }
};

export const procurementService = {
  getProcurementDetails: async (): Promise<Procurement | null> => {
    await delay(500);
    if (!currentBooking) return null;
    return {
      id: 'pr1',
      bookingId: currentBooking.id,
      crop: currentBooking.crop,
      bookedQuantity: currentBooking.quantity,
      actualQuantity: currentBooking.quantity + 0.5, // slightly different for reality
      rate: 2200,
      totalAmount: (currentBooking.quantity + 0.5) * 2200,
      status: 'VERIFIED'
    };
  }
};

export const paymentService = {
  getPaymentDetails: async (): Promise<Payment | null> => {
    await delay(500);
    if (!currentBooking) return null;
    return {
      id: 'pay1',
      bookingId: currentBooking.id,
      amount: (currentBooking.quantity + 0.5) * 2200,
      status: 'PROCESSING',
      transactionId: 'TXN' + Math.floor(Math.random() * 1000000),
      date: new Date().toISOString()
    };
  }
};

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    await delay(300);
    return mockNotifications;
  }
};
