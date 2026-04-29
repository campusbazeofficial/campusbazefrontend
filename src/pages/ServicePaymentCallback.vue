<!-- src/pages/ServicePaymentCallback.vue -->
<template>
  <div class="flex min-h-screen items-center justify-center bg-cb-base px-4">
    <div class="w-full max-w-sm rounded-2xl border border-cb-divider bg-cb-card p-8 text-center">

      <!-- Verifying / Polling -->
      <template v-if="state === 'verifying'">
        <div class="mb-5 flex justify-center">
          <svg class="h-12 w-12 animate-spin text-cb-accent" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <h2 class="mb-2 text-lg font-bold text-cb-text">Confirming payment…</h2>
        <p class="text-sm text-cb-muted">Please wait while we confirm your transaction with the seller.</p>
        <p class="mt-3 text-xs text-cb-muted-40">This usually takes a few seconds.</p>
      </template>

      <!-- Success -->
      <template v-else-if="state === 'success'">
        <div class="mb-5 flex justify-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-cb-positive/10">
            <i class="fa-solid fa-circle-check text-4xl text-cb-positive"></i>
          </div>
        </div>
        <h2 class="mb-2 text-xl font-bold text-cb-text">Payment confirmed!</h2>
        <p class="mb-1 text-sm text-cb-muted">
          Your order is now
          <span class="font-semibold text-cb-accent">In Progress</span>.
          The seller has been notified and will begin work shortly.
        </p>
        <p v-if="reference" class="mb-6 font-mono text-xs text-cb-muted-40">
          Ref: {{ reference }}
        </p>
        <div class="space-y-2">
          <button
            class="w-full rounded-xl bg-cb-accent py-3 text-sm font-bold text-cb-contrast transition-all hover:bg-cb-accent-dark"
            @click="goToOrders"
          >
            <i class="fa-solid fa-briefcase mr-2 text-xs"></i>
            View My Orders
          </button>
          <button
            class="w-full rounded-xl border border-cb-divider py-2.5 text-sm font-semibold text-cb-muted transition-colors hover:bg-cb-field hover:text-cb-text"
            @click="goToMarketplace"
          >
            Back to Marketplace
          </button>
        </div>
      </template>

      <!-- Taking longer than expected (webhook delay) -->
      <template v-else-if="state === 'pending'">
        <div class="mb-5 flex justify-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-cb-warning-subtle">
            <i class="fa-solid fa-hourglass-half text-3xl text-cb-warning"></i>
          </div>
        </div>
        <h2 class="mb-2 text-xl font-bold text-cb-text">Still processing…</h2>
        <p class="mb-2 text-sm text-cb-muted">
          Your payment was received but confirmation is taking longer than usual.
          Your order will activate automatically once confirmed — no action needed.
        </p>
        <p v-if="reference" class="mb-6 font-mono text-xs text-cb-muted-40">
          Ref: {{ reference }}
        </p>
        <div class="space-y-2">
          <button
            class="w-full rounded-xl bg-cb-accent py-3 text-sm font-bold text-cb-contrast transition-all hover:bg-cb-accent-dark"
            @click="goToOrders"
          >
            <i class="fa-solid fa-briefcase mr-2 text-xs"></i>
            View My Orders
          </button>
          <button
            class="w-full rounded-xl border border-cb-divider py-2.5 text-sm font-semibold text-cb-muted transition-colors hover:bg-cb-field hover:text-cb-text"
            @click="pollOnce"
          >
            <i class="fa-solid fa-rotate mr-2 text-xs"></i>
            Check Again
          </button>
        </div>
      </template>

      <!-- Error (no reference in URL or network failure) -->
      <template v-else-if="state === 'error'">
        <div class="mb-5 flex justify-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-cb-negative-subtle">
            <i class="fa-solid fa-circle-exclamation text-3xl text-cb-negative"></i>
          </div>
        </div>
        <h2 class="mb-2 text-xl font-bold text-cb-text">Something went wrong</h2>
        <p class="mb-6 text-sm text-cb-muted">
          {{ errorMessage || "We couldn't verify your payment. If you were charged, your order will activate automatically — check My Services." }}
        </p>
        <div class="space-y-2">
          <button
            class="w-full rounded-xl bg-cb-accent py-3 text-sm font-bold text-cb-contrast transition-all hover:bg-cb-accent-dark"
            @click="goToOrders"
          >
            Go to My Services
          </button>
          <button
            class="w-full rounded-xl border border-cb-divider py-2.5 text-sm font-semibold text-cb-muted transition-colors hover:bg-cb-field hover:text-cb-text"
            @click="startPolling"
          >
            Retry
          </button>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useServiceStore } from '@/stores/serviceStore'

const route = useRoute()
const router = useRouter()
const serviceStore = useServiceStore()

// 'verifying' | 'success' | 'pending' | 'error'
const state = ref('verifying')
const reference = ref('')
const errorMessage = ref('')

let pollInterval = null
let pollCount = 0
const MAX_POLLS = 10      // 10 attempts
const POLL_INTERVAL = 3000 // every 3 seconds = 30s total

/**
 * Find the order that matches this Paystack reference.
 * The backend stores the reference as escrowReference on the order.
 */
function findMatchingOrder(ref) {
  return serviceStore.buyingOrders.find(
    (o) => o.escrowReference === ref || o.escrowReference?.includes(ref),
  ) ?? null
}

/** Check current buyingOrders for a matching in_progress order. */
function checkOrders() {
  const ref = reference.value
  if (!ref) return false

  const order = findMatchingOrder(ref)

  if (!order) {
    // Order not found yet — might not be in the store, keep polling
    return false
  }

  if (order.status === 'in_progress') {
    stopPolling()
    state.value = 'success'
    return true
  }

  if (order.status === 'pending_payment') {
    // Webhook hasn't fired yet — keep waiting
    return false
  }

  // Any other status (completed, cancelled, etc.) means we're done
  stopPolling()
  state.value = 'success'
  return true
}

async function pollOnce() {
  try {
    await serviceStore.silentRefreshOrders({ buying: true })
    return checkOrders()
  } catch {
    return false
  }
}

async function startPolling() {
  state.value = 'verifying'
  pollCount = 0

  // Check immediately with whatever is already in the store
  if (checkOrders()) return

  // Then keep polling until confirmed or timeout
  pollInterval = setInterval(async () => {
    pollCount++

    const confirmed = await pollOnce()
    if (confirmed) return

    if (pollCount >= MAX_POLLS) {
      stopPolling()
      // Payment was likely received — webhook may still be in flight
      state.value = 'pending'
    }
  }, POLL_INTERVAL)
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

function goToOrders() {
  router.push({ name: 'MyServices' })
}

function goToMarketplace() {
  router.push({ name: 'Services' })
}

onMounted(async () => {
  // Paystack appends ?reference=xxx&trxref=xxx to the callback URL
  const ref = route.query.reference || route.query.trxref || ''

  if (!ref) {
    state.value = 'error'
    errorMessage.value = 'No payment reference found in the URL.'
    return
  }

  reference.value = ref

  // Fetch fresh buying orders first, then start polling
  try {
    await serviceStore.fetchBuyingOrders()
  } catch {
    // If fetch fails, still try to check what's in the store
  }

  startPolling()
})

onUnmounted(stopPolling)
</script>