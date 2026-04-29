<template>
  <div
    class="fixed inset-0 z-300 flex items-end justify-center bg-cb-overlay p-0 backdrop-blur-sm sm:items-center sm:p-4"
    @click.self="$emit('close')"
  >
    <div class="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl bg-cb-base shadow-2xl sm:max-w-md sm:rounded-2xl">
      <!-- Mobile handle -->
      <div class="flex justify-center pb-1 pt-3 sm:hidden">
        <div class="h-1 w-10 rounded-full bg-cb-divider"></div>
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between border-b border-cb-divider px-6 py-4">
        <div>
          <h3 class="flex items-center gap-2 text-base font-bold text-cb-text">
            <i class="fa-solid fa-scale-balanced text-cb-warning"></i>
            Open Dispute
          </h3>
          <p class="mt-0.5 text-xs text-cb-muted">Report an issue with this errand</p>
        </div>
        <button
          @click="$emit('close')"
          class="flex h-8 w-8 items-center justify-center rounded-lg text-cb-muted transition-colors hover:bg-cb-field hover:text-cb-text"
        >
          <i class="fa-solid fa-times text-sm"></i>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <div v-if="errand" class="mb-4 rounded-xl border border-cb-divider bg-cb-card p-3.5">
          <p class="line-clamp-1 text-sm font-bold text-cb-text">{{ errand.title }}</p>
          <p class="text-xs text-cb-muted">Status: {{ statusLabel }}</p>
        </div>

        <!-- Warning -->
        <div class="mb-4 flex items-start gap-2.5 rounded-xl border border-cb-warning/30 bg-cb-warning-subtle p-3">
          <i class="fa-solid fa-triangle-exclamation mt-0.5 shrink-0 text-sm text-cb-warning"></i>
          <p class="text-xs text-cb-warning">
            Opening a dispute will freeze the errand. Our support team will review the case within 24-48 hours.
          </p>
        </div>

        <!-- Status guard: dispute only allowed on in_progress or completed -->
        <div
          v-if="errand && !['in_progress', 'completed'].includes(errand.status)"
          class="mb-4 flex items-start gap-2.5 rounded-xl border border-cb-negative/30 bg-cb-negative-subtle p-3"
        >
          <i class="fa-solid fa-circle-exclamation mt-0.5 shrink-0 text-sm text-cb-negative"></i>
          <p class="text-xs text-cb-negative">
            Disputes can only be raised on errands that are <strong>in progress</strong> or <strong>awaiting confirmation</strong>. This errand is currently <strong>{{ statusLabel }}</strong>.
          </p>
        </div>

        <!-- Reason selection -->
        <div class="mb-4">
          <label class="mb-2 block text-xs font-semibold text-cb-text">
            Reason for dispute <span class="text-cb-negative">*</span>
          </label>
          <div class="space-y-2">
            <label
              v-for="option in disputeReasons"
              :key="option.value"
              class="flex items-start gap-3 rounded-xl border p-3 transition-colors cursor-pointer"
              :class="[
                selectedReason === option.value
                  ? 'border-cb-accent bg-cb-accent-subtle'
                  : 'border-cb-divider bg-cb-card hover:bg-cb-field',
              ]"
            >
              <input
                type="radio"
                :value="option.value"
                v-model="selectedReason"
                class="mt-0.5 h-4 w-4 accent-cb-accent"
              />
              <div>
                <p class="text-sm font-semibold text-cb-text">{{ option.label }}</p>
                <p class="text-xs text-cb-muted">{{ option.description }}</p>
              </div>
            </label>
          </div>
          <p v-if="error && !selectedReason" class="mt-2 text-xs text-cb-negative">{{ error }}</p>
        </div>

        <!-- Additional details -->
        <div>
          <label class="mb-2 block text-xs font-semibold text-cb-text">
            Additional details <span class="text-cb-negative">*</span>
          </label>
          <textarea
            v-model="details"
            rows="4"
            maxlength="1000"
            placeholder="Please provide specific details about the issue..."
            :class="[
              'w-full resize-none rounded-xl border bg-cb-card px-3.5 py-3 text-sm text-cb-text outline-none transition-colors placeholder:text-cb-muted-40',
              error && !details.trim()
                ? 'border-cb-negative/50 bg-cb-negative-subtle'
                : 'border-cb-divider focus:border-cb-accent',
            ]"
          ></textarea>
          <p class="mt-1 text-right text-[10px] text-cb-muted-40">{{ details.length }}/1000</p>
        </div>

        <!-- Store error -->
        <div
          v-if="relevantStoreError"
          class="mt-4 flex items-start gap-2.5 rounded-xl border border-cb-negative/30 bg-cb-negative-subtle p-3"
        >
          <i class="fa-solid fa-circle-exclamation mt-0.5 shrink-0 text-sm text-cb-negative"></i>
          <p class="text-xs text-cb-negative">{{ relevantStoreError }}</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex gap-3 border-t border-cb-divider bg-cb-card/30 px-6 py-4">
        <button
          @click="$emit('close')"
          class="flex-1 rounded-xl border border-cb-divider bg-cb-card px-4 py-3 text-sm font-semibold text-cb-text transition-colors hover:bg-cb-field"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          :disabled="loading || (errand && !['in_progress', 'completed'].includes(errand.status))"
          class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-warning px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
        >
          <i v-if="loading" class="fa-solid fa-spinner fa-spin text-xs"></i>
          <i v-else class="fa-solid fa-scale-balanced text-xs"></i>
          Submit dispute
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getStatusConfig } from '@/constants/errandStatus'

const props = defineProps({
  errand: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  storeError: { type: String, default: '' },
})

const emit = defineEmits(['confirm', 'close'])

const selectedReason = ref('')
const details = ref('')
const error = ref('')

// Only show storeError if it's a dispute-related error (not a stale fetch error)
const relevantStoreError = computed(() => {
  if (!props.storeError) return ''
  const lower = props.storeError.toLowerCase()
  if (lower.includes('fetch') || lower.includes('load') || lower.includes('errands')) return ''
  return props.storeError
})

const disputeReasons = [
  {
    value: 'runner_not_responding',
    label: 'Runner not responding',
    description: 'The runner is unresponsive or not communicating',
  },
  {
    value: 'poster_not_responding',
    label: 'Poster not responding',
    description: 'The poster is unresponsive or not communicating',
  },
  {
    value: 'quality_issue',
    label: 'Quality issue',
    description: 'The work completed does not meet expectations',
  },
  {
    value: 'payment_issue',
    label: 'Payment issue',
    description: 'Issue with payment or escrow release',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Another issue not listed above',
  },
]

const statusLabel = computed(() => {
  return getStatusConfig(props.errand?.status).label
})

function handleSubmit() {
  error.value = ''
  
  if (!selectedReason.value) {
    error.value = 'Please select a reason for the dispute'
    return
  }
  
  if (!details.value.trim() || details.value.trim().length < 10) {
    error.value = 'Please provide at least 10 characters of detail'
    return
  }

  const reasonText = disputeReasons.find(r => r.value === selectedReason.value)?.label
  const fullReason = `${reasonText}: ${details.value}`
  
  emit('confirm', fullReason)
}
</script>