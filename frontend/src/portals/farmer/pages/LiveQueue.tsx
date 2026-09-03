import React, { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { bookingService, queueService } from '../api/apiService';
import type { QueueStatus, Booking } from '../types';
import { Users, Clock, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const LiveQueue: React.FC = () => {
  const { socket, connected } = useSocket();
  const [queue, setQueue] = useState<QueueStatus | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      const currentBooking = await bookingService.getCurrentBooking();
      if (currentBooking && currentBooking.id) {
        setBooking(currentBooking);
        try {
          const q = await queueService.getQueueStatus(currentBooking.id);
          setQueue(q);
        } catch (error) {
          console.error("Failed to fetch queue status");
        }
      }
      setLoading(false);
    };
    fetchQueue();
  }, []);

  useEffect(() => {
    if (socket && queue && booking && connected) {
      // Join the centre room to receive real-time updates
      socket.emit('join_centre', { centre_id: booking.centre.id });

      socket.on('queue:updated', (data: any) => {
        // Refresh queue status by fetching from API to get the latest accurate state
        if (booking.id) {
          queueService.getQueueStatus(booking.id).then(q => {
            if (q) setQueue(q);
          });
        }
      });

      socket.on('queue:arrived', (data: any) => {
        if (data.token_number === booking.token_number) {
          queueService.getQueueStatus(booking.id).then(q => {
            if (q) setQueue(q);
          });
        }
      });

      socket.on('queue:called', (data: any) => {
        if (data.token_number === booking.token_number) {
          setQueue(prev => prev ? { ...prev, status: 'CALLED', people_ahead: 0, estimated_wait_minutes: 0 } : null);
        }
      });

      socket.on('queue:completed', (data: any) => {
        if (data.token_number === booking.token_number) {
          setQueue(prev => prev ? { ...prev, status: 'COMPLETED', people_ahead: 0, estimated_wait_minutes: 0 } : null);
        }
      });
      
      return () => {
        socket.emit('leave_centre', { centre_id: booking.centre.id });
        socket.off('queue:updated');
        socket.off('queue:arrived');
        socket.off('queue:called');
        socket.off('queue:completed');
      };
    }
  }, [socket, queue, booking, connected]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading live queue...</p>
      </div>
    );
  }

  if (!queue || !booking) {
    return (
      <div className="card border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center p-10 text-center mt-4">
        <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
          <Activity size={40} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">No Active Queue</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">You do not have any token currently waiting in the queue.</p>
        <Link to="/farmer/" className="btn btn-primary px-8 shadow-sm">Go to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="pb-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Live Queue</h1>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
          <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></div>
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{connected ? 'Live' : 'Connecting...'}</span>
        </div>
      </div>

      <div className="card text-center mb-6 overflow-hidden shadow-lg border-0 relative" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #166534 100%)', color: 'white' }}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity size={100} />
        </div>
        <div className="relative z-10 p-4">
          <p className="text-xs font-semibold opacity-90 mb-1 uppercase tracking-wider">Your Token Number</p>
          <h2 className="text-5xl font-black mb-6 tracking-tight drop-shadow-md">{booking.token_number}</h2>
          
          <div className="grid grid-cols-2 gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <div className="border-r border-white/20">
              <p className="text-xs font-medium opacity-80 uppercase tracking-wider mb-1">Currently Serving</p>
              <p className="text-2xl font-bold">{queue.current_token || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium opacity-80 uppercase tracking-wider mb-1">Your Status</p>
              <p className="text-lg font-bold mt-1 bg-white/20 inline-block px-3 py-1 rounded-full">{queue.status}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card shadow-md border-0 bg-white hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-orange-50 rounded-full text-orange-500 shadow-inner">
              <Users size={32} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">People Ahead of You</p>
              <p className="text-4xl font-black text-gray-800">{queue.people_ahead}</p>
            </div>
          </div>
        </div>

        <div className="card shadow-md border-0 bg-white hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-full text-blue-500 shadow-inner">
              <Clock size={32} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Estimated Wait Time</p>
              <div className="flex items-baseline gap-1">
                <p className="text-4xl font-black text-gray-800">~{queue.estimated_wait_minutes}</p>
                <span className="text-lg text-gray-500 font-medium">mins</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {queue.people_ahead === 0 && queue.status !== 'PROCUREMENT' && (
        <div className="p-5 bg-green-500 text-white rounded-xl shadow-lg animate-bounce text-center mb-6 border border-green-600">
          <h3 className="font-black text-xl mb-1 tracking-tight">It's Your Turn!</h3>
          <p className="text-sm font-medium opacity-90">Please proceed to the procurement officer immediately.</p>
        </div>
      )}

      {queue.status === 'PROCUREMENT' && (
        <Link to="/farmer/procurement" className="btn w-full flex items-center justify-center gap-2 py-3 shadow-md bg-gray-800 hover:bg-gray-900 text-white transition-colors">
          View Procurement Details <ArrowRight size={18} />
        </Link>
      )}
    </div>
  );
};

export default LiveQueue;
