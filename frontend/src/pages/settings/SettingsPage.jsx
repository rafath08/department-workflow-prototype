import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Lock,
  Bell,
  Building,
  Shield,
  CheckCircle2,
  Save
} from 'lucide-react';

export const SettingsPage = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification toggles
  const [emailNotify, setEmailNotify] = useState(true);
  const [appStatusNotify, setAppStatusNotify] = useState(true);
  const [reminderNotify, setReminderNotify] = useState(true);

  const [savedMsg, setSavedMsg] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSavedMsg('Profile preferences updated successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setSavedMsg('Security credentials updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 rounded-2xl p-6 text-white shadow-lg">
        <span className="text-xs uppercase tracking-wider font-semibold text-sky-400">
          Account & Institutional Preferences
        </span>
        <h2 className="text-2xl font-bold mt-1">Platform Settings & Profile</h2>
        <p className="text-xs text-slate-300 mt-1 max-w-xl">
          Manage your personal credentials, contact information, role assignments, and automated notification delivery channels.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          Profile Details
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          Password & Security
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'notifications'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notifications
        </button>
      </div>

      {/* TAB 1: Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Personal Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Institutional Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
              <input
                type="text"
                value={user?.role?.toUpperCase()}
                disabled
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={user?.department || 'Institution'}
                disabled
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg font-medium"
              />
            </div>

            {user?.regNo && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Register Number</label>
                <input
                  type="text"
                  value={user.regNo}
                  disabled
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg font-mono font-bold"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Save Profile Changes
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Security */}
      {activeTab === 'security' && (
        <form onSubmit={handleSavePassword} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs max-w-lg">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Update Password</h3>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Lock className="w-4 h-4" />
            Update Credentials
          </button>
        </form>
      )}

      {/* TAB 3: Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Notification Preferences</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="font-bold text-slate-800 block">Application Status Alerts</span>
                <span className="text-slate-500 text-[11px]">Receive instant updates when applications are approved, forwarded, or rejected</span>
              </div>
              <input
                type="checkbox"
                checked={appStatusNotify}
                onChange={(e) => setAppStatusNotify(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="font-bold text-slate-800 block">Department Bulletins & Announcements</span>
                <span className="text-slate-500 text-[11px]">Get notified when high-priority notices and event schedules are broadcast</span>
              </div>
              <input
                type="checkbox"
                checked={emailNotify}
                onChange={(e) => setEmailNotify(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="font-bold text-slate-800 block">Pending Review Reminders</span>
                <span className="text-slate-500 text-[11px]">Hourly automated background alerts for applications awaiting your review</span>
              </div>
              <input
                type="checkbox"
                checked={reminderNotify}
                onChange={(e) => setReminderNotify(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
