<template>
  <div class="space-y-4">
    <!-- Loading skeleton -->
    <template v-if="loading && !bids.length">
      <SkeletonCard v-for="i in 3" :key="i" />
    </template>

    <!-- Empty state -->
    <MyErrandEmptyState
      v-else-if="!bids.length"
      icon="fa-solid fa-gavel"
      title="No bids placed yet"
      description="Browse the marketplace and place bids on errands you'd like to complete."
      :cta="{ label: 'Browse errands', to: { name: 'ErrandMarket' }, icon: 'fa-solid fa-store' }"
    />

    <!-- Bids list -->
    <template v-else>
      <article
        v-for="item in bids"
        :key="item.bid?._id || item._id"
        class="group cursor-pointer rounded-2xl border border-cb-divider bg-cb-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-cb-accent-muted hover:shadow-lg sm:p-5"
        @click="$emit('view-errand', item._id)"
      >
        <div class="flex flex-col gap-3">
          
          <!-- Errand info -->
          <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0 flex-1">
              <h4 class="line-clamp-2 sm:line-clamp-1 text-sm font-semibold text-cb-text group-hover:text-cb-accent">
                {{ item.title || 'Untitled Errand' }}
              </h4>

              <p class="mt-0.5 flex flex-col gap-1 text-xs text-cb-muted sm:flex-row sm:items-center sm:gap-2">
                <span class="inline-flex items-center gap-1">
                  <i class="fa-solid fa-location-dot text-[10px]"></i>
                  <span class="max-w-[200px] truncate">{{ item.address }}</span>
                </span>

                <span class="hidden sm:inline">•</span>

                <span class="inline-flex items-center gap-1">
                  <i class="fa-regular fa-clock text-[10px]"></i>
                  {{ formatDeadline(item.deadline) }}
                </span>
              </p>
            </div>

            <!-- Status badge -->
            <span
              v-if="item.bid"
              :class="[
                'shrink-0 self-start sm:self-auto rounded-full px-2.5 py-1 text-[11px] font-semibold',
                getBidStatusConfig(item.bid.status).bg,
                getBidStatusConfig(item.bid.status).text
              ]"
            >
              {{ getBidStatusConfig(item.bid.status).label }}
            </span>
          </div>

          <!-- Bid details -->
          <div
            v-if="item.bid"
            class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4"
          >
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1.5 text-sm font-semibold">
                <span class="text-cb-muted">Errand budget:</span>
                <span class="text-cb-text">₦{{ item.budget?.toLocaleString() }}</span>
              </span>

              <span class="inline-flex items-center gap-1.5 text-sm font-semibold">
                <span class="text-cb-muted">Your bid:</span>
                <span :class="item.bid.amount <= item.budget ? 'text-cb-accent' : 'text-cb-warning'">
                  ₦{{ item.bid.amount?.toLocaleString() }}
                </span>
              </span>
            </div>

            <span class="inline-flex items-center gap-1.5 text-xs text-cb-muted">
              <i class="fa-regular fa-clock text-[10px]"></i>
              Bid placed {{ formatTimeAgo(item.bid.createdAt) }}
            </span>
          </div>

          <!-- Bid message -->
          <div v-if="item.bid?.message" class="rounded-lg bg-cb-field/50 px-3 py-2">
            <p class="text-xs leading-relaxed text-cb-muted">
              <span class="font-semibold text-cb-text">Your message:</span>
              {{ item.bid.message }}
            </p>
          </div>

          <!-- Status + actions -->
          <div
            v-if="item.bid"
            class="flex flex-col gap-3 border-t border-cb-divider pt-3 sm:flex-row sm:items-center sm:justify-between"
            @click.stop
          >
            <!-- Status text -->
            <div class="flex flex-wrap items-center gap-2">
              <span
                v-if="item.bid.status === 'pending'"
                class="inline-flex items-center gap-1 text-xs text-cb-muted"
              >
                <i class="fa-regular fa-hourglass-half text-[10px]"></i>
                Waiting for poster's response
              </span>

              <span
                v-else-if="item.bid.status === 'accepted'"
                class="inline-flex items-center gap-1 text-xs font-semibold text-cb-accent"
              >
                <i class="fa-solid fa-circle-check text-[10px]"></i>
                Bid accepted. Check Accepted tab
              </span>

              <span
                v-else-if="item.bid.status === 'withdrawn'"
                class="inline-flex items-center gap-1 text-xs text-cb-muted"
              >
                <i class="fa-solid fa-rotate-left text-[10px]"></i>
                Bid withdrawn
              </span>

              <span
                v-else-if="item.bid.status === 'rejected'"
                class="inline-flex items-center gap-1 text-xs text-cb-muted"
              >
                <i class="fa-solid fa-xmark text-[10px]"></i>
                Bid not accepted
              </span>
            </div>

            <!-- Action -->
            <div class="flex flex-wrap items-center gap-2">
              <button
                v-if="item.bid.status === 'pending'"
                @click="requestWithdraw({ errandId: item._id, bidId: item.bid._id })"
                :disabled="actionLoading"
                class="inline-flex items-center gap-1.5 rounded-lg border border-cb-negative/30 bg-cb-negative-subtle px-3 py-1.5 text-xs font-semibold text-cb-negative transition-colors hover:opacity-90 disabled:opacity-60"
              >
                <i class="fa-solid fa-xmark text-[9px]"></i>
                Withdraw bid
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

    <!-- Withdraw bid confirmation modal -->
    <Teleport to="body">
      <ConfirmModal
        v-if="showWithdrawConfirm"
        title="Withdraw your bid?"
        message="Are you sure you want to withdraw your bid? This cannot be undone."
        confirm-text="Withdraw bid"
        variant="danger"
        @confirm="confirmWithdraw"
        @cancel="showWithdrawConfirm = false; pendingWithdraw = null"
      />
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SkeletonCard from '@/components/errands/SkeletonCard.vue'
import MyErrandEmptyState from '@/components/reusables/EmptyState.vue'
import Pagination from '@/components/reusables/Pagination.vue'
import ConfirmModal from '@/components/reusables/ConfirmModal.vue'
import { getBidStatusConfig } from '@/constants/errandStatus'
import { formatTimeAgo, formatDeadline } from '@/utils/categories'

defineProps({
  bids:          { type: Array,   required: true },
  loading:       { type: Boolean, default: false },
  actionLoading: { type: Boolean, default: false },
  currentPage:   { type: Number,  default: 1 },
  totalPages:    { type: Number,  default: 0 },
})

const emit = defineEmits(['view-errand', 'withdraw', 'page-change'])

const showWithdrawConfirm = ref(false)
const pendingWithdraw = ref(null)

function requestWithdraw(payload) {
  pendingWithdraw.value = payload
  showWithdrawConfirm.value = true
}

function confirmWithdraw() {
  if (pendingWithdraw.value) {
    emit('withdraw', pendingWithdraw.value)
  }
  showWithdrawConfirm.value = false
  pendingWithdraw.value = null
}
</script>