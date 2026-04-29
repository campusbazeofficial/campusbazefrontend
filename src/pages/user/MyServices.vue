<!-- src/pages/user/MyServices.vue -->
<template>
  <div class="min-h-screen bg-cb-base">
    <!-- Header -->
    <section class="bg-cb-card border-b border-cb-divider">
      <div class="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div class="mb-2 inline-flex items-center gap-1.5 rounded-full border border-cb-divider bg-cb-base px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">
              <i class="fa-solid fa-briefcase text-[9px]"></i>
              Dashboard
            </div>
            <h1 class="text-xl font-bold tracking-tight text-cb-text sm:text-2xl lg:text-3xl">My Services</h1>
            <p class="mt-1 text-sm text-cb-muted">Manage your service listings and orders.</p>
          </div>
          <router-link
            :to="{ name: 'CreateService' }"
            class="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-cb-accent px-4 py-2.5 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark  sm:w-auto sm:px-5 sm:py-3"
          >
            <i class="fa-solid fa-plus text-xs"></i>
            <span class="hidden sm:inline">Create Service</span>
            <span class="sm:hidden">Create</span>
          </router-link>
        </div>

        <!-- Stats -->
        <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <div v-for="stat in stats" :key="stat.label" class="rounded-xl bg-cb-base p-3 sm:p-3.5">
            <div class="mb-1.5 flex items-center gap-2">
              <div class="flex h-6 w-6 items-center justify-center rounded-lg bg-cb-accent-subtle sm:h-7 sm:w-7">
                <i :class="[stat.icon, 'text-[10px] text-cb-accent sm:text-[11px]']"></i>
              </div>
              <span class="text-[10px] font-semibold uppercase tracking-wider text-cb-muted">{{ stat.label }}</span>
            </div>
            <p class="text-xl font-semibold text-cb-text sm:text-2xl">{{ stat.value }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pending payment banner -->
    <div v-if="hasPendingPaymentOrders" class="mx-auto max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-3 rounded-xl border border-cb-warning/30 bg-cb-warning-subtle px-4 py-3">
        <i class="fa-solid fa-triangle-exclamation shrink-0 text-cb-warning"></i>
        <div class="flex-1 text-sm">
          <span class="font-semibold text-cb-warning">Payment pending</span>
          <span class="ml-1 text-cb-warning/80">— you have {{ pendingPaymentCount }} order{{ pendingPaymentCount !== 1 ? 's' : '' }} awaiting payment.</span>
        </div>
        <button @click="activeTab = 'buying'" class="shrink-0 text-xs font-semibold text-cb-warning underline underline-offset-2">View</button>
      </div>
    </div>

    <!-- Content -->
    <div class="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <!-- Tabs -->
      <div class="mb-5 flex overflow-x-auto no-scrollbar border-b border-cb-divider">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          :class="['shrink-0 mr-6 flex items-center gap-2 border-b-2 pb-3 -mb-px text-sm font-semibold transition-all duration-200', activeTab === tab.key ? 'border-cb-accent text-cb-accent' : 'border-transparent text-cb-muted hover:text-cb-text']"
          @click="activeTab = tab.key"
        >
          <i :class="[tab.icon, 'text-xs']"></i>
          {{ tab.label }}
          <span :class="['rounded-full px-1.5 py-0.5 text-[10px] font-bold transition-colors', activeTab === tab.key ? 'bg-cb-accent-subtle text-cb-accent' : 'bg-cb-field text-cb-muted']">
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- Loading -->
      <template v-if="loading">
        <div class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-28 animate-pulse rounded-2xl border border-cb-divider bg-cb-card"></div>
        </div>
      </template>

      <!-- My Listings Tab — click navigates to ServiceDetailPage -->
      <template v-else-if="activeTab === 'listings'">
        <EmptyState
          v-if="!serviceStore.myListings.length"
          icon="fa-solid fa-shop"
          title="No service listings yet"
          description="Create your first service to start selling."
          :cta="{ label: 'Create a service', to: { name: 'CreateService' }, icon: 'fa-solid fa-plus' }"
        />
        <div v-else class="space-y-3">
          <ServiceListingCard
            v-for="listing in serviceStore.myListings"
            :key="listing._id"
            :listing="listing"
            :action-loading="serviceStore.actionLoading"
            @click="openListingDetail(listing._id)"
            @edit="goToEdit(listing._id)"
            @delete="confirmDeleteListing(listing._id)"
            @status-change="(status) => confirmStatusChange(listing._id, status)"
          />
        </div>
      </template>

      <!-- Selling Orders Tab -->
      <template v-else-if="activeTab === 'selling'">
        <EmptyState
          v-if="!serviceStore.sellingOrders.length"
          icon="fa-solid fa-tag"
          title="No selling orders"
          description="Orders from your services will appear here."
        />
        <div v-else class="space-y-3">
          <ServiceOrderCard
            v-for="order in serviceStore.sellingOrders"
            :key="order._id"
            :order="order"
            role="seller"
            :action-loading="serviceStore.actionLoading"
            @click="openOrderDetail(order._id)"
            @deliver="openDeliverModal(order._id)"
            @dispute="openDisputeModal(order._id)"
          />
        </div>
      </template>

      <!-- Buying Orders Tab -->
      <template v-else-if="activeTab === 'buying'">
        <EmptyState
          v-if="!serviceStore.buyingOrders.length"
          icon="fa-solid fa-bag-shopping"
          title="No buying orders"
          description="Orders you've placed will appear here."
        />
        <div v-else class="space-y-3">
          <ServiceOrderCard
            v-for="order in serviceStore.buyingOrders"
            :key="order._id"
            :order="order"
            role="buyer"
            :action-loading="serviceStore.actionLoading"
            @click="openOrderDetail(order._id)"
            @pay="handlePayOrder(order._id)"
            @confirm="confirmOrderCompletion(order._id)"
            @revision="openRevisionModal(order._id)"
            @dispute="openDisputeModal(order._id)"
            @cancel="confirmCancelOrder(order._id)"
          />
        </div>
      </template>
    </div>



    <!-- Confirm Modal -->
    <Teleport to="body">
      <Transition name="overlay">
        <ConfirmModal
          v-if="confirmModal.open"
          :title="confirmModal.title"
          :message="confirmModal.message"
          :confirm-text="confirmModal.confirmText"
          :variant="confirmModal.variant"
          :loading="serviceStore.actionLoading"
          @confirm="confirmModal.onConfirm"
          @cancel="confirmModal.open = false"
        />
      </Transition>
    </Teleport>

    <!-- Deliver Modal -->
    <Teleport to="body">
      <Transition name="overlay">
        <div
          v-if="deliverModal.open"
          class="fixed inset-0 z-[300] flex items-end justify-center bg-cb-overlay backdrop-blur-sm sm:items-center sm:p-4"
          @click.self="deliverModal.open = false"
        >
          <div class="w-full overflow-hidden rounded-t-3xl bg-cb-base  sm:max-w-md sm:rounded-2xl">
            <div class="flex justify-center pb-1 pt-3 sm:hidden"><div class="h-1 w-10 rounded-full bg-cb-divider"></div></div>
            <div class="p-6">
              <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cb-accent-subtle">
                <i class="fa-solid fa-truck-fast text-xl text-cb-accent"></i>
              </div>
              <h3 class="mb-1 text-lg font-bold text-cb-text">Deliver Order</h3>
              <p class="mb-5 text-sm text-cb-muted">Add a delivery note (optional).</p>
              <textarea v-model="deliverModal.note" rows="3" class="w-full rounded-xl border border-cb-divider bg-cb-field p-3 text-sm text-cb-text placeholder:text-cb-muted-40 focus:border-cb-accent focus:outline-none" placeholder="e.g., Files attached, work completed..."></textarea>
              <div class="mt-4 flex gap-3">
                <button type="button" class="flex-1 rounded-xl border border-cb-divider bg-cb-card py-3 text-sm font-semibold text-cb-text transition-colors hover:bg-cb-field" @click="deliverModal.open = false">Cancel</button>
                <button type="button" :disabled="serviceStore.actionLoading" class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark disabled:opacity-60" @click="handleDeliver">
                  <i v-if="serviceStore.actionLoading" class="fa-solid fa-spinner fa-spin text-xs"></i>
                  <i v-else class="fa-solid fa-check text-xs"></i>
                  Deliver
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Revision Modal -->
    <Teleport to="body">
      <Transition name="overlay">
        <div
          v-if="revisionModal.open"
          class="fixed inset-0 z-[300] flex items-end justify-center bg-cb-overlay backdrop-blur-sm sm:items-center sm:p-4"
          @click.self="revisionModal.open = false"
        >
          <div class="w-full overflow-hidden rounded-t-3xl bg-cb-base  sm:max-w-md sm:rounded-2xl">
            <div class="flex justify-center pb-1 pt-3 sm:hidden"><div class="h-1 w-10 rounded-full bg-cb-divider"></div></div>
            <div class="p-6">
              <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cb-warning-subtle">
                <i class="fa-solid fa-rotate-left text-xl text-cb-warning"></i>
              </div>
              <h3 class="mb-1 text-lg font-bold text-cb-text">Request Revision</h3>
              <p class="mb-5 text-sm text-cb-muted">Describe what changes you need.</p>
              <textarea v-model="revisionModal.note" rows="3" class="w-full rounded-xl border border-cb-divider bg-cb-field p-3 text-sm text-cb-text placeholder:text-cb-muted-40 focus:border-cb-accent focus:outline-none" placeholder="Revision details..."></textarea>
              <div class="mt-4 flex gap-3">
                <button type="button" class="flex-1 rounded-xl border border-cb-divider bg-cb-card py-3 text-sm font-semibold text-cb-text transition-colors hover:bg-cb-field" @click="revisionModal.open = false">Cancel</button>
                <button type="button" :disabled="serviceStore.actionLoading" class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-warning py-3 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-warning/80 disabled:opacity-60" @click="handleRevision">
                  <i v-if="serviceStore.actionLoading" class="fa-solid fa-spinner fa-spin text-xs"></i>
                  <i v-else class="fa-solid fa-pen text-xs"></i>
                  Request Revision
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Dispute Modal -->
    <Teleport to="body">
      <Transition name="overlay">
        <div
          v-if="disputeModal.open"
          class="fixed inset-0 z-[300] flex items-end justify-center bg-cb-overlay backdrop-blur-sm sm:items-center sm:p-4"
          @click.self="disputeModal.open = false"
        >
          <div class="w-full overflow-hidden rounded-t-3xl bg-cb-base  sm:max-w-md sm:rounded-2xl">
            <div class="flex justify-center pb-1 pt-3 sm:hidden"><div class="h-1 w-10 rounded-full bg-cb-divider"></div></div>
            <div class="p-6">
              <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cb-warning-subtle">
                <i class="fa-solid fa-scale-balanced text-xl text-cb-warning"></i>
              </div>
              <h3 class="mb-1 text-lg font-bold text-cb-text">Open Dispute</h3>
              <p class="mb-5 text-sm text-cb-muted">Describe the issue. Our team will review and contact both parties.</p>
              <textarea v-model="disputeModal.reason" rows="3" class="w-full rounded-xl border border-cb-divider bg-cb-field p-3 text-sm text-cb-text placeholder:text-cb-muted-40 focus:border-cb-accent focus:outline-none" placeholder="Describe the issue with this order..."></textarea>
              <div class="mt-4 flex gap-3">
                <button type="button" class="flex-1 rounded-xl border border-cb-divider bg-cb-card py-3 text-sm font-semibold text-cb-text transition-colors hover:bg-cb-field" @click="disputeModal.open = false">Cancel</button>
                <button type="button" :disabled="!disputeModal.reason.trim() || serviceStore.actionLoading" class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-warning py-3 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-warning/80 disabled:opacity-60" @click="handleDispute">
                  <i v-if="serviceStore.actionLoading" class="fa-solid fa-spinner fa-spin text-xs"></i>
                  <i v-else class="fa-solid fa-scale-balanced text-xs"></i>
                  Open Dispute
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useServiceStore } from "@/stores/serviceStore";
import { useUserStore } from "@/stores/userStore";
import { useToast } from "@/composables/useToast";

