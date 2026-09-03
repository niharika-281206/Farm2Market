export interface Farmer {
  id: number;
  farmer_id: string;
  name: string;
  mobile: string;
  email?: string;
  village: string;
  mandal?: string;
  district: string;
  state: string;
  pincode?: string;
  land_area?: number;
  primary_crops?: string;
  other_crops?: string;
  preferred_centre_id?: number;
}

export interface Crop {
  id: number;
  name: string;
  rate: number;
  active: boolean;
}

export interface Slot {
  id: number;
  centre_id: number;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  status: string;
}

export interface Centre {
  id: number;
  name: string;
  address: string;
  village: string;
  district: string;
  state: string;
  daily_capacity: number;
  active: boolean;
}

export interface Booking {
  id: number;
  token_number: string;
  expected_quantity: number;
  status: string;
  qr_reference: string;
  created_at: string;
  farmer: Farmer;
  centre: Centre;
  slot: Slot;
  crop: Crop;
}

export interface QueueStatus {
  queue_position: number;
  people_ahead: number;
  estimated_wait_minutes: number;
  status: string;
  current_token?: string;
}

export interface Procurement {
  id: number;
  booking_id: number;
  expected_quantity: number;
  actual_quantity?: number;
  rate: number;
  total_amount?: number;
  status: string;
}

export interface Payment {
  id: number;
  amount: number;
  status: string;
  transaction_id?: string;
  paid_at?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

