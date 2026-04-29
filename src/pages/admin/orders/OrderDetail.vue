<template>
  <div class="min-h-screen bg-cb-base">
    <div class="border-b border-cb-divider bg-cb-base  py-5 ">
      <div class="flex items-center gap-3">
        <button class="flex h-9 w-9 items-center justify-center rounded-xl border border-cb-divider bg-cb-card text-cb-muted hover:border-cb-accent/30 hover:text-cb-text active:scale-95"
          @click="$router.back()">
          <i class="fa-solid fa-arrow-left text-sm" />
        </button>
        <div><h1 class="text-xl font-bold text-cb-text">Order Detail</h1><p class="text-sm text-cb-muted">Service order breakdown</p></div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl space-y-4  py-6 ">
      <template v-if="adminStore.selectedOrderLoading">
        <div v-for="i in 4" :key="i" class="animate-pulse rounded-2xl bg-cb-card" :style="`height:${[130,160,120,80][i-1]}px`" />
      </template>

      <template v-else-if="order">
        <!-- Order status card -->
        <div class="overflow-hidden rounded-2xl border bg-cb-card" :class="order.status === 'disputed' ? 'border-cb-negative/40' : 'border-cb-divider'">
          <div class="h-[3px]" :class="statusBarClass" />
          <div class="p-5">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-2xl font-black text-cb-text">₦{{ order.amount?.toLocaleString() }}</p>
                <p class="text-sm text-cb-muted capitalize">{{ order.tierName }} tier · Due {{ fmtDate(order.deliveryDue) }}</p>
              </div>
              <span class="rounded-full px-3 py-1 text-xs font-bold uppercase" :class="statusBadge">
                {{ order.status?.replace('_', ' ') }}
              </span>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div class="rounded-xl bg-cb-field px-4 py-3">
                <p class="text-[10px] text-cb-muted uppercase tracking-wide">Commission</p>
                <p class="font-bold text-cb-text">₦{{ order.commissionNGN?.toLocaleString() }} ({{ order.commissionRate }}%)</p>
              </div>
              <div class="rounded-xl bg-cb-field px-4 py-3">
                <p class="text-[10px] text-cb-muted uppercase tracking-wide">Seller Earns</p>
                <p class="font-bold text-cb-positive">₦{{ order.sellerEarningsNGN?.toLocaleString() }}</p>
              </div>
              <div class="rounded-xl bg-cb-field px-4 py-3">
                <p class="text-[10px] text-cb-muted uppercase tracking-wide">CBC Fee</p>
                <p class="font-bold text-cb-text">{{ order.cbcFeeCharged ?? 0 }} CBC</p>
              </div>
              <div class="rounded-xl bg-cb-field px-4 py-3">
                <p class="text-[10px] text-cb-muted uppercase tracking-wide">Revisions</p>
                <p class="font-bold text-cb-text">{{ order.revisionCount ?? 0 }}</p>
              </div>
              <div class="col-span-2 rounded-xl bg-cb-field px-4 py-3">
                <p class="text-[10px] text-cb-muted uppercase tracking-wide">Escrow Ref</p>
                <p class="font-mono text-xs font-semibold text-cb-text break-all">{{ order.escrowReference }}</p>
              </div>
              <div class="col-span-2 rounded-xl bg-cb-field px-4 py-3">
                <p class="text-[10px] text-cb-muted uppercase tracking-wide">Payment Reference</p>
                <p class="font-mono text-xs font-semibold text-cb-text break-all">{{ order.paymentReference ?? '—' }}</p>
              </div>
            </div>
            <!-- Payment & escrow flags -->
            <div class="mt-3 flex flex-wrap gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase"
                :class="order.paymentCaptured ? 'bg-cb-positive/10 text-cb-positive' : 'bg-cb-muted/10 text-cb-muted'">
                <i :class="order.paymentCaptured ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'"></i>
                Payment {{ order.paymentCaptured ? 'Captured' : 'Not Captured' }}
              </span>
              <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase"
                :class="order.escrowConfirmed ? 'bg-cb-positive/10 text-cb-positive' : 'bg-amber-500/10 text-amber-600'">
                <i :class="order.escrowConfirmed ? 'fa-solid fa-lock' : 'fa-solid fa-lock-open'"></i>
                Escrow {{ order.escrowConfirmed ? 'Confirmed' : 'Pending' }}
              </span>
              <span v-if="order.paymentProvider" class="inline-flex items-center gap-1.5 rounded-full bg-cb-field px-2.5 py-1 text-[10px] font-bold uppercase text-cb-muted border border-cb-divider">
                <i class="fa-solid fa-credit-card"></i>
                {{ order.paymentProvider }}
              </span>
              <span v-if="order.cancelledBySeller" class="inline-flex items-center gap-1.5 rounded-full bg-cb-negative/10 px-2.5 py-1 text-[10px] font-bold uppercase text-cb-negative">
                <i class="fa-solid fa-ban"></i>
                Cancelled by Seller
              </span>
              <span v-if="order.earningRejected" class="inline-flex items-center gap-1.5 rounded-full bg-cb-negative/10 px-2.5 py-1 text-[10px] font-bold uppercase text-cb-negative">
                <i class="fa-solid fa-circle-xmark"></i>
                Earning Rejected
              </span>
            </div>
          </div>
        </div>

        <!-- Listing info -->
        <div v-if="order.listingId" class="rounded-2xl border border-cb-divider bg-cb-card p-5">
          <h3 class="mb-3 text-xs font-bold uppercase tracking-widest text-cb-muted">Listing</h3>
          <p class="font-semibold text-cb-text">{{ order.listingId.title }}</p>
          <p class="text-xs text-cb-muted capitalize">{{ order.listingId.category?.replace(/_/g, ' ') }}</p>
          <div v-if="selectedTier" class="mt-3 rounded-xl bg-cb-field px-4 py-3 text-sm">
            <p class="font-semibold text-cb-text capitalize">{{ selectedTier.name }} — ₦{{ selectedTier.price?.toLocaleString() }}</p>
            <p class="text-xs text-cb-muted">{{ selectedTier.deliveryDays }} days · {{ selectedTier.revisions }} revisions</p>
            <p v-if="selectedTier.description" class="mt-1 text-xs text-cb-muted">{{ selectedTier.description }}</p>
          </div>
        </div>

        <!-- Buyer / Seller -->
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-2xl border border-cb-divider bg-cb-card p-4">
            <p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-cb-muted">Buyer</p>
            <p class="font-semibold text-cb-text">{{ order.buyerId?.firstName }} {{ order.buyerId?.lastName }}</p>
            <p class="text-xs text-cb-muted">{{ order.buyerId?.email }}</p>
            <span class="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold capitalize bg-amber-500/10 text-amber-600">{{ order.buyerId?.role }}</span>
          </div>
          <div class="rounded-2xl border border-cb-divider bg-cb-card p-4">
            <p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-cb-muted">Seller</p>
            <p class="font-semibold text-cb-text">{{ order.sellerId?.firstName }} {{ order.sellerId?.lastName }}</p>
            <p class="text-xs text-cb-muted">{{ order.sellerId?.email }}</p>
            <div class="mt-1 flex items-center gap-2">
              <span class="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold capitalize bg-blue-500/10 text-blue-500">{{ order.sellerId?.role }}</span>
              <span class="text-xs text-amber-500">⭐ {{ order.sellerId?.averageRating }}</span>
            </div>
          </div>
        </div>

        <!-- Requirements -->
        <div v-if="order.requirements" class="rounded-2xl border border-cb-divider bg-cb-card p-5">
          <h3 class="mb-2 text-xs font-bold uppercase tracking-widest text-cb-muted">Requirements</h3>
          <p class="text-sm text-cb-text">{{ order.requirements }}</p>
        </div>

        <!-- Dispute details -->
        <div v-if="order.status === 'disputed' && (order.disputeReason || order.disputeOpenedBy)" class="rounded-2xl border border-cb-negative/30 bg-cb-negative/5 p-5">
          <h3 class="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cb-negative">
            <i class="fa-solid fa-triangle-exclamation"></i> Dispute Details
          </h3>
          <div class="grid gap-3 sm:grid-cols-2">
            <div v-if="order.disputeReason" class="rounded-xl bg-cb-card px-4 py-3">
              <p class="text-[10px] text-cb-muted uppercase tracking-wide mb-1">Reason</p>
              <p class="text-sm font-semibold text-cb-text">{{ order.disputeReason }}</p>
            </div>
            <div v-if="order.disputeOpenedBy" class="rounded-xl bg-cb-card px-4 py-3">
              <p class="text-[10px] text-cb-muted uppercase tracking-wide mb-1">Opened By</p>
              <p class="text-sm font-semibold text-cb-text font-mono break-all">
                {{ disputeOpenerName }}
              </p>
            </div>
          </div>
        </div>

        <!-- Dispute resolution -->
        <div v-if="order.status === 'disputed'" class="flex gap-3">
          <button class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/8 py-3.5 text-sm font-bold text-blue-600 hover:bg-blue-500/15 active:scale-[0.98]"
            @click="openResolve('favour_buyer')">
            <i class="fa-solid fa-user" />Favour Buyer
          </button>
          <button class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/8 py-3.5 text-sm font-bold text-purple-600 hover:bg-purple-500/15 active:scale-[0.98]"
            @click="openResolve('favour_seller')">
            <i class="fa-solid fa-store" />Favour Seller
          </button>
        </div>
      </template>
    </div>

    <!-- Resolve Modal -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="showResolveModal"
          class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
          @click.self="showResolveModal = false">
          <div class="w-full max-w-sm overflow-hidden rounded-t-3xl bg-cb-card sm:rounded-2xl" @click.stop>
            <div class="h-1 bg-cb-accent" />
            <div class="p-6">
              <h2 class="mb-1 text-lg font-bold text-cb-text">Resolve Order Dispute</h2>
              <p class="text-sm text-cb-muted">
                Ruling in favour of <span class="font-semibold text-cb-text">{{ resolveOutcome === 'favour_buyer' ? 'Buyer' : 'Seller' }}</span>.
              </p>
              <div class="mt-4">
                <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cb-muted">Admin Note</label>
                <textarea v-model="resolveNote" placeholder="Explain your decision…"
                  class="w-full resize-none rounded-xl border border-cb-divider bg-cb-field px-4 py-3 text-sm text-cb-text focus:border-cb-accent/50 focus:outline-none focus:ring-2 focus:ring-cb-accent/20"
                  rows="3" />
              </div>
              <div class="mt-5 flex gap-3">
                <button class="flex-1 rounded-xl border border-cb-divider py-3 text-sm font-semibold text-cb-muted" @click="showResolveModal = false">Cancel</button>
                <button class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-bold text-white disabled:opacity-60"
                  :disabled="adminStore.orderActionLoading" @click="submitResolve">
                  <svg v-if="adminStore.orderActionLoading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Confirm
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
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAdminStore } from "@/stores/adminStore";
import { useToast } from "@/composables/useToast";
import ToastContainer from "@/components/reusables/ToastContainer.vue";

