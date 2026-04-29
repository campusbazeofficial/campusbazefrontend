<!-- src/pages/user/ErrandPaymentCallback.vue -->
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
        <p class="text-sm text-cb-muted">
          Securing your escrow. The runner will be notified once confirmed.
        </p>
        <p class="mt-3 text-xs text-cb-muted-40">This usually takes a few seconds.</p>
      </template>

      <!-- Success -->
      <template v-else-if="state === 'success'">
        <div class="mb-5 flex justify-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-cb-positive/10">
            <i class="fa-solid fa-shield-check text-4xl text-cb-positive"></i>
          </div>
        </div>
        <h2 class="mb-2 text-xl font-bold text-cb-text">Escrow secured!</h2>
        <p class="mb-1 text-sm text-cb-muted">
          Payment confirmed. The runner can now
          <span class="font-semibold text-cb-accent">start your errand</span>.
        </p>
        <p v-if="reference" class="mb-6 font-mono text-xs text-cb-muted-40">
          Ref: {{ reference }}
        </p>
        <div class="space-y-2">
          <button
            class="w-full rounded-xl bg-cb-accent py-3 text-sm font-bold text-cb-contrast transition-all hover:bg-cb-accent-dark"
            @click="goToErrands"
          >
            <i class="fa-solid fa-clipboard-list mr-2 text-xs"></i>
            View My Errands
          </button>
          <button
            class="w-full rounded-xl border border-cb-divider py-2.5 text-sm font-semibold text-cb-muted transition-colors hover:bg-cb-field hover:text-cb-text"
            @click="goToMarket"
          >
            Back to Marketplace
          </button>
        </div>
      </template>

      <!-- Still processing (webhook delay) -->
      <template v-else-if="state === 'pending'">
        <div class="mb-5 flex justify-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-cb-warning-subtle">
            <i class="fa-solid fa-hourglass-half text-3xl text-cb-warning"></i>
          </div>
        </div>
        <h2 class="mb-2 text-xl font-bold text-cb-text">Still processing…</h2>
        <p class="mb-2 text-sm text-cb-muted">
          Your payment was received but escrow confirmation is taking a little longer.
          The errand will activate automatically — no action needed.
        </p>
        <p v-if="reference" class="mb-6 font-mono text-xs text-cb-muted-40">
          Ref: {{ reference }}
        </p>
        <div class="space-y-2">
          <button
            class="w-full rounded-xl bg-cb-accent py-3 text-sm font-bold text-cb-contrast transition-all hover:bg-cb-accent-dark"
            @click="goToErrands"
          >
            <i class="fa-solid fa-clipboard-list mr-2 text-xs"></i>
            View My Errands
          </button>
          <button
            class="w-full rounded-xl border border-cb-divider py-2.5 text-sm font-semibold text-cb-muted transition-colors hover:bg-cb-field hover:text-cb-text"
            @click="startPolling"
          >
            <i class="fa-solid fa-rotate mr-2 text-xs"></i>
            Check Again
          </button>
        </div>
      </template>

      <!-- Error -->
      <template v-else-if="state === 'error'">
        <div class="mb-5 flex justify-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-cb-negative-subtle">
            <i class="fa-solid fa-circle-exclamation text-3xl text-cb-negative"></i>
          </div>
        </div>
        <h2 class="mb-2 text-xl font-bold text-cb-text">Something went wrong</h2>
        <p class="mb-6 text-sm text-cb-muted">
          {{ errorMessage || "We couldn't verify your payment. If you were charged, your errand will activate automatically — check My Errands." }}
        </p>
        <div class="space-y-2">
          <button
            class="w-full rounded-xl bg-cb-accent py-3 text-sm font-bold text-cb-contrast transition-all hover:bg-cb-accent-dark"
            @click="goToErrands"
          >
            Go to My Errands
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
import { useErrandStore } from '@/stores/errandStore'

const route       = useRoute()
const router      = useRouter()
const errandStore = useErrandStore()

// 'verifying' | 'success' | 'pending' | 'error'
const state        = ref('verifying')
const reference    = ref('')
const errorMessage = ref('')

// The errandId passed in the callback URL — used for a targeted fetch
const targetErrandId = ref('')

let pollInterval = null
let pollCount    = 0
const MAX_POLLS     = 20       // 20 × 3s = 60 seconds
const POLL_INTERVAL = 3000

/**
 * Check whether the target errand's escrow is confirmed.
 * Uses the specific errand if we have an ID (reliable).
 * Falls back to searching the whole posted list (legacy path).
 */
function checkEscrowConfirmed() {
  if (targetErrandId.value) {
    // Targeted check — look in current detail or any list
    const errand =
      (errandStore.current?._id === targetErrandId.value ? errandStore.current : null) ||
      [...(errandStore.posted ?? []), ...(errandStore.inProgress ?? []), ...(errandStore.running ?? [])]
        .find(e => e._id === targetErrandId.value);

    // Escrow explicitly confirmed OR errand moved past 'accepted' (runner started it)
    if (errand?.escrowConfirmed === true || errand?.status === 'in_progress') {
      stopPolling();
      state.value = 'success';
      // Refresh the posted list so MyErrandCard reflects the new state immediately
      errandStore.fetchMyPosted().catch(() => {});
      return true;
    }
    return false;
  }

  // Fallback: any errand with escrow confirmed or moved to in_progress
  const confirmed = [
    ...(errandStore.posted ?? []),
    ...(errandStore.inProgress ?? []),
    ...(errandStore.running ?? []),
  ].find(e => e.escrowConfirmed === true || e.status === 'in_progress');

  if (confirmed) {
    stopPolling();
    state.value = 'success';
    errandStore.fetchMyPosted().catch(() => {});
    return true;
  }
  return false;
}

async function pollOnce() {
  try {
    if (targetErrandId.value) {
      // Fetch the specific errand directly — most reliable
      await errandStore.fetchErrand(targetErrandId.value);
    } else {
      await errandStore.fetchMyPosted();
    }
    return checkEscrowConfirmed();
  } catch {
    return false;
  }
}

async function startPolling() {
  state.value = 'verifying';
  pollCount   = 0;

  // Check immediately with current store data
  if (checkEscrowConfirmed()) return;

  pollInterval = setInterval(async () => {
    pollCount++;
    const confirmed = await pollOnce();
    if (confirmed) return;

    if (pollCount >= MAX_POLLS) {
      stopPolling();
      state.value = 'pending';
    }
  }, POLL_INTERVAL);
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

function goToErrands() {
  router.push({ name: 'MyErrands' });
}

function goToMarket() {
  router.push({ name: 'ErrandMarket' });
}

onMounted(async () => {
  reference.value      = route.query.reference || route.query.trxref || '';
  targetErrandId.value = route.query.errandId  || '';

  // Fetch fresh data for the target errand (or full posted list as fallback)
  try {
    if (targetErrandId.value) {
      await errandStore.fetchErrand(targetErrandId.value);
    } else {
      await errandStore.fetchMyPosted();
    }
  } catch {
    // Continue to polling even if initial fetch fails
  }

  startPolling();
});

onUnmounted(stopPolling);
</script>