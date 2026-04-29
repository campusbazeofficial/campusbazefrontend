// src/api/adminApi.js
import api from "./api";

export const adminApi = {
  // ─── Verifications ─────────────────────────────────────────────────────────

  /**
   * List all verification submissions
   * GET /api/v1/admin/verifications
   * @param {Object} params - Optional query params (page, limit, status, etc.)
   */
  async listVerifications(params = {}) {
    const response = await api.get("/api/v1/admin/verifications", { params });
    return response.data;
  },

  /**
   * Get a single verification submission detail (includes documentUrl)
   * GET /api/v1/admin/verifications/:id
   * @param {string} verificationId
   */
  async getVerification(verificationId) {
    const response = await api.get(`/api/v1/admin/verifications/${verificationId}`);
    return response.data;
  },

  /**
   * Approve or reject a verification submission
   * PATCH /api/v1/admin/verifications/:id/review
   * @param {string} verificationId
   * @param {{ status: "verified"|"rejected", adminNote: string }} payload
   */
  async reviewVerification(verificationId, payload) {
    const response = await api.patch(
      `/api/v1/admin/verifications/${verificationId}/review`,
      payload
    );
    return response.data;
  },

  /**
   * Fetch the raw document file for a verification, proxied through the backend.
   * GET /api/v1/admin/verifications/:verificationId/document
   * Returns a Blob so the frontend can create a local object URL — avoids
   * Cloudinary X-Frame-Options / signed-URL expiry issues entirely.
   * @param {string} verificationId
   * @returns {Promise<Blob>}
   */
  async getVerificationDocument(verificationId) {
    const response = await api.get(
      `/api/v1/admin/verifications/${verificationId}/document`,
      { responseType: "blob" }
    );
    return response.data; // Blob
  },

  // ─── Users ─────────────────────────────────────────────────────────────────

  /**
   * List all users
   * GET /api/v1/admin/users
   * @param {Object} params - Optional query params (page, limit, role, etc.)
   */
  async listUsers(params = {}) {
    const response = await api.get("/api/v1/admin/users", { params });
    return response.data;
  },

  /**
   * Get a single user detail (includes company if corporate)
   * GET /api/v1/admin/users/:id
   * @param {string} userId
   */
  async getUser(userId) {
    const response = await api.get(`/api/v1/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Toggle user suspension (suspend / unsuspend)
   * PATCH /api/v1/admin/users/:id/suspend
   * @param {string} userId
   * @param {{ reason: string }} payload
   */
  async toggleUserSuspension(userId, payload) {
    const response = await api.patch(
      `/api/v1/admin/users/${userId}/suspend`,
      payload
    );
    return response.data;
  },

  // ─── CBC ───────────────────────────────────────────────────────────────────

  /**
   * Manually credit CBC to a user
   * POST /api/v1/admin/cbc/credit
   * @param {{ userId: string, amount: number, note: string }} payload
   */
  async creditCBC(payload) {
    const response = await api.post("/api/v1/admin/cbc/credit", payload);
    return response.data;
  },

  // ─── Errands ───────────────────────────────────────────────────────────────

  /**
   * List all errands
   * GET /api/v1/admin/errands
   * @param {Object} params - Optional query params (page, limit, status, etc.)
   */
  async listErrands(params = {}) {
    const response = await api.get("/api/v1/admin/errands", { params });
    return response.data;
  },

  /**
   * Get a single errand detail (posterId is populated)
   * GET /api/v1/admin/errands/:id
   * @param {string} errandId
   */
  async getErrand(errandId) {
    const response = await api.get(`/api/v1/admin/errands/${errandId}`);
    return response.data;
  },

  /**
   * Resolve a disputed errand
   * PATCH /api/v1/admin/errands/:id/resolve
   * @param {string} errandId
   * @param {{ outcome: "favour_poster"|"favour_runner", adminNote: string }} payload
   */
  async resolveErrand(errandId, payload) {
    const response = await api.patch(
      `/api/v1/admin/errands/${errandId}/resolve`,
      payload
    );
    return response.data;
  },

  // ─── Orders ────────────────────────────────────────────────────────────────

  /**
   * List all service orders
   * GET /api/v1/admin/orders
   * @param {Object} params - Optional query params (page, limit, status, etc.)
   */
  async listOrders(params = {}) {
    const response = await api.get("/api/v1/admin/orders", { params });
    return response.data;
  },

  /**
   * Get a single order detail (buyerId, sellerId, listingId are populated)
   * GET /api/v1/admin/orders/:id
   * @param {string} orderId
   */
  async getOrder(orderId) {
    const response = await api.get(`/api/v1/admin/orders/${orderId}`);
    return response.data;
  },

  /**
   * Resolve a disputed service order
   * PATCH /api/v1/admin/orders/:id/resolve
   * @param {string} orderId
   * @param {{ outcome: "favour_buyer"|"favour_seller", adminNote: string }} payload
   */
  async resolveOrder(orderId, payload) {
    const response = await api.patch(
      `/api/v1/admin/orders/${orderId}/resolve`,
      payload
    );
    return response.data;
  },

  // ─── Subscriptions ─────────────────────────────────────────────────────────

  /**
   * List all subscriptions
   * GET /api/v1/admin/subscriptions
   * @param {Object} params - Optional query params (page, limit, status, tier, etc.)
   */
  async listSubscriptions(params = {}) {
    const response = await api.get("/api/v1/admin/subscriptions", { params });
    return response.data;
  },

  /**
   * Get a single subscription detail (userId is populated)
   * GET /api/v1/admin/subscriptions/:id
   * @param {string} subscriptionId
   */
  async getSubscription(subscriptionId) {
    const response = await api.get(`/api/v1/admin/subscriptions/${subscriptionId}`);
    return response.data;
  },

  // ─── Clearances ────────────────────────────────────────────────────────────

  /**
   * List all earnings clearances
   * GET /api/v1/admin/clearances
   * @param {Object} params - Optional query params (page, limit, status, etc.)
   */
  async listClearances(params = {}) {
    const response = await api.get("/api/v1/admin/clearances", { params });
    return response.data;
  },

  /**
   * Bulk approve multiple clearances
   * POST /api/v1/admin/clearances/bulk-approve
   * @param {{ clearanceIds: string[] }} payload
   */
  async bulkApproveClearances(payload) {
    const response = await api.post(
      "/api/v1/admin/clearances/bulk-approve",
      payload
    );
    return response.data;
  },

  /**
   * Approve a single earnings clearance
   * PATCH /api/v1/admin/clearances/:id/approve
   * @param {string} clearanceId
   */
  async approveClearance(clearanceId) {
    const response = await api.patch(
      `/api/v1/admin/clearances/${clearanceId}/approve`
    );
    return response.data;
  },

  /**
   * Reject a single earnings clearance
   * PATCH /api/v1/admin/clearances/:id/reject
   * @param {string} clearanceId
   * @param {{ adminNote: string }} payload
   */
  async rejectClearance(clearanceId, payload) {
    const response = await api.patch(
      `/api/v1/admin/clearances/${clearanceId}/reject`,
      payload
    );
    return response.data;
  },

  /**
   * Reapprove a previously rejected clearance
   * PATCH /api/v1/admin/clearances/:id/reapprove
   * @param {string} clearanceId
   */
  async reapproveClearance(clearanceId) {
    const response = await api.patch(
      `/api/v1/admin/clearances/${clearanceId}/reapprove`
    );
    return response.data;
  },
};