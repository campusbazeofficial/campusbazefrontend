<template>
  <div class="min-h-screen bg-cb-base">
    <!-- Header -->
    <header
      class="sticky z-20 border-b border-cb-divider bg-cb-base/95 backdrop-blur-sm"
    >
      <div class="mx-auto max-w-7xl">
        <div
          class="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <h1 class="text-2xl font-bold text-cb-text">My Errands</h1>
            <p class="mt-0.5 text-sm text-cb-muted">
              Manage your posted errands and bids
            </p>
          </div>
          <router-link
            :to="{ name: 'PostErrand' }"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-cb-accent px-4 py-2.5 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark"
          >
            <i class="fa-solid fa-plus text-xs"></i>
            Post errand
          </router-link>
        </div>

        <!-- Tabs -->
        <div
          class="mt-4 border-b border-cb-divider overflow-x-auto no-scrollbar"
        >
          <div class="flex min-w-max gap-1">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'relative flex-shrink-0 whitespace-nowrap px-3 py-2 text-sm font-semibold transition-colors sm:px-4 sm:py-2.5',
                activeTab === tab.id
                  ? 'text-cb-accent'
                  : 'text-cb-muted hover:text-cb-text',
              ]"
            >
              {{ tab.label }}

              <span
                v-if="tab.count !== undefined && tab.count > 0"
                class="ml-1.5 rounded-full bg-cb-field px-1.5 py-0.5 text-[10px] font-bold text-cb-muted"
              >
                {{ tab.count }}
              </span>

              <span
                v-if="activeTab === tab.id"
                class="absolute inset-x-0 -bottom-px h-0.5 rounded-t bg-cb-accent"
              ></span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="mx-auto max-w-7xl pt-6 pb-6">
      <!-- Posted Tab -->
      <div v-show="activeTab === 'posted'" class="space-y-4">
        <template v-if="postedLoading && !postedErrands.length">
          <SkeletonCard v-for="i in 3" :key="i" />
        </template>

        <MyErrandEmptyState
          v-else-if="!postedErrands.length"
          icon="fa-solid fa-clipboard-list"
          title="No posted errands"
          description="You haven't posted any errands yet. Create your first errand and start receiving bids!"
          :cta="{
            label: 'Post errand',
            to: { name: 'PostErrand' },
            icon: 'fa-solid fa-plus',
          }"
        />

        <template v-else>
          <MyErrandCard
            v-for="errand in postedErrands"
            :key="errand._id"
            :errand="errand"
            role="poster"
            :action-loading="errandStore.actionLoading"
            @click="viewErrand(errand._id)"
            @cancel="lifecycle.triggerCancel(errand)"
            @confirm="lifecycle.triggerConfirm(errand)"
            @dispute="lifecycle.triggerDispute(errand)"
            @pay="(errand) => handlePay(errand._id)"
          />
          <Pagination
            v-if="postedTotalPages > 1"
            :current-page="postedPage"
            :total-pages="postedTotalPages"
            @page="(page) => fetchPosted(page)"
          />
        </template>
      </div>

      <!-- Awaiting Payment Tab -->
      <div v-show="activeTab === 'awaiting_payment'" class="space-y-4">
        <template v-if="errandStore.acceptedLoading && !awaitingPaymentErrands.length">
          <SkeletonCard v-for="i in 3" :key="i" />
        </template>

        <MyErrandEmptyState
          v-else-if="!awaitingPaymentErrands.length"
          icon="fa-solid fa-lock"
          title="No errands awaiting payment"
          description="Errands where you've accepted a bid and need to pay will appear here."
        />

        <template v-else>
          <MyErrandCard
            v-for="errand in awaitingPaymentErrands"
            :key="errand._id"
            :errand="errand"
            role="poster"
            :action-loading="errandStore.actionLoading"
            @click="viewErrand(errand._id)"
            @dispute="lifecycle.triggerDispute(errand)"
            @pay="(errand) => handlePay(errand._id)"
          />
          <Pagination
            v-if="awaitingPaymentTotalPages > 1"
            :current-page="awaitingPaymentPage"
            :total-pages="awaitingPaymentTotalPages"
            @page="(page) => fetchAwaitingPayment(page)"
          />
        </template>
      </div>

      <!-- In Progress Tab -->
      <div v-show="activeTab === 'in_progress'" class="space-y-4">
        <template v-if="errandStore.inProgressLoading && !inProgressErrands.length">
          <SkeletonCard v-for="i in 3" :key="i" />
        </template>

        <MyErrandEmptyState
          v-else-if="!inProgressErrands.length"
          icon="fa-solid fa-person-running"
          title="No errands in progress"
          description="Errands that are actively being worked on will appear here."
        />

        <template v-else>
          <MyErrandCard
            v-for="errand in inProgressErrands"
            :key="errand._id"
            :errand="errand"
            :role="errandStore.isPoster(errand._id) ? 'poster' : 'runner'"
            :action-loading="errandStore.actionLoading"
            @click="viewErrand(errand._id)"
            @confirm="lifecycle.triggerConfirm(errand)"
            @complete="lifecycle.triggerComplete(errand)"
            @dispute="lifecycle.triggerDispute(errand)"
          />
          <Pagination
            v-if="inProgressTotalPages > 1"
            :current-page="inProgressPage"
            :total-pages="inProgressTotalPages"
            @page="(page) => fetchInProgress(page)"
          />
        </template>
      </div>

      <!-- Running Tab -->
      <div v-show="activeTab === 'running'" class="space-y-4">
        <template v-if="runningLoading && !runningErrands.length">
          <SkeletonCard v-for="i in 3" :key="i" />
        </template>

        <MyErrandEmptyState
          v-else-if="!runningErrands.length"
          icon="fa-solid fa-person-running"
          title="No active errands"
          description="When you start working on an accepted errand, it will appear here."
          :cta="{
            label: 'Browse errands',
            to: { name: 'ErrandMarket' },
            icon: 'fa-solid fa-store',
          }"
        />

        <template v-else>
          <MyErrandCard
            v-for="errand in runningErrands"
            :key="errand._id"
            :errand="errand"
            role="runner"
            :action-loading="errandStore.actionLoading"
            @click="viewErrand(errand._id)"
            @complete="lifecycle.triggerComplete(errand)"
            @dispute="lifecycle.triggerDispute(errand)"
          />
          <Pagination
            v-if="runningTotalPages > 1"
            :current-page="runningPage"
            :total-pages="runningTotalPages"
            @page="(page) => fetchRunning(page)"
          />
        </template>
      </div>

      <!-- Bids Tab -->
      <div v-show="activeTab === 'bids'">
        <MyErrandsBidsTab
          :bids="myBidsList"
          :loading="bidsLoading"
          :action-loading="errandStore.actionLoading"
          :current-page="bidsPage"
          :total-pages="bidsTotalPages"
          @view-errand="viewErrand"
          @withdraw="handleWithdrawBid"
          @page-change="(page) => fetchBids(page)"
        />
      </div>

      <!-- Accepted Tab -->
      <div v-show="activeTab === 'accepted'">
        <MyErrandsAcceptedTab
          :errands="acceptedErrands"
          :loading="errandStore.myAcceptedBidsLoading"
          :action-loading="errandStore.actionLoading"
          :current-page="acceptedPage"
          :total-pages="acceptedTotalPages"
          @view-errand="viewErrand"
          @start="lifecycle.triggerStart"
          @complete="lifecycle.triggerComplete"
          @dispute="lifecycle.triggerDispute"
          @page-change="(page) => fetchAccepted(page)"
        />
      </div>
    </div>

    <!-- Start modal -->
    <StartErrandModal
      v-if="lifecycle.showStartModal.value"
      :errand="lifecycle.selectedErrand.value"
      :loading="errandStore.actionLoading"
      @close="lifecycle.closeAllModals"
      @confirm="handleStartConfirm"
    />

    <!-- Complete modal -->
    <CompleteErrandModal
      v-if="lifecycle.showCompleteModal.value"
      :errand="lifecycle.selectedErrand.value"
      :loading="errandStore.actionLoading"
      :store-error="errandStore.error"
      @close="lifecycle.closeAllModals"
      @confirm="handleCompleteConfirm"
    />

    <!-- Confirm completion modal (poster) -->
    <ConfirmModal
      v-if="lifecycle.showConfirmModal.value"
      title="Confirm Completion"
      :message="`Are you sure you want to confirm completion of '${lifecycle.selectedErrand.value?.title}'? This will release payment to the runner.`"
      confirm-text="Confirm & Release Payment"
      variant="success"
      :loading="errandStore.actionLoading"
      @confirm="handleConfirmConfirm"
      @cancel="lifecycle.closeAllModals"
    />

    <!-- Cancel errand modal -->
    <ConfirmModal
      v-if="lifecycle.showCancelModal.value"
      title="Cancel Errand"
      :message="`Are you sure you want to cancel '${lifecycle.selectedErrand.value?.title}'? This action cannot be undone.`"
      confirm-text="Cancel errand"
      variant="danger"
      :loading="errandStore.actionLoading"
      @confirm="handleCancelConfirm"
      @cancel="lifecycle.closeAllModals"
    />

    <!-- Dispute modal -->
    <DisputeModal
      v-if="lifecycle.showDisputeModal.value"
      :errand="lifecycle.selectedErrand.value"
      :loading="errandStore.actionLoading"
      :store-error="errandStore.error"
      @close="lifecycle.closeAllModals"
      @confirm="handleDisputeConfirm"
    />

    <!-- Withdraw bid confirmation modal -->
    <ConfirmModal
      v-if="showWithdrawConfirmModal"
      title="Withdraw your bid?"
      message="Are you sure you want to withdraw your bid? This cannot be undone."
      confirm-text="Withdraw bid"
      variant="danger"
      :loading="errandStore.actionLoading"
      @confirm="confirmWithdrawBid"
      @cancel="
        showWithdrawConfirmModal = false;
        pendingWithdraw = null;
      "
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useErrandStore } from "@/stores/errandStore";
import { useUserStore } from "@/stores/userStore";
import { useErrandLifecycle } from "@/composables/useErrandLifecycle";
import { useToast } from "@/composables/useToast";
import { storeToRefs } from "pinia";

