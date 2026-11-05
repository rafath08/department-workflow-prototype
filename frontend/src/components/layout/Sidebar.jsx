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
  HelpCircle
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
      isActive
        ? 'bg-sky-50 text-sky-700 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-65px)] flex flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Navigation Group */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
            Main Menu
          </span>
          <nav className="space-y-1">
            <NavLink to="/dashboard" className={navLinkClass}>
              {role === 'admin' ? (
                <BarChart3 className="w-4 h-4 text-sky-600" />
              ) : (
                <LayoutDashboard className="w-4 h-4 text-sky-600" />
              )}
              <span>{role === 'faculty' || role === 'hod' ? 'Approval Queue' : 'Dashboard'}</span>
            </NavLink>

            {role === 'student' && (
              <NavLink to="/submit-request" className={navLinkClass}>
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Submit Permission</span>
              </NavLink>
            )}

            <NavLink to="/history" className={navLinkClass}>
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>
                {role === 'student'
                  ? 'My Applications'
                  : role === 'admin'
                  ? 'Application Archives'
                  : 'History & Logs'}
              </span>
            </NavLink>
          </nav>
        </div>

        {/* Administration Links */}
        {role === 'admin' && (
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
              Administration
            </span>
            <nav className="space-y-1">
              <NavLink to="/admin/users" className={navLinkClass}>
                <Users className="w-4 h-4 text-purple-600" />
                <span>User Accounts</span>
              </NavLink>
              <NavLink to="/admin/workflow" className={navLinkClass}>
                <Settings className="w-4 h-4 text-amber-600" />
                <span>Workflow Config</span>
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* College Info & Demo Helper Footer */}
      <div className="pt-4 border-t border-slate-100">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div className="font-semibold text-slate-700 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
            Active Role
          </div>
          <p className="text-slate-500 mt-1 capitalize">
            Logged in as <span className="font-semibold text-slate-800">{user?.role}</span>
          </p>
          <div className="mt-1 text-[11px] text-slate-400 truncate">
            Dept: {user?.department || 'Institution'}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
