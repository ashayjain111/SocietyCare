import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiUser, FiMail, FiPhone, FiLock, FiHome,
  FiEye, FiEyeOff, FiHash, FiLayers,
} from 'react-icons/fi';

const STEPS = ['Personal', 'Address', 'Security'];

export default function Register() {
  const [step, setStep]         = useState(0);
  const [showPw, setShowPw]     = useState(false);
  const [form, setForm]         = useState({
    name: '', email: '', phone: '',
    houseNumber: '', tower: '',
    password: '', confirmPassword: '',
  });
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const nextStep = (e) => {
    e.preventDefault();
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      login(res.data.token, res.data.user);
      toast.success('Account created! Welcome to SocietyCare.');
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        toast.error('Cannot reach server. Make sure the backend is running.');
      } else {
        const data = err.response.data;
        // Backend returns either { error: string } or { errors: [{msg}] }
        const msg = data.error
          || data.errors?.[0]?.msg
          || `Registration failed (${err.response.status})`;
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm ' +
    'focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition';

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-5/12 gradient-hero flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white opacity-5 rounded-full" />
        <div className="absolute -bottom-28 right-0 w-72 h-72 bg-blue-400 opacity-10 rounded-full" />

        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <FiHome className="text-white text-xl" />
          </div>
          <span className="text-white text-2xl font-bold">SocietyCare</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-white text-3xl font-bold leading-snug mb-4">
            Join your society's<br />digital community.
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed">
            Create your resident account to raise service requests,
            manage visitors, track maintenance payments, and stay
            connected with society announcements — all in one place.
          </p>
        </div>

        {/* Step indicators (cosmetic) */}
        <div className="relative z-10 space-y-3">
          {STEPS.map((s, i) => (
            <div key={s} className={`flex items-center space-x-3 transition-opacity ${i > step ? 'opacity-40' : 'opacity-100'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2
                ${i < step ? 'bg-green-400 border-green-400 text-white' :
                  i === step ? 'border-white text-white' : 'border-blue-300 text-blue-300'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm ${i === step ? 'text-white font-semibold' : 'text-blue-200'}`}>{s}</span>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-blue-300 text-xs">© 2025 SocietyCare</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-6 space-x-2">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <FiHome className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SocietyCare</span>
          </div>

          <div className="bg-white rounded-2xl shadow-card-md border border-gray-100 p-8">
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900">Create Account</h2>
                <span className="text-xs text-gray-400 font-medium">{step + 1} / {STEPS.length}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 rounded-full transition-all duration-500"
                  style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                {STEPS.map((s, i) => (
                  <span key={s} className={`text-xs ${i <= step ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>{s}</span>
                ))}
              </div>
            </div>

            {/* Step 0 — Personal */}
            {step === 0 && (
              <form onSubmit={nextStep} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input name="name" value={form.name} onChange={set} required type="text"
                      className={inputCls} placeholder="Rajesh Kumar" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input name="email" value={form.email} onChange={set} required type="email"
                      className={inputCls} placeholder="you@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input name="phone" value={form.phone} onChange={set} required type="tel"
                      className={inputCls} placeholder="+91 98765 43210" />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-full py-2.5 text-sm mt-2">Continue</button>
              </form>
            )}

            {/* Step 1 — Address */}
            {step === 1 && (
              <form onSubmit={nextStep} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">House / Flat Number</label>
                  <div className="relative">
                    <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input name="houseNumber" value={form.houseNumber} onChange={set} type="text"
                      className={inputCls} placeholder="e.g., A-101" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tower / Block</label>
                  <div className="relative">
                    <FiLayers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input name="tower" value={form.tower} onChange={set} type="text"
                      className={inputCls} placeholder="e.g., Tower A" />
                  </div>
                </div>
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(0)}
                    className="btn btn-ghost flex-1 py-2.5 text-sm">Back</button>
                  <button type="submit" className="btn btn-primary flex-1 py-2.5 text-sm">Continue</button>
                </div>
              </form>
            )}

            {/* Step 2 — Security */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input name="password" value={form.password} onChange={set} required minLength={6}
                      type={showPw ? 'text' : 'password'}
                      className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none transition"
                      placeholder="Min 6 characters" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                      {showPw ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input name="confirmPassword" value={form.confirmPassword} onChange={set} required
                      type={showPw ? 'text' : 'password'}
                      className={`${inputCls} ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-400' : ''}`}
                      placeholder="Repeat password" />
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                  )}
                </div>
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(1)}
                    className="btn btn-ghost flex-1 py-2.5 text-sm">Back</button>
                  <button type="submit" disabled={loading || form.password !== form.confirmPassword}
                    className="btn btn-primary flex-1 py-2.5 text-sm">
                    {loading
                      ? <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Creating…</>
                      : 'Create Account'}
                  </button>
                </div>
              </form>
            )}

            <p className="mt-5 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
