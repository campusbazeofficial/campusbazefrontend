<template>
  <div class="min-h-screen bg-cb-base">

    <!-- ── Page Header ─────────────────────────────────────────────── -->
    <div class="border-b border-cb-divider">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 py-5">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-cb-text tracking-tight">Wallet</h1>
            <p class="mt-0.5 text-sm text-cb-muted">Manage your CBC &amp; earnings</p>
          </div>
          <button
            class="flex items-center gap-2 rounded-xl border border-cb-divider bg-cb-card px-4 py-2.5 text-sm font-medium text-cb-muted transition-all hover:border-cb-accent/40 hover:text-cb-text disabled:opacity-50 group"
            :disabled="walletStore.balanceLoading"
            @click="refresh"
          >
            <i
              class="fa-solid fa-rotate text-xs transition-transform duration-500"
              :class="{ 'fa-spin': walletStore.balanceLoading }"
            />
            Refresh
          </button>
        </div>
      </div>
    </div>

    <main class="mx-auto max-w-7xl py-7 space-y-6">

      <!-- ── Balance Cards ───────────────────────────────────────── -->
      <div class="grid gap-4 sm:grid-cols-2">

        <!-- CBC Balance -->
        <div class="relative overflow-hidden rounded-2xl  bg-cb-card p-6 ">
          <div class="pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full bg-cb-accent opacity-8 blur-3xl" />

          <!-- Card header — always visible -->
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-cb-accent/12 text-cb-accent">
                <i class="fa-solid fa-coins text-sm" />
              </div>
              <span class="text-sm font-semibold text-cb-muted">CBC Balance</span>
            </div>
            <button
              class="flex h-7 w-7 items-center justify-center rounded-lg text-cb-muted hover:text-cb-text hover:bg-cb-field transition-colors"
              @click="balanceVisible = !balanceVisible"
            >
              <i :class="balanceVisible ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" class="text-xs" />
            </button>
          </div>

          <!-- Balance value area — skeleton, hidden, or value -->
          <template v-if="walletStore.balanceLoading">
            <div class="h-10 w-40 animate-pulse rounded-lg bg-cb-field mb-2" />
            <div class="h-4 w-28 animate-pulse rounded-lg bg-cb-field" />
          </template>
          <template v-else-if="!balanceVisible">
            <p class="text-2xl font-bold tracking-tight text-cb-text select-none">******</p>
            <p class="mt-2 text-xs text-cb-muted">Tap eye to reveal</p>
          </template>
          <template v-else>
            <p class="text-2xl font-bold tracking-tight text-cb-text tabular-nums">
              {{ walletStore.cbcBalance.toLocaleString() }}
              <span class="text-lg font-semibold text-cb-muted ml-1">CBC</span>
            </p>
            <p class="mt-2 text-xs text-cb-muted flex items-center gap-1.5">
              <i class="fa-solid fa-equals text-[10px]" />
              {{ walletStore.formatCurrency(walletStore.cbcBalance * 10) }} NGN value
            </p>
          </template>
        </div>

        <!-- NGN Earnings -->
        <div class="relative overflow-hidden rounded-2xl  bg-cb-card p-6">
          <div class="pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full bg-cb-positive opacity-8 blur-3xl" />

          <!-- Card header — always visible -->
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-cb-positive/12 text-cb-positive">
                <i class="fa-solid fa-money-bill-wave text-sm" />
              </div>
              <span class="text-sm font-semibold text-cb-muted">NGN Earnings</span>
            </div>
            <button
              class="flex h-7 w-7 items-center justify-center rounded-lg text-cb-muted hover:text-cb-text hover:bg-cb-field transition-colors"
              @click="balanceVisible = !balanceVisible"
            >
              <i :class="balanceVisible ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" class="text-xs" />
            </button>
          </div>

          <!-- Balance value area — skeleton, hidden, or value -->
          <template v-if="walletStore.balanceLoading">
            <div class="h-10 w-40 animate-pulse rounded-lg bg-cb-field mb-2" />
            <div class="h-4 w-28 animate-pulse rounded-lg bg-cb-field" />
          </template>
          <template v-else-if="!balanceVisible">
            <p class="text-2xl font-bold tracking-tight text-cb-text select-none">******</p>
            <p class="mt-2 text-xs text-cb-muted">Tap eye to reveal</p>
          </template>
          <template v-else>
            <p class="text-2xl font-bold tracking-tight text-cb-text tabular-nums">
              ₦{{ walletStore.ngnEarnings.toLocaleString() }}
            </p>
            <p class="mt-2 text-xs text-cb-muted flex items-center gap-1.5">
              <i class="fa-solid fa-circle-check text-cb-positive text-[10px]" />
              Available to withdraw
            </p>
          </template>
        </div>
      </div>

      <!-- ── Quick Actions ───────────────────────────────────────── -->
      <div class="grid grid-cols-3 gap-3">

        <button
          class="group flex flex-col items-center gap-3 rounded-2xl border border-cb-divider bg-cb-card px-3 py-5 text-center transition-all duration-200 hover:border-cb-accent/35 hover:bg-cb-accent/4 hover:-translate-y-0.5 "
          @click="openBuyCbc"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-cb-accent/10 text-cb-accent transition-transform duration-200 group-hover:scale-105">
            <i class="fa-solid fa-cart-plus" />
          </div>
          <div>
            <p class="text-sm font-semibold text-cb-text">Buy CBC</p>
            <p class="text-xs text-cb-muted mt-0.5">₦10 per CBC</p>
          </div>
        </button>

        <button
          class="group flex flex-col items-center gap-3 rounded-2xl border border-cb-divider bg-cb-card px-3 py-5 text-center transition-all duration-200 hover:border-cb-positive/35 hover:bg-cb-positive/4 hover:-translate-y-0.5 "
          @click="openWithdraw"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-cb-positive/10 text-cb-positive transition-transform duration-200 group-hover:scale-105">
            <i class="fa-solid fa-building-columns" />
          </div>
          <div>
            <p class="text-sm font-semibold text-cb-text">Withdraw</p>
            <p class="text-xs text-cb-muted mt-0.5">Min. ₦500</p>
          </div>
        </button>

        <button
          class="group flex flex-col items-center gap-3 rounded-2xl border border-cb-divider bg-cb-card px-3 py-5 text-center transition-all duration-200 hover:border-cb-divider hover:bg-cb-field/60 hover:-translate-y-0.5 "
          @click="goToHistory"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-cb-field text-cb-muted transition-transform duration-200 group-hover:scale-105 group-hover:text-cb-text">
            <i class="fa-solid fa-clock-rotate-left" />
          </div>
          <div>
            <p class="text-sm font-semibold text-cb-text">History</p>
            <p class="text-xs text-cb-muted mt-0.5">All transactions</p>
          </div>
        </button>
      </div>

      <!-- ── Pending Withdrawals Banner ─────────────────────────── -->
      <Transition name="banner">
        <div
          v-if="walletStore.pendingWithdrawals.length"
          class="flex items-start gap-3.5 rounded-2xl border border-cb-warning/25 bg-cb-warning-subtle px-5 py-4"
        >
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cb-warning/15 text-cb-warning mt-0.5">
            <i class="fa-solid fa-hourglass-half text-sm" />
          </div>
          <div>
            <p class="text-sm font-semibold text-cb-warning">
              {{ walletStore.pendingWithdrawals.length }}
              withdrawal{{ walletStore.pendingWithdrawals.length > 1 ? 's' : '' }} in progress
            </p>
            <p class="mt-0.5 text-xs text-cb-muted">
             Withdrawals release automatically after a hold period (up to 2 hours for verified and subscribed members; up to 24 hours for non-verified). You can cancel any pending withdrawal before it releases.
            </p>
          </div>
        </div>
      </Transition>

      <!-- ── Recent Transactions ─────────────────────────────────── -->
      <div class="rounded-2xl border border-cb-divider bg-cb-card overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-cb-divider">
          <div class="flex items-center gap-2.5">
            <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-cb-field text-cb-muted">
              <i class="fa-solid fa-list-ul text-xs" />
            </div>
            <h2 class="font-semibold text-cb-text">Recent Transactions</h2>
          </div>
          <button
            class="flex items-center gap-1.5 text-sm font-medium text-cb-accent hover:text-cb-accent/80 transition-colors"
            @click="goToHistory"
          >
           <span class="hidden text-lg md:text-xl md:flex">
             View all
           </span>
            <i class="fa-solid fa-arrow-right text-xs" />
          </button>
        </div>

        <!-- Skeleton -->
        <template v-if="walletStore.transactionsLoading">
          <div v-for="i in 3" :key="i" class="flex items-center gap-4 px-5 py-4 border-b border-cb-divider last:border-0">
            <div class="h-10 w-10 animate-pulse rounded-2xl bg-cb-field shrink-0" />
            <div class="flex-1 space-y-2">
              <div class="h-4 w-32 animate-pulse rounded-lg bg-cb-field" />
              <div class="h-3 w-20 animate-pulse rounded-lg bg-cb-field" />
            </div>
            <div class="h-5 w-20 animate-pulse rounded-lg bg-cb-field" />
          </div>
        </template>

        <!-- Empty -->
        <div
          v-else-if="!walletStore.transactions.length"
          class="flex flex-col items-center gap-3 py-14 text-center"
        >
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-cb-field text-cb-muted">
            <i class="fa-solid fa-receipt fa-lg" />
          </div>
          <div>
            <p class="text-sm font-semibold text-cb-text">No transactions yet</p>
            <p class="text-xs text-cb-muted mt-1">Your activity will appear here</p>
          </div>
        </div>

        <!-- List -->
        <template v-else>
          <TransactionRow
            v-for="tx in walletStore.recentTransactions"
            :key="tx._id"
            :transaction="tx"
            :store="walletStore"
          />
          <div class="px-5 py-3.5 text-center border-t border-cb-divider bg-cb-field/30">
            <button
              class="text-sm font-medium text-cb-accent hover:text-cb-accent/80 transition-colors flex items-center gap-1.5 mx-auto"
              @click="goToHistory"
            >
              View all transactions
              <i class="fa-solid fa-arrow-right text-xs" />
            </button>
          </div>
        </template>
      </div>

      <!-- ── Withdrawal History ──────────────────────────────────── -->
      <div v-if="walletStore.withdrawals.length" class="rounded-2xl border border-cb-divider bg-cb-card overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-cb-divider">
          <div class="flex items-center gap-2.5">
            <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-cb-field text-cb-muted">
              <i class="fa-solid fa-building-columns text-xs" />
            </div>
            <h2 class="font-semibold text-cb-text">Withdrawal History</h2>
          </div>
          <button
            v-if="walletStore.withdrawals.length > 3"
            class="flex items-center gap-1.5 text-sm font-medium text-cb-accent hover:text-cb-accent/80 transition-colors"
            @click="goToHistory"
          >
            View all
            <i class="fa-solid fa-arrow-right text-xs" />
          </button>
        </div>

        <div
          v-for="w in walletStore.withdrawals.slice(0, 3)"
          :key="w._id"
          class="flex flex-col gap-3 px-5 py-4 border-b border-cb-divider last:border-0 sm:flex-row sm:items-center sm:justify-between hover:bg-cb-field/30 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cb-positive/10 text-cb-positive">
              <i class="fa-solid fa-building-columns text-sm" />
            </div>
            <div>
              <p class="text-sm font-semibold text-cb-text">{{ w.bankName }}</p>
              <p class="text-xs text-cb-muted mt-0.5 font-mono">
                ••••&nbsp;{{ w.accountNumber.slice(-4) }}
                <span class="font-sans mx-1">·</span>
                {{ walletStore.formatDate(w.requestedAt || w.initiatedAt) }}
              </p>
              <p
                v-if="walletStore.canCancelWithdrawal(w) && now"
                class="text-xs text-cb-warning mt-1 flex items-center gap-1.5"
              >
                <i class="fa-solid fa-hourglass-half text-[10px]" />
                {{ walletStore.getHoldTimeRemaining(w.releaseAt) }}
              </p>
              <p
                v-else-if="w.status === 'failed' && w.failureReason"
                class="text-xs text-cb-negative mt-1"
              >
                {{ w.failureReason }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3 pl-13 sm:pl-0">
            <span class="text-sm font-bold text-cb-text tabular-nums">₦{{ w.amountNGN.toLocaleString() }}</span>
            <span
              class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              :class="walletStore.getWithdrawalStatusBadge(w.status).class"
            >
              {{ walletStore.getWithdrawalStatusBadge(w.status).label }}
            </span>
            <button
              v-if="walletStore.canCancelWithdrawal(w) && now"
              class="flex items-center gap-1.5 rounded-lg border border-cb-negative/25 px-2.5 py-1 text-xs font-semibold text-cb-negative hover:bg-cb-negative/8 transition-colors disabled:opacity-50"
              :disabled="cancellingId === w._id"
              @click="handleCancelWithdrawal(w)"
            >
              <i
                class="fa-solid"
                :class="cancellingId === w._id ? 'fa-spinner fa-spin' : 'fa-xmark'"
              />
              Cancel
            </button>
          </div>
        </div>
      </div>

    </main>

    <!-- ── Buy CBC Modal ──────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="overlay">
        <div
          v-if="showBuyCbc"
          class="fixed inset-0 z-50 flex items-end justify-center bg-cb-overlay p-0 backdrop-blur-sm sm:items-center sm:p-4"
          @click.self="showBuyCbc = false"
        >
          <BuyCbcModal
            :loading="walletStore.actionLoading"
            @confirm="handleBuyCbc"
            @cancel="showBuyCbc = false"
          />
        </div>
      </Transition>
    </Teleport>

    <!-- ── Withdraw Modal ─────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="overlay">
        <div
          v-if="showWithdraw"
          class="fixed inset-0 z-50 flex items-end justify-center bg-cb-overlay p-0 backdrop-blur-sm sm:items-center sm:p-4"
          @click.self="showWithdraw = false"
        >
          <WithdrawModal
            :loading="walletStore.actionLoading"
            :ngn-balance="walletStore.ngnEarnings"
            :banks="walletStore.banks"
            :banks-loading="walletStore.banksLoading"
            @confirm="handleWithdraw"
            @cancel="showWithdraw = false"
          />
        </div>
      </Transition>
    </Teleport>

    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useWalletStore } from "@/stores/walletStore";
