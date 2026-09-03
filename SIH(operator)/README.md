# Procurement Centre Operator Module - SIH 2026

**Problem Statement**: SIH 26032 — Smart Procurement Centre Queue Management System.  
**Module**: OPERATOR FRONTEND (Procurement Centre Operator Portal).

---

## 1. Folder Structure

```
SIH/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginView.tsx           # Operator Login Screen
│   │   ├── common/
│   │   │   ├── Badge.tsx               # Status & Payment Badges
│   │   │   ├── Header.tsx              # Top Navigation & Quick Controls
│   │   │   ├── Modal.tsx               # Dark Glassmorphic Reusable Modal
│   │   │   ├── Sidebar.tsx            # Operator Portal Sidebar
│   │   │   └── StatCard.tsx           # Dashboard Metric Stat Cards
│   │   ├── dashboard/
│   │   │   └── DashboardView.tsx       # Operator Dashboard
│   │   ├── farmer/
│   │   │   └── FarmerDetailModal.tsx   # Detailed Farmer Information
│   │   ├── notifications/
│   │   │   └── NotificationsDrawer.tsx # Real-time Alerts Drawer
│   │   ├── payment/
│   │   │   └── PaymentModal.tsx        # Payment & DBT Update Form
│   │   ├── procurement/
│   │   │   └── ProcurementModal.tsx    # Procurement Entry & Calculation
│   │   ├── queue/
│   │   │   └── LiveQueueView.tsx       # Live Queue Table & Controls
│   │   ├── reports/
│   │   │   └── ReportsView.tsx         # Centre Reports & Analytics
│   │   └── scanner/
│   │       └── QRScannerModal.tsx      # Browser Camera QR Code Scanner
│   ├── context/
│   │   ├── AuthContext.tsx             # Operator Session Context
│   │   └── QueueContext.tsx            # Live Queue & Metric State Context
│   ├── services/
│   │   ├── apiClient.ts                # HTTP Fetch Client with Mock Switch
│   │   ├── authService.ts              # Operator Auth API Service
│   │   ├── bookingService.ts           # Gate QR Scan & Arrival API Service
│   │   ├── mockData.ts                 # Initial Mock State Dataset
│   │   ├── notificationService.ts      # System Alerts API Service
│   │   ├── paymentService.ts           # Payment Update API Service
│   │   ├── procurementService.ts       # Procurement Formula & Entry Service
│   │   ├── queueService.ts             # Live Queue & Status API Service
│   │   ├── reportService.ts            # Centre Metrics & Reports Service
│   │   └── socketService.ts           # Socket.IO & WebSocket Sync Service
│   ├── types/
│   │   └── index.ts                    # Complete TypeScript Definitions
│   ├── utils/
│   │   └── privacy.ts                  # PII Name & Aadhaar Masking Utils
│   ├── App.tsx                         # Main App Layout Orchestrator
│   ├── index.css                       # Tailwind Directives & Custom Styles
│   └── main.tsx                        # React DOM Entry Point
├── .env.example                        # Environment Variables Configuration
├── .env                                # Active Local Environment Variables
├── index.html                          # Main HTML Container
├── package.json                        # Node Dependencies
├── postcss.config.js                   # PostCSS Tailwind Configuration
├── tailwind.config.js                  # Tailwind Theme Customization
├── tsconfig.json                       # TypeScript Configuration
└── vite.config.ts                      # Vite Build Tool Configuration
```

---

## 2. Screens & Features Completed

1. **Operator Login**:
   - Operator ID & Password validation.
   - Secure token/session storage (`localStorage`).
   - Built-in quick demo credentials filler (`OP-4029`).

2. **Operator Dashboard**:
   - Live metrics cards: Centre Name, Today's total bookings, Farmers arrived, Waiting farmers, Currently processing, Completed procurement, No-show farmers, Average waiting time, Average processing time.
   - Active Processing Bays breakdown.
   - Next Farmers Queue preview.

