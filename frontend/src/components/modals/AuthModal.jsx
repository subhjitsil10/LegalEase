import React, { useState, useEffect } from 'react';
import { X, Mail, ShieldCheck, RefreshCw, Volume2, ArrowLeft, User, Phone, Briefcase, Building } from 'lucide-react';
import { api, setToken } from '../../api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [step, setStep] = useState('request_otp'); // 'request_otp', 'verify_otp', 'profile'
  const [email, setEmail] = useState('');
  const [captchaData, setCaptchaData] = useState({ captcha_text: '', image_url: '', audio_url: '' });
  const [captchaInput, setCaptchaInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  
  // Extended profile fields
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [age, setAge] = useState(24);
  const [profession, setProfession] = useState('Student');
  const [orgName, setOrgName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCaptcha = async () => {
    try {
      const data = await api.getCaptcha();
      setCaptchaData(data);
      setCaptchaInput('');
    } catch (err) {
      console.error('Captcha error:', err);
    }
  };

  useEffect(() => {
    if (isOpen && step === 'request_otp') {
      fetchCaptcha();
      setError('');
    }
  }, [isOpen, step]);

  useEffect(() => {
    let timer;
    if (step === 'verify_otp' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  if (!isOpen) return null;

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!captchaInput || captchaInput.toUpperCase() !== captchaData.captcha_text) {
      setError('CAPTCHA verification mismatch. Please try again.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.requestOtp(email, captchaData.captcha_text, captchaInput);
      setStep('verify_otp');
      setTimeLeft(60);
    } catch (err) {
      setError(err.message || 'Failed to dispatch verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 4) {
      setError('Please enter the 4-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.verifyOtp(email, otpCode);
      if (res.is_new_user) {
        setStep('profile');
      } else {
        setToken(res.token);
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your Full Legal Name.');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Please enter your Phone Number.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.register({
        email,
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        age: parseInt(age) || 24,
        profession,
        org_name: orgName.trim()
      });
      setToken(res.token);
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="modal-glass-container w-full max-w-md p-6 sm:p-8 relative text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/70 hover:bg-white text-slate-500 hover:text-slate-900 border border-slate-200 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: REQUEST OTP */}
        {step === 'request_otp' && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-blue-100/80 text-blue-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Secure Sign In</h3>
                <p className="text-xs text-slate-500">Access enterprise legal audits & AI counsel</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 my-4">
              Enter your work or personal email to receive a secure 4-digit verification code.
            </p>

            {error && (
              <div className="p-3 mb-4 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/90 border border-sky-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* CAPTCHA Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Human Verification</label>
                <div className="flex items-center gap-3 p-2 bg-white/90 border border-sky-200 rounded-xl">
                  {captchaData.image_url && (
                    <img src={captchaData.image_url} alt="Captcha" className="h-12 rounded-lg border border-slate-200" />
                  )}
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                    title="Refresh CAPTCHA"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  {captchaData.audio_url && (
                    <button
                      type="button"
                      onClick={() => new Audio(captchaData.audio_url).play()}
                      className="p-2 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50"
                      title="Play Audio Code"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter code from above image"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="w-full mt-2 px-3.5 py-2 bg-white/90 border border-sky-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Dispatching 256-bit Code...' : 'Request Access Code'}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 'verify_otp' && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-blue-100/80 text-blue-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Verify Code</h3>
                <p className="text-xs text-slate-500">Dispatched to <span className="font-semibold text-blue-700">{email}</span></p>
              </div>
            </div>

            {error && (
              <div className="p-3 my-3 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4 my-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Enter 4-Digit Security Code</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="••••"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full tracking-widest text-center text-2xl font-bold py-2.5 bg-white border border-sky-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all"
                >
                  {loading ? 'Authenticating...' : 'Authenticate'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('request_otp')}
                  className="px-4 py-3 bg-white/80 hover:bg-white text-slate-700 font-semibold text-sm border border-slate-200 rounded-xl flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Change
                </button>
              </div>

              <div className="text-center text-xs text-slate-500 mt-2">
                {timeLeft > 0 ? (
                  <span>⏳ Resend code in {timeLeft}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setStep('request_otp'); fetchCaptcha(); }}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    🔄 Resend New Code
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: COMPLETE PROFILE */}
        {step === 'profile' && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-blue-100/80 text-blue-700">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Complete Your Profile</h3>
                <p className="text-xs text-slate-500">Personalize your legal intelligence workspace</p>
              </div>
            </div>

            {error && (
              <div className="p-3 my-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3.5 mt-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/90 border border-sky-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/90 border border-sky-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Profession *</label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age *</label>
                  <input
                    type="number"
                    min={16}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2 bg-white/90 border border-sky-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Law Firm (Optional)</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp / Law University"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/90 border border-sky-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all mt-4"
              >
                {loading ? 'Initializing Dashboard...' : 'Complete Registration & Access Workspace'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
