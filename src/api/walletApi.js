// src/api/walletApi.js
import api from "./api";

export const walletApi = {
  /**
   * Get CBC balance
   * GET /api/v1/wallet/balance
   */
  async getBalance() {
    const response = await api.get("/api/v1/wallet/balance");
    return response.data;
  },

  /**
   * Get transaction history (ledger)
   * GET /api/v1/wallet/transactions
   * @param {Object} params - { page, limit }
   */
  async getTransactions(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    
    const url = `/api/v1/wallet/transactions${queryParams.toString() ? `?${queryParams}` : ""}`;
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Initialize CBC purchase (Paystack)
   * POST /api/v1/wallet/purchase/initialize
   * @param {Object} data - { cbcAmount }
   */
  async initializePurchase(data) {
    const response = await api.post("/api/v1/wallet/purchase/initialize", data);
    return response.data;
  },

  /**
   * List Nigerian banks for payout
   * GET /api/v1/wallet/banks
   */
  async getBanks() {
    const response = await api.get("/api/v1/wallet/banks");
    return response.data;
  },

  /**
   * Request a withdrawal to bank account.
   * Debits NGN earnings immediately and holds for 6hrs (verified + paid plan)
   * or 24hrs (everyone else). The transfer fires automatically after the hold
   * period via cron. Blocked if the user has active disputes. Minimum ₦500.
   * POST /api/v1/withdrawals/request
   * @param {Object} data - { amountNGN, bankCode, accountNumber, accountName, bankName }
   */
  async requestWithdrawal(data) {
    const response = await api.post("/api/v1/withdrawals/request", data);
    return response.data;
  },

  /**
   * Get withdrawal history.
   * Returns all withdrawals for the authenticated user, sorted by most
   * recent. Paystack internal codes are excluded.
   * GET /api/v1/withdrawals
   */
  async getWithdrawalHistory() {
    const response = await api.get("/api/v1/withdrawals");
    return response.data;
  },

  /**
   * Cancel a pending withdrawal during its hold period.
   * Can only cancel while status is "pending" and releaseAt has not passed.
   * Earnings are immediately refunded back to the wallet.
   * DELETE /api/v1/withdrawals/:withdrawalId/cancel
   * @param {string} withdrawalId
   */
  async cancelWithdrawal(withdrawalId) {
    const response = await api.delete(`/api/v1/withdrawals/${withdrawalId}/cancel`);
    return response.data;
  },

    /**
   * Verify CBC purchase after redirect
   * GET /api/v1/wallet/purchase/verify?reference=xxx
   * @param {string} reference
   */
  async verifyPurchase(reference) {
    const response = await api.get("/api/v1/wallet/purchase/verify", {
      params: { reference }
    });
    return response.data;
  },
};