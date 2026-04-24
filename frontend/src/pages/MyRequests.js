import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { serviceAPI } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import { FiPlus, FiFilter } from 'react-icons/fi';

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRequests(); }, [page, statusFilter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await serviceAPI.getMyRequests({ page, limit: 10, status: statusFilter || undefined });
      setRequests(res.data.requests);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
        <Link to="/new-request" className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
          <FiPlus /><span>New Request</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-3 mb-6">
        <FiFilter className="text-gray-400" />
        {['', 'pending', 'assigned', 'in_progress', 'completed', 'reopened'].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {s === '' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No requests found</p>
          <Link to="/new-request" className="text-primary-600 text-sm mt-2 inline-block">Create a new request</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">#{req.id}</td>
                    <td className="px-6 py-4">
                      <Link to={`/requests/${req.id}`} className="text-sm font-medium text-primary-600 hover:text-primary-700">{req.title}</Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{req.category?.replace('_', ' ')}</td>
                    <td className="px-6 py-4"><PriorityBadge priority={req.priority} /></td>
                    <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-500">Showing {requests.length} of {total}</span>
              <div className="flex space-x-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50">Prev</button>
                <span className="px-3 py-1 text-sm">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
