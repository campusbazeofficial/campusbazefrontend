// src/composables/useErrandFilters.js
import { ref, computed } from 'vue'

export const PAGE_LIMIT = 9

const DEFAULT_FILTERS = () => ({
  search:          '',
  category:        '',
  budgetType:      '',
  sort:            'newest',
  locationState:   '',
  locationLocalGovt: '',
  locationVillage: '',
})

const DEFAULT_PRICE_RANGE = () => ({ min: 0, max: null })

export function useErrandFilters() {
  const filters      = ref(DEFAULT_FILTERS())
  const priceRange   = ref(DEFAULT_PRICE_RANGE())
  const currentPage  = ref(1)
  const isSearching  = ref(false)

  // ── Derived ──────────────────────────────────────────────
  const hasPriceRange = computed(() =>
    priceRange.value.min > 0 ||
    (priceRange.value.max !== null && Number.isFinite(priceRange.value.max))
  )

  const hasActiveFilters = computed(() =>
    !!(filters.value.search || filters.value.category ||
       filters.value.budgetType || hasPriceRange.value ||
       filters.value.locationState || filters.value.locationLocalGovt || filters.value.locationVillage)
  )

  // ── Param builder ─────────────────────────────────────────
  // Only adds keys that carry real information – prevents accidental
  // empty-string params going to the API (e.g. category="" confuses most backends)
  function buildParams() {
    const p = { page: currentPage.value, limit: PAGE_LIMIT }

    if (filters.value.sort)                p.sort       = filters.value.sort
    if (filters.value.search.trim())       p.search     = filters.value.search.trim()
    if (filters.value.category)            p.category   = filters.value.category
    if (filters.value.budgetType)          p.budgetType = filters.value.budgetType
    if (filters.value.locationState)       p.state      = filters.value.locationState.trim()
    if (filters.value.locationLocalGovt)   p.localGovt  = filters.value.locationLocalGovt.trim()
    if (filters.value.locationVillage)     p.village    = filters.value.locationVillage.trim()

    if (priceRange.value.min > 0)                   p.minBudget = priceRange.value.min
    if (priceRange.value.max !== null &&
        Number.isFinite(priceRange.value.max) &&
        priceRange.value.max > 0)                   p.maxBudget = priceRange.value.max

    return p
  }

  // ── Mutators ──────────────────────────────────────────────
  function resetPage() {
    currentPage.value = 1
  }

  function resetFilters() {
    filters.value    = DEFAULT_FILTERS()
    priceRange.value = DEFAULT_PRICE_RANGE()
    currentPage.value = 1
  }

  function sanitizePriceRange() {
    let { min, max } = priceRange.value
    min = isNaN(min) || min < 0 ? 0 : min
    max = (!max || isNaN(max) || max <= 0) ? null : max
    if (max !== null && min > max) min = max
    priceRange.value = { min, max }
  }

  return {
    filters,
    priceRange,
    currentPage,
    isSearching,
    hasPriceRange,
    hasActiveFilters,
    buildParams,
    resetPage,
    resetFilters,
    sanitizePriceRange,
  }
}