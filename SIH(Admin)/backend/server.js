import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Auth
app.post('/api/auth/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@sih.gov.in' && password === 'admin123') {
    return res.json({
      token: 'mock-jwt-token-12345',
      user: { id: 'admin1', email, name: 'System Admin', role: 'admin' }
    });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
});

// Dashboard Stats
app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    totalCentres: 120,
    activeCentres: 105,
    totalFarmersToday: 3450,
    totalBookings: 4200,
    completedProcurement: 3100,
    pendingProcurement: 1100,
    pendingPayments: 450,
    totalQuantityProcured: 15600.5,
    totalPaymentAmount: 32450000,
  });
});

// Centres
app.get('/api/admin/centres', (req, res) => {
  res.json([
    { id: 'c1', name: 'Pune APMC', location: 'Pune, MH', lat: 18.5204, lng: 73.8567, waiting: 45, processing: 12, completed: 150, averageWaiting: 25, status: 'RED' },
    { id: 'c2', name: 'Nashik Market', location: 'Nashik, MH', lat: 20.0110, lng: 73.7903, waiting: 10, processing: 5, completed: 80, averageWaiting: 10, status: 'GREEN' },
    { id: 'c3', name: 'Nagpur Hub', location: 'Nagpur, MH', lat: 21.1458, lng: 79.0882, waiting: 25, processing: 8, completed: 110, averageWaiting: 18, status: 'YELLOW' },
  ]);
});

// Centre Details
app.get('/api/admin/centres/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    id, name: 'Pune APMC', location: 'Pune, MH', lat: 18.5204, lng: 73.8567,
    waiting: 45, processing: 12, completed: 150, averageWaiting: 25, status: 'RED',
    farmersToday: 210, pendingProcurement: 60, averageProcessingTime: 15,
    totalQuantity: 850.5, totalPayment: 1850000
  });
});

// Analytics
app.get('/api/admin/analytics', (req, res) => {
  res.json({
    dailyProcurement: [
      { date: 'Mon', amount: 400 }, { date: 'Tue', amount: 300 }, { date: 'Wed', amount: 550 },
      { date: 'Thu', amount: 450 }, { date: 'Fri', amount: 700 }, { date: 'Sat', amount: 650 }, { date: 'Sun', amount: 800 }
    ],
    weeklyProcurement: [],
    monthlyProcurement: [],
    farmerCount: [
      { date: 'Mon', count: 120 }, { date: 'Tue', count: 90 }, { date: 'Wed', count: 150 },
      { date: 'Thu', count: 140 }, { date: 'Fri', count: 200 }, { date: 'Sat', count: 180 }, { date: 'Sun', count: 220 }
    ],
    waitingTime: [
      { centre: 'Pune', time: 25 }, { centre: 'Nashik', time: 10 }, { centre: 'Nagpur', time: 18 }
    ],
    processingTime: [
      { centre: 'Pune', time: 15 }, { centre: 'Nashik', time: 12 }, { centre: 'Nagpur', time: 14 }
    ],
    performance: [
      { centre: 'Pune', score: 85 }, { centre: 'Nashik', score: 92 }, { centre: 'Nagpur', score: 88 }
    ]
  });
});

// Farmers
app.get('/api/admin/farmers', (req, res) => {
  res.json([
    { id: 'f1', name: 'Ramesh Patil', phone: '+91 9876543210', status: 'Active', lastVisit: '2023-10-15' },
    { id: 'f2', name: 'Suresh Kumar', phone: '+91 9876543211', status: 'Inactive', lastVisit: '2023-09-20' },
  ]);
});

// Operators
app.get('/api/admin/operators', (req, res) => {
  res.json([
    { id: 'o1', name: 'Amit Singh', centreId: 'c1', centreName: 'Pune APMC', status: 'Active' },
    { id: 'o2', name: 'Priya Sharma', centreId: 'c2', centreName: 'Nashik Market', status: 'Active' },
  ]);
});

let dynamicAlerts = [
  { id: 'a1', type: 'ERROR', message: 'Pune APMC overloaded, waiting time > 25 mins', timestamp: new Date().toISOString(), centreId: 'c1', read: false },
  { id: 'a2', type: 'WARNING', message: 'Payment delays detected at Nagpur Hub', timestamp: new Date().toISOString(), centreId: 'c3', read: false },
];

setInterval(() => {
  const types = ['INFO', 'WARNING', 'ERROR'];
  const messages = ['System sync completed', 'High traffic detected', 'New farmer registered', 'Payment processed successfully', 'Minor delays in processing'];
  
  const newAlert = {
    id: `a${Date.now()}`,
    type: types[Math.floor(Math.random() * types.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    timestamp: new Date().toISOString(),
    centreId: `c${Math.floor(Math.random() * 3) + 1}`,
    read: false
  };
  
  // Keep only the latest 10 alerts
  dynamicAlerts.unshift(newAlert);
  if (dynamicAlerts.length > 10) dynamicAlerts.pop();
}, 10000); // Add a new alert every 10 seconds

// Alerts
app.get('/api/admin/alerts', (req, res) => {
  res.json(dynamicAlerts);
});

app.put('/api/admin/alerts/mark-read', (req, res) => {
  dynamicAlerts.forEach(a => a.read = true);
  res.json({ success: true });
});

app.delete('/api/admin/alerts/:id', (req, res) => {
  const { id } = req.params;
  dynamicAlerts = dynamicAlerts.filter(a => a.id !== id);
  res.json({ success: true });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Backend server is running on http://127.0.0.1:${PORT}`);
});
