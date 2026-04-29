// src/api/serviceApi.js
import api from "./api";

export const serviceApi = {
  // ─── Marketplace Listings ─────────────────────────────────
  /**
   * GET /api/v1/services
   * Browse all active services (marketplace)
   */
  async getServices(params = {}) {
    const response = await api.get("/api/v1/services", { params });
    return response.data;
  },

  // ─── My Listings ──────────────────────────────────────────
  /**
   * GET /api/v1/services/my/listings
   * Get current user's own service listings (all statuses)
   */
  async getMyListings(params = {}) {
    const response = await api.get("/api/v1/services/my/listings", { params });
    return response.data;
  },

  // ─── Single Listing ───────────────────────────────────────
  /**
   * GET /api/v1/services/:serviceId
   * Fetch a single service listing by ID
   */
  async getService(serviceId) {
    const response = await api.get(`/api/v1/services/${serviceId}`);
    return response.data;
  },

  async updateService(serviceId, data) {
    const response = await api.patch(`/api/v1/services/${serviceId}`, data);
    return response.data;
  },

  // ─── Create Listing ───────────────────────────────────────
  /**
   * POST /api/v1/services
   * Create a new service listing (status: DRAFT)
   */
  async createService(data) {
    const response = await api.post("/api/v1/services", data);
    return response.data;
  },

  // ─── Delete Listing ───────────────────────────────────────
  /**
   * DELETE /api/v1/services/:serviceId
   * Soft-delete (deactivates) a service listing
   */
  async deleteService(serviceId) {
    const response = await api.delete(`/api/v1/services/${serviceId}`);
    return response.data;
  },

  // ─── Orders ───────────────────────────────────────────────

  /**
   * POST /api/v1/services/:serviceId/orders
   * STEP 3 — Place order → status: PENDING_PAYMENT
   * Body: { tierName, requirements?, callbackUrl }
   * Response includes: { order, escrowReference, amountNGN }
   */
  async createOrder(serviceId, data) {
    const response = await api.post(
      `/api/v1/services/${serviceId}/orders`,
      data,
    );
    return response.data;
  },

  /**
   * POST /api/v1/services/orders/:orderId/pay
   * STEP 4 — Initiate Paystack payment
   * Frontend MUST redirect: window.location.href = data.authorizationUrl
   */
  async payOrder(orderId) {
    // No body — orderId is already in the URL path
    const response = await api.post(`/api/v1/services/orders/${orderId}/pay`);
    return response.data;
  },

  /**
   * GET /api/v1/services/orders/buying
   * Get orders where user is the buyer
   */
  async getBuyingOrders(params = {}) {
    const response = await api.get("/api/v1/services/orders/buying", {
      params,
    });
    return response.data;
  },

  /**
   * GET /api/v1/services/orders/selling
   * Get orders where user is the seller
   */
  async getSellingOrders(params = {}) {
    const response = await api.get("/api/v1/services/orders/selling", {
      params,
    });
    return response.data;
  },

  /**
   * GET /api/v1/services/orders/:orderId
   * Get a single order by ID
   * Use for polling after payment to detect IN_PROGRESS transition
   */
  async getOrder(orderId) {
    const response = await api.get(`/api/v1/services/orders/${orderId}`);
    return response.data;
  },

  /**
   * POST /api/v1/services/orders/:orderId/deliver
   * STEP 6 — Seller marks order as delivered → status: DELIVERED
   * Body: { deliveryNote? }
   */
  async deliverOrder(orderId, deliveryNote) {
    const response = await api.patch(
      `/api/v1/services/orders/${orderId}/deliver`,
      { deliveryNote },
    );
    return response.data;
  },

  /**
   * POST /api/v1/services/orders/:orderId/confirm
   * STEP 7A — Buyer confirms delivery → status: COMPLETED
   * Seller earnings held in pendingEarnings (admin must approve before withdrawal)
   */
  async confirmOrder(orderId) {
    const response = await api.patch(
      `/api/v1/services/orders/${orderId}/confirm`,
    );
    return response.data;
  },

  /**
   * POST /api/v1/services/orders/:orderId/revision
   * STEP 7B — Buyer requests a revision → status: REVISION
   * Body: { note }
   * Limited by tier revision count
   */
  async requestRevision(orderId, note) {
    const response = await api.patch(
      `/api/v1/services/orders/${orderId}/revision`,
      { note },
    );
    return response.data;
  },

  /**
   * POST /api/v1/services/orders/:orderId/dispute
   * STEP 7C — Open a dispute → status: DISPUTED
   * Body: { reason }
   * Admin resolves dispute
   */
  async disputeOrder(orderId, reason) {
    const response = await api.patch(
      `/api/v1/services/orders/${orderId}/dispute`,
      { reason },
    );
    return response.data;
  },

  /**
   * POST /api/v1/services/orders/:orderId/cancel
   * Cancel an order — ONLY works if status = PENDING_PAYMENT (before escrow confirmed)
   */
  async cancelOrder(orderId) {
    const response = await api.patch(
      `/api/v1/services/orders/${orderId}/cancel`,
    );
    return response.data;
  },
};