import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, ShieldCheck, RefreshCw, Volume2, ArrowLeft, User, Phone, Briefcase, Building, LogIn, UserPlus, Sparkles } from 'lucide-react';
import { api, setToken } from '../../api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [step, setStep] = useState('request_otp'); // 'request_otp', 'verify_otp', 'profile'
  const [email, setEmail] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  
  const canvasRef = useRef(null);

  // Extended profile fields for Sign Up
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [age, setAge] = useState(24);
  const [profession, setProfession] = useState('Student');
  const [orgName, setOrgName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateNewCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
    drawCaptchaCanvas(code);
  };

  const drawCaptchaCanvas = (code) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f0f9ff');
    grad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Random intersecting noise lines
    const colors = ['#93c5fd', '#38bdf8', '#60a5fa', '#818cf8'];
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Random noise dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1 + Math.random(), 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw characters with tilt and style
    ctx.textBaseline = 'middle';
    const charList = code.split('');
    const charWidth = width / (charList.length + 1);

    charList.forEach((char, index) => {
      ctx.save();
      const x = (index + 0.8) * charWidth;
      const y = height / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 30 - 15) * Math.PI / 180;

      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = ['#1e40af', '#0369a1', '#1d4ed8', '#0f766e'][index % 4];
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 3;
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });
  };

  const playAudioCaptcha = () => {
    if (!captchaCode) return;
    if ('speechSynthesis' in window) {
      const spaced = captchaCode.split('').join('. ');
      const utterance = new SpeechSynthesisUtterance(`Verification code is: ${spaced}`);
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (isOpen && step === 'request_otp') {
      setTimeout(() => generateNewCaptcha(), 50);
      setError('');
    }
  }, [isOpen, step, mode]);

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
    if (!captchaInput || captchaInput.trim().toUpperCase() !== captchaCode.trim().toUpperCase()) {
      setError('CAPTCHA verification mismatch. Please enter the characters shown in the image.');
      generateNewCaptcha();
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.requestOtp(email, captchaCode, captchaInput);
      setStep('verify_otp');
      setTimeLeft(60);
    } catch (err) {
      setStep('verify_otp');
      setTimeLeft(60);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setError('Please enter the 4-digit verification code sent to your email.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.verifyOtp(email, otpCode);

      // Load existing user details if available
      if (res.user) {
        if (res.user.full_name) setFullName(res.user.full_name);
        if (res.user.phone_number) setPhoneNumber(res.user.phone_number);
        if (res.user.age) setAge(res.user.age);
        if (res.user.profession) setProfession(res.user.profession);
        if (res.user.org_name) setOrgName(res.user.org_name);
      }

      // Always open the Details Slide to confirm/enter profile details
      setStep('profile');
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please check your email and try again.');
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
      setError(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md overflow-y-auto">
      <div className="modal-glass-container w-full max-w-md p-6 sm:p-8 relative text-slate-800 animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/70 hover:bg-white text-slate-500 hover:text-slate-900 border border-slate-200 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Brand Header */}
        <div className="flex items-center gap-3 mb-4">
          <img src="/favicon.svg" alt="LegalEase" className="w-10 h-10 rounded-xl shadow-sm" />
          <div>
            <h3 className="text-xl font-black text-slate-900">LegalEase</h3>
            <p className="text-xs text-slate-500">Autonomous Legal Intelligence & Playbook Compliance</p>
          </div>
        </div>

        {/* Mode Switch Tabs (Log In vs Sign Up) */}
        {step === 'request_otp' && (
          <div className="flex p-1 mb-5 bg-slate-100/90 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        )}

        {/* STEP 1: REQUEST OTP */}
        {step === 'request_otp' && (
          <div>
            <p className="text-xs text-slate-600 mb-4 font-medium">
              {mode === 'login'
                ? 'Welcome back! Enter your registered email to receive your 4-digit login code.'
                : 'Create your free account. Enter your email to receive your verification code.'}
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

              {/* Instant Canvas CAPTCHA */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Human Verification</label>
                <div className="flex items-center gap-3 p-2 bg-white/90 border border-sky-200 rounded-xl">
                  <canvas
                    ref={canvasRef}
                    width={180}
                    height={46}
                    className="rounded-lg border border-slate-200 shadow-inner bg-sky-50"
                  />
                  <button
                    type="button"
                    onClick={generateNewCaptcha}
                    className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                    title="Refresh CAPTCHA"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={playAudioCaptcha}
                    className="p-2 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition-all cursor-pointer"
                    title="Listen to Verification Code"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter characters from image"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="w-full mt-2 px-3.5 py-2 bg-white/90 border border-sky-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-wider"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Dispatching Code to Inbox...</span>
                  </>
                ) : (
                  <span>{mode === 'login' ? 'Send Login Code' : 'Send Verification Code'}</span>
                )}
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
                <h3 className="text-xl font-extrabold text-slate-900">Check Your Email</h3>
                <p className="text-xs text-slate-500">Security code sent to <span className="font-semibold text-blue-700">{email}</span></p>
              </div>
            </div>

            <div className="p-3 my-3 bg-blue-50/80 border border-blue-200 rounded-xl text-center">
              <p className="text-xs text-slate-700 font-medium">
                📩 We sent a 4-digit code to your email. Check your inbox and Spam folder.
              </p>
            </div>

            {error && (
              <div className="p-3 my-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4 my-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Enter 4-Digit Code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="••••"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full tracking-widest text-center text-2xl font-black py-2.5 bg-white border border-sky-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'Authenticating...' : (mode === 'login' ? 'Log In' : 'Verify & Continue')}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('request_otp')}
                  className="px-4 py-3 bg-white/80 hover:bg-white text-slate-700 font-semibold text-sm border border-slate-200 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Change
                </button>
              </div>

              <div className="text-center text-xs text-slate-500 mt-2">
                {timeLeft > 0 ? (
                  <span>Resend code in {timeLeft}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: PROFESSIONAL SIGN UP DETAILS SLIDE */}
        {step === 'profile' && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Complete Your Profile</h3>
                <p className="text-xs text-slate-500">Set up your LegalEase member identity</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 my-3 font-medium">
              Verified email: <span className="font-bold text-blue-700">{email}</span>
            </p>

            {error && (
              <div className="p-3 mb-3 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Adv. Priya Sharma / John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-sky-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-white border border-sky-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Profession / Role</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-sky-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="Student">Student / Researcher</option>
                    <option value="Legal Professional">Legal Professional / Advocate</option>
                    <option value="Corporate Counsel">Corporate Counsel / Paralegal</option>
                    <option value="Tenant / Landlord">Tenant / Landlord</option>
                    <option value="Business Owner">Business Owner / Founder</option>
                    <option value="Freelancer / Consultant">Freelancer / Consultant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Firm (Optional)</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Legal Chambers, University, Tech Corp"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-sky-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Creating Account & Initializing 3 Audits...' : '🚀 Complete Sign Up & Enter'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
