import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PlusCircle, Clock, CheckCircle2, XCircle, FileText, ArrowRight, Eye, Calendar } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../services/api';

export const StudentDashboard = ({ onOpenApplicationModal }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pendingFaculty: 0,
    pendingHod: 0,
    pendingTotal: 0,
    approved: 0,
    rejected: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, appsRes] = await Promise.all([
          api.get('/applications/statistics'),
          api.get('/applications?limit=6')
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
        if (appsRes.data.success) {
          setRecentApplications(appsRes.data.data.slice(0, 6));
        }
      } catch (err) {
        console.error('Fetch student dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-indigo-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-sky-200">
            Student Portal
          </span>
          <h2 className="text-2xl font-bold mt-1">Welcome back, {user?.name}!</h2>
          <p className="text-xs text-sky-100 mt-1 max-w-xl">
            Track permission requests, apply for On-Duty (OD), medical/personal leave, or event participation with real-time multi-level approval status.
          </p>
          <div className="flex items-center gap-3 mt-3 text-xs text-sky-200">
            <span>Reg No: <strong className="text-white">{user?.regNo || 'N/A'}</strong></span>
            <span>•</span>
            <span>Class: <strong className="text-white">{user?.year} - {user?.section}</strong></span>
            <span>•</span>
            <span>Dept: <strong className="text-white">{user?.department}</strong></span>
          </div>
        </div>

        <Link
          to="/submit-request"
          className="px-5 py-2.5 bg-white text-sky-800 hover:bg-sky-50 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-sky-600" />
          Apply for Permission
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Submitted</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">{stats.total}</div>
          <span className="text-[11px] text-slate-400">All student requests</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">In Review</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-sky-600 mt-2">{stats.pendingTotal}</div>
          <span className="text-[11px] text-slate-400">
            {stats.pendingFaculty} faculty, {stats.pendingHod} HOD
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Approved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">{stats.approved}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Officially sanctioned</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Rejected</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 mt-2">{stats.rejected}</div>
          <span className="text-[11px] text-slate-400">Requires revision</span>
        </div>
      </div>

      {/* Recent Applications Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Recent Submitted Requests</h3>
            <p className="text-xs text-slate-500">Live approval progress across institutional levels</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
          >
            View Full History
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading requests...</div>
        ) : recentApplications.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">No applications submitted yet.</p>
            <Link
              to="/submit-request"
              className="inline-block mt-2 text-xs text-sky-600 font-bold hover:underline"
            >
              Submit your first permission request
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">App ID</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Reason / Details</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Assigned Faculty</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-800">
                      {app.applicationId}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">
                      {app.requestType}
                    </td>
                    <td className="px-5 py-3.5 max-w-xs truncate text-slate-600">
                      {app.reason}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>
                          {new Date(app.startDate).toLocaleDateString()} ({app.totalDays}d)
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {app.assignedFaculty?.name || 'Mentor'}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => onOpenApplicationModal(app._id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-700 rounded text-xs font-semibold inline-flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Track
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
