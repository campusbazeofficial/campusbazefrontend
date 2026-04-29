<template>
  <article
    :class="[
      'group relative cursor-pointer rounded-2xl bg-cb-card transition-all duration-200',
      'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10',
      viewMode === 'grid'
        ? 'flex flex-col p-5'
        : 'flex flex-col gap-4 p-5 sm:flex-row sm:items-stretch',
    ]"
    @click="$emit('click')"
  >

    <!-- LEFT (list) / TOP (grid): category + body -->
    <div class="flex min-w-0 flex-1 flex-col">

      <!-- Top row: category badge + status badge -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-1.5 min-w-0">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-cb-accent-subtle px-2.5 py-1 text-[11px] font-semibold text-cb-accent">
            <i :class="[getCategoryIcon(errand.category), 'text-[10px]']"></i>
            <span>{{ getCategoryLabel(errand.category) }}</span>
          </span>
          <!-- "Your errand" pill — only visible to the poster -->
          <span
            v-if="isPoster"
            class="inline-flex items-center gap-1 rounded-full bg-cb-positive-subtle px-2.5 py-1 text-[10px] font-semibold text-cb-positive"
          >
            <i class="fa-solid fa-user text-[8px]"></i>
            Yours
          </span>
        </div>

        <span
          :class="[
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize',
            statusStyle.bg, statusStyle.text,
          ]"
        >
          <span :class="['h-1.5 w-1.5 rounded-full', statusStyle.dot]"></span>
          {{ errand.status }}
        </span>
      </div>

      <!-- Title + description -->
      <h3 class="mt-3 line-clamp-2 text-sm font-semibold capitalize leading-snug text-cb-text transition-colors group-hover:text-cb-accent">
        {{ errand.title }}
      </h3>
      <p class="mt-1 line-clamp-2 text-xs leading-relaxed text-cb-muted">
        {{ errand.description }}
      </p>

      <!-- Meta row: poster + time posted -->
      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-cb-muted">

        <!-- Poster avatar + name + verification -->
        <span class="inline-flex min-w-0 items-center gap-1.5">
          <span class="relative shrink-0">
            <img
              v-if="errand.poster?.avatar"
              :src="errand.poster.avatar"
              :alt="posterName"
              class="h-5 w-5 rounded-full object-cover ring-1 ring-cb-divider"
            />
            <span
              v-else
              class="flex h-5 w-5 items-center justify-center rounded-full bg-cb-field text-[9px] font-bold text-cb-muted ring-1 ring-cb-divider"
            >
              {{ posterInitials }}
            </span>
            <!-- Identity verified badge -->
            <span
              v-if="errand.poster?.identityVerificationBadge"
              class="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-cb-accent ring-1 ring-cb-card"
              title="Identity verified"
            >
              <i class="fa-solid fa-check text-[6px] text-cb-contrast"></i>
            </span>
          </span>
          <span class="truncate max-w-[120px] font-medium text-cb-text">
            {{ isPoster ? 'You' : posterName }}
          </span>
        </span>

        <!-- Star rating (if rated) -->
        <span v-if="errand.poster?.averageRating > 0" class="inline-flex items-center gap-1">
          <i class="fa-solid fa-star text-[9px] text-cb-warning"></i>
          <span class="font-medium text-cb-text">{{ errand.poster.averageRating.toFixed(1) }}</span>
        </span>

        <!-- Time posted -->
        <span class="inline-flex items-center gap-1.5">
          <i class="fa-regular fa-clock text-[10px] text-cb-muted-40"></i>
          {{ timeAgo }}
        </span>

      </div>
    </div>

    <!-- RIGHT (list) / BOTTOM (grid): budget + action -->
    <div
      :class="[
        'flex items-center justify-between gap-3',
        viewMode === 'grid'
          ? 'mt-5 border-t border-cb-divider pt-4'
          : 'sm:w-40 sm:shrink-0 sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-cb-divider sm:pl-4',
      ]"
    >
      <!-- Budget -->
      <div class="min-w-0">
        <p class="text-base font-bold text-cb-text">
          ₦{{ errand.budget?.toLocaleString() ?? '—' }}
        </p>
        <p class="mt-0.5 text-[10px] text-cb-muted">Budget</p>
      </div>

      <!-- CTA -->
      <router-link
        v-if="isPoster"
        to="/user/my-errands"
        @click.stop
        class="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 bg-cb-accent-subtle text-cb-accent hover:bg-cb-accent hover:text-cb-contrast"
      >
        <i class="fa-solid fa-gear text-[10px]"></i>
        <span>Manage errand</span>
      </router-link>

      <button
        v-else
        :disabled="hasUserBid"
        @click.stop="!hasUserBid && $emit('bid', errand)"
        :class="[
          'inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200',
          hasUserBid
            ? 'cursor-default border border-cb-warning/40 bg-cb-warning-subtle text-cb-warning'
            : 'bg-cb-accent text-cb-contrast hover:bg-cb-accent-dark hover:shadow-md hover:shadow-cb-accent/25 active:scale-[0.97]',
        ]"
      >
        <i :class="[actionIcon, 'text-[10px]']"></i>
        <span>{{ actionLabel }}</span>
      </button>
    </div>

  </article>
</template>

<script setup>
import { computed } from 'vue'
import { getCategoryIcon, getCategoryLabel } from '@/utils/categories'

const props = defineProps({
  errand:     { type: Object,  required: true },
  viewMode:   { type: String,  default: 'grid' },
  isPoster:   { type: Boolean, default: false },
  hasUserBid: { type: Boolean, default: false },
})
defineEmits(['click', 'bid'])

// ── Poster ──────────────────────────────────────────────────────────
const posterName = computed(() => {
  const p = props.errand.poster
  if (!p) return 'Anonymous'
  return p.displayName || `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'Anonymous'
})

const posterInitials = computed(() =>
  posterName.value
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
)

// ── Status badge style ───────────────────────────────────────────────
const statusStyle = computed(() => {
  switch (props.errand.status) {
    case 'posted':    return { bg: 'bg-cb-accent-subtle',  text: 'text-cb-accent',   dot: 'bg-cb-accent'   }
    case 'assigned':  return { bg: 'bg-cb-warning-subtle', text: 'text-cb-warning',  dot: 'bg-cb-warning'  }
    case 'completed': return { bg: 'bg-cb-positive-subtle',text: 'text-cb-positive', dot: 'bg-cb-positive' }
    case 'cancelled': return { bg: 'bg-cb-negative-subtle',text: 'text-cb-negative', dot: 'bg-cb-negative' }
    default:          return { bg: 'bg-cb-field',          text: 'text-cb-muted',    dot: 'bg-cb-muted'    }
  }
})

// ── Time ago ─────────────────────────────────────────────────────────
const timeAgo = computed(() => {
  if (!props.errand.createdAt) return ''
  const diff = Date.now() - new Date(props.errand.createdAt).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return new Date(props.errand.createdAt).toLocaleDateString()
})

// ── CTA state ────────────────────────────────────────────────────────
const actionIcon = computed(() => {
  if (props.isPoster) return 'fa-solid fa-gear'
  if (props.hasUserBid) return 'fa-regular fa-hourglass-half'
  return 'fa-solid fa-gavel'
})
const actionLabel = computed(() => {
  if (props.isPoster) {
    return 'Manage errand'
  }

  if (props.hasUserBid) {
    return 'Bid placed'
  }

  return 'Place bid'
})
</script>