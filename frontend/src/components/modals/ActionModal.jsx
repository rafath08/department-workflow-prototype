import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

export const ActionModal = ({
  isOpen,
  onClose,
  onSubmit,
  application,
  actionType = 'APPROVE'
}) => {
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !application) return null;

  const isApprove = actionType === 'APPROVE';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isApprove && !remarks.trim()) {
      setError('Please provide remarks/reason for rejection.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit({ remarks });
      setRemarks('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-b ${
            isApprove ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isApprove ? (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            )}
            <h3
              className={`font-semibold text-base ${
                isApprove ? 'text-emerald-900' : 'text-rose-900'
              }`}
            >
              {isApprove ? 'Approve & Sanction Application' : 'Reject Application'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Application ID:</span>
              <span className="font-semibold text-slate-800">{application.applicationId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Student:</span>
              <span className="font-semibold text-slate-800">{application.studentName} ({application.regNo})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Request Type:</span>
              <span className="font-semibold text-slate-800">{application.requestType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Duration:</span>
              <span className="text-slate-800">
                {new Date(application.startDate).toLocaleDateString()} to {new Date(application.endDate).toLocaleDateString()} ({application.totalDays} days)
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {isApprove ? 'Approval Remarks (Optional)' : 'Rejection Reason / Remarks (Required)'}
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                isApprove
                  ? 'E.g., Verified credentials, recommended for department sanction.'
                  : 'E.g., Incomplete documentation or clashing with continuous evaluation exams.'
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 placeholder-slate-400"
              required={!isApprove}
            />
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
              {error}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition shadow flex items-center gap-1.5 ${
                isApprove
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              } disabled:opacity-50`}
            >
              {loading ? 'Processing...' : isApprove ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActionModal;
