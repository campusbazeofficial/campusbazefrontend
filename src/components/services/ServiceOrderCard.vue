<!-- src/components/services/ServiceOrderCard.vue -->
<template>
  <article
    class="group cursor-pointer rounded-2xl border border-cb-divider bg-cb-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-cb-accent/30 hover:shadow-lg hover:shadow-black/10"
    @click="$emit('click', order._id)"
  >
    <div class="flex flex-col gap-4">
      <!-- Top -->
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <h3 class="line-clamp-1 text-sm font-semibold text-cb-text group-hover:text-cb-accent">
            {{ serviceTitle }}
          </h3>
          <div
            class="mt-2 flex items-center gap-2 cursor-pointer"
            @click.stop="$emit('view-user', otherPartySlug)"
          >
            <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cb-field text-cb-muted">
              <i class="fa-solid fa-user text-[10px]"></i>
            </div>
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="text-[11px] text-cb-muted">{{ role === 'seller' ? 'Buyer:' : 'Seller:' }}</span>
              <span class="text-[11px] font-medium text-cb-text">{{ otherPartyName }}</span>
              <i v-if="otherPartyVerified" class="fa-solid fa-badge-check text-[10px] text-cb-accent"></i>
              <span class="flex items-center gap-1 text-[10px] text-cb-muted">
                <i class="fa-solid fa-star text-[9px]"></i>
                {{ otherPartyRating }}
              </span>
            </div>
          </div>
        </div>
        <span :class="['shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold', statusClass]">
          {{ statusLabel }}
        </span>
      </div>

      <!-- Meta pills -->
      <div class="flex flex-wrap gap-2">
        <span class="inline-flex items-center gap-1.5 rounded-lg bg-cb-field px-2.5 py-1 text-[11px] capitalize text-cb-muted">
          <i class="fa-solid fa-layer-group text-[9px]"></i>
          {{ order.tierName || 'Standard' }}
        </span>
        <span class="inline-flex items-center gap-1.5 rounded-lg bg-cb-field px-2.5 py-1 text-[11px] text-cb-muted">
          <i class="fa-regular fa-calendar text-[9px]"></i>
          {{ formatDate(order.createdAt) }}
        </span>
        <span v-if="orderAmount" class="inline-flex items-center gap-1.5 rounded-lg bg-cb-accent-subtle px-2.5 py-1 text-[11px] font-semibold text-cb-accent">
          ₦{{ orderAmount.toLocaleString() }}
        </span>
        <span v-if="order.deliveryDue" class="inline-flex items-center gap-1.5 rounded-lg bg-cb-field px-2.5 py-1 text-[11px] text-cb-muted">
          <i class="fa-regular fa-clock text-[9px]"></i>
          Due {{ formatDate(order.deliveryDue) }}
        </span>
        <span v-if="order.escrowReference" class="inline-flex items-center rounded-lg bg-cb-field px-2 py-1 font-mono text-[9px] text-cb-muted">
          {{ order.escrowReference.slice(-6) }}
        </span>
      </div>

      <!-- Payment warning -->
      <div
        v-if="role === 'buyer' && order.status === 'pending_payment'"
        class="flex items-center gap-2 rounded-lg border border-cb-warning/30 bg-cb-warning-subtle px-3 py-2.5 text-xs text-cb-warning"
      >
        <i class="fa-solid fa-triangle-exclamation shrink-0"></i>
        Payment required to activate this order.
      </div>

      <!-- Requirements note -->
      <p
        v-if="order.requirements"
        class="line-clamp-2 rounded-lg border border-cb-divider bg-cb-base/60 px-3 py-2.5 text-xs leading-relaxed text-cb-muted"
      >
        <i class="fa-regular fa-note-sticky mr-1.5"></i>
        {{ order.requirements }}
      </p>

      <!-- Footer actions -->
      <div
        class="flex flex-wrap items-center justify-end gap-2 border-t border-cb-divider pt-3"
        @click.stop
      >
        <template v-if="role === 'buyer'">
          <button v-if="order.status === 'pending_payment'" class="btn-primary" @click="$emit('pay', order._id)">
            <i class="fa-solid fa-credit-card text-[10px]"></i>
            Pay Now
          </button>
          <button v-if="order.status === 'delivered'" class="btn-primary" @click="$emit('confirm', order._id)">
            <i class="fa-solid fa-check text-[10px]"></i>
            Confirm
          </button>
          <button v-if="order.status === 'delivered'" class="btn-secondary" @click="$emit('revision', order._id)">
            <i class="fa-solid fa-rotate-left text-[10px]"></i>
            Revision
          </button>
          <button v-if="order.status === 'pending_payment'" class="btn-danger-icon" @click="$emit('cancel', order._id)">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <button v-if="['in_progress','delivered','revision'].includes(order.status)" class="btn-warning-icon" @click="$emit('dispute', order._id)">
            <i class="fa-solid fa-scale-balanced"></i>
          </button>
        </template>

        <template v-if="role === 'seller'">
          <button v-if="['in_progress', 'revision'].includes(order.status)" class="btn-primary" @click="$emit('deliver', order._id)">
            <i class="fa-solid fa-truck text-[10px]"></i>
            Deliver
          </button>
          <button v-if="['in_progress','delivered','revision'].includes(order.status)" class="btn-warning-icon" @click="$emit('dispute', order._id)">
            <i class="fa-solid fa-scale-balanced"></i>
          </button>
        </template>

        <span v-if="order.status === 'completed'" class="inline-flex items-center gap-1.5 text-xs font-semibold text-cb-accent">
          <i class="fa-solid fa-circle-check"></i>
          Completed
        </span>
        <span v-if="order.status === 'cancelled'" class="inline-flex items-center gap-1.5 text-xs text-cb-muted">
          <i class="fa-solid fa-ban"></i>
          Cancelled
        </span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  order: Object,
  role: String,
})

