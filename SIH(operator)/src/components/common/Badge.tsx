import React from 'react';
import { QueueStatus, PaymentStatus } from '../../types';
import { 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  Loader2, 
  AlertCircle, 
  XCircle, 
  UserX,
  CreditCard,
  CheckCheck
} from 'lucide-react';

interface QueueBadgeProps {
  status: QueueStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const QueueBadge: React.FC<QueueBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
    lg: 'px-3.5 py-1.5 text-sm gap-2 font-semibold',
  };

  switch (status) {
    case 'BOOKED':
      return (
        <span className={`inline-flex items-center rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 ${sizeClasses[size]}`}>
          <Clock className="w-3.5 h-3.5" />
          Booked
        </span>
      );
    case 'ARRIVED':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${sizeClasses[size]}`}>
          <UserCheck className="w-3.5 h-3.5" />
          Arrived at Gate
        </span>
      );
    case 'WAITING':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse-slow ${sizeClasses[size]}`}>
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          In Waiting Queue
        </span>
      );
    case 'PROCESSING':
      return (
        <span className={`inline-flex items-center rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 glow-emerald ${sizeClasses[size]}`}>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          Currently Processing
        </span>
      );
    case 'COMPLETED':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 ${sizeClasses[size]}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Procurement Completed
        </span>
      );
    case 'SKIPPED':
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/40 ${sizeClasses[size]}`}>
          <XCircle className="w-3.5 h-3.5" />
          Skipped Turn
        </span>
      );
    case 'NO_SHOW':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 ${sizeClasses[size]}`}>
          <UserX className="w-3.5 h-3.5" />
          No Show
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-800 text-slate-400 ${sizeClasses[size]}`}>
          {status}
        </span>
      );
  }
};

interface PaymentBadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md';
}

export const PaymentBadge: React.FC<PaymentBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs font-medium gap-1.5',
  };

  switch (status) {
    case 'PENDING':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 ${sizeClasses[size]}`}>
          <Clock className="w-3 h-3" />
          Pending DBT
        </span>
      );
    case 'PROCESSING':
      return (
        <span className={`inline-flex items-center rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 ${sizeClasses[size]}`}>
          <CreditCard className="w-3 h-3 animate-pulse" />
          Bank Processing
        </span>
      );
    case 'COMPLETED':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${sizeClasses[size]}`}>
          <CheckCheck className="w-3 h-3 text-emerald-400" />
          DBT Disbursed
        </span>
      );
    case 'FAILED':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 ${sizeClasses[size]}`}>
          <AlertCircle className="w-3 h-3" />
          Transfer Failed
        </span>
      );
    default:
      return <span className="text-slate-400">{status}</span>;
  }
};
