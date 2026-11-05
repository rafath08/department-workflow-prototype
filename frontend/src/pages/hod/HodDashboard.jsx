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
  Calendar,
  User,
  Search,
  Building
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

  // Modal State for Approve/Reject Action
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

  const handleActionSubmit = async ({ remarks }) => {
    if (!selectedApp) return;
    const endpoint = actionType === 'APPROVE' ? 'approve' : 'reject';
    await api.put(`/applications/${selectedApp._id}/${endpoint}`, { remarks });
    // Refresh queue
    await fetchApplications();
  };

  const pendingApps = applications.filter((a) => a.status === 'PENDING_HOD');
  const completedApps = applications.filter((a) => a.status === 'APPROVED' || a.status === 'REJECTED');
  const awaitingFacultyApps = applications.filter((a) => a.status === 'PENDING_FACULTY');

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
            Head of Department (HOD) Authority
          </span>
          <h2 className="text-2xl font-bold mt-1">Welcome, {user?.name}</h2>
          <p className="text-xs text-purple-100 mt-1">
            Departmental Sanction Console for student OD, Leave, and Event permission requests.
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-purple-200">
            <Building className="w-3.5 h-3.5" />
            <span>Department: <strong className="text-white">{user?.department}</strong></span>
          </div>
        </div>

        {/* Action badge */}
        <div className="bg-white/10 backdrop-blur px-5 py-3 rounded-xl border border-white/20 text-center shrink-0">
          <div className="text-2xl font-black text-amber-300">{pendingApps.length}</div>
          <div className="text-[11px] text-white/90 font-medium">Forwarded Awaiting HOD</div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Forwarded to HOD</span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{pendingApps.length}</div>
            <span className="text-[11px] text-slate-400">Needs final sanction</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Approved by Dept</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {applications.filter((a) => a.status === 'APPROVED').length}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">Sanctions granted</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">With Faculty</span>
            <div className="text-2xl font-extrabold text-sky-600 mt-1">{awaitingFacultyApps.length}</div>
            <span className="text-[11px] text-slate-400">Under mentor review</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Department</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">{applications.length}</div>
            <span className="text-[11px] text-slate-400">All submissions</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Department Review Console */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation Tabs & Search Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === 'pending'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Forwarded Queue ({pendingApps.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === 'completed'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed Decisions ({completedApps.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === 'all'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Department ({applications.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student, reg no, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>
        </div>

        {/* Queue Table */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading department queue...</div>
        ) : displayedApps.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Award className="w-8 h-8 text-purple-400 mx-auto" />
            <p className="text-xs text-slate-600 font-medium">
              {activeTab === 'pending'
                ? 'No requests currently pending HOD sanction in your department queue.'
                : 'No department applications found matching criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">App ID</th>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Reason / Details</th>
                  <th className="px-5 py-3">Faculty Endorsement</th>
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
                      <div className="text-[10px] text-slate-400">
                        {new Date(app.startDate).toLocaleDateString()} to {new Date(app.endDate).toLocaleDateString()} ({app.totalDays}d)
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {app.facultyApproval?.status === 'APPROVED' ? (
                        <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Recommended by <strong className="font-semibold">{app.assignedFaculty?.name || 'Faculty'}</strong>
                          {app.facultyApproval?.remarks && (
                            <div className="text-[10px] italic text-slate-600 truncate max-w-[180px]">
                              "{app.facultyApproval.remarks}"
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">Awaiting Faculty</span>
                      )}
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

                      {app.status === 'PENDING_HOD' && (
                        <>
                          <button
                            onClick={() => handleActionClick(app, 'APPROVE')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition shadow-sm"
                            title="Grant Final Department Sanction"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Sanction
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

      {/* Action Modal for HOD Approval / Rejection */}
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