defineEmits(['click', 'pay', 'deliver', 'confirm', 'revision', 'dispute', 'cancel', 'view-user'])

const serviceTitle = computed(() =>
  props.order.service?.title ||
  props.order.listingId?.title ||
  'Service Order'
)

const orderAmount = computed(() =>
  props.order.amount ?? props.order.totalAmount ?? null
)

const otherParty = computed(() =>
  props.role === 'seller' ? props.order.buyerId : props.order.sellerId
)

const otherPartyName = computed(() =>
  typeof otherParty.value === 'object'
    ? otherParty.value.displayName
    : 'User'
)

const otherPartySlug = computed(() =>
  typeof otherParty.value === 'object'
    ? otherParty.value.slug
    : null
)

const otherPartyVerified = computed(() =>
  typeof otherParty.value === 'object'
    ? otherParty.value.identityVerificationBadge
    : false
)

const otherPartyRating = computed(() =>
  typeof otherParty.value === 'object'
    ? otherParty.value.averageRating ?? 0
    : 0
)

const STATUS_MAP = {
  pending_payment: { label: 'Awaiting Payment', cls: 'bg-cb-warning-subtle text-cb-warning' },
  in_progress: { label: 'In Progress', cls: 'bg-cb-accent-subtle text-cb-accent' },
  delivered: { label: 'Delivered', cls: 'bg-cb-accent-subtle text-cb-accent' },
  revision: { label: 'Revision', cls: 'bg-cb-warning-subtle text-cb-warning' },
  completed: { label: 'Completed', cls: 'bg-cb-field text-cb-muted' },
  cancelled: { label: 'Cancelled', cls: 'bg-cb-field text-cb-muted' },
  disputed: { label: 'Disputed', cls: 'bg-cb-negative-subtle text-cb-negative' },
}

const statusLabel = computed(() => STATUS_MAP[props.order.status]?.label || props.order.status)
const statusClass = computed(() => STATUS_MAP[props.order.status]?.cls)

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<style scoped>
@reference "@/style.css"
.btn-primary {
  @apply flex h-8 items-center gap-1.5 rounded-lg bg-cb-accent px-3 text-xs font-semibold text-cb-contrast hover:bg-cb-accent-dark;
}
.btn-secondary {
  @apply flex h-8 items-center gap-1.5 rounded-lg border border-cb-divider bg-cb-card px-3 text-xs font-semibold text-cb-text hover:bg-cb-field;
}
.btn-warning-icon {
  @apply flex h-8 w-8 items-center justify-center rounded-lg border border-cb-warning/30 bg-cb-warning-subtle text-cb-warning;
}
.btn-danger-icon {
  @apply flex h-8 w-8 items-center justify-center rounded-lg border border-cb-negative/20 bg-cb-negative-subtle text-cb-negative;
}
</style>