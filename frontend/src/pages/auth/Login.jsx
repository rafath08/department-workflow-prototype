import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, GraduationCap, Briefcase, Award, ArrowRight, Lock, Mail } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to authenticate demo user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Institutional Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-sky-600 to-indigo-700 text-white rounded-2xl mx-auto flex items-center justify-center shadow-lg text-3xl">
            🏛️
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Workflow Automation Portal
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Intelligent Multi-Level Student Permission & Institutional Approval Engine
          </p>
        </div>

        {/* Demo Fast-Login Section */}
        <div className="bg-white/80 backdrop-blur p-4 rounded-xl border border-sky-100 shadow-sm space-y-2">
          <div className="text-[11px] font-bold text-sky-900 uppercase tracking-wider text-center">
            ⚡ Quick Demo One-Click Access
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoLogin('student@college.edu', 'Student@123')}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-left transition flex items-center gap-2 font-medium"
            >
              <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="truncate">
                <div className="font-bold leading-tight">Student</div>
                <div className="text-[10px] text-emerald-600 truncate">Alex Rivera</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('faculty@college.edu', 'Faculty@123')}
              className="p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-lg text-left transition flex items-center gap-2 font-medium"
            >
              <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="truncate">
                <div className="font-bold leading-tight">Faculty Mentor</div>
                <div className="text-[10px] text-blue-600 truncate">Dr. Vance</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('hod@college.edu', 'Hod@123')}
              className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded-lg text-left transition flex items-center gap-2 font-medium"
            >
              <Award className="w-4 h-4 text-purple-600 shrink-0" />
              <div className="truncate">
                <div className="font-bold leading-tight">HOD (CSE)</div>
                <div className="text-[10px] text-purple-600 truncate">Prof. Jenkins</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin@college.edu', 'Admin@123')}
              className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-left transition flex items-center gap-2 font-medium"
            >
              <Shield className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="truncate">
                <div className="font-bold leading-tight">Administrator</div>
                <div className="text-[10px] text-amber-600 truncate">System Admin</div>
              </div>
            </button>
          </div>
        </div>

        {/* Traditional Login Card */}
        <div className="bg-white p-7 rounded-2xl shadow-xl border border-slate-200/80">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g., student@college.edu"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-lg transition shadow-md hover:shadow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500">
            Need an account?{' '}
            <Link to="/register" className="text-sky-600 font-semibold hover:underline">
              Register as Student or Faculty
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
