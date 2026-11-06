import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Send,
  HelpCircle,
  ShieldAlert,
  Ban
} from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const norm = (status || '').toUpperCase().trim();

  // 1. Approved / Final Sanction
  if (norm === 'APPROVED' || norm === 'HOD APPROVED' || norm === 'FACULTY APPROVED' && status === 'Approved') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Approved
      </span>
    );
  }

  // 2. Rejected
  if (norm === 'REJECTED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        Rejected
      </span>
    );
  }

  // 3. Faculty Approved
  if (norm === 'FACULTY APPROVED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
        Faculty Approved
      </span>
    );
  }

  // 4. Forwarded to HOD
  if (norm === 'FORWARDED TO HOD' || norm === 'FORWARDED_TO_HOD') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <Send className="w-3.5 h-3.5 text-blue-600" />
        Forwarded to HOD
      </span>
    );
  }

  // 5. Pending HOD Approval
  if (norm === 'PENDING HOD APPROVAL' || norm === 'PENDING_HOD') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
        Pending HOD Approval
      </span>
    );
  }

  // 6. Forwarded to Admin
  if (norm === 'FORWARDED TO ADMIN' || norm === 'FORWARDED_TO_ADMIN' || norm === 'PENDING_ADMIN') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
        <Send className="w-3.5 h-3.5 text-violet-600" />
        Forwarded to Admin
      </span>
    );
  }

  // 7. Additional Information Required
  if (norm.includes('ADDITIONAL') || norm.includes('INFORMATION REQUIRED') || norm === 'INFO_REQUIRED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
        <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
        Info Required
      </span>
    );
  }

  // 8. Cancelled
  if (norm === 'CANCELLED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300">
        <Ban className="w-3.5 h-3.5 text-slate-500" />
        Cancelled
      </span>
    );
  }

  // 9. Pending Faculty Approval
  if (norm === 'PENDING FACULTY APPROVAL' || norm === 'PENDING_FACULTY') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
        <Clock className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
        Pending Faculty Approval
      </span>
    );
  }

  // 10. Submitted
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
      <FileText className="w-3.5 h-3.5 text-indigo-600" />
      {status || 'Submitted'}
    </span>
  );
};

export default StatusBadge;
