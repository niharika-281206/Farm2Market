import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { bookingService, queueService, farmerService } from '../api/apiService';
import type { Booking, QueueStatus, Farmer } from '../types';
import { Link } from 'react-router-dom';
import { Clock, Users, ArrowRight, Download, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';

const MyToken: React.FC = () => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [queue, setQueue] = useState<QueueStatus | null>(null);
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentBooking = await bookingService.getCurrentBooking();
        setBooking(currentBooking);
        if (currentBooking && currentBooking.id) {
          const queueStatus = await queueService.getQueueStatus(currentBooking.id);
          setQueue(queueStatus);
          const profile = await farmerService.getProfile();
          setFarmer(profile);
        }
      } catch (error) {
        toast.error("Failed to load token details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Generating your token...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="card border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center p-10 text-center mt-4">
        <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
          <Ticket size={40} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">No Active Token</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">You don't have any upcoming slot bookings. Schedule a slot to sell your crop at MSP.</p>
        <Link to="/farmer/book-slot" className="btn btn-primary px-8 shadow-sm">Book Slot Now</Link>
      </div>
    );
  }

  const ratePerQtl = booking.crop?.rate || 2200; // Use actual crop rate if available
  const estimatedPrice = (booking.expected_quantity || 0) * ratePerQtl;
  
  const tokenDate = booking.slot?.date ? new Date(booking.slot.date).toLocaleDateString() : new Date(booking.created_at).toLocaleDateString();

  const qrData = `Token ID: ${booking.token_number}
Farmer: ${farmer?.name || 'Demo Farmer'}
Mobile: ${farmer?.mobile || 'N/A'}
Crop: ${booking.crop?.name || 'N/A'}
Quantity: ${booking.expected_quantity} Qtl
Slot Time: ${tokenDate} | ${booking.slot?.start_time || 'N/A'}
Centre: ${booking.centre?.name || 'N/A'}
Estimated Price: ₹${estimatedPrice.toLocaleString('en-IN')} (@ ₹${ratePerQtl}/Qtl)`;

  const downloadQRCode = async () => {
    const element = document.getElementById('token-card');
    if (element) {
      const btn = document.getElementById('download-btn');
      if (btn) btn.style.display = 'none';

      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false
        });

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `Token_${booking.token_number}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } finally {
        if (btn) btn.style.display = 'flex';
      }
    }
  };

  return (
    <div className="pb-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 tracking-tight">My Token</h1>

      <div id="token-card" className="card text-center mb-6 bg-white shadow-lg border-0 ring-1 ring-gray-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
        
        <div className="flex flex-col items-center pt-8 pb-4">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 inline-block">
            <QRCodeCanvas id="qr-code" value={qrData} size={180} level="M" />
            <button id="download-btn" onClick={downloadQRCode} className="mt-4 flex items-center justify-center gap-2 text-primary hover:text-primary-dark font-semibold text-sm cursor-pointer transition-colors px-4 py-2 border border-primary/20 rounded-lg hover:bg-primary/5 w-full">
              <Download size={16} /> Save QR Code
            </button>
          </div>
          
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Token Number</p>
          <h2 className="text-4xl font-black text-gray-800 mb-2 tracking-tight">{booking.token_number}</h2>
          <div className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : booking.status === 'WAITING' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
            {booking.status}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-left border-t border-dashed border-gray-200 bg-gray-50/50 p-6">
          <div className="col-span-2">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Farmer Details</p>
            <p className="font-bold text-gray-800 text-lg">{farmer?.name || 'Demo Farmer'} <span className="text-sm font-medium text-gray-500 ml-2">({farmer?.mobile || 'N/A'})</span></p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Crop</p>
            <p className="font-semibold text-gray-800">{booking.crop?.name || 'N/A'} <span className="text-gray-500 text-sm font-normal">({booking.expected_quantity} Qtl)</span></p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Centre</p>
            <p className="font-semibold text-gray-800">{booking.centre?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Date</p>
            <p className="font-semibold text-gray-800">{tokenDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Time Slot</p>
            <p className="font-semibold text-gray-800">{booking.slot?.start_time || 'N/A'}</p>
          </div>
          <div className="col-span-2 mt-2 pt-4 border-t border-gray-200 bg-white p-4 rounded-xl shadow-sm border">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Estimated Price</p>
            <div className="flex items-baseline gap-2">
              <p className="font-black text-2xl text-primary">₹{estimatedPrice.toLocaleString('en-IN')}</p>
              <span className="text-sm font-medium text-gray-400">(@ ₹{ratePerQtl}/Qtl)</span>
            </div>
          </div>
        </div>
      </div>

      {queue && (
        <div className="card bg-white shadow-md border border-gray-100 p-0 overflow-hidden mb-4">
          <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Clock size={20} className="text-orange-500" /> Live Queue Status
            </h3>
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
          </div>
          
          <div className="p-5">
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Currently Serving</p>
                <p className="text-2xl font-black text-gray-800">{queue.current_token || 'N/A'}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl text-center border border-orange-100">
                <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">People Ahead</p>
                <p className="text-2xl font-black text-orange-600 flex items-center justify-center gap-1.5">
                  <Users size={20} /> {queue.people_ahead}
                </p>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl text-center mb-5 border border-blue-100">
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Estimated Wait Time</p>
              <p className="text-xl font-bold text-blue-700">~ {queue.estimated_wait_minutes} minutes</p>
            </div>
            {booking.status === 'WAITING' || booking.status === 'ARRIVED' ? (
              <Link to="/farmer/live-queue" className="btn w-full flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-900 text-white shadow-md transition-colors">
                <Activity size={18} /> View Live Queue Status <ArrowRight size={18} />
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyToken;
