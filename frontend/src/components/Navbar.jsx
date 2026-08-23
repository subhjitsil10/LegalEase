import React from 'react';
import { Sparkles, LogIn } from 'lucide-react';
import { API_BASE } from '../api';

export default function Navbar({ user, onOpenAuth, onOpenProfile, onOpenSubscription }) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/60 border-b border-white/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="LegalEase Logo" className="w-10 h-10 rounded-2xl shadow-md shadow-blue-500/20" />
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">LegalEase</h1>
            <p className="text-[11px] text-slate-500 font-medium">Autonomous Legal Intelligence & Playbook Compliance</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          
          {/* Plans Button */}
          <button
            onClick={onOpenSubscription}
            className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plans</span>
          </button>

          {/* Auth / Profile Trigger */}
          {user ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1.5 pr-3 bg-white/90 hover:bg-white border border-slate-200 hover:border-blue-300 rounded-2xl shadow-sm transition-all"
            >
              {user.avatar_url ? (
                <img
                  src={`${API_BASE}${user.avatar_url}`}
                  alt="Avatar"
                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  {user.full_name?.charAt(0) || '👤'}
                </div>
              )}
              <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate">
                {user.full_name?.split(' ')[0] || 'Member'}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
