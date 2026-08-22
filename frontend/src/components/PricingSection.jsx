import React from 'react';
import { Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export default function PricingSection({ onSelectPlan }) {
  return (
    <section className="max-w-4xl mx-auto mb-10">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Flexible Audit Packs</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pay only for what you audit. No recurring lock-ins. Top up anytime.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        
        {/* Free Starter */}
        <div className="liquid-glass-card p-5 flex flex-col justify-between">
          <div>
            <span className="doc-tag text-[11px] px-2 py-0.5 mb-2">STARTER</span>
            <h4 className="font-bold text-slate-900 text-base">Free Starter</h4>
            <div className="text-2xl font-extrabold text-slate-800 my-2">
              ₹0 <span className="text-xs font-normal text-slate-500">/ forever</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">Perfect for testing and immediate contract checks.</p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" /> <strong>3 Document Audits</strong></li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" /> Standard 4-Pillar Playbook</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" /> Real-Time Risk Highlighting</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" /> Instant Camera Scanner</li>
            </ul>
          </div>
          <div className="mt-5 p-2 bg-slate-100/80 rounded-xl text-center text-xs font-semibold text-slate-600">
            Active on Sign Up
          </div>
        </div>

        {/* Standard Pack (10 Uses - ₹299) */}
        <div className="liquid-glass-card p-5 border-blue-300 flex flex-col justify-between shadow-md">
          <div>
            <span className="doc-tag text-[11px] px-2 py-0.5 mb-2 bg-blue-50 text-blue-700 border-blue-200">POPULAR</span>
            <h4 className="font-bold text-slate-900 text-base">Standard Pack</h4>
            <div className="text-2xl font-extrabold text-blue-700 my-2">
              ₹299 <span className="text-xs font-normal text-slate-500">/ 10 Uses</span>
            </div>
            <p className="text-[11px] text-blue-600/80 mb-3 font-semibold">₹29.9 per audit • No expiry</p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" /> <strong>+10 Document Audits</strong></li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" /> Priority Gemini 3.6 Flash Processing</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" /> Multilingual Audio Briefings (EN, HI, BN)</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" /> 24/7 AI Legal Counsel Interrogation</li>
            </ul>
          </div>
          <button
            onClick={() => onSelectPlan({ name: 'Standard Pack (10 Uses)', price: 299, uses: 10 })}
            className="w-full mt-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Get 10 Audits • ₹299</span>
          </button>
        </div>

        {/* Pro Power Pack (30 Uses - ₹399) */}
        <div className="liquid-glass-card p-5 border-2 border-indigo-400 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-blue-600 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
            ⭐ SAVE 55%
          </div>
          <div>
            <span className="doc-tag text-[11px] px-2 py-0.5 mb-2 bg-indigo-50 text-indigo-700 border-indigo-200">BEST VALUE</span>
            <h4 className="font-bold text-slate-900 text-base">Pro Power Pack</h4>
            <div className="text-2xl font-extrabold text-indigo-700 my-2">
              ₹399 <span className="text-xs font-normal text-slate-500">/ 30 Uses</span>
            </div>
            <p className="text-[11px] text-indigo-600/80 mb-3 font-semibold">Only ₹13.3 per audit • Maximum Savings</p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" /> <strong>+30 Document Audits</strong></li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" /> Full Playbook Pillar Compliance Suite</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" /> High-Speed Batch Contract Analysis</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" /> Unlimited Legal Counsel Questions</li>
            </ul>
          </div>
          <button
            onClick={() => onSelectPlan({ name: 'Pro Power Pack (30 Uses)', price: 399, uses: 30 })}
            className="w-full mt-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Get 30 Audits • ₹399</span>
          </button>
        </div>

      </div>
    </section>
  );
}
