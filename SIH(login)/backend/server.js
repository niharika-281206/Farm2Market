const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Allow CORS for the frontend
app.use(cors({
  origin: '*'
}));

app.use(express.json());

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

// Mock API Routes
app.post('/api/auth/farmer/register', (req, res) => {
  res.json({ success: true, message: 'OTP sent (Demo mode - Backend Connected)' });
});

app.post('/api/auth/farmer/login', (req, res) => {
  res.json({ success: true, message: 'OTP sent (Demo mode - Backend Connected)' });
});

app.post('/api/auth/farmer/verify-otp', (req, res) => {
  res.json({
    success: true, 
    farmer: {
      id: 'demo-1',
      farmerId: 'FARM-1234',
      name: 'Demo Farmer (Connected)',
      mobile: req.body.mobile,
      state: 'Andhra Pradesh',
      district: 'Guntur',
      village: 'Tenali'
    }, 
    token: 'demo-jwt-token' 
  });
});

let farmerProfile = {
  id: 'demo-1',
  farmerId: 'FARM-1234',
  name: 'Demo Farmer (Connected)',
  mobile: '9876543210',
  state: 'Andhra Pradesh',
  district: 'Guntur',
  village: 'Tenali'
};

app.get('/api/farmer/profile', (req, res) => {
  res.json(farmerProfile);
});

app.put('/api/farmer/profile', (req, res) => {
  farmerProfile = { ...farmerProfile, ...req.body };
  res.json(farmerProfile);
});

app.get('/api/slots', (req, res) => {
  res.json([
    { time: '09:00 AM - 10:00 AM', available: 5 },
    { time: '10:00 AM - 11:00 AM', available: 8 },
    { time: '11:00 AM - 12:00 PM', available: 12 },
    { time: '02:00 PM - 03:00 PM', available: 0 },
    { time: '03:00 PM - 04:00 PM', available: 4 },
  ]);
});

app.post('/api/bookings', (req, res) => {
  res.json({
    id: 'mock-b1',
    farmerId: 'demo-1',
    crop: req.body.crop || 'Paddy',
    quantity: req.body.quantity || 10,
    centre: req.body.centre || 'Centre 1',
    date: req.body.date || '2026-09-01',
    timeSlot: req.body.timeSlot || '10:00 AM - 11:00 AM',
    tokenNumber: 'PDC-' + Math.floor(1000 + Math.random() * 9000),
    status: 'WAITING'
  });
});

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('A user connected via WebSocket:', socket.id);
  
  // Send a welcome notification
  setTimeout(() => {
    socket.emit('notification:new', { message: 'Successfully connected to backend server!' });
  }, 2000);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Handle all other API routes gracefully
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found in mock backend' });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