import SkeletonCard from "@/components/errands/SkeletonCard.vue";
import MyErrandEmptyState from "@/components/reusables/EmptyState.vue";
import MyErrandCard from "@/components/errands/MyErrandCard.vue";
import MyErrandsBidsTab from "@/components/errands/MyErrandsBidsTab.vue";
import MyErrandsAcceptedTab from "@/components/errands/MyErrandsAcceptedTab.vue";
import StartErrandModal from "@/components/errands/StartErrandModal.vue";
import CompleteErrandModal from "@/components/errands/CompleteErrandModal.vue";
import DisputeModal from "@/components/errands/DisputeModal.vue";
import ConfirmModal from "@/components/reusables/ConfirmModal.vue";
import Pagination from "@/components/reusables/Pagination.vue";

const router = useRouter();
const errandStore = useErrandStore();
const userStore = useUserStore();
const lifecycle = useErrandLifecycle();
const toast = useToast();

const {
  posted,
  postedMeta,
  postedLoading,
  running,
  runningMeta,
  runningLoading,
  myBids,
  myBidsMeta,
  accepted,
  acceptedMeta,
} = storeToRefs(errandStore);

const { user } = storeToRefs(userStore);

// Local state
const activeTab = ref("posted");

// Computed lists
const postedErrands = computed(() => posted.value);
const postedPage = computed(() => postedMeta.value?.page || 1);
const postedTotalPages = computed(() => postedMeta.value?.totalPages || 0);

