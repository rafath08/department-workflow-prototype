import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Building,
  Users,
  GraduationCap,
  Megaphone,
  PlusCircle,
  Calendar,
  Layers,
  Trash2,
  Send,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';

export const DepartmentManagement = () => {
  const { user } = useAuth();
  const role = user?.role;
  const isAuthorized = role === 'hod' || role === 'admin';

  const [activeTab, setActiveTab] = useState('announcements'); // 'announcements' | 'info' | 'faculty' | 'classes'
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // New announcement form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [category, setCategory] = useState('General');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.error('Fetch announcements error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setSubmitting(true);
      setMsg('');
      const res = await api.post('/announcements', {
        title,
        content,
        priority,
        category,
        department: user?.department || 'Computer Science & Engineering'
      });

      if (res.data.success) {
        setTitle('');
        setContent('');
        setMsg('Announcement published to department bulletin!');
        await fetchAnnouncements();
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      await fetchAnnouncements();
    } catch (err) {
      console.error('Delete announcement error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-sky-400">
            Institutional Administration
          </span>
          <h2 className="text-2xl font-bold mt-1">Department Management & Notices</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Configure department structures, broadcast announcements, review faculty allocations, and organize academic sections.
          </p>
          <div className="flex items-center gap-3 mt-3 text-xs text-sky-300">
            <span className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5" />
              {user?.department || 'College of Engineering'}
            </span>
            <span>•</span>
            <span>Academic Year: 2025 - 2026</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur px-5 py-3 rounded-xl border border-white/10 text-center shrink-0">
          <span className="text-[11px] text-slate-300 block">Active Notices</span>
          <div className="text-2xl font-black text-sky-300">{announcements.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'announcements'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Department Notices & Announcements
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'info'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          Department Profile
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'classes'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Class & Section Matrix
        </button>
      </div>

      {/* TAB 1: Announcements */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Post Announcement Form (for Faculty / HOD / Admin) */}
          {(role === 'faculty' || role === 'hod' || role === 'admin') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 h-fit">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                <PlusCircle className="w-4 h-4 text-sky-600" />
                Broadcast Notice
              </h3>

              {msg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{msg}</span>
                </div>
              )}

              <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notice Headline *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Schedule for Continuous Internal Evaluation 2"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Important">Important</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="General">General</option>
                      <option value="Academic">Academic</option>
                      <option value="OD / Events">OD / Events</option>
                      <option value="Examination">Examination</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notice Details *</label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Detailed notice information for department students and faculty..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </form>
            </div>
          )}

          {/* Bulletin Feed */}
          <div className={`${role === 'student' ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-4`}>
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                Loading notice board...
              </div>
            ) : announcements.length === 0 ? (
              <div className="p-12 text-center space-y-2 bg-white rounded-2xl border border-slate-200">
                <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No active notices published at this moment.</p>
              </div>
            ) : (
              announcements.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            item.priority === 'Urgent'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : item.priority === 'Important'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}
                        >
                          {item.priority}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">{item.category}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mt-1.5">{item.title}</h4>
                    </div>

                    {isAuthorized && (
                      <button
                        onClick={() => handleDeleteAnnouncement(item._id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
                    {item.content}
                  </p>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Published by <strong className="text-slate-700">{item.authorName}</strong></span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Department Profile */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800">
              Department of {user?.department || 'Computer Science & Engineering'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Accredited under National Board of Accreditation (NBA) • Institutional Code: 1104
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-semibold text-slate-500 uppercase">Head of Department (HOD)</span>
              <p className="font-bold text-slate-800 text-sm">Dr. A. Sudhakar, Ph.D.</p>
              <p className="text-slate-500">hod.cse@institution.edu</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-semibold text-slate-500 uppercase">Student Enrolment</span>
              <p className="font-bold text-slate-800 text-sm">480 Registered Students</p>
              <p className="text-slate-500">Years I, II, III & IV (Sections A & B)</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-semibold text-slate-500 uppercase">Faculty Mentors</span>
              <p className="font-bold text-slate-800 text-sm">24 Full-Time Faculty</p>
              <p className="text-slate-500">Student-Faculty Ratio 20:1</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Class & Section Matrix */}
      {activeTab === 'classes' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Class & Section Advisory Matrix</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {[
              { year: 'I Year', sec: 'Section A & B', students: 120, mentor: 'Dr. Priya V.' },
              { year: 'II Year', sec: 'Section A & B', students: 120, mentor: 'Prof. Rajesh M.' },
              { year: 'III Year', sec: 'Section A & B', students: 120, mentor: 'Dr. Suresh Kumar' },
              { year: 'IV Year', sec: 'Section A & B', students: 120, mentor: 'Dr. Meenakshi S.' }
            ].map((cls, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-sky-800 text-sm block">{cls.year}</span>
                <span className="text-slate-600 block">{cls.sec}</span>
                <span className="text-slate-500 block">Class Advisor: <strong className="text-slate-700">{cls.mentor}</strong></span>
                <span className="text-[11px] text-slate-400 block">{cls.students} Enrolled Students</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
