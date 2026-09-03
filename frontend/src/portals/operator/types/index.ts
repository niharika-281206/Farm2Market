// Queue Item Status
export type QueueStatus = 
  | 'BOOKED'
  | 'ARRIVED'
  | 'WAITING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'SKIPPED'
  | 'NO_SHOW';

// Payment Status
export type PaymentStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

// Operator Profile
export type Operator = {
  id: string;
  name: string;
  centreId: string;
  centreName: string;
  centreCode: string;
  email: string;
  role: 'OPERATOR' | 'SUPERVISOR';
  token?: string;
};

// Farmer & Queue Booking Item
export type QueueItem = {
  token: string;                  // e.g. TK-1042
  farmerId: string;               // e.g. FRM-98421
  farmerName: string;             // e.g. Ramesh Kumar
  farmerPhone: string;            // e.g. +91 9876543210
  aadhaarLast4: string;           // e.g. 4812
  crop: string;                   // e.g. Wheat (Kanak), Paddy, Mustard
  variety?: string;               // e.g. HD-2967
  bookedQuantity: number;         // in Quintals
  bookingTime: string;            // ISO timestamp or HH:MM AM/PM
  slot: string;                   // e.g. 09:00 AM - 10:00 AM
  queuePosition: number;
  status: QueueStatus;
  arrivedTime?: string;
  processingStartTime?: string;
  procurementCompletedTime?: string;
  gatePassId?: string;
  actualQuantity?: number;
  ratePerQuintal?: number;
  totalAmount?: number;
  qualityGrade?: 'A' | 'B' | 'C' | 'Grade-1';
  moistureContent?: number;       // % percentage
  refractionPercentage?: number;
  paymentStatus?: PaymentStatus;
  transactionId?: string;
  paymentDate?: string;
  remarks?: string;
};

// Procurement Entry Payload
export type ProcurementEntryPayload = {
  token: string;
  actualQuantity: number;         // in quintals
  qualityGrade: string;
  moistureContent?: number;
  ratePerQuintal: number;         // Rate in ₹
  totalAmount: number;            // Auto-calculated
  remarks?: string;
};

// Payment Update Payload
export type PaymentUpdatePayload = {
  paymentId?: string;
  token: string;
  paymentAmount: number;
  paymentStatus: PaymentStatus;
  transactionId: string;
  paymentDate: string;
  remarks?: string;
};

// Centre Dashboard Metrics
export type DashboardMetrics = {
  centreName: string;
  centreCode: string;
  todayTotalBookings: number;
  farmersArrived: number;
  waitingFarmers: number;
  currentlyProcessing: number;
  completedProcurement: number;
  noShowFarmers: number;
  avgWaitingTimeMinutes: number;
  avgProcessingTimeMinutes: number;
  totalProcurementQuantityQuintals: number;
  totalDisbursedAmountRs: number;
};

// Centre Detailed Report
export type CentreReport = {
  date: string;
  dailyFarmersCount: number;
  completedProcurementCount: number;
  pendingProcurementCount: number;
  skippedCount: number;
  noShowCount: number;
  avgWaitingTime: number;
  avgProcessingTime: number;
  totalQuantityQuintals: number;
  totalPaymentAmount: number;
  cropWiseBreakdown: Array<{
    crop: string;
    totalFarmers: number;
    quantityQuintals: number;
    amountRs: number;
  }>;
};

// Notification Alert Item
export type NotificationItem = {
  id: string;
  type: 'NEW_BOOKING' | 'QUEUE_DELAY' | 'EQUIPMENT_ISSUE' | 'FARMER_TURN' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  meta?: Record<string, unknown>;
};

// WebSocket Event Payloads
export type WSEvents = {
  'queue:update': (queue: QueueItem[]) => void;
  'queue:call_next': (token: QueueItem) => void;
  'status:change': (data: { token: string; status: QueueStatus }) => void;
  'notification:new': (notification: NotificationItem) => void;
  'metrics:update': (metrics: Partial<DashboardMetrics>) => void;
};
