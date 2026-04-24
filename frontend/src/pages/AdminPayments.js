import React, { useState, useEffect } from 'react';
import { paymentAPI, adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiDollarSign, FiSearch, FiPlus, FiX, FiCheck, FiClock } from 'react-icons/fi';

function OfflineModal({ onSave, onClose }) {
  const [form, setForm] = useState({ userId: '', month: '', amount: '', paymentMethod: 'cash' });
  const [residents, setResidents] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminAPI.getResidents({ limit: 100 }).then((r) => setResidents(r.data.residents || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await paymentAPI.recordOffline(form);
      toast.success('Payment recorded successfully');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Record Offline Payment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><FiX className="text-xl" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Resident *</label>
            <select required value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="">Select resident</option>
              {residents.map((r) => (
                <option key={r.id} value={r.id}>{r.name} — {r.houseNumber}, {r.tower}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Month (YYYY-MM) *</label>
            <input required type="month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Amount (₹) *</label>
            <input required type="number" min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
            <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50 transition">
              {saving ? 'Saving…' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', month: '' });
  const [loading, setLoading] = useState(true);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => { loadPayments(); }, [page, filters]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filters.status) params.status = filters.status;
      if (filters.month) params.month = filters.month;
      const res = await paymentAPI.getAllPayments(params);
      setPayments(res.data.payments || []);
      setTotal(res.data.total || 0);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / 20);
  const STATUS_COLORS = {
    completed: 'bg-green-100 text-green-700',
    pending:   'bg-amber-100 text-amber-700',
    failed:    'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} payment records</p>
        </div>
        <button onClick={() => setShowOffline(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition">
          <FiPlus /><span>Record Offline</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <select value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        <input type="month" value={filters.month}
          onChange={(e) => { setFilters({ ...filters, month: e.target.value }); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FiDollarSign className="text-5xl text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No payments found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resident</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{p.user?.name}</p>
                      <p className="text-xs text-gray-400">{p.user?.houseNumber}, {p.user?.tower}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.month}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">₹{parseFloat(p.totalAmount).toLocaleString('en-IN')}</p>
                      {parseFloat(p.lateFee) > 0 && (
                        <p className="text-xs text-red-500">+₹{parseFloat(p.lateFee)} late fee</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">{p.paymentMethod || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t flex justify-between items-center">
              <span className="text-sm text-gray-500">{total} total records</span>
              <div className="flex space-x-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 text-sm border rounded disabled:opacity-50">Prev</button>
                <span className="px-3 py-1 text-sm">{page}/{totalPages}</span>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1 text-sm border rounded disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {showOffline && <OfflineModal onSave={() => {}} onClose={() => { setShowOffline(false); loadPayments(); }} />}
    </div>
  );
}
