import React from 'react';
import { Sparkles, Shield, Zap, Volume2, Lock, AlertTriangle } from 'lucide-react';

export default function HeroBanner() {
  return (
    <section className="text-center my-6">
      
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
            <span>Legal Verification</span>
          </span>
          <span className="doc-tag">
            <Volume2 className="w-3.5 h-3.5 text-sky-600" />
            <span>Voice Synthesis</span>
          </span>
          <span className="doc-tag">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>AES-256 Encryption</span>
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
