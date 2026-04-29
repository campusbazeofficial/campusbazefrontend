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
   * Initialize NGN withdrawal to bank account 
   * Debits CBC immediately. If the Paystack transfer fails, CBC is automatically refunded. Minimum 500 CBC. Only one pending withdrawal allowed at a time.
   * POST /api/v1/wallet/withdrawal/initialize
   * @param {Object} data - { amountNGN, bankCode, accountNumber, accountName, bankName }
   */
  async initializeWithdrawal(data) {
    const response = await api.post("/api/v1/wallet/withdrawal/initialize", data);
    return response.data;
  },

  /**
   * Get withdrawal history
   * GET /api/v1/wallet/withdrawal/history
   */
  async getWithdrawalHistory() {
    const response = await api.get("/api/v1/wallet/withdrawal/history");
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