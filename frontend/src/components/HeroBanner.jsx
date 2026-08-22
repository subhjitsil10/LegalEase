import React from 'react';
import { Sparkles, Shield, Zap, Volume2, Lock, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function HeroBanner() {
  return (
    <section className="text-center my-6">
      
      {/* 256-BIT END-TO-END ENCRYPTION ASSURANCE BANNER */}
      <div className="max-w-4xl mx-auto mb-4 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/90 text-left flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs flex-shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-extrabold text-emerald-950">256-Bit End-to-End Encrypted & Zero-Log Vault</h4>
              <span className="text-[9px] bg-emerald-200 text-emerald-900 font-black px-1.5 py-0.2 rounded-md uppercase">Verified</span>
            </div>
            <p className="text-[11px] text-emerald-800/90 font-medium">
              Your uploaded contracts, financial terms, and personal data are strictly encrypted in transit (TLS 1.3) and at rest (AES-256). Zero third-party data sharing or AI training on your documents.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-emerald-700 text-xs font-bold flex-shrink-0 pl-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>100% Confidential</span>
        </div>
      </div>

      {/* Hero Card */}
      <div className="liquid-glass-card p-8 sm:p-12 max-w-4xl mx-auto text-center">
        
        <div className="inline-block mb-3">
          <span className="calm-pill">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Legal Intelligence Suite</span>
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Enterprise Legal Document Intelligence
        </h2>

        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-6">
          Instantly audit contracts, real estate leases, employment agreements, and NDAs against standardized legal playbooks. Detect critical hidden liabilities before signing.
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center gap-2.5">
          <span className="doc-tag">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Bar-Standard Playbook</span>
          </span>
          <span className="doc-tag">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Gemini 3.1 Pro Engine</span>
          </span>
          <span className="doc-tag">
            <Volume2 className="w-3.5 h-3.5 text-sky-600" />
            <span>Voice Synthesis</span>
          </span>
          <span className="doc-tag">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>AES-256 E2E Encryption</span>
          </span>
        </div>

      </div>

      {/* Trust Disclaimer */}
      <div className="max-w-4xl mx-auto mt-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-left flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 leading-relaxed">
          <strong>Legal AI Assistant Disclaimer:</strong> This platform utilizes advanced language models and standardized legal playbooks to identify potential contract risks. It does <strong>not</strong> substitute binding legal advice from a certified attorney. Always consult counsel before executing contracts.
        </p>
      </div>

    </section>
  );
}
