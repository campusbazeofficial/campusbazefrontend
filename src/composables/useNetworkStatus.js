// src/composables/useNetworkStatus.js
import { ref, onMounted, onUnmounted } from 'vue'

const isOnline = ref(navigator.onLine)

function updateStatus() {
  isOnline.value = navigator.onLine
}

export function useNetworkStatus() {
  onMounted(() => {
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)
  })

  onUnmounted(() => {
    window.removeEventListener('online', updateStatus)
    window.removeEventListener('offline', updateStatus)
  })

  return {
    isOnline,
  }
}