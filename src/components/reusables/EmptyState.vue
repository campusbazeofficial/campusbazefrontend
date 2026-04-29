<!-- src/components/reusables/EmptyState.vue -->
<template>
  <div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-cb-divider bg-cb-card px-4 py-14 text-center sm:py-16">
    <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cb-accent-subtle sm:h-16 sm:w-16">
      <i :class="[icon, 'text-xl text-cb-accent-muted sm:text-2xl']"></i>
    </div>
    <h3 class="mb-1.5 text-sm font-bold text-cb-text sm:text-base">{{ title }}</h3>
    <p class="mb-6 max-w-xs text-xs leading-relaxed text-cb-muted sm:text-sm">{{ description }}</p>
    <router-link
      v-if="cta"
      :to="cta.to"
      class="inline-flex items-center gap-2 rounded-xl bg-cb-accent px-4 py-2.5 text-xs font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark hover:shadow-lg hover:shadow-cb-accent/25 sm:px-5 sm:text-sm"
    >
      <i :class="[cta.icon, 'text-[10px] sm:text-xs']"></i>
      {{ cta.label }}
    </router-link>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  cta: { type: Object, default: null }, // { label, to, icon }
})
</script>