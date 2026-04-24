import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiMic, FiStopCircle, FiUpload, FiSend } from 'react-icons/fi';

const categories = [
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'painting', label: 'Painting' },
  { value: 'pest_control', label: 'Pest Control' },
  { value: 'security', label: 'Security' },
  { value: 'other', label: 'Other' },
];

export default function NewRequest() {
  const [form, setForm] = useState({ title: '', description: '', category: '', priority: 'medium', originalLanguage: 'en' });
  const [images, setImages] = useState([]);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const mediaRecorder = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.current.start();
      setRecording(true);
    } catch (err) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description && !audioBlob) {
      return toast.error('Please provide a description or voice note');
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('category', form.category);
    formData.append('priority', form.priority);
    formData.append('originalLanguage', form.originalLanguage);
    images.forEach((img) => formData.append('images', img));
    if (audioBlob) formData.append('voiceNote', audioBlob, 'voice.webm');

    try {
      await serviceAPI.create(formData);
      toast.success('Service request created successfully!');
      navigate('/my-requests');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Service Request</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input type="text" name="title" value={form.title} onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="Brief title for your request (AI can auto-generate)" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
              <option value="">Auto-detect</option>
              {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select name="originalLanguage" value={form.originalLanguage} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={5}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            placeholder="Describe your issue in detail. You can write in Hindi or English - AI will translate and summarize automatically." />
        </div>

        {/* Voice Recording */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Or use voice:</span>
          {!recording ? (
            <button type="button" onClick={startRecording}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
              <FiMic className="text-red-500" />
              <span className="text-sm">Start Recording</span>
            </button>
          ) : (
            <button type="button" onClick={stopRecording}
              className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition animate-pulse">
              <FiStopCircle />
              <span className="text-sm">Stop Recording</span>
            </button>
          )}
          {audioBlob && <span className="text-sm text-green-600">Voice note recorded</span>}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Attach Images (optional)</label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer">
              <FiUpload />
              <span className="text-sm">Upload Images</span>
              <input type="file" accept="image/*" multiple onChange={(e) => setImages([...e.target.files])} className="hidden" />
            </label>
            {images.length > 0 && <span className="text-sm text-gray-600">{images.length} file(s) selected</span>}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button type="button" onClick={() => navigate(-1)}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex items-center space-x-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50">
            <FiSend />
            <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
