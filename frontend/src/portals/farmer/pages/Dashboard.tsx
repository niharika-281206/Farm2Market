import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Ticket, Activity, IndianRupee, MapPin, ArrowRight, Clock, Users, PackageOpen, Info, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { bookingService, queueService, paymentService, commonService, procurementService } from '../api/apiService';
import type { Booking, QueueStatus, Payment, Procurement } from '../types';

const Dashboard: React.FC = () => {
  const { farmer } = useAuth();
  const { socket, connected } = useSocket();
  
  // Data State
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [procurements, setProcurements] = useState<Procurement[]>([]);
  const [centres, setCentres] = useState<any[]>([]);

  // Loading States
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          bookingData, 
          bookingsData, 
          paymentsData, 
          procurementsData, 
          centresData
        ] = await Promise.all([
          bookingService.getCurrentBooking().catch(() => null),
          bookingService.getAllBookings().catch(() => []),
          paymentService.getPaymentDetails().catch(() => []),
          procurementService.getProcurementDetails().catch(() => []),
          commonService.getCentres().catch(() => [])
        ]);

        setCurrentBooking(bookingData);
        setAllBookings(bookingsData);
        setPayments(paymentsData);
        setProcurements(procurementsData);
        setCentres(centresData);

        if (bookingData?.id) {
          const qStatus = await queueService.getQueueStatus(bookingData.id).catch(() => null);
          setQueueStatus(qStatus);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoadingInitial(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Socket Listener for Live Queue
  useEffect(() => {
    if (socket && queueStatus && currentBooking && connected) {
      const centreId = currentBooking.centre.id;
      socket.emit('join_centre', { centre_id: centreId });

      socket.on('queue:updated', () => {
        queueService.getQueueStatus(currentBooking.id).then(q => {
          if (q) setQueueStatus(q);
        });
      });

      socket.on('queue:arrived', (data: any) => {
        if (data.token_number === currentBooking.token_number) {
          queueService.getQueueStatus(currentBooking.id).then(q => {
            if (q) setQueueStatus(q);
          });
          setCurrentBooking(prev => prev ? { ...prev, status: 'WAITING' } : null);
        }
      });

      socket.on('queue:called', (data: any) => {
        if (data.token_number === currentBooking.token_number) {
          setQueueStatus(prev => prev ? { ...prev, status: 'CALLED', people_ahead: 0, estimated_wait_minutes: 0 } : null);
          setCurrentBooking(prev => prev ? { ...prev, status: 'CALLED' } : null);
        }
      });

      socket.on('queue:completed', (data: any) => {
        if (data.token_number === currentBooking.token_number) {
          setQueueStatus(prev => prev ? { ...prev, status: 'COMPLETED', people_ahead: 0, estimated_wait_minutes: 0 } : null);
          setCurrentBooking(prev => prev ? { ...prev, status: 'COMPLETED' } : null);
        }
      });
      
      return () => {
        socket.emit('leave_centre', { centre_id: centreId });
        socket.off('queue:updated');
        socket.off('queue:arrived');
        socket.off('queue:called');
        socket.off('queue:completed');
      };
    }
  }, [socket, queueStatus?.status, currentBooking?.id, connected]);

  // Computed Values
  const totalEarned = payments.filter(p => p.status === 'COMPLETED').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = payments.filter(p => p.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0);

  // Synthesize Activity Timeline (Combine bookings, procurements, payments)
  const activityLog = [...allBookings.map(b => ({ type: 'booking', date: new Date(b.created_at), title: 'Slot booked', token: b.token_number, status: b.status })),
    ...procurements.map(p => ({ type: 'procurement', date: new Date(p.created_at), title: 'Procurement processed', token: p.booking?.token_number, status: 'COMPLETED' }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);


  if (loadingInitial) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-xl w-full max-w-2xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-200 rounded-xl"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8 animate-fade-in max-w-7xl mx-auto space-y-6">
      
      {/* 1. Welcome Section */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight mb-1">
            Good Morning, <span className="text-primary">{farmer?.name?.split(' ')[0]} 👋</span>
          </h1>
          <p className="text-gray-500 font-medium">
            Farmer ID: {farmer?.farmer_id || 'Pending'} {farmer?.village ? `• ${farmer.village}` : ''} {farmer?.district ? `• ${farmer.district}` : ''}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Link to="/farmer/book-slot" className="btn btn-primary px-6 shadow-sm">+ Book Slot</Link>
          <Link to="/farmer/my-token" className="btn btn-outline bg-gray-50 px-6 shadow-sm">🎟 My Token</Link>
        </div>
      </section>

      {/* 2. Statistics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Ticket size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Active Booking</p>
            <p className="text-xl font-black text-gray-800">{currentBooking ? currentBooking.token_number : 'None'}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Queue Position</p>
            <p className="text-xl font-black text-gray-800">{queueStatus ? `${queueStatus.people_ahead} Ahead` : 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Est. Waiting</p>
            <p className="text-xl font-black text-gray-800">{queueStatus ? `~${queueStatus.estimated_wait_minutes} min` : 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Earned</p>
            <p className="text-xl font-black text-gray-800">₹{totalEarned.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </section>

      {/* 3. Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Booking & Live Queue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
            {/* Active Booking Info */}
            <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Booking</h2>
                {currentBooking && (
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${currentBooking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : currentBooking.status === 'WAITING' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                    {currentBooking.status}
                  </span>
                )}
              </div>
              
              {currentBooking ? (
                <>
                  <p className="text-3xl font-black text-gray-800 tracking-tight mb-6">{currentBooking.token_number}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Centre</p>
                      <p className="text-sm font-semibold text-gray-800">{currentBooking.centre?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Crop</p>
                      <p className="text-sm font-semibold text-gray-800">{currentBooking.crop?.name || 'N/A'} ({currentBooking.expected_quantity} Qtl)</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Date</p>
                      <p className="text-sm font-semibold text-gray-800">{currentBooking.slot?.date ? new Date(currentBooking.slot.date).toLocaleDateString() : new Date(currentBooking.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Time</p>
                      <p className="text-sm font-semibold text-gray-800">{currentBooking.slot?.start_time || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <Link to="/farmer/my-token" className="text-sm font-semibold text-primary hover:text-primary-dark flex items-center gap-1">
                    View full token details <ArrowRight size={16} />
                  </Link>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-3">
                    <CalendarClock size={24} />
                  </div>
                  <p className="text-sm text-gray-500 mb-4">You don't have a procurement slot booked yet.</p>
                  <Link to="/farmer/book-slot" className="btn btn-primary text-sm shadow-sm py-2 px-6">Book a Slot</Link>
                </div>
              )}
            </div>

            {/* Live Queue Mini Panel */}
            <div className="p-6 flex-1 flex flex-col justify-center text-center relative overflow-hidden" style={currentBooking ? {background: 'linear-gradient(135deg, var(--color-primary) 0%, #166534 100%)'} : {}}>
              {currentBooking ? (
                <>
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={100} /></div>
                  <h2 className="text-xs font-bold text-white/80 uppercase tracking-wider mb-6 relative z-10">Live Queue Status</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                      <p className="text-xs font-medium text-white/80 uppercase mb-1">Currently Serving</p>
                      <p className="text-xl font-bold text-white">{queueStatus?.current_token || 'N/A'}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                      <p className="text-xs font-medium text-white/80 uppercase mb-1">People Ahead</p>
                      <p className="text-xl font-bold text-white">{queueStatus?.people_ahead ?? 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="relative z-10 bg-white/20 rounded-full py-2 px-4 backdrop-blur-sm border border-white/20 inline-flex mx-auto items-center gap-2">
                    <Clock size={16} className="text-white" />
                    <span className="text-sm font-semibold text-white">Wait: ~{queueStatus?.estimated_wait_minutes ?? 0} min</span>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <Activity size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-400">Live Queue inactive</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-800 tracking-tight">Recent Bookings</h2>
              <Link to="/farmer/my-token" className="text-sm font-semibold text-primary hover:text-primary-dark">View All</Link>
            </div>
            
            <div className="overflow-x-auto">
              {allBookings.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-100">
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Token</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Crop</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Centre</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allBookings.slice(0, 4).map((b, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-bold text-gray-800 text-sm">{b.token_number}</td>
                        <td className="p-4 text-gray-600 text-sm font-medium">{b.crop?.name} <span className="text-gray-400 font-normal">({b.expected_quantity} Qtl)</span></td>
                        <td className="p-4 text-gray-600 text-sm">{b.centre?.name}</td>
                        <td className="p-4 text-gray-600 text-sm">{b.slot?.date ? new Date(b.slot.date).toLocaleDateString() : new Date(b.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-md ${b.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500 text-sm">No bookings found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Narrower) */}
        <div className="space-y-6">
          
          {/* Payment Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-800 tracking-tight">Payment Summary</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-end pb-4 border-b border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Procurement Value</p>
                  <p className="text-2xl font-black text-gray-800">₹{(totalEarned + totalPending).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Paid</span>
                <span className="text-sm font-bold text-gray-800">₹{totalEarned.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-400"></div> Pending</span>
                <span className="text-sm font-bold text-gray-800">₹{totalPending.toLocaleString('en-IN')}</span>
              </div>
              
              <Link to="/farmer/payment" className="btn w-full flex items-center justify-center gap-2 mt-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200">
                View Transactions
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-800 tracking-tight">Recent Activity</h2>
            </div>
            <div className="p-5">
              {activityLog.length > 0 ? (
                <div className="space-y-5 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                  {activityLog.map((act, i) => (
                    <div key={i} className="relative flex items-start gap-4">
                      <div className={`mt-1 w-2.5 h-2.5 rounded-full ring-4 ring-white z-10 ${act.type === 'procurement' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                          {act.type === 'procurement' ? <CheckCircle2 size={16} className="text-green-600"/> : <CalendarClock size={16} className="text-blue-600"/>}
                          {act.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{act.date.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • {act.token}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500 py-4">No recent activity.</p>
              )}
            </div>
          </div>

          {/* Nearby Centres */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-800 tracking-tight">Nearby Centres</h2>
              <MapPin size={18} className="text-gray-400" />
            </div>
            <div className="p-0">
              {centres.slice(0, 3).map((c, i) => (
                <div key={i} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.district}, {c.state}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {c.status}
                  </span>
                </div>
              ))}
              <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                <Link to="/farmer/nearby-centres" className="text-xs font-bold text-primary hover:text-primary-dark">View All Centres</Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
