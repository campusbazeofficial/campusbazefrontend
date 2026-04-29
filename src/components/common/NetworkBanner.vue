<!-- src/components/common/NetworkBanner.vue -->
<template>
  <Transition name="slide-down">
    <div
      v-if="!isOnline"
      class="
        fixed top-0 left-0 right-0 z-[600]
        bg-red-600 text-white
        text-sm font-medium
        px-4 py-2
        flex items-center justify-center
        shadow-md
      "
    >
      <i class="fa-solid fa-wifi mr-2"></i>
      You are offline. Some features may not work properly.
    </div>
  </Transition>
</template>

<script setup>
import { useNetworkStatus } from '@/composables/useNetworkStatus'

const { isOnline } = useNetworkStatus()
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>