<template>
  <article
    class="group relative cursor-pointer rounded-2xl border border-cb-divider bg-cb-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-cb-accent-muted hover:shadow-lg hover:shadow-black/10 sm:p-5"
    @click="$emit('click', errand._id)"
  >
    <!-- Urgent stripe -->
    <span
      v-if="urgent"
      class="absolute inset-x-5 top-0 h-0.5 rounded-b bg-cb-warning"
      aria-hidden="true"
    ></span>

    <div class="flex flex-col gap-3">
      <!-- Top row -->
      <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex min-w-0 items-start gap-3 flex-1">
          <!-- Icon -->
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cb-accent-subtle sm:h-10 sm:w-10">
            <i :class="[categoryIcon, 'text-sm text-cb-accent']"></i>
          </div>

          <!-- Title + description -->
          <div class="min-w-0 flex-1">
            <h3 class="line-clamp-2 sm:line-clamp-1 text-sm font-semibold capitalize leading-snug text-cb-text transition-colors group-hover:text-cb-accent">
              {{ errand.title }}
            </h3>
            <p class="mt-0.5 line-clamp-2 sm:line-clamp-1 text-xs text-cb-muted">
              {{ errand.description }}
            </p>
          </div>
        </div>

        <!-- Status badge -->
        <span
          :class="['shrink-0 self-start sm:self-auto rounded-full px-2.5 py-1 text-[11px] font-semibold', statusClass]"
        >
          {{ statusLabel }}
        </span>
      </div>

      <!-- Meta row -->
      <div class="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-4">
        <span class="inline-flex items-center gap-1.5 text-xs text-cb-muted">
          <i class="fa-solid fa-location-dot text-[10px] text-cb-muted-40"></i>
          <span class="max-w-[200px] truncate">{{ errand.address }}</span>
        </span>

        <span
          :class="['inline-flex items-center gap-1.5 text-xs', urgent ? 'text-cb-warning' : 'text-cb-muted']"
        >
          <i class="fa-regular fa-clock text-[10px]"></i>
          {{ deadlineLabel }}
        </span>

        <span class="inline-flex items-center gap-1.5 text-xs text-cb-muted">
          <i class="fa-solid fa-tag text-[10px] text-cb-muted-40"></i>
          {{ categoryLabel }}
        </span>
      </div>

      <!-- Footer -->
      <div
        class="flex flex-col gap-3 border-t border-cb-divider pt-3 sm:flex-row sm:items-center sm:justify-between"
        @click.stop
      >
        <!-- Budget -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-base font-semibold text-cb-text">
            ₦{{ errand.budget?.toLocaleString() }}
          </span>

          <span
            :class="[
              'rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
              errand.budgetType === 'fixed'
                ? 'bg-cb-warning-subtle text-cb-warning'
                : 'bg-cb-accent-subtle text-cb-accent'
            ]"
          >
            {{ errand.budgetType === 'fixed' ? 'Fixed' : 'Negotiable' }}
          </span>

          <span
            v-if="role === 'poster'"
            class="inline-flex items-center gap-1 text-xs text-cb-muted"
          >
            <i class="fa-solid fa-gavel text-[10px]"></i>
            {{ bidCount }} bid{{ bidCount !== 1 ? 's' : '' }}
          </span>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Poster actions -->
          <template v-if="role === 'poster'">
            <!-- Poster must pay -->
            <button
              v-if="errand.status === 'accepted' && !errand.escrowConfirmed"
              :disabled="actionLoading"
              class="inline-flex items-center gap-1.5 rounded-lg bg-cb-accent px-3 py-1.5 text-xs font-semibold text-cb-contrast transition-colors hover:bg-cb-accent-dark disabled:opacity-60"
              @click="$emit('pay', errand)"
            >
              <i class="fa-solid fa-lock text-[9px]"></i>
              Pay Now
            </button>

            <!-- Escrow confirmed -->
            <span
              v-else-if="errand.status === 'accepted' && errand.escrowConfirmed"
              class="inline-flex items-center gap-1.5 rounded-lg border border-cb-accent-muted bg-cb-accent-subtle px-3 py-1.5 text-xs font-semibold text-cb-accent"
            >
              <i class="fa-solid fa-shield-check text-[9px]"></i>
              Paid — awaiting start
            </span>

            <button
              v-else-if="errand.status === 'completed'"
              :disabled="actionLoading"
              class="inline-flex items-center gap-1.5 rounded-lg bg-cb-accent px-3 py-1.5 text-xs font-semibold text-cb-contrast transition-colors hover:bg-cb-accent-dark disabled:opacity-60"
              @click="$emit('confirm', errand)"
            >
              <i class="fa-solid fa-check text-[9px]"></i>
              Confirm
            </button>

            <button
              v-if="['accepted', 'in_progress', 'completed'].includes(errand.status)"
              class="flex h-8 w-8 items-center justify-center rounded-lg border border-cb-warning/30 bg-cb-warning-subtle text-cb-warning transition-colors hover:opacity-80"
              title="Open dispute"
              @click="$emit('dispute', errand)"
            >
              <i class="fa-solid fa-scale-balanced text-xs"></i>
            </button>

            <button
              v-if="errand.status === 'posted'"
              class="flex h-8 w-8 items-center justify-center rounded-lg border border-cb-negative/20 bg-cb-negative-subtle text-cb-negative transition-colors hover:opacity-80"
              title="Cancel errand"
              @click="$emit('cancel', errand)"
            >
              <i class="fa-solid fa-xmark text-xs"></i>
            </button>
          </template>

          <!-- Runner actions -->
          <template v-if="role === 'runner'">
            <button
              v-if="errand.status === 'accepted' && errand.escrowConfirmed"
              :disabled="actionLoading"
              class="inline-flex items-center gap-1.5 rounded-lg bg-cb-accent px-3 py-1.5 text-xs font-semibold text-cb-contrast transition-colors hover:bg-cb-accent-dark disabled:opacity-60"
              @click="$emit('start', errand)"
            >
              <i class="fa-solid fa-play text-[9px]"></i>
              Start
            </button>

            <span
              v-else-if="errand.status === 'accepted' && !errand.escrowConfirmed"
              class="inline-flex items-center gap-1.5 rounded-lg border border-cb-warning/30 bg-cb-warning-subtle px-3 py-1.5 text-xs font-semibold text-cb-warning"
            >
              <i class="fa-solid fa-hourglass-half text-[9px]"></i>
              Awaiting payment
            </span>

            <button
              v-if="errand.status === 'in_progress'"
              :disabled="actionLoading"
              class="inline-flex items-center gap-1.5 rounded-lg bg-cb-accent px-3 py-1.5 text-xs font-semibold text-cb-contrast transition-colors hover:bg-cb-accent-dark disabled:opacity-60"
              @click="$emit('complete', errand)"
            >
              <i class="fa-solid fa-circle-check text-[9px]"></i>
              Complete
            </button>

            <span
              v-if="errand.status === 'completed'"
              class="inline-flex items-center gap-1.5 rounded-lg border border-cb-warning/30 bg-cb-warning-subtle px-3 py-1.5 text-xs font-semibold text-cb-warning"
            >
              <i class="fa-regular fa-hourglass-half text-[9px]"></i>
              Awaiting confirm
            </span>

            <button
              v-if="['accepted', 'in_progress', 'completed'].includes(errand.status)"
              class="flex h-8 w-8 items-center justify-center rounded-lg border border-cb-warning/30 bg-cb-warning-subtle text-cb-warning transition-colors hover:opacity-80"
              title="Open dispute"
              @click="$emit('dispute', errand)"
            >
              <i class="fa-solid fa-scale-balanced text-xs"></i>
            </button>
          </template>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  errand:        { type: Object,  required: true },
  role:          { type: String,  default: 'poster' }, // 'poster' | 'runner'
  actionLoading: { type: Boolean, default: false },
})

