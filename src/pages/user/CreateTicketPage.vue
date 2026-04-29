<template>
  <div class="min-h-screen bg-cb-base">

    <!-- ── Header ──────────────────────────────────────────── -->
    <header class="sticky -top-8 z-10  bg-cb-base/95 backdrop-blur-sm">
      <div class="mx-auto flex max-w-7xl items-center gap-3  py-3 ">
        <button
          @click="handleBack"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cb-divider bg-cb-card text-cb-muted transition-colors hover:bg-cb-field hover:text-cb-text"
          aria-label="Go back"
        >
          <i class="fa-solid fa-arrow-left text-sm"></i>
        </button>
        <div class="flex-1">
          <h1 class="text-base font-bold text-cb-text">New Support Ticket</h1>
          <p class="text-[11px] text-cb-muted">Step {{ step }} of 3 [ <span class="text-cb-accent">{{ stepLabel }}</span> ]</p>
        </div>
      </div>

      <!-- Step progress bar -->
      <!-- <div class="h-0.5 bg-cb-divider">
        <div
          class="h-full bg-cb-accent transition-all duration-300"
          :style="{ width: `${(step / 3) * 100}%` }"
        ></div>
      </div> -->
    </header>

    <!-- ── Loading categories ───────────────────────────────── -->
    <div v-if="supportStore.categoriesLoading || initializing" class="flex flex-col items-center justify-center py-24">
      <i class="fa-solid fa-spinner fa-spin text-2xl text-cb-accent"></i>
      <p class="mt-3 text-sm text-cb-muted">Loading options…</p>
    </div>

    <div v-else class="mx-auto max-w-7xl py-6 ">

      <!-- ══ STEP 1 — Category ════════════════════════════════ -->
      <Transition name="step" mode="out-in">
        <div v-if="step === 1" key="step1">
          <h2 class="mb-1.5 text-lg font-bold text-cb-text">What can we help you with?</h2>
          <p class="mb-5 text-sm text-cb-muted">Choose the area that best describes your issue.</p>

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <button
              v-for="cat in supportStore.categories"
              :key="cat.value"
              @click="selectCategory(cat)"
              :class="[
                'group flex flex-col items-center gap-2.5 rounded-2xl p-4 text-center transition-all duration-150 sm:p-5',
                selectedCategory?.value === cat.value
                  ? 'border-cb-accent bg-cb-accent-subtle'
                  : 'border-cb-divider bg-cb-card hover:border-cb-accent/40 hover:bg-cb-field',
              ]"
            >
              <div :class="[
                'flex h-11 w-11 items-center justify-center rounded-xl text-lg transition-colors',
                selectedCategory?.value === cat.value
                  ? 'bg-cb-accent text-cb-contrast'
                  : 'bg-cb-field text-cb-muted group-hover:bg-cb-accent-subtle group-hover:text-cb-accent',
              ]">
                <i :class="getCategoryIcon(cat.value)"></i>
              </div>
              <div>
                <p :class="['text-sm font-semibold leading-tight', selectedCategory?.value === cat.value ? 'text-cb-accent' : 'text-cb-text']">
                  {{ cat.label }}
                </p>
                <p class="mt-0.5 text-[11px] leading-tight text-cb-muted">
                  {{ cat.types?.length ?? 0 }} issue types
                </p>
              </div>
            </button>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              @click="step = 2"
              :disabled="!selectedCategory"
              class="flex items-center gap-2 rounded-xl bg-cb-accent px-6 py-2.5 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue <i class="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </div>
        </div>
      </Transition>

      <!-- ══ STEP 2 — Issue type ══════════════════════════════ -->
      <Transition name="step" mode="out-in">
        <div v-if="step === 2" key="step2">
          <div class="mb-5 flex items-center gap-2">
            <div :class="['flex h-8 w-8 items-center justify-center rounded-lg text-sm', 'bg-cb-accent-subtle text-cb-accent']">
              <i :class="getCategoryIcon(selectedCategory?.value)"></i>
            </div>
            <h2 class="text-lg font-bold text-cb-text">{{ selectedCategory?.label }}</h2>
          </div>
          <p class="mb-4 text-sm text-cb-muted">What specifically is the issue?</p>

          <div class="space-y-2.5">
            <button
              v-for="type in currentTypes"
              :key="type.value"
              @click="selectType(type)"
              :class="[
                'group w-full rounded-2xl  p-4 text-left transition-all duration-150',
                selectedType?.value === type.value
                  ? 'border-cb-accent bg-cb-accent-subtle'
                  : 'border-cb-divider bg-cb-card hover:border-cb-accent/40',
              ]"
            >
              <div class="flex items-start gap-3">
                <!-- Radio indicator -->
                <div :class="[
                  'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                  selectedType?.value === type.value ? 'border-cb-accent bg-cb-accent' : 'border-cb-divider',
                ]">
                  <div v-if="selectedType?.value === type.value" class="h-1.5 w-1.5 rounded-full bg-cb-contrast"></div>
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <p :class="['text-sm font-semibold', selectedType?.value === type.value ? 'text-cb-accent' : 'text-cb-text']">
                      {{ type.label }}
                    </p>
                    <!-- Auto-priority badge -->
                    <span v-if="type.priority" :class="['rounded-full px-1.5 py-0.5 text-[10px] font-semibold', priorityClass(type.priority)]">
                      {{ capitalize(type.priority) }}
                    </span>
                  </div>
                  <p v-if="type.descriptionTemplate" class="mt-1 line-clamp-2 text-xs leading-relaxed text-cb-muted">
                    {{ type.descriptionTemplate }}
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div class="mt-6 flex items-center justify-between gap-3">
            <button @click="step = 1" class="flex items-center gap-2 rounded-xl border border-cb-divider bg-cb-card px-5 py-2.5 text-sm font-semibold text-cb-text hover:bg-cb-field">
              <i class="fa-solid fa-arrow-left text-xs"></i> Back
            </button>
            <button
              @click="step = 3"
              :disabled="!selectedType"
              class="flex items-center gap-2 rounded-xl bg-cb-accent px-6 py-2.5 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue <i class="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </div>
        </div>
      </Transition>

      <!-- ══ STEP 3 — Description + submit ════════════════════ -->
      <Transition name="step" mode="out-in">
        <div v-if="step === 3" key="step3">
          <!-- Summary card -->
          <div class="mb-5 rounded-2xl  bg-cb-card p-4">
            <p class="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">Your selection</p>
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-cb-accent-subtle px-2.5 py-1 text-xs font-semibold text-cb-accent">
                <i :class="getCategoryIcon(selectedCategory?.value)"></i>
                {{ selectedCategory?.label }}
              </span>
              <i class="fa-solid fa-chevron-right text-[10px] text-cb-muted-40"></i>
              <span class="inline-flex items-center gap-1.5 rounded-full border border-cb-divider bg-cb-field px-2.5 py-1 text-xs font-semibold text-cb-text">
                {{ selectedType?.label }}
              </span>
              <span v-if="selectedType?.priority" :class="['ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold', priorityClass(selectedType.priority)]">
                {{ capitalize(selectedType.priority) }} priority
              </span>
            </div>
          </div>

          <!-- Description -->
          <div class="mb-4">
            <label class="mb-2 flex items-center justify-between">
              <span class="text-sm font-semibold text-cb-text">Describe your issue</span>
              <span class="text-[11px] text-cb-muted-40">{{ description.length }}/2000</span>
            </label>
            <textarea
              v-model="description"
              rows="7"
              maxlength="2000"
              placeholder="Describe what happened and any relevant details…"
              class="w-full resize-none rounded-2xl border border-cb-divider bg-cb-card p-4 text-sm leading-relaxed text-cb-text placeholder:text-cb-muted focus:border-cb-accent focus:outline-none"
            ></textarea>
          </div>

          <!-- Optional related ID -->
          <div class="mb-6">
            <label class="mb-2 block text-sm font-semibold text-cb-text">
              Related item ID
              <span class="ml-1 font-normal text-cb-muted">(optional)</span>
            </label>
           <div class="bg-cb-field rounded-md ">
             <input
              v-model="relatedId"
              type="text"
              placeholder="e.g. errand ID, order ID, transaction ID…"
              class="w-full rounded-xl border border-cb-divider bg-cb-card px-4 py-2.5 text-sm text-cb-text placeholder:text-cb-muted focus:border-cb-accent focus:outline-none"
            />
           </div>
            <p class="mt-1.5 text-xs text-cb-muted">
              If your issue relates to a specific errand, order, or payment, paste its ID here to help us resolve it faster.
            </p>
          </div>

          <!-- Error -->
          <div v-if="submitError" class="mb-4 flex items-start gap-3 rounded-xl border border-cb-negative/20 bg-cb-negative-subtle p-3.5">
            <i class="fa-solid fa-circle-exclamation mt-0.5 shrink-0 text-sm text-cb-negative"></i>
            <p class="text-sm text-cb-negative">{{ submitError }}</p>
          </div>

          <div class="flex items-center justify-between gap-3">
            <button @click="step = 2" class="flex items-center gap-2 rounded-xl border border-cb-divider bg-cb-card px-5 py-2.5 text-sm font-semibold text-cb-text hover:bg-cb-field">
              <i class="fa-solid fa-arrow-left text-xs"></i> Back
            </button>
            <button
              @click="handleSubmit"
              :disabled="!description.trim() || submitting"
              class="flex items-center gap-2 rounded-xl bg-cb-accent px-6 py-2.5 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              <i v-if="submitting" class="fa-solid fa-spinner fa-spin text-xs"></i>
              <i v-else class="fa-solid fa-paper-plane text-xs"></i>
              {{ submitting ? 'Submitting…' : 'Submit Ticket' }}
            </button>
          </div>
        </div>
      </Transition>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSupportStore } from '@/stores/supportStore'

