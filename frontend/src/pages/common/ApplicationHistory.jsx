import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Filter,
  Download,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  RotateCcw
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../services/api';

export const ApplicationHistory = ({ onOpenApplicationModal }) => {
  const { user } = useAuth();
  const role = user?.role;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });

  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [requestType, setRequestType] = useState('ALL');
  const [department, setDepartment] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchHistory = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10
      });

      if (status !== 'ALL') params.append('status', status);
      if (requestType !== 'ALL') params.append('requestType', requestType);
      if (department !== 'ALL' && role === 'admin') params.append('department', department);
      if (search.trim()) params.append('search', search.trim());
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`/applications/history?${params.toString()}`);
      if (res.data.success) {
        setApplications(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Fetch history error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, [status, requestType, department]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('ALL');
    setRequestType('ALL');
    setDepartment('ALL');
    setStartDate('');
    setEndDate('');
    setTimeout(() => fetchHistory(1), 0);
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (status !== 'ALL') params.append('status', status);
    if (requestType !== 'ALL') params.append('requestType', requestType);
    if (department !== 'ALL') params.append('department', department);
    window.open(`/api/admin/export?${params.toString()}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {role === 'student'
              ? 'My Application Records'
              : role === 'faculty'
              ? 'Mentee Approval History'
              : role === 'hod'
              ? 'Department Permission Archives'
              : 'Institutional Application Archive'}
          </h2>
          <p className="text-xs text-slate-500">
            Comprehensive audit logs, multi-stage approval tracking, and historical records.
          </p>
        </div>

        {(role === 'admin' || role === 'hod') && (
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow transition flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-4 h-4" />
            Export Filtered CSV
          </button>
        )}
      </div>

      {/* Filter and Search Console */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3.5 text-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by student name, reg no, application ID, or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="w-full sm:w-auto px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center justify-center gap-1 transition"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_FACULTY">Pending Faculty</option>
              <option value="PENDING_HOD">Pending HOD</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Request Category</label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="ALL">All Categories</option>
              <option value="On-Duty">On-Duty (OD)</option>
              <option value="Leave">Leave Request</option>
              <option value="Event Participation">Event Participation</option>
              <option value="Other Permission">Other Permission</option>
            </select>
          </div>

          {role === 'admin' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="ALL">All Departments</option>
                <option value="Computer Science & Engineering">CSE</option>
                <option value="Electronics & Communication">ECE</option>
                <option value="Information Technology">IT</option>
                <option value="Mechanical Engineering">MECH</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Date From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Date To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading historical records...</div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No applications found matching query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">App ID</th>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-800">
                      {app.applicationId}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-sky-600" />
                        {app.studentName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {app.regNo} • {app.year}-{app.section}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {app.department}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">
                      <div>{app.requestType}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{app.reason}</div>
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

        {/* Pagination Bar */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Showing <strong className="text-slate-800">{applications.length}</strong> of{' '}
            <strong className="text-slate-800">{pagination.total}</strong> records
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchHistory(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-slate-600">
              Page {pagination.page} of {pagination.pages || 1}
            </span>
            <button
              onClick={() => fetchHistory(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationHistory;
