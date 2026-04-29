<template>
  <nav class="flex flex-wrap items-center justify-center gap-2 pt-2" aria-label="Pagination">
    <button
      :disabled="currentPage <= 1"
      @click="$emit('page', currentPage - 1)"
      class="flex h-10 w-10 items-center justify-center rounded-xl border border-cb-divider bg-cb-card text-cb-text transition-all hover:border-cb-accent hover:bg-cb-accent-subtle hover:text-cb-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-cb-divider disabled:hover:bg-cb-card disabled:hover:text-cb-text"
      aria-label="Previous page"
    >
      <i class="fa-solid fa-chevron-left text-xs"></i>
    </button>

    <div class="hidden items-center gap-1 sm:flex">
      <template v-for="(page, i) in visiblePages" :key="`${page}-${i}`">
        <span
          v-if="page === '...'"
          class="flex h-10 w-10 items-center justify-center text-cb-muted"
        >…</span>
        <button
          v-else
          @click="$emit('page', page)"
          :class="[
            'flex min-w-10 h-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition-all',
            page === currentPage
              ? 'border-cb-accent bg-cb-accent text-cb-contrast'
              : 'border-cb-divider bg-cb-card text-cb-text hover:border-cb-accent hover:bg-cb-accent-subtle hover:text-cb-accent',
          ]"
          :aria-current="page === currentPage ? 'page' : undefined"
        >
          {{ page }}
        </button>
      </template>
    </div>

    <button
      :disabled="currentPage >= totalPages"
      @click="$emit('page', currentPage + 1)"
      class="flex h-10 w-10 items-center justify-center rounded-xl border border-cb-divider bg-cb-card text-cb-text transition-all hover:border-cb-accent hover:bg-cb-accent-subtle hover:text-cb-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-cb-divider disabled:hover:bg-cb-card disabled:hover:text-cb-text"
      aria-label="Next page"
    >
      <i class="fa-solid fa-chevron-right text-xs"></i>
    </button>

    <span class="ml-2 text-xs font-medium text-cb-muted sm:hidden">
      Page {{ currentPage }} of {{ totalPages }}
    </span>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages:  { type: Number, required: true },
})
defineEmits(['page'])

const visiblePages = computed(() => {
  const total = props.totalPages
  const cur = props.currentPage
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (cur <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (cur >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', cur - 1, cur, cur + 1, '...', total]
})
</script>
