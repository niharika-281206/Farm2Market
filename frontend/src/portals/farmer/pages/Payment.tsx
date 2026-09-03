import React, { useEffect, useState } from 'react';
import { paymentService } from '../api/apiService';
import type { Payment } from '../types';
import { IndianRupee, CheckCircle, Clock, AlertCircle, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const PaymentPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const data = await paymentService.getPaymentDetails();
        setPayments(data || []);
      } catch (error) {
        toast.error("Failed to fetch payment details.");
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading payment records...</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="card border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center p-10 text-center mt-4">
        <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
          <Receipt size={40} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">No Payments Yet</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">You haven't completed any procurements yet, so there are no payments to display.</p>
        <Link to="/farmer/" className="btn btn-primary px-8 shadow-sm">Back to Dashboard</Link>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { color: '#16a34a', icon: <CheckCircle size={32} color="white" />, bg: '#16a34a', label: 'Completed' };
      case 'PROCESSING': return { color: '#ea580c', icon: <Clock size={32} color="white" />, bg: '#ea580c', label: 'Processing' };
      case 'FAILED': return { color: '#dc2626', icon: <AlertCircle size={32} color="white" />, bg: '#dc2626', label: 'Failed' };
      default: return { color: '#6b7280', icon: <Clock size={32} color="white" />, bg: '#6b7280', label: status };
    }
  };

  return (
    <div className="pb-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 tracking-tight">Payment Status</h1>

      <div className="flex flex-col gap-6">
        {payments.map((payment) => {
          const config = getStatusConfig(payment.status);
          return (
            <div key={payment.id} className="card p-0 overflow-hidden shadow-lg border-0" style={{ borderColor: config.color, borderWidth: '1px' }}>
              
              <div className="p-6 text-center bg-gray-50/50 relative">
                <div 
                  className="absolute top-0 left-0 w-full h-1" 
                  style={{ backgroundColor: config.bg }}
                ></div>

                <div 
                  className="mx-auto mb-4 rounded-full flex items-center justify-center shadow-md transform -translate-y-2"
                  style={{ backgroundColor: config.bg, width: '64px', height: '64px' }}
                >
                  {config.icon}
                </div>

                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Total Amount</p>
                <h2 className="text-4xl font-black text-gray-800 mb-3 flex items-center justify-center tracking-tight">
                  <IndianRupee size={28} className="mr-1" /> {payment.amount.toLocaleString('en-IN')}
                </h2>
                
                <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: `${config.bg}15`, color: config.color }}>
                  {config.label}
                </div>
              </div>

              <div className="p-5 border-t border-gray-100 bg-white">
                <h3 className="font-bold text-gray-800 text-sm mb-4 uppercase tracking-wider">Transaction Details</h3>
                
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500 font-medium">Transaction ID</span>
                    <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md text-xs">{payment.transaction_id || 'Pending'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500 font-medium">Date</span>
                    <span className="font-semibold text-gray-800 text-sm">{payment.paid_at ? new Date(payment.paid_at).toLocaleString() : 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-500 font-medium">Bank Account</span>
                    <span className="font-semibold text-gray-800 text-sm">Linked Account</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentPage;
