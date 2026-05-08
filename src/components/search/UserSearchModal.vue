<!-- src/components/search/UserSearchModal.vue -->
<template>
  <Teleport to="body">
    <Transition name="search-modal">
     <div
  v-if="modelValue"
  class="fixed inset-0 z-[500] flex flex-col bg-cb-base overflow-hidden"
  @keydown.escape="close"
>
  <!-- ── Top bar ── -->
  <div class="flex shrink-0 items-center gap-2 border-b border-cb-divider bg-cb-card px-3 py-3 sm:gap-3 sm:px-6">
    <i class="fa-solid fa-magnifying-glass shrink-0 text-sm text-cb-muted"></i>
    <input
      ref="inputRef"
      v-model="query"
      type="search"
      placeholder="Search users by name, skill or username…"
      class="min-w-0 flex-1 bg-transparent text-sm text-cb-text placeholder:text-cb-muted outline-none"
      @input="debouncedSearch"
    />
    <button
      v-if="query"
      @click="clearSearch"
      class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cb-field text-cb-muted hover:text-cb-text transition-colors"
    >
      <i class="fa-solid fa-times text-[10px]"></i>
    </button>
    <button
      @click="close"
      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cb-divider text-cb-muted hover:bg-cb-field hover:text-cb-text transition-all"
    >
      <i class="fa-solid fa-times text-sm"></i>
    </button>
  </div>

  <!-- ── Results ── -->
  <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">

    <!-- Initial state -->
    <div
      v-if="!hasSearched"
      class="flex flex-col gap-6 px-4 py-8 sm:px-6"
    >
      <!-- Recent searches section -->
      <div v-if="recentSearches.length > 0" class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-cb-muted">Recent</h3>
          <button
            @click="handleClearRecent"
            class="text-xs font-medium text-cb-accent hover:text-cb-accent-hover transition-colors"
          >
            Clear all
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(term, index) in recentSearches"
            :key="index"
            @click="searchRecent(term)"
            class="inline-flex items-center gap-1.5 rounded-lg border border-cb-divider bg-cb-card px-3 py-1.5 text-sm text-cb-text transition-colors hover:bg-cb-field hover:border-cb-muted"
          >
            <i class="fa-solid fa-clock-rotate-left text-[10px] text-cb-muted"></i>
            {{ term }}
          </button>
        </div>
      </div>

      <!-- Empty search prompt -->
      <div class="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-cb-accent-subtle">
          <i class="fa-solid fa-magnifying-glass text-2xl text-cb-accent"></i>
        </div>
        <p class="text-sm font-semibold text-cb-text">Search for users</p>
        <p class="text-xs text-cb-muted">Find runners, students and service providers on campus</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="divide-y divide-cb-divider">
      <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-4 py-4 sm:px-6">
        <div class="h-11 w-11 shrink-0 animate-pulse rounded-full bg-cb-field"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 w-32 animate-pulse rounded bg-cb-field"></div>
          <div class="h-3 w-20 animate-pulse rounded bg-cb-field"></div>
        </div>
        <div class="h-8 w-20 animate-pulse rounded-xl bg-cb-field"></div>
      </div>
    </div>

    <!-- Empty -->
    <div
      v-else-if="results.length === 0"
      class="flex flex-col items-center justify-center gap-3 px-4 py-20 text-center"
    >
      <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-cb-field">
        <i class="fa-solid fa-user-slash text-2xl text-cb-muted"></i>
      </div>
      <p class="text-sm font-semibold text-cb-text">No users found</p>
    </div>

    <!-- Results list -->
    <div v-else class="divide-y divide-cb-divider">
      <div
        v-for="user in results"
        :key="user._id"
        class="flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-cb-field sm:px-6"
        @click="goToProfile(user)"
      >
        <!-- Avatar -->
        <div class="relative shrink-0">
          <div class="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-cb-accent text-sm font-bold text-white">
            <img v-if="user.avatar" :src="user.avatar" :alt="user.displayName" class="h-full w-full object-cover" />
            <span v-else>{{ getInitials(user) }}</span>
          </div>
          <span
            v-if="user.identityVerificationBadge"
            class="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-cb-card bg-cb-accent"
          >
            <i class="fa-solid fa-check text-[8px] text-white"></i>
          </span>
        </div>

        <!-- Info -->
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-1.5">
            <p class="truncate text-sm font-semibold text-cb-text">
              {{ user.displayName || `${user.firstName} ${user.lastName}` }}
            </p>
            <span
              v-if="user.isStudent"
              class="inline-flex items-center gap-0.5 rounded-full border border-cb-divider px-1.5 py-0.5 text-[9px] text-cb-muted"
            >
              <i class="fa-solid fa-graduation-cap text-[8px]"></i>
              Student
            </span>
          </div>
          <div class="mt-0.5 flex items-center gap-2 text-[11px] text-cb-muted">
            <span class="capitalize">{{ user.role }}</span>
            <span v-if="user.averageRating > 0" class="flex items-center gap-0.5">
              <i class="fa-solid fa-star text-[9px] text-cb-warning"></i>
              {{ user.averageRating.toFixed(1) }}
            </span>
          </div>
        </div>

        <i class="fa-solid fa-chevron-right shrink-0 text-[11px] text-cb-muted"></i>
      </div>

      <!-- Load more -->
      <div v-if="hasMore" class="px-4 py-4 text-center sm:px-6">
        <button
          @click="loadMore"
          :disabled="loading"
          class="inline-flex items-center gap-2 rounded-xl border border-cb-divider bg-cb-card px-4 py-2 text-sm font-semibold text-cb-muted transition-colors hover:bg-cb-field disabled:opacity-60"
        >
          <i v-if="loading" class="fa-solid fa-spinner fa-spin text-xs"></i>
          Load more
        </button>
      </div>
    </div>
  </div>
