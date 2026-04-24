import React, { useState, useEffect } from 'react';
import { staffAPI } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import toast from 'react-hot-toast';
import {
  FiCheckCircle, FiPlay, FiCamera, FiPhone, FiHome,
  FiTag, FiUser, FiClock, FiList, FiAlertTriangle,
  FiActivity,
} from 'react-icons/fi';

const FILTERS = [
  { value: '',            label: 'All Tasks',   icon: FiList },
  { value: 'assigned',    label: 'Assigned',    icon: FiAlertTriangle },
  { value: 'in_progress', label: 'In Progress', icon: FiActivity },
  { value: 'completed',   label: 'Completed',   icon: FiCheckCircle },
];

const PRIORITY_BAR = {
  urgent:  'border-l-red-500',
  high:    'border-l-orange-400',
  medium:  'border-l-blue-400',
  low:     'border-l-gray-300',
};

export default function StaffDashboard() {
  const [assignments, setAssignments]   = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading]           = useState(true);
  const [counts, setCounts]             = useState({});

  useEffect(() => { loadTasks(); }, [statusFilter]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await staffAPI.getMyTasks({ status: statusFilter || undefined });
      setAssignments(res.data.assignments || []);
      // count per status for badge
      if (!statusFilter) {
        const c = {};
        (res.data.assignments || []).forEach((a) => { c[a.status] = (c[a.status] || 0) + 1; });
        setCounts(c);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await staffAPI.updateTaskStatus(id, { status });
      toast.success(status === 'in_progress' ? 'Work started!' : 'Task marked as done!');
      loadTasks();
    } catch {
      toast.error('Failed to update task status');
    }
  };

  const uploadProof = async (id, file) => {
    const fd = new FormData();
    fd.append('proof', file);
    try {
      await staffAPI.uploadProof(id, fd);
      toast.success('Proof uploaded successfully');
      loadTasks();
    } catch {
      toast.error('Upload failed');
    }
  };

  const total      = Object.values(counts).reduce((a, b) => a + b, 0);
  const completed  = counts['completed'] || 0;
  const progress   = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">

      {/* ── Header ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {total > 0 ? `${total} total · ${completed} completed` : 'No tasks assigned yet'}
          </p>
        </div>

        {/* Progress */}
        {total > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-card flex items-center space-x-4 min-w-[220px]">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500 font-medium">Today's Progress</span>
                <span className="text-primary-600 font-bold">{progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-600 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => {
          const cnt = f.value === '' ? total : (counts[f.value] || 0);
          const active = statusFilter === f.value;
          return (
            <button key={f.value} onClick={() => setStatusFilter(f.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition
                ${active
                  ? 'bg-primary-600 text-white shadow-glow'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}>
              <f.icon className="text-sm" />
              <span>{f.label}</span>
              {cnt > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold
                  ${active ? 'bg-white text-primary-600' : 'bg-gray-100 text-gray-600'}`}>
                  {cnt}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Task list ── */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-card py-16 text-center">
          <FiCheckCircle className="text-5xl mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 font-medium">No tasks found</p>
          <p className="text-gray-400 text-sm mt-1">
            {statusFilter ? `No ${statusFilter.replace('_', ' ')} tasks` : 'You have no assigned tasks yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment, idx) => {
            const req      = assignment.serviceRequest;
            const barColor = PRIORITY_BAR[req?.priority] || 'border-l-gray-300';
            return (
              <div key={assignment.id}
                className={`bg-white rounded-xl border border-gray-200 border-l-4 ${barColor} shadow-card
                  hover:shadow-card-md transition-all duration-200 p-5 animate-fade-in`}
                style={{ animationDelay: `${idx * 50}ms` }}>

                {/* Card header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900">{req?.title}</h3>
                      <PriorityBadge priority={req?.priority} />
                      <StatusBadge status={assignment.status} />
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{req?.description}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 min-w-[148px]">
                    {assignment.status === 'assigned' && (
                      <button onClick={() => updateStatus(assignment.id, 'in_progress')}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
                        <FiPlay className="text-sm" /><span>Start Work</span>
                      </button>
                    )}
                    {assignment.status === 'in_progress' && (
                      <>
                        <button onClick={() => updateStatus(assignment.id, 'completed')}
                          className="flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition shadow-sm">
                          <FiCheckCircle className="text-sm" /><span>Mark Done</span>
                        </button>
                        <label className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition">
                          <FiCamera className="text-sm" /><span>Upload Proof</span>
                          <input type="file" accept="image/*" className="hidden"
                            onChange={(e) => e.target.files[0] && uploadProof(assignment.id, e.target.files[0])} />
                        </label>
                      </>
                    )}
                    {assignment.status === 'completed' && (
                      <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                        <FiCheckCircle className="text-green-500" />
                        <span>{assignment.proofImage ? 'Proof uploaded' : 'Completed'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resident info chips */}
                <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                  {req?.resident?.name && (
                    <span className="flex items-center space-x-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                      <FiUser className="text-gray-400" /><span>{req.resident.name}</span>
                    </span>
                  )}
                  {(req?.resident?.houseNumber || req?.resident?.tower) && (
                    <span className="flex items-center space-x-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                      <FiHome className="text-gray-400" />
                      <span>{req.resident.houseNumber}{req.resident.tower ? `, ${req.resident.tower}` : ''}</span>
                    </span>
                  )}
                  {req?.resident?.phone && (
                    <a href={`tel:${req.resident.phone}`}
                      className="flex items-center space-x-1.5 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full hover:bg-blue-100 transition">
                      <FiPhone className="text-blue-500" /><span>{req.resident.phone}</span>
                    </a>
                  )}
                  {req?.category && (
                    <span className="flex items-center space-x-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full capitalize">
                      <FiTag className="text-gray-400" /><span>{req.category.replace('_', ' ')}</span>
                    </span>
                  )}
                  {assignment.createdAt && (
                    <span className="flex items-center space-x-1.5 text-xs text-gray-400 ml-auto">
                      <FiClock className="text-gray-300" />
                      <span>Assigned {new Date(assignment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
