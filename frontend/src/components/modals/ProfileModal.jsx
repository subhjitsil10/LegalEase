import React, { useState } from 'react';
import { X, User, Phone, Briefcase, Building, Upload, LogOut, CheckCircle } from 'lucide-react';
import { api, API_BASE, removeToken } from '../../api';

export default function ProfileModal({ isOpen, user, onClose, onUserUpdate, onLogout }) {
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [age, setAge] = useState(user?.age || 24);
  const [profession, setProfession] = useState(user?.profession || 'Student');
  const [orgName, setOrgName] = useState(user?.org_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !user) return null;

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const res = await api.uploadAvatar(file);
      setAvatarUrl(res.avatar_url);
      onUserUpdate({ ...user, avatar_url: res.avatar_url });
      setSuccessMsg('Profile picture updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload image.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Full Name cannot be empty.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.updateProfile({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        age: parseInt(age) || 24,
        profession,
        org_name: orgName.trim()
      });
      onUserUpdate(res.user);
      setSuccessMsg('Profile details saved!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    removeToken();
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="modal-glass-container w-full max-w-lg p-6 sm:p-8 relative text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/70 hover:bg-white text-slate-500 hover:text-slate-900 border border-slate-200 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-extrabold text-slate-900 mb-1">User Profile & Settings</h3>
        <p className="text-xs text-slate-500 mb-4">Manage your credentials, professional tags, and active preferences.</p>

        {successMsg && (
          <div className="p-3 mb-3 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 mb-3 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Avatar Upload Section */}
        <div className="flex items-center gap-5 p-3.5 bg-white/70 border border-sky-100 rounded-2xl mb-4">
          <div className="relative">
            {avatarUrl ? (
              <img 
                src={`${API_BASE}${avatarUrl}`} 
                alt="Avatar" 
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {fullName.charAt(0) || '👤'}
              </div>
            )}
          </div>
          <div>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-400 text-slate-700 font-semibold text-xs rounded-xl shadow-sm transition-all">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Upload Picture</span>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
            <p className="text-[11px] text-slate-500 mt-1">Supports PNG, JPG (Max 5MB)</p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 bg-white/90 border border-sky-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Verified Email</label>
            <input
              type="text"
              disabled
              value={user.email}
              className="w-full px-3.5 py-2 bg-slate-100/90 border border-slate-200 rounded-xl text-slate-500 text-sm cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2 bg-white/90 border border-sky-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
              <input
                type="number"
                min={16}
                max={100}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3.5 py-2 bg-white/90 border border-sky-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Profession</label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full px-3 py-2 bg-white/90 border border-sky-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Student">Student</option>
                <option value="Employee">Employee</option>
                <option value="Legal Professional">Legal Professional</option>
                <option value="Business Owner / Founder">Business Owner / Founder</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Firm</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Optional"
                className="w-full px-3.5 py-2 bg-white/90 border border-sky-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all"
            >
              {loading ? 'Saving...' : '💾 Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleLogoutClick}
              className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm border border-red-200 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