import { useToast } from "@/composables/useToast";
import ToastContainer from "@/components/reusables/ToastContainer.vue";
import TransactionRow from "@/components/wallet/TransactionRow.vue";
import BuyCbcModal from "@/components/wallet/BuyCbcModal.vue";
import WithdrawModal from "@/components/wallet/WithdrawModal.vue";

const emit = defineEmits(["navigate"]);
const router = useRouter();
const walletStore = useWalletStore();
const toast = useToast();

function goToHistory() {
  router.push({ name: "TransactionHistory" });
}

const showBuyCbc = ref(false);
const showWithdraw = ref(false);
const balanceVisible = ref(false);
const cancellingId = ref(null);

// Ticks every 30s so the hold countdown re-renders without a manual refresh.
// The countdown text itself is still derived entirely from releaseAt (server data) —
// this just forces Vue to re-evaluate it as time passes.
const now = ref(Date.now());
let clockInterval = null;

function openBuyCbc() {
  showBuyCbc.value = true;
}

function openWithdraw() {
  if (!walletStore.ngnEarnings || walletStore.ngnEarnings < 500) {
    toast.error("Minimum withdrawal is ₦500");
    return;
  }
  showWithdraw.value = true;
  walletStore.fetchBanks().catch(() => toast.error("Failed to load banks"));
}

