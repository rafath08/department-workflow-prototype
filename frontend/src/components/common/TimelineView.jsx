import React from 'react';
import {
  Check,
  X,
  Clock,
  Send,
  UserCheck,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

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

  const normStatus = (application.status || '').toUpperCase();

  const isFacultyRejected =
    application.facultyApproval?.status === 'REJECTED' ||
    (normStatus === 'REJECTED' && application.rejectionBy?.role === 'faculty');

  const isFacultyApproved =
    application.facultyApproval?.status === 'APPROVED' ||
    application.facultyApproval?.status === 'FORWARDED' ||
    normStatus === 'FORWARDED TO HOD' ||
    normStatus === 'PENDING HOD APPROVAL' ||
    normStatus === 'HOD APPROVED' ||
    normStatus === 'FORWARDED TO ADMIN' ||
    (normStatus === 'APPROVED' && application.facultyApproval?.status === 'APPROVED');

  const isFacultyPending =
    normStatus === 'PENDING FACULTY APPROVAL' || normStatus === 'PENDING_FACULTY';

  const isHodRejected =
    application.hodApproval?.status === 'REJECTED' ||
    (normStatus === 'REJECTED' && application.rejectionBy?.role === 'hod');

  const isHodApproved =
    application.hodApproval?.status === 'APPROVED' ||
    application.hodApproval?.status === 'FORWARDED' ||
    normStatus === 'HOD APPROVED' ||
    normStatus === 'APPROVED';

  const isHodPending =
    normStatus === 'PENDING HOD APPROVAL' ||
    normStatus === 'FORWARDED TO HOD' ||
    normStatus === 'PENDING_HOD';

  const isFinalApproved = normStatus === 'APPROVED' || normStatus === 'HOD APPROVED';
  const isFinalRejected = normStatus === 'REJECTED';
  const isInfoRequired = normStatus.includes('ADDITIONAL') || normStatus.includes('INFORMATION');

  return (
    <div className="py-2 space-y-6">
      {/* Prominent High-Visibility Rejection Banner */}
      {isFinalRejected && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <span>APPLICATION HAS BEEN REJECTED</span>
          </div>
          <div className="bg-white/80 p-3 rounded-lg border border-rose-200 text-xs text-rose-900 space-y-1">
            <p className="font-semibold text-rose-700">Rejection Reason / Remarks:</p>
            <p className="italic font-medium text-slate-800">
              "{application.rejectionRemarks || 'Reason not specified.'}"
            </p>
            <div className="pt-2 text-[11px] text-rose-600 flex items-center justify-between border-t border-rose-100">
              <span>
                Decided by: <strong className="capitalize">{application.rejectionBy?.name || application.rejectionBy?.role || 'Approver'}</strong>
              </span>
              <span>{formatDate(application.rejectionBy?.timestamp || application.updatedAt)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Additional Information Banner */}
      {isInfoRequired && (
        <div className="p-4 bg-purple-50 border-2 border-purple-300 rounded-xl shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
            <HelpCircle className="w-5 h-5 text-purple-600 shrink-0" />
            <span>ADDITIONAL INFORMATION REQUIRED</span>
          </div>
          <div className="bg-white/80 p-3 rounded-lg border border-purple-200 text-xs text-purple-900 space-y-1">
            <p className="font-semibold text-purple-700">Clarification Request:</p>
            <p className="italic font-medium text-slate-800">
              "{application.infoRequests?.[application.infoRequests.length - 1]?.query || 'Please provide additional clarification.'}"
            </p>
          </div>
        </div>
      )}

      {/* Stepped Timeline */}
      <div className="relative border-l-2 border-slate-200 ml-4 space-y-7">
        {/* Stage 1: Student Submission */}
        <div className="relative pl-6">
          <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-600">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-800">1. Student Application Submitted</h4>
              <span className="text-xs text-slate-500">{formatDate(application.createdAt)}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Applicant: <span className="font-medium text-slate-800">{application.studentName}</span> ({application.regNo})
            </p>
            <div className="mt-1 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700">
              <span className="font-semibold text-slate-800">{application.requestType}:</span> {application.reason}
            </div>
          </div>
        </div>

        {/* Stage 2: Faculty Mentor Endorsement */}
        <div className="relative pl-6">
          <div
            className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
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
              <h4 className="text-sm font-semibold text-slate-800">2. Faculty Mentor Review</h4>
              <span className="text-xs text-slate-500">
                {application.facultyApproval?.timestamp
                  ? formatDate(application.facultyApproval.timestamp)
                  : isFacultyPending
                  ? 'Currently in Review'
                  : 'Pending'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Assigned Mentor: <span className="font-medium text-slate-800">{application.assignedFaculty?.name || 'Faculty Mentor'}</span>
            </p>
            {application.facultyApproval?.remarks && (
              <div
                className={`mt-1.5 text-xs p-2.5 rounded-lg border ${
                  isFacultyRejected
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <span className="font-semibold">Faculty Remarks:</span> "{application.facultyApproval.remarks}"
              </div>
            )}
          </div>
        </div>

        {/* Stage 3: HOD Sanction */}
        <div className="relative pl-6">
          <div
            className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
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
              <span className="text-[11px] font-bold">HOD</span>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-800">3. Head of Department (HOD) Review</h4>
              <span className="text-xs text-slate-500">
                {application.hodApproval?.timestamp
                  ? formatDate(application.hodApproval.timestamp)
                  : isHodPending
                  ? 'Awaiting HOD Sanction'
                  : 'Pending'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Department: <span className="font-medium text-slate-800">{application.department}</span>
            </p>
            {application.hodApproval?.remarks && (
              <div
                className={`mt-1.5 text-xs p-2.5 rounded-lg border ${
                  isHodRejected
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <span className="font-semibold">HOD Remarks:</span> "{application.hodApproval.remarks}"
              </div>
            )}
          </div>
        </div>

        {/* Stage 4: Final Outcome */}
        <div className="relative pl-6">
          <div
            className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
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
              <h4 className="text-sm font-semibold text-slate-800">4. Final Administrative Decision</h4>
              <span className="text-xs text-slate-500">
                {isFinalApproved || isFinalRejected
                  ? formatDate(application.updatedAt)
                  : 'Workflow In Progress'}
              </span>
            </div>
            <div className="mt-2">
              {isFinalApproved && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs">
                  <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    OFFICIALLY SANCTIONED & APPROVED
                  </p>
                  <p className="mt-1 text-slate-700">
                    This application has received complete institutional sanction. The student is authorized for the requested duration.
                  </p>
                </div>
              )}
              {isFinalRejected && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-900 text-xs">
                  <p className="font-bold text-rose-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    REQUEST REJECTED
                  </p>
                  <p className="mt-1 text-slate-800 font-medium">
                    Reason: "{application.rejectionRemarks || 'Criteria not met.'}"
                  </p>
                </div>
              )}
              {!isFinalApproved && !isFinalRejected && (
                <div className="p-2.5 bg-sky-50 border border-sky-100 rounded-lg text-sky-800 text-xs flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0 text-sky-600 animate-pulse" />
                  <span>
                    Current Stage: <strong>{application.status}</strong> (with {application.currentApproverRole?.toUpperCase() || 'Reviewer'})
                  </span>
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
