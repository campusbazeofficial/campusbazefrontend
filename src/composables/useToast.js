// src/composables/useToast.js
import { ref } from 'vue'

const toasts = ref([])
let counter = 0

// anti-spam controls
let lastToastSignature = null
let lastToastTime = 0

function dismiss(id) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

function add(type, message, duration = 4000) {
  const now = Date.now()

  // create signature for deduplication
  const signature = `${type}:${message}`

  // prevent exact duplicates (common in API retry loops)
  if (lastToastSignature === signature && now - lastToastTime < 2500) {
    return
  }

  lastToastSignature = signature
  lastToastTime = now

  const id = ++counter

  toasts.value.push({
    id,
    type,
    message,
  })

  setTimeout(() => dismiss(id), duration)
}

export function useToast() {
  return {
    toasts,
    dismiss,
    success: (msg) => add('success', msg),
    error: (msg) => add('error', msg),
    warning: (msg) => add('warning', msg),
    info: (msg) => add('info', msg),
  }
}