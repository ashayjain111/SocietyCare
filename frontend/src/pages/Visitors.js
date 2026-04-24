import React, { useState, useEffect } from 'react';
import { visitorAPI } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import toast from 'react-hot-toast';
import { FiPlus, FiX } from 'react-icons/fi';

export default function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ visitorName: '', visitorPhone: '', purpose: '', vehicleNumber: '', expectedDate: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadVisitors(); }, []);

  const loadVisitors = async () => {
    try {
      const res = await visitorAPI.getMyVisitors();
      setVisitors(res.data.visitors);
    } catch (err) {
      console.error('Failed to load visitors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await visitorAPI.register(form);
      toast.success('Visitor registered! QR code generated.');
      setShowModal(false);
      setForm({ visitorName: '', visitorPhone: '', purpose: '', vehicleNumber: '', expectedDate: '' });
      loadVisitors();
    } catch (err) {
      toast.error('Failed to register visitor');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Visitor Management</h1>
        <button onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <FiPlus /><span>Register Visitor</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>
      ) : visitors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No visitors registered</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visitors.map((v) => (
            <div key={v.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{v.visitorName}</h3>
                <StatusBadge status={v.status} />
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Phone: {v.visitorPhone || 'N/A'}</p>
                <p>Purpose: {v.purpose}</p>
                <p>Date: {v.expectedDate}</p>
                {v.vehicleNumber && <p>Vehicle: {v.vehicleNumber}</p>}
                {v.checkInTime && <p>Check-in: {new Date(v.checkInTime).toLocaleString()}</p>}
                {v.checkOutTime && <p>Check-out: {new Date(v.checkOutTime).toLocaleString()}</p>}
              </div>
              {v.qrCode && (
                <div className="mt-3 text-center">
                  <img src={v.qrCode} alt="QR Code" className="w-24 h-24 mx-auto" />
                  <p className="text-xs text-gray-400 mt-1">Show this QR at entry</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Register Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Register Visitor</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><FiX className="text-xl" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Visitor Name" required value={form.visitorName}
                onChange={(e) => setForm({ ...form, visitorName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              <input type="tel" placeholder="Visitor Phone" value={form.visitorPhone}
                onChange={(e) => setForm({ ...form, visitorPhone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              <input type="text" placeholder="Purpose of Visit" required value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              <input type="text" placeholder="Vehicle Number (optional)" value={form.vehicleNumber}
                onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              <input type="date" required value={form.expectedDate}
                onChange={(e) => setForm({ ...form, expectedDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
