import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  FileText,
  User,
  Building,
  Calendar,
  ShieldAlert,
  Send,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import TimelineView from '../../components/common/TimelineView';
import api from '../../services/api';

export const ApplicationTracking = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [searchId, setSearchId] = useState(initialId);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [myApplications, setMyApplications] = useState([]);

  // Fetch recent applications for quick selection
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await api.get('/applications?limit=8');
        if (res.data.success) {
          setMyApplications(res.data.data);
          // If no searchId was provided via query param, auto-select the first one
          if (!initialId && res.data.data.length > 0) {
            handleTrack(res.data.data[0].applicationId);
          }
        }
      } catch (err) {
        console.error('Error fetching recent applications for tracking:', err);
      }
    };
    fetchRecent();
  }, []);

  useEffect(() => {
    if (initialId) {
      handleTrack(initialId);
    }
  }, [initialId]);

  const handleTrack = async (appId) => {
    const queryId = (appId || searchId).trim();
    if (!queryId) return;

    try {
      setLoading(true);
      setError('');
      setSearchId(queryId);

      const res = await api.get(`/applications/tracking/${queryId}`);
      if (res.data.success) {
        setTrackingData(res.data.data);
      } else {
        setError('No tracking record found for this identifier.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Application ID not found. Please verify the identifier and try again.'
      );
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  const app = trackingData?.application;
  const history = trackingData?.history || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 p-6 rounded-2xl text-white shadow-md">
        <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
          Multi-Level Institutional Transparency
        </span>
        <h2 className="text-2xl font-bold mt-1">Application Tracking System</h2>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Monitor your permission requests and institutional services in real-time. Follow the progression through Faculty Mentor endorsement, Head of Department (HOD) sanction, and Administrative verification with complete remarks and audit records.
        </p>

        {/* Live Search Bar */}
        <div className="mt-5 max-w-xl flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              placeholder="Enter Application ID (e.g. APP-2026-0001)..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800/90 text-sm text-white placeholder-slate-400 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            onClick={() => handleTrack()}
            disabled={loading}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5 shrink-0"
          >
            {loading ? 'Searching...' : 'Track Application'}
          </button>
        </div>
      </div>

      {/* Quick Select from Recent Applications */}
      {myApplications.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Your Recent Submissions (Click to Track):
          </span>
          <div className="flex flex-wrap gap-2">
            {myApplications.map((item) => (
              <button
                key={item._id}
                onClick={() => handleTrack(item.applicationId)}
                className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition flex items-center gap-2 ${
                  searchId === item.applicationId
                    ? 'bg-sky-50 border-sky-300 text-sky-700 font-bold shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="font-mono">{item.applicationId}</span>
                <span className="text-slate-400">•</span>
                <span>{item.requestType}</span>
                <StatusBadge status={item.status} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl shadow-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            className="text-rose-500 hover:text-rose-700 text-xs underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tracking Result View */}
      {trackingData && app && (
        <div className="space-y-6">
          {/* Status Overview Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Tracking Application
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <h3 className="text-xl font-extrabold font-mono text-slate-800">
                    {app.applicationId}
                  </h3>
                  <StatusBadge status={app.status} />
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Submission Date:</span>
                  <span className="font-semibold text-slate-700">
                    {new Date(app.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <span className="text-slate-400 block font-medium">Current Reviewer:</span>
                  <span className="font-semibold text-slate-700">
                    {app.currentApproverName || (app.currentApproverRole === 'none' ? 'Workflow Completed' : `${app.currentApproverRole?.toUpperCase()} Review`)}
                  </span>
                </div>
              </div>
            </div>

            {/* Application Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold uppercase">Category</span>
                <div className="font-bold text-slate-800 text-sm mt-0.5">{app.requestType}</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold uppercase">Schedule</span>
                <div className="font-bold text-slate-800 text-sm mt-0.5">
                  {new Date(app.startDate).toLocaleDateString()} ({app.totalDays}d)
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold uppercase">Student Applicant</span>
                <div className="font-bold text-slate-800 text-sm mt-0.5">{app.studentName}</div>
                <div className="text-[11px] text-slate-500">Reg: {app.regNo}</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold uppercase">Mentor</span>
                <div className="font-bold text-slate-800 text-sm mt-0.5">{app.assignedFaculty?.name || 'Assigned Mentor'}</div>
              </div>
            </div>

            {/* Reason Box */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-500 uppercase tracking-wider block">Statement of Purpose / Reason:</span>
              <p className="text-slate-800 mt-1 font-medium">{app.reason}</p>
            </div>
          </div>

          {/* Rejection Alert if applicable */}
          {trackingData.finalDecision === 'REJECTED' && (
            <div className="p-5 bg-rose-50 border-2 border-rose-300 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-base">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>APPLICATION REJECTED</span>
              </div>
              <p className="text-xs text-rose-950 font-medium">
                Official Rejection Reason: <strong className="italic">"{trackingData.rejectionReason || 'Criteria not met.'}"</strong>
              </p>
              {trackingData.rejectedBy && (
                <p className="text-[11px] text-rose-700">
                  Decided by {trackingData.rejectedBy.name || trackingData.rejectedBy.role} on {new Date(trackingData.rejectedBy.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Stepped Interactive Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Approval Lifecycle Stages</span>
              <span className="text-xs font-semibold text-slate-400">Application Submitted → Faculty Review → HOD Review → Final Decision</span>
            </h4>
            <TimelineView application={app} history={history} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationTracking;
