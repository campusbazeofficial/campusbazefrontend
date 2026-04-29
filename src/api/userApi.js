// src/api/userApi.js
import api from "./api";
import { withRetry, withRetryDecorator } from "./apiRetry";

export const userApi = {
  // ── Profile ──────────────────────────────────────────────
  async getMe() {
    const response = await api.get("/api/v1/users/me");
    return response.data;
  },

  // Critical: Retry on failure
  async updateMe(data) {
    const retryableUpdate = withRetryDecorator(
      (d) => api.patch("/api/v1/users/me", d),
      "updateProfile",
    );
    const response = await retryableUpdate(data);
    return response.data;
  },

  async updateCorporateMe(data) {
    const retryableUpdate = withRetryDecorator(
      (d) => api.patch("/api/v1/users/me/corporate", d),
      "updateCorporateProfile",
    );
    const response = await retryableUpdate(data);
    return response.data;
  },

  // ── Dashboard ─────────────────────────────────────────────
  async getDashboard() {
    const response = await withRetry(
      () => api.get("/api/v1/users/me/dashboard"),
      "dashboard",
    );
    return response.data;
  },

  // ── Avatar ────────────────────────────────────────────────
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await api.post("/api/v1/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000, // Longer timeout for file uploads
    });
    return response.data;
  },

  async deleteAvatar() {
    const response = await api.delete("/api/v1/users/me/avatar");
    return response.data;
  },

  // ── Company Logo ─────────────────────────────────────────
  async uploadCompanyLogo(file) {
    const formData = new FormData();
    formData.append("logo", file);
    const response = await api.post("/api/v1/users/me/company/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
    return response.data;
  },

  // ── Sessions ──────────────────────────────────────────────
  async getSessions() {
    const response = await api.get("/api/v1/users/me/sessions");
    return response.data;
  },
  // ── AI Bio ────────────────────────────────────────────────
  async generateBio() {
    const response = await api.get("/api/v1/users/generate-bio");
    return response.data;
  },
  // ── Search & Public Profile ───────────────────────────────
  async searchUsers(params = {}) {
    const response = await api.get("/api/v1/users/search", { params });
    return response.data;
  },
  // ── Referral ───────────────────────────────────────────────
  async getReferralInfo() {
    const response = await api.get("/api/v1/users/me/referral");
    return response.data;
  },

  async getUserProfile(slug) {
    const response = await api.get(`/api/v1/users/${slug}/profile`);
    return response.data;
  },

  // Permanently delete the authenticated user's account and all associated data.
  // confirmationText must be exactly: sudo-delete-{firstName}-{lastName}
  // Blocked if user has active errands or orders in progress.
  async deleteAccount(confirmationText) {
    const response = await api.delete("/api/v1/users/delete-account", {
      data: { confirmationText },
    });
    return response.data;
  },
};