import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Eye,
  Check,
  X,
  Send,
  HelpCircle,
  Calendar,
  User,
  Filter,
  Search,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import ActionModal from '../../components/modals/ActionModal';
import api from '../../services/api';

export const FacultyDashboard = ({ onOpenApplicationModal }) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'completed' | 'all'
  const [search, setSearch] = useState('');

  // Modal State for Action
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionType, setActionType] = useState('APPROVE'); // 'APPROVE' | 'REJECT' | 'FORWARD' | 'REQUEST_INFO'
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/applications');
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error('Fetch faculty applications error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleActionClick = (app, type) => {
    setSelectedApp(app);
    setActionType(type);
    setIsActionModalOpen(true);
  };

  const handleActionSubmit = async (payload) => {
    if (!selectedApp) return;

    if (actionType === 'APPROVE') {
      await api.put(`/applications/${selectedApp._id}/approve`, { remarks: payload.remarks });
    } else if (actionType === 'REJECT') {
      await api.put(`/applications/${selectedApp._id}/reject`, { remarks: payload.remarks });
    } else if (actionType === 'FORWARD') {
      await api.put(`/applications/${selectedApp._id}/forward`, {
        targetRole: payload.targetRole || 'hod',
        remarks: payload.remarks
      });
    } else if (actionType === 'REQUEST_INFO') {
      await api.put(`/applications/${selectedApp._id}/request-info`, { query: payload.query });
    }

    await fetchApplications();
  };

  const isPendingFaculty = (status) => {
    const s = (status || '').toUpperCase();
    return (
      s === 'PENDING FACULTY APPROVAL' ||
      s === 'PENDING_FACULTY' ||
      s === 'SUBMITTED' ||
      s.includes('ADDITIONAL') ||
      s.includes('INFORMATION')
    );
  };

  const pendingApps = applications.filter((a) => isPendingFaculty(a.status));
  const completedApps = applications.filter((a) => !isPendingFaculty(a.status));

  const displayedApps = (
    activeTab === 'pending'
      ? pendingApps
      : activeTab === 'completed'
      ? completedApps
      : applications
  ).filter(
    (a) =>
      a.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      a.regNo?.toLowerCase().includes(search.toLowerCase()) ||
      a.applicationId?.toLowerCase().includes(search.toLowerCase()) ||
      a.reason?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-sky-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-blue-200">
            Faculty Mentor Approval Console
          </span>
          <h2 className="text-2xl font-bold mt-1">Welcome, {user?.name}</h2>
          <p className="text-xs text-sky-100 mt-1 max-w-xl">
            Review student applications under your mentorship. Grant recommendations, forward to HOD, request clarification, or reject with stated grounds.
          </p>
          <div className="mt-2 text-xs text-blue-200">
            Department: <strong className="text-white">{user?.department}</strong>
          </div>
        </div>

        {/* Quick count badge */}
        <div className="bg-white/10 backdrop-blur px-5 py-3 rounded-xl border border-white/20 text-center shrink-0">
          <div className="text-2xl font-black text-amber-300">{pendingApps.length}</div>
          <span className="text-[11px] text-slate-200 font-medium">Pending Your Review</span>
        </div>
      </div>

      {/* Control Bar: Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pending Action ({pendingApps.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'completed'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Processed ({completedApps.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'all'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({applications.length})
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student, ID or reason..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            onClick={fetchApplications}
            className="p-1.5 text-slate-500 hover:text-sky-600 rounded-lg border border-slate-200 hover:bg-slate-50"
            title="Refresh applications"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Applications Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-2"></div>
            Loading faculty approval queue...
          </div>
        ) : displayedApps.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              {activeTab === 'pending'
                ? 'All caught up! No applications currently awaiting faculty action.'
                : 'No applications found matching criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">App ID</th>
                  <th className="px-5 py-3">Student Details</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Reason / Details</th>
                  <th className="px-5 py-3">Dates</th>
                  <th className="px-5 py-3">Status & Remarks</th>
                  <th className="px-5 py-3 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedApps.map((app) => {
                  const isActionable = isPendingFaculty(app.status);

                  return (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3.5 font-mono font-semibold text-slate-800">
                        {app.applicationId}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-sky-600" />
                          {app.studentName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {app.regNo} • {app.year}-{app.section}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-700">
                        {app.requestType}
                      </td>
                      <td className="px-5 py-3.5 max-w-xs">
                        <div className="truncate font-medium text-slate-800">{app.reason}</div>
                        {app.eventDetails?.eventName && (
                          <div className="text-[10px] text-sky-600 truncate">
                            Event: {app.eventDetails.eventName}
                          </div>
                        )}
                        {app.rejectionRemarks && (
                          <div className="text-[10px] text-rose-600 font-semibold truncate mt-0.5">
                            Rejection Note: {app.rejectionRemarks}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>
                            {new Date(app.startDate).toLocaleDateString()} ({app.totalDays}d)
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={app.status} />
                        {app.facultyApproval?.remarks && (
                          <div className="text-[10px] text-slate-500 truncate mt-1">
                            "{app.facultyApproval.remarks}"
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => onOpenApplicationModal(app._id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold inline-flex items-center gap-1 transition"
                            title="View Full Details & Timeline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Details
                          </button>

                          {isActionable && (
                            <>
                              {/* 1. APPROVE */}
                              <button
                                onClick={() => handleActionClick(app, 'APPROVE')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition shadow-sm"
                                title="Approve & Endorse Application"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Approve
                              </button>

                              {/* 2. FORWARD */}
                              <button
                                onClick={() => handleActionClick(app, 'FORWARD')}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition shadow-sm"
                                title="Forward to HOD with Remarks"
                              >
                                <Send className="w-3.5 h-3.5" />
                                Forward
                              </button>

                              {/* 3. REQUEST INFO */}
                              <button
                                onClick={() => handleActionClick(app, 'REQUEST_INFO')}
                                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition shadow-sm"
                                title="Request Additional Clarification from Student"
                              >
                                <HelpCircle className="w-3.5 h-3.5" />
                                Info
                              </button>

                              {/* 4. REJECT */}
                              <button
                                onClick={() => handleActionClick(app, 'REJECT')}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition shadow-sm"
                                title="Reject Application (Mandatory Reason)"
                              >
                                <X className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Functional 4-Action Modal */}
      <ActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        onSubmit={handleActionSubmit}
        application={selectedApp}
        actionType={actionType}
      />
    </div>
  );
};

export default FacultyDashboard;
