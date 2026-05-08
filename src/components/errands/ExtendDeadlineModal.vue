<template>
  <div class="w-full max-w-md rounded-2xl bg-cb-card p-6 shadow-2xl">
    <h2 class="text-lg font-bold text-cb-text">Extend Deadline</h2>
    <p class="mt-1 text-sm text-cb-muted">
      Set a new deadline for "{{ errand?.title }}"
    </p>

    <form @submit.prevent="handleSubmit" class="mt-5 space-y-4">
      <!-- Date -->
      <div>
        <label class="mb-1.5 block text-xs font-semibold text-cb-muted">
          New Date <span class="text-cb-negative">*</span>
        </label>
        <input
          v-model="date"
          type="date"
          :min="minDate"
          required
          class="w-full rounded-xl border bg-cb-base px-3 py-2.5 text-sm text-cb-text focus:outline-none"
          :class="dateError ? 'border-cb-negative' : 'border-cb-divider focus:border-cb-accent'"
          @change="validateDate"
        />
        <p v-if="dateError" class="mt-1 text-[11px] text-cb-negative">
          {{ dateError }}
        </p>
      </div>

      <!-- Time -->
      <div>
        <label class="mb-1.5 block text-xs font-semibold text-cb-muted">
          New Time <span class="text-cb-negative">*</span>
        </label>
        <input
          v-model="time"
          type="time"
          required
          class="w-full rounded-xl border bg-cb-base px-3 py-2.5 text-sm text-cb-text focus:outline-none"
          :class="timeError ? 'border-cb-negative' : 'border-cb-divider focus:border-cb-accent'"
          @change="validateTime"
        />
        <p v-if="timeError" class="mt-1 text-[11px] text-cb-negative">
          {{ timeError }}
        </p>
        <p v-else class="mt-1 text-[11px] text-cb-muted-40">
          Select a time in the future
        </p>
      </div>

      <!-- Combined validation message -->
      <div 
        v-if="combinedError"
        class="flex items-start gap-2 rounded-xl border border-cb-negative/20 bg-cb-negative-subtle p-3"
      >
        <i class="fa-solid fa-circle-exclamation mt-0.5 shrink-0 text-xs text-cb-negative"></i>
        <p class="text-xs text-cb-negative">{{ combinedError }}</p>
      </div>

      <!-- Store error -->
      <div 
        v-if="storeError"
        class="flex items-start gap-2 rounded-xl border border-cb-negative/20 bg-cb-negative-subtle p-3"
      >
        <i class="fa-solid fa-circle-exclamation mt-0.5 shrink-0 text-xs text-cb-negative"></i>
        <p class="text-xs text-cb-negative">{{ storeError }}</p>
      </div>

      <!-- Old deadline info -->
      <div class="flex items-start gap-2 rounded-xl border border-cb-warning/20 bg-cb-warning-subtle/50 p-3">
        <!-- <i class="fa-solid fa-clock mt-0.5 shrink-0 text-xs text-cb-warning"></i> -->
        <div>
          <p class="text-xs font-semibold text-cb-warning">Previous Deadline</p>
          <p class="mt-0.5 text-xs text-cb-warning/80">
            {{ formatOldDeadline }}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 pt-2">
        <button
          type="button"
          @click="$emit('close')"
          :disabled="loading"
          class="flex-1 rounded-xl border border-cb-divider bg-cb-base py-2.5 text-sm font-semibold text-cb-muted transition-colors hover:bg-cb-field disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading || !isFormValid"
          class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-accent py-2.5 text-sm font-semibold text-cb-contrast transition-colors hover:bg-cb-accent-dark disabled:opacity-60"
        >
          <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-clock-rotate-left"></i>
          Extend Deadline
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  errand: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  storeError: { type: String, default: '' },
})

const emit = defineEmits(['close', 'confirm'])

const date = ref('')
const time = ref('')
const dateError = ref('')
const timeError = ref('')

// Get today's date in YYYY-MM-DD format for the min attribute
const minDate = computed(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

// Get current time in HH:MM format for comparison
const currentTime = computed(() => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
})

// Format the old deadline for display
const formatOldDeadline = computed(() => {
  if (!props.errand?.deadline) return 'Not set'
  const d = new Date(props.errand.deadline)
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// Combined datetime validation
const isDateTimeInFuture = computed(() => {
  if (!date.value || !time.value) return false
  
  const selectedDateTime = new Date(`${date.value}T${time.value}:00`)
  const now = new Date()
  
  return selectedDateTime > now
})

// Combined error message
const combinedError = computed(() => {
  if (!date.value && !time.value) return ''
  if (!date.value) return 'Please select a date'
  if (!time.value) return 'Please select a time'
  if (dateError.value || timeError.value) return ''
  if (date.value && time.value && !isDateTimeInFuture.value) {
    return 'The selected date and time must be in the future'
  }
  return ''
})

// Overall form validity
const isFormValid = computed(() => {
  return date.value && 
         time.value && 
         !dateError.value && 
         !timeError.value && 
         isDateTimeInFuture.value
})

// Validate date on change
function validateDate() {
  dateError.value = ''
  
  if (!date.value) {
    dateError.value = 'Please select a date'
    return
  }

  const selectedDate = new Date(date.value)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (selectedDate < today) {
    dateError.value = 'Date cannot be in the past'
    return
  }

  // If date is today, validate time as well
  if (selectedDate.getTime() === today.getTime() && time.value) {
    validateTime()
  }
}

// Validate time on change
function validateTime() {
  timeError.value = ''
  
  if (!time.value) {
    timeError.value = 'Please select a time'
    return
  }

  // Only validate time against current time if date is today
  if (date.value === minDate.value) {
    if (time.value <= currentTime.value) {
      timeError.value = 'Time must be in the future for today\'s date'
      return
    }
  }

  // Basic time format validation
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (!timeRegex.test(time.value)) {
    timeError.value = 'Please enter a valid time'
    return
  }
}

// Handle form submission
function handleSubmit() {
  // Final validation before emitting
  validateDate()
  validateTime()
  
  if (!isFormValid.value) return
  
  emit('confirm', {
    date: date.value,
    time: time.value,
  })
}
</script>