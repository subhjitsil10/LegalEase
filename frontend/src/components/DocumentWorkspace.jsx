import React, { useState, useRef } from 'react';
import { Upload, Camera, FileText, CheckCircle2, AlertCircle, Sparkles, Volume2, Lock, Globe } from 'lucide-react';
import { api } from '../api';

export default function DocumentWorkspace({ user, language, setLanguage, onOpenAuth, onOpenSubscription, onAnalysisSuccess, onUserQuotaUpdate }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'camera'
  const [selectedFile, setSelectedFile] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);

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

  const handleRunAnalysis = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!selectedFile) {
      setErrorMsg('Please select or capture a document first.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.analyzeDocument(selectedFile, language);
      if (!res.success) {
        if (res.quota_exceeded) {
          setErrorMsg(res.error);
        } else {
          setErrorMsg(res.error || 'Failed to process document.');
        }
      } else {
        setReportData(res);
        if (res.is_legal && onAnalysisSuccess) {
          onAnalysisSuccess(res);
        }
        if (onUserQuotaUpdate && res.doc_upload_count !== undefined) {
          onUserQuotaUpdate({
            ...user,
            doc_upload_count: res.doc_upload_count,
            is_subscribed: res.is_subscribed
          });
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Server error during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const totalLimit = user ? (user.audit_limit || 3) : 3;
  const usedAudits = user ? (user.doc_upload_count || 0) : 0;
  const remainingAudits = Math.max(0, totalLimit - usedAudits);
  const isQuotaExceeded = user && (usedAudits >= totalLimit);

  return (
    <section className="max-w-4xl mx-auto mb-8">
      <div className="liquid-glass-card p-6 sm:p-8">
        
        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200/80">
          <div>
            <h3 className="text-xl font-black text-slate-900">Document Ingestion & Live Scanner</h3>
            <p className="text-xs text-slate-500 mt-0.5">Upload a contract (PDF, JPG, PNG, DOCX) or scan with your camera</p>
          </div>
          <div>
            {user ? (
              <span className={`calm-pill text-xs font-bold ${remainingAudits > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                🎯 {remainingAudits} of {totalLimit} Audits Available
              </span>
            ) : (
              <span className="calm-pill text-xs bg-slate-100 text-slate-700 border-slate-200">
                👀 Preview Mode (Sign in for 3 Free Audits)
              </span>
            )}
          </div>
        </div>

        {/* Tabs and Output Language Selector in Document Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-slate-100/90 rounded-xl max-w-xs">
            <button
              onClick={() => { setActiveTab('upload'); stopCamera(); }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'upload' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'camera' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera Scan</span>
            </button>
          </div>

          {/* Desired Output Language Selector */}
          <div className="flex items-center gap-2 p-1.5 px-3 bg-white/90 border border-sky-200 rounded-xl shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
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
            </select>
          </div>

        </div>

        {/* TAB 1: UPLOAD */}
        {activeTab === 'upload' && (
          <div>
            <label className="border-2 border-dashed border-sky-200 hover:border-blue-400 bg-white/60 hover:bg-white/90 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <FileText className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                {selectedFile ? selectedFile.name : 'Click to upload or drag & drop document'}
              </p>
              <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG, DOCX (Max 10MB)</p>
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
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
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
                    className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    📸 Capture Page
                  </button>
                  <button
                    onClick={stopCamera}
                    className="py-2 px-4 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl transition-all"
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
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  🔄 Retake Photo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Action Button & Quota Alert */}
        {errorMsg && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="text-xs text-slate-500">
            {selectedFile ? `Selected: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)` : 'No document chosen yet.'}
          </div>

          {!user ? (
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Sign In to Run Deep Legal Analysis
            </button>
          ) : isQuotaExceeded ? (
            <button
              onClick={onOpenSubscription}
              className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> ⚡ Top Up Audit Credits (Packs from ₹299)
            </button>
          ) : (
            <button
              onClick={handleRunAnalysis}
              disabled={loading || !selectedFile}
              className="w-full sm:w-auto py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Auditing with Gemini 3.6 Flash...</span>
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
              <div className="p-6 rounded-2xl bg-white/95 border border-sky-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Legal Compliance Audit Complete</span>
                  </div>
                  
                  {/* Instant Audio Narration Button */}
                  <button
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        if (window.speechSynthesis.speaking) {
                          window.speechSynthesis.cancel();
                        } else {
                          const utterance = new SpeechSynthesisUtterance(reportData.report.substring(0, 1000));
                          utterance.rate = 0.95;
                          window.speechSynthesis.speak(utterance);
                        }
                      }
                    }}
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Volume2 className="w-4 h-4 text-blue-600" />
                    <span>🔊 Audio Briefing</span>
                  </button>
                </div>

                <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {reportData.report}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
