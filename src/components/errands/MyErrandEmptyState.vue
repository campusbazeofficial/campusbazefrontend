<template>
  <div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-cb-divider bg-cb-card px-4 py-16 text-center">
    <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cb-accent-subtle">
      <i :class="[icon, 'text-2xl text-cb-accent-muted']"></i>
    </div>
    <h3 class="mb-1.5 text-base font-bold text-cb-text">{{ title }}</h3>
    <p class="mb-6 max-w-xs text-sm text-cb-muted">{{ description }}</p>
    <router-link
      v-if="cta"
      :to="cta.to"
      class="inline-flex items-center gap-2 rounded-xl bg-cb-accent px-5 py-2.5 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark hover:shadow-lg hover:shadow-cb-accent/25"
    >
      <i :class="[cta.icon, 'text-xs']"></i>
      {{ cta.label }}
    </router-link>
  </div>
</template>

<script setup>
defineProps({
  icon:        { type: String, required: true },
  title:       { type: String, required: true },
  description: { type: String, required: true },
  cta:         { type: Object, default: null }, // { label, to, icon }
})
</script>