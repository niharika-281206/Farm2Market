import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Ticket, Activity, IndianRupee, Bell, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { bookingService, queueService } from '../api/apiService';
import type { Booking, QueueStatus } from '../types';

const Dashboard: React.FC = () => {
  const { farmer } = useAuth();
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const booking = await bookingService.getCurrentBooking();
      setCurrentBooking(booking);
      if (booking) {
        const queue = await queueService.getQueueStatus(booking.tokenNumber);
        setQueueStatus(queue);
      }
    };
    fetchData();
  }, []);

  const quickActions = [
    { title: 'Book Slot', path: '/book-slot', icon: <CalendarClock size={24} />, color: 'var(--color-primary)' },
    { title: 'My Token', path: '/my-token', icon: <Ticket size={24} />, color: 'var(--color-secondary)' },
    { title: 'Live Queue', path: '/live-queue', icon: <Activity size={24} />, color: 'var(--color-info)' },
    { title: 'Procurement', path: '/procurement', icon: <CalendarClock size={24} />, color: 'var(--color-success)' },
    { title: 'Payment', path: '/payment', icon: <IndianRupee size={24} />, color: 'var(--color-warning)' },
    { title: 'Alerts', path: '/notifications', icon: <Bell size={24} />, color: 'var(--color-danger)' },
    { title: 'Profile', path: '/profile', icon: <UserIcon size={24} />, color: 'var(--color-text-secondary)' },
  ];

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl">Welcome, <span className="font-bold text-primary">{farmer?.name}</span> 👋</h1>
        <p className="text-sm text-muted">{farmer?.village}, {farmer?.district}</p>
      </div>

      {currentBooking ? (
        <div className="card mb-4" style={{ background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary-dark) 100%)', color: 'white' }}>
          <h2 className="text-lg font-semibold mb-2">Current Booking Overview</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">Token Number</p>
              <p className="text-2xl font-bold">{currentBooking.tokenNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Status</p>
              <p className="font-bold badge bg-white text-primary mt-1">{currentBooking.status}</p>
            </div>
          </div>
          
          <hr className="my-2" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
          
          <div className="flex justify-between text-sm">
            <div>
              <p className="opacity-90">Date & Time</p>
              <p className="font-semibold">{currentBooking.date} • {currentBooking.timeSlot}</p>
            </div>
            <div className="text-right">
              <p className="opacity-90">Centre</p>
              <p className="font-semibold">{currentBooking.centre}</p>
            </div>
          </div>

          {queueStatus && currentBooking.status === 'WAITING' && (
            <div className="mt-3 p-2 bg-white bg-opacity-20 rounded-md flex justify-between items-center text-sm">
              <div>People Ahead: <strong>{queueStatus.peopleAhead}</strong></div>
              <div>Est. Wait: <strong>{queueStatus.estimatedWaitMinutes} min</strong></div>
            </div>
          )}
        </div>
      ) : (
        <div className="card mb-4 bg-gray-50 border border-gray-200">
          <div className="text-center py-4">
            <CalendarClock size={40} className="mx-auto text-muted mb-2" />
            <h3 className="font-semibold text-lg text-gray-700">No Active Booking</h3>
            <p className="text-sm text-muted mb-4">Book a slot to sell your crop at the nearest centre.</p>
            <Link to="/book-slot" className="btn btn-primary btn-sm inline-flex">Book a Slot Now</Link>
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
        {quickActions.map((action, idx) => (
          <Link key={idx} to={action.path} className="card text-center" style={{ padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ color: action.color }}>{action.icon}</div>
            <span className="text-sm font-semibold text-gray-700">{action.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
