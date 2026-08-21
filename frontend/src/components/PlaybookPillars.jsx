import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Ban, Lightbulb, Clock, ShieldAlert } from 'lucide-react';

export default function PlaybookPillars() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="max-w-4xl mx-auto mb-6">
      
      {/* Supported Classes */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-800 mb-2">📑 Supported Legal Document Classes</h3>
        <div className="flex flex-wrap gap-2">
          <span className="doc-tag text-xs">🏠 Real Estate & Leases</span>
          <span className="doc-tag text-xs">💼 Employment & Severance Agreements</span>
          <span className="doc-tag text-xs">🏥 Medical Consent & Release Forms</span>
          <span className="doc-tag text-xs">📈 NDAs & Financial Guarantees</span>
          <span className="doc-tag text-xs">🤝 Vendor & Master Services Agreements</span>
          <span className="doc-tag text-xs">📜 Power of Attorney & Affidavits</span>
        </div>
      </div>

      {/* Accordion for Playbook Rules */}
      <div className="liquid-glass-card p-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-left font-bold text-sm text-slate-800"
        >
          <span>🔍 Preview Legal Audit Playbook Rules</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200/80 animate-in fade-in duration-200">
            
            <div className="p-3.5 rounded-xl bg-white/80 border border-red-100 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 mb-1">
                <Ban className="w-3.5 h-3.5" />
                <span>Non-Compete</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                Audits post-employment restrictions. Flags Section 27 Contract Act unenforceability.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/80 border border-amber-100 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>IP Assignment</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                Flags predatory claims over pre-existing personal inventions and side projects.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/80 border border-blue-100 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Termination</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                Detects unilateral cancellation, lockouts, and enforces bilateral 30-day notice minimums.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/80 border border-emerald-100 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mb-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Liability Caps</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                Prevents unlimited personal liability for corporate debts, legal fees, or third-party claims.
              </p>
            </div>

          </div>
        )}
      </div>

    </section>
  );
}
