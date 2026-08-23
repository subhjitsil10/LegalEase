import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, FileText, CheckCircle2, AlertCircle, Sparkles, Volume2, VolumeX, Lock, Globe, ShieldCheck, AlertTriangle, CheckSquare, Copy, Check } from 'lucide-react';
import { api } from '../api';

// Intelligent Speech Sanitizer: Strips all special characters, markdown noise, and emojis
export const cleanTextForSpeech = (markdownText) => {
  if (!markdownText) return '';

  let text = markdownText;

  // 1. Remove markdown bold, italics, headers, code, blockquotes
  text = text
    .replace(/^#{1,6}\s+/gm, '') // # Header
    .replace(/\*\*([^*]+)\*\*/g, '$1') // **Bold**
    .replace(/\*([^*]+)\*/g, '$1') // *Italic*
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1') // `code`
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/^[>\-+*•]\s+/gm, '') // bullet points
    .replace(/^[=\-_]{2,}\s*$/gm, ''); // divider lines (====, ----)

  // 2. Remove all special symbols and punctuation noise: =, *, #, _, ~, `, |, >, [, ], {, }, (, ), \, /, ^, %
  text = text.replace(/[=*#_~`|>[\]{}()\\\/^%]/g, ' ');

  // 3. Remove URLs
  text = text.replace(/https?:\/\/\S+/g, '');

  // 4. Remove emojis and Unicode symbol glyphs
  text = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '');

  // 5. Replace multiple dots / dashes with a clean single period
  text = text.replace(/\.{2,}/g, '.');
  text = text.replace(/-{2,}/g, ' ');

  // 6. Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();

  // Limit to an executive audio briefing (~850 characters / key points)
  if (text.length > 900) {
    const cutoff = text.lastIndexOf('.', 850);
    text = (cutoff > 300 ? text.substring(0, cutoff + 1) : text.substring(0, 850)) + ' That concludes the key audio compliance summary.';
  }

  return text;
};

// Helper: Strip unusable special characters from display text
const sanitizeDisplayLine = (str) => {
  if (!str) return '';
  return str
    .replace(/^[=\-_]{2,}\s*$/g, '')
    .replace(/[=*#_~`|^]/g, ' ')
    .replace(/\[\s*/g, '')
    .replace(/\s*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Sleek Interactive Formatter for Eye-Soothing Legal Audit Display
function FormattedLegalAudit({ reportText }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!reportText) return null;

  // Clean raw symbols & dividers from text
  const cleanReport = reportText
    .replace(/^[=\-_]{3,}\s*$/gm, '')
    .replace(/\*{3,}/g, '')
    .trim();

  const lines = cleanReport.split('\n');

  const handleCopyRedline = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-4 text-slate-800">
      {lines.map((line, idx) => {
        const rawTrimmed = line.trim();
        if (!rawTrimmed) return null;

        // 1. Major Section Headings (Soft Eye-Soothing Blue-Slate Style)
        if (
          rawTrimmed.startsWith('## ') || 
          rawTrimmed.startsWith('# ') || 
          rawTrimmed.toUpperCase().includes('RED FLAGS') || 
          rawTrimmed.toUpperCase().includes('EXECUTIVE SUMMARY') || 
          rawTrimmed.toUpperCase().includes('4-PILLAR') || 
          rawTrimmed.toUpperCase().includes('NEXT STEPS')
        ) {
          const cleanHeading = sanitizeDisplayLine(rawTrimmed);
          const isRedFlagHeader = cleanHeading.toUpperCase().includes('RED FLAG');
          
          return (
            <div 
              key={idx} 
              className={`pt-4 pb-2 border-b flex items-center gap-2 ${
                isRedFlagHeader 
                  ? 'border-rose-200 text-rose-800 mt-2' 
                  : 'border-slate-200 text-slate-800 mt-4'
              }`}
            >
              {isRedFlagHeader ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
              )}
              <h4 className="text-sm sm:text-base font-bold tracking-tight text-slate-800 uppercase">
                {cleanHeading}
              </h4>
            </div>
          );
        }

        // 2. Red Flag Clause Items with Risk Levels (Soft Pastel Pill & Subtle Card)
        if (
          rawTrimmed.includes('HIGH RISK') || 
          rawTrimmed.includes('MEDIUM RISK') || 
          rawTrimmed.includes('LOW RISK') || 
          rawTrimmed.startsWith('- 🔴') || 
          rawTrimmed.startsWith('- 🟡') || 
          rawTrimmed.startsWith('- 🟢')
        ) {
          const isHigh = rawTrimmed.includes('HIGH') || rawTrimmed.includes('🔴');
          const isMed = rawTrimmed.includes('MEDIUM') || rawTrimmed.includes('🟡');
          const cleanedText = sanitizeDisplayLine(
            rawTrimmed
              .replace(/^[-*•]\s*/, '')
              .replace(/(🔴\s*HIGH\s*RISK|🟡\s*MEDIUM\s*RISK|🟢\s*LOW\s*RISK)\s*:?/i, '')
          );
          
          return (
            <div 
              key={idx} 
              className={`p-3.5 rounded-xl border transition-all my-2 shadow-xs ${
                isHigh 
                  ? 'bg-rose-50/80 border-rose-200/90 text-rose-900' 
                  : isMed 
                  ? 'bg-amber-50/80 border-amber-200/90 text-amber-900' 
                  : 'bg-emerald-50/80 border-emerald-200/90 text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide text-white shadow-xs ${
                  isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-600'
                }`}>
                  {isHigh ? 'High Risk' : isMed ? 'Moderate Risk' : 'Low Risk'}
                </span>
                <span className="text-slate-800 font-semibold">{cleanedText}</span>
              </div>
            </div>
          );
        }

        // 3. Attorney Redlines (Soft Eye-Soothing Indigo/Slate Box with 1-Click Copy)
        if (rawTrimmed.toLowerCase().includes('attorney redline') || rawTrimmed.toLowerCase().includes('recommended redline')) {
          const rawRedline = rawTrimmed.replace(/.*?(attorney redline|recommended redline):?\s*/i, '');
          const cleanRedline = sanitizeDisplayLine(rawRedline).replace(/["'`]/g, '');
          
          return (
            <div key={idx} className="my-2 p-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-indigo-100 rounded-xl border border-indigo-900/50 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
              <div className="flex items-start gap-2">
                <span className="text-amber-300 font-bold font-sans text-xs flex-shrink-0">⚖️ Attorney Redline:</span>
                <span className="leading-relaxed text-slate-100 font-mono">"{cleanRedline}"</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyRedline(cleanRedline, idx)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-sans font-medium flex items-center gap-1 self-end sm:self-auto transition-all cursor-pointer border border-white/10 shadow-xs"
                title="Copy suggested attorney wording"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-300" />
                    <span>Copy Redline</span>
                  </>
                )}
              </button>
            </div>
          );
        }

        // 4. Actionable Next Steps Checkboxes (Soft Pastel Tint)
        if (rawTrimmed.match(/^\d+\.\s+/) || (rawTrimmed.startsWith('- ') && rawTrimmed.toLowerCase().includes('negotiate'))) {
          const cleanStep = sanitizeDisplayLine(rawTrimmed.replace(/^\d+\.\s+/, '').replace(/^[-*•]\s*/, ''));
          return (
            <div key={idx} className="flex items-start gap-2 p-2.5 bg-sky-50/70 rounded-xl border border-sky-100 text-xs text-slate-700 my-1.5 shadow-xs">
              <CheckSquare className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="font-medium text-slate-800">{cleanStep}</span>
            </div>
          );
        }

        // 5. Standard bullet items and text
        const cleanContent = sanitizeDisplayLine(rawTrimmed.replace(/^[-*•]\s*/, '• '));
        if (!cleanContent) return null;

        // Check if line has a label prefix (e.g. Issue:, Signer Impact:, Finding:)
        const matchLabel = cleanContent.match(/^(•\s*)?(Issue|Signer Impact|Document Type|Overall Health Score|Executive Verdict|Finding|Non-Compete|IP Assignment|Termination|Indemnification):\s*(.*)/i);

        if (matchLabel) {
          const [, bullet, label, rest] = matchLabel;
          return (
            <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed my-1">
              <span className="text-slate-900 font-semibold">{bullet || '• '}{label}: </span>
              <span>{rest}</span>
            </p>
          );
        }

        return (
          <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed my-1">
            {cleanContent}
          </p>
        );
      })}
    </div>
  );
}

export default function DocumentWorkspace({ user, language, setLanguage, onOpenAuth, onOpenSubscription, onAnalysisSuccess, onUserQuotaUpdate }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'camera'
  const [selectedFile, setSelectedFile] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Drag and Drop state
  const [isDragging, setIsDragging] = useState(false);
  
  // Audio narration state
  const [isSpeaking, setIsSpeaking] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setErrorMsg('Camera access denied or unavailable.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'scanned_contract.png', { type: 'image/png' });
      setSelectedFile(file);
      stopCamera();
    }, 'image/png');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setReportData(null);
      setErrorMsg('');
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setReportData(null);
      setErrorMsg('');
    }
  };

  // Audio Speech Handler (with Bhojpuri and Indian regional language support)
  const toggleAudioBriefing = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanSpokenText = cleanTextForSpeech(reportData?.report);
    if (!cleanSpokenText) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpokenText);
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    // Adjust language code
    if (language?.includes('Hindi') || language?.includes('Bhojpuri')) {
      utterance.lang = 'hi-IN';
    } else if (language?.includes('Bangla')) {
      utterance.lang = 'bn-IN';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleRunAnalysis = async () => {
    if (!selectedFile) {
      setErrorMsg('Please upload or scan a legal document first.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setReportData(null);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const res = await api.analyzeDocument(selectedFile, language);

      if (res.quota_exceeded) {
        setErrorMsg(res.error);
        if (onOpenSubscription) onOpenSubscription();
        return;
      }

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to complete document compliance audit.');
        return;
      }

      setReportData(res);

      if (res.is_legal && onAnalysisSuccess) {
        onAnalysisSuccess(selectedFile.name);
      }

      if (onUserQuotaUpdate && res.doc_upload_count !== undefined) {
        onUserQuotaUpdate(prev => ({
          ...prev,
          doc_upload_count: res.doc_upload_count,
          audit_limit: res.audit_limit,
          is_subscribed: res.is_subscribed
        }));
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred during document audit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const userUsage = user?.doc_upload_count || 0;
  const userLimit = user?.audit_limit || 3;
  const isQuotaExceeded = user && userUsage >= userLimit;

  return (
    <section id="workspace" className="py-10 px-4 max-w-5xl mx-auto">
      <div className="liquid-glass-card p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Workspace Title & Quota Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-black text-slate-950 tracking-tight">
              Document Compliance Studio
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Upload or scan your agreement for autonomous 4-pillar risk & redline analysis.
            </p>
          </div>

          {/* Usage Quota Counter */}
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 self-start sm:self-auto shadow-xs">
              <span>Audits Remaining:</span>
              <span className={`px-2 py-0.5 rounded-md text-white font-black ${isQuotaExceeded ? 'bg-red-500' : 'bg-blue-600'}`}>
                {Math.max(0, userLimit - userUsage)} / {userLimit}
              </span>
            </div>
          )}
        </div>

        {/* Tabs and Output Language Selector (Supports English, Hindi, Bangla, Bhojpuri) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-slate-100/90 rounded-xl max-w-xs">
            <button
              onClick={() => { setActiveTab('upload'); stopCamera(); }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'upload' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'camera' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera Scan</span>
            </button>
          </div>

          {/* Controls: E2E Shield + Desired Output Language Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-bold">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>256-Bit E2E Encrypted</span>
            </div>

            <div className="flex items-center gap-2 p-1.5 px-3 bg-white/90 border border-sky-200 rounded-xl shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Output Language:</span>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage && setLanguage(e.target.value)}
                className="bg-blue-50/80 hover:bg-blue-50 text-blue-700 font-bold text-xs py-1 px-2 rounded-lg border border-blue-200 focus:outline-none cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Hindi (हिंदी)">Hindi (हिंदी)</option>
                <option value="Bangla (বাংলা)">Bangla (বাংলা)</option>
                <option value="Bhojpuri (भोजपुरी)">Bhojpuri (भोजपुरी)</option>
              </select>
            </div>
          </div>

        </div>

        {/* TAB 1: DRAG & DROP UPLOAD */}
        {activeTab === 'upload' && (
          <div>
            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/90 ring-4 ring-blue-500/20 scale-[1.01]'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50/70'
                  : 'border-sky-200 hover:border-blue-400 bg-white/60 hover:bg-white/90'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform ${isDragging ? 'scale-110 bg-blue-600 text-white' : selectedFile ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'}`}>
                {selectedFile ? <CheckCircle2 className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
              </div>
              <p className="text-sm font-bold text-slate-800 text-center">
                {isDragging ? '📂 Drop your document here...' : selectedFile ? `📄 ${selectedFile.name}` : 'Click to upload or drag & drop document'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB • Ready for Analysis` : 'PDF, JPG, PNG, DOCX (Max 10MB)'}
              </p>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* TAB 2: LIVE CAMERA SCANNER */}
        {activeTab === 'camera' && (
          <div className="text-center">
            {!cameraActive && !selectedFile && (
              <div className="p-8 border-2 border-dashed border-sky-200 rounded-2xl bg-white/60">
                <Camera className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm mb-1">Scan Physical Legal Document</h4>
                <p className="text-xs text-slate-500 mb-4">Ensure good lighting and that document text is fully legible.</p>
                <button
                  onClick={startCamera}
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  📸 Start Camera
                </button>
              </div>
            )}

            {cameraActive && (
              <div className="relative rounded-2xl overflow-hidden max-w-md mx-auto border-2 border-blue-400 shadow-md">
                <video ref={videoRef} autoPlay playsInline className="w-full h-auto bg-black" />
                <div className="p-3 bg-slate-900/80 backdrop-blur-md flex justify-center gap-3">
                  <button
                    onClick={capturePhoto}
                    className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    📸 Capture Page
                  </button>
                  <button
                    onClick={stopCamera}
                    className="py-2 px-4 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {selectedFile && !cameraActive && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                <p className="text-xs font-bold text-emerald-800 mb-2">✅ Snapshot Captured: {selectedFile.name}</p>
                <button
                  onClick={() => { setSelectedFile(null); startCamera(); }}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  🔄 Retake Photo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Action Button & Quota Alert */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            {errorMsg ? (
              <span className="text-red-600 font-semibold">⚠️ {errorMsg}</span>
            ) : (
              <span>🔒 256-Bit TLS 1.3 & AES-GCM Encrypted Vault Stream</span>
            )}
          </div>

          {!user ? (
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Sign In to Audit Documents
            </button>
          ) : isQuotaExceeded ? (
            <button
              onClick={onOpenSubscription}
              className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> ⚡ Top Up Audit Credits (Packs from ₹199)
            </button>
          ) : (
            <button
              onClick={handleRunAnalysis}
              disabled={loading || !selectedFile}
              className="w-full sm:w-auto py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Auditing Document Compliance...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>🚀 Run Deep Legal Analysis</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* RESULTS REPORT DISPLAY */}
        {reportData && (
          <div className="mt-8 pt-6 border-t border-slate-200/80 animate-in fade-in duration-300">
            {!reportData.is_legal ? (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 font-bold text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span>{reportData.report}</span>
              </div>
            ) : (
              <div className="p-6 sm:p-8 rounded-3xl bg-white/95 border border-sky-200 shadow-xl">
                
                {/* 256-Bit Encrypted Vault Sealed Badge */}
                {reportData.vault_receipt && (
                  <div className="mb-6 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-950 shadow-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span><strong>Encrypted Vault Record:</strong> {reportData.vault_receipt.vault_id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[11px] text-emerald-800">
                        {reportData.vault_receipt.cipher_algorithm}
                      </span>
                      <span className="font-mono text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                        SHA-256 Verified
                      </span>
                    </div>
                  </div>
                )}

                {/* Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-slate-900">
                  <div className="flex items-center gap-2 text-slate-950 font-black text-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Autonomous Legal Compliance Audit</span>
                  </div>
                  
                  {/* Clean Voice Narration Button */}
                  <button
                    onClick={toggleAudioBriefing}
                    className={`px-4 py-2 border font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                      isSpeaking
                        ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100 animate-pulse'
                        : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-4 h-4 text-rose-600" />
                        <span>⏹️ Stop Audio</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-blue-600" />
                        <span>🔊 Executive Audio Briefing</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Formatted Cards Output Viewer */}
                <FormattedLegalAudit reportText={reportData.report} />

              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
