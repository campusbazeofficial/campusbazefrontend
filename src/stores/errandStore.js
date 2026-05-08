// src/stores/errandStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { errandApi } from "@/api/errandApi";
import { useUserStore } from "./userStore";
import { ERRAND_STATUS, BID_STATUS } from "@/constants/errandStatus";

// ─── Response parsers ──────────────────────────────────────────────────────

/**
 * Standard list response parser
 * Handles both: { success, data: [...] } and interceptor-unwrapped { data: [...] } or [...]
 */
function parseListResponse(res) {
  // If interceptor unwrapped: res IS the data array directly
  if (Array.isArray(res)) return { items: res, meta: null };

  const data = res?.data;
  return {
    items: Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.errands)
          ? data.errands
          : [],
    meta: res?.meta || data?.meta || null,
  };
}

/**
 * My Bids list response parser
 * Handles both: { success, data: [...] } and interceptor-unwrapped forms
 */
function parseBidsListResponse(res) {
  if (Array.isArray(res)) return { items: res, meta: null };

  const data = res?.data;
  return {
    items: Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.bids)
          ? data.bids
          : [],
    meta: res?.meta || data?.meta || null,
  };
}

/**
 * Single errand response parser
 * Handles both shapes:
 *   - raw:         { success, data: { errand: {...} } } → res.data.errand
 *   - interceptor: { errand: {...} }                    → res.errand
 */
function parseSingleErrand(res) {
  return res?.data?.errand ?? res?.errand ?? null;
}

/**
 * Create errand response parser
 * Response shape: { success: true, data: { errand: {...} } }
 */
function parseCreatedErrand(res) {
  return res?.data?.errand || res?.data || null;
}

/**
 * Matches list response parser
 * Used for: GET /errands/:id/matches
 * Response shape: { success: true, data: { matches: [...] } }
 */
function parseMatchesResponse(res) {
  return {
    items: Array.isArray(res?.data?.matches) ? res.data.matches : [],
  };
}

