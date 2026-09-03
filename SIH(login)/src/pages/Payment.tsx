import React, { useEffect, useState } from 'react';
import { paymentService } from '../api/apiService';
import type { Payment } from '../types';
import { IndianRupee, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaymentPage: React.FC = () => {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayment = async () => {
      const data = await paymentService.getPaymentDetails();
      setPayment(data);
      setLoading(false);
    };
    fetchPayment();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8"><div className="loader"></div></div>;
  }

  if (!payment) {
    return (
      <div className="text-center p-8">
        <IndianRupee size={48} className="mx-auto text-muted mb-4" />
        <h2 className="text-xl font-bold mb-2">No Payment Records</h2>
        <p className="text-muted mb-4">Payment details will appear here after procurement.</p>
        <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { color: 'var(--color-success)', icon: <CheckCircle size={48} color="white" />, bg: 'var(--color-success)' };
      case 'PROCESSING': return { color: 'var(--color-warning)', icon: <Clock size={48} color="white" />, bg: 'var(--color-warning)' };
      case 'FAILED': return { color: 'var(--color-danger)', icon: <AlertCircle size={48} color="white" />, bg: 'var(--color-danger)' };
      default: return { color: 'var(--color-text-muted)', icon: <Clock size={48} color="white" />, bg: 'var(--color-text-muted)' };
    }
  };

  const config = getStatusConfig(payment.status);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Payment Status</h1>

      <div className="card text-center mb-6 pt-8 pb-8 relative overflow-hidden" style={{ borderColor: config.color, borderWidth: '2px' }}>
        
        <div 
          className="absolute top-0 left-0 w-full h-2" 
          style={{ backgroundColor: config.bg }}
        ></div>

        <div 
          className="mx-auto mb-4 rounded-full flex items-center justify-center shadow-md"
          style={{ backgroundColor: config.bg, width: '80px', height: '80px' }}
        >
          {config.icon}
        </div>

        <p className="text-sm text-muted font-semibold uppercase tracking-widest mb-1">Total Amount</p>
        <h2 className="text-4xl font-bold mb-2 flex items-center justify-center">
          <IndianRupee size={32} /> {payment.amount.toLocaleString('en-IN')}
        </h2>
        
        <div className="inline-block px-4 py-1 rounded-full mt-2 font-semibold" style={{ backgroundColor: `${config.bg}22`, color: config.color }}>
          {payment.status}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-lg mb-4 border-b pb-2">Transaction Details</h3>
        
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-muted">Transaction ID</span>
            <span className="font-medium font-mono bg-gray-100 px-2 py-1 rounded text-sm">{payment.transactionId || 'N/A'}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted">Date</span>
            <span className="font-medium">{payment.date ? new Date(payment.date).toLocaleString() : 'N/A'}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted">Bank Account</span>
            <span className="font-medium">XXXX-XXXX-1234</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