const awaitingPaymentErrands = computed(() => errandStore.accepted);
const awaitingPaymentPage = computed(() => errandStore.acceptedMeta?.page || 1);
const awaitingPaymentTotalPages = computed(() => errandStore.acceptedMeta?.totalPages || 0);

const inProgressErrands = computed(() => errandStore.inProgress);
const inProgressPage = computed(() => errandStore.inProgressMeta?.page || 1);
const inProgressTotalPages = computed(() => errandStore.inProgressMeta?.totalPages || 0);

const runningErrands = computed(() => running.value);
const runningPage = computed(() => runningMeta.value?.page || 1);
const runningTotalPages = computed(() => runningMeta.value?.totalPages || 0);

const myBidsList = computed(() => myBids.value);
const bidsPage = computed(() => myBidsMeta.value?.page || 1);
const bidsTotalPages = computed(() => myBidsMeta.value?.totalPages || 0);
const bidsLoading = computed(() => errandStore.myBidsLoading);

const acceptedErrands = computed(() => errandStore.myAcceptedBids);
const acceptedPage = computed(() => errandStore.myAcceptedBidsMeta?.page || 1);
const acceptedTotalPages = computed(() => errandStore.myAcceptedBidsMeta?.totalPages || 0);

const tabs = computed(() => [
  { id: "posted",           label: "Posted",           count: postedMeta.value?.total },
  { id: "awaiting_payment", label: "Awaiting Payment", count: errandStore.acceptedMeta?.total },
  { id: "in_progress",      label: "In Progress",      count: errandStore.inProgressMeta?.total },
  { id: "running",          label: "Running",          count: runningMeta.value?.total },
  { id: "bids",             label: "My Bids",          count: myBidsMeta.value?.total },
  { id: "accepted",         label: "Accepted Bids",    count: errandStore.myAcceptedBidsMeta?.total },
]);

