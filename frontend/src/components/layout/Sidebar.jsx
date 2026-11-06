import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  Clock,
  CheckSquare,
  Users,
  Settings,
  Archive,
  BarChart3,
  HelpCircle,
  Search,
  Sparkles,
  Award,
  UserCheck,
  Building,
  Calendar,
  Layers,
  FileText,
  ShieldAlert,
  Send
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
      isActive
        ? 'bg-sky-50 text-sky-700 font-bold border border-sky-100 shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-65px)] flex flex-col justify-between p-4 shrink-0 overflow-y-auto">
      <div className="space-y-5">
        {/* Module A & B: Core Navigation */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-1.5">
            Main Console
          </span>
          <nav className="space-y-1">
            <NavLink to="/dashboard" className={navLinkClass}>
              {role === 'admin' ? (
                <BarChart3 className="w-4 h-4 text-sky-600 shrink-0" />
              ) : role === 'faculty' || role === 'hod' ? (
                <CheckSquare className="w-4 h-4 text-sky-600 shrink-0" />
              ) : (
                <LayoutDashboard className="w-4 h-4 text-sky-600 shrink-0" />
              )}
              <span>
                {role === 'faculty'
                  ? 'Faculty Approval Queue'
                  : role === 'hod'
                  ? 'HOD Sanction Panel'
                  : role === 'admin'
                  ? 'Executive Dashboard'
                  : 'Student Dashboard'}
              </span>
            </NavLink>

            {/* Application Tracking for Students & Faculty */}
            <NavLink to="/tracking" className={navLinkClass}>
              <Search className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Live Application Tracking</span>
            </NavLink>
          </nav>
        </div>

        {/* Module D: Student Services (Students and Admins) */}
        {(role === 'student' || role === 'admin') && (
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-1.5">
              Student Services
            </span>
            <nav className="space-y-1">
              <NavLink to="/student-services" className={navLinkClass}>
                <Sparkles className="w-4 h-4 text-pink-600 shrink-0" />
                <span>Services Hub (10 Types)</span>
              </NavLink>

              <NavLink to="/submit-request" className={navLinkClass}>
                <PlusCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Submit Application</span>
              </NavLink>
            </nav>
          </div>
        )}

        {/* Module E: Faculty Portal (Faculty, HOD, and Admins) */}
        {(role === 'faculty' || role === 'hod' || role === 'admin') && (
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-1.5">
              Faculty Services
            </span>
            <nav className="space-y-1">
              <NavLink to="/faculty/attendance" className={navLinkClass}>
                <Award className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Attendance & OD Verification</span>
              </NavLink>

              <NavLink to="/faculty/mentorship" className={navLinkClass}>
                <UserCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Mentorship Records</span>
              </NavLink>
            </nav>
          </div>
        )}

        {/* Module F & I: Department & Calendar (All Roles) */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-1.5">
            Department & Events
          </span>
          <nav className="space-y-1">
            <NavLink to="/department" className={navLinkClass}>
              <Building className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Department Notices & Profile</span>
            </NavLink>

            <NavLink to="/calendar" className={navLinkClass}>
              <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Event & OD Calendar</span>
            </NavLink>
          </nav>
        </div>

        {/* Module H: History & Reports (All Roles) */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-1.5">
            Audit & Intelligence
          </span>
          <nav className="space-y-1">
            <NavLink to="/history" className={navLinkClass}>
              <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                {role === 'student'
                  ? 'My Application Records'
                  : 'Application Archives & Logs'}
              </span>
            </NavLink>

            {(role === 'faculty' || role === 'hod' || role === 'admin') && (
              <NavLink to="/reports" className={navLinkClass}>
                <BarChart3 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Analytics & SLA Reports</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* Module J: User & Role Management (Admin only) */}
        {role === 'admin' && (
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-1.5">
              Administration
            </span>
            <nav className="space-y-1">
              <NavLink to="/admin/users" className={navLinkClass}>
                <Users className="w-4 h-4 text-purple-600 shrink-0" />
                <span>User & Role Accounts</span>
              </NavLink>
              <NavLink to="/admin/workflow" className={navLinkClass}>
                <Settings className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Workflow Rules Config</span>
              </NavLink>
            </nav>
          </div>
        )}

        {/* Module K: Settings (All Roles) */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-1.5">
            Preferences
          </span>
          <nav className="space-y-1">
            <NavLink to="/settings" className={navLinkClass}>
              <Settings className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Account & Settings</span>
            </NavLink>
          </nav>
        </div>
      </div>

      {/* College Info & Active Role Footer */}
      <div className="pt-4 border-t border-slate-100 mt-6">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div className="font-bold text-slate-700 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
            <span>Active Session</span>
          </div>
          <p className="text-slate-600 mt-1 capitalize font-medium">
            Role: <span className="font-bold text-slate-900">{user?.role}</span>
          </p>
          <div className="mt-0.5 text-[11px] text-slate-400 truncate">
            {user?.department || 'Institution'}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
