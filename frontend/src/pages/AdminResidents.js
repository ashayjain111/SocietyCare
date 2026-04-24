import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { FiSearch, FiUser, FiHome, FiPhone, FiMail, FiUsers } from 'react-icons/fi';

export default function AdminResidents() {
  const [residents, setResidents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [tower, setTower] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadResidents(); }, [page, tower]);

  const loadResidents = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (tower) params.tower = tower;
      const res = await adminAPI.getResidents(params);
      setResidents(res.data.residents || []);
      setTotal(res.data.total || 0);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Residents</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} registered residents</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
          <input type="text" placeholder="Search by name, email, flat…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadResidents()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <select value={tower} onChange={(e) => { setTower(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">All Towers</option>
          <option value="A">Tower A</option>
          <option value="B">Tower B</option>
          <option value="C">Tower C</option>
          <option value="D">Tower D</option>
        </select>
        <button onClick={() => { setPage(1); loadResidents(); }}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition">
          Search
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="skeleton h-40 rounded-xl" />)}
        </div>
      ) : residents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FiUsers className="text-5xl text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No residents found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {residents.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 shadow-card p-5 hover:shadow-card-md transition">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiUser className="text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{r.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{r.isEmailVerified ? 'Verified' : 'Unverified'}</p>
                  </div>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0
                    ${r.isEmailVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {r.isEmailVerified ? 'Active' : 'Pending'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-500">
                  {(r.houseNumber || r.tower) && (
                    <div className="flex items-center space-x-2">
                      <FiHome className="text-gray-400 flex-shrink-0" />
                      <span>Flat {r.houseNumber}{r.tower ? `, Tower ${r.tower}` : ''}</span>
                    </div>
                  )}
                  {r.phone && (
                    <div className="flex items-center space-x-2">
                      <FiPhone className="text-gray-400 flex-shrink-0" />
                      <a href={`tel:${r.phone}`} className="text-blue-600 hover:underline">{r.phone}</a>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <FiMail className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{r.email}</span>
                  </div>
                  {r.familyMembers?.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <FiUsers className="text-gray-400 flex-shrink-0" />
                      <span>{r.familyMembers.length} family member{r.familyMembers.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Showing page {page} of {totalPages}</span>
              <div className="flex space-x-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50 transition">Prev</button>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50 transition">Next</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
