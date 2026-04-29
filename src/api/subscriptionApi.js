// src/api/subscriptionApi.js
import api from "./api";

export const subscriptionApi = {
  /**
   * Get all plans for unauthenticated / public pages — no auth required.
   * GET /api/v1/subscriptions/plans/public
   */
  async getPublicPlans() {
    const response = await api.get("/api/v1/subscriptions/plans/public");
    return response.data;
  },

  /**
   * Get all available subscription plans
   * GET /api/v1/subscriptions/plans
   */
  async getPlans() {
    const response = await api.get("/api/v1/subscriptions/plans");
    // Return the full response - the store will extract data.plans
    return response.data;
  },

  /**
   * Get current user's subscription details
   * GET /api/v1/subscriptions/my
   */
  async getMySubscription() {
    const response = await api.get("/api/v1/subscriptions/my");
    return response.data;
  },

  /**
   * Subscribe to a plan (new subscription)
   * POST /api/v1/subscriptions/subscribe
   * @param {Object} data - { tier, billingPeriod }
   */
  async subscribe(data) {
    const response = await api.post("/api/v1/subscriptions/subscribe", data);
    return response.data;
  },

  /**
   * Upgrade/downgrade existing subscription
   * POST /api/v1/subscriptions/upgrade
   * @param {Object} data - { tier, billingPeriod }
   */
  async upgrade(data) {
    const response = await api.post("/api/v1/subscriptions/upgrade", data);
    return response.data;
  },

  /**
   * Toggle auto-renew setting
   * PATCH /api/v1/subscriptions/auto-renew
   */
  async toggleAutoRenew() {
    const response = await api.patch("/api/v1/subscriptions/auto-renew");
    return response.data;
  },

  /**
   * Cancel subscription (access retained until expiry)
   * POST /api/v1/subscriptions/cancel
   */
 async cancel(payload) {
  const response = await api.post(
    "/api/v1/subscriptions/cancel",
    payload // ✅ send body
  );
  return response.data;
},

  // ─── Admin Plan Management ─────────────────────────────────────────────────

  /**
   * List all plans (admin)
   * GET /plan/list
   * Returns { success, data: [...plans], meta: { page, limit, total, pages } }
   * @param {Object} params - Optional query params (page, limit, etc.)
   */
  async listPlans(params = {}) {
    const response = await api.get("/api/v1/admin/plan/list", { params });
    return response.data;
  },

  /**
   * Create a new plan (admin)
   * POST /plan/create
   * @param {Object} data - { tier, nameLabel, planType, monthlyNGN, yearlyNGN,
   *                          studentMonthlyNGN, studentYearlyNGN, monthlyCbc,
   *                          cbcDiscount, commissionRate, studentCommissionRate }
   */
  async createPlan(data) {
    const response = await api.post("/api/v1/admin/plan/create", data);
    return response.data;
  },

  /**
   * Get a single plan by ID (admin)
   * GET /plan/:id
   * @param {string} id - Plan document ID
   */
  async getPlanById(id) {
    const response = await api.get(`/api/v1/admin/plan/${id}`);
    return response.data;
  },

  /**
   * Toggle a plan's active status (admin)
   * PATCH /plan/:id/toggle
   * @param {string} id - Plan document ID
   */
  async togglePlan(id) {
    const response = await api.patch(`/api/v1/admin/plan/${id}/toggle`);
    return response.data;
  },

  /**
   * Update an existing plan (admin)
   * PATCH /plan/:id/update
   * @param {string} id   - Plan document ID
   * @param {Object} data - Fields to update
   */
  async updatePlan(id, data) {
    const response = await api.patch(`/api/v1/admin/plan/${id}/update`, data);
    return response.data;
  },

  /**
   * Delete a plan (admin)
   * DELETE /plan/:id/delete
   * @param {string} id - Plan document ID
   */
  async deletePlan(id) {
    const response = await api.delete(`/api/v1/admin/plan/${id}/delete`);
    return response.data;
  },
};