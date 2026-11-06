import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Search,
  FileCheck,
  Check,
  AlertCircle
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../services/api';

export const AttendanceVerification = () => {
  const [odApplications, setOdApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');

  useEffect(() => {
    const fetchOD = async () => {
      try {
        setLoading(true);
        // Query approved and pending OD requests
        const res = await api.get('/applications?requestType=On-Duty');
        if (res.data.success) {
          setOdApplications(res.data.data);
        }
      } catch (err) {
        console.error('Fetch OD applications error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOD();
  }, []);

  const filtered = odApplications.filter((app) => {
    const matchesSearch =
      app.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      app.regNo?.toLowerCase().includes(search.toLowerCase()) ||
      app.eventDetails?.eventName?.toLowerCase().includes(search.toLowerCase());
    const matchesClass =
      selectedClass === 'ALL' || `${app.year}-${app.section}` === selectedClass;
    return matchesSearch && matchesClass;
  });

  const sanctionedCount = odApplications.filter(
    (a) => a.status === 'Approved' || a.status === 'APPROVED'
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
        <span className="text-xs uppercase tracking-wider font-semibold text-sky-300">
          Faculty Portal • Attendance Services
        </span>
        <h2 className="text-2xl font-bold mt-1">Attendance & On-Duty (OD) Verification</h2>
        <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed">
          Verify and sanction student participation in inter-college symposiums, hackathons, and sports tournaments. Automatically compute authorized absence days for official attendance register reconciliation.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">
          <div className="bg-white/10 backdrop-blur p-3.5 rounded-xl border border-white/10">
            <span className="text-[11px] text-slate-300 uppercase font-semibold">Total OD Claims</span>
            <div className="text-2xl font-extrabold text-white mt-1">{odApplications.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur p-3.5 rounded-xl border border-white/10">
            <span className="text-[11px] text-slate-300 uppercase font-semibold">Officially Sanctioned</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{sanctionedCount}</div>
          </div>
          <div className="bg-white/10 backdrop-blur p-3.5 rounded-xl border border-white/10">
            <span className="text-[11px] text-slate-300 uppercase font-semibold">In Review</span>
            <div className="text-2xl font-extrabold text-amber-300 mt-1">
              {odApplications.length - sanctionedCount}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, reg no, or event name..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-500 font-medium">Filter Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          >
            <option value="ALL">All Classes</option>
            <option value="III-A">III - A</option>
            <option value="III-B">III - B</option>
            <option value="IV-A">IV - A</option>
            <option value="IV-B">IV - B</option>
          </select>
        </div>
      </div>

      {/* OD Register Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading OD registers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Award className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No On-Duty applications match your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Event Details</th>
                  <th className="px-5 py-3">Institution / Location</th>
                  <th className="px-5 py-3">OD Dates</th>
                  <th className="px-5 py-3">Attendance Credit</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-sky-600" />
                        {item.studentName}
                      </div>
                      <div className="text-[11px] text-slate-500">{item.regNo}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">
                      {item.year} - {item.section}
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="font-semibold text-slate-800 truncate">
                        {item.eventDetails?.eventName || item.reason}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 truncate max-w-xs">
                      {item.eventDetails?.organizingInstitution || 'External'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(item.startDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-sky-800">
                      {item.totalDays} Day{item.totalDays > 1 ? 's' : ''} (OD)
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={item.status} />
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

export default AttendanceVerification;
