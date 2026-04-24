import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', houseNumber: '', tower: '', emergencyContact: '', language: 'en' });
  const [familyMembers, setFamilyMembers] = useState([]);
  const [newMember, setNewMember] = useState({ name: '', relation: '', age: '', phone: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: user.phone || '', houseNumber: user.houseNumber || '', tower: user.tower || '', emergencyContact: user.emergencyContact || '', language: user.language || 'en' });
    }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const res = await authAPI.getProfile();
      setFamilyMembers(res.data.user.familyMembers || []);
    } catch (err) { /* ignore */ }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addMember = async () => {
    if (!newMember.name || !newMember.relation) return toast.error('Name and relation required');
    try {
      await authAPI.addFamilyMember({ ...newMember, age: newMember.age ? parseInt(newMember.age) : null });
      toast.success('Family member added');
      setNewMember({ name: '', relation: '', age: '', phone: '' });
      loadProfile();
    } catch (err) {
      toast.error('Failed to add member');
    }
  };

  const removeMember = async (id) => {
    try {
      await authAPI.removeFamilyMember(id);
      toast.success('Member removed');
      loadProfile();
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">House Number</label>
            <input type="text" value={form.houseNumber} onChange={(e) => setForm({ ...form, houseNumber: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tower/Block</label>
            <input type="text" value={form.tower} onChange={(e) => setForm({ ...form, tower: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
            <input type="tel" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button type="submit" disabled={loading}
            className="flex items-center space-x-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            <FiSave /><span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>

      {/* Family Members */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Family Members</h2>

        {familyMembers.length > 0 && (
          <div className="space-y-3 mb-6">
            {familyMembers.map((m) => (
              <div key={m.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div>
                  <p className="font-medium text-gray-900">{m.name}</p>
                  <p className="text-sm text-gray-500">{m.relation} {m.age ? `| Age: ${m.age}` : ''} {m.phone ? `| ${m.phone}` : ''}</p>
                </div>
                <button onClick={() => removeMember(m.id)} className="text-red-500 hover:text-red-700 p-2"><FiTrash2 /></button>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Add Family Member</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input type="text" placeholder="Name" value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            <input type="text" placeholder="Relation" value={newMember.relation}
              onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            <input type="number" placeholder="Age" value={newMember.age}
              onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            <button onClick={addMember}
              className="flex items-center justify-center space-x-1 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
              <FiPlus /><span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
