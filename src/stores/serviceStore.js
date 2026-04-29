// src/stores/serviceStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { serviceApi } from "@/api/serviceApi";
import { useUserStore } from "./userStore";

// ─────────────────────────────────────────────
// Response Parsers
// ─────────────────────────────────────────────

function parseListResponse(res) {
  return {
    items: Array.isArray(res?.data) ? res.data : [],
    meta: res?.meta ?? null,
  };
}

function parseSingleService(res) {
  return res?.data?.listing ?? null;
}

function parseSingleOrder(res) {
  return res?.data?.order ?? res?.data ?? null;
}

/**
 * Parse an order from an action response.
 * Backend may return { data: { order: {...} } } or { data: {...} }
 */
function parseOrderFromAction(res) {
  return res?.data?.order ?? res?.data ?? null;
}

export const useServiceStore = defineStore("service", () => {
  // ─────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────

  const marketplace = ref([]);
  const marketplaceMeta = ref(null);

  const myListings = ref([]);
  const myListingsMeta = ref(null);

  const currentService = ref(null);

  const buyingOrders = ref([]);
  const buyingOrdersMeta = ref(null);

  const sellingOrders = ref([]);
  const sellingOrdersMeta = ref(null);

  const currentOrder = ref(null);

  const loading = ref(false);
  const actionLoading = ref(false);
  const error = ref(null);

  // ─────────────────────────────────────────────
  // User Store
  // ─────────────────────────────────────────────

  const userStore = useUserStore();

  // ─────────────────────────────────────────────
  // Getters
  // ─────────────────────────────────────────────

  const activeServices = computed(() =>
    marketplace.value.filter((s) => s.status === "active"),
  );

  const draftListings = computed(() =>
    myListings.value.filter((s) => s.status === "draft"),
  );

  const activeListings = computed(() =>
    myListings.value.filter((s) => s.status === "active"),
  );

  /** Pending buying orders that still need payment */
  const pendingPaymentOrders = computed(() =>
    buyingOrders.value.filter((o) => o.status === "pending_payment"),
  );

  const isSeller = computed(() => (serviceId) => {
    const userId = userStore.user?._id;
    if (!userId) return false;

    const service = findServiceById(serviceId);
    if (!service) return false;

    const sellerId =
      typeof service.sellerId === "object"
        ? service.sellerId?._id
        : service.sellerId;

    return sellerId === userId;
  });

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────

  function findServiceById(serviceId) {
    return (
      marketplace.value.find((s) => s._id === serviceId) ||
      myListings.value.find((s) => s._id === serviceId) ||
      (currentService.value?._id === serviceId ? currentService.value : null)
    );
  }

  function upsertService(service) {
    const lists = [marketplace, myListings];

    lists.forEach((list) => {
      const index = list.value.findIndex((s) => s._id === service._id);
      if (index !== -1) {
        list.value[index] = {
          ...list.value[index],
          ...service,
        };
      }
    });

    if (currentService.value?._id === service._id) {
      currentService.value = {
        ...currentService.value,
        ...service,
      };
    }
  }

  function updateOrderInLists(order) {
    if (!order?._id) return;
    const update = (list) => {
      const index = list.value.findIndex((o) => o._id === order._id);
      if (index !== -1) list.value[index] = order;
    };

    update(buyingOrders);
    update(sellingOrders);

    if (currentOrder.value?._id === order._id) {
      currentOrder.value = order;
    }
  }

  // ─────────────────────────────────────────────
  // Marketplace
  // ─────────────────────────────────────────────

  async function fetchMarketplace(params = {}) {
    loading.value = true;
    error.value = null;

    try {
      const res = await serviceApi.getServices(params);
      const { items, meta } = parseListResponse(res);

      marketplace.value = items;
      marketplaceMeta.value = meta;

      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load services";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ─────────────────────────────────────────────
  // My Listings
  // ─────────────────────────────────────────────

  async function fetchMyListings(params = {}) {
    loading.value = true;
    error.value = null;

    try {
      const res = await serviceApi.getMyListings(params);
      const { items, meta } = parseListResponse(res);

      myListings.value = items;
      myListingsMeta.value = meta;

      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to load your listings";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ─────────────────────────────────────────────
  // Single Service
  // ─────────────────────────────────────────────

  async function fetchService(serviceId) {
    loading.value = true;
    error.value = null;

    try {
      const res = await serviceApi.getService(serviceId);
      currentService.value = parseSingleService(res);
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load service";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ─────────────────────────────────────────────
  // Create Service
  // ─────────────────────────────────────────────

  async function createService(data) {
    actionLoading.value = true;
    error.value = null;

    try {
      const res = await serviceApi.createService(data);
      const newService = res?.data?.listing ?? null;

      if (newService?._id) {
        myListings.value.unshift(newService);
      }

      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to create service";
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  // ─────────────────────────────────────────────
  // Update Service
  // ─────────────────────────────────────────────

  async function updateService(serviceId, data) {
    actionLoading.value = true;
    error.value = null;

    try {
      const res = await serviceApi.updateService(serviceId, data);
      const updatedService = res?.data?.listing ?? res?.data;

      if (updatedService?._id) {
        upsertService(updatedService);
      }

      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to update service";
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  // ─────────────────────────────────────────────
  // Delete Service (soft delete / deactivate)
  // ─────────────────────────────────────────────

  async function deleteService(serviceId) {
    actionLoading.value = true;
    error.value = null;

    try {
      const res = await serviceApi.deleteService(serviceId);

      // Backend soft-deletes — mark as deactivated in local state
      const markDeactivated = (list) => {
        const svc = list.value.find((s) => s._id === serviceId);
        if (svc) {
          svc.isDeactivated = true;
          svc.status = "deactivated";
        }
      };

      markDeactivated(myListings);
      markDeactivated(marketplace);

      if (currentService.value?._id === serviceId) {
        currentService.value = {
          ...currentService.value,
          isDeactivated: true,
          status: "deactivated",
        };
      }

      return res;
    } catch (err) {
      if (err.response?.data?.message?.includes("active orders")) {
        error.value =
          "Cannot delete this service because it has active orders. Please complete or cancel all orders first.";
      } else {
        error.value =
          err.response?.data?.message || "Failed to delete service";
      }
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  // ─────────────────────────────────────────────
  // Create Order
  // STEP 3 — Places order → status: PENDING_PAYMENT
  // ─────────────────────────────────────────────

  async function createOrder(serviceId, orderData) {
    actionLoading.value = true;
    error.value = null;

    try {
      const res = await serviceApi.createOrder(serviceId, orderData);

      const newOrder = res?.data?.order ?? null;

      if (newOrder?._id) {
        buyingOrders.value.unshift(newOrder);
      }

      return res;
    } catch (err) {
      const serverMessage =
        err.response?.data?.data?.message ||
        err.response?.data?.message ||
        err.message ||
        "Failed to create order";

      if (serverMessage.includes("not currently accepting orders")) {
        error.value =
          "This service is not currently accepting orders. The seller may have paused it.";
      } else {
        error.value = serverMessage;
      }

      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  // ─────────────────────────────────────────────
  // Buying Orders
  // ─────────────────────────────────────────────

  async function fetchBuyingOrders(params = {}) {
    loading.value = true;
    error.value = null;

    try {
      const res = await serviceApi.getBuyingOrders(params);
      const { items, meta } = parseListResponse(res);

      buyingOrders.value = items;
      buyingOrdersMeta.value = meta;

      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to load buying orders";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ─────────────────────────────────────────────
  // Selling Orders
  // ─────────────────────────────────────────────

  async function fetchSellingOrders(params = {}) {
    loading.value = true;
    error.value = null;

    try {
      const res = await serviceApi.getSellingOrders(params);
      const { items, meta } = parseListResponse(res);

      sellingOrders.value = items;
      sellingOrdersMeta.value = meta;

      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to load selling orders";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ─────────────────────────────────────────────
  // Single Order
  // ─────────────────────────────────────────────

  async function fetchOrder(orderId) {
    loading.value = true;
    error.value = null;

    try {
      const res = await serviceApi.getOrder(orderId);
      currentOrder.value = parseSingleOrder(res);
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load order";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ─────────────────────────────────────────────
  // Order Actions
  // ─────────────────────────────────────────────

  /**
   * STEP 6 — Seller delivers → status: DELIVERED
   */
  async function deliverOrder(orderId, deliveryNote) {
    actionLoading.value = true;
    error.value = null;

    try {
      const res = await serviceApi.deliverOrder(orderId, deliveryNote);
      const updated = parseOrderFromAction(res);
      if (updated) updateOrderInLists(updated);
      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to deliver order";
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  /**
   * STEP 7A — Buyer confirms → status: COMPLETED
   * Earnings held in pendingEarnings until admin clearance
   */
  async function confirmOrder(orderId) {
    actionLoading.value = true;
    error.value = null;

    try {
      const res = await serviceApi.confirmOrder(orderId);
      const updated = parseOrderFromAction(res);
      if (updated) updateOrderInLists(updated);
      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to confirm order";
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  /**
   * STEP 7B — Buyer requests revision → status: REVISION
   */
  async function requestRevision(orderId, note) {
    actionLoading.value = true;
    error.value = null;

    try {
      const res = await serviceApi.requestRevision(orderId, note);
      const updated = parseOrderFromAction(res);
      if (updated) updateOrderInLists(updated);
      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to request revision";
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  /**
   * STEP 7C — Dispute → status: DISPUTED
   */
  async function disputeOrder(orderId, reason) {
    actionLoading.value = true;
    error.value = null;

    try {
      const res = await serviceApi.disputeOrder(orderId, reason);
      const updated = parseOrderFromAction(res);
      if (updated) updateOrderInLists(updated);
      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to open dispute";
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  /**
   * Cancel order — ONLY when status = PENDING_PAYMENT (before escrow confirmed)
   */
  async function cancelOrder(orderId) {
    actionLoading.value = true;
    error.value = null;

    try {
      const res = await serviceApi.cancelOrder(orderId);
      const updated = parseOrderFromAction(res);
      if (updated) updateOrderInLists(updated);
      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to cancel order";
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  // ─────────────────────────────────────────────
  // Pay Order
  // STEP 4 — Returns authorizationUrl for Paystack redirect
  // ─────────────────────────────────────────────

  async function payOrder(orderId) {
    actionLoading.value = true;
    error.value = null;

    try {
      const res = await serviceApi.payOrder(orderId);
      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to initiate payment";
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  // ─────────────────────────────────────────────
  // Utilities
  // ─────────────────────────────────────────────

  /**
   * Silently refresh buying and/or selling orders in the background.
   * Does NOT set loading = true, so the UI never shows skeleton loaders.
   * Used by the polling loop in MyServices.vue.
   */
  async function silentRefreshOrders({ buying = true, selling = false } = {}) {
    try {
      const calls = []
      if (buying) {
        calls.push(
          serviceApi.getBuyingOrders().then((res) => {
            const { items } = parseListResponse(res)
            buyingOrders.value = items
          }),
        )
      }
      if (selling) {
        calls.push(
          serviceApi.getSellingOrders().then((res) => {
            const { items } = parseListResponse(res)
            sellingOrders.value = items
          }),
        )
      }
      await Promise.all(calls)
    } catch {
      // Silent — polling failures must never disrupt the UI
    }
  }

  function clearCurrentService() {
    currentService.value = null;
  }

  function clearCurrentOrder() {
    currentOrder.value = null;
  }

  function resetError() {
    error.value = null;
  }

  function clearStore() {
    marketplace.value = [];
    myListings.value = [];
    buyingOrders.value = [];
    sellingOrders.value = [];

    marketplaceMeta.value = null;
    myListingsMeta.value = null;
    buyingOrdersMeta.value = null;
    sellingOrdersMeta.value = null;

    currentService.value = null;
    currentOrder.value = null;
    error.value = null;
  }

  // ─────────────────────────────────────────────
  // Expose
  // ─────────────────────────────────────────────

  return {
    // state
    marketplace,
    marketplaceMeta,
    myListings,
    myListingsMeta,
    currentService,
    buyingOrders,
    buyingOrdersMeta,
    sellingOrders,
    sellingOrdersMeta,
    currentOrder,
    loading,
    actionLoading,
    error,

    // getters
    activeServices,
    draftListings,
    activeListings,
    pendingPaymentOrders,
    isSeller,

    // actions
    fetchMarketplace,
    fetchMyListings,
    fetchService,
    createService,
    updateService,
    deleteService,
    createOrder,
    fetchBuyingOrders,
    fetchSellingOrders,
    fetchOrder,
    deliverOrder,
    confirmOrder,
    requestRevision,
    disputeOrder,
    cancelOrder,
    payOrder,
    silentRefreshOrders,

    // utils
    clearCurrentService,
    clearCurrentOrder,
    resetError,
    clearStore,
  };
});