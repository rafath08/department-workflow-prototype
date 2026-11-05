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
  Calendar,
  User,
  Filter,
  Search
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

  // Modal State for Approve/Reject Action
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionType, setActionType] = useState('APPROVE'); // 'APPROVE' | 'REJECT'
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

  const handleActionSubmit = async ({ remarks }) => {
    if (!selectedApp) return;
    const endpoint = actionType === 'APPROVE' ? 'approve' : 'reject';
    await api.put(`/applications/${selectedApp._id}/${endpoint}`, { remarks });
    // Refresh list
    await fetchApplications();
  };

  const pendingApps = applications.filter((a) => a.status === 'PENDING_FACULTY');
  const completedApps = applications.filter((a) => a.status !== 'PENDING_FACULTY');

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
      <div className="bg-gradient-to-r from-blue-800 via-sky-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-blue-200">
            Faculty / Mentor Approval Console
          </span>
          <h2 className="text-2xl font-bold mt-1">Welcome, {user?.name}</h2>
          <p className="text-xs text-sky-100 mt-1">
            Review, recommend, or reject student permission requests assigned under your mentorship.
          </p>
          <div className="mt-2 text-xs text-blue-200">
            Department: <strong className="text-white">{user?.department}</strong>
          </div>
        </div>

        {/* Quick count badge */}
        <div className="bg-white/10 backdrop-blur px-5 py-3 rounded-xl border border-white/20 text-center shrink-0">
          <div className="text-2xl font-black text-amber-300">{pendingApps.length}</div>
          <div className="text-[11px] text-white/90 font-medium">Pending Your Review</div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Awaiting Action</span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{pendingApps.length}</div>
            <span className="text-[11px] text-slate-400">Action required</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Recommended / Forwarded</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {applications.filter((a) => a.facultyApproval?.status === 'APPROVED').length}
            </div>
            <span className="text-[11px] text-slate-400">Passed to HOD</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Assigned</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">{applications.length}</div>
            <span className="text-[11px] text-slate-400">Lifetime mentees</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Review Console */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation Tabs & Search Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === 'pending'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending Reviews ({pendingApps.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === 'completed'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Processed Records ({completedApps.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === 'all'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({applications.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student, reg no, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            />
          </div>
        </div>

        {/* Requests Table */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading student applications...</div>
        ) : displayedApps.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-xs text-slate-600 font-medium">
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
                  <th className="px-5 py-3">Reason / Event</th>
                  <th className="px-5 py-3">Dates</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedApps.map((app) => (
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
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => onOpenApplicationModal(app._id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold inline-flex items-center gap-1 transition"
                        title="View Full Details & Timeline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>

                      {app.status === 'PENDING_FACULTY' && (
                        <>
                          <button
                            onClick={() => handleActionClick(app, 'APPROVE')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition shadow-sm"
                            title="Approve and Forward to HOD"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Recommend
                          </button>
                          <button
                            onClick={() => handleActionClick(app, 'REJECT')}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition shadow-sm"
                            title="Reject Application"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal for Faculty Approval / Rejection */}
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
