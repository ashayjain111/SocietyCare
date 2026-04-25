import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiMessageSquare, FiX, FiClock } from 'react-icons/fi';

const CATEGORIES = ['general', 'maintenance', 'event', 'emergency', 'rule', 'notice'];

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'general', expiresAt: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAnnouncements(); }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAnnouncements();
      setAnnouncements(res.data.announcements || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.expiresAt) delete payload.expiresAt;
      await adminAPI.createAnnouncement(payload);
      toast.success('Announcement posted to all residents!');
      setShowForm(false);
      setForm({ title: '', content: '', category: 'general', expiresAt: '' });
      loadAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post announcement');
    } finally {
      setSaving(false);
    }
  };

  const CATEGORY_COLORS = {
    general:     'bg-blue-100 text-blue-700',
    maintenance: 'bg-amber-100 text-amber-700',
    event:       'bg-purple-100 text-purple-700',
    emergency:   'bg-red-100 text-red-700',
    rule:        'bg-gray-100 text-gray-700',
    notice:      'bg-green-100 text-green-700',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 text-sm mt-0.5">{announcements.length} active announcements</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition">
          <FiPlus /><span>New Announcement</span>
        </button>
      </div>

      {/* Post form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">New Announcement</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition"><FiX /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="E.g. Water supply shutdown on Sunday"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Message *</label>
              <textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={4} placeholder="Write your announcement here…"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none capitalize">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Expires (optional)</label>
                <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50 transition">
                {saving ? 'Posting…' : 'Post to All Residents'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcement list */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="skeleton h-32 rounded-xl" />)}</div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FiMessageSquare className="text-5xl text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No announcements yet</p>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">
            Post First Announcement
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-gray-900">{a.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0 ${CATEGORY_COLORS[a.category] || 'bg-gray-100 text-gray-600'}`}>
                  {a.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-3 whitespace-pre-wrap">{a.content}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>By {a.author?.name || 'Admin'} · {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                {a.expiresAt && (
                  <span className="flex items-center space-x-1">
                    <FiClock className="text-xs" />
                    <span>Expires {new Date(a.expiresAt).toLocaleDateString('en-IN')}</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
