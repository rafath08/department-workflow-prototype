import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Eye,
  Check,
  X,
  Send,
  HelpCircle,
  Calendar,
  User,
  Search,
  Building,
  RefreshCw
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import ActionModal from '../../components/modals/ActionModal';
import api from '../../services/api';

export const HodDashboard = ({ onOpenApplicationModal }) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'completed' | 'all'
  const [search, setSearch] = useState('');

  // Modal State for Action
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionType, setActionType] = useState('APPROVE');
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/applications');
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error('Fetch HOD applications error:', err);
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
        targetRole: payload.targetRole || 'admin',
        remarks: payload.remarks
      });
    } else if (actionType === 'REQUEST_INFO') {
      await api.put(`/applications/${selectedApp._id}/request-info`, { query: payload.query });
    }

    await fetchApplications();
  };

  const isPendingHod = (status) => {
    const s = (status || '').toUpperCase();
    return (
      s === 'PENDING HOD APPROVAL' ||
      s === 'FORWARDED TO HOD' ||
      s === 'PENDING_HOD' ||
      s === 'FORWARDED_TO_HOD' ||
      s === 'FACULTY APPROVED'
    );
  };

  const pendingApps = applications.filter((a) => isPendingHod(a.status));
  const completedApps = applications.filter((a) => !isPendingHod(a.status));

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
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-purple-200">
            Head of Department (HOD) Sanction Console
          </span>
          <h2 className="text-2xl font-bold mt-1">Welcome, {user?.name}</h2>
          <p className="text-xs text-purple-100 mt-1 max-w-xl">
            Departmental Sanction Authority for student On-Duty, Leave, and Event permission requests. Review faculty endorsements and issue final departmental sanctions.
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-purple-200">
            <Building className="w-3.5 h-3.5" />
            <span>Department: <strong className="text-white">{user?.department}</strong></span>
          </div>
        </div>

        {/* Quick count badge */}
        <div className="bg-white/10 backdrop-blur px-5 py-3 rounded-xl border border-white/20 text-center shrink-0">
          <div className="text-2xl font-black text-amber-300">{pendingApps.length}</div>
          <span className="text-[11px] text-slate-200 font-medium">Pending HOD Review</span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Awaiting HOD ({pendingApps.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'completed'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Department History ({completedApps.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Requests ({applications.length})
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student, reg no, ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={fetchApplications}
            className="p-1.5 text-slate-500 hover:text-purple-600 rounded-lg border border-slate-200 hover:bg-slate-50"
            title="Refresh queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            Loading HOD sanction queue...
          </div>
        ) : displayedApps.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Award className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              {activeTab === 'pending'
                ? 'Queue clear! No applications awaiting HOD sanction.'
                : 'No department applications found matching criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">App ID</th>
                  <th className="px-5 py-3">Student Details</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Reason / Justification</th>
                  <th className="px-5 py-3">Mentor Remarks</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Sanction Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedApps.map((app) => {
                  const isActionable = isPendingHod(app.status);

                  return (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3.5 font-mono font-semibold text-slate-800">
                        {app.applicationId}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-purple-600" />
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
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(app.startDate).toLocaleDateString()} ({app.totalDays}d)
                        </div>
                        {app.rejectionRemarks && (
                          <div className="text-[10px] text-rose-600 font-semibold truncate mt-0.5">
                            Rejection Note: {app.rejectionRemarks}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 max-w-xs">
                        <span className="font-medium text-slate-700 block">
                          {app.assignedFaculty?.name || 'Mentor'}
                        </span>
                        {app.facultyApproval?.remarks ? (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 truncate inline-block mt-0.5">
                            "{app.facultyApproval.remarks}"
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No notes</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => onOpenApplicationModal(app._id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold inline-flex items-center gap-1 transition"
                            title="View Full Details & Audit Trail"
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
                                title="Approve & Grant Final Department Sanction"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Approve
                              </button>

                              {/* 2. FORWARD */}
                              <button
                                onClick={() => handleActionClick(app, 'FORWARD')}
                                className="px-2 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition shadow-sm"
                                title="Forward to Principal / Admin"
                              >
                                <Send className="w-3.5 h-3.5" />
                                Forward
                              </button>

                              {/* 3. REQUEST INFO */}
                              <button
                                onClick={() => handleActionClick(app, 'REQUEST_INFO')}
                                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition shadow-sm"
                                title="Request Additional Clarification"
                              >
                                <HelpCircle className="w-3.5 h-3.5" />
                                Info
                              </button>

                              {/* 4. REJECT */}
                              <button
                                onClick={() => handleActionClick(app, 'REJECT')}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition shadow-sm"
                                title="Reject Application (Mandatory Grounds)"
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

      {/* 4-Action Modal */}
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

export default HodDashboard;