import ServiceListingCard from "@/components/services/ServiceListingCard.vue";
import ServiceOrderCard from "@/components/services/ServiceOrderCard.vue";
import ConfirmModal from "@/components/reusables/ConfirmModal.vue";
import ToastContainer from "@/components/reusables/ToastContainer.vue";
import EmptyState from "@/components/reusables/EmptyState.vue";

const router = useRouter();
const serviceStore = useServiceStore();
const userStore = useUserStore();
const toast = useToast();

// ─── State ────────────────────────────────────────────────────
const activeTab = ref("listings");

const confirmModal = ref({ open: false, title: "", message: "", confirmText: "", variant: "danger", onConfirm: null });
const deliverModal = ref({ open: false, orderId: null, note: "" });
const revisionModal = ref({ open: false, orderId: null, note: "" });
const disputeModal = ref({ open: false, orderId: null, reason: "" });

// ─── Polling ──────────────────────────────────────────────────
let pollInterval = null;

function startPolling() {
  if (pollInterval) return;
  pollInterval = setInterval(async () => {
    const hasPending = serviceStore.buyingOrders.some((o) => o.status === "pending_payment");
    if (!hasPending) { stopPolling(); return; }
    await serviceStore.silentRefreshOrders({ buying: true });
  }, 10000);
}

