import React, { useEffect, useState } from 'react';
import { procurementService, bookingService } from '../api/apiService';
import type { Procurement, Booking } from '../types';
import { Scale, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProcurementPage: React.FC = () => {
  const [procurement, setProcurement] = useState<Procurement | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const currentBooking = await bookingService.getCurrentBooking();
      setBooking(currentBooking);
      if (currentBooking) {
        const details = await procurementService.getProcurementDetails();
        setProcurement(details);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8"><div className="loader"></div></div>;
  }

  if (!procurement || !booking) {
    return (
      <div className="text-center p-8">
        <Scale size={48} className="mx-auto text-muted mb-4" />
        <h2 className="text-xl font-bold mb-2">No Procurement Record</h2>
        <p className="text-muted mb-4">Your procurement process has not started yet.</p>
        <Link to="/" className="btn btn-primary">Go to Dashboard</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Procurement Details</h1>

      <div className="card mb-4 border-t-4" style={{ borderTopColor: 'var(--color-success)' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <FileText size={20} className="text-success" /> Quality & Weighing
          </h2>
          <span className="badge badge-success">{procurement.status}</span>
        </div>

        <div className="bg-gray-50 p-4 rounded-md mb-4 border border-gray-200">
          <p className="text-sm text-muted mb-1">Crop Type</p>
          <p className="font-bold text-lg text-gray-800">{procurement.crop}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white border border-gray-100 p-3 rounded-md shadow-sm">
            <p className="text-sm text-muted">Booked Quantity</p>
            <p className="text-lg font-bold">{procurement.bookedQuantity} Qtl</p>
          </div>
          <div className="bg-white border border-gray-100 p-3 rounded-md shadow-sm">
            <p className="text-sm text-muted">Actual Quantity</p>
            <p className="text-lg font-bold text-primary flex items-center gap-1">
              <CheckCircle2 size={16} /> {procurement.actualQuantity} Qtl
            </p>
          </div>
        </div>

        <div className="border-t border-dashed pt-4 border-gray-300">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted">Procurement Rate (per Qtl)</span>
            <span className="font-semibold">₹{procurement.rate}</span>
          </div>
          <div className="flex justify-between items-center text-lg mt-2">
            <span className="font-bold">Total Amount</span>
            <span className="font-bold text-success">₹{procurement.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <Link to="/payment" className="btn w-full flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--color-text-primary)', color: 'white' }}>
        View Payment Status <ArrowRight size={18} />
      </Link>
    </div>
  );
};

export default ProcurementPage;
