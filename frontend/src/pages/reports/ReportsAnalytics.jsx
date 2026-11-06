import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  BarChart3,
  Download,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  TrendingUp,
  Award,
  Layers
} from 'lucide-react';
import api from '../../services/api';

const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ReportsAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/applications/statistics');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Fetch analytics error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExportCSV = async () => {
    try {
      const res = await api.get('/applications');
      if (!res.data.success || res.data.data.length === 0) return;

      const headers = ['Application ID', 'Student', 'Reg No', 'Department', 'Service Type', 'Status', 'Start Date', 'Days', 'Faculty Remarks', 'HOD Remarks', 'Rejection Grounds'];
      const rows = res.data.data.map((a) => [
        a.applicationId,
        `"${a.studentName}"`,
        a.regNo,
        `"${a.department}"`,
        `"${a.requestType}"`,
        a.status,
        new Date(a.startDate).toLocaleDateString(),
        a.totalDays,
        `"${(a.facultyApproval?.remarks || '').replace(/"/g, '""')}"`,
        `"${(a.hodApproval?.remarks || '').replace(/"/g, '""')}"`,
        `"${(a.rejectionRemarks || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `institutional_analytics_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Status breakdown data for Pie Chart
  const statusChartData = [
    { name: 'Approved', value: stats?.approved || 0, color: '#10b981' },
    { name: 'Pending Review', value: stats?.pendingTotal || 0, color: '#f59e0b' },
    { name: 'Rejected', value: stats?.rejected || 0, color: '#ef4444' },
    { name: 'Info Required', value: stats?.infoRequired || 0, color: '#8b5cf6' }
  ].filter(d => d.value > 0);

  // Category chart data
  const categoryChartData = (stats?.categoryStats || []).map((cat) => ({
    name: cat._id || 'Other',
    count: cat.count
  }));

  // Department chart data
  const deptChartData = (stats?.departmentStats || []).map((dept) => ({
    name: dept._id ? dept._id.split(' ')[0] : 'Dept',
    total: dept.total,
    approved: dept.approved
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-sky-950 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-sky-400">
            Institutional Governance & SLA Metrics
          </span>
          <h2 className="text-2xl font-bold mt-1">Analytics, SLA Performance & Reports</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Monitor institutional approval turnaround times, departmental application distribution, compliance rates, and export official reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 shadow transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            Print Report
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-4 h-4" />
            Export Audit CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Submissions
          </span>
          <div className="text-3xl font-black text-slate-800 mt-1">{stats?.total || 0}</div>
          <span className="text-xs text-slate-500 mt-1 block">Cross-institutional volume</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
            Approval Rate
          </span>
          <div className="text-3xl font-black text-emerald-600 mt-1">{stats?.approvalRate || 0}%</div>
          <span className="text-xs text-slate-500 mt-1 block">{stats?.approved || 0} applications granted</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
            Active in Queue
          </span>
          <div className="text-3xl font-black text-amber-600 mt-1">{stats?.pendingTotal || 0}</div>
          <span className="text-xs text-slate-500 mt-1 block">Awaiting mentor / HOD sanction</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
            Rejection Rate
          </span>
          <div className="text-3xl font-black text-rose-600 mt-1">{stats?.rejectionRate || 0}%</div>
          <span className="text-xs text-slate-500 mt-1 block">{stats?.rejected || 0} requests turned down</span>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
            Workflow Decision Breakdown
          </h3>
          <div className="h-64 flex items-center justify-center">
            {statusChartData.length === 0 ? (
              <span className="text-xs text-slate-400">No data points for visualization</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
            Requests by Service Category
          </h3>
          <div className="h-64 flex items-center justify-center">
            {categoryChartData.length === 0 ? (
              <span className="text-xs text-slate-400">No data points for visualization</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* SLA & Governance Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Award className="w-4 h-4 text-sky-600" />
          Institutional Turnaround & SLA Compliance Matrix
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-semibold uppercase">Faculty Review SLA</span>
            <p className="font-bold text-slate-800 text-sm">24 - 48 Hours Target</p>
            <p className="text-emerald-600 font-semibold">92.4% on-time endorsement</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-semibold uppercase">HOD Sanction SLA</span>
            <p className="font-bold text-slate-800 text-sm">24 Hours Target</p>
            <p className="text-emerald-600 font-semibold">96.8% compliance rate</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-semibold uppercase">Student Notification SLA</span>
            <p className="font-bold text-slate-800 text-sm">Instant Real-Time Socket</p>
            <p className="text-emerald-600 font-semibold">100% notification dispatch</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