3. **Live Queue Management**:
   - Statuses supported: `BOOKED`, `ARRIVED`, `WAITING`, `PROCESSING`, `COMPLETED`, `SKIPPED`, `NO_SHOW`.
   - Actions: **Call Next**, **Start Processing**, **Complete Entry**, **Skip**, **Mark No Show**.
   - Privacy protection toggle (masks farmer names & Aadhaar numbers).
   - Search by Token, Farmer Name, Crop, or Aadhaar.

4. **Browser Camera QR Scanner**:
   - Live webcam video scanner integration.
   - Fetches booking details and allows marking farmer as `ARRIVED`.
   - Simulated test QR code preset selector (`TK-1047`, `TK-1048`, `TK-1049`).

5. **Farmer Details**:
   - Complete record modal showing Token, Farmer Name, Aadhaar, Land verification badge, Crop, Booked quantity, Time slot, and gate pass ID.

6. **Procurement Entry**:
   - Entry fields: Actual Quantity/Weight, Quality Grade, Moisture Content, Rate per Quintal.
   - Automated amount calculation formula:  
     $$\text{Total Amount} = \text{Actual Quantity} \times \text{Rate}$$
   - Completes procurement and updates status to `COMPLETED`.

7. **Payment Update**:
   - Entry fields: Payment Amount, Payment Status (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`), Transaction ID/UTR, Payment Date.

8. **Centre Reports**:
   - Metrics summary: Daily Farmers, Completed, Pending, Quantity (Qtl), Payment Amount.
   - Crop-wise procurement breakdown table.
   - Export to CSV & Print Report functionality.

9. **Notifications Alert Drawer**:
   - Real-time alerts for: New Bookings, Queue Delays (>20 min), Moisture Meter Calibration, and Call Next dispatches.

---

## 3. API Requirements

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/operator/login` | Authenticate operator & return JWT token |
| `GET` | `/api/operator/dashboard` | Fetch current centre metric summary |
| `GET` | `/api/operator/queue` | Fetch live token queue list |
| `POST` | `/api/operator/queue/call-next` | Advance next waiting farmer to PROCESSING |
| `PUT` | `/api/operator/queue/:token/status` | Update token status (`PROCESSING`, `SKIPPED`, `NO_SHOW`) |
| `GET` | `/api/operator/booking/:token` | Fetch booking details by QR scanned token |
| `POST` | `/api/operator/booking/:token/arrive` | Mark farmer as `ARRIVED` at gate |
| `POST` | `/api/operator/procurement` | Submit actual weight, MSP rate & complete entry |
| `PUT` | `/api/operator/payment/:id` | Update DBT payment status & UTR ref |
| `GET` | `/api/operator/reports` | Fetch centre daily operational & crop report |
| `GET` | `/api/operator/notifications` | Fetch system alerts |

---

## 4. WebSocket Events Required

Real-time synchronization with Farmer Frontend & LED Token Displays:

### Emitted by Operator:
- `queue:call_next` — Emitted when **CALL NEXT** is triggered. Payload: `{ token, farmerName, slot }`.
- `queue:update` — Emitted whenever any token status changes. Payload: `QueueItem[]`.
- `status:change` — Emitted on individual status change. Payload: `{ token, status }`.
- `procurement:completed` — Emitted on procurement completion. Payload: `QueueItem`.

### Listened to by Operator:
- `queue:update` — Updates live queue list on farmer check-in or booking.
- `notification:new` — Pushes instant alert to operator drawer.
- `metrics:update` — Updates dashboard counters dynamically.

---

## 5. How to Run

### Prerequisites
- Node.js (v18.0.0 or higher) & npm / yarn.

### Installation Steps
```bash
# 1. Navigate to directory
cd c:\Users\gayat\OneDrive\Desktop\SIH

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

The app will launch at `http://localhost:3000`.

---

## 6. Backend Integration Instructions

1. Open `.env` file:
   ```env
   VITE_API_BASE_URL=http://your-backend-api-domain.com
   VITE_WS_URL=http://your-backend-ws-domain.com
   VITE_USE_MOCK_API=false
   ```
2. Setting `VITE_USE_MOCK_API=false` seamlessly routes all API calls to your live backend server endpoints using `apiClient.ts`.
