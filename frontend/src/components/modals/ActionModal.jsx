import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  AlertTriangle,
  Send,
  HelpCircle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const ActionModal = ({
  isOpen,
  onClose,
  onSubmit,
  application,
  actionType = 'APPROVE'
}) => {
  const [remarks, setRemarks] = useState('');
  const [targetRole, setTargetRole] = useState('hod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !application) return null;

  const isApprove = actionType === 'APPROVE';
  const isReject = actionType === 'REJECT';
  const isForward = actionType === 'FORWARD';
  const isRequestInfo = actionType === 'REQUEST_INFO';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isReject && !remarks.trim()) {
      setError('A detailed rejection reason is strictly mandatory.');
      return;
    }

    if (isRequestInfo && !remarks.trim()) {
      setError('Please specify the exact information or clarification needed.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (isForward) {
        await onSubmit({ targetRole, remarks });
      } else if (isRequestInfo) {
        await onSubmit({ query: remarks });
      } else {
        await onSubmit({ remarks });
      }

      setRemarks('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const getHeaderConfig = () => {
    if (isApprove) {
      return {
        bg: 'bg-emerald-50 border-emerald-100',
        text: 'text-emerald-900',
        icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
        title: 'Approve & Sanction Application',
        btnText: 'Confirm Approval',
        btnClass: 'bg-emerald-600 hover:bg-emerald-700'
      };
    }
    if (isReject) {
      return {
        bg: 'bg-rose-50 border-rose-100',
        text: 'text-rose-900',
        icon: <ShieldAlert className="w-5 h-5 text-rose-600" />,
        title: 'Reject Application',
        btnText: 'Confirm Rejection',
        btnClass: 'bg-rose-600 hover:bg-rose-700'
      };
    }
    if (isForward) {
      return {
        bg: 'bg-blue-50 border-blue-100',
        text: 'text-blue-900',
        icon: <Send className="w-5 h-5 text-blue-600" />,
        title: 'Forward to Higher Authority',
        btnText: 'Forward Application',
        btnClass: 'bg-blue-600 hover:bg-blue-700'
      };
    }
    // REQUEST_INFO
    return {
      bg: 'bg-purple-50 border-purple-100',
      text: 'text-purple-900',
      icon: <HelpCircle className="w-5 h-5 text-purple-600" />,
      title: 'Request Additional Information',
      btnText: 'Send Information Request',
      btnClass: 'bg-purple-600 hover:bg-purple-700'
    };
  };

  const cfg = getHeaderConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${cfg.bg}`}>
          <div className="flex items-center gap-2.5">
            {cfg.icon}
            <h3 className={`font-semibold text-base ${cfg.text}`}>{cfg.title}</h3>
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
          {/* Quick Summary Context */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Application ID:</span>
              <span className="font-bold text-slate-800">{application.applicationId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Applicant Student:</span>
              <span className="font-semibold text-slate-800">{application.studentName} ({application.regNo})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Service Category:</span>
              <span className="font-semibold text-slate-800">{application.requestType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Requested Schedule:</span>
              <span className="text-slate-800">
                {new Date(application.startDate).toLocaleDateString()} to {new Date(application.endDate).toLocaleDateString()} ({application.totalDays}d)
              </span>
            </div>
          </div>

          {/* Forward Destination Selector */}
          {isForward && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Forward To Authority
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 bg-white"
              >
                <option value="hod">Head of Department (HOD) - Department Sanction</option>
                <option value="admin">Principal / Central Institutional Admin - Executive Sanction</option>
              </select>
            </div>
          )}

          {/* Remarks or Required Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {isApprove && 'Approval Remarks (Optional)'}
              {isReject && 'Rejection Reason (Mandatory - Displayed to Student)'}
              {isForward && 'Forwarding Remarks & Recommendations (Optional)'}
              {isRequestInfo && 'Clarification / Query Details (Mandatory)'}
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                isApprove
                  ? 'E.g., Verified credentials, recommended for department sanction.'
                  : isReject
                  ? 'E.g., Incomplete documentation or conflicting with mid-term evaluation examinations.'
                  : isForward
                  ? 'E.g., Verified on-duty event; forwarding for department head approval.'
                  : 'E.g., Please attach the event brochure and confirmed registration receipt.'
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 placeholder-slate-400"
              required={isReject || isRequestInfo}
            />
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              {error}
            </p>
          )}

          {/* Actions */}
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
              className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition shadow flex items-center gap-1.5 ${cfg.btnClass} disabled:opacity-50`}
            >
              {loading ? 'Processing...' : cfg.btnText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActionModal;
