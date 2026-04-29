<template>
  <div class="min-h-screen bg-cb-base">

    <!-- ── Header — not sticky, no back button ────────────────── -->
    <div class="border-b border-cb-divider">
      <div class="mx-auto max-w-7xl  py-5">
        <div>
          <h1 class="text-2xl font-bold text-cb-text tracking-tight">Transaction History</h1>
          <p class="mt-0.5 text-sm text-cb-muted">
            {{ walletStore.transactionsMeta.total }} total transactions
          </p>
        </div>
      </div>
    </div>

    <main class="mx-auto max-w-7xl  py-6 space-y-5">

      <!-- ── Stats strip ─────────────────────────────────────── -->
      <div>
        <!-- Section header with shared eye toggle -->
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs font-semibold text-cb-muted uppercase tracking-wider">Overview</p>
          <button
            class="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-cb-muted hover:text-cb-text hover:bg-cb-card border border-transparent hover:border-cb-divider transition-all"
            @click="statsVisible = !statsVisible"
          >
            <i :class="statsVisible ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" class="text-[10px]" />
            {{ statsVisible ? 'Hide' : 'Show' }}
          </button>
        </div>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">

          <!-- Total Credits -->
          <div class="rounded-2xl border border-cb-divider bg-cb-card px-4 py-4">
            <div class="flex items-center gap-2 mb-2.5">
              <div class="flex h-6 w-6 items-center justify-center rounded-lg bg-cb-positive/10 text-cb-positive">
                <i class="fa-solid fa-arrow-down text-[10px]" />
              </div>
              <p class="text-xs text-cb-muted">Total Credits</p>
            </div>
            <div v-if="walletStore.transactionsLoading" class="h-6 w-24 animate-pulse rounded-lg bg-cb-field" />
            <p v-else-if="!statsVisible" class="text-lg font-bold text-cb-muted select-none tracking-widest">••••</p>
            <p v-else class="text-lg font-bold text-cb-positive tabular-nums truncate">
              +{{ walletStore.totalCredits.toLocaleString() }}
            </p>
          </div>

          <!-- Total Debits -->
          <div class="rounded-2xl border border-cb-divider bg-cb-card px-4 py-4">
            <div class="flex items-center gap-2 mb-2.5">
              <div class="flex h-6 w-6 items-center justify-center rounded-lg bg-cb-negative/10 text-cb-negative">
                <i class="fa-solid fa-arrow-up text-[10px]" />
              </div>
              <p class="text-xs text-cb-muted">Total Debits</p>
            </div>
            <div v-if="walletStore.transactionsLoading" class="h-6 w-24 animate-pulse rounded-lg bg-cb-field" />
            <p v-else-if="!statsVisible" class="text-lg font-bold text-cb-muted select-none tracking-widest">••••</p>
            <p v-else class="text-lg font-bold text-cb-negative tabular-nums truncate">
              −{{ walletStore.totalDebits.toLocaleString() }}
            </p>
          </div>

          <!-- Credits count -->
          <div class="rounded-2xl border border-cb-divider bg-cb-card px-4 py-4">
            <div class="flex items-center gap-2 mb-2.5">
              <div class="flex h-6 w-6 items-center justify-center rounded-lg bg-cb-field text-cb-muted">
                <i class="fa-solid fa-circle-check text-[10px]" />
              </div>
              <p class="text-xs text-cb-muted">Credits count</p>
            </div>
            <div v-if="walletStore.transactionsLoading" class="h-6 w-12 animate-pulse rounded-lg bg-cb-field" />
            <p v-else-if="!statsVisible" class="text-lg font-bold text-cb-muted select-none tracking-widest">••</p>
            <p v-else class="text-lg font-bold text-cb-text">{{ walletStore.creditTransactions.length }}</p>
          </div>

          <!-- Debits count -->
          <div class="rounded-2xl border border-cb-divider bg-cb-card px-4 py-4">
            <div class="flex items-center gap-2 mb-2.5">
              <div class="flex h-6 w-6 items-center justify-center rounded-lg bg-cb-field text-cb-muted">
                <i class="fa-solid fa-circle-xmark text-[10px]" />
              </div>
              <p class="text-xs text-cb-muted">Debits count</p>
            </div>
            <div v-if="walletStore.transactionsLoading" class="h-6 w-12 animate-pulse rounded-lg bg-cb-field" />
            <p v-else-if="!statsVisible" class="text-lg font-bold text-cb-muted select-none tracking-widest">••</p>
            <p v-else class="text-lg font-bold text-cb-text">{{ walletStore.debitTransactions.length }}</p>
          </div>

        </div>
      </div>

      <!-- ── Filter bar ──────────────────────────────────────── -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <!-- Direction tabs -->
        <div class="flex rounded-xl border border-cb-divider bg-cb-card p-1 gap-1 w-fit">
          <button
            v-for="f in directionFilters"
            :key="f.value"
            class="rounded-lg px-4 py-1.5 text-sm font-semibold transition-all duration-200"
            :class="directionFilter === f.value
              ? 'bg-cb-accent text-white shadow-sm'
              : 'text-cb-muted hover:text-cb-text'"
            @click="directionFilter = f.value"
          >
            {{ f.label }}
          </button>
        </div>

        <!-- Custom type dropdown -->
        <div class="relative w-full sm:w-52" ref="typeDropdownRef">
          <button
            class="flex items-center justify-between w-full rounded-xl border border-cb-divider bg-cb-card px-4 py-2.5 text-sm text-cb-text transition-colors hover:border-cb-accent/30 focus:outline-none"
            @click="showTypeDropdown = !showTypeDropdown"
          >
            <span :class="typeFilter ? 'text-cb-text' : 'text-cb-muted'">
              {{ selectedTypeLabel }}
            </span>
            <i
              class="fa-solid fa-chevron-down text-xs text-cb-muted transition-transform duration-200"
              :class="{ 'rotate-180': showTypeDropdown }"
            />
          </button>

          <Transition name="dropdown">
            <div
              v-if="showTypeDropdown"
              class="absolute right-0 top-full mt-1.5 w-full min-w-[200px] z-20 rounded-xl border border-cb-divider bg-cb-card shadow-xl shadow-black/10 overflow-hidden"
            >
              <button
                class="flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-cb-field text-left"
                :class="typeFilter === '' ? 'text-cb-accent font-semibold' : 'text-cb-muted'"
                @click="setTypeFilter('')"
              >
                All types
                <i v-if="typeFilter === ''" class="fa-solid fa-check text-xs text-cb-accent" />
              </button>
              <div class="h-px bg-cb-divider" />
              <button
                v-for="t in transactionTypes"
                :key="t.value"
                class="flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-cb-field text-left"
                :class="typeFilter === t.value ? 'text-cb-accent font-semibold' : 'text-cb-text'"
                @click="setTypeFilter(t.value)"
              >
                {{ t.label }}
                <i v-if="typeFilter === t.value" class="fa-solid fa-check text-xs text-cb-accent" />
              </button>
            </div>
          </Transition>
        </div>

      </div>

      <!-- ── Transaction list ────────────────────────────────── -->
      <div class="rounded-2xl border border-cb-divider bg-cb-card overflow-hidden">

        <!-- Loading skeleton -->
        <template v-if="walletStore.transactionsLoading">
          <div v-for="i in 6" :key="i" class="flex items-center gap-4 px-5 py-4 border-b border-cb-divider last:border-0">
            <div class="h-10 w-10 animate-pulse rounded-2xl bg-cb-field shrink-0" />
            <div class="flex-1 space-y-2">
              <div class="h-4 w-40 animate-pulse rounded-lg bg-cb-field" />
              <div class="h-3 w-24 animate-pulse rounded-lg bg-cb-field" />
            </div>
            <div class="space-y-1.5 text-right">
              <div class="h-4 w-20 animate-pulse rounded-lg bg-cb-field" />
              <div class="h-3 w-14 animate-pulse rounded-lg bg-cb-field ml-auto" />
            </div>
          </div>
        </template>

        <!-- Empty -->
        <div
          v-else-if="!filteredTransactions.length"
          class="flex flex-col items-center gap-3 py-16 text-center"
        >
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-cb-field text-cb-muted">
            <i class="fa-solid fa-filter-circle-xmark fa-lg" />
          </div>
          <div>
            <p class="text-sm font-semibold text-cb-text">No transactions found</p>
            <p class="text-xs text-cb-muted mt-1">Try adjusting your filters</p>
          </div>
          <button
            class="mt-1 flex items-center gap-1.5 text-xs font-medium text-cb-accent hover:text-cb-accent/80 transition-colors"
            @click="resetFilters"
          >
            <i class="fa-solid fa-rotate-left text-[10px]" />
            Clear filters
          </button>
        </div>

        <!-- List -->
        <template v-else>
          <TransactionRow
            v-for="tx in paginatedTransactions"
            :key="tx._id"
            :transaction="tx"
            :store="walletStore"
            show-balance
          />
        </template>
      </div>

      <!-- ── Pagination ──────────────────────────────────────── -->
      <div
        v-if="totalFilteredPages > 1"
        class="flex items-center justify-center gap-2"
      >
        <button
          class="flex h-9 w-9 items-center justify-center rounded-xl border border-cb-divider bg-cb-card text-cb-muted transition-all hover:text-cb-text hover:border-cb-accent/30 disabled:opacity-35 disabled:cursor-not-allowed"
          :disabled="localPage === 1"
          @click="localPage--"
        >
          <i class="fa-solid fa-chevron-left text-xs" />
        </button>

        <div class="flex items-center gap-1">
          <button
            v-for="p in pageNumbers"
            :key="p"
            class="flex h-9 min-w-9 items-center justify-center rounded-xl border text-sm font-semibold transition-all px-2"
            :class="p === localPage
              ? 'border-cb-accent bg-cb-accent text-white shadow-sm'
              : 'border-cb-divider bg-cb-card text-cb-muted hover:text-cb-text hover:border-cb-accent/30'"
            @click="localPage = p"
          >
            {{ p }}
          </button>
        </div>

        <button
          class="flex h-9 w-9 items-center justify-center rounded-xl border border-cb-divider bg-cb-card text-cb-muted transition-all hover:text-cb-text hover:border-cb-accent/30 disabled:opacity-35 disabled:cursor-not-allowed"
          :disabled="localPage === totalFilteredPages"
          @click="localPage++"
        >
          <i class="fa-solid fa-chevron-right text-xs" />
        </button>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useWalletStore } from "@/stores/walletStore";
