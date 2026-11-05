import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Mail,
  Building,
  GraduationCap,
  Briefcase,
  Shield,
  Award
} from 'lucide-react';
import api from '../../services/api';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: 'Computer Science & Engineering',
    regNo: '',
    year: 'III',
    section: 'A',
    phone: '',
    isActive: true
  });
  const [modalError, setModalError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'student',
      department: 'Computer Science & Engineering',
      regNo: '',
      year: 'III',
      section: 'A',
      phone: '',
      isActive: true
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'student',
      department: user.department || 'Computer Science & Engineering',
      regNo: user.regNo || '',
      year: user.year || 'III',
      section: user.section || 'A',
      phone: user.phone || '',
      isActive: user.isActive !== false
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to remove this user account?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    setModalError('');
    setActionLoading(true);

    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser._id}`, formData);
      } else {
        await api.post('/admin/users', formData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesDept = deptFilter === 'ALL' || u.department === deptFilter;
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.regNo?.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesDept && matchesSearch;
  });

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student':
        return <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />;
      case 'faculty':
        return <Briefcase className="w-3.5 h-3.5 text-blue-600" />;
      case 'hod':
        return <Award className="w-3.5 h-3.5 text-purple-600" />;
      case 'admin':
        return <Shield className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">User Account Administration</h2>
          <p className="text-xs text-slate-500">
            Manage students, faculty mentors, department heads, and institutional administrators.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add User Account
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search name, email, reg no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          >
            <option value="ALL">All Roles</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty Mentors</option>
            <option value="hod">HODs</option>
            <option value="admin">Administrators</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          >
            <option value="ALL">All Departments</option>
            <option value="Computer Science & Engineering">CSE</option>
            <option value="Electronics & Communication">ECE</option>
            <option value="Information Technology">IT</option>
            <option value="Mechanical Engineering">MECH</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading user accounts...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No user accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Academic Info</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-800">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize bg-slate-100 text-slate-700">
                        {getRoleIcon(u.role)}
                        {u.role === 'hod' ? 'HOD' : u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {u.department}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {u.role === 'student' ? (
                        <span>
                          {u.regNo} ({u.year}-{u.section})
                        </span>
                      ) : (
                        <span className="text-slate-400">Faculty/Staff</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {u.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Deactivated
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-700 rounded transition"
                        title="Edit User"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded transition"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800">
                {editingUser ? 'Edit User Details' : 'Create New User Account'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="p-6 space-y-3.5 text-xs">
              {modalError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  disabled={!!editingUser}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@college.edu"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty Mentor</option>
                    <option value="hod">HOD</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Electronics & Communication">ECE</option>
                    <option value="Information Technology">IT</option>
                    <option value="Mechanical Engineering">MECH</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
              </div>

              {formData.role === 'student' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Reg No</label>
                    <input
                      type="text"
                      value={formData.regNo}
                      onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                      placeholder="CS2023-001"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Year</label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                    >
                      <option value="I">I</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Section</label>
                    <input
                      type="text"
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      placeholder="A"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase"
                    />
                  </div>
                </div>
              )}

              {editingUser && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
                  />
                  <label htmlFor="isActive" className="text-slate-700 font-medium cursor-pointer">
                    Account Active & Enabled
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingUser ? 'Update Account' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
