<template>
  <div class="min-h-screen bg-cb-base">

    <!-- Header -->
    <div class="border-b border-cb-divider bg-cb-base  py-5 ">
      <div class="flex items-center gap-3">
        <button
          class="flex h-9 w-9 items-center justify-center rounded-xl border border-cb-divider bg-cb-card text-cb-muted transition-all hover:border-cb-accent/30 hover:text-cb-text active:scale-95"
          @click="$router.back()"
        >
          <i class="fa-solid fa-arrow-left text-sm" />
        </button>
        <div>
          <h1 class="text-xl font-bold text-cb-text">Clearance Detail</h1>
          <p class="text-sm text-cb-muted">Earnings payout information</p>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl space-y-4  py-6 ">

      <!-- Loading skeleton -->
      <template v-if="loading">
        <div v-for="i in 4" :key="i"
          class="animate-pulse rounded-2xl bg-cb-card"
          :style="`height:${[160, 140, 120, 80][i - 1]}px; animation-delay:${(i - 1) * 60}ms`"
        />
      </template>

      <!-- Not found -->
      <div v-else-if="!clearance" class="flex flex-col items-center gap-3 py-20 text-center">
        <i class="fa-solid fa-circle-exclamation text-3xl text-cb-negative" />
        <p class="font-semibold text-cb-text">Clearance not found</p>
        <button
          class="rounded-xl bg-cb-accent px-4 py-2 text-sm font-bold text-white hover:brightness-110"
          @click="$router.back()"
        >Go Back</button>
      </div>

      <template v-else>

        <!-- Status banner -->
        <div
          class="flex items-center gap-3 rounded-2xl border px-5 py-4"
          :class="bannerClass"
        >
          <i :class="[bannerIcon, 'text-xl shrink-0']" />
          <div>
            <p class="font-bold capitalize">{{ clearance.status }}</p>
            <p class="text-xs opacity-75 capitalize">{{ clearance.sourceType }} clearance</p>
          </div>
          <span class="ml-auto text-2xl font-black">₦{{ clearance.amountNGN?.toLocaleString() }}</span>
        </div>

        <!-- User card -->
        <div class="rounded-2xl border border-cb-divider bg-cb-card p-5">
          <h3 class="mb-3 text-xs font-bold uppercase tracking-widest text-cb-muted">Payee</h3>
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cb-field text-sm font-bold text-cb-muted">
              {{ initials }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-cb-text">
                {{ clearance.userId?.firstName }} {{ clearance.userId?.lastName }}
              </p>
              <p class="text-xs text-cb-muted">{{ clearance.userId?.email }}</p>
            </div>
            <span
              class="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize"
              :class="roleClass"
            >{{ clearance.userId?.role }}</span>
          </div>
          <router-link
            v-if="clearance.userId?._id"
            :to="`/admin/users/${clearance.userId._id}`"
            class="mt-3 flex items-center gap-2 rounded-xl border border-cb-divider bg-cb-field px-4 py-2.5 text-xs font-semibold text-cb-muted transition-all hover:border-cb-accent/40 hover:text-cb-accent"
          >
            <i class="fa-solid fa-arrow-up-right-from-square text-[10px]" />
            View full user profile
          </router-link>
        </div>

        <!-- Clearance details -->
        <div class="rounded-2xl border border-cb-divider bg-cb-card">
          <div class="border-b border-cb-divider px-5 py-4">
            <h3 class="text-xs font-bold uppercase tracking-widest text-cb-muted">Details</h3>
          </div>
          <div class="divide-y divide-cb-divider/60">
            <div
              v-for="row in detailRows"
              :key="row.label"
              class="flex items-center justify-between px-5 py-3.5"
            >
              <span class="text-sm text-cb-muted">{{ row.label }}</span>
              <span class="text-right text-sm font-semibold" :class="row.class ?? 'text-cb-text'">
                {{ row.value }}
              </span>
            </div>
          </div>
        </div>

        <!-- Source link -->
        <div class="rounded-2xl border border-cb-divider bg-cb-card p-5">
          <h3 class="mb-3 text-xs font-bold uppercase tracking-widest text-cb-muted">Source</h3>
          <router-link
            :to="sourceLink"
            class="flex items-center gap-3 rounded-xl border border-cb-divider bg-cb-field px-4 py-3 transition-all hover:border-cb-accent/40"
          >
            <div class="flex h-9 w-9 items-center justify-center rounded-lg text-sm"
              :class="clearance.sourceType === 'errand' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'">
              <i :class="clearance.sourceType === 'errand' ? 'fa-solid fa-list-check' : 'fa-solid fa-briefcase'" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold capitalize text-cb-text">View {{ clearance.sourceType }}</p>
              <p class="truncate font-mono text-[10px] text-cb-muted">{{ clearance.sourceId }}</p>
            </div>
            <i class="fa-solid fa-chevron-right shrink-0 text-xs text-cb-muted/40" />
          </router-link>
        </div>

        <!-- Actions -->
        <div v-if="clearance.status === 'pending'" class="flex gap-3">
          <button
            class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-cb-negative/30 bg-cb-negative/8 py-3.5 text-sm font-bold text-cb-negative transition-all hover:bg-cb-negative/15 active:scale-[0.98] disabled:opacity-50"
            :disabled="actionLoading"
            @click="showRejectModal = true"
          >
            <i class="fa-solid fa-xmark" />Reject
          </button>
          <button
            class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-positive py-3.5 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            :disabled="actionLoading"
            @click="handleApprove"
          >
            <svg v-if="actionLoading && pendingAction === 'approve'" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <i v-else class="fa-solid fa-check" />
            Approve
          </button>
        </div>

        <div v-else-if="clearance.status === 'rejected'" class="flex gap-3">
          <div class="flex flex-1 items-center gap-2 rounded-xl bg-cb-negative/8 px-4 py-3 text-sm text-cb-negative">
            <i class="fa-solid fa-circle-xmark shrink-0" />
            <span>This clearance was rejected.</span>
          </div>
          <button
            class="flex shrink-0 items-center gap-2 rounded-xl bg-cb-accent px-5 py-3 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            :disabled="actionLoading"
            @click="handleReapprove"
          >
            <svg v-if="actionLoading && pendingAction === 'reapprove'" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <i v-else class="fa-solid fa-rotate-right text-xs" />
            Reapprove
          </button>
        </div>

        <div v-else-if="clearance.status === 'approved'"
          class="flex items-center gap-2 rounded-xl bg-cb-positive/8 px-4 py-3 text-sm text-cb-positive">
          <i class="fa-solid fa-circle-check" />
          This clearance has been approved and paid out.
        </div>

      </template>
    </div>

    <!-- Reject Modal -->
    <Teleport to="body">
      <Transition name="overlay">
        <div
          v-if="showRejectModal"
          class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
          @click.self="showRejectModal = false"
        >
          <div class="w-full max-w-sm overflow-hidden rounded-t-3xl bg-cb-card sm:rounded-2xl" @click.stop>
            <div class="h-1 bg-cb-negative" />
            <div class="p-6">
              <div class="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cb-negative/10">
                <i class="fa-solid fa-circle-xmark text-xl text-cb-negative" />
              </div>
              <h2 class="mb-1 text-lg font-bold text-cb-text">Reject Clearance?</h2>
              <p class="text-sm text-cb-muted">
                ₦{{ clearance?.amountNGN?.toLocaleString() }} for
                <span class="font-semibold text-cb-text">
                  {{ clearance?.userId?.firstName }} {{ clearance?.userId?.lastName }}
                </span>
                will not be paid out.
              </p>
              <div class="mt-4">
                <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cb-muted">
                  Admin Note
                </label>
                <textarea
                  v-model="rejectNote"
                  placeholder="Reason for rejection…"
                  class="w-full resize-none rounded-xl border border-cb-divider bg-cb-field px-4 py-3 text-sm text-cb-text placeholder:text-cb-muted/50 focus:border-cb-accent/50 focus:outline-none focus:ring-2 focus:ring-cb-accent/20 transition-all"
                  rows="3"
                />
              </div>
              <div class="mt-5 flex gap-3">
                <button
                  class="flex-1 rounded-xl border border-cb-divider py-3 text-sm font-semibold text-cb-muted transition-all hover:text-cb-text"
                  @click="showRejectModal = false"
                >Cancel</button>
                <button
                  class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-negative py-3 text-sm font-bold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="actionLoading"
                  @click="handleReject"
                >
                  <svg v-if="actionLoading && pendingAction === 'reject'" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Reject
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

// ── Local state
const loading        = ref(false);
const actionLoading  = ref(false);
const pendingAction  = ref("");       // "approve" | "reject" | "reapprove"
const showRejectModal = ref(false);
const rejectNote     = ref("");

// ── Derive clearance from the list (already fetched by Clearances.vue in most flows)
// Fall back to fetching directly if the list is empty (e.g. direct URL navigation).
const clearance = computed(() =>
  adminStore.clearances.find((c) => c._id === route.params.id) ?? null
);

// ── Computed display values
const initials = computed(() => {
  const u = clearance.value?.userId;
  return `${u?.firstName?.[0] ?? ""}${u?.lastName?.[0] ?? ""}`.toUpperCase();
});

const roleClass = computed(() => ({
  student:      "bg-blue-500/10 text-blue-500",
  professional: "bg-purple-500/10 text-purple-500",
  corporate:    "bg-amber-500/10 text-amber-600",
  admin:        "bg-cb-negative/10 text-cb-negative",
}[clearance.value?.userId?.role] ?? "bg-cb-field text-cb-muted"));

const bannerClass = computed(() => ({
  pending:  "border-amber-500/30 bg-amber-500/8 text-amber-700",
  approved: "border-cb-positive/30 bg-cb-positive/8 text-cb-positive",
  rejected: "border-cb-negative/30 bg-cb-negative/8 text-cb-negative",
}[clearance.value?.status] ?? "border-cb-divider bg-cb-field text-cb-muted"));

const bannerIcon = computed(() => ({
  pending:  "fa-solid fa-clock text-amber-500",
  approved: "fa-solid fa-circle-check text-cb-positive",
  rejected: "fa-solid fa-circle-xmark text-cb-negative",
}[clearance.value?.status] ?? "fa-solid fa-money-bill-transfer text-cb-muted"));

const sourceLink = computed(() => {
  const c = clearance.value;
  if (!c) return "/admin";
  return c.sourceType === "errand"
    ? `/admin/errands/${c.sourceId}`
    : `/admin/orders/${c.sourceId}`;
});

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "—";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "—";

const detailRows = computed(() => {
  const c = clearance.value;
  if (!c) return [];
  return [
    { label: "Amount",      value: `₦${c.amountNGN?.toLocaleString()}`,         class: "text-cb-positive font-black text-base" },
    { label: "Source Type", value: c.sourceType ? c.sourceType.charAt(0).toUpperCase() + c.sourceType.slice(1) : "—" },
    { label: "Status",      value: c.status?.charAt(0).toUpperCase() + c.status?.slice(1),
      class: { pending: "text-amber-600", approved: "text-cb-positive", rejected: "text-cb-negative" }[c.status] ?? "text-cb-text" },
    { label: "Created",     value: fmtDateTime(c.createdAt) },
    { label: "Last Updated",value: fmtDateTime(c.updatedAt) },
    { label: "Record ID",   value: c._id, class: "font-mono text-[11px] text-cb-muted" },
  ];
});

// ── Actions
async function handleApprove() {
  actionLoading.value = true;
  pendingAction.value = "approve";
  try {
    await adminStore.approveClearance(clearance.value._id);
    toast.success("Clearance approved — payout will be processed");
  } catch (err) {
    toast.error(err?.response?.data?.message || "Approval failed");
  } finally {
    actionLoading.value = false;
    pendingAction.value = "";
  }
}

async function handleReject() {
  actionLoading.value = true;
  pendingAction.value = "reject";
  try {
    await adminStore.rejectClearance(clearance.value._id, { adminNote: rejectNote.value });
    toast.success("Clearance rejected");
    showRejectModal.value = false;
    rejectNote.value      = "";
  } catch (err) {
    toast.error(err?.response?.data?.message || "Rejection failed");
  } finally {
    actionLoading.value = false;
    pendingAction.value = "";
  }
}

async function handleReapprove() {
  actionLoading.value = true;
  pendingAction.value = "reapprove";
  try {
    await adminStore.reapproveClearance(clearance.value._id);
    toast.success("Clearance reapproved — payout will be processed");
  } catch (err) {
    toast.error(err?.response?.data?.message || "Reapproval failed");
  } finally {
    actionLoading.value = false;
    pendingAction.value = "";
  }
}

// ── Data loading
// If the clearances list hasn't been fetched yet (direct URL navigation),
// fetch the full list so the clearance can be found by ID.
onMounted(async () => {
  if (!adminStore.clearances.length) {
    loading.value = true;
    try {
      await adminStore.fetchClearances();
    } finally {
      loading.value = false;
    }
  }
});
</script>

<style scoped>
.overlay-enter-active,
.overlay-leave-active { transition: opacity 0.22s ease; }
.overlay-enter-from,
.overlay-leave-to     { opacity: 0; }
</style>