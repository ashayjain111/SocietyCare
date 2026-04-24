import React, { useState, useEffect } from 'react';
import { serviceAPI, adminAPI } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import toast from 'react-hot-toast';
import { FiSearch, FiUserPlus, FiX } from 'react-icons/fi';

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', category: '', search: '' });
  const [personnel, setPersonnel] = useState([]);
  const [assignModal, setAssignModal] = useState(null);
  const [selectedPersonnel, setSelectedPersonnel] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRequests(); }, [page, filters]);
  useEffect(() => { loadPersonnel(); }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      const res = await serviceAPI.getAll(params);
      setRequests(res.data.requests);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const loadPersonnel = async () => {
    try {
      const res = await adminAPI.getPersonnel({ available: 'true' });
      setPersonnel(res.data.personnel);
    } catch (err) { /* ignore */ }
  };

  const handleAssign = async () => {
    if (!selectedPersonnel || !assignModal) return;
    try {
      await adminAPI.assignPersonnel({ requestId: assignModal.id, personnelId: parseInt(selectedPersonnel) });
      toast.success('Personnel assigned successfully');
      setAssignModal(null);
      setSelectedPersonnel('');
      loadRequests();
    } catch (err) {
      toast.error('Failed to assign personnel');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await serviceAPI.updateStatus(id, { status });
      toast.success('Status updated');
      loadRequests();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Service Requests</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
          <input type="text" placeholder="Search requests..."
            value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && loadRequests()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <select value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="reopened">Reopened</option>
        </select>
        <select value={filters.category} onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">All Categories</option>
          <option value="electrical">Electrical</option>
          <option value="plumbing">Plumbing</option>
          <option value="carpentry">Carpentry</option>
          <option value="cleaning">Cleaning</option>
          <option value="painting">Painting</option>
          <option value="pest_control">Pest Control</option>
          <option value="security">Security</option>
          <option value="other">Other</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resident</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">#{req.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{req.title}</p>
                      {req.aiSummary && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{req.aiSummary}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{req.resident?.name}</p>
                      <p className="text-xs text-gray-500">{req.resident?.houseNumber}, {req.resident?.tower}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">{req.category?.replace('_', ' ')}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={req.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {(req.status === 'pending' || req.status === 'reopened') && (
                          <button onClick={() => setAssignModal(req)}
                            className="flex items-center space-x-1 px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded hover:bg-primary-200">
                            <FiUserPlus /><span>Assign</span>
                          </button>
                        )}
                        <select value="" onChange={(e) => handleStatusChange(req.id, e.target.value)}
                          className="text-xs border rounded px-2 py-1">
                          <option value="">Change Status</option>
                          <option value="pending">Pending</option>
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t flex justify-between items-center">
              <span className="text-sm text-gray-500">{total} total requests</span>
              <div className="flex space-x-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 text-sm border rounded disabled:opacity-50">Prev</button>
                <span className="px-3 py-1 text-sm">{page}/{totalPages}</span>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1 text-sm border rounded disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Assign Personnel</h3>
              <button onClick={() => setAssignModal(null)} className="text-gray-400 hover:text-gray-600"><FiX className="text-xl" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Assign personnel to: <strong>{assignModal.title}</strong></p>
            <select value={selectedPersonnel} onChange={(e) => setSelectedPersonnel(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="">Select Personnel</option>
              {personnel.map((p) => (
                <option key={p.id} value={p.id}>{p.name} - {p.specialization} (Rating: {p.rating?.toFixed(1)})</option>
              ))}
            </select>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setAssignModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
              <button onClick={handleAssign} disabled={!selectedPersonnel}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
