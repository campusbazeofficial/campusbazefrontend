<template>
  <div class="min-h-screen bg-cb-base">

    <!-- Header -->
    <div class="border-b border-cb-divider bg-cb-base  py-5 ">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-cb-text">Withdrawals</h1>
          <p class="text-sm text-cb-muted">{{ adminStore.withdrawalsMeta.total || adminStore.withdrawals.length }} total requests</p>
        </div>
      </div>

      <!-- Summary chips -->
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <div class="flex items-center gap-2 rounded-xl border border-cb-warning/25 bg-cb-warning-subtle px-3 py-2">
          <i class="fa-solid fa-hourglass-half text-xs text-cb-warning" />
          <span class="text-xs font-semibold text-cb-warning">{{ adminStore.pendingWithdrawals.length }} pending</span>
          <span class="text-xs text-cb-muted">· ₦{{ adminStore.totalPendingWithdrawalAmount.toLocaleString() }}</span>
        </div>
        <div class="flex items-center gap-2 rounded-xl border border-cb-divider bg-cb-card px-3 py-2">
          <i class="fa-solid fa-rotate text-xs text-cb-muted" />
          <span class="text-xs font-semibold text-cb-text">{{ adminStore.processingWithdrawals.length }} processing</span>
        </div>
        <div class="flex items-center gap-2 rounded-xl border border-cb-divider bg-cb-card px-3 py-2">
          <i class="fa-solid fa-circle-check text-xs text-cb-positive" />
          <span class="text-xs font-semibold text-cb-text">{{ adminStore.paidWithdrawals.length }} paid</span>
        </div>
        <div class="flex items-center gap-2 rounded-xl border border-cb-divider bg-cb-card px-3 py-2">
          <i class="fa-solid fa-circle-exclamation text-xs text-cb-negative" />
          <span class="text-xs font-semibold text-cb-text">{{ adminStore.failedWithdrawals.length }} failed</span>
        </div>
      </div>

      <!-- Search + Filters -->
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <div class="relative min-w-0 flex-1">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-cb-muted" />
          <input
            v-model="search"
            type="text"
            placeholder="Search name, email, account number, or reference…"
            class="h-10 w-full rounded-xl border border-cb-divider bg-cb-card pl-9 pr-4 text-sm text-cb-text placeholder:text-cb-muted/60 focus:border-cb-accent/50 focus:outline-none focus:ring-2 focus:ring-cb-accent/20"
          />
        </div>

        <DropDownComponent label="Status" :min-width="160">
          <div class="p-1.5">
            <button v-for="s in statuses" :key="s.value"
              class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-cb-field"
              :class="filterStatus === s.value ? 'text-cb-accent font-semibold' : 'text-cb-text'"
              @click="filterStatus = s.value">
              {{ s.label }}
              <i v-if="filterStatus === s.value" class="fa-solid fa-check ml-auto text-xs text-cb-accent" />
            </button>
          </div>
        </DropDownComponent>

        <button v-if="hasFilters"
          class="flex items-center gap-1.5 rounded-xl border border-cb-divider px-3 py-2 text-xs font-semibold text-cb-muted transition-all hover:text-cb-negative"
          @click="clearFilters">
          <i class="fa-solid fa-xmark" />Clear
        </button>

        <button
          class="flex items-center gap-1.5 rounded-xl border border-cb-divider px-3 py-2 text-xs font-semibold text-cb-muted transition-all hover:border-cb-accent/30 hover:text-cb-text disabled:opacity-50"
          :disabled="adminStore.withdrawalsLoading"
          @click="load">
          <i class="fa-solid fa-arrows-rotate text-xs" :class="adminStore.withdrawalsLoading ? 'animate-spin' : ''" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Body -->
    <div class="mx-auto max-w-7xl  py-6 ">

      <!-- Loading skeleton -->
      <div v-if="adminStore.withdrawalsLoading && !adminStore.withdrawals.length" class="space-y-3">
        <div v-for="i in 6" :key="i" class="h-16 animate-pulse rounded-2xl bg-cb-card"
          :style="`animation-delay:${i*50}ms`" />
      </div>

      <!-- Error -->
      <div v-else-if="adminStore.error && !adminStore.withdrawals.length"
        class="flex flex-col items-center gap-3 rounded-2xl border border-cb-negative/20 bg-cb-negative/5 py-14 text-center">
        <i class="fa-solid fa-circle-exclamation text-3xl text-cb-negative" />
        <p class="font-semibold text-cb-text">Failed to load withdrawals</p>
        <button class="rounded-xl bg-cb-accent px-4 py-2 text-sm font-bold text-white hover:brightness-110"
          @click="load">Retry</button>
      </div>

      <!-- Empty -->
      <div v-else-if="!filteredWithdrawals.length"
        class="flex flex-col items-center gap-3 py-20 text-center">
        <i class="fa-solid fa-building-columns text-4xl text-cb-muted/30" />
        <p class="font-semibold text-cb-text">No withdrawals found</p>
        <p class="text-sm text-cb-muted">Try adjusting your search or filters</p>
      </div>

      <!-- Mobile cards -->
      <div class="space-y-3 lg:hidden">
        <div
          v-for="w in filteredWithdrawals" :key="w._id"
          class="rounded-2xl border border-cb-divider bg-cb-card p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cb-field text-xs font-bold text-cb-muted">
                {{ initials(w.userId) }}
              </div>
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-cb-text">{{ fullName(w.userId) }}</p>
                <p class="truncate text-xs text-cb-muted">{{ w.userId?.email }}</p>
              </div>
            </div>
            <span class="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold" :class="statusClass(w.status)">
              {{ statusLabel(w.status) }}
            </span>
          </div>

          <div class="mt-3 flex items-center justify-between">
            <span class="text-lg font-black text-cb-text tabular-nums">₦{{ w.amountNGN.toLocaleString() }}</span>
            <span class="text-xs text-cb-muted">{{ fmtDate(w.requestedAt) }}</span>
          </div>

          <p class="mt-1 text-xs text-cb-muted font-mono">
            {{ w.bankName }} · ••••{{ w.accountNumber?.slice(-4) }}
          </p>

          <p v-if="w.status === 'pending'" class="mt-1 text-xs text-cb-warning flex items-center gap-1.5">
            <i class="fa-solid fa-hourglass-half text-[10px]" />
            {{ holdRemaining(w.releaseAt) }}
          </p>
          <p v-if="w.failureReason" class="mt-1 text-xs text-cb-negative">{{ w.failureReason }}</p>

          <button
            v-if="w.status === 'pending'"
            class="mt-3 w-full rounded-xl bg-cb-accent/10 py-2 text-xs font-bold text-cb-accent hover:bg-cb-accent/20 disabled:opacity-50"
            :disabled="adminStore.isProcessingWithdrawal(w._id)"
            @click="openProcessConfirm(w)">
            <i class="fa-solid fa-bolt text-[10px] mr-1.5" />Process now
          </button>
        </div>
      </div>

      <!-- Desktop table -->
      <div class="hidden overflow-hidden rounded-2xl border border-cb-divider bg-cb-card lg:block">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-cb-divider bg-cb-field/50">
              <th class="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-cb-muted">User</th>
              <th class="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-cb-muted">Bank Account</th>
              <th class="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-cb-muted">Amount</th>
              <th class="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-cb-muted">Status</th>
              <th class="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-cb-muted">Requested</th>
              <th class="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-cb-muted">Reference</th>
              <th class="px-4 py-3.5" />
            </tr>
          </thead>
          <tbody class="divide-y divide-cb-divider/60">
            <tr v-for="w in filteredWithdrawals" :key="w._id" class="transition-colors hover:bg-cb-field/40">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-cb-field text-xs font-bold text-cb-muted">
                    {{ initials(w.userId) }}
                  </div>
                  <div class="min-w-0">
                    <p class="truncate font-semibold text-cb-text">{{ fullName(w.userId) }}</p>
                    <p class="truncate text-xs text-cb-muted">{{ w.userId?.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <p class="text-xs font-medium text-cb-text">{{ w.bankName }}</p>
                <p class="text-xs text-cb-muted font-mono">••••{{ w.accountNumber?.slice(-4) }} · {{ w.accountName }}</p>
              </td>
              <td class="px-4 py-3.5 font-bold text-cb-text tabular-nums">₦{{ w.amountNGN.toLocaleString() }}</td>
              <td class="px-4 py-3.5">
                <span class="rounded-full px-2.5 py-0.5 text-[10px] font-bold" :class="statusClass(w.status)">
                  {{ statusLabel(w.status) }}
                </span>
                <p v-if="w.status === 'pending'" class="mt-1 text-[11px] text-cb-warning whitespace-nowrap">
                  {{ holdRemaining(w.releaseAt) }}
                </p>
                <p v-if="w.failureReason" class="mt-1 text-[11px] text-cb-negative max-w-[180px]">{{ w.failureReason }}</p>
              </td>
              <td class="px-4 py-3.5 text-xs text-cb-muted whitespace-nowrap">{{ fmtDate(w.requestedAt) }}</td>
              <td class="px-4 py-3.5 text-xs text-cb-muted font-mono">{{ w.reference }}</td>
              <td class="px-4 py-3.5">
                <button
                  v-if="w.status === 'pending'"
                  class="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-cb-accent/10 px-2.5 py-1.5 text-xs font-bold text-cb-accent transition-colors hover:bg-cb-accent/20 disabled:opacity-50"
                  :disabled="adminStore.isProcessingWithdrawal(w._id)"
                  @click="openProcessConfirm(w)">
                  <i class="fa-solid" :class="adminStore.isProcessingWithdrawal(w._id) ? 'fa-spinner fa-spin' : 'fa-bolt'" />
                  Process now
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="adminStore.withdrawalsMeta.totalPages > 1" class="mt-4 flex items-center justify-center gap-2">
        <button class="rounded-xl border border-cb-divider px-4 py-2 text-sm font-semibold text-cb-muted transition-all hover:border-cb-accent/30 hover:text-cb-text disabled:opacity-40"
          :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
          <i class="fa-solid fa-chevron-left text-xs" />
        </button>
        <span class="text-sm text-cb-muted">{{ currentPage }} / {{ adminStore.withdrawalsMeta.totalPages }}</span>
        <button class="rounded-xl border border-cb-divider px-4 py-2 text-sm font-semibold text-cb-muted transition-all hover:border-cb-accent/30 hover:text-cb-text disabled:opacity-40"
          :disabled="!adminStore.withdrawalsMeta.hasNextPage" @click="changePage(currentPage + 1)">
          <i class="fa-solid fa-chevron-right text-xs" />
        </button>
      </div>
    </div>

    <!-- Process Confirm Modal -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="processTarget"
          class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
          @click.self="closeProcessConfirm">
          <div class="w-full max-w-sm overflow-hidden rounded-t-3xl bg-cb-card sm:rounded-2xl" @click.stop>
            <div class="h-1 bg-cb-accent" />
            <div class="p-6">
              <div class="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cb-accent/10">
                <i class="fa-solid fa-bolt text-cb-accent" />
              </div>
              <h2 class="mb-1 text-lg font-bold text-cb-text">Process Withdrawal?</h2>
              <p class="text-sm text-cb-muted">
                This bypasses the hold period and immediately initiates a real transfer of
                <span class="font-semibold text-cb-text">₦{{ processTarget?.amountNGN.toLocaleString() }}</span>
                to {{ fullName(processTarget?.userId) }}'s {{ processTarget?.bankName }} account. This cannot be undone.
              </p>
              <div class="mt-4 rounded-xl bg-cb-field px-4 py-3 text-xs text-cb-muted font-mono">
                {{ processTarget?.accountName }} · ••••{{ processTarget?.accountNumber?.slice(-4) }}
              </div>
              <div class="mt-5 flex gap-3">
                <button class="flex-1 rounded-xl border border-cb-divider py-3 text-sm font-semibold text-cb-muted hover:text-cb-text"
                  @click="closeProcessConfirm">Cancel</button>
                <button
                  class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-bold text-white disabled:opacity-60"
                  :disabled="adminStore.withdrawalActionLoading"
                  @click="confirmProcess">
                  <svg v-if="adminStore.withdrawalActionLoading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Yes, Process
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
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAdminStore } from "@/stores/adminStore";
import { useToast } from "@/composables/useToast";
import DropDownComponent from "@/components/reusables/DropDownComponent.vue";
import ToastContainer from "@/components/reusables/ToastContainer.vue";

const adminStore = useAdminStore();
const toast      = useToast();

const search       = ref("");
const filterStatus = ref("");
const currentPage  = ref(1);
const processTarget = ref(null);

// Reactive clock so hold countdowns re-render without a manual refresh.
// The countdown text itself is still derived entirely from releaseAt (server data).
const now = ref(Date.now());
let clockInterval = null;

const statuses = [
  { value: "",           label: "All Status" },
  { value: "pending",    label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "paid",       label: "Paid" },
  { value: "failed",     label: "Failed" },
  { value: "cancelled",  label: "Cancelled" },
];

const hasFilters = computed(() => search.value || filterStatus.value);

const filteredWithdrawals = computed(() => {
  let list = adminStore.withdrawals;
  const q = search.value.toLowerCase().trim();
  if (q) {
    list = list.filter((w) =>
      fullName(w.userId).toLowerCase().includes(q) ||
      w.userId?.email?.toLowerCase().includes(q) ||
      w.accountNumber?.includes(q) ||
      w.reference?.toLowerCase().includes(q)
    );
  }
  if (filterStatus.value) list = list.filter((w) => w.status === filterStatus.value);
  return list;
});

function clearFilters() { search.value = ""; filterStatus.value = ""; }

function fullName(user) {
  if (!user) return "Unknown user";
  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Unknown user";
}
function initials(user) {
  return `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "?";
}
function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";
}

function statusLabel(status) {
  return { pending: "Pending", processing: "Processing", paid: "Paid", failed: "Failed", cancelled: "Cancelled" }[status] ?? status;
}
function statusClass(status) {
  return {
    pending:    "bg-cb-warning-subtle text-cb-warning",
    processing: "bg-cb-warning-subtle text-cb-warning",
    paid:       "bg-cb-positive-subtle text-cb-positive",
    failed:     "bg-cb-negative-subtle text-cb-negative",
    cancelled:  "bg-cb-field text-cb-muted",
  }[status] ?? "bg-cb-field text-cb-muted";
}

// Countdown text is derived purely from releaseAt (server data); `now.value`
// is read here only to make this a reactive dependency so it re-renders on tick.
function holdRemaining(releaseAt) {
  if (!releaseAt) return "";
  void now.value;
  const diffMs = new Date(releaseAt).getTime() - Date.now();
  if (diffMs <= 0) return "Releasing now";
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;
}

function openProcessConfirm(withdrawal) {
  processTarget.value = withdrawal;
}
function closeProcessConfirm() {
  processTarget.value = null;
}

async function confirmProcess() {
  if (!processTarget.value) return;
  const id = processTarget.value._id;
  try {
    await adminStore.processWithdrawal(id);
    toast.success("Withdrawal processed — transfer initiated");
    closeProcessConfirm();
  } catch (err) {
    toast.error(err?.response?.data?.message || adminStore.error || "Failed to process withdrawal");
  }
}

async function load(page = 1) {
  currentPage.value = page;
  await adminStore.fetchWithdrawals({ page, limit: 20 }).catch(() => {
    toast.error(adminStore.error || "Failed to load withdrawals");
  });
}

function changePage(p) { load(p); }

onMounted(() => {
  load();
  // Re-pull from the server whenever a pending row's hold should have ended,
  // so status (processing/paid/failed) — not client-side time math — drives
  // when the countdown and "Process now" affordance disappear.
  clockInterval = setInterval(() => {
    now.value = Date.now();
    const holdJustEnded = adminStore.withdrawals.some(
      (w) => w.status === "pending" && new Date(w.releaseAt).getTime() <= now.value,
    );
    if (holdJustEnded) load(currentPage.value);
  }, 30000);
});

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval);
});
</script>

<style scoped>
.overlay-enter-active,.overlay-leave-active{transition:opacity 0.22s ease}
.overlay-enter-from,.overlay-leave-to{opacity:0}
</style>