import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import PlaybookPillars from './components/PlaybookPillars';
import DocumentWorkspace from './components/DocumentWorkspace';
import LegalChatbot from './components/LegalChatbot';
import PricingSection from './components/PricingSection';
import Footer from './components/Footer';

import AuthModal from './components/modals/AuthModal';
import ProfileModal from './components/modals/ProfileModal';
import SubscriptionModal from './components/modals/SubscriptionModal';

import { api } from './api';
import { supabase, isSupabaseConfigured, localStore } from './supabase';

export default function App() {
  return (
    <ErrorBoundary>
      <LegalEaseApp />
    </ErrorBoundary>
  );
}

function LegalEaseApp() {
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState('English');
  const [activeDocumentPath, setActiveDocumentPath] = useState(null);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);

  // Load existing session on initial mount and listen for magic link / confirmation
  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await api.getMe();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        console.log('No active session');
      }
    };
    checkSession();

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user?.email) {
          const email = session.user.email;
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

          if (profile) {
            localStore.setUser(profile);
            setUser(profile);
          } else {
            const newUser = {
              email,
              full_name: session.user.user_metadata?.full_name || '',
              phone_number: '',
              age: 24,
              profession: 'Student',
              org_name: '',
              avatar_url: '',
              is_subscribed: false,
              subscription_plan: 'Free Tier',
              doc_upload_count: 0
            };
            await supabase.from('profiles').upsert([newUser], { onConflict: 'email' });
            localStore.setUser(newUser);
            setUser(newUser);
          }
        }
      });
      return () => subscription?.unsubscribe();
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleUserUpdate = (updatedUserData) => {
    setUser(updatedUserData);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveDocumentPath(null);
  };

  const handleSubscriptionSuccess = (subData) => {
    const additional = subData.audits_added || (subData.subscription_plan?.includes('30') ? 30 : 10);
    setUser(prev => {
      const baseLimit = Math.max(prev?.audit_limit || 3, prev?.doc_upload_count || 0);
      return {
        ...prev,
        is_subscribed: true,
        subscription_plan: subData.subscription_plan,
        audit_limit: baseLimit + additional
      };
    });
  };

  const handleAnalysisSuccess = (res) => {
    if (res.doc_temp_path) {
      setActiveDocumentPath(res.doc_temp_path);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-blue-500 selection:text-white">
      
      {/* Aurora Floating Background Elements */}
      <div className="aurora-bg">
        <div className="aurora-orb-1" />
        <div className="aurora-orb-2" />
        <div className="aurora-orb-3" />
        <div className="aurora-orb-4" />
      </div>

      {/* Top Navbar */}
      <Navbar
        user={user}
        language={language}
        setLanguage={setLanguage}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Hero Section */}
        <HeroBanner />

        {/* Playbook Pillars & Supported Classes */}
        <PlaybookPillars />

        {/* Document Ingestion & Live Scanner */}
        <DocumentWorkspace
          user={user}
          language={language}
          setLanguage={setLanguage}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenSubscription={() => setIsSubscriptionOpen(true)}
          onAnalysisSuccess={handleAnalysisSuccess}
          onUserQuotaUpdate={setUser}
        />

        {/* 24/7 AI Legal Counsel Chatbot */}
        <LegalChatbot
          user={user}
          activeDocumentPath={activeDocumentPath}
          language={language}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* Dedicated Pricing & Membership Plans */}
        <PricingSection
          onSelectPlan={() => setIsSubscriptionOpen(true)}
        />

      </main>

      {/* Quiet Clean Footer */}
      <Footer />

      {/* MODALS */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        user={user}
        onClose={() => setIsProfileOpen(false)}
        onUserUpdate={handleUserUpdate}
        onLogout={handleLogout}
      />

      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        user={user}
        onClose={() => setIsSubscriptionOpen(false)}
        onSubscriptionSuccess={handleSubscriptionSuccess}
      />

    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('LegalEase Global ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 text-slate-800">
          <div className="liquid-glass-card max-w-md w-full p-8 text-center shadow-xl">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              ⚖️
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">LegalEase Recovery Shield</h2>
            <p className="text-xs text-slate-600 mb-6">
              A temporary display error was safely intercepted. Tap below to resume your workspace.
            </p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              🔄 Refresh & Resume Workspace
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