export const useErrandStore = defineStore("errand", () => {
  // ─── State ─────────────────────────────────────────────────────────────────

  // Marketplace
  const market = ref([]);
  const marketMeta = ref(null);
  const marketLoading = ref(false);

  // Posted errands (poster view)
  const posted = ref([]);
  const postedMeta = ref(null);
  const postedLoading = ref(false);

  // Running errands (runner view - accepted & in_progress)
  const running = ref([]);
  const runningMeta = ref(null);
  const runningLoading = ref(false);

  // Current errand (detail view)
  const current = ref(null);
  const currentLoading = ref(false);

  // Accepted errands (poster view - errands with accepted bids)
  const accepted = ref([]);
  const acceptedMeta = ref(null);
  const acceptedLoading = ref(false);

  const matches = ref([]);
  const matchesLoading = ref(false);

  // In-progress errands (both poster and runner)
  const inProgress = ref([]);
  const inProgressMeta = ref(null);
  const inProgressLoading = ref(false);

  // My bids (runner view - all bids placed)
  const myBids = ref([]);
  const myBidsMeta = ref(null);
  const myBidsLoading = ref(false);

  // My accepted bids (runner view - won bids)
  const myAcceptedBids = ref([]);
  const myAcceptedBidsMeta = ref(null);
  const myAcceptedBidsLoading = ref(false);

  // Global loading states
  const actionLoading = ref(false);
  const error = ref(null);

  // ─── Getters ───────────────────────────────────────────────────────────────

  const openErrands = computed(() => market.value);
  const myPostedErrands = computed(() => posted.value);
  const myRunningErrands = computed(() => running.value);
  const myAcceptedErrands = computed(() => accepted.value);
  const myInProgressErrands = computed(() => inProgress.value);
  const myBidsList = computed(() => myBids.value);
  const myAcceptedBidsList = computed(() => myAcceptedBids.value);

  const hasMarketErrands = computed(() => market.value.length > 0);
  const hasPostedErrands = computed(() => posted.value.length > 0);
  const hasRunningErrands = computed(() => running.value.length > 0);
  const hasBids = computed(() => myBids.value.length > 0);
  const hasAcceptedBids = computed(() => myAcceptedBids.value.length > 0);

  const errandMatches = computed(() => matches.value);
  const hasMatches = computed(() => matches.value.length > 0);

  /**
   * Reactive Set of errand IDs where the current user has an active bid.
   * Derived from myBids so it updates automatically after placeBid / fetchMyBids.
   * Used by ErrandCard and ErrandMarket for O(1) lookup without traversal.
   */
  const myBidErrandIds = computed(() => {
    const set = new Set();
    myBids.value.forEach((item) => {
      if (
        item._id &&
        item.bid?.status &&
        !['withdrawn', 'rejected'].includes(item.bid.status)
      ) {
        set.add(item._id);
      }
    });
    return set;
  });

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Find an errand by ID across all local stores
   */
  function findErrandById(errandId) {
    // current is checked FIRST — it has fully populated data (bids, etc.)
    // market/posted lists may have the same errand but without bids populated
    if (current.value?._id === errandId) return current.value;
    return (
      market.value.find((e) => e._id === errandId) ||
      posted.value.find((e) => e._id === errandId) ||
      running.value.find((e) => e._id === errandId) ||
      accepted.value.find((e) => e._id === errandId) ||
      inProgress.value.find((e) => e._id === errandId) ||
      null
    );
  }

  /**
   * Extract poster ID from errand (handles both populated and unpopulated)
   */
  function getPosterId(errand) {
    if (!errand) return null;
    if (typeof errand.posterId === "string") return errand.posterId;
    return errand.posterId?._id || errand.poster?._id || null;
  }

  /**
   * Check if current user is the poster of an errand
   */
  function isPoster(errandId) {
    const userStore = useUserStore();
    const userId = userStore.user?._id;
    if (!userId) return false;
    const errand = findErrandById(errandId);
    if (!errand) return false;
    return getPosterId(errand) === userId;
  }

  /**
   * Check if current user has placed an active bid on an errand
   */
  function hasUserBid(errandId) {
    const userStore = useUserStore();
    const userId = userStore.user?._id;
    if (!userId) return false;

    // 1. Check errand.bids if populated (detail view)
    const errand = findErrandById(errandId);
    if (errand?.bids?.length) {
      const found = errand.bids.some((b) => {
        const runnerId = typeof b.runnerId === 'object' ? b.runnerId?._id : b.runnerId;
        return runnerId === userId && ![BID_STATUS.WITHDRAWN, BID_STATUS.REJECTED].includes(b.status);
      });
      if (found) return true;
    }

    // 2. Fall back to myBids list (marketplace cards — bids not populated)
    return myBids.value.some(
      (item) =>
        item._id === errandId &&
        item.bid?.status &&
        ![BID_STATUS.WITHDRAWN, BID_STATUS.REJECTED].includes(item.bid.status),
    );
  }

  /**
   * Get current user's active bid on an errand
   */
  function getUserBid(errandId) {
    const userStore = useUserStore();
    const userId = userStore.user?._id;
    if (!userId) return null;

    // 1. Check errand.bids if populated
    const errand = findErrandById(errandId);
    if (errand?.bids?.length) {
      const bid = errand.bids.find((b) => {
        const runnerId = typeof b.runnerId === 'object' ? b.runnerId?._id : b.runnerId;
        return runnerId === userId && ![BID_STATUS.WITHDRAWN, BID_STATUS.REJECTED].includes(b.status);
      });
      if (bid) return bid;
    }

    // 2. Fall back to myBids list
    const bidItem = myBids.value.find(
      (item) =>
        item._id === errandId &&
        item.bid?.status &&
        ![BID_STATUS.WITHDRAWN, BID_STATUS.REJECTED].includes(item.bid.status),
    );
    return bidItem?.bid || null;
  }

  /**
   * Get the accepted runner ID from an errand
   */
  function getAcceptedRunnerId(errand) {
    if (!errand) return null;
    const acceptedBid = (errand.bids ?? []).find(
      (b) => b.status === BID_STATUS.ACCEPTED,
    );
    if (!acceptedBid) return null;
    return typeof acceptedBid.runnerId === "string"
      ? acceptedBid.runnerId
      : acceptedBid.runnerId?._id || null;
  }

  /**
   * Check if current user is the accepted runner for an errand
   */
  function isAcceptedRunner(errandId) {
    const userStore = useUserStore();
    const userId = userStore.user?._id;
    if (!userId) return false;
    const errand = findErrandById(errandId);
    if (!errand) return false;
    return getAcceptedRunnerId(errand) === userId;
  }

  /**
   * Check if escrow payment is confirmed for an errand
   */
  function isEscrowConfirmed(errandId) {
    const errand = findErrandById(errandId);
    return errand?.escrowConfirmed === true;
  }

  /**
   * Get allowed actions for current user on an errand
   */
  function getAllowedActions(errandId) {
    const userStore = useUserStore();
    const userId = userStore.user?._id;
    if (!userId) return [];

    const errand = findErrandById(errandId);
    if (!errand) return [];

    const status = errand.status;
    const isPosterUser = getPosterId(errand) === userId;
    const isRunnerUser = getAcceptedRunnerId(errand) === userId;
    const hasActiveBid = hasUserBid(errandId);

    const actions = [];

    if (isPosterUser) {
      if (status === ERRAND_STATUS.POSTED) {
        actions.push("cancel", "view_bids", "edit");
      }
      if (status === ERRAND_STATUS.ACCEPTED) {
        actions.push("view_details");
        // Show pay button only if escrow not yet confirmed
        if (!errand.escrowConfirmed) {
          actions.push("pay");
        }
      }
      if (status === ERRAND_STATUS.IN_PROGRESS) {
        actions.push("view_details");
      }
      if (status === ERRAND_STATUS.COMPLETED) {
        actions.push("confirm");
      }
      if (
        [
          ERRAND_STATUS.ACCEPTED,
          ERRAND_STATUS.IN_PROGRESS,
          ERRAND_STATUS.COMPLETED,
        ].includes(status)
      ) {
        actions.push("dispute");
      }
    }

    if (isRunnerUser) {
      if (status === ERRAND_STATUS.ACCEPTED) {
        // Runner can only start if escrow is confirmed
        if (errand.escrowConfirmed) {
          actions.push("start");
        }
      }
      if (status === ERRAND_STATUS.IN_PROGRESS) {
        actions.push("complete");
      }
      if (
        [
          ERRAND_STATUS.ACCEPTED,
          ERRAND_STATUS.IN_PROGRESS,
          ERRAND_STATUS.COMPLETED,
        ].includes(status)
      ) {
        actions.push("dispute");
      }
    }

    if (!isPosterUser && !isRunnerUser) {
      if (status === ERRAND_STATUS.POSTED && !hasActiveBid) {
        actions.push("bid");
      }
      if (status === ERRAND_STATUS.POSTED && hasActiveBid) {
        actions.push("withdraw_bid", "edit_bid");
      }
    }

    // Chat available for involved parties
    if (isPosterUser || isRunnerUser || hasActiveBid) {
      actions.push("chat");
    }

    return actions;
  }

  // ─── Matching Actions ─────────────────────────────────────────────────────

  async function fetchErrandMatches(errandId) {
    matchesLoading.value = true;
    error.value = null;

    try {
      const res = await errandApi.getErrandMatches(errandId);
      const { items } = parseMatchesResponse(res);
      matches.value = items;
      return items;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load matches";
      throw err;
    } finally {
      matchesLoading.value = false;
    }
  }

  // ─── Marketplace Actions ───────────────────────────────────────────────────

  async function fetchMarket(params = {}) {
    marketLoading.value = true;
    error.value = null;
    try {
      const res = await errandApi.getErrands(params);
      const { items, meta } = parseListResponse(res);
      market.value = items;
      marketMeta.value = meta;
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load errands";
      throw err;
    } finally {
      marketLoading.value = false;
    }
  }

  async function fetchErrand(errandId) {
    currentLoading.value = true;
    error.value = null;
    try {
      const res = await errandApi.getErrand(errandId);
      current.value = parseSingleErrand(res);
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load errand";
      throw err;
    } finally {
      currentLoading.value = false;
    }
  }

  async function createErrand(data) {
    actionLoading.value = true;
    error.value = null;
    try {
      const res = await errandApi.postErrand(data);
      const newErrand = parseCreatedErrand(res);
      if (newErrand?._id) {
        posted.value.unshift(newErrand);
      }
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to post errand";
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  // ─── Poster Actions ────────────────────────────────────────────────────────

  async function fetchMyPosted(params = {}) {
    postedLoading.value = true;
    error.value = null;
    try {
      const res = await errandApi.getMyPosted(params);
      const { items, meta } = parseListResponse(res);
      posted.value = items;
      postedMeta.value = meta;
      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to load posted errands";
      throw err;
    } finally {
      postedLoading.value = false;
    }
  }

  async function fetchMyAccepted(params = {}) {
    acceptedLoading.value = true;
    error.value = null;
    try {
      const res = await errandApi.getMyAccepted(params);
      const { items, meta } = parseListResponse(res);
      accepted.value = items;
      acceptedMeta.value = meta;
      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to load accepted errands";
      throw err;
    } finally {
      acceptedLoading.value = false;
    }
  }

  async function fetchMyInProgress(params = {}) {
    inProgressLoading.value = true;
    error.value = null;
    try {
      const res = await errandApi.getMyInProgress(params);
      const { items, meta } = parseListResponse(res);
      inProgress.value = items;
      inProgressMeta.value = meta;
      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to load in-progress errands";
      throw err;
    } finally {
      inProgressLoading.value = false;
    }
  }

  async function cancelErrand(errandId) {
    actionLoading.value = true;
    error.value = null;
    try {
      const res = await errandApi.cancelErrand(errandId);
      // Remove from posted list
      posted.value = posted.value.filter((e) => e._id !== errandId);
      if (current.value?._id === errandId) {
        current.value = { ...current.value, status: ERRAND_STATUS.CANCELLED };
      }
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to cancel errand";
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  async function confirmErrand(errandId) {
    actionLoading.value = true;
    error.value = null;
    try {
      const res = await errandApi.confirmErrand(errandId);
      // Update local state
      const errand = findErrandById(errandId);
      if (errand) {
        errand.status = ERRAND_STATUS.CONFIRMED;
      }
      if (current.value?._id === errandId) {
        current.value = { ...current.value, status: ERRAND_STATUS.CONFIRMED };
      }
      // Refresh posted list
      await fetchMyPosted();
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to confirm errand";
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  async function disputeErrand(errandId, reason) {
    actionLoading.value = true;
    error.value = null;
    try {
      const res = await errandApi.disputeErrand(errandId, reason);
      // Update local state
      const errand = findErrandById(errandId);
      if (errand) {
        errand.status = ERRAND_STATUS.DISPUTED;
      }
      if (current.value?._id === errandId) {
        current.value = { ...current.value, status: ERRAND_STATUS.DISPUTED };
      }
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to open dispute";
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  // ─── Runner Actions ────────────────────────────────────────────────────────

  async function fetchMyRunning(params = {}) {
    runningLoading.value = true;
    error.value = null;
    try {
      const res = await errandApi.getMyRunning(params);
      const { items, meta } = parseListResponse(res);
      running.value = items;
      runningMeta.value = meta;
      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to load running errands";
      throw err;
    } finally {
      runningLoading.value = false;
    }
  }

  async function fetchMyBids(params = {}) {
    myBidsLoading.value = true;
    error.value = null;
    try {
      const res = await errandApi.getMyBids(params);
      const { items, meta } = parseBidsListResponse(res);
      myBids.value = items;
      myBidsMeta.value = meta;
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load bids";
      throw err;
    } finally {
      myBidsLoading.value = false;
    }
  }

  async function fetchMyAcceptedBids(params = {}) {
    myAcceptedBidsLoading.value = true;
    error.value = null;
    try {
      const res = await errandApi.getMyAcceptedBids(params);
      const { items, meta } = parseListResponse(res);
      myAcceptedBids.value = items;
      myAcceptedBidsMeta.value = meta;
      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to load accepted bids";
      throw err;
    } finally {
      myAcceptedBidsLoading.value = false;
    }
  }

  async function startErrand(errandId) {
    actionLoading.value = true;
    error.value = null;
    try {
      const res = await errandApi.startErrand(errandId);
      // Update local state
      const errand = findErrandById(errandId);
      if (errand) {
        errand.status = ERRAND_STATUS.IN_PROGRESS;
      }
      if (current.value?._id === errandId) {
        current.value = { ...current.value, status: ERRAND_STATUS.IN_PROGRESS };
      }
      // Refresh relevant lists
      await Promise.all([fetchMyRunning(), fetchMyAcceptedBids()]);
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to start errand";
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  async function completeErrand(errandId, proofFile) {
    actionLoading.value = true;
    error.value = null;
    try {
      const res = await errandApi.completeErrand(errandId, proofFile);
      // Update local state
      const errand = findErrandById(errandId);
      if (errand) {
        errand.status = ERRAND_STATUS.COMPLETED;
      }
      if (current.value?._id === errandId) {
        current.value = { ...current.value, status: ERRAND_STATUS.COMPLETED };
      }
      // Refresh relevant lists
      await Promise.all([fetchMyRunning(), fetchMyAcceptedBids()]);
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to complete errand";
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  // ─── Bidding Actions ───────────────────────────────────────────────────────

  async function placeBid(errandId, data) {
    actionLoading.value = true;
    error.value = null;
    try {
      const res = await errandApi.placeBid(errandId, data);
      // Refresh errand detail if open
      if (current.value?._id === errandId) {
        await fetchErrand(errandId);
      }
      // Refresh bids list
      await fetchMyBids();
      return res;
    } catch (err) {
      // Server response: { success: false, data: { message: "..." } }
      error.value =
        err.response?.data?.data?.message ||
        err.response?.data?.message ||
        err.message ||
        "Failed to place bid";
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  async function acceptBid(errandId, bidId) {
    actionLoading.value = true;
    error.value = null;
    try {
      const res = await errandApi.acceptBid(errandId, bidId);
      // Update local state
      const errand = findErrandById(errandId);
      if (errand) {
        errand.status = ERRAND_STATUS.ACCEPTED;
        const bid = errand.bids?.find((b) => b._id === bidId);
        if (bid) {
          bid.status = BID_STATUS.ACCEPTED;
        }
      }
      if (current.value?._id === errandId) {
        await fetchErrand(errandId);
      }
      // Refresh posted list
      await fetchMyPosted();
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to accept bid";
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  async function payErrand(errandId) {
    actionLoading.value = true;
    error.value = null;
    try {
      const res = await errandApi.payErrand(errandId);
      // res.data contains { authorizationUrl, accessCode, reference }
      return res;
    } catch (err) {
      const msg = (err.response?.data?.message || "").toLowerCase();
      // Backend signals a pending payment — don't throw, let the component
      // redirect to the callback page to resume polling instead of showing an error.
      if (msg.includes("already initiated") || msg.includes("payment pending")) {
        return { alreadyInitiated: true, errandId };
      }
      error.value = err.response?.data?.message || "Failed to initiate payment";
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  async function withdrawBid(errandId, bidId) {
    actionLoading.value = true;
    error.value = null;
    try {
      const res = await errandApi.withdrawBid(errandId, bidId);
      // Remove from myBids list
      myBids.value = (myBids.value ?? []).filter(
        (item) => item?.bid?._id !== bidId,
      );
      // Update errand detail if open
      if (current.value?._id === errandId) {
        await fetchErrand(errandId);
      }
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to withdraw bid";
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  // ─── Utility Actions ───────────────────────────────────────────────────────

  function clearCurrent() {
    current.value = null;
  }

  function resetError() {
    error.value = null;
  }

  /**
   * Fetch a single errand's fresh detail and merge it into the posted list.
   * Used when returning from Paystack to get the latest escrowConfirmed status
   * even when fetchMyPosted doesn't return that field in list responses.
   */
  async function fetchAndPatchPosted(errandId) {
    try {
      const res = await errandApi.getErrand(errandId);
      const fresh = parseSingleErrand(res);
      if (!fresh) return;
      const idx = posted.value.findIndex(e => e._id === errandId);
      if (idx !== -1) {
        posted.value[idx] = { ...posted.value[idx], ...fresh };
      }
      // Also update current if open
      if (current.value?._id === errandId) {
        current.value = { ...current.value, ...fresh };
      }
      return fresh;
    } catch {
      // Silent — stale data is better than an error
    }
  }

  function clearAllErrors() {
    error.value = null;
  }

  // Refresh all user-related data
  async function refreshUserData() {
    try {
    await Promise.allSettled([
    fetchMyPosted(),
    fetchMyRunning(),
    fetchMyBids(),
    fetchMyAcceptedBids(),
    fetchMyAccepted(),
    fetchMyInProgress(),
  ]);
    } catch (err) {
      // console.error("Failed to refresh user data:", err);
    }
  }
// ─── Deadline Extension ───────────────────────────────────────
async function extendDeadline(errandId, data) {
  actionLoading.value = true;
  error.value = null;
  try {
    const res = await errandApi.extendDeadline(errandId, data);
    // Update local state
    const errand = findErrandById(errandId);
    if (errand && res?.data?.errand) {
      errand.deadline = res.data.errand.deadline;
    }
    if (current.value?._id === errandId && res?.data?.errand) {
      current.value = { ...current.value, deadline: res.data.errand.deadline };
    }
    // Refresh posted list
    await fetchMyPosted();
    return res;
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to extend deadline";
    throw err;
  } finally {
    actionLoading.value = false;
  }
}
  return {
    // State
    market,
    marketMeta,
    marketLoading,

    posted,
    postedMeta,
    postedLoading,

    matches,
    matchesLoading,
    running,
    runningMeta,
    runningLoading,

    current,
    currentLoading,

    accepted,
    acceptedMeta,
    acceptedLoading,

    inProgress,
    inProgressMeta,
    inProgressLoading,

    myBids,
    myBidsMeta,
    myBidsLoading,

    myAcceptedBids,
    myAcceptedBidsMeta,
    myAcceptedBidsLoading,

    actionLoading,
    error,

    // Getters
    openErrands,
    myPostedErrands,
    myRunningErrands,
    myAcceptedErrands,
    myInProgressErrands,
    myBidsList,
    myAcceptedBidsList,
    hasMarketErrands,
    hasPostedErrands,
    hasRunningErrands,
    hasBids,
    hasAcceptedBids,
    errandMatches,
    hasMatches,
    myBidErrandIds,

    // Helpers
    isPoster,
    hasUserBid,
    getUserBid,
    getAcceptedRunnerId,
    isAcceptedRunner,
    isEscrowConfirmed,
    getAllowedActions,
    findErrandById,

    // Actions
    fetchMarket,
    fetchErrand,
    createErrand,

    fetchMyPosted,
    fetchMyAccepted,
    fetchMyInProgress,
    cancelErrand,
    confirmErrand,
    disputeErrand,

    fetchMyRunning,
    fetchMyBids,
    fetchMyAcceptedBids,
    startErrand,
    completeErrand,

    placeBid,
    acceptBid,
    withdrawBid,
    payErrand,

    fetchErrandMatches,
    extendDeadline,

    clearCurrent,
    resetError,
    fetchAndPatchPosted,
    clearAllErrors,
    refreshUserData,
  };
});