defineEmits(['click', 'cancel', 'confirm', 'start', 'complete', 'dispute', 'pay'])

// ── Category ──────────────────────────────────────────────────
const CATEGORY_ICON_MAP = {
  delivery_pickup:     'fa-solid fa-truck',
  grocery_shopping:    'fa-solid fa-basket-shopping',
  printing_binding:    'fa-solid fa-print',
  food_runs:           'fa-solid fa-utensils',
  cleaning_laundry:    'fa-solid fa-broom',
  moving_assistance:   'fa-solid fa-boxes-packing',
  typing_form_filling: 'fa-solid fa-keyboard',
  queue_standing:      'fa-solid fa-people-line',
  pet_care:            'fa-solid fa-paw',
  other:               'fa-solid fa-ellipsis',
}

const categoryIcon  = computed(() => CATEGORY_ICON_MAP[props.errand.category] || 'fa-solid fa-tag')
const categoryLabel = computed(() =>
  (props.errand.category || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
)

// ── Status — uses actual ERRAND_STATUS constants ──────────────
const STATUS_MAP = {
  posted:      { label: 'Open',                 cls: 'bg-cb-accent-subtle text-cb-accent'       },
  accepted:    { label: 'Accepted',             cls: 'bg-cb-accent-subtle text-cb-accent'       },
  in_progress: { label: 'In Progress',          cls: 'bg-cb-accent-subtle text-cb-accent'       },
  completed:   { label: 'Awaiting Confirm',     cls: 'bg-cb-warning-subtle text-cb-warning'     },
  confirmed:   { label: 'Completed',            cls: 'bg-cb-field text-cb-muted'                },
  cancelled:   { label: 'Cancelled',            cls: 'bg-cb-field text-cb-muted'                },
  disputed:    { label: 'Disputed',             cls: 'bg-cb-negative-subtle text-cb-negative'   },
}

const statusLabel = computed(() => STATUS_MAP[props.errand.status]?.label || props.errand.status)
const statusClass = computed(() => STATUS_MAP[props.errand.status]?.cls  || 'bg-cb-field text-cb-muted')

// bids array IS returned in my/posted — use its length directly
// bidStats is only on the single errand detail response
const bidCount = computed(() =>
  props.errand.bids?.length ?? 0
)

// ── Deadline ──────────────────────────────────────────────────
const urgent = computed(() => {
  if (!props.errand.deadline) return false
  return (new Date(props.errand.deadline) - new Date()) / 3_600_000 < 24
})

const deadlineLabel = computed(() => {
  if (!props.errand.deadline) return '—'
  const h = (new Date(props.errand.deadline) - new Date()) / 3_600_000
  if (h < 0)  return 'Expired'
  if (h < 1)  return `${Math.round(h * 60)}m left`
  if (h < 24) return `${Math.round(h)}h left`
  const d = Math.ceil(h / 24)
  return `${d} day${d > 1 ? 's' : ''} left`
})
</script>