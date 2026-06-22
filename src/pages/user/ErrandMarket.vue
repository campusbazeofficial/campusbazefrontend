<template>
  <div class="min-h-screen bg-cb-base">
    <!-- Hero -->
    <MarketHero
      :total-count="totalCount"
      :avg-budget="avgBudget"
      :urgent-count="urgentCount"
      @navigate="$emit('navigate', $event)"
    />

    <!-- Filter bar -->
    <MarketFilterBar
      v-model:filters="filters"
      v-model:price-range="priceRange"
      v-model:view-mode="viewMode"
      :total-count="totalCount"
      :has-active-filters="hasActiveFilters"
      :is-searching="isSearching"
      @search="onSearchInput"
      @filter="onFilterChange"
      @clear="clearFilters"
      @navigate="$emit('navigate', $event)"
    />

    <!-- Content -->
    <main class="mx-auto max-w-7xl py-6">
      <!-- Loading skeletons -->
      <template v-if="errandStore.marketLoading">
        <div :class="gridClass">
          <SkeletonCard v-for="i in 6" :key="i" />
        </div>
      </template>

      <!-- Empty state -->
      <MarketEmptyState
        v-else-if="!filteredMarket.length"
        :has-active-filters="hasActiveFilters"
        @clear="clearFilters"
        @navigate="router.push({ name: 'PostErrand' })"
        @category="selectCategory"
      />

      <!-- Results -->
      <template v-else>
        <div :class="gridClass">
          <ErrandCard
            v-for="errand in filteredMarket"
            :key="errand._id"
            :errand="errand"
            :view-mode="viewMode"
            :is-poster="isPoster(errand)"
            :has-user-bid="errandStore.myBidErrandIds.has(errand._id)"
            @click="openDetail(errand)"
            @bid="openBidModal"
          />
        </div>

        <div v-if="marketMeta && marketMeta.totalPages > 1" class="mt-8">
          <Pagination
            :current-page="currentPage"
            :total-pages="marketMeta.totalPages"
            @page="goToPage"
          />
        </div>
      </template>
    </main>

    <!-- Bid modal (quick-bid from card, before navigating to detail) -->
    <Teleport to="body">
      <Transition name="overlay">
        <div
          v-if="bidModal.open"
          class="fixed inset-0 z-[300] flex items-end justify-center bg-cb-overlay p-0 backdrop-blur-sm sm:items-center sm:p-4"
          @click.self="bidModal.open = false"
        >
          <BidModal
            :errand="bidModal.errand"
            :loading="errandStore.actionLoading"
            :error="bidError"
            :user-has-location="userHasLocation"
            @submit="handleBid"
            @close="bidModal.open = false"
          />
        </div>
      </Transition>
    </Teleport>

    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useErrandStore } from "@/stores/errandStore";
import { useUserStore } from "@/stores/userStore";
import { useToast } from "@/composables/useToast";
import { useErrandFilters } from "@/composables/useErrandFilters";
import { isUrgent } from "@/utils/categories";

import MarketHero from "@/components/errands/market/MarketHero.vue";
import MarketFilterBar from "@/components/errands/market/MarketFilterBar.vue";
import MarketEmptyState from "@/components/errands/market/MarketEmptyState.vue";
import ErrandCard from "@/components/errands/ErrandCard.vue";
import SkeletonCard from "@/components/errands/SkeletonCard.vue";
import BidModal from "@/components/errands/BidModal.vue";
import Pagination from "@/components/reusables/Pagination.vue";
import ToastContainer from "@/components/reusables/ToastContainer.vue";

const router = useRouter();
const emit = defineEmits(["navigate"]);

const errandStore = useErrandStore();
const userStore = useUserStore();
const toast = useToast();

// ── View ──────────────────────────────────────────────────────
const viewMode = ref("grid");
const gridClass = computed(() =>
  viewMode.value === "grid"
    ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    : "flex flex-col gap-4",
);

// ── Filters ───────────────────────────────────────────────────
const {
  filters,
  priceRange,
  currentPage,
  hasActiveFilters,
  isSearching,
  buildParams,
  resetFilters,
  resetPage,
} = useErrandFilters();

// ── Stats ─────────────────────────────────────────────────────
const marketMeta = computed(() => errandStore.marketMeta);

// Client-side safety net: if the API doesn't honour budgetType filtering,
// this ensures what the user sees always matches the selected filter.
const filteredMarket = computed(() => {
  const list = errandStore.market;
  if (!filters.value.budgetType) return list;
  return list.filter(e => e.budgetType === filters.value.budgetType);
});

const totalCount = computed(
  () => filteredMarket.value.length ?? 0,
);
const avgBudget = computed(() => {
  const list = filteredMarket.value;
  if (!list.length) return null;
  return Math.round(list.reduce((s, e) => s + (e.budget || 0), 0) / list.length);
});
const urgentCount = computed(
  () => filteredMarket.value.filter((e) => isUrgent(e.deadline)).length,
);

// ── Core fetch ────────────────────────────────────────────────
async function fetchErrands() {
  try {
    await errandStore.fetchMarket(buildParams());
  } catch {
    toast.error("Failed to load errands");
  }
}

let debounceTimer = null;
function scheduleFetch(immediate = false) {
  clearTimeout(debounceTimer);
  if (immediate) { fetchErrands(); return; }
  debounceTimer = setTimeout(() => {
    isSearching.value = false;
    fetchErrands();
  }, 350);
}

function onSearchInput() { isSearching.value = true; resetPage(); scheduleFetch(false); }
function onFilterChange() { isSearching.value = false; resetPage(); scheduleFetch(true); }
function selectCategory(val) { filters.value = { ...filters.value, category: val }; onFilterChange(); }
function clearFilters() { resetFilters(); fetchErrands(); }
function goToPage(page) { currentPage.value = page; fetchErrands(); window.scrollTo({ top: 0, behavior: "smooth" }); }

// ── Navigation to detail page ─────────────────────────────────
function openDetail(errand) {
  router.push({ name: "ErrandDetail", params: { id: errand._id } });
}

const isPoster = (errand) => errandStore.isPoster(errand._id);

// Whether the logged-in runner has a location set (required to bid)
const userHasLocation = computed(() => {
  const loc = userStore.user?.location;
  return !!(loc?.state);
});

// ── Bid modal (quick-bid from card) ───────────────────────────
const bidModal = ref({ open: false, errand: null });
const bidError = ref("");

function openBidModal(errand) {
  bidError.value = "";
  bidModal.value = { open: true, errand };
}

async function handleBid({ amount, message }) {
  bidError.value = "";
  try {
    await errandStore.placeBid(bidModal.value.errand._id, { amount, message });
    bidModal.value.open = false;
    toast.success("Bid placed successfully");
    fetchErrands();
  } catch (err) {
    const status = err?.response?.status;
    if (status === 403) {
      bidError.value = "You can only bid on errands in your state.";
    } else {
      bidError.value = errandStore.error || "Failed to place bid";
    }
  }
}

// ── Lifecycle ─────────────────────────────────────────────────
onMounted(() => {
  fetchErrands();
  errandStore.fetchMyBids();
});
onUnmounted(() => clearTimeout(debounceTimer));
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
</style>