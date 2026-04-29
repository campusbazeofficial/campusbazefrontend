<template>
  <div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-cb-divider bg-cb-card px-4 py-16 text-center">
    <div class="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-cb-accent-subtle">
      <i class="fa-solid fa-box-open text-3xl text-cb-accent-muted"></i>
    </div>
    <h3 class="mb-2 text-lg font-bold text-cb-text">No matching errands</h3>
    <p class="mb-6 max-w-sm text-sm text-cb-muted">
      Try adjusting your search or filters to find more opportunities.
    </p>

    <template v-if="hasActiveFilters">
      <p class="mb-3 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">
        Try popular categories
      </p>
      <div class="mb-6 flex flex-wrap justify-center gap-2">
        <button
          v-for="cat in POPULAR_CATEGORIES"
          :key="cat.value"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full border border-cb-divider bg-cb-base px-3.5 py-2 text-xs font-medium text-cb-muted transition-all hover:border-cb-accent-muted hover:bg-cb-accent-subtle hover:text-cb-accent"
          @click="$emit('category', cat.value)"
        >
          <i :class="[cat.icon, 'text-[10px]']"></i>
          {{ cat.label }}
        </button>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-xl bg-cb-accent px-5 py-2.5 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark"
        @click="$emit('clear')"
      >
        <i class="fa-solid fa-rotate-left text-xs"></i>
        Clear all filters
      </button>
    </template>

    <button
      v-else
      type="button"
      class="inline-flex items-center gap-2 rounded-xl bg-cb-accent px-5 py-2.5 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark"
      @click="$emit('navigate', 'post-errand')"
    >
      <i class="fa-solid fa-plus text-xs"></i>
      Post the first errand
    </button>
  </div>
</template>

<script setup>
import { CATEGORIES } from '@/utils/categories'

const POPULAR_CATEGORIES = CATEGORIES.filter(c => c.value).slice(0, 5)

defineProps({
  hasActiveFilters: { type: Boolean, default: false },
})
defineEmits(['clear', 'navigate', 'category'])
</script>