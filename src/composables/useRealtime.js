// src/composables/useRealtime.js
// ─────────────────────────────────────────────────────────────────────────────
// Vue composable that wraps socketService with:
//   - reactive isConnected / isConnecting state
//   - auto-cleanup of event listeners on component unmount
//
// Usage in a component:
//   const { isConnected, on, emit } = useRealtime()
//   on('wallet:updated', (data) => { ... })  // cleaned up automatically
// ─────────────────────────────────────────────────────────────────────────────

import { ref, onUnmounted } from 'vue'
import { socketService, SOCKET_EVENTS } from '@/services/socket'

export function useRealtime() {
  const isConnected  = ref(socketService.isConnected)
  const isConnecting = ref(socketService.isConnecting)

  // Track this component's listeners so we can remove them on unmount
  const _ownListeners = []

  // Sync reactive state with the service
  const unsubscribeConnectionChange = socketService.onConnectionChange((connected) => {
    isConnected.value  = connected
    isConnecting.value = !connected && socketService.isConnecting
  })

  /**
   * Subscribe to a socket event. Auto-removed when component unmounts.
   * @param {string}   event   - Use SOCKET_EVENTS.* constants
   * @param {Function} handler
   */
  function on(event, handler) {
    socketService.on(event, handler)
    _ownListeners.push({ event, handler })
  }

  /**
   * Emit an event to the server.
   */
  function emit(event, data) {
    socketService.emit(event, data)
  }

  onUnmounted(() => {
    _ownListeners.forEach(({ event, handler }) => socketService.off(event, handler))
    unsubscribeConnectionChange()
  })

  return {
    isConnected,
    isConnecting,
    on,
    emit,
    EVENTS: SOCKET_EVENTS,
  }
}