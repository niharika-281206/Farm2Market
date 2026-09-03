import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { bookingService, queueService, farmerService } from '../api/apiService';
import type { Booking, QueueStatus, Farmer } from '../types';
import { Link } from 'react-router-dom';
import { Clock, Users, ArrowRight, Download } from 'lucide-react';

const MyToken: React.FC = () => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [queue, setQueue] = useState<QueueStatus | null>(null);
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const currentBooking = await bookingService.getCurrentBooking();
      setBooking(currentBooking);
      if (currentBooking) {
        const queueStatus = await queueService.getQueueStatus(currentBooking.tokenNumber);
        setQueue(queueStatus);
        const profile = await farmerService.getProfile();
        setFarmer(profile);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8"><div className="loader"></div></div>;
  }

  if (!booking) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold mb-2">No Active Token</h2>
        <p className="text-muted mb-4">You need to book a slot to get a token.</p>
        <Link to="/book-slot" className="btn btn-primary">Book Slot Now</Link>
      </div>
    );
  }

  const ratePerQtl = 2200;
  const estimatedPrice = booking.quantity * ratePerQtl;

  const qrData = `Token ID: ${booking.tokenNumber}
Farmer: ${farmer?.name || 'Demo Farmer'}
Mobile: ${farmer?.mobile || 'N/A'}
Crop: ${booking.crop}
Quantity: ${booking.quantity} Qtl
Slot Time: ${booking.date} | ${booking.timeSlot}
Centre: ${booking.centre}
Estimated Price: ₹${estimatedPrice.toLocaleString('en-IN')} (@ ₹${ratePerQtl}/Qtl)`;

  const downloadQRCode = async () => {
    const element = document.getElementById('token-card');
    if (element) {
      const btn = document.getElementById('download-btn');
      if (btn) btn.style.display = 'none'; // Hide button before capture

      try {
        const canvas = await html2canvas(element, {
          scale: 2, // Higher resolution
          backgroundColor: '#ffffff',
          logging: false
        });

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `Token_${booking.tokenNumber}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } finally {
        if (btn) btn.style.display = 'flex'; // Restore button
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Token</h1>

      <div id="token-card" className="card text-center mb-4 bg-white">
        <div className="inline-flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
          <QRCodeCanvas id="qr-code" value={qrData} size={256} level="M" />
          <button id="download-btn" onClick={downloadQRCode} className="mt-4 flex items-center justify-center gap-2 text-primary hover:text-primary-dark font-medium cursor-pointer transition-colors px-4 py-2 border border-primary rounded-lg hover:bg-primary-50">
            <Download size={18} /> Download QR
          </button>
        </div>
        
        <h2 className="text-3xl font-bold text-primary mb-1">{booking.tokenNumber}</h2>
        <p className="badge badge-warning mb-4 text-lg">{booking.status}</p>

        <div className="grid grid-cols-2 gap-4 text-left border-t pt-4 border-gray-100">
          <div className="col-span-2">
            <p className="text-sm text-muted">Farmer Details</p>
            <p className="font-semibold text-lg">{farmer?.name || 'Demo Farmer'} <span className="text-sm font-normal text-muted ml-2">({farmer?.mobile || 'N/A'})</span></p>
          </div>
          <div>
            <p className="text-sm text-muted">Crop</p>
            <p className="font-semibold">{booking.crop} ({booking.quantity} Qtl)</p>
          </div>
          <div>
            <p className="text-sm text-muted">Centre</p>
            <p className="font-semibold">{booking.centre}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Date</p>
            <p className="font-semibold">{booking.date}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Time Slot</p>
            <p className="font-semibold">{booking.timeSlot}</p>
          </div>
          <div className="col-span-2 mt-2 pt-3 border-t border-dashed border-gray-200">
            <p className="text-sm text-muted">Estimated Price</p>
            <p className="font-bold text-xl text-primary">₹{estimatedPrice.toLocaleString('en-IN')} <span className="text-sm font-normal text-muted">(@ ₹{ratePerQtl}/Qtl)</span></p>
          </div>
        </div>
      </div>

      {queue && (
        <div className="card bg-gray-50 border border-gray-200">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Clock size={20} className="text-secondary" /> Queue Status
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-3 rounded-md shadow-sm text-center">
              <p className="text-sm text-muted">Currently Serving</p>
              <p className="text-xl font-bold text-gray-800">{queue.currentToken}</p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm text-center">
              <p className="text-sm text-muted">People Ahead</p>
              <p className="text-xl font-bold text-danger flex items-center justify-center gap-1">
                <Users size={18} /> {queue.peopleAhead}
              </p>
            </div>
          </div>
          <div className="bg-white p-3 rounded-md shadow-sm text-center mb-4">
            <p className="text-sm text-muted">Estimated Waiting Time</p>
            <p className="text-lg font-bold text-primary">~ {queue.estimatedWaitMinutes} minutes</p>
          </div>
          
          <Link to="/live-queue" className="btn btn-outline w-full flex items-center justify-center gap-2">
            View Live Queue <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyToken;
