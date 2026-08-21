import React from 'react';
import { Shield, Lock, CheckCircle, Scale } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 pt-8 pb-12 border-t border-slate-200/80 text-center text-slate-500">
      <div className="max-w-4xl mx-auto px-4">
        
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          Industry Standards & Security Compliance
        </h4>
        <p className="text-xs text-slate-500 max-w-xl mx-auto mb-4">
          All document processing happens in encrypted memory buffers and is purged from storage immediately after analysis.
        </p>

        <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold text-slate-600 mb-6">
          <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-blue-600" /> AES-256 Encryption</span>
          <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-emerald-600" /> ISO 27001 Data Compliant</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-indigo-600" /> AI Legal Framework Certified</span>
          <span className="flex items-center gap-1.5"><Scale className="w-3.5 h-3.5 text-sky-600" /> Bar Standard Playbook</span>
        </div>

        <p className="text-[11px] text-slate-400">
          © 2026 LegalEase Verification Portal. Built for high-stakes legal compliance and contract risk mitigation.
        </p>

      </div>
    </footer>
  );
}
