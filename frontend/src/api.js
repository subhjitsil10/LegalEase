const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export const getToken = () => localStorage.getItem("legaltech_token");
export const setToken = (token) => localStorage.setItem("legaltech_token", token);
export const removeToken = () => localStorage.removeItem("legaltech_token");

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Auth
  getCaptcha: async () => {
    const res = await fetch(`${API_BASE}/api/auth/captcha`);
    return res.json();
  },

  requestOtp: async (email, captchaToken, captchaInput) => {
    const res = await fetch(`${API_BASE}/api/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        captcha_token: captchaToken,
        captcha_input: captchaInput
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to request code");
    return data;
  },

  verifyOtp: async (email, otpCode) => {
    const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp_code: otpCode })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Invalid code");
    return data;
  },

  register: async (payload) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Registration failed");
    return data;
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  },

  updateProfile: async (payload) => {
    const res = await fetch(`${API_BASE}/api/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Profile update failed");
    return data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/api/auth/avatar`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Avatar upload failed");
    return data;
  },

  // Document Analysis
  analyzeDocument: async (file, language) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);
    const res = await fetch(`${API_BASE}/api/documents/analyze`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Document analysis failed");
    return data;
  },

  // AI Counsel Chat
  chatCounsel: async (query, docTempPath, language) => {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify({
        query,
        doc_temp_path: docTempPath,
        language
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Chat failed");
    return data;
  },

  // Billing
  getPlans: async () => {
    const res = await fetch(`${API_BASE}/api/billing/plans`);
    return res.json();
  },

  processCheckout: async (planName, amountInr, paymentMethod) => {
    const res = await fetch(`${API_BASE}/api/billing/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify({
        plan_name: planName,
        amount_inr: amountInr,
        payment_method: paymentMethod
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Checkout failed");
    return data;
  }
};
export { API_BASE };
