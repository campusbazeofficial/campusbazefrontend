// src/api/errandApi.js
import api from "./api";

export const errandApi = {
  // ─── Marketplace ──────────────────────────────────────────
  async getErrands(params = {}) {
    const response = await api.get("/api/v1/errands", { params });
    return response.data;
  },

  async postErrand(data) {
    const response = await api.post("/api/v1/errands", data);
    return response.data;
  },

  async getErrand(errandId) {
    const response = await api.get(`/api/v1/errands/${errandId}`);
    return response.data;
  },

  // ─── Poster Views ─────────────────────────────────────────
  async getMyPosted(params = {}) {
    const response = await api.get("/api/v1/errands/my/posted", { params });
    return response.data;
  },

  async getMyAccepted(params = {}) {
    const response = await api.get("/api/v1/errands/my/accepted", { params });
    return response.data;
  },

  async getMyInProgress(params = {}) {
    const response = await api.get("/api/v1/errands/my/in-progress", {
      params,
    });
    return response.data;
  },

  async cancelErrand(errandId) {
    const response = await api.patch(`/api/v1/errands/${errandId}/cancel`);
    return response.data;
  },

  async confirmErrand(errandId) {
    const response = await api.patch(`/api/v1/errands/${errandId}/confirm`);
    return response.data;
  },

  async disputeErrand(errandId, reason) {
    const response = await api.patch(`/api/v1/errands/${errandId}/dispute`, {
      reason,
    });
    return response.data;
  },

  // ─── Runner Views ─────────────────────────────────────────
  async getMyRunning(params = {}) {
    const response = await api.get("/api/v1/errands/my/running", { params });
    return response.data;
  },

  async getMyBids(params = {}) {
    const response = await api.get("/api/v1/errands/my/bids", { params });
    return response.data;
  },

  async getMyAcceptedBids(params = {}) {
    const response = await api.get("/api/v1/errands/my/bids/accepted", {
      params,
    });
    return response.data;
  },

  // ─── Payment ──────────────────────────────────────────────
  async payErrand(errandId) {
    const response = await api.post(`/api/v1/errands/${errandId}/pay`, {
      callbackUrl: `${window.location.origin}/user/errands/payment/callback`,
    });
    return response.data;
  },

  // ─── Bidding ──────────────────────────────────────────────
  async placeBid(errandId, data) {
    const response = await api.post(`/api/v1/errands/${errandId}/bids`, data);
    return response.data;
  },

  async acceptBid(errandId, bidId) {
    const response = await api.patch(
      `/api/v1/errands/${errandId}/bids/${bidId}/accept`,
    );
    return response.data;
  },

  async withdrawBid(errandId, bidId) {
    const response = await api.patch(
      `/api/v1/errands/${errandId}/bids/${bidId}/withdraw`,
    );
    return response.data;
  },

  // ─── Lifecycle ────────────────────────────────────────────
  async startErrand(errandId) {
    const response = await api.patch(`/api/v1/errands/${errandId}/start`);
    return response.data;
  },

  async completeErrand(errandId, proofFile) {
    const formData = new FormData();
    if (proofFile) formData.append("proof", proofFile);

    const response = await api.patch(
      `/api/v1/errands/${errandId}/complete`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return response.data;
  },

  // ─── Edit ─────────────────────────────────────────────────
  /**
   * Edit a posted errand (poster only, no bids yet).
   * All fields optional — only provided fields are updated.
   * Blocked once any runner has placed a bid.
   */
  async editErrand(errandId, data) {
    const response = await api.patch(
      `/api/v1/errands/${errandId}/edit`,
      data,
    );
    return response.data;
  },

  // ─── Matching ──────────────────────────────────────────────
  async getErrandMatches(errandId) {
    const response = await api.get(`/api/v1/errands/${errandId}/matches`);
    return response.data;
  },

  // ─── Deadline Extension ────────────────────────────────────
  async extendDeadline(errandId, data) {
    const response = await api.patch(
      `/api/v1/errands/${errandId}/extend-deadline`,
      data
    );
    return response.data;
  },
};