</div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { debounce } from '@/utils/debounce'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const router = useRouter()
const userStore = useUserStore()

const inputRef = ref(null)
const query = ref('')
const results = ref([])
const loading = ref(false)
const hasSearched = ref(false)
const currentPage = ref(1)
const hasMore = ref(false)

const filters = ref({ role: '', isStudent: false })

// ➕ NEW: Recent searches from store
const recentSearches = computed(() => userStore.recentSearches)

const debouncedSearch = debounce(() => {
  currentPage.value = 1
  doSearch(1)
}, 350)

function close() {
  emit('update:modelValue', false)
}

function clearSearch() {
  query.value = ''
  results.value = []
  hasSearched.value = false
  currentPage.value = 1
  hasMore.value = false
}

function getInitials(user) {
  const name = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`
  return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
}

async function doSearch(page = 1) {
  if (!query.value.trim() && !filters.value.role && !filters.value.isStudent) return

  loading.value = true
  hasSearched.value = true

  try {
    const params = {
      query: query.value.trim() || undefined,
      page,
      limit: 10,
    }
    if (filters.value.role)      params.role      = filters.value.role
    if (filters.value.isStudent) params.isStudent  = true

    const res = await userStore.searchUsers(params)
    const items = res?.data?.data?.users ?? res?.data?.users ?? res?.data ?? []
    const meta  = res?.data?.meta ?? res?.meta

    if (page === 1) {
      results.value = items
    } else {
      results.value.push(...items)
    }

    currentPage.value = page
    hasMore.value = meta ? page < meta.totalPages : false
  } catch {
    // silent — empty state shown
  } finally {
    loading.value = false
  }
}

function resetAndSearch() {
  currentPage.value = 1
  results.value = []
  doSearch(1)
}

function loadMore() {
  doSearch(currentPage.value + 1)
}

function goToProfile(user) {
  if (!user.slug) return
  close()
  router.push({ name: 'ServiceProviderProfile', params: { identifier: user.slug } })
}

// ➕ NEW: Search from recent terms
function searchRecent(term) {
  query.value = term
  hasSearched.value = true
  currentPage.value = 1
  doSearch(1)
}

// ➕ NEW: Clear all recent searches
async function handleClearRecent() {
  try {
    await userStore.clearRecentSearches()
  } catch {
    // silent
  }
}

// ➕ NEW: Fetch recent searches when modal opens
async function loadRecentSearches() {
  try {
    await userStore.fetchRecentSearches()
  } catch {
    // silent — recent searches are optional
  }
}

// Auto-focus input when modal opens
watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      await nextTick()
      inputRef.value?.focus()
      // Load recent searches
      loadRecentSearches()
    } else {
      // Reset state on close
      clearSearch()
      filters.value = { role: '', isStudent: false }
    }
  },
)
</script>

<style scoped>
.search-modal-enter-active {
  transition: opacity 0.18s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.search-modal-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}
.search-modal-enter-from {
  opacity: 0;
  transform: scale(0.98) translateY(-6px);
}
.search-modal-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(-4px);
}

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>