const route  = useRoute()
const router = useRouter()
const supportStore = useSupportStore()

// Read query params synchronously — before first render
const { category: qCategory, type: qType } = route.query
const hasPreSelection = !!(qCategory && qType)

// ── Form state ────────────────────────────────────────────────
// Initialize step immediately so there's no flash from step 1 → step 3
const step             = ref(hasPreSelection ? 3 : 1)
const initializing     = ref(hasPreSelection) // true while categories load + pre-selection applies
const selectedCategory = ref(null)
const selectedType     = ref(null)
const description      = ref('')
const relatedId        = ref('')
const submitError = ref('')
const submitting  = ref(false) // stays true until navigation completes — prevents double-tap

// ── Step labels ───────────────────────────────────────────────
const stepLabel = computed(() => {
  if (step.value === 1) return 'Choose category'
  if (step.value === 2) return 'Select issue type'
  return 'Describe your issue'
})

const currentTypes = computed(() =>
  selectedCategory.value
    ? supportStore.getTypesForCategory(selectedCategory.value.value)
    : []
)

// ── Category icons (client-side mapping, API may or may not include icons) ──
const CATEGORY_ICONS = {
  payment:    'fa-solid fa-credit-card',
  errand:     'fa-solid fa-box',
  order:      'fa-solid fa-bag-shopping',
  account:    'fa-solid fa-user',
  technical:  'fa-solid fa-wrench',
  other:      'fa-solid fa-ellipsis',
}
function getCategoryIcon(value) {
  return CATEGORY_ICONS[value] ?? 'fa-solid fa-circle-question'
}

