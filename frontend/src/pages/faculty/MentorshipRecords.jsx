import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  FileText,
  Search,
  CheckCircle,
  GraduationCap
} from 'lucide-react';
import api from '../../services/api';

export const MentorshipRecords = () => {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMentees = async () => {
      try {
        setLoading(true);
        // Fetch all students or applications to derive mentee roster
        const res = await api.get('/applications');
        if (res.data.success) {
          // Extract unique student profiles
          const map = new Map();
          res.data.data.forEach((app) => {
            if (app.student && !map.has(app.student._id)) {
              map.set(app.student._id, {
                ...app.student,
                studentName: app.studentName,
                regNo: app.regNo,
                department: app.department,
                year: app.year,
                section: app.section,
                lastAppId: app.applicationId,
                totalApps: 1
              });
            } else if (app.student && map.has(app.student._id)) {
              map.get(app.student._id).totalApps += 1;
            }
          });
          setMentees(Array.from(map.values()));
        }
      } catch (err) {
        console.error('Fetch mentorship error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentees();
  }, []);

  const filtered = mentees.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      m.regNo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
        <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
          Faculty Advisory • Mentorship Portal
        </span>
        <h2 className="text-2xl font-bold mt-1">Student Mentorship Records</h2>
        <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed">
          Maintain active academic oversight of your assigned student mentees. View individual request histories, track attendance endorsements, and coordinate counseling reviews.
        </p>

        <div className="flex items-center gap-4 mt-4 text-xs text-indigo-200">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>Assigned Mentees: <strong className="text-white">{mentees.length} Students</strong></span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mentee by name or register number..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Mentees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400">Loading mentee records...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400">
            No mentees currently registered under your advisory.
          </div>
        ) : (
          filtered.map((mentee) => (
            <div
              key={mentee._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-sm">
                    {mentee.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{mentee.name || mentee.studentName}</h3>
                    <span className="text-[11px] font-mono text-slate-500 block">{mentee.regNo}</span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Mentee
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-medium text-slate-700">{mentee.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Class & Section:</span>
                  <span className="font-medium text-slate-700">{mentee.year} - {mentee.section}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Applications:</span>
                  <span className="font-bold text-indigo-700">{mentee.totalApps} submitted</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {mentee.email || 'Email provided'}
                </span>
                <span className="font-mono text-slate-400">{mentee.lastAppId}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MentorshipRecords;
