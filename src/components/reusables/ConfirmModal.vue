<template>
  <div
    class="fixed inset-0 z-300 flex items-end justify-center bg-cb-overlay p-0 backdrop-blur-sm sm:items-center sm:p-4"
    @click.self="$emit('cancel')"
  >
    <div class="w-full overflow-hidden rounded-t-3xl bg-cb-base shadow-2xl sm:max-w-md sm:rounded-2xl">
      <!-- Mobile handle -->
      <div class="flex justify-center pb-1 pt-3 sm:hidden">
        <div class="h-1 w-10 rounded-full bg-cb-divider"></div>
      </div>

      <div class="px-6 py-5">
        <!-- <div :class="['mb-4 flex h-12 w-12 items-center justify-center rounded-2xl', iconBg]">
          <i :class="[iconClass, 'text-xl']"></i>
        </div> -->

        <h3 class="mb-2 text-lg font-bold text-cb-text">{{ title }}</h3>
        <p class="text-sm leading-relaxed text-cb-muted">{{ message }}</p>

        <!-- Optional extra content slot (e.g. notices, warnings) -->
        <slot name="extra" />

        <div class="mt-6 flex gap-3">
          <button
            @click="$emit('cancel')"
            class="flex-1 rounded-xl border border-cb-divider bg-cb-card px-4 py-3 text-sm font-semibold text-cb-text transition-colors hover:bg-cb-field"
          >
            Cancel
          </button>
          <button
            @click="$emit('confirm')"
            :disabled="loading"
            :class="[
              'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all disabled:opacity-60',
              confirmBtnClass,
            ]"
          >
            <i v-if="loading" class="fa-solid fa-spinner fa-spin text-xs"></i>
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title:       { type: String, required: true },
  message:     { type: String, required: true },
  confirmText: { type: String, default: 'Confirm' },
  variant:     { type: String, default: 'danger' },
  loading:     { type: Boolean, default: false },
})
defineEmits(['confirm', 'cancel'])

const iconBg = computed(() => ({
  danger:  'bg-cb-negative-subtle',
  success: 'bg-cb-accent-subtle',
  warning: 'bg-cb-warning-subtle',
}[props.variant] || 'bg-cb-field'))

const iconClass = computed(() => ({
  danger:  'fa-solid fa-triangle-exclamation text-cb-negative',
  success: 'fa-solid fa-circle-check text-cb-accent',
  warning: 'fa-solid fa-scale-balanced text-cb-warning',
}[props.variant] || 'fa-solid fa-question text-cb-muted'))

const confirmBtnClass = computed(() => ({
  danger:  'bg-cb-negative text-white hover:opacity-90',
  success: 'bg-cb-accent text-cb-contrast hover:bg-cb-accent-dark',
  warning: 'bg-cb-warning text-white hover:opacity-90',
}[props.variant] || 'bg-cb-text text-cb-base'))
</script>