// ── Priority display ──────────────────────────────────────────
const PRIORITY_CLS = {
  urgent: 'bg-cb-negative-subtle text-cb-negative',
  high:   'bg-cb-warning-subtle text-cb-warning',
  medium: 'bg-cb-accent-subtle text-cb-accent',
  low:    'bg-cb-field text-cb-muted',
}
function priorityClass(p) { return PRIORITY_CLS[p] ?? 'bg-cb-field text-cb-muted' }
function capitalize(s)    { return s ? s.charAt(0).toUpperCase() + s.slice(1) : '' }

// ── Navigation ────────────────────────────────────────────────
function handleBack() {
  if (step.value > 1) { step.value--; return }
  router.push({ name: 'Support' })
}

function selectCategory(cat) {
  selectedCategory.value = cat
  selectedType.value     = null
  description.value      = ''
}

function selectType(type) {
  selectedType.value = type
  // Pre-fill description with the template from the API
  if (type.descriptionTemplate) {
    description.value = type.descriptionTemplate
  }
}

// ── Submit ────────────────────────────────────────────────────
async function handleSubmit() {
  if (!description.value.trim() || submitting.value) return
  submitError.value = ''
  submitting.value  = true

  try {
    const result = await supportStore.createTicket({
      category:    selectedCategory.value.value,
      type:        selectedType.value.value,
      description: description.value.trim(),
      ...(relatedId.value.trim() ? { relatedId: relatedId.value.trim() } : {}),
    })

    // Response: { message, ticketNumber, ticketId, status, priority }
    // The ID field is ticketId, not _id
    const id = result.ticketId ?? result._id ?? result.id
    if (!id) throw new Error('No ticket ID returned')

    router.replace({ name: 'SupportTicket', params: { ticketId: id } })
    // don't reset submitting — we're navigating away
  } catch {
    submitError.value = supportStore.error || 'Failed to submit your ticket. Please try again.'
    submitting.value = false
  }
}

onMounted(async () => {
  await supportStore.fetchCategories()

  if (hasPreSelection && supportStore.categories.length) {
    const cat = supportStore.categories.find(c => c.value === qCategory)
    if (cat) {
      selectedCategory.value = cat
      const type = supportStore.getTypesForCategory(qCategory).find(t => t.value === qType)
      if (type) {
        selectedType.value = type
        if (type.descriptionTemplate) description.value = type.descriptionTemplate
        step.value = 3
      } else {
        step.value = 2
      }
    } else {
      step.value = 1
    }
  }

  // Reveal form — categories are loaded and pre-selection is applied
  initializing.value = false
})
</script>

<style scoped>
.step-enter-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.step-leave-active { transition: opacity 0.12s ease; }
.step-enter-from   { opacity: 0; transform: translateX(16px); }
.step-leave-to     { opacity: 0; }
</style>