function stopPolling() {
  if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
}

watch(
  () => serviceStore.buyingOrders.some((o) => o.status === "pending_payment"),
  (hasPending) => { if (hasPending) startPolling(); else stopPolling(); },
);

onUnmounted(stopPolling);

// ─── Computed ─────────────────────────────────────────────────
const loading = computed(() => serviceStore.loading);

const hasPendingPaymentOrders = computed(() =>
  serviceStore.buyingOrders.some((o) => o.status === "pending_payment"),
);
const pendingPaymentCount = computed(() =>
  serviceStore.buyingOrders.filter((o) => o.status === "pending_payment").length,
);

const tabs = computed(() => [
  { key: "listings", label: "My Listings", icon: "fa-solid fa-list", count: serviceStore.myListings.length },
  { key: "selling", label: "Selling", icon: "fa-solid fa-arrow-up", count: serviceStore.sellingOrders.length },
  { key: "buying", label: "Buying", icon: "fa-solid fa-arrow-down", count: serviceStore.buyingOrders.length },
]);

const stats = computed(() => [
  { label: "Total Listings", value: serviceStore.myListings.length, icon: "fa-solid fa-shop" },
  { label: "Active", value: serviceStore.myListings.filter((l) => l.status === "active").length, icon: "fa-solid fa-circle-check" },
  {
    label: "Pending Orders",
    value: [...serviceStore.sellingOrders, ...serviceStore.buyingOrders].filter((o) =>
      ["pending_payment", "in_progress", "delivered", "revision"].includes(o.status),
    ).length,
    icon: "fa-solid fa-clock",
  },
  {
    label: "Completed",
    value: [...serviceStore.sellingOrders, ...serviceStore.buyingOrders].filter((o) => o.status === "completed").length,
    icon: "fa-solid fa-circle-check",
  },
]);

