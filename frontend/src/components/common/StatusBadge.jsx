import React from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle, FileText } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'APPROVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Approved
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5" />
          Rejected
        </span>
      );
    case 'PENDING_FACULTY':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          Pending Faculty
        </span>
      );
    case 'PENDING_HOD':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
          Pending HOD
        </span>
      );
    case 'SUBMITTED':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <FileText className="w-3.5 h-3.5" />
          Submitted
        </span>
      );
  }
};

export default StatusBadge;
