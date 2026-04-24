import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { serviceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiUser, FiHome, FiTag, FiClock, FiCheckCircle,
  FiAlertTriangle, FiStar, FiMessageSquare, FiTool,
} from 'react-icons/fi';

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => { loadRequest(); }, [id]);

  const loadRequest = async () => {
    try {
      const res = await serviceAPI.getById(id);
      setRequest(res.data.request);
    } catch {
      toast.error('Request not found');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (resolved) => {
    setConfirming(true);
    try {
      await serviceAPI.confirmService(id, { helpReceived: true, issueResolved: resolved });
      toast.success(resolved ? 'Great! Issue marked as resolved.' : 'Request reopened for further attention.');
      loadRequest();
    } catch {
      toast.error('Failed to confirm service');
    } finally {
      setConfirming(false);
    }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await serviceAPI.submitFeedback(id, feedback);
      toast.success('Thank you for your feedback!');
      loadRequest();
    } catch {
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="skeleton h-8 w-48 rounded" />
          <div className="skeleton h-48 rounded-xl" />
          <div className="skeleton h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!request) return null;

  const canConfirm = user?.role === 'resident' && request.status === 'completed' && !request.issueResolved;
  const canFeedback = user?.role === 'resident' && request.status === 'completed' && !request.feedback;
  const latestAssignment = request.assignments?.[request.assignments.length - 1];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-500 hover:text-gray-800 mb-6 transition text-sm">
        <FiArrowLeft /><span>Back</span>
      </button>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6 mb-4">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{request.title}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Request #{request.id} · {new Date(request.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <PriorityBadge priority={request.priority} />
            <StatusBadge status={request.status} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-500">
          <span className="flex items-center space-x-1 bg-gray-50 px-2.5 py-1 rounded-full capitalize">
            <FiTag className="text-gray-400" /><span>{request.category?.replace('_', ' ')}</span>
          </span>
          {request.resident && (
            <span className="flex items-center space-x-1 bg-gray-50 px-2.5 py-1 rounded-full">
              <FiUser className="text-gray-400" /><span>{request.resident.name}</span>
            </span>
          )}
          {(request.resident?.houseNumber || request.resident?.tower) && (
            <span className="flex items-center space-x-1 bg-gray-50 px-2.5 py-1 rounded-full">
              <FiHome className="text-gray-400" />
              <span>{request.resident?.houseNumber}{request.resident?.tower ? `, ${request.resident.tower}` : ''}</span>
            </span>
          )}
          <span className="flex items-center space-x-1 bg-gray-50 px-2.5 py-1 rounded-full">
            <FiClock className="text-gray-400" />
            <span>{new Date(request.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          </span>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{request.description}</p>

        {request.aiSummary && (
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-blue-700 mb-1">AI Summary</p>
            <p className="text-xs text-blue-600">{request.aiSummary}</p>
          </div>
        )}

        {/* Images */}
        {request.images?.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">Attachments</p>
            <div className="flex flex-wrap gap-2">
              {request.images.map((img, i) => (
                <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                  <img src={img} alt={`attachment-${i}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Assignment card */}
      {latestAssignment && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6 mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <FiTool className="text-primary-600" />
            <h2 className="font-semibold text-gray-900 text-sm">Assigned Personnel</h2>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <FiUser className="text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{latestAssignment.personnel?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{latestAssignment.personnel?.specialization}</p>
              {latestAssignment.personnel?.phone && (
                <a href={`tel:${latestAssignment.personnel.phone}`} className="text-xs text-blue-600 hover:underline">
                  {latestAssignment.personnel.phone}
                </a>
              )}
            </div>
          </div>
          {latestAssignment.notes && (
            <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">{latestAssignment.notes}</p>
          )}
        </div>
      )}

      {/* Confirm completion (resident only) */}
      {canConfirm && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <FiAlertTriangle className="text-amber-500" />
            <h2 className="font-semibold text-amber-800 text-sm">Was your issue resolved?</h2>
          </div>
          <p className="text-xs text-amber-700 mb-4">Please confirm if the service personnel resolved your issue.</p>
          <div className="flex space-x-3">
            <button onClick={() => handleConfirm(true)} disabled={confirming}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50">
              <FiCheckCircle /><span>Yes, resolved!</span>
            </button>
            <button onClick={() => handleConfirm(false)} disabled={confirming}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition disabled:opacity-50">
              <FiAlertTriangle /><span>No, reopen</span>
            </button>
          </div>
        </div>
      )}

      {/* Feedback form (resident only, after resolved) */}
      {canFeedback && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6 mb-4">
          <div className="flex items-center space-x-2 mb-4">
            <FiStar className="text-amber-400" />
            <h2 className="font-semibold text-gray-900 text-sm">Rate the Service</h2>
          </div>
          <form onSubmit={handleFeedback} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex space-x-2">
                {[1,2,3,4,5].map((star) => (
                  <button key={star} type="button" onClick={() => setFeedback({ ...feedback, rating: star })}
                    className={`text-2xl transition ${star <= feedback.rating ? 'text-amber-400' : 'text-gray-200 hover:text-amber-200'}`}>
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Comments (optional)</label>
              <textarea value={feedback.comment} onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                rows={3} placeholder="How was your experience?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
            </div>
            <button type="submit" disabled={submitting}
              className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition disabled:opacity-50">
              {submitting ? 'Submitting…' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      )}

      {/* Existing feedback */}
      {request.feedback && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
          <div className="flex items-center space-x-2 mb-3">
            <FiMessageSquare className="text-amber-400" />
            <h2 className="font-semibold text-gray-900 text-sm">Your Feedback</h2>
          </div>
          <div className="flex items-center space-x-1 mb-2">
            {[1,2,3,4,5].map((s) => (
              <span key={s} className={`text-xl ${s <= request.feedback.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
            ))}
            <span className="text-xs text-gray-500 ml-2">{request.feedback.rating}/5</span>
          </div>
          {request.feedback.comment && (
            <p className="text-sm text-gray-600">{request.feedback.comment}</p>
          )}
        </div>
      )}
    </div>
  );
}
