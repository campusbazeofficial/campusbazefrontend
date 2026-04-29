<template>
  <section
    class="sticky -top-8 md:-top-10 z-20 border-b py-3 border-cb-divider bg-cb-base/95 backdrop-blur-sm"
  >
    <div class="mx-auto max-w-7xl">
      <!-- Row 1: Search + Sort + View toggle -->
      <div
        class="flex flex-col justify-between gap-2 sm:flex-row sm:items-center sm:gap-2"
      >
        <div class="bg-cb-field w-full sm:flex-[2] rounded-md">
          <!-- Search -->
          <label class="relative flex-1 min-w-0">
            <span
              class="pointer-events-none absolute inset-y-0 left-3.5 flex items-center"
            >
              <i
                :class="[
                  'fa-solid text-sm text-cb-muted',
                  isSearching ? 'fa-spinner fa-spin' : 'fa-magnifying-glass',
                ]"
              ></i>
            </span>
            <input
              :value="filters.search"
              type="search"
              class="block w-full rounded-xl border border-cb-divider bg-cb-card py-2.5 pl-10 pr-10 text-sm"
              placeholder="Search errands…"
              @input="onSearchInput($event.target.value)"
            />
            <button
              v-if="filters.search"
              type="button"
              class="absolute inset-y-0 right-3 flex items-center text-cb-muted transition-colors hover:text-cb-text"
              @click="clearSearch"
            >
              <i class="fa-solid fa-times text-xs"></i>
            </button>
          </label>
        </div>

        <!-- Sort + View controls -->
       <div class="flex w-full items-center gap-2 sm:flex-[1] sm:justify-end">
          <!-- Sort dropdown -->
          <div class="relative flex-1 sm:flex-none" ref="sortRef">
            <button
              type="button"
              class="inline-flex w-full sm:w-auto items-center justify-between gap-1.5 rounded-xl border border-cb-divider bg-cb-card px-3 py-2.5 text-xs font-semibold text-cb-text transition-colors hover:bg-cb-field"
              @click="sortOpen = !sortOpen"
            >
              <div class="flex items-center gap-1.5">
                <i class="fa-solid fa-arrow-down-wide-short text-[10px]"></i>
                <span class="hidden sm:inline">{{ selectedSortLabel }}</span>
                <span class="sm:hidden">Sort</span>
              </div>

              <i
                :class="[
                  'fa-solid fa-chevron-down text-[9px] transition-transform duration-150',
                  sortOpen && 'rotate-180',
                ]"
              ></i>
            </button>

            <Transition name="dd">
              <div
                v-if="sortOpen"
                class="absolute right-0 top-full z-40 mt-1.5 w-full sm:w-[180px] overflow-hidden rounded-xl border border-cb-divider bg-cb-card py-1.5 shadow-xl shadow-black/20"
              >
                <button
                  v-for="opt in SORT_OPTIONS"
                  :key="opt.value"
                  type="button"
                  :class="[
                    'flex w-full items-center gap-2.5 px-3.5 py-2 text-sm transition-colors',
                    filters.sort === opt.value
                      ? 'bg-cb-accent-subtle font-semibold text-cb-accent'
                      : 'text-cb-text hover:bg-cb-field',
                  ]"
                  @click="selectSort(opt.value)"
                >
                  <i :class="[opt.icon, 'text-xs text-cb-muted w-4']"></i>
                  <span class="flex-1 text-left">{{ opt.label }}</span>
                  <i
                    v-if="filters.sort === opt.value"
                    class="fa-solid fa-check text-xs text-cb-accent"
                  ></i>
                </button>
              </div>
            </Transition>
          </div>

          <!-- View toggle -->
          <div
            class="flex shrink-0 overflow-hidden rounded-xl border border-cb-divider bg-cb-card"
          >
            <button
              type="button"
              :class="[
                'flex h-10 w-10 items-center justify-center text-sm transition-colors',
                viewMode === 'grid'
                  ? 'bg-cb-accent text-cb-contrast'
                  : 'text-cb-muted hover:bg-cb-field hover:text-cb-text',
              ]"
              aria-label="Grid view"
              @click="$emit('update:viewMode', 'grid')"
            >
              <i class="fa-solid fa-grip"></i>
            </button>

            <button
              type="button"
              :class="[
                'flex h-10 w-10 items-center justify-center text-sm transition-colors',
                viewMode === 'list'
                  ? 'bg-cb-accent text-cb-contrast'
                  : 'text-cb-muted hover:bg-cb-field hover:text-cb-text',
              ]"
              aria-label="List view"
              @click="$emit('update:viewMode', 'list')"
            >
              <i class="fa-solid fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Row 2: Category chips -->
      <div
        class="no-scrollbar -mx-1 mt-3 flex items-center gap-2 overflow-x-auto px-1 pb-2 sm:flex-wrap sm:overflow-visible"
      >
        <button
          v-for="cat in CATEGORIES"
          :key="cat.value ?? 'all'"
          type="button"
          :class="[
            'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all',
            filters.category === cat.value
              ? 'border-cb-accent bg-cb-accent-subtle text-cb-accent'
              : 'border-cb-divider bg-cb-card text-cb-muted hover:border-cb-accent-muted hover:bg-cb-field hover:text-cb-text',
          ]"
          @click="selectCategory(cat.value)"
        >
          <i :class="[cat.icon, 'text-[10px]']"></i>
          <span>{{ cat.short }}</span>
        </button>
      </div>

      <!-- Row 3: Budget + Price + Actions -->
      <div class="mt-3 flex flex-wrap items-center gap-2 sm:gap-2.5">
        <!-- Budget type pills -->
        <div
          class="flex w-full sm:w-auto overflow-hidden rounded-full border border-cb-divider bg-cb-card"
        >
          <button
            v-for="opt in BUDGET_OPTIONS"
            :key="opt.value ?? 'all'"
            type="button"
            :class="[
              'flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-semibold transition-colors',
              filters.budgetType === opt.value
                ? 'bg-cb-accent text-cb-contrast'
                : 'text-cb-muted hover:bg-cb-field hover:text-cb-text',
            ]"
            @click="selectBudget(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>

        <!-- Price range toggle -->
        <button
          type="button"
          :class="[
            'inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all',
            hasPriceRange || showPriceRange
              ? 'border-cb-accent bg-cb-accent-subtle text-cb-accent'
              : 'border-cb-divider bg-cb-card text-cb-muted hover:border-cb-accent-muted hover:text-cb-text',
          ]"
          @click="showPriceRange = !showPriceRange"
        >
          <i class="fa-solid fa-sliders text-[10px]"></i>
          <span v-if="hasPriceRange">
            ₦{{ priceRange.min.toLocaleString() }}–₦{{
              priceRange.max?.toLocaleString() || "∞"
            }}
          </span>
          <span v-else>Price range</span>
        </button>

        <!-- Results count -->
        <span
          class="hidden sm:block ml-auto text-xs font-medium text-cb-muted whitespace-nowrap"
        >
          <strong class="font-bold text-cb-text">{{ totalCount }}</strong>
          {{ totalCount === 1 ? "result" : "results" }}
        </span>

        <!-- Clear all -->
        <button
          v-if="hasActiveFilters"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full border border-cb-negative/30 bg-cb-negative-subtle px-3 py-1.5 text-xs font-semibold text-cb-negative transition-colors hover:opacity-90 sm:ml-0"
          @click="$emit('clear')"
        >
          <i class="fa-solid fa-times text-[9px]"></i>
          Clear all
        </button>
      </div>

      <!-- Price range expander -->
      <Transition name="slide-down">
        <div
          v-if="showPriceRange"
          class="mt-3 rounded-xl border border-cb-divider bg-cb-card p-4"
        >
          <div class="mb-3 flex items-center justify-between">
            <span class="text-xs font-semibold text-cb-text">Budget range</span>
            <span class="text-xs font-bold text-cb-accent">
              ₦{{ priceRange.min.toLocaleString() }} – ₦{{
                priceRange.max ? priceRange.max.toLocaleString() : "∞"
              }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex flex-1 flex-col gap-1">
              <label class="text-[10px] font-semibold text-cb-muted">Min</label>
              <input
                :value="priceRange.min"
                type="number"
                min="0"
                class="w-full rounded-lg border border-cb-divider bg-cb-base px-2.5 py-1.5 text-xs text-cb-text focus:border-cb-accent focus:outline-none"
                placeholder="0"
                @change="onMinChange($event.target.value)"
              />
            </div>
            <div class="mt-5 h-px w-6 shrink-0 bg-cb-divider"></div>
            <div class="flex flex-1 flex-col gap-1">
              <label class="text-[10px] font-semibold text-cb-muted">Max</label>
              <input
                :value="priceRange.max ?? ''"
                type="number"
                :min="priceRange.min"
                class="w-full rounded-lg border border-cb-divider bg-cb-base px-2.5 py-1.5 text-xs text-cb-text focus:border-cb-accent focus:outline-none"
                placeholder="No limit"
                @change="onMaxChange($event.target.value)"
              />
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { CATEGORIES } from "@/utils/categories";

// ─── Props & emits ────────────────────────────────────────────
const props = defineProps({
  filters: { type: Object, required: true },
  priceRange: { type: Object, required: true },
  viewMode: { type: String, default: "grid" },
  totalCount: { type: Number, default: 0 },
  hasActiveFilters: { type: Boolean, default: false },
  isSearching: { type: Boolean, default: false },
});

const emit = defineEmits([
  "update:filters",
  "update:priceRange",
  "update:viewMode",
  "search", // debounced search → parent schedules fetch
  "filter", // immediate filter change → parent fetches now
  "clear",
  "navigate",
]);

// ─── Constants ────────────────────────────────────────────────
const BUDGET_OPTIONS = [
  { value: "", label: "All" },
  { value: "fixed", label: "Fixed" },
  { value: "negotiable", label: "Negotiable" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first", icon: "fa-solid fa-sparkles" },
  { value: "deadline", label: "Deadline soon", icon: "fa-regular fa-clock" },
  {
    value: "budget_high",
    label: "Budget: high → low",
    icon: "fa-solid fa-arrow-down-wide-short",
  },
  {
    value: "budget_low",
    label: "Budget: low → high",
    icon: "fa-solid fa-arrow-up-wide-short",
  },
];

// ─── Local UI state ───────────────────────────────────────────
const sortOpen = ref(false);
const showPriceRange = ref(false);
const sortRef = ref(null);

// ─── Derived ─────────────────────────────────────────────────
const selectedSortLabel = computed(
  () =>
    SORT_OPTIONS.find((o) => o.value === props.filters.sort)?.label ?? "Sort",
);
const hasPriceRange = computed(
  () =>
    props.priceRange.min > 0 ||
    (props.priceRange.max !== null && Number.isFinite(props.priceRange.max)),
);

// ─── Helpers: patch only the changed key ─────────────────────
function patchFilter(key, val) {
  emit("update:filters", { ...props.filters, [key]: val });
}

// ─── Search (debounced via parent) ───────────────────────────
function onSearchInput(val) {
  patchFilter("search", val);
  emit("search"); // parent owns the debounce
}

function clearSearch() {
  patchFilter("search", "");
  emit("filter"); // immediate clear
}

// ─── Category ────────────────────────────────────────────────
function selectCategory(val) {
  // toggle off if already selected
  const next = props.filters.category === val ? "" : val;
  patchFilter("category", next);
  emit("filter");
}

// ─── Budget type ─────────────────────────────────────────────
function selectBudget(val) {
  patchFilter("budgetType", val);
  emit("filter");
}

// ─── Sort ────────────────────────────────────────────────────
function selectSort(val) {
  patchFilter("sort", val);
  sortOpen.value = false;
  emit("filter");
}

// ─── Price range (controlled, sanitised) ─────────────────────
function onMinChange(raw) {
  const min = parseFloat(raw);
  const safeMin = isNaN(min) || min < 0 ? 0 : min;
  const max = props.priceRange.max;
  emit("update:priceRange", {
    min: max !== null && safeMin > max ? max : safeMin,
    max,
  });
  emit("filter");
}

function onMaxChange(raw) {
  const max = raw === "" ? null : parseFloat(raw);
  const safeMax = max === null || isNaN(max) || max <= 0 ? null : max;
  emit("update:priceRange", {
    min: props.priceRange.min,
    max: safeMax,
  });
  emit("filter");
}

// ─── Outside click for sort dropdown ─────────────────────────
function onOutsideClick(e) {
  if (sortRef.value && !sortRef.value.contains(e.target))
    sortOpen.value = false;
}

onMounted(() => document.addEventListener("click", onOutsideClick));
onUnmounted(() => document.removeEventListener("click", onOutsideClick));
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  scrollbar-width: none;
}

.dd-enter-active,
.dd-leave-active {
  transition: all 0.15s ease;
}
.dd-enter-from,
.dd-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 200px;
}
</style>
