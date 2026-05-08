// src/api/authApi.js
import api from "./api";

export const authApi = {
  // Register individual user
  async registerIndividual(userData) {
    const response = await api.post("/api/v1/auth/register", userData);
    return response.data;
  },

  // Register corporate user
  async registerCorporate(userData) {
    const response = await api.post("/api/v1/auth/register/corporate", userData);
    return response.data;
  },

  // Verify email with OTP
  async verifyEmail(email, otp) {
    const response = await api.post("/api/v1/auth/verify-email", { email, otp });
    return response.data;
  },

  // Resend OTP
  async resendOtp(email) {
    const response = await api.post("/api/v1/auth/resend-otp", { email });
    return response.data;
  },

  // Login
  async login(credentials) {
    const response = await api.post("/api/v1/auth/login", credentials);
    return response.data;
  },

  // Admin Login
  async adminLogin(credentials) {
    const response = await api.post("/api/v1/admin/login", credentials);
    return response.data;
  },
 // Change Password
  async changePassword(currentPassword, newPassword) {
    const response = await api.patch("/api/v1/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Refresh tokens
  async refreshToken(refreshToken) {
    const response = await api.post("/api/v1/auth/refresh", { refreshToken });
    return response.data;
  },

  // Logout
  async logout(refreshToken) {
    const response = await api.post("/api/v1/auth/logout", { refreshToken });
    return response.data;
  },

  // Forgot password - request reset link
  async forgotPassword(email) {
    const response = await api.post("/api/v1/auth/forgot-password", { email });
    return response.data;
  },

  // Reset password with token
  async resetPassword(token, newPassword) {
    const response = await api.post("/api/v1/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  },

  // Revoke a specific session by ID (logout another device)
  // Session must belong to the authenticated user
  async revokeSession(sessionId) {
    const response = await api.delete(`/api/v1/auth/sessions/${sessionId}`);
    return response.data;
  },

  // Logout all sessions across all devices
  async logoutAll() {
    const response = await api.post("/api/v1/auth/logout-all");
    return response.data;
  },

  // Validate a referral code before registration.
  // Returns referrer details (e.g. firstName, lastName) if valid.
  async validateReferralCode(code) {
    const response = await api.get(
      `/api/v1/users/referral/validate/${encodeURIComponent(code.trim())}`,
    );
    return response.data;
  },
};