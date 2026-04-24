import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { serviceAPI, adminAPI } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import {
  FiPlus, FiClipboard, FiCreditCard, FiUsers, FiAlertTriangle,
  FiMessageCircle, FiCheckCircle, FiClock, FiActivity,
  FiChevronRight, FiSun, FiMoon, FiHome,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className={`rounded-xl p-4 ${color} animate-count-up`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold opacity-70 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
        </div>
        <div className="opacity-20">
          <Icon className="text-4xl" />
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', icon: FiSun, color: 'text-amber-500' };
  if (h < 17) return { text: 'Good Afternoon', icon: FiSun, color: 'text-orange-500' };
  return { text: 'Good Evening', icon: FiMoon, color: 'text-indigo-500' };
}

const QUICK_ACTIONS = [
  { to: '/new-request',  label: 'New Request', icon: FiPlus,      bg: 'bg-primary-600 hover:bg-primary-700 text-white shadow-glow' },
  { to: '/my-requests',  label: 'My Requests', icon: FiClipboard, bg: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-primary-300' },
  { to: '/payments',     label: 'Payments',    icon: FiCreditCard,bg: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-green-300' },
  { to: '/visitors',     label: 'Visitors',    icon: FiUsers,     bg: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-indigo-300' },
];

export default function ResidentDashboard() {
  const { user }                         = useAuth();
  const [requests, setRequests]          = useState([]);
  const [announcements, setAnnouncements]= useState([]);
  const [loading, setLoading]            = useState(true);
  const greeting                         = getGreeting();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [reqRes, annRes] = await Promise.all([
        serviceAPI.getMyRequests({ limit: 5 }),
        adminAPI.getAnnouncements(),
      ]);
      setRequests(reqRes.data.requests || []);
      setAnnouncements(annRes.data.announcements || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleSOS = async () => {
    if (window.confirm('Send an Emergency SOS alert to society management?')) {
      try {
        await serviceAPI.emergencySOS({ message: 'Emergency help needed!' });
        toast.success('SOS sent! Help is on the way.', { icon: '🚨', duration: 5000 });
      } catch {
        toast.error('Failed to send SOS. Please call emergency services directly.');
      }
    }
  };

  /* derived stats */
  const pending     = requests.filter((r) => r.status === 'pending').length;
  const inProgress  = requests.filter((r) => r.status === 'in_progress').length;
  const completed   = requests.filter((r) => r.status === 'completed').length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="skeleton h-24 rounded-2xl" />
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 skeleton h-64 rounded-xl" />
            <div className="skeleton h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">

      {/* ── Hero welcome banner ── */}
      <div className="gradient-primary rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-48 opacity-10">
          <FiHome className="text-[160px] absolute -right-6 -top-4" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <greeting.icon className={greeting.color} />
              <span className="text-blue-200 text-sm font-medium">{greeting.text}</span>
            </div>
            <h1 className="text-2xl font-bold">{user?.name}!</h1>
            <p className="text-blue-200 text-sm mt-0.5">
              {user?.houseNumber && `${user.houseNumber}`}{user?.tower && `, ${user.tower}`}
              {!user?.houseNumber && 'Welcome to SocietyCare'}
            </p>
          </div>
          <button onClick={handleSOS}
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-lg animate-pulse-ring self-start sm:self-auto">
            <FiAlertTriangle className="text-lg" />
            <span>Emergency SOS</span>
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-4 mb-8 stagger">
        <StatCard label="Pending"    value={pending}    icon={FiClock}        color="bg-amber-50 text-amber-800" />
        <StatCard label="In Progress"value={inProgress} icon={FiActivity}     color="bg-indigo-50 text-indigo-800" />
        <StatCard label="Completed"  value={completed}  icon={FiCheckCircle}  color="bg-green-50 text-green-800" />
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 stagger">
        {QUICK_ACTIONS.map((a) => (
          <Link key={a.to} to={a.to}
            className={`rounded-xl p-4 flex flex-col items-center justify-center space-y-2 transition-all duration-200 card-hover ${a.bg}`}>
            <a.icon className="text-2xl" />
            <span className="text-xs font-semibold">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Requests */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiClipboard className="text-primary-600" />
                <h2 className="text-base font-semibold text-gray-900">Recent Requests</h2>
              </div>
              <Link to="/my-requests"
                className="flex items-center text-xs text-primary-600 hover:text-primary-700 font-medium transition">
                View all <FiChevronRight className="ml-0.5" />
              </Link>
            </div>

            {requests.length === 0 ? (
              <div className="p-10 text-center">
                <FiClipboard className="text-4xl mx-auto mb-3 text-gray-200" />
                <p className="text-gray-400 text-sm">No service requests yet</p>
                <Link to="/new-request"
                  className="inline-block mt-3 text-xs text-primary-600 font-semibold hover:underline">
                  + Create your first request
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {requests.map((req, i) => (
                  <div key={req.id}
                    className="px-5 py-3.5 hover:bg-gray-50 transition-colors flex items-center justify-between gap-3"
                    style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{req.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">
                        {req.category?.replace('_', ' ')} · {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <PriorityBadge priority={req.priority} />
                      <StatusBadge status={req.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New request CTA */}
          <Link to="/new-request"
            className="mt-3 flex items-center justify-center space-x-2 py-3 rounded-xl border-2 border-dashed border-primary-200
              text-primary-600 text-sm font-semibold hover:bg-primary-50 hover:border-primary-400 transition">
            <FiPlus /><span>Raise a new service request</span>
          </Link>
        </div>

        {/* Announcements */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-2">
              <FiMessageCircle className="text-primary-600" />
              <h2 className="text-base font-semibold text-gray-900">Announcements</h2>
            </div>

            {announcements.length === 0 ? (
              <div className="p-8 text-center">
                <FiMessageCircle className="text-3xl mx-auto mb-2 text-gray-200" />
                <p className="text-sm text-gray-400">No announcements</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {announcements.slice(0, 6).map((ann) => {
                  const colors = {
                    emergency:   'bg-red-500',
                    maintenance: 'bg-amber-400',
                    general:     'bg-blue-500',
                    event:       'bg-purple-500',
                  };
                  const dot = colors[ann.category] || 'bg-gray-400';
                  return (
                    <div key={ann.id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${dot}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 leading-snug">{ann.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ann.content}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(ann.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick links card */}
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border border-primary-100 p-4">
            <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-3">Quick Links</p>
            <div className="space-y-2">
              {[
                { to: '/visitors', label: 'Manage Visitors', icon: FiUsers },
                { to: '/payments', label: 'Pay Maintenance Fee', icon: FiCreditCard },
                { to: '/profile',  label: 'Update Profile', icon: FiActivity },
              ].map((l) => (
                <Link key={l.to} to={l.to}
                  className="flex items-center space-x-2.5 text-sm text-primary-700 hover:text-primary-900 font-medium transition">
                  <l.icon className="text-primary-500 flex-shrink-0" />
                  <span>{l.label}</span>
                  <FiChevronRight className="ml-auto text-primary-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
