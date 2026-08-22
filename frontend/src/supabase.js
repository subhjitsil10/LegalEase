import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key-placeholder';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local fallback storage helper if user hasn't set up Supabase yet
const LOCAL_USER_KEY = 'legalease_current_user';
const LOCAL_AUDITS_KEY = 'legalease_audits_store';

export const localStore = {
  getUser: () => {
    try {
      const data = localStorage.getItem(LOCAL_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  },
  removeUser: () => {
    localStorage.removeItem(LOCAL_USER_KEY);
  },
  incrementAuditCount: (user) => {
    const updated = {
      ...user,
      doc_upload_count: (user.doc_upload_count || 0) + 1,
      audit_limit: user.audit_limit || 3
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
    return updated;
  },
  setSubscribed: (user, planName, additionalAudits = 10) => {
    const currentCount = user.doc_upload_count || 0;
    const currentLimit = user.audit_limit || 3;
    const baseLimit = Math.max(currentLimit, currentCount);
    const newLimit = baseLimit + additionalAudits;

    const updated = {
      ...user,
      is_subscribed: true,
      subscription_plan: planName,
      audit_limit: newLimit
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
    return updated;
  }
};

