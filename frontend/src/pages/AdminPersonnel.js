import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiPlus, FiUser, FiPhone, FiMail, FiTool,
  FiStar, FiEdit2, FiX, FiCheck,
} from 'react-icons/fi';

const SPECIALIZATIONS = ['Electrical', 'Plumbing', 'Carpentry', 'Cleaning', 'Painting', 'Pest Control', 'Security', 'Other'];

function PersonnelModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { name: '', phone: '', email: '', specialization: 'Electrical' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">{initial ? 'Edit Personnel' : 'Add Personnel'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><FiX className="text-xl" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email (creates login account)</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            {!initial && <p className="text-xs text-gray-400 mt-1">Default password: Staff@123 (ask them to change)</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Specialization *</label>
            <select required value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
              {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {initial && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Availability</label>
              <select value={form.isAvailable ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isAvailable: e.target.value === 'true' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50 transition">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPersonnel() {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  useEffect(() => { loadPersonnel(); }, []);

  const loadPersonnel = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPersonnel();
      setPersonnel(res.data.personnel || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (form) => {
    await adminAPI.addPersonnel(form);
    toast.success('Personnel added! They can login with their email.');
    loadPersonnel();
  };

  const handleUpdate = async (form) => {
    await adminAPI.updatePersonnel(modal.id, form);
    toast.success('Personnel updated');
    loadPersonnel();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Personnel</h1>
          <p className="text-gray-500 text-sm mt-0.5">{personnel.length} staff members</p>
        </div>
        <button onClick={() => setModal('new')}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition">
          <FiPlus /><span>Add Personnel</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map((i) => <div key={i} className="skeleton h-48 rounded-xl" />)}
        </div>
      ) : personnel.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FiTool className="text-5xl text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No personnel added yet</p>
          <button onClick={() => setModal('new')} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">
            Add First Personnel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {personnel.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiUser className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{p.specialization}</p>
                  </div>
                </div>
                <button onClick={() => setModal(p)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                  <FiEdit2 className="text-sm" />
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-gray-500 mb-3">
                {p.phone && (
                  <div className="flex items-center space-x-2">
                    <FiPhone className="text-gray-400" />
                    <a href={`tel:${p.phone}`} className="text-blue-600 hover:underline">{p.phone}</a>
                  </div>
                )}
                {p.email && (
                  <div className="flex items-center space-x-2">
                    <FiMail className="text-gray-400" />
                    <span className="truncate">{p.email}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-1 text-xs text-amber-600">
                  <FiStar className="text-amber-400" />
                  <span className="font-semibold">{p.rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-gray-400">({p.totalJobs || 0} jobs)</span>
                </div>
                <span className={`flex items-center space-x-1 text-xs px-2 py-0.5 rounded-full font-medium
                  ${p.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {p.isAvailable ? <><FiCheck className="text-xs" /><span>Available</span></> : <><FiX className="text-xs" /><span>Busy</span></>}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal === 'new' && (
        <PersonnelModal onSave={handleAdd} onClose={() => setModal(null)} />
      )}
      {modal && modal !== 'new' && (
        <PersonnelModal initial={modal} onSave={handleUpdate} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
