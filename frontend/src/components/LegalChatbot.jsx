import React, { useState } from 'react';
import { MessageSquare, Send, Bot, User, Sparkles } from 'lucide-react';
import { api } from '../api';

export default function LegalChatbot({ user, activeDocumentPath, language, onOpenAuth }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Welcome to your 24/7 AI Legal Counsel! You can ask me anything about standard contract clauses (Non-Competes, IP Assignments, Lease Terms, Indemnity Limits) or general legal queries in ${language}.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    if (!user) {
      onOpenAuth();
      return;
    }

    const userQuery = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);

    setLoading(true);
    try {
      const res = await api.chatCounsel(userQuery, activeDocumentPath, language);
      if (res.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${res.error || 'Chat server response unavailable.'}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Server connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto mb-8">
      <div className="liquid-glass-card p-6 sm:p-8">
        
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200/80">
          <div className="p-2.5 rounded-2xl bg-blue-100/80 text-blue-700">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Your Personal AI Legal Counsel</h3>
            <p className="text-xs text-slate-500">
              {activeDocumentPath ? 'Context: Active Document Loaded for In-Depth Interrogation' : 'Real-time legal guidance on Indian and international contract standards'}
            </p>
          </div>
        </div>

        {/* Message Container */}
        <div className="h-72 overflow-y-auto space-y-3 p-3 bg-white/60 rounded-2xl border border-sky-100 mb-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[82%] shadow-xs ${msg.role === 'user' ? 'bg-blue-600 text-white font-medium rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none whitespace-pre-wrap'}`}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold p-2">
              <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Counsel is evaluating legal doctrines...</span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder={user ? "Ask a legal question or clause clarification..." : "Sign in to ask legal counsel..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-white/90 border border-sky-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>

      </div>
    </section>
  );
}
