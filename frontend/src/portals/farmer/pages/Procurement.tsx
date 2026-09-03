import React, { useEffect, useState } from 'react';
import { procurementService, bookingService } from '../api/apiService';
import type { Procurement, Booking } from '../types';
import { Scale, CheckCircle2, FileText, ArrowRight, PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProcurementPage: React.FC = () => {
  const [procurements, setProcurements] = useState<Procurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const details = await procurementService.getProcurementDetails();
        setProcurements(details || []);
      } catch (error) {
        toast.error("Failed to load procurement data.");
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
        <p className="text-gray-500 font-medium animate-pulse">Loading procurement records...</p>
      </div>
    );
  }

  if (procurements.length === 0) {
    return (
      <div className="card border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center p-10 text-center mt-4">
        <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
          <PackageOpen size={40} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">No Procurement History</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">You do not have any past procurement records to display here.</p>
        <Link to="/farmer/book-slot" className="btn btn-primary px-8 shadow-sm">Book a Slot</Link>
      </div>
    );
  }

  return (
    <div className="pb-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 tracking-tight">Procurement Details</h1>

      <div className="flex flex-col gap-5">
        {procurements.map((procurement) => (
          <div key={procurement.id} className="card overflow-hidden shadow-md border border-gray-100 p-0">
            <div className="p-4 flex justify-between items-center bg-gray-50 border-b border-gray-100">
              <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <FileText size={20} className="text-primary" /> Booking #{procurement.booking_id}
              </h2>
              <span className={`px-2 py-1 text-xs font-bold rounded-full ${procurement.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {procurement.status}
              </span>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Booked Quantity</p>
                  <p className="text-lg font-bold text-gray-800">{procurement.expected_quantity} Qtl</p>
                </div>
                <div className="bg-green-50 border border-green-100 p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-green-700 uppercase tracking-wider font-semibold mb-1">Actual Quantity</p>
                  <p className="text-lg font-bold text-green-800 flex items-center gap-1">
                    <CheckCircle2 size={18} /> {procurement.actual_quantity || 'Pending'} Qtl
                  </p>
                </div>
              </div>

              <div className="border-t border-dashed pt-4 border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500 font-medium">Procurement Rate (per Qtl)</span>
                  <span className="font-semibold text-gray-800">₹{procurement.rate}</span>
                </div>
                <div className="flex justify-between items-center text-lg mt-3 bg-gray-50 p-3 rounded-md">
                  <span className="font-bold text-gray-700">Total Amount</span>
                  <span className="font-black text-primary text-xl">₹{procurement.total_amount?.toLocaleString('en-IN') || '0'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {procurements[0]?.payment_status && (
        <div className="mt-8">
          <Link to="/farmer/payment" className="btn w-full flex items-center justify-center gap-2 py-3 shadow-md bg-gray-800 hover:bg-gray-900 text-white transition-colors">
            View Payment Details <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProcurementPage;
