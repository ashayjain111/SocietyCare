import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import {
  FiBell, FiMenu, FiX, FiLogOut, FiUser, FiHome,
  FiClipboard, FiCreditCard, FiUsers, FiSettings,
  FiTool, FiChevronDown,
} from 'react-icons/fi';

function NavLink({ to, children }) {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== '/' && pathname.startsWith(to));
  return (
    <Link
      to={to}
      className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150
        ${active
          ? 'text-primary-600 bg-primary-50'
          : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'}`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary-600 rounded-full" />
      )}
    </Link>
  );
}

function Avatar({ name, size = 'sm' }) {
  const initials = (name || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['bg-primary-600', 'bg-purple-600', 'bg-emerald-600', 'bg-orange-500'];
  const color  = colors[initials.charCodeAt(0) % colors.length];
  const cls    = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${cls} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

export default function Navbar() {
  const { user, logout }           = useAuth();
  const navigate                   = useNavigate();
  const location                   = useLocation();
  const [menuOpen, setMenuOpen]    = useState(false);
  const [profileOpen, setProfile]  = useState(false);
  const [unread, setUnread]        = useState(0);
  const profileRef                 = useRef(null);

  /* fetch unread count */
  useEffect(() => {
    if (!user) return;
    notificationAPI.getAll({ unread: true })
      .then((r) => setUnread(r.data.notifications?.filter((n) => !n.isRead).length || 0))
      .catch(() => {});
  }, [user, location.pathname]);

  /* close profile dropdown on outside click */
  useEffect(() => {
    const handler = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfile(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* close mobile menu on route change */
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const dashPath = user?.role === 'admin' ? '/admin' : user?.role === 'staff' ? '/staff' : '/dashboard';

  const residentLinks = [
    { to: '/dashboard',    label: 'Dashboard', icon: FiHome },
    { to: '/my-requests',  label: 'My Requests', icon: FiClipboard },
    { to: '/payments',     label: 'Payments', icon: FiCreditCard },
    { to: '/visitors',     label: 'Visitors', icon: FiUsers },
  ];
  const adminLinks = [
    { to: '/admin',               label: 'Dashboard',     icon: FiHome },
    { to: '/admin/requests',      label: 'Requests',      icon: FiClipboard },
    { to: '/admin/residents',     label: 'Residents',     icon: FiUsers },
    { to: '/admin/personnel',     label: 'Staff',         icon: FiTool },
    { to: '/admin/payments',      label: 'Payments',      icon: FiCreditCard },
    { to: '/admin/announcements', label: 'Notices',       icon: FiSettings },
  ];
  const staffLinks = [
    { to: '/staff', label: 'My Tasks', icon: FiClipboard },
  ];
  const links = user?.role === 'admin' ? adminLinks : user?.role === 'staff' ? staffLinks : residentLinks;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50" style={{ boxShadow: '0 1px 8px rgba(0,0,0,.06)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to={dashPath} className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center transition group-hover:bg-primary-700">
              <FiHome className="text-white text-base" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">SocietyCare</span>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}
          </div>

          {/* ── Right actions ── */}
          <div className="flex items-center space-x-2">
            {/* Notification bell */}
            <Link to="/notifications"
              className="relative p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition">
              <FiBell className="text-xl" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold
                  rounded-full flex items-center justify-center leading-none animate-pulse">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>

            {/* Profile dropdown */}
            <div className="hidden md:block relative" ref={profileRef}>
              <button onClick={() => setProfile(!profileOpen)}
                className="flex items-center space-x-2 pl-3 pr-2 py-1.5 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-200">
                <Avatar name={user?.name} />
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-800 leading-tight">{user?.name?.split(' ')[0]}</p>
                  <p className="text-[10px] text-gray-400 capitalize leading-tight">{user?.role}</p>
                </div>
                <FiChevronDown className={`text-gray-400 text-xs transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-card-lg border border-gray-100 py-1 animate-slide-down z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Link to="/profile" onClick={() => setProfile(false)}
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                    <FiUser className="text-gray-400" /><span>My Profile</span>
                  </Link>
                  <Link to="/notifications" onClick={() => setProfile(false)}
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                    <FiBell className="text-gray-400" />
                    <span>Notifications</span>
                    {unread > 0 && <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{unread}</span>}
                  </Link>
                  <div className="border-t border-gray-100 mt-1" />
                  <button onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition">
                    <FiLogOut /><span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">
              {menuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 pb-4 animate-slide-down">
          {/* User info */}
          <div className="flex items-center space-x-3 px-5 pt-4 pb-3 border-b border-gray-100">
            <Avatar name={user?.name} size="md" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role} · {user?.houseNumber}</p>
            </div>
          </div>

          <div className="px-4 pt-2 space-y-0.5">
            {links.map((l) => {
              const active = location.pathname === l.to;
              return (
                <Link key={l.to} to={l.to}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition
                    ${active ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <l.icon className={active ? 'text-primary-600' : 'text-gray-400'} />
                  <span>{l.label}</span>
                </Link>
              );
            })}
            <Link to="/profile"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
              <FiSettings className="text-gray-400" /><span>Profile & Settings</span>
            </Link>
            <button onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition">
              <FiLogOut /><span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