// ─── Data Loading ─────────────────────────────────────────────
async function loadAllData() {
  try {
    await Promise.all([
      serviceStore.fetchMyListings(),
      serviceStore.fetchSellingOrders(),
      serviceStore.fetchBuyingOrders(),
    ]);
  } catch {
    toast.error("Failed to load data");
  }
}

watch(activeTab, (newTab) => {
  if (newTab === "listings" && !serviceStore.myListings.length) serviceStore.fetchMyListings();
  else if (newTab === "selling" && !serviceStore.sellingOrders.length) serviceStore.fetchSellingOrders();
  else if (newTab === "buying" && !serviceStore.buyingOrders.length) serviceStore.fetchBuyingOrders();
});

// ─── Navigation ───────────────────────────────────────────────
// Listing click → navigate to ServiceDetailPage (full page)
function openListingDetail(listingId) {
  router.push({ name: "ServiceDetail", params: { id: listingId } });
}

function goToEdit(listingId) {
  router.push({ name: "EditService", params: { id: listingId } });
}

// ─── Order detail → navigate to page ─────────────────────────
function openOrderDetail(orderId) {
  router.push({ name: "OrderDetail", params: { id: orderId } });
}

// ─── Listing Actions ──────────────────────────────────────────
function confirmDeleteListing(listingId) {
  const listing = serviceStore.myListings.find((l) => l._id === listingId);
  if ((listing?.totalOrders || 0) > 0) {
    toast.error("Cannot delete a listing with active orders. Complete or cancel all orders first.");
    return;
  }
  confirmModal.value = {
    open: true,
    title: "Deactivate Service?",
    message: "This will deactivate your service. It will no longer appear in the marketplace, but existing orders will still be processed.",
    confirmText: "Deactivate",
    variant: "warning",
    onConfirm: async () => {
      try {
        await serviceStore.deleteService(listingId);
        toast.success("Service deactivated");
        await serviceStore.fetchMyListings();
      } catch {
        toast.error(serviceStore.error || "Failed to deactivate");
      } finally {
        confirmModal.value.open = false;
      }
    },
  };
}

