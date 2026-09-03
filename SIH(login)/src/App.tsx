import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookSlot from './pages/BookSlot';
import MyToken from './pages/MyToken';
import LiveQueue from './pages/LiveQueue';
import Procurement from './pages/Procurement';
import Payment from './pages/Payment';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import QRScanner from './pages/QRScanner';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { farmer, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="loader"></div>
      </div>
    );
  }
  
  if (!farmer) return <Navigate to="/login" />;
  return children;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="book-slot" element={<BookSlot />} />
          <Route path="my-token" element={<MyToken />} />
          <Route path="live-queue" element={<LiveQueue />} />
          <Route path="procurement" element={<Procurement />} />
          <Route path="payment" element={<Payment />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="scanner" element={<QRScanner />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
