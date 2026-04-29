// src/stores/adminStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { adminApi } from "@/api/adminApi";
import { socketService, SOCKET_EVENTS } from "@/services/socket";

// ─── Constants ─────────────────────────────────────────────────────────────

export const VERIFICATION_STATUS = {
  PENDING:  "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
};

export const CLEARANCE_STATUS = {
  PENDING:  "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const ERRAND_STATUS = {
  POSTED:    "posted",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  DISPUTED:  "disputed",
  CANCELLED: "cancelled",
};

export const ORDER_STATUS = {
  PENDING:     "pending",
  IN_PROGRESS: "in_progress",
  DELIVERED:   "delivered",
  COMPLETED:   "completed",
  DISPUTED:    "disputed",
  CANCELLED:   "cancelled",
};

export const SUSPENSION_OUTCOME = {
  SUSPENDED:   "suspended",
  UNSUSPENDED: "unsuspended",
};

// ─── Default meta shape ───────────────────────────────────────────────────

const defaultMeta = () => ({
  total: 0, page: 1, limit: 20,
  totalPages: 1, hasNextPage: false, hasPrevPage: false,
});

// ─── Store ─────────────────────────────────────────────────────────────────

export const useAdminStore = defineStore("admin", () => {

  // ── Verifications ──────────────────────────────────────────────────────────

  const verifications       = ref([]);
  const verificationsLoading = ref(false);
  const verificationsMeta   = ref(defaultMeta());
  const selectedVerification = ref(null);
  const selectedVerificationLoading = ref(false);
  const verificationActionLoading   = ref(false);
  const documentObjectUrl           = ref(null);
  const documentLoading             = ref(false);

  // ── Users ──────────────────────────────────────────────────────────────────

  const users        = ref([]);
  const usersLoading = ref(false);
  const usersMeta    = ref(defaultMeta());
  const selectedUser = ref(null);
  const selectedUserLoading    = ref(false);
  const userActionLoading      = ref(false);
  const cbcCreditLoading       = ref(false);

  // ── Errands ────────────────────────────────────────────────────────────────

  const errands        = ref([]);
  const errandsLoading = ref(false);
  const errandsMeta    = ref(defaultMeta());
  const selectedErrand = ref(null);
  const selectedErrandLoading  = ref(false);
  const errandActionLoading    = ref(false);

  // ── Orders ─────────────────────────────────────────────────────────────────

  const orders        = ref([]);
  const ordersLoading = ref(false);
  const ordersMeta    = ref(defaultMeta());
  const selectedOrder = ref(null);
  const selectedOrderLoading = ref(false);
  const orderActionLoading   = ref(false);

  // ── Subscriptions ──────────────────────────────────────────────────────────

  const subscriptions        = ref([]);
  const subscriptionsLoading = ref(false);
  const subscriptionsMeta    = ref(defaultMeta());
  const selectedSubscription = ref(null);
  const selectedSubscriptionLoading = ref(false);

  // ── Clearances ─────────────────────────────────────────────────────────────

  const clearances        = ref([]);
  const clearancesLoading = ref(false);
  const clearancesMeta    = ref(defaultMeta());
  const clearanceActionLoading     = ref(false);
  const bulkClearanceLoading       = ref(false);
  const selectedClearanceIds       = ref([]); // tracks checked items for bulk ops

  // ── Shared error ───────────────────────────────────────────────────────────

  const error = ref(null);

  // ─── Getters ────────────────────────────────────────────────────────────────

  // Verifications
  const pendingVerifications  = computed(() => verifications.value.filter((v) => v.status === VERIFICATION_STATUS.PENDING));
  const verifiedVerifications = computed(() => verifications.value.filter((v) => v.status === VERIFICATION_STATUS.VERIFIED));
  const rejectedVerifications = computed(() => verifications.value.filter((v) => v.status === VERIFICATION_STATUS.REJECTED));
  const aiFlaggedVerifications = computed(() => verifications.value.filter((v) => v.aiFlaggedForReview));

  // Users
  const activeUsers    = computed(() => users.value.filter((u) => u.isActive && !u.isSuspended));
  const suspendedUsers = computed(() => users.value.filter((u) => u.isSuspended));
  const studentUsers   = computed(() => users.value.filter((u) => u.isStudent));
  const verifiedUsers  = computed(() => users.value.filter((u) => u.identityVerificationStatus === "verified"));

  // Errands
  const disputedErrands   = computed(() => errands.value.filter((e) => e.status === ERRAND_STATUS.DISPUTED));
  const completedErrands  = computed(() => errands.value.filter((e) => e.status === ERRAND_STATUS.COMPLETED));
  const postedErrands     = computed(() => errands.value.filter((e) => e.status === ERRAND_STATUS.POSTED));

  // Orders
  const disputedOrders    = computed(() => orders.value.filter((o) => o.status === ORDER_STATUS.DISPUTED));
  const inProgressOrders  = computed(() => orders.value.filter((o) => o.status === ORDER_STATUS.IN_PROGRESS));
  const completedOrders   = computed(() => orders.value.filter((o) => o.status === ORDER_STATUS.COMPLETED));

  // Clearances
  const pendingClearances  = computed(() => clearances.value.filter((c) => c.status === CLEARANCE_STATUS.PENDING));
  const approvedClearances = computed(() => clearances.value.filter((c) => c.status === CLEARANCE_STATUS.APPROVED));
  const rejectedClearances = computed(() => clearances.value.filter((c) => c.status === CLEARANCE_STATUS.REJECTED));
  const allClearancesSelected = computed(() =>
    pendingClearances.value.length > 0 &&
    pendingClearances.value.every((c) => selectedClearanceIds.value.includes(c._id))
  );

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function resetError() { error.value = null; }

  /** Extract meta from any API response that includes a meta object */
  function extractMeta(res, metaRef) {
    if (res?.meta) metaRef.value = { ...defaultMeta(), ...res.meta };
  }

  // ─── Admin Socket Bindings ────────────────────────────────────────────────

  let _socketBound = false;

  function bindAdminSocketEvents() {
    if (_socketBound) return;
    _socketBound = true;

    // New verification submitted — prepend to list
    socketService.on(SOCKET_EVENTS.ADMIN_VERIFICATION_NEW, (verification) => {
      verifications.value.unshift(verification);
      verificationsMeta.value.total += 1;
    });

    // Verification status changed (e.g. reviewed in another tab)
    socketService.on(SOCKET_EVENTS.ADMIN_VERIFICATION_UPDATED, ({ id, status, adminNote, reviewedAt }) => {
      const idx = verifications.value.findIndex(v => v._id === id);
      if (idx !== -1) {
        verifications.value[idx] = {
          ...verifications.value[idx],
          status,
          adminNote,
          reviewedAt,
        };
      }
      // Update detail view if open
      if (selectedVerification.value?._id === id) {
        selectedVerification.value = { ...selectedVerification.value, status, adminNote, reviewedAt };
      }
    });

    // Errand became disputed
    socketService.on(SOCKET_EVENTS.ADMIN_ERRAND_DISPUTED, (errand) => {
      const idx = errands.value.findIndex(e => e._id === errand.errandId);
      if (idx !== -1) {
        errands.value[idx] = { ...errands.value[idx], status: ERRAND_STATUS.DISPUTED };
      }
    });

    // Order became disputed
    socketService.on(SOCKET_EVENTS.ADMIN_ORDER_DISPUTED, (order) => {
      const idx = orders.value.findIndex(o => o._id === order.orderId);
      if (idx !== -1) {
        orders.value[idx] = { ...orders.value[idx], status: ORDER_STATUS.DISPUTED };
      }
    });

    // New clearance submitted
    socketService.on(SOCKET_EVENTS.ADMIN_CLEARANCE_NEW, (clearance) => {
      clearances.value.unshift(clearance);
      clearancesMeta.value.total += 1;
    });

    // New user registered
    socketService.on(SOCKET_EVENTS.ADMIN_USER_REGISTERED, (user) => {
      users.value.unshift(user);
      usersMeta.value.total += 1;
    });
  }

  function unbindAdminSocketEvents() {
    socketService.off(SOCKET_EVENTS.ADMIN_VERIFICATION_NEW);
    socketService.off(SOCKET_EVENTS.ADMIN_VERIFICATION_UPDATED);
    socketService.off(SOCKET_EVENTS.ADMIN_ERRAND_DISPUTED);
    socketService.off(SOCKET_EVENTS.ADMIN_ORDER_DISPUTED);
    socketService.off(SOCKET_EVENTS.ADMIN_CLEARANCE_NEW);
    socketService.off(SOCKET_EVENTS.ADMIN_USER_REGISTERED);
    _socketBound = false;
  }

  // ─── Verification Actions ────────────────────────────────────────────────

  /**
   * Fetch paginated list of verification submissions.
   * @param {Object} params - { page, limit, status, ... }
   */
  async function fetchVerifications(params = {}) {
    verificationsLoading.value = true;
    error.value = null;
    try {
      const res = await adminApi.listVerifications(params);
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      verifications.value = list;
      extractMeta(Array.isArray(res) ? {} : res, verificationsMeta);
      bindAdminSocketEvents();
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to load verifications";
      throw err;
    } finally {
      verificationsLoading.value = false;
    }
  }

  /**
   * Fetch a single verification (loads documentUrl not in the list response).
   * @param {string} verificationId
   */
  async function fetchVerification(verificationId) {
    selectedVerificationLoading.value = true;
    error.value = null;
    try {
      const res = await adminApi.getVerification(verificationId);
      // Response: { success, data: { verification: {...} } }
      selectedVerification.value = res?.data?.verification ?? res?.data ?? null;
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to load verification";
      throw err;
    } finally {
      selectedVerificationLoading.value = false;
    }
  }

  /**
   * Approve or reject a verification.
   * Patches the item in the local list immediately for instant UI feedback.
   * @param {string} verificationId
   * @param {{ status: "verified"|"rejected", adminNote: string }} payload
   */
  async function reviewVerification(verificationId, payload) {
    verificationActionLoading.value = true;
    error.value = null;
    try {
      const res = await adminApi.reviewVerification(verificationId, payload);
      // Response: { success, data: { message, verification: { id, status, reviewedAt, adminNote } } }
      const updated = res?.data?.verification ?? {};

      // Patch in list
      const idx = verifications.value.findIndex((v) => v._id === verificationId);
      if (idx !== -1 && updated.status) {
        verifications.value[idx] = {
          ...verifications.value[idx],
          status:     updated.status,
          reviewedAt: updated.reviewedAt,
          adminNote:  updated.adminNote,
        };
      }

      // Patch selected
      if (selectedVerification.value?._id === verificationId && updated.status) {
        selectedVerification.value = {
          ...selectedVerification.value,
          status:     updated.status,
          reviewedAt: updated.reviewedAt,
          adminNote:  updated.adminNote,
        };
      }

      return res;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to review verification";
      throw err;
    } finally {
      verificationActionLoading.value = false;
    }
  }

  /**
   * Fetch the raw document blob via the backend proxy.
   * Creates a local blob: URL so the browser renders it without any
   * Cloudinary X-Frame-Options / signed-URL issues.
   * @param {string} verificationId
   */
  /**
   * Prepare the document URL for rendering.
   * Uses the documentUrl from the already-fetched verification.
   * fetchVerification() is always called first so the URL is fresh.
   * NOTE: The /document proxy endpoint is not used because it currently
   * returns 500. Once fixed by the backend, switch back to the proxy.
   */
  async function fetchVerificationDocument(verificationId) {
    if (documentObjectUrl.value) {
      URL.revokeObjectURL(documentObjectUrl.value);
      documentObjectUrl.value = null;
    }
    documentLoading.value = true;
    error.value = null;
    try {
      const url = selectedVerification.value?.documentUrl;
      if (!url) throw new Error("No document URL available");
      // Store the URL directly — the signed Cloudinary URL works in
      // <img src> and <iframe src> natively (browser sends the request
      // with the full signed URL including the auth token).
      // We don't wrap in a blob: URL here because private Cloudinary URLs
      // require Cloudinary authentication that plain fetch() can't supply.
      documentObjectUrl.value = url;
      return url;
    } catch (err) {
      error.value = err.message || "Failed to load document";
      throw err;
    } finally {
      documentLoading.value = false;
    }
  }

  /**
   * Fetch paginated list of users.
   * @param {Object} params - { page, limit, role, isSuspended, ... }
   */
  async function fetchUsers(params = {}) {
    usersLoading.value = true;
    error.value = null;
    try {
      const res = await adminApi.listUsers(params);
      // Response: { success, data: [...], meta: {...} }
      users.value = Array.isArray(res?.data) ? res.data : [];
      extractMeta(res, usersMeta);
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to load users";
      throw err;
    } finally {
      usersLoading.value = false;
    }
  }

  /**
   * Fetch a single user's detail (includes company for corporate users).
   * @param {string} userId
   */
  async function fetchUser(userId) {
    selectedUserLoading.value = true;
    error.value = null;
    try {
      const res = await adminApi.getUser(userId);
      // Response: { success, data: { user: {...}, company: null|{...} } }
      selectedUser.value = res?.data ?? null;
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to load user";
      throw err;
    } finally {
      selectedUserLoading.value = false;
    }
  }

  /**
   * Toggle user suspension. Patches local state optimistically.
   * @param {string} userId
   * @param {{ reason: string }} payload
   */
  async function toggleUserSuspension(userId, payload) {
    userActionLoading.value = true;
    error.value = null;
    try {
      const res = await adminApi.toggleUserSuspension(userId, payload);
      // Response: { success, data: { message, userId, isSuspended } }
      const updated = res?.data ?? {};

      const patchUser = (u) =>
        u._id === userId ? { ...u, isSuspended: updated.isSuspended } : u;

      users.value = users.value.map(patchUser);

      if (selectedUser.value?.user?._id === userId) {
        selectedUser.value = {
          ...selectedUser.value,
          user: { ...selectedUser.value.user, isSuspended: updated.isSuspended },
        };
      }

      return res;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to toggle suspension";
      throw err;
    } finally {
      userActionLoading.value = false;
    }
  }

  /**
   * Manually credit CBC tokens to a user.
   * @param {{ userId: string, amount: number, note: string }} payload
   */
  async function creditCBC(payload) {
    cbcCreditLoading.value = true;
    error.value = null;
    try {
      const res = await adminApi.creditCBC(payload);
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to credit CBC";
      throw err;
    } finally {
      cbcCreditLoading.value = false;
    }
  }

  // ─── Errand Actions ──────────────────────────────────────────────────────

  /**
   * Fetch paginated list of errands.
   * @param {Object} params - { page, limit, status, ... }
   */
  async function fetchErrands(params = {}) {
    errandsLoading.value = true;
    error.value = null;
    try {
      const res = await adminApi.listErrands(params);
      errands.value = Array.isArray(res?.data) ? res.data : [];
      extractMeta(res, errandsMeta);
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to load errands";
      throw err;
    } finally {
      errandsLoading.value = false;
    }
  }

  /**
   * Fetch a single errand detail (posterId is populated).
   * @param {string} errandId
   */
  async function fetchErrand(errandId) {
    selectedErrandLoading.value = true;
    error.value = null;
    try {
      const res = await adminApi.getErrand(errandId);
      // Response: { success, data: { errand: {...} } }
      selectedErrand.value = res?.data?.errand ?? res?.data ?? null;
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to load errand";
      throw err;
    } finally {
      selectedErrandLoading.value = false;
    }
  }

  /**
   * Resolve a disputed errand.
   * @param {string} errandId
   * @param {{ outcome: "favour_poster"|"favour_runner", adminNote: string }} payload
   */
  async function resolveErrand(errandId, payload) {
    errandActionLoading.value = true;
    error.value = null;
    try {
      const res = await adminApi.resolveErrand(errandId, payload);
      // Response: { success, data: { message, errand: {...} } }
      const updatedErrand = res?.data?.errand ?? {};

      // Patch in list (list items are not fully populated so just update status fields)
      const idx = errands.value.findIndex((e) => e._id === errandId);
      if (idx !== -1) {
        errands.value[idx] = { ...errands.value[idx], ...updatedErrand };
      }

      // Replace selected errand fully
      if (selectedErrand.value?._id === errandId) {
        selectedErrand.value = { ...selectedErrand.value, ...updatedErrand };
      }

      return res;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to resolve errand";
      throw err;
    } finally {
      errandActionLoading.value = false;
    }
  }

  // ─── Order Actions ───────────────────────────────────────────────────────

  /**
   * Fetch paginated list of service orders.
   * @param {Object} params - { page, limit, status, ... }
   */
  async function fetchOrders(params = {}) {
    ordersLoading.value = true;
    error.value = null;
    try {
      const res = await adminApi.listOrders(params);
      orders.value = Array.isArray(res?.data) ? res.data : [];
      extractMeta(res, ordersMeta);
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to load orders";
      throw err;
    } finally {
      ordersLoading.value = false;
    }
  }

  /**
   * Fetch a single order detail (buyerId, sellerId, listingId are populated).
   * @param {string} orderId
   */
  async function fetchOrder(orderId) {
    selectedOrderLoading.value = true;
    error.value = null;
    try {
      const res = await adminApi.getOrder(orderId);
      // Response: { success, data: { order: {...} } }
      selectedOrder.value = res?.data?.order ?? res?.data ?? null;
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to load order";
      throw err;
    } finally {
      selectedOrderLoading.value = false;
    }
  }

  /**
   * Resolve a disputed service order.
   * @param {string} orderId
   * @param {{ outcome: "favour_buyer"|"favour_seller", adminNote: string }} payload
   */
  async function resolveOrder(orderId, payload) {
    orderActionLoading.value = true;
    error.value = null;
    try {
      const res = await adminApi.resolveOrder(orderId, payload);
      const updatedOrder = res?.data?.order ?? {};

      const idx = orders.value.findIndex((o) => o._id === orderId);
      if (idx !== -1) {
        orders.value[idx] = { ...orders.value[idx], ...updatedOrder };
      }

      if (selectedOrder.value?._id === orderId) {
        selectedOrder.value = { ...selectedOrder.value, ...updatedOrder };
      }

      return res;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to resolve order";
      throw err;
    } finally {
      orderActionLoading.value = false;
    }
  }

  // ─── Subscription Actions ────────────────────────────────────────────────

  /**
   * Fetch paginated list of subscriptions.
   * @param {Object} params - { page, limit, status, tier, ... }
   */
  async function fetchSubscriptions(params = {}) {
    subscriptionsLoading.value = true;
    error.value = null;
    try {
      const res = await adminApi.listSubscriptions(params);
      subscriptions.value = Array.isArray(res?.data) ? res.data : [];
      extractMeta(res, subscriptionsMeta);
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to load subscriptions";
      throw err;
    } finally {
      subscriptionsLoading.value = false;
    }
  }

  /**
   * Fetch a single subscription detail (userId is populated).
   * @param {string} subscriptionId
   */
  async function fetchSubscription(subscriptionId) {
    selectedSubscriptionLoading.value = true;
    error.value = null;
    try {
      const res = await adminApi.getSubscription(subscriptionId);
      // Response: { success, data: { subscription: {...} } }
      selectedSubscription.value = res?.data?.subscription ?? res?.data ?? null;
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to load subscription";
      throw err;
    } finally {
      selectedSubscriptionLoading.value = false;
    }
  }

  // ─── Clearance Actions ───────────────────────────────────────────────────

  /**
   * Fetch paginated list of earnings clearances.
   * @param {Object} params - { page, limit, status, ... }
   */
  async function fetchClearances(params = {}) {
    clearancesLoading.value = true;
    error.value = null;
    try {
      const res = await adminApi.listClearances(params);
      clearances.value = Array.isArray(res?.data) ? res.data : [];
      extractMeta(res, clearancesMeta);
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to load clearances";
      throw err;
    } finally {
      clearancesLoading.value = false;
    }
  }

  /**
   * Approve a single clearance and patch it in the local list.
   * @param {string} clearanceId
   */
  async function approveClearance(clearanceId) {
    clearanceActionLoading.value = true;
    error.value = null;
    try {
      const res = await adminApi.approveClearance(clearanceId);
      _patchClearanceStatus(clearanceId, CLEARANCE_STATUS.APPROVED);
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to approve clearance";
      throw err;
    } finally {
      clearanceActionLoading.value = false;
    }
  }

  /**
   * Reject a single clearance.
   * @param {string} clearanceId
   * @param {{ adminNote: string }} payload
   */
  async function rejectClearance(clearanceId, payload) {
    clearanceActionLoading.value = true;
    error.value = null;
    try {
      const res = await adminApi.rejectClearance(clearanceId, payload);
      _patchClearanceStatus(clearanceId, CLEARANCE_STATUS.REJECTED);
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to reject clearance";
      throw err;
    } finally {
      clearanceActionLoading.value = false;
    }
  }

  /**
   * Reapprove a previously rejected clearance.
   * @param {string} clearanceId
   */
  async function reapproveClearance(clearanceId) {
    clearanceActionLoading.value = true;
    error.value = null;
    try {
      const res = await adminApi.reapproveClearance(clearanceId);
      _patchClearanceStatus(clearanceId, CLEARANCE_STATUS.APPROVED);
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to reapprove clearance";
      throw err;
    } finally {
      clearanceActionLoading.value = false;
    }
  }

  /**
   * Bulk approve all selected (or provided) clearances.
   * @param {string[]|null} ids - If null, uses selectedClearanceIds
   */
  async function bulkApproveClearances(ids = null) {
    const clearanceIds = ids ?? selectedClearanceIds.value;
    if (!clearanceIds.length) return;

    bulkClearanceLoading.value = true;
    error.value = null;
    try {
      const res = await adminApi.bulkApproveClearances({ clearanceIds });
      // Response: { success, data: { message, succeeded, failed } }

      // Mark all submitted IDs as approved locally (backend reports succeeded/failed count,
      // not individual IDs — re-fetch for exact state if needed)
      clearanceIds.forEach((id) => _patchClearanceStatus(id, CLEARANCE_STATUS.APPROVED));
      selectedClearanceIds.value = [];

      return res;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to bulk approve clearances";
      throw err;
    } finally {
      bulkClearanceLoading.value = false;
    }
  }

  // ── Clearance selection helpers (for bulk UI) ──────────────────────────

  function toggleClearanceSelection(clearanceId) {
    const idx = selectedClearanceIds.value.indexOf(clearanceId);
    if (idx === -1) selectedClearanceIds.value.push(clearanceId);
    else selectedClearanceIds.value.splice(idx, 1);
  }

  function selectAllPendingClearances() {
    selectedClearanceIds.value = pendingClearances.value.map((c) => c._id);
  }

  function clearClearanceSelection() {
    selectedClearanceIds.value = [];
  }

  function isClearanceSelected(clearanceId) {
    return selectedClearanceIds.value.includes(clearanceId);
  }

  // ── Private helpers ────────────────────────────────────────────────────

  function _patchClearanceStatus(clearanceId, status) {
    const idx = clearances.value.findIndex((c) => c._id === clearanceId);
    if (idx !== -1) {
      clearances.value[idx] = { ...clearances.value[idx], status };
    }
  }

  // ─── Reset / Clear ────────────────────────────────────────────────────────

  function clearSelectedVerification() { selectedVerification.value = null; }
  function clearSelectedUser()         { selectedUser.value = null; }
  function clearSelectedErrand()       { selectedErrand.value = null; }
  function clearSelectedOrder()        { selectedOrder.value = null; }
  function clearSelectedSubscription() { selectedSubscription.value = null; }

  /** Reset all admin state — call on admin logout */
  function clearAdminState() {
    verifications.value = []; verificationsMeta.value = defaultMeta();
    selectedVerification.value = null;

    users.value = []; usersMeta.value = defaultMeta();
    selectedUser.value = null;

    errands.value = []; errandsMeta.value = defaultMeta();
    selectedErrand.value = null;

    orders.value = []; ordersMeta.value = defaultMeta();
    selectedOrder.value = null;

    subscriptions.value = []; subscriptionsMeta.value = defaultMeta();
    selectedSubscription.value = null;

    clearances.value = []; clearancesMeta.value = defaultMeta();
    selectedClearanceIds.value = [];

    error.value = null;
  }

  // ─── Exports ──────────────────────────────────────────────────────────────

  return {
    // ── Verification state
    verifications, verificationsLoading, verificationsMeta,
    selectedVerification, selectedVerificationLoading, verificationActionLoading,
    documentObjectUrl, documentLoading,

    // ── User state
    users, usersLoading, usersMeta,
    selectedUser, selectedUserLoading, userActionLoading, cbcCreditLoading,

    // ── Errand state
    errands, errandsLoading, errandsMeta,
    selectedErrand, selectedErrandLoading, errandActionLoading,

    // ── Order state
    orders, ordersLoading, ordersMeta,
    selectedOrder, selectedOrderLoading, orderActionLoading,

    // ── Subscription state
    subscriptions, subscriptionsLoading, subscriptionsMeta,
    selectedSubscription, selectedSubscriptionLoading,

    // ── Clearance state
    clearances, clearancesLoading, clearancesMeta,
    clearanceActionLoading, bulkClearanceLoading, selectedClearanceIds,

    // ── Shared
    error,

    // ── Verification getters
    pendingVerifications, verifiedVerifications,
    rejectedVerifications, aiFlaggedVerifications,

    // ── User getters
    activeUsers, suspendedUsers, studentUsers, verifiedUsers,

    // ── Errand getters
    disputedErrands, completedErrands, postedErrands,

    // ── Order getters
    disputedOrders, inProgressOrders, completedOrders,

    // ── Clearance getters
    pendingClearances, approvedClearances, rejectedClearances, allClearancesSelected,

    // ── Verification actions
    fetchVerifications, fetchVerification, fetchVerificationDocument, reviewVerification,

    // ── User actions
    fetchUsers, fetchUser, toggleUserSuspension, creditCBC,

    // ── Errand actions
    fetchErrands, fetchErrand, resolveErrand,

    // ── Order actions
    fetchOrders, fetchOrder, resolveOrder,

    // ── Subscription actions
    fetchSubscriptions, fetchSubscription,

    // ── Clearance actions
    fetchClearances, approveClearance, rejectClearance,
    reapproveClearance, bulkApproveClearances,
    toggleClearanceSelection, selectAllPendingClearances,
    clearClearanceSelection, isClearanceSelected,

    // ── Utility
    resetError, clearSelectedVerification, clearSelectedUser,
    clearSelectedErrand, clearSelectedOrder, clearSelectedSubscription,
    clearAdminState,
    bindAdminSocketEvents, unbindAdminSocketEvents,
  };
});