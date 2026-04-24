import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import {
  FiUsers, FiClipboard, FiTool, FiDollarSign, FiClock, FiCheckCircle,
  FiAlertCircle, FiTrendingUp, FiTrendingDown, FiChevronRight, FiActivity,
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

function StatCard({ label, value, icon: Icon, gradient, delta, link }) {
  const card = (
    <div className={`rounded-xl p-5 ${gradient} relative overflow-hidden group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-lg`}>
      <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-15 transition">
        <Icon className="text-6xl" />
      </div>
      <p className="text-xs font-semibold opacity-60 uppercase tracking-wide mb-2">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      {delta !== undefined && (
        <div className="flex items-center mt-2 space-x-1">
          {delta >= 0
            ? <FiTrendingUp className="text-xs opacity-70" />
            : <FiTrendingDown className="text-xs opacity-70" />}
          <span className="text-xs opacity-60">{Math.abs(delta)}% vs last month</span>
        </div>
      )}
    </div>
  );
  return link ? <Link to={link}>{card}</Link> : card;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-card-md px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats]             = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [monthlyTrend, setMonthlyTrend]   = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const res = await adminAPI.getDashboard();
      setStats(res.data.stats);
      setCategoryStats(
        res.data.categoryStats?.map((c) => ({ name: c.category, value: parseInt(c.count) })) || []
      );
      setMonthlyTrend(
        res.data.monthlyTrend?.map((m) => ({ month: m.month, requests: parseInt(m.count) })) || []
      );
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="skeleton h-12 w-64 rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map((i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="skeleton h-80 rounded-xl" />
            <div className="skeleton h-80 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Total Residents',   value: stats?.totalResidents   || 0, icon: FiUsers,       gradient: 'bg-blue-600 text-white',    link: '/admin/residents' },
    { label: 'Total Requests',    value: stats?.totalRequests    || 0, icon: FiClipboard,   gradient: 'bg-indigo-600 text-white',  link: '/admin/requests' },
    { label: 'Pending',           value: stats?.pendingRequests  || 0, icon: FiClock,       gradient: 'bg-amber-500 text-white',   link: '/admin/requests?status=pending' },
    { label: 'In Progress',       value: stats?.inProgressRequests||0, icon: FiAlertCircle, gradient: 'bg-orange-500 text-white' },
    { label: 'Completed',         value: stats?.completedRequests|| 0, icon: FiCheckCircle, gradient: 'bg-emerald-600 text-white' },
    { label: 'Staff Members',     value: stats?.totalPersonnel   || 0, icon: FiTool,        gradient: 'bg-purple-600 text-white',  link: '/admin/personnel' },
    { label: 'Total Collection',  value: `₹${(stats?.totalPayments||0).toLocaleString('en-IN')}`, icon: FiDollarSign, gradient: 'bg-teal-600 text-white', link: '/admin/payments' },
    { label: 'Pending Payments',  value: stats?.pendingPayments  || 0, icon: FiDollarSign,  gradient: 'bg-red-500 text-white' },
  ];

  const pendingPct = stats?.totalRequests
    ? Math.round((stats.pendingRequests / stats.totalRequests) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/admin/requests"
            className="btn btn-primary text-sm px-4 py-2">
            <FiClipboard className="text-sm" /> Manage Requests
          </Link>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger">
        {cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Monthly trend bar chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Monthly Request Trend</h2>
              <p className="text-xs text-gray-400 mt-0.5">Requests raised per month</p>
            </div>
            <FiActivity className="text-primary-400 text-xl" />
          </div>
          {monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyTrend} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4ff" />
                <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} width={30} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0f4ff' }} />
                <Bar dataKey="requests" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Requests" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-300">
              <FiActivity className="text-5xl mb-2" />
              <p className="text-sm">No trend data yet</p>
            </div>
          )}
        </div>

        {/* Category pie chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Requests by Category</h2>
              <p className="text-xs text-gray-400 mt-0.5">Distribution across service types</p>
            </div>
            <FiClipboard className="text-purple-400 text-xl" />
          </div>
          {categoryStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categoryStats} cx="50%" cy="45%"
                  outerRadius={90} innerRadius={45}
                  dataKey="value" paddingAngle={3}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryStats.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-300">
              <FiClipboard className="text-5xl mb-2" />
              <p className="text-sm">No category data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Progress + Quick actions row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Resolution health */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Resolution Health</h2>
          <div className="space-y-4">
            {[
              { label: 'Completion Rate', value: stats?.totalRequests ? Math.round((stats.completedRequests/stats.totalRequests)*100) : 0, color: 'bg-green-500' },
              { label: 'Pending Rate',    value: pendingPct, color: 'bg-amber-400' },
              { label: 'In-Progress Rate',value: stats?.totalRequests ? Math.round((stats.inProgressRequests/stats.totalRequests)*100) : 0, color: 'bg-indigo-500' },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600 font-medium">{m.label}</span>
                  <span className="text-gray-900 font-bold">{m.value}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${m.color} rounded-full transition-all duration-700`} style={{ width: `${m.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { to: '/admin/requests',     title: 'Manage Requests',    desc: 'View, assign & update all requests',     bg: 'gradient-card',   border: 'border-blue-100',   text: 'text-blue-900' },
            { to: '/admin/announcements',title: 'Announcements',      desc: 'Post society news & updates',            bg: 'gradient-success', border: 'border-green-100',  text: 'text-green-900' },
            { to: '/admin/payments',     title: 'Payment Management', desc: 'Track fees & manage billing',            bg: 'gradient-warning', border: 'border-amber-100',  text: 'text-amber-900' },
          ].map((a) => (
            <Link key={a.to} to={a.to}
              className={`${a.bg} border ${a.border} rounded-xl p-5 hover:shadow-card-md transition group`}>
              <h3 className={`font-semibold text-sm ${a.text}`}>{a.title}</h3>
              <p className={`text-xs mt-1 opacity-70 ${a.text}`}>{a.desc}</p>
              <div className={`flex items-center mt-3 text-xs font-semibold ${a.text} opacity-70 group-hover:opacity-100 transition`}>
                Open <FiChevronRight className="ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
