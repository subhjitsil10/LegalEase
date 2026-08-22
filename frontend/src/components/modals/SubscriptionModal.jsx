import React, { useState } from 'react';
import { X, Check, ShieldCheck, Zap, Star, ArrowLeft, Sparkles, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../api';

export default function SubscriptionModal({ isOpen, user, onClose, onSubscriptionSuccess }) {
  const [selectedPlan, setSelectedPlan] = useState(null); // { name: 'Standard Pack (10 Uses)', price: 299, uses: 10 }
  const [paymentMethod, setPaymentMethod] = useState('⚡ UPI (Google Pay / PhonePe / Paytm / BHIM)');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCompletePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.processCheckout(selectedPlan.name, selectedPlan.price, paymentMethod);
      
      // Fire celebratory confetti!
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onSubscriptionSuccess) {
        onSubscriptionSuccess({
          is_subscribed: true,
          subscription_plan: selectedPlan.name,
          audits_added: res.audits_added
        });
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Payment processing failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="modal-glass-container w-full max-w-2xl p-6 sm:p-8 relative text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/70 hover:bg-white text-slate-500 hover:text-slate-900 border border-slate-200 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-2xl font-extrabold text-slate-900 mb-1">Top-Up Audit Credits</h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          Add document compliance audits to your account. No recurring subscription lock-ins. Credits never expire.
        </p>

        {errorMsg && (
          <div className="p-3 mb-4 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl">
            ⚠️ {errorMsg}
          </div>
        )}

        {!selectedPlan ? (
          /* COMPARISON CARDS */
          <div className="grid sm:grid-cols-2 gap-4">
            
            {/* Standard Pack (10 Uses - ₹299) */}
            <div className="p-5 rounded-2xl bg-white/90 border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <span className="doc-tag text-[11px] px-2.5 py-0.5 mb-2 bg-blue-50 text-blue-700 border-blue-200">POPULAR</span>
                <h4 className="text-lg font-bold text-slate-900">Standard Pack</h4>
                <div className="text-3xl font-extrabold text-blue-700 my-2">
                  ₹299 <span className="text-xs font-normal text-slate-500">/ 10 Uses</span>
                </div>
                <p className="text-xs text-blue-600 font-semibold mb-4">₹29.9 per audit • Ideal for contract reviews</p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <strong>+10 Document Audits</strong> credited instantly
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    Priority Gemini 3.6 Flash Processing
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    Multilingual Audio Briefings (EN, HI, BN)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    24/7 AI Legal Counsel Interrogation
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    No expiration date on unused credits
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlan({ name: 'Standard Pack (10 Uses)', price: 299, uses: 10 })}
                className="w-full mt-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Choose 10 Uses • ₹299</span>
              </button>
            </div>

            {/* Pro Power Pack (30 Uses - ₹399) */}
            <div className="p-5 rounded-2xl bg-white/95 border-2 border-indigo-500 shadow-lg shadow-indigo-500/10 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-blue-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wide">
                ⭐ Save 55%
              </div>
              <div>
                <span className="doc-tag text-[11px] px-2.5 py-0.5 mb-2 bg-indigo-50 text-indigo-700 border-indigo-200">BEST VALUE</span>
                <h4 className="text-lg font-bold text-slate-900">Pro Power Pack</h4>
                <div className="text-3xl font-extrabold text-indigo-700 my-2">
                  ₹399 <span className="text-xs font-normal text-slate-500">/ 30 Uses</span>
                </div>
                <p className="text-xs text-indigo-600 font-semibold mb-4">Only ₹13.3 per audit • Best for law firms & businesses</p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <strong>+30 Document Audits</strong> credited instantly
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    Full 4-Pillar Playbook Risk Matrix
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    Instant Camera & PDF Multi-Auditing
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    Unlimited Legal Counsel Deep Dives
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    Credits never expire
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlan({ name: 'Pro Power Pack (30 Uses)', price: 399, uses: 30 })}
                className="w-full mt-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Choose 30 Uses • ₹399</span>
              </button>
            </div>

          </div>
        ) : (
          /* CHECKOUT STEP */
          <form onSubmit={handleCompletePayment} className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-blue-950 text-base">{selectedPlan.name}</h4>
                <p className="text-xs text-blue-700">+{selectedPlan.uses} Legal Document Audits • Instant Top-Up</p>
              </div>
              <div className="text-2xl font-black text-blue-700">
                ₹{selectedPlan.price}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Select Payment Method</label>
              <div className="space-y-2">
                {[
                  '⚡ UPI (Google Pay / PhonePe / Paytm / BHIM)',
                  '💳 Credit / Debit Card',
                  '🏦 Net Banking / Corporate Account'
                ].map(method => (
                  <label key={method} className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${paymentMethod === method ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs' : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'}`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{method}</span>
                  </label>
                ))}
              </div>
            </div>

            {paymentMethod.includes('UPI') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Enter UPI VPA / ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. yourname@okhdfcbank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/90 border border-sky-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {paymentMethod.includes('Card') && (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="•••• •••• •••• ••••"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/90 border border-sky-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expiry / CVV</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY  CVV"
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/90 border border-sky-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {loading ? 'Processing Gateway...' : `Pay ₹${selectedPlan.price} & Add ${selectedPlan.uses} Audits`}
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="px-4 py-3 bg-white/80 hover:bg-white text-slate-700 font-semibold text-sm border border-slate-200 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
