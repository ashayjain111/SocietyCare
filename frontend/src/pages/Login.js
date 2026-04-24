import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiMail, FiLock, FiHome, FiEye, FiEyeOff,
  FiShield, FiZap, FiUsers, FiCheckCircle,
} from 'react-icons/fi';

const DEMO_ACCOUNTS = [
  { role: 'Admin',    email: 'admin@societycare.com', password: 'Admin@123',  color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { role: 'Resident', email: 'rajesh@example.com',    password: 'Pass@123',   color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { role: 'Staff',    email: 'ramesh@example.com',    password: 'Staff@123',  color: 'bg-green-100 text-green-700 border-green-200' },
];

const FEATURES = [
  { icon: FiZap,        title: 'AI-Powered',      desc: 'Smart request categorisation & summaries' },
  { icon: FiShield,     title: 'Secure',          desc: 'JWT auth with role-based access control' },
  { icon: FiUsers,      title: 'Multi-Role',      desc: 'Residents, Admin & Staff portals' },
  { icon: FiCheckCircle,title: 'Real-time',       desc: 'Live notifications & status updates' },
];

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      login(res.data.token, res.data.user);
      toast.success('Welcome back!');
      const role = res.data.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'staff' ? '/staff' : '/dashboard');
    } catch (err) {
      if (!err.response) {
        toast.error('Cannot reach server. Make sure the backend is running.');
      } else {
        const data = err.response.data;
        toast.error(data.error || data.errors?.[0]?.msg || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (branding) ─── */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero flex-col justify-between p-12 relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white opacity-5 rounded-full" />
        <div className="absolute -bottom-32 -right-20 w-80 h-80 bg-white opacity-5 rounded-full" />
        <div className="absolute top-1/2 right-0 w-48 h-48 bg-blue-400 opacity-10 rounded-full translate-x-1/2" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <FiHome className="text-white text-xl" />
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">SocietyCare</span>
          </div>
          <p className="text-blue-200 mt-2 text-sm">AI-Powered Smart Society Management</p>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-white text-3xl font-bold leading-snug">
            Manage your society<br />smarter, not harder.
          </h2>
          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start space-x-4">
                <div className="w-9 h-9 bg-white bg-opacity-15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <f.icon className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-blue-200 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-blue-300 text-xs">© 2025 SocietyCare · All rights reserved</p>
      </div>

      {/* ── Right panel (form) ─── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-8 space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <FiHome className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold text-gray-900">SocietyCare</span>
          </div>

          <div className="bg-white rounded-2xl shadow-card-md p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1 mb-6">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm
                               focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type={showPw ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)} required
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm
                               focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                    placeholder="Enter your password"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {showPw ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn btn-primary w-full py-2.5 text-sm">
                {loading
                  ? <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Signing in…</>
                  : 'Sign In'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700 transition">Register now</Link>
            </p>

            {/* Demo accounts */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick demo login</p>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button key={acc.role} onClick={() => fillDemo(acc)}
                    className={`border rounded-lg px-2 py-2 text-xs font-semibold transition hover:opacity-80 ${acc.color}`}>
                    {acc.role}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">Click a role to auto-fill credentials</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