function confirmStatusChange(listingId, newStatus) {
  const statusLabels = { active: "Activate", paused: "Pause", draft: "Save as Draft" };
  confirmModal.value = {
    open: true,
    title: `${statusLabels[newStatus]} Service?`,
    message: `Are you sure you want to change the status to "${newStatus}"?`,
    confirmText: statusLabels[newStatus],
    variant: newStatus === "active" ? "success" : "warning",
    onConfirm: async () => {
      try {
        await serviceStore.updateService(listingId, { status: newStatus });
        toast.success(`Service ${newStatus === "active" ? "activated" : "updated"}`);
        await serviceStore.fetchMyListings();
      } catch {
        toast.error(serviceStore.error || "Failed to update status");
      } finally {
        confirmModal.value.open = false;
      }
    },
  };
}

// ─── Order Actions ────────────────────────────────────────────
function openDeliverModal(orderId) { deliverModal.value = { open: true, orderId, note: "" }; }

async function handleDeliver() {
  const orderId = deliverModal.value.orderId;
  try {
    await serviceStore.deliverOrder(orderId, deliverModal.value.note);
    deliverModal.value.open = false;
    toast.success("Order marked as delivered");
    await Promise.all([serviceStore.fetchSellingOrders(), serviceStore.fetchBuyingOrders()]);
  } catch {
    toast.error(serviceStore.error || "Failed to deliver");
  }
}

function confirmOrderCompletion(orderId) {
  confirmModal.value = {
    open: true,
    title: "Confirm Completion?",
    message: "Confirming releases payment to the seller. Earnings are held in escrow until admin clears them for withdrawal.",
    confirmText: "Confirm & Release",
    variant: "success",
    onConfirm: async () => {
      try {
        await serviceStore.confirmOrder(orderId);
        toast.success("Order completed — seller earnings pending admin clearance");
        await loadAllData();
      } catch {
        toast.error(serviceStore.error || "Failed to confirm");
      } finally {
        confirmModal.value.open = false;
      }
    },
  };
}

function openRevisionModal(orderId) { revisionModal.value = { open: true, orderId, note: "" }; }

async function handleRevision() {
  const orderId = revisionModal.value.orderId;
  try {
    await serviceStore.requestRevision(orderId, revisionModal.value.note);
    revisionModal.value.open = false;
    toast.success("Revision requested");
    await loadAllData();
  } catch {
    toast.error(serviceStore.error || "Failed to request revision");
  }
}

function openDisputeModal(orderId) { disputeModal.value = { open: true, orderId, reason: "" }; }

async function handleDispute() {
  const orderId = disputeModal.value.orderId;
  const reason = disputeModal.value.reason.trim();
  if (!reason) return;
  try {
    await serviceStore.disputeOrder(orderId, reason);
    disputeModal.value.open = false;
    toast.success("Dispute opened — our team will review shortly");
    await loadAllData();
  } catch {
    toast.error(serviceStore.error || "Failed to open dispute");
  }
}

async function handlePayOrder(orderId) {
  try {
    const res = await serviceStore.payOrder(orderId);
    const paymentUrl =
      res?.data?.payment?.authorizationUrl ??
      res?.data?.authorizationUrl ??
      res?.data?.authorization_url ??
      res?.data?.paymentUrl ??
      res?.data?.url;
    if (paymentUrl) {
      window.location.href = paymentUrl;
    } else {
      toast.success("Payment initiated. Check your email or retry from the orders list.");
      await loadAllData();
    }
  } catch {
    toast.error(serviceStore.error || "Failed to initiate payment");
  }
}

function confirmCancelOrder(orderId) {
  confirmModal.value = {
    open: true,
    title: "Cancel Order?",
    message: "This will cancel the order. You can only cancel before payment is confirmed.",
    confirmText: "Cancel Order",
    variant: "danger",
    onConfirm: async () => {
      try {
        await serviceStore.cancelOrder(orderId);
        toast.success("Order cancelled");
        await loadAllData();
      } catch {
        toast.error(serviceStore.error || "Failed to cancel");
      } finally {
        confirmModal.value.open = false;
      }
    },
  };
}

// ─── Lifecycle ────────────────────────────────────────────────
onMounted(() => { loadAllData(); });
</script>

<style scoped>
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.25s ease; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }
.drawer-enter-active, .drawer-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>