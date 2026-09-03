# Smart Procurement Centre

A Smart Farmer Procurement, Slot Booking & Real-Time Queue Management System for the Smart India Hackathon 2026.

## Overview
This platform solves the problem of long wait times and physical overcrowding at procurement centres by offering a centralized system with real-time queue management, slot booking, and analytics.

## Features
- **Farmer Portal**: OTP login, Slot Booking, Live Queue Tracking, Procurement & Payment Status.
- **Operator Portal**: QR Scanning, Live Queue Management, Procurement Entry.
- **Admin Portal**: Analytics, Centre Monitoring, Reports.

## Technology Stack
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Zustand, Axios
- **Backend**: Python, FastAPI, WebSockets
- **Database**: PostgreSQL (using SQLite for local fallback), SQLAlchemy, Alembic
- **Caching/Queue**: Redis (ready for production)

## Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL (if running in production)

---

## Setup Instructions

### 1. Database Setup (PostgreSQL)
Ensure PostgreSQL is running on port 5432.
```sql
CREATE DATABASE smart_procurement;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE smart_procurement TO postgres;
```

### 2. Backend Setup
**Windows**
```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

**Linux/macOS**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Environment Variables
In the `backend` folder, duplicate `.env.example` as `.env`.
To use PostgreSQL, set:
`DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smart_procurement`
*(For local testing without Postgres, the current `.env` uses SQLite: `sqlite:///./sih.db`)*

### 4. Database Migration & Seeding
```powershell
alembic upgrade head
python app/database/seed.py
```

### 5. Start Backend Server
```powershell
uvicorn app.main:app --reload
```
API Documentation available at: `http://localhost:8000/docs`

### 6. Frontend Setup & Run
**Windows/Linux/macOS**
```powershell
cd frontend
npm install
npm run dev
```

---

## Demo Credentials

**Admin**
- Email: `admin@demo.com`
- Password: `password123`

**Operator**
- Operator ID: `OP-101`
- Password: `password123`

Farmer accounts must be created through the farmer registration endpoint. OTPs are generated dynamically for the mobile number entered on the login form; they are never hardcoded or returned to the frontend.

### SMSLocal configuration

Keep `SMS_PROVIDER=mock` for local development. For real SMS delivery, set `SMS_PROVIDER=smslocal` in `backend/.env` and fill in `SMSLOCAL_API_KEY`, `SMSLOCAL_SENDER_ID`, and `SMSLOCAL_TEMPLATE_ID` using your approved SMSLocal/DLT values. The API key stays on the backend.

---

## Production Deployment

1. **Backend**: Use `gunicorn` with Uvicorn workers.
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```
2. **Frontend**: Build the static assets.
```bash
npm run build
```
Serve the `dist` folder using Nginx.