// ── Data fetching ──────────────────────────────────────────────
async function fetchPosted(page = 1) { await errandStore.fetchMyPosted({ page, limit: 10 }); }
async function fetchAwaitingPayment(page = 1) { await errandStore.fetchMyAccepted({ page, limit: 10 }); }
async function fetchInProgress(page = 1) { await errandStore.fetchMyInProgress({ page, limit: 10 }); }
async function fetchRunning(page = 1) { await errandStore.fetchMyRunning({ page, limit: 10 }); }
async function fetchBids(page = 1) { await errandStore.fetchMyBids({ page, limit: 10 }); }
async function fetchAccepted(page = 1) { await errandStore.fetchMyAcceptedBids({ page, limit: 10 }); }

// ── Navigation — click opens detail page ───────────────────────
function viewErrand(errandId) {
  router.push({ name: "ErrandDetail", params: { id: errandId } });
}

// ── Pay ────────────────────────────────────────────────────────
async function handlePay(errandId) {
  const result = await lifecycle.executePay(errandId);
  if (!result || result.success) return;
  if (result.alreadyInitiated) {
    router.push({
      path: "/user/errands/payment/callback",
      query: { errandId: result.errandId || errandId },
    });
    return;
  }
  toast.error(result.error || "Failed to initiate payment");
}

// ── Withdraw bid ───────────────────────────────────────────────
const showWithdrawConfirmModal = ref(false);
const pendingWithdraw = ref(null);

function handleWithdrawBid({ errandId, bidId }) {
  pendingWithdraw.value = { errandId, bidId };
  showWithdrawConfirmModal.value = true;
}

async function confirmWithdrawBid() {
  if (!pendingWithdraw.value) return;
  const { errandId, bidId } = pendingWithdraw.value;
  const result = await lifecycle.executeWithdrawBid(errandId, bidId);
  showWithdrawConfirmModal.value = false;
  pendingWithdraw.value = null;
  if (result.success) {
    toast.success("Bid withdrawn");
    fetchBids();
  } else {
    toast.error(result.error || "Failed to withdraw bid");
  }
}

// ── Lifecycle action handlers ──────────────────────────────────
async function handleStartConfirm() {
  const result = await lifecycle.executeStart();
  if (result.success) {
    toast.success("Errand started!");
    fetchAccepted();
    fetchRunning();
  } else {
    toast.error(result.error || "Failed to start errand");
  }
}

async function handleCompleteConfirm({ file }) {
  const result = await lifecycle.executeComplete(file);
  if (result.success) {
    toast.success("Errand marked as complete. Waiting for poster confirmation.");
    fetchRunning();
    fetchAccepted();
  } else {
    toast.error(result.error || "Failed to complete errand");
  }
}

async function handleConfirmConfirm() {
  const result = await lifecycle.executeConfirm();
  if (result.success) {
    toast.success("Completion confirmed. Payment released.");
    fetchPosted();
  } else {
    toast.error(result.error || "Failed to confirm errand");
  }
}

async function handleCancelConfirm() {
  const result = await lifecycle.executeCancel();
  if (result.success) {
    toast.success("Errand cancelled");
    fetchPosted();
  } else {
    toast.error(result.error || "Failed to cancel errand");
  }
}

async function handleDisputeConfirm(reason) {
  const result = await lifecycle.executeDispute(reason);
  if (result.success) {
    toast.success("Dispute submitted. Our team will review within 24–48 hours.");
    fetchPosted();
    fetchRunning();
    fetchAccepted();
  } else {
    toast.error(result.error || "Failed to submit dispute");
  }
}

// ── Silent polling for escrow confirmation ────────────────────
let pollInterval = null;

function hasUnconfirmedEscrow() {
  return errandStore.posted.some((e) => e.status === "accepted" && !e.escrowConfirmed);
}

async function silentRefreshPosted() {
  try { await errandStore.fetchMyPosted(); } catch { /* silent */ }
}

function startEscrowPolling() {
  if (pollInterval) return;
  pollInterval = setInterval(async () => {
    if (!hasUnconfirmedEscrow()) { stopEscrowPolling(); return; }
    await silentRefreshPosted();
  }, 4000);
}

function stopEscrowPolling() {
  if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
}

watch(
  () => errandStore.posted.some((e) => e.status === "accepted" && !e.escrowConfirmed),
  (needed) => { if (needed) startEscrowPolling(); else stopEscrowPolling(); },
  { immediate: true },
);

onUnmounted(stopEscrowPolling);

// ── Init ───────────────────────────────────────────────────────
onMounted(async () => {
  await fetchPosted();
  fetchAwaitingPayment();
  fetchInProgress();
  fetchRunning();
  fetchBids();
  fetchAccepted();

  const paidErrandId = sessionStorage.getItem("cb_paid_errand");
  if (paidErrandId) {
    sessionStorage.removeItem("cb_paid_errand");
    await errandStore.fetchAndPatchPosted(paidErrandId);
  }
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>