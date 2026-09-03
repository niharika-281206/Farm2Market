export interface Farmer {
  id: string;
  farmerId: string;
  name: string;
  mobile: string;
  state: string;
  district: string;
  village: string;
}

export interface Booking {
  id: string;
  farmerId: string;
  crop: string;
  quantity: number;
  centre: string;
  date: string;
  timeSlot: string;
  tokenNumber: string;
  status: 'PENDING' | 'WAITING' | 'PROCUREMENT' | 'PAYMENT' | 'COMPLETED';
}

export interface QueueStatus {
  currentToken: string;
  farmerToken: string;
  peopleAhead: number;
  estimatedWaitMinutes: number;
  status: string;
}

export interface Procurement {
  id: string;
  bookingId: string;
  crop: string;
  bookedQuantity: number;
  actualQuantity: number;
  rate: number;
  totalAmount: number;
  status: 'PENDING' | 'VERIFIED' | 'COMPLETED';
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  transactionId?: string;
  date?: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
  read: boolean;
  timestamp: string;
}
