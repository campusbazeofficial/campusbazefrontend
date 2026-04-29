<template>
  <div class="space-y-4">
    <!-- Loading skeleton -->
    <template v-if="loading && !errands.length">
      <SkeletonCard v-for="i in 3" :key="i" />
    </template>

    <!-- Empty state -->
    <MyErrandEmptyState
      v-else-if="!errands.length"
      icon="fa-solid fa-check-circle"
      title="No accepted errands"
      description="When you win a bid, your accepted errands will appear here."
      :cta="{ label: 'Browse errands', to: { name: 'ErrandMarket' }, icon: 'fa-solid fa-store' }"
    />

    <!-- Errands list -->
    <template v-else>
      <article
        v-for="errand in errands"
        :key="errand._id"
        class="group relative cursor-pointer rounded-2xl border border-cb-divider bg-cb-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-cb-accent-muted hover:shadow-lg sm:p-5"
        @click="$emit('view-errand', errand._id)"
      >
        <!-- Urgent stripe -->
        <span
          v-if="isUrgent(errand.deadline)"
          class="absolute inset-x-5 top-0 h-0.5 rounded-b bg-cb-warning"
        ></span>

        <div class="flex flex-col gap-3">
          
          <!-- Header -->
          <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0 flex-1">
              <h4 class="line-clamp-2 sm:line-clamp-1 text-sm font-semibold text-cb-text group-hover:text-cb-accent">
                {{ errand.title }}
              </h4>
              <p class="mt-0.5 line-clamp-2 sm:line-clamp-1 text-xs text-cb-muted">
                {{ errand.description }}
              </p>
            </div>

            <!-- Status -->
            <span
              :class="[
                'shrink-0 self-start sm:self-auto rounded-full px-2.5 py-1 text-[11px] font-semibold',
                getStatusConfig(errand.status).bg,
                getStatusConfig(errand.status).text
              ]"
            >
              {{ getStatusConfig(errand.status).label }}
            </span>
          </div>

          <!-- Meta -->
          <div class="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
            <span class="inline-flex items-center gap-1.5 text-xs text-cb-muted">
              <i class="fa-solid fa-location-dot text-[10px]"></i>
              <span class="max-w-[200px] truncate">{{ errand.address }}</span>
            </span>

            <span
              :class="[
                'inline-flex items-center gap-1.5 text-xs',
                isUrgent(errand.deadline) ? 'text-cb-warning' : 'text-cb-muted'
              ]"
            >
              <i class="fa-regular fa-clock text-[10px]"></i>
              {{ formatDeadline(errand.deadline) }}
            </span>
          </div>

          <!-- Financial -->
          <div class="flex flex-col gap-2 rounded-lg bg-cb-field/30 px-3 py-2 sm:flex-row sm:items-center sm:gap-4">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wider text-cb-muted">
                Budget
              </p>
              <p class="text-lg font-bold text-cb-text">
                ₦{{ errand.budget?.toLocaleString() }}
              </p>
            </div>

            <template v-if="errand.bid?.amount">
              <div class="hidden h-8 w-px bg-cb-divider sm:block"></div>

              <div>
                <p class="text-[10px] font-semibold uppercase tracking-wider text-cb-muted">
                  Your Earnings
                </p>
                <p class="text-sm font-semibold text-cb-accent">
                  ₦{{ (errand.sellerEarningsNGN || errand.bid?.amount)?.toLocaleString() }}
                </p>
              </div>
            </template>
          </div>

          <!-- Actions -->
          <div
            class="flex flex-col gap-3 border-t border-cb-divider pt-3 sm:flex-row sm:items-center sm:justify-between"
            @click.stop
          >
            <!-- Poster -->
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1 text-xs text-cb-muted">
                <i class="fa-solid fa-user text-[10px]"></i>
                Poster: {{ getPosterName(errand.posterId) }}
              </span>
            </div>

            <!-- Buttons -->
            <div class="flex flex-wrap items-center gap-2">
              <!-- Start — only when errand is accepted AND escrow confirmed -->
              <button
                v-if="errand.status === 'accepted' && errand.bid?.status === 'accepted' && errand.escrowConfirmed"
                @click="$emit('start', errand)"
                :disabled="actionLoading"
                class="inline-flex items-center gap-1.5 rounded-lg bg-cb-accent px-3 py-1.5 text-xs font-semibold text-cb-contrast transition-colors hover:bg-cb-accent-dark disabled:opacity-60"
              >
                <i class="fa-solid fa-play text-[9px]"></i>
                Start errand
              </button>

              <!-- Awaiting payment -->
              <span
                v-else-if="errand.status === 'accepted' && !errand.escrowConfirmed"
                class="inline-flex items-center gap-1.5 rounded-lg border border-cb-warning/30 bg-cb-warning-subtle px-3 py-1.5 text-xs font-semibold text-cb-warning"
              >
                <i class="fa-solid fa-hourglass-half text-[9px]"></i>
                Awaiting payment
              </span>

              <!-- Complete — only when in_progress -->
              <button
                v-if="errand.status === 'in_progress'"
                @click="$emit('complete', errand)"
                :disabled="actionLoading"
                class="inline-flex items-center gap-1.5 rounded-lg bg-cb-accent px-3 py-1.5 text-xs font-semibold text-cb-contrast transition-colors hover:bg-cb-accent-dark disabled:opacity-60"
              >
                <i class="fa-solid fa-circle-check text-[9px]"></i>
                Complete
              </button>

              <!-- Awaiting confirm -->
              <span
                v-if="errand.status === 'completed'"
                class="inline-flex items-center gap-1.5 rounded-lg border border-cb-warning/30 bg-cb-warning-subtle px-3 py-1.5 text-xs font-semibold text-cb-warning"
              >
                <i class="fa-regular fa-hourglass-half text-[9px]"></i>
                Awaiting confirmation
              </span>

              <!-- Done -->
              <span
                v-if="errand.status === 'confirmed'"
                class="inline-flex items-center gap-1.5 rounded-lg border border-cb-accent-muted bg-cb-accent-subtle px-3 py-1.5 text-xs font-semibold text-cb-accent"
              >
                <i class="fa-solid fa-circle-check text-[9px]"></i>
                Completed
              </span>

              <!-- Dispute — only for active statuses, not terminal ones -->
              <button
                v-if="['accepted', 'in_progress', 'completed'].includes(errand.status)"
                @click="$emit('dispute', errand)"
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-cb-warning/30 bg-cb-warning-subtle text-cb-warning transition-colors hover:opacity-80"
                title="Open dispute"
              >
                <i class="fa-solid fa-scale-balanced text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </article>
    </template>

    <!-- Pagination -->
    <Pagination
      v-if="totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      @page="$emit('page-change', $event)"
    />
  </div>
</template>

<script setup>
import SkeletonCard from '@/components/errands/SkeletonCard.vue'
import MyErrandEmptyState from '@/components/reusables/EmptyState.vue'
import Pagination from '@/components/reusables/Pagination.vue'
import { getStatusConfig } from '@/constants/errandStatus'
import { formatDeadline, isUrgent } from '@/utils/categories'

defineProps({
  errands:       { type: Array,   required: true },
  loading:       { type: Boolean, default: false },
  actionLoading: { type: Boolean, default: false },
  currentPage:   { type: Number,  default: 1 },
  totalPages:    { type: Number,  default: 0 },
})

defineEmits(['view-errand', 'start', 'complete', 'dispute', 'page-change'])

function getPosterName(posterId) {
  if (!posterId) return 'Anonymous'
  if (typeof posterId === 'string') return 'Poster'
  return posterId.displayName || `${posterId.firstName || ''} ${posterId.lastName || ''}`.trim() || 'Anonymous'
}
</script>