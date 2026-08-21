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

export default function App() {
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState('English');
  const [activeDocumentPath, setActiveDocumentPath] = useState(null);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);

  // Load existing session on initial mount
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
    setUser(prev => ({
      ...prev,
      is_subscribed: true,
      subscription_plan: subData.subscription_plan
    }));
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
