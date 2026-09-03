import React, { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { bookingService, queueService } from '../api/apiService';
import type { QueueStatus } from '../types';
import { Users, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const LiveQueue: React.FC = () => {
  const { socket, connected } = useSocket();
  const [queue, setQueue] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      const booking = await bookingService.getCurrentBooking();
      if (booking) {
        const q = await queueService.getQueueStatus(booking.tokenNumber);
        setQueue(q);
      }
      setLoading(false);
    };
    fetchQueue();
  }, []);

  useEffect(() => {
    if (socket && queue) {
      // Listen for socket events
      socket.on('queue:updated', (data: QueueStatus) => {
        if (data.farmerToken === queue.farmerToken) {
          setQueue(data);
        }
      });
      
      return () => {
        socket.off('queue:updated');
      };
    }
  }, [socket, queue]);

  if (loading) {
    return <div className="flex justify-center p-8"><div className="loader"></div></div>;
  }

  if (!queue) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold mb-2">No Active Queue</h2>
        <p className="text-muted">You do not have any token currently waiting in the queue.</p>
        <Link to="/" className="btn btn-primary mt-4">Go to Dashboard</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Live Queue</h1>
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-success' : 'bg-warning'}`} style={{ backgroundColor: connected ? 'var(--color-success)' : 'var(--color-warning)' }}></div>
          <span className="text-muted">{connected ? 'Live' : 'Connecting...'}</span>
        </div>
      </div>

      <div className="card text-center mb-6" style={{ background: 'var(--color-primary)', color: 'white' }}>
        <p className="text-sm opacity-90 mb-1">Your Token Number</p>
        <h2 className="text-4xl font-bold mb-4">{queue.farmerToken}</h2>
        
        <div className="grid grid-cols-2 gap-4 bg-white bg-opacity-20 p-4 rounded-lg">
          <div>
            <p className="text-sm opacity-90">Currently Serving</p>
            <p className="text-xl font-bold">{queue.currentToken}</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Your Status</p>
            <p className="text-xl font-bold">{queue.status}</p>
          </div>
        </div>
      </div>

      <div className="card mb-4 border-l-4" style={{ borderLeftColor: 'var(--color-secondary)' }}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-secondary bg-opacity-10 rounded-full text-secondary">
            <Users size={32} color="var(--color-secondary)" />
          </div>
          <div>
            <p className="text-sm text-muted font-semibold uppercase tracking-wider">People Ahead of You</p>
            <p className="text-3xl font-bold text-gray-800">{queue.peopleAhead}</p>
          </div>
        </div>
      </div>

      <div className="card mb-6 border-l-4" style={{ borderLeftColor: 'var(--color-info)' }}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            <Clock size={32} color="var(--color-info)" />
          </div>
          <div>
            <p className="text-sm text-muted font-semibold uppercase tracking-wider">Estimated Wait Time</p>
            <p className="text-3xl font-bold text-gray-800">~{queue.estimatedWaitMinutes} <span className="text-lg text-muted font-normal">mins</span></p>
          </div>
        </div>
      </div>
      
      {queue.peopleAhead === 0 && queue.status !== 'PROCUREMENT' && (
        <div className="p-4 bg-success text-white rounded-lg animate-fade-in text-center mb-4" style={{ backgroundColor: 'var(--color-success)' }}>
          <h3 className="font-bold text-lg mb-1">It's Your Turn!</h3>
          <p className="text-sm opacity-90">Please proceed to the procurement officer immediately.</p>
        </div>
      )}

      {queue.status === 'PROCUREMENT' && (
        <Link to="/procurement" className="btn btn-primary w-full flex items-center justify-center gap-2">
          View Procurement Details <ArrowRight size={18} />
        </Link>
      )}
    </div>
  );
};

export default LiveQueue;
