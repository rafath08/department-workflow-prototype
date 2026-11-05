import React, { useState, useEffect } from 'react';
import { X, Calendar, User, FileText, MapPin, Building, Download, Paperclip } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import TimelineView from '../common/TimelineView';
import api from '../../services/api';

export const ViewApplicationModal = ({ isOpen, onClose, applicationId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !applicationId) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/applications/${applicationId}`);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Fetch application detail error:', err);
        setError(err.response?.data?.message || 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [isOpen, applicationId]);

  if (!isOpen) return null;

  const app = data?.application;
  const history = data?.history || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-800">
              {app ? app.applicationId : 'Application Details'}
            </h3>
            {app && <StatusBadge status={app.status} />}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading && (
            <div className="py-12 flex justify-center items-center text-slate-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
              <span className="ml-3 text-sm">Loading application details...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-200">
              {error}
            </div>
          )}

          {app && !loading && (
            <>
              {/* Student & Department Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Student</span>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <User className="w-4 h-4 text-sky-600" />
                    {app.studentName}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Reg No: <span className="font-medium text-slate-700">{app.regNo}</span> • Class: {app.year} - {app.section}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Department</span>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <Building className="w-4 h-4 text-sky-600" />
                    {app.department}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Mentor: <span className="font-medium text-slate-700">{app.assignedFaculty?.name || 'Assigned Faculty'}</span>
                  </div>
                </div>
              </div>

              {/* Request Core Details */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Request Type</span>
                    <h4 className="text-base font-bold text-slate-800">{app.requestType}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-medium">Schedule Duration</span>
                    <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      {new Date(app.startDate).toLocaleDateString()} to {new Date(app.endDate).toLocaleDateString()}
                      <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                        {app.totalDays} {app.totalDays > 1 ? 'Days' : 'Day'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason for Request</span>
                  <p className="text-sm text-slate-800 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {app.reason}
                  </p>
                </div>

                {app.additionalDescription && (
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Additional Description</span>
                    <p className="text-xs text-slate-600 mt-1">
                      {app.additionalDescription}
                    </p>
                  </div>
                )}

                {/* Event Details if OD or Event */}
                {(app.requestType === 'On-Duty' || app.requestType === 'Event Participation') && app.eventDetails?.eventName && (
                  <div className="mt-3 p-3.5 bg-blue-50/60 rounded-lg border border-blue-100 space-y-2 text-xs">
                    <div className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-700" />
                      Event Details
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
                      <div>
                        <span className="text-slate-500">Event:</span> <span className="font-semibold text-slate-800">{app.eventDetails.eventName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Institution:</span> <span className="font-semibold text-slate-800">{app.eventDetails.organizingInstitution}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-slate-500">Location:</span> <span className="font-semibold text-slate-800">{app.eventDetails.eventLocation}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Uploaded Supporting Documents */}
                {app.documents && app.documents.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Supporting Documents</span>
                    <div className="space-y-1.5">
                      {app.documents.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2 text-slate-700 truncate">
                            <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="font-medium truncate">{doc.originalName}</span>
                            <span className="text-slate-400 text-[10px]">({(doc.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <a
                            href={doc.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-semibold transition shrink-0 ml-2"
                          >
                            <Download className="w-3.5 h-3.5" />
                            View / Download
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Visual Approval Timeline */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">
                  Multi-Level Approval Tracking Timeline
                </h4>
                <TimelineView application={app} history={history} />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewApplicationModal;