async function handleBuyCbc(cbcAmount) {
  try {
    await walletStore.purchaseCBC(cbcAmount);
    showBuyCbc.value = false;
  } catch {
    toast.error(walletStore.error || "Failed to initiate purchase");
  }
}

async function handleWithdraw(data) {
  try {
    await walletStore.requestWithdrawal(data);
    showWithdraw.value = false;
    toast.success("Withdrawal requested! It will be released automatically after the hold period.");
  } catch {
    toast.error(walletStore.error || "Failed to request withdrawal");
  }
}

async function handleCancelWithdrawal(withdrawal) {
  cancellingId.value = withdrawal._id;
  try {
    await walletStore.cancelWithdrawal(withdrawal._id);
    toast.success("Withdrawal cancelled. Funds have been refunded to your earnings.");
  } catch {
    toast.error(walletStore.error || "Failed to cancel withdrawal");
  } finally {
    cancellingId.value = null;
  }
}

async function refresh() {
  try {
    await walletStore.refreshWalletData();
    toast.success("Wallet refreshed");
  } catch {
    toast.error("Failed to refresh wallet");
  }
}

onMounted(() => {
  walletStore.fetchBalance().catch(() => toast.error("Failed to load balance"));
  walletStore.fetchTransactions().catch(() => {});
  walletStore.fetchWithdrawalHistory().catch(() => {});

  // Re-render the countdown periodically.
  clockInterval = setInterval(() => {
    now.value = Date.now();

    // If any withdrawal's hold should have ended, re-pull from the server
    // so status (processing/paid/failed) replaces the stale "pending" view
    // instead of relying on client-side time math.
    const holdJustEnded = walletStore.withdrawals.some(
      (w) => w.status === "pending" && new Date(w.releaseAt).getTime() <= now.value,
    );
    if (holdJustEnded) {
      walletStore.fetchWithdrawalHistory().catch(() => {});
    }
  }, 30000);
});

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval);
});
</script>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.banner-enter-active,
.banner-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>