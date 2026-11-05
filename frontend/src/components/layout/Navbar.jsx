import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Check, CheckCheck, LogOut, Shield, GraduationCap, Briefcase, Award } from 'lucide-react';
import api from '../../services/api';

export const Navbar = ({ onOpenApplicationModal }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <GraduationCap className="w-3.5 h-3.5" />
            Student
          </span>
        );
      case 'faculty':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Briefcase className="w-3.5 h-3.5" />
            Faculty Mentor
          </span>
        );
      case 'hod':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            <Award className="w-3.5 h-3.5" />
            Head of Department (HOD)
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Shield className="w-3.5 h-3.5" />
            Administrator
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-md font-bold text-lg">
            🏛️
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">
              Intelligent Department Workflow
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Institutional Automation & Multi-Level Approvals Agent
            </p>
          </div>
        </div>

        {/* Right Section: Role, Notifications, User, Logout */}
        <div className="flex items-center gap-4">
          {/* Role badge */}
          <div className="hidden sm:block">
            {getRoleBadge(user?.role)}
          </div>

          {/* In-app Notification Bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-sky-600 hover:text-sky-800 font-medium flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => {
                          if (item.applicationId && onOpenApplicationModal) {
                            onOpenApplicationModal(item.applicationId);
                          }
                        }}
                        className={`p-3.5 text-xs hover:bg-slate-50 cursor-pointer transition flex items-start gap-3 ${
                          !item.isRead ? 'bg-sky-50/40' : ''
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            !item.isRead ? 'bg-sky-500' : 'bg-transparent'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-slate-800">{item.title}</h5>
                            <span className="text-[10px] text-slate-400">
                              {new Date(item.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-0.5 leading-snug">{item.message}</p>
                          {item.applicationId && (
                            <span className="inline-block mt-1 font-mono text-[10px] text-sky-700 bg-sky-100/60 px-1.5 py-0.5 rounded">
                              {item.applicationId}
                            </span>
                          )}
                        </div>
                        {!item.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(item._id, e)}
                            title="Mark as read"
                            className="text-slate-400 hover:text-sky-600 p-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile info */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
              {user?.name ? user.name.slice(0, 2) : 'U'}
            </div>
            <div className="hidden md:block text-left text-xs">
              <div className="font-semibold text-slate-800">{user?.name}</div>
              <div className="text-slate-400 truncate max-w-[140px]">{user?.email}</div>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
