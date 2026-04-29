// src/stores/walletStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { walletApi } from "@/api/walletApi";

export const TRANSACTION_TYPES = {
  WELCOME_BONUS:       "welcome_bonus",
  EARNING_HELD:        "earning_held",
  EARNING_RELEASED:    "earning_released",
  DEBIT_ERRAND_POST:   "debit_errand_post",
  DEBIT_SERVICE_ORDER: "debit_service_order",
  PURCHASE:            "purchase",
  WITHDRAWAL:          "withdrawal",
  REFUND:              "refund",
};

export const TRANSACTION_DIRECTION = {
  CREDIT: "credit",
  DEBIT: "debit",
};

export const WITHDRAWAL_STATUS = {
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

export const useWalletStore = defineStore("wallet", () => {
  // ─── State ─────────────────────────────────────────────────────────────────

  // Balance
  const cbcBalance = ref(0);
  const ngnEarnings = ref(0);
  const balanceLoading = ref(false);
  const balanceLoaded = ref(false);

  // Transactions
  const transactions = ref([]);
  const transactionsMeta = ref({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const transactionsLoading = ref(false);

  // Banks
  const banks = ref([]);
  const banksLoading = ref(false);
  const banksLoaded = ref(false);

  // Withdrawals
  const withdrawals = ref([]);
  const withdrawalsLoading = ref(false);

  // Action states
  const actionLoading = ref(false);
  const error = ref(null);

  // ─── Getters ───────────────────────────────────────────────────────────────

  const hasCbcBalance = computed(() => cbcBalance.value > 0);
  const hasNgnEarnings = computed(() => ngnEarnings.value > 0);

  const totalBalanceNGN = computed(() => {
    // CBC value in NGN (assuming 10 NGN per CBC as per API response)
    const cbcValueNGN = cbcBalance.value * 10;
    return cbcValueNGN + ngnEarnings.value;
  });

  const recentTransactions = computed(() => {
    return transactions.value.slice(0, 3);
  });

  const creditTransactions = computed(() => {
    return transactions.value.filter(
      (t) => t.direction === TRANSACTION_DIRECTION.CREDIT,
    );
  });

  const debitTransactions = computed(() => {
    return transactions.value.filter(
      (t) => t.direction === TRANSACTION_DIRECTION.DEBIT,
    );
  });

  const totalCredits = computed(() => {
    return creditTransactions.value.reduce((sum, t) => sum + t.amount, 0);
  });

  const totalDebits = computed(() => {
    return debitTransactions.value.reduce((sum, t) => sum + t.amount, 0);
  });

  const pendingWithdrawals = computed(() => {
    return withdrawals.value.filter(
      (w) => w.status === WITHDRAWAL_STATUS.PROCESSING,
    );
  });

  const completedWithdrawals = computed(() => {
    return withdrawals.value.filter(
      (w) => w.status === WITHDRAWAL_STATUS.COMPLETED,
    );
  });

  // ─── Helpers ───────────────────────────────────────────────────────────────

  function formatTransactionType(type) {
    const types = {
      welcome_bonus:       "Welcome Bonus",
      earning_held:        "Earnings Held",
      earning_released:    "Earnings Released",
      debit_errand_post:   "Errand Posting Fee",
      debit_service_order: "Service Contact Fee",
      purchase:            "CBC Purchase",
      withdrawal:          "Withdrawal",
      refund:              "Refund",
    };
    return types[type] || type?.replace(/_/g, " ") || "Transaction";
  }

  function formatCurrency(amount, currency = "NGN") {
    if (currency === "CBC") {
      return `${amount} CBC`;
    }
    return `₦${amount?.toLocaleString() || 0}`;
  }

  function formatDate(isoString) {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getTransactionIcon(type) {
    const icons = {
      [TRANSACTION_TYPES.WELCOME_BONUS]: "fa-solid fa-gift",
      [TRANSACTION_TYPES.ORDER_EARNINGS]: "fa-solid fa-bag-shopping",
      [TRANSACTION_TYPES.DEBIT_ERRAND_POST]: "fa-solid fa-pen",
      [TRANSACTION_TYPES.CBC_PURCHASE]: "fa-solid fa-coins",
      [TRANSACTION_TYPES.WITHDRAWAL]: "fa-solid fa-building-columns",
      [TRANSACTION_TYPES.REFUND]: "fa-solid fa-rotate-left",
    };
    return icons[type] || "fa-solid fa-circle-dollar";
  }

  function getTransactionColor(type, direction) {
    if (direction === TRANSACTION_DIRECTION.CREDIT) {
      return "text-cb-positive";
    }
    return "text-cb-negative";
  }

  function getWithdrawalStatusBadge(status) {
    const badges = {
      [WITHDRAWAL_STATUS.PROCESSING]: {
        label: "Processing",
        class: "bg-cb-warning-subtle text-cb-warning",
      },
      [WITHDRAWAL_STATUS.COMPLETED]: {
        label: "Completed",
        class: "bg-cb-positive-subtle text-cb-positive",
      },
      [WITHDRAWAL_STATUS.FAILED]: {
        label: "Failed",
        class: "bg-cb-negative-subtle text-cb-negative",
      },
      [WITHDRAWAL_STATUS.CANCELLED]: {
        label: "Cancelled",
        class: "bg-cb-field text-cb-muted",
      },
    };
    return (
      badges[status] || { label: status, class: "bg-cb-field text-cb-muted" }
    );
  }

  function searchBanks(query) {
    if (!query) return banks.value;
    const lowerQuery = query.toLowerCase();
    return banks.value.filter(
      (bank) =>
        bank.name.toLowerCase().includes(lowerQuery) ||
        bank.code.includes(query),
    );
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  /**
   * Fetch wallet balance
   */
  async function fetchBalance() {
    balanceLoading.value = true;
    error.value = null;

    try {
      const res = await walletApi.getBalance();
      const data = res?.data || {};

      cbcBalance.value = data.cbcBalance || 0;
      ngnEarnings.value = data.ngnEarnings || 0;
      balanceLoaded.value = true;

      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message ||
        err.message ||
        "Failed to load wallet balance";
      // console.error("Error fetching balance:", err);
      throw err;
    } finally {
      balanceLoading.value = false;
    }
  }

  /**
   * Fetch wallet transactions
   * @param {Object} params - { page, limit }
   */
  async function fetchTransactions(params = {}) {
    transactionsLoading.value = true;
    error.value = null;

    try {
      const res = await walletApi.getTransactions(params);
      const data = res?.data || [];

      if (Array.isArray(data)) {
        transactions.value = data;
      } else {
        transactions.value = [];
      }

      // Update meta if available
      if (res?.meta) {
        transactionsMeta.value = {
          total: res.meta.total || 0,
          page: res.meta.page || 1,
          limit: res.meta.limit || 20,
          totalPages: res.meta.totalPages || 1,
          hasNextPage: res.meta.hasNextPage || false,
          hasPrevPage: res.meta.hasPrevPage || false,
        };
      }

      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message ||
        err.message ||
        "Failed to load transactions";
      // console.error("Error fetching transactions:", err);
      throw err;
    } finally {
      transactionsLoading.value = false;
    }
  }

  /**
   * Fetch list of banks
   */
  async function fetchBanks() {
    // Return cached banks if already loaded
    if (banksLoaded.value && banks.value.length > 0) {
      return { data: { banks: banks.value } };
    }

    banksLoading.value = true;
    error.value = null;

    try {
      const res = await walletApi.getBanks();
      const data = res?.data || {};

      banks.value = data.banks || [];
      banksLoaded.value = true;

      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message || err.message || "Failed to load banks";
      // console.error("Error fetching banks:", err);
      throw err;
    } finally {
      banksLoading.value = false;
    }
  }

  /**
   * Initialize CBC purchase
   * @param {number} cbcAmount - Amount of CBC to purchase
   */
  async function purchaseCBC(cbcAmount) {
    actionLoading.value = true;
    error.value = null;

    try {
      const res = await walletApi.initializePurchase({ cbcAmount });
      const resData = res?.data || {};

      // If there's an authorization URL, user needs to pay via Paystack
      if (resData.authorizationUrl) {
        // Redirect to Paystack
        window.location.href = resData.authorizationUrl;
      }

      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message ||
        err.message ||
        "Failed to initialize CBC purchase";
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  /**
   * Verify CBC purchase
   * @param {string} reference - transaction reference
   */
  async function verifyPurchase(reference) {
    actionLoading.value = true;
    error.value = null;

    try {
      const res = await walletApi.verifyPurchase(reference);
      const data = res?.data || {};

      // Optional: refresh wallet after successful verification
      await fetchBalance();
      await fetchTransactions().catch(() => {});

      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message ||
        err.message ||
        "Failed to verify purchase";

      // console.error("Error verifying purchase:", err);
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  /**
   * Initialize withdrawal
   * @param {Object} data - { amountNGN, bankCode, accountNumber, accountName, bankName }
   */
  async function withdraw(data) {
    actionLoading.value = true;
    error.value = null;

    try {
      const res = await walletApi.initializeWithdrawal(data);
      const resData = res?.data || {};

      // Refresh balance after withdrawal
      await fetchBalance();
      // Refresh withdrawals
      await fetchWithdrawalHistory();

      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message ||
        err.message ||
        "Failed to initialize withdrawal";
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  /**
   * Fetch withdrawal history
   */
  async function fetchWithdrawalHistory() {
    withdrawalsLoading.value = true;
    error.value = null;

    try {
      const res = await walletApi.getWithdrawalHistory();
      const data = res?.data || {};

      withdrawals.value = data.withdrawals || [];

      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message ||
        err.message ||
        "Failed to load withdrawal history";
      // console.error("Error fetching withdrawals:", err);
      throw err;
    } finally {
      withdrawalsLoading.value = false;
    }
  }

  /**
   * Clear error state
   */
  function resetError() {
    error.value = null;
  }

  /**
   * Clear all wallet data (useful on logout)
   */
  function clearWalletData() {
    cbcBalance.value = 0;
    ngnEarnings.value = 0;
    balanceLoaded.value = false;
    transactions.value = [];
    transactionsMeta.value = {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    };
    withdrawals.value = [];
    error.value = null;
  }

  /**
   * Refresh all wallet data
   */
  async function refreshWalletData() {
    balanceLoaded.value = false;

    try {
      await Promise.all([
        fetchBalance(),
        fetchTransactions(),
        fetchWithdrawalHistory().catch(() => {}),
      ]);
    } catch (err) {
      // console.error("Failed to refresh wallet data:", err);
      throw err;
    }
  }

  /**
   * Initialize store (call on app mount)
   */
  async function initialize() {
    if (!balanceLoaded.value) {
      await fetchBalance().catch(() => {});
    }
  }

  return {
    // State
    cbcBalance,
    ngnEarnings,
    balanceLoading,
    balanceLoaded,
    transactions,
    transactionsMeta,
    transactionsLoading,
    banks,
    banksLoading,
    banksLoaded,
    withdrawals,
    withdrawalsLoading,
    actionLoading,
    error,

    // Getters
    hasCbcBalance,
    hasNgnEarnings,
    totalBalanceNGN,
    recentTransactions,
    creditTransactions,
    debitTransactions,
    totalCredits,
    totalDebits,
    pendingWithdrawals,
    completedWithdrawals,

    // Helpers
    formatTransactionType,
    formatCurrency,
    formatDate,
    getTransactionIcon,
    getTransactionColor,
    getWithdrawalStatusBadge,
    searchBanks,

    // Actions
    fetchBalance,
    fetchTransactions,
    fetchBanks,
    purchaseCBC,
    verifyPurchase,
    withdraw,
    fetchWithdrawalHistory,
    resetError,
    clearWalletData,
    refreshWalletData,
    initialize,
  };
});