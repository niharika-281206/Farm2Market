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
  CheckCheck,
  Megaphone,
  CalendarCheck,
} from 'lucide-react';

interface QueueBadgeProps {
  status: QueueStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const QueueBadge: React.FC<QueueBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
    lg: 'px-3.5 py-1.5 text-sm gap-2 font-semibold',
  };

  switch (status) {
    case 'BOOKED':
      return (
        <span className={`inline-flex items-center rounded-lg bg-sky-50 text-sky-700 border border-sky-200 ${sizeClasses[size]}`}>
          <CalendarCheck className="w-3.5 h-3.5" />
          Booked
        </span>
      );
    case 'ARRIVED':
      return (
        <span className={`inline-flex items-center rounded-lg bg-teal-50 text-teal-700 border border-teal-200 ${sizeClasses[size]}`}>
          <UserCheck className="w-3.5 h-3.5" />
          Arrived
        </span>
      );
    case 'WAITING':
      return (
        <span className={`inline-flex items-center rounded-lg bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses[size]}`}>
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Waiting
        </span>
      );
    case 'CALLED':
      return (
        <span className={`inline-flex items-center rounded-lg bg-violet-50 text-violet-700 border border-violet-200 ${sizeClasses[size]}`}>
          <Megaphone className="w-3.5 h-3.5 text-violet-600" />
          Called
        </span>
      );
    case 'PROCESSING':
      return (
        <span className={`inline-flex items-center rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses[size]}`}>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
          Processing
        </span>
      );
    case 'COMPLETED':
      return (
        <span className={`inline-flex items-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses[size]}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Completed
        </span>
      );
    case 'SKIPPED':
      return (
        <span className={`inline-flex items-center rounded-lg bg-slate-50 text-slate-600 border border-slate-200 ${sizeClasses[size]}`}>
          <XCircle className="w-3.5 h-3.5" />
          Skipped
        </span>
      );
    case 'NO_SHOW':
      return (
        <span className={`inline-flex items-center rounded-lg bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses[size]}`}>
          <UserX className="w-3.5 h-3.5" />
          No Show
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-lg bg-slate-50 text-slate-600 border border-slate-200 ${sizeClasses[size]}`}>
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
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs font-medium gap-1.5',
  };

  switch (status) {
    case 'PENDING':
      return (
        <span className={`inline-flex items-center rounded-lg bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses[size]}`}>
          <Clock className="w-3 h-3" />
          Pending DBT
        </span>
      );
    case 'PROCESSING':
      return (
        <span className={`inline-flex items-center rounded-lg bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses[size]}`}>
          <CreditCard className="w-3 h-3 animate-pulse" />
          Bank Processing
        </span>
      );
    case 'COMPLETED':
      return (
        <span className={`inline-flex items-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses[size]}`}>
          <CheckCheck className="w-3 h-3 text-emerald-600" />
          DBT Disbursed
        </span>
      );
    case 'FAILED':
      return (
        <span className={`inline-flex items-center rounded-lg bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses[size]}`}>
          <AlertCircle className="w-3 h-3" />
          Transfer Failed
        </span>
      );
    default:
      return <span className="text-slate-600">{status}</span>;
  }
};