const route      = useRoute();
const adminStore = useAdminStore();
const toast      = useToast();

const showResolveModal = ref(false);
const resolveOutcome   = ref("favour_buyer");
const resolveNote      = ref("");

const order = computed(() => adminStore.selectedOrder);

const selectedTier = computed(() => {
  const tiers = order.value?.listingId?.tiers ?? [];
  return tiers.find((t) => t.name === order.value?.tierName) ?? tiers[0] ?? null;
});

const STATUS_STYLES = {
  pending:     { bar: "bg-amber-400",   badge: "bg-amber-500/10 text-amber-600"    },
  in_progress: { bar: "bg-blue-400",    badge: "bg-blue-500/10 text-blue-500"      },
  delivered:   { bar: "bg-cb-accent",   badge: "bg-cb-accent/10 text-cb-accent"    },
  completed:   { bar: "bg-cb-positive", badge: "bg-cb-positive/10 text-cb-positive"},
  disputed:    { bar: "bg-cb-negative", badge: "bg-cb-negative/10 text-cb-negative"},
  cancelled:   { bar: "bg-cb-divider",  badge: "bg-cb-muted/10 text-cb-muted"      },
};
const statusBarClass = computed(() => STATUS_STYLES[order.value?.status]?.bar ?? "bg-cb-divider");
const statusBadge    = computed(() => STATUS_STYLES[order.value?.status]?.badge ?? "bg-cb-field text-cb-muted");
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";

// Resolve who opened the dispute — match against buyer/seller IDs
const disputeOpenerName = computed(() => {
  if (!order.value?.disputeOpenedBy) return "—";
  const opener = order.value.disputeOpenedBy;
  if (order.value.buyerId?._id === opener)
    return `${order.value.buyerId.firstName} ${order.value.buyerId.lastName} (Buyer)`;
  if (order.value.sellerId?._id === opener)
    return `${order.value.sellerId.firstName} ${order.value.sellerId.lastName} (Seller)`;
  return opener; // fallback: raw ID
});

function openResolve(o) { resolveOutcome.value = o; resolveNote.value = ""; showResolveModal.value = true; }

async function submitResolve() {
  try {
    await adminStore.resolveOrder(order.value._id, { outcome: resolveOutcome.value, adminNote: resolveNote.value });
    toast.success("Dispute resolved successfully");
    showResolveModal.value = false;
  } catch (err) {
    toast.error(err?.response?.data?.message || "Resolution failed");
  }
}

onMounted(() => adminStore.fetchOrder(route.params.id));
</script>

<style scoped>
.overlay-enter-active,.overlay-leave-active{transition:opacity 0.22s ease}
.overlay-enter-from,.overlay-leave-to{opacity:0}
</style>