import { useToast } from "@/composables/useToast";
import TransactionRow from "@/components/wallet/TransactionRow.vue";

defineEmits(["navigate"]);

const walletStore = useWalletStore();
const toast = useToast();

const directionFilter = ref("");
const typeFilter = ref("");
const localPage = ref(1);
const PAGE_SIZE = 15;
const showTypeDropdown = ref(false);
const typeDropdownRef = ref(null);
const statsVisible = ref(false);

const directionFilters = [
  { value: "", label: "All" },
  { value: "credit", label: "Credits" },
  { value: "debit", label: "Debits" },
];

const transactionTypes = [
  { value: "purchase",            label: "CBC Purchase" },
  { value: "earning_held",        label: "Earnings Held" },
  { value: "earning_released",    label: "Earnings Released" },
  { value: "debit_errand_post",   label: "Errand Post Fee" },
  { value: "debit_service_order", label: "Service Contact Fee" },
  { value: "withdrawal",          label: "Withdrawal" },
  { value: "welcome_bonus",       label: "Welcome Bonus" },
  { value: "refund",              label: "Refund" },
];

const selectedTypeLabel = computed(() => {
  if (!typeFilter.value) return "All types";
  return transactionTypes.find((t) => t.value === typeFilter.value)?.label || "All types";
});

function setTypeFilter(val) {
  typeFilter.value = val;
  showTypeDropdown.value = false;
}

// Close dropdown on outside click
function handleOutsideClick(e) {
  if (typeDropdownRef.value && !typeDropdownRef.value.contains(e.target)) {
    showTypeDropdown.value = false;
  }
}
onMounted(() => document.addEventListener("click", handleOutsideClick, true));
onBeforeUnmount(() => document.removeEventListener("click", handleOutsideClick, true));

const filteredTransactions = computed(() => {
  let list = walletStore.transactions;
  if (directionFilter.value) {
    list = list.filter((t) => t.direction === directionFilter.value);
  }
  if (typeFilter.value) {
    list = list.filter((t) => t.type === typeFilter.value);
  }
  return list;
});

const totalFilteredPages = computed(() =>
  Math.max(1, Math.ceil(filteredTransactions.value.length / PAGE_SIZE))
);

const paginatedTransactions = computed(() => {
  const start = (localPage.value - 1) * PAGE_SIZE;
  return filteredTransactions.value.slice(start, start + PAGE_SIZE);
});

// Show at most 7 page buttons with ellipsis logic
const pageNumbers = computed(() => {
  const total = totalFilteredPages.value;
  const cur = localPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, cur]);
  for (let i = -1; i <= 1; i++) {
    if (cur + i > 1 && cur + i < total) pages.add(cur + i);
  }
  return Array.from(pages).sort((a, b) => a - b);
});

watch([directionFilter, typeFilter], () => {
  localPage.value = 1;
});

function resetFilters() {
  directionFilter.value = "";
  typeFilter.value = "";
  localPage.value = 1;
}

onMounted(() => {
  if (!walletStore.transactions.length) {
    walletStore.fetchTransactions().catch(() => toast.error("Failed to load transactions"));
  }
});
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>