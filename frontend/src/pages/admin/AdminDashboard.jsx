import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  Shield,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  Users,
  Settings,
  ArrowRight,
  Eye,
  RefreshCw
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../services/api';

const COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const AdminDashboard = ({ onOpenApplicationModal }) => {
  const [data, setData] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsRes, appsRes] = await Promise.all([
        api.get('/admin/reports'),
        api.get('/applications?limit=6')
      ]);

      if (reportsRes.data.success) {
        setData(reportsRes.data.data);
      }
      if (appsRes.data.success) {
        setRecentApps(appsRes.data.data.slice(0, 6));
      }
    } catch (err) {
      console.error('Fetch admin dashboard reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const summary = data?.summary || {
    total: 0,
    pendingFaculty: 0,
    pendingHod: 0,
    pendingTotal: 0,
    approved: 0,
    rejected: 0
  };

  const handleExportCsv = () => {
    window.open('/api/admin/export', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-sky-400">
            Institutional Administration
          </span>
          <h2 className="text-2xl font-bold mt-1">College Workflow Command Center</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time analytics, institutional audit trails, dynamic approval rule configurations, and student permission statistics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchData}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 transition border border-white/10"
            title="Refresh analytics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Six Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Requests
          </span>
          <div className="text-2xl font-extrabold text-slate-800 mt-1.5">{summary.total}</div>
          <span className="text-[10px] text-slate-400">Institutional total</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Pending Faculty
          </span>
          <div className="text-2xl font-extrabold text-sky-600 mt-1.5">{summary.pendingFaculty}</div>
          <span className="text-[10px] text-sky-600 font-medium">Awaiting mentor</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Pending HOD
          </span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1.5">{summary.pendingHod}</div>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting sanction</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total In Review
          </span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1.5">{summary.pendingTotal}</div>
          <span className="text-[10px] text-slate-400">Active workflows</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Approved
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1.5">{summary.approved}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Fully granted</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Rejected
          </span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1.5">{summary.rejected}</div>
          <span className="text-[10px] text-rose-600 font-medium">Not sanctioned</span>
        </div>
      </div>

      {/* Recharts Analytical Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Applications by Request Type */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Applications by Request Category</h3>
              <p className="text-xs text-slate-400">Distribution across OD, Leave, and Events</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.byRequestType || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Trends */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Application Velocity & Trends</h3>
            <p className="text-xs text-slate-400">Total, approved, and rejected volumes over time</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data?.monthlyTrends || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#0ea5e9"
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  name="Total Applications"
                />
                <Area
                  type="monotone"
                  dataKey="approved"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorApproved)"
                  name="Approved"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Department-wise Application Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Department-wise Breakdown</h3>
            <p className="text-xs text-slate-400">Total requests submitted across academic branches</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.byDepartment || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="approved" stackId="a" fill="#10b981" name="Approved" />
                <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                <Bar dataKey="rejected" stackId="a" fill="#ef4444" name="Rejected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Approval vs Rejection Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Status Ratio Analysis</h3>
            <p className="text-xs text-slate-400">Proportion of outcomes across all student requests</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.approvalStats || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(data?.approvalStats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Institutional Recent Applications Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Recent Institutional Requests</h3>
            <p className="text-xs text-slate-500">Live feed across all college departments</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
          >
            Complete Archive & Filters
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading applications...</div>
        ) : recentApps.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No applications recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">App ID</th>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApps.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-800">
                      {app.applicationId}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800">{app.studentName}</div>
                      <div className="text-[11px] text-slate-400">{app.regNo}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {app.department}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">
                      {app.requestType}
                    </td>
                    <td className="px-5 py-3.5 max-w-xs truncate text-slate-600">
                      {app.reason}
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
                        Inspect
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

export default AdminDashboard;
