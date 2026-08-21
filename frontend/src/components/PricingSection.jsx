import React from 'react';
import { Check, Sparkles } from 'lucide-react';

export default function PricingSection({ onSelectPlan }) {
  return (
    <section className="max-w-4xl mx-auto mb-10">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Flexible Membership Plans</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Start free with 3 audits, then upgrade for unlimited intelligence.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        
        {/* Free Tier */}
        <div className="liquid-glass-card p-5 flex flex-col justify-between">
          <div>
            <span className="doc-tag text-[11px] px-2 py-0.5 mb-2">STARTER</span>
            <h4 className="font-bold text-slate-900 text-base">Free Trial</h4>
            <div className="text-2xl font-extrabold text-slate-800 my-2">
              ₹0 <span className="text-xs font-normal text-slate-500">/ forever</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 mt-3">
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600" /> 3 Document Compliance Audits</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600" /> Standard 4-Pillar Playbook</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600" /> Community Guidance</li>
            </ul>
          </div>
          <div className="mt-5 p-2 bg-slate-100/80 rounded-xl text-center text-xs font-semibold text-slate-600">
            Active on Registration
          </div>
        </div>

        {/* Pro Monthly */}
        <div className="liquid-glass-card p-5 border-blue-300 flex flex-col justify-between shadow-md">
          <div>
            <span className="doc-tag text-[11px] px-2 py-0.5 mb-2 bg-blue-50 text-blue-700 border-blue-200">POPULAR</span>
            <h4 className="font-bold text-slate-900 text-base">Pro Monthly</h4>
            <div className="text-2xl font-extrabold text-blue-700 my-2">
              ₹199 <span className="text-xs font-normal text-slate-500">/ month</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700 mt-3">
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600" /> <strong>Unlimited</strong> Audits</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600" /> Priority GenAI Flash Speed</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600" /> Multilingual Audio Briefings</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600" /> 24/7 AI Legal Counsel</li>
            </ul>
          </div>
          <button
            onClick={() => onSelectPlan({ name: 'Pro Monthly', price: 199, period: 'month' })}
            className="w-full mt-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upgrade to Pro • ₹199</span>
          </button>
        </div>

        {/* Enterprise Annual */}
        <div className="liquid-glass-card p-5 border-2 border-indigo-400 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-bl-lg uppercase">
            Save 17%
          </div>
          <div>
            <span className="doc-tag text-[11px] px-2 py-0.5 mb-2 bg-indigo-50 text-indigo-700 border-indigo-200">BEST VALUE</span>
            <h4 className="font-bold text-slate-900 text-base">Enterprise Annual</h4>
            <div className="text-2xl font-extrabold text-indigo-700 my-2">
              ₹1,999 <span className="text-xs font-normal text-slate-500">/ year</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700 mt-3">
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600" /> Everything in Pro</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600" /> <strong>2 Months Free</strong></li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600" /> Custom Firm Playbooks</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600" /> Batch Multi-Auditing</li>
            </ul>
          </div>
          <button
            onClick={() => onSelectPlan({ name: 'Enterprise Annual', price: 1999, period: 'year' })}
            className="w-full mt-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Choose Annual • ₹1,999</span>
          </button>
        </div>

      </div>
    </section>
  );
}
