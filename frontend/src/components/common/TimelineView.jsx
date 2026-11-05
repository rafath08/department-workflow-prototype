import React from 'react';
import { Check, X, Clock, FileText, ArrowRight, UserCheck } from 'lucide-react';

export const TimelineView = ({ application, history = [] }) => {
  if (!application) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Pending';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Find history records
  const submissionRecord = history.find((h) => h.action === 'SUBMITTED');
  const facultyRecord = history.find(
    (h) => h.action === 'FACULTY_APPROVED' || h.action === 'FACULTY_REJECTED'
  );
  const hodRecord = history.find(
    (h) => h.action === 'HOD_APPROVED' || h.action === 'HOD_REJECTED'
  );

  const isFacultyRejected = application.facultyApproval?.status === 'REJECTED';
  const isFacultyApproved = application.facultyApproval?.status === 'APPROVED';
  const isFacultyPending = application.status === 'PENDING_FACULTY';

  const isHodRejected = application.hodApproval?.status === 'REJECTED';
  const isHodApproved = application.hodApproval?.status === 'APPROVED';
  const isHodPending = application.status === 'PENDING_HOD';

  const isFinalApproved = application.status === 'APPROVED';
  const isFinalRejected = application.status === 'REJECTED';

  return (
    <div className="py-4">
      <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">
        {/* Stage 1: Student Submission */}
        <div className="relative pl-6">
          <div className="absolute -left-[17px] top-0.5 w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-600">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-800">1. Student Submission</h4>
              <span className="text-xs text-slate-500">{formatDate(application.createdAt)}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Submitted by <span className="font-medium text-slate-800">{application.studentName}</span> ({application.regNo})
            </p>
            <div className="mt-1 text-xs bg-slate-50 p-2 rounded border border-slate-100 text-slate-700">
              <span className="font-medium">Request:</span> {application.requestType} • <span className="font-medium">Reason:</span> {application.reason}
            </div>
          </div>
        </div>

        {/* Stage 2: Faculty Review */}
        <div className="relative pl-6">
          <div
            className={`absolute -left-[17px] top-0.5 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
              isFacultyApproved
                ? 'bg-emerald-100 border-emerald-500 text-emerald-600'
                : isFacultyRejected
                ? 'bg-rose-100 border-rose-500 text-rose-600'
                : isFacultyPending
                ? 'bg-sky-100 border-sky-500 text-sky-600 animate-pulse'
                : 'bg-slate-100 border-slate-300 text-slate-400'
            }`}
          >
            {isFacultyApproved ? (
              <Check className="w-4 h-4" />
            ) : isFacultyRejected ? (
              <X className="w-4 h-4" />
            ) : isFacultyPending ? (
              <Clock className="w-4 h-4" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-800">2. Faculty Mentor Endorsement</h4>
              <span className="text-xs text-slate-500">
                {application.facultyApproval?.timestamp
                  ? formatDate(application.facultyApproval.timestamp)
                  : isFacultyPending
                  ? 'Awaiting Action'
                  : 'Pending'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Assigned Mentor: <span className="font-medium text-slate-800">{application.assignedFaculty?.name || 'Assigned Mentor'}</span>
            </p>
            {application.facultyApproval?.remarks && (
              <div
                className={`mt-1 text-xs p-2 rounded border ${
                  isFacultyRejected
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className="font-medium">Faculty Remarks:</span> "{application.facultyApproval.remarks}"
              </div>
            )}
          </div>
        </div>

        {/* Stage 3: HOD Review */}
        <div className="relative pl-6">
          <div
            className={`absolute -left-[17px] top-0.5 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
              isHodApproved
                ? 'bg-emerald-100 border-emerald-500 text-emerald-600'
                : isHodRejected
                ? 'bg-rose-100 border-rose-500 text-rose-600'
                : isHodPending
                ? 'bg-amber-100 border-amber-500 text-amber-600 animate-pulse'
                : 'bg-slate-100 border-slate-300 text-slate-400'
            }`}
          >
            {isHodApproved ? (
              <Check className="w-4 h-4" />
            ) : isHodRejected ? (
              <X className="w-4 h-4" />
            ) : isHodPending ? (
              <Clock className="w-4 h-4" />
            ) : (
              <span className="text-xs font-bold">HOD</span>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-800">3. Head of Department (HOD) Sanction</h4>
              <span className="text-xs text-slate-500">
                {application.hodApproval?.timestamp
                  ? formatDate(application.hodApproval.timestamp)
                  : isHodPending
                  ? 'Awaiting HOD'
                  : 'Pending'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Department: <span className="font-medium text-slate-800">{application.department}</span>
            </p>
            {application.hodApproval?.remarks && (
              <div
                className={`mt-1 text-xs p-2 rounded border ${
                  isHodRejected
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className="font-medium">HOD Remarks:</span> "{application.hodApproval.remarks}"
              </div>
            )}
          </div>
        </div>

        {/* Stage 4: Final Status */}
        <div className="relative pl-6">
          <div
            className={`absolute -left-[17px] top-0.5 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
              isFinalApproved
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : isFinalRejected
                ? 'bg-rose-600 border-rose-600 text-white'
                : 'bg-slate-100 border-slate-300 text-slate-400'
            }`}
          >
            {isFinalApproved ? <Check className="w-4 h-4" /> : isFinalRejected ? <X className="w-4 h-4" /> : '•'}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-800">4. Final Institutional Status</h4>
              <span className="text-xs text-slate-500">
                {isFinalApproved || isFinalRejected
                  ? formatDate(application.updatedAt)
                  : 'Workflow In Progress'}
              </span>
            </div>
            <div className="mt-2">
              {isFinalApproved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs">
                  <p className="font-bold">PERMISSION SANCTIONED</p>
                  <p className="mt-0.5">This request has completed all levels of administrative review and is officially granted.</p>
                </div>
              )}
              {isFinalRejected && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                  <p className="font-bold">APPLICATION REJECTED</p>
                  <p className="mt-0.5">Reason: {application.rejectionRemarks || 'Request could not be accommodated.'}</p>
                </div>
              )}
              {!isFinalApproved && !isFinalRejected && (
                <div className="p-2.5 bg-sky-50 border border-sky-100 rounded-lg text-sky-800 text-xs flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0 text-sky-600 animate-pulse" />
                  <span>Request is progressing through institutional approval stages.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
