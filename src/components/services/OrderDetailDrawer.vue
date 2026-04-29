<!-- src/components/services/OrderDetailDrawer.vue -->
<template>
  <div class="flex h-full flex-col bg-cb-base">
    <!-- Header -->
    <header
      class="flex shrink-0 items-center justify-between border-b border-cb-divider px-4 py-3.5 sm:px-5 sm:py-4"
    >
      <div class="flex items-center gap-2.5">
        <span
          v-if="order"
          :class="[
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold',
            statusClass,
          ]"
        >
          <span :class="['h-1.5 w-1.5 rounded-full', statusDot]"></span>
          {{ statusLabel }}
        </span>
        <div
          v-else-if="loading"
          class="h-5 w-20 animate-pulse rounded-full bg-cb-field"
        ></div>
      </div>
      <button
        @click="$emit('close')"
        class="flex h-8 w-8 items-center justify-center rounded-lg text-cb-muted transition-colors hover:bg-cb-field hover:text-cb-text"
      >
        <i class="fa-solid fa-times text-sm"></i>
      </button>
    </header>

    <!-- Skeleton -->
    <template v-if="loading">
      <div class="flex-1 space-y-5 p-4 sm:p-5">
        <div class="space-y-2">
          <div class="h-6 w-3/4 animate-pulse rounded-xl bg-cb-field"></div>
          <div class="h-4 w-1/3 animate-pulse rounded bg-cb-field"></div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="h-16 animate-pulse rounded-xl bg-cb-field"></div>
          <div class="h-16 animate-pulse rounded-xl bg-cb-field"></div>
        </div>
        <div class="h-32 animate-pulse rounded-xl bg-cb-field"></div>
      </div>
    </template>

    <template v-else-if="order">
      <div class="flex-1 overflow-y-auto p-4 sm:p-5">
        <div class="space-y-4">
          <!-- Service info -->
          <div>
            <h2 class="text-base font-bold text-cb-text sm:text-lg">
              {{
                order.service?.title ||
                order.listingId?.title ||
                "Service Order"
              }}
            </h2>
            <p class="mt-0.5 text-xs text-cb-muted">
              Order #{{ order._id?.slice(-8).toUpperCase() }}
            </p>
          </div>

          <!-- Pending payment banner -->
          <div
            v-if="userRole === 'buyer' && order.status === 'pending_payment'"
            class="flex items-start gap-3 rounded-xl border border-cb-warning/30 bg-cb-warning-subtle p-4"
          >
            <i
              class="fa-solid fa-triangle-exclamation mt-0.5 shrink-0 text-cb-warning"
            ></i>
            <div>
              <p class="text-sm font-semibold text-cb-warning">
                Payment Required
              </p>
              <p class="mt-0.5 text-xs text-cb-warning/80">
                This order is awaiting payment. Complete payment to activate the
                order and allow the seller to begin work.
              </p>
            </div>
          </div>

          <!-- Parties -->
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-xl border border-cb-divider bg-cb-card p-3">
              <p
                class="mb-1 text-[10px] font-semibold uppercase tracking-wider text-cb-muted"
              >
                Seller
              </p>
              <div class="flex items-center gap-2">
                <div
                  class="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cb-accent text-[10px] font-bold text-cb-contrast"
                >
                  <img
                    v-if="sellerAvatar"
                    :src="sellerAvatar"
                    class="h-full w-full object-cover"
                    alt=""
                  />
                  <span v-else>{{ initialsOf("sellerId") }}</span>
                </div>
                <p class="truncate text-xs font-semibold text-cb-text">
                  {{ sellerName }}
                </p>
              </div>
            </div>
            <div class="rounded-xl border border-cb-divider bg-cb-card p-3">
              <p
                class="mb-1 text-[10px] font-semibold uppercase tracking-wider text-cb-muted"
              >
                Buyer
              </p>
              <div class="flex items-center gap-2">
                <div
                  class="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cb-accent text-[10px] font-bold text-cb-contrast"
                >
                  <img
                    v-if="buyerAvatar"
                    :src="buyerAvatar"
                    class="h-full w-full object-cover"
                    alt=""
                  />
                  <span v-else>{{ initialsOf("buyerId") }}</span>
                </div>
                <p class="truncate text-xs font-semibold text-cb-text">
                  {{ buyerName }}
                </p>
              </div>
            </div>
          </div>

          <!-- Order summary -->
          <section class="rounded-xl border border-cb-divider bg-cb-card p-4">
            <p
              class="mb-3 text-[10px] font-semibold uppercase tracking-wider text-cb-muted"
            >
              Order Summary
            </p>
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="text-sm text-cb-muted">Tier</span>
                <span class="text-sm font-semibold capitalize text-cb-text">
                  {{ order.tierName || order.tier?.name || "—" }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-cb-muted">Amount</span>
                <span class="text-sm font-semibold text-cb-text">
                  ₦{{
                    (order.amount ?? order.totalAmount)?.toLocaleString() ?? "—"
                  }}
                </span>
              </div>
              <div
                v-if="order.commissionNGN != null"
                class="flex items-center justify-between"
              >
                <span class="text-sm text-cb-muted">Platform Fee</span>
                <span class="text-sm text-cb-text"
                  >₦{{ order.commissionNGN?.toLocaleString() }}</span
                >
              </div>
              <div
                v-if="order.cbcFeeCharged != null"
                class="flex items-center justify-between"
              >
                <span class="text-sm text-cb-muted">CBC Fee</span>
                <span class="text-sm text-cb-text"
                  >₦{{ order.cbcFeeCharged?.toLocaleString() }}</span
                >
              </div>
              <div
                v-if="order.sellerEarningsNGN != null"
                class="flex items-center justify-between"
              >
                <span class="text-sm text-cb-muted">Seller Earnings</span>
                <span class="text-sm font-semibold text-cb-accent"
                  >₦{{ order.sellerEarningsNGN?.toLocaleString() }}</span
                >
              </div>
              <div
                v-if="order.deliveryDue"
                class="flex items-center justify-between"
              >
                <span class="text-sm text-cb-muted">Delivery Due</span>
                <span class="text-sm text-cb-text">{{
                  formatDateTime(order.deliveryDue)
                }}</span>
              </div>
              <div
                v-if="order.revisionCount != null"
                class="flex items-center justify-between"
              >
                <span class="text-sm text-cb-muted">Revisions Used</span>
                <span class="text-sm text-cb-text">{{
                  order.revisionCount
                }}</span>
              </div>
              <div
                class="flex items-center justify-between border-t border-cb-divider pt-2.5"
              >
                <span class="text-sm font-bold text-cb-text">Total Paid</span>
                <span class="text-base font-bold text-cb-text">
                  ₦{{
                    (order.amount ?? order.totalAmount)?.toLocaleString() ?? "—"
                  }}
                </span>
              </div>
            </div>
          </section>

          <!-- Escrow reference -->
          <div
            v-if="order.escrowReference"
            class="flex items-center justify-between rounded-xl border border-cb-divider bg-cb-card px-4 py-3"
          >
            <span class="text-xs text-cb-muted">Escrow Ref</span>
            <span class="font-mono text-xs text-cb-text">{{
              order.escrowReference
            }}</span>
          </div>

          <!-- Requirements -->
          <section
            v-if="order.requirements"
            class="rounded-xl border border-cb-divider bg-cb-card p-4"
          >
            <p
              class="mb-2 text-[10px] font-semibold uppercase tracking-wider text-cb-muted"
            >
              Requirements
            </p>
            <p class="whitespace-pre-line text-sm leading-relaxed text-cb-text">
              {{ order.requirements }}
            </p>
          </section>

          <!-- Delivery note -->
          <section
            v-if="order.deliveryNote"
            class="rounded-xl border border-cb-accent/20 bg-cb-accent-subtle p-4"
          >
            <p
              class="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-accent"
            >
              <i class="fa-solid fa-truck-fast"></i> Delivery Note
            </p>
            <p class="whitespace-pre-line text-sm leading-relaxed text-cb-text">
              {{ order.deliveryNote }}
            </p>
          </section>

          <!-- Revision in progress notice -->
          <section
            v-if="order.status === 'revision'"
            class="rounded-xl border border-cb-warning/30 bg-cb-warning-subtle p-4"
          >
            <p class="flex items-center gap-1.5 text-sm font-semibold text-cb-warning">
              <i class="fa-solid fa-rotate-left"></i>
              Revision in Progress
            </p>
            <p class="mt-1 text-xs text-cb-warning/80">
              {{ userRole === 'seller'
                  ? 'The buyer has requested changes. Please review and re-deliver when ready.'
                  : 'Your revision request has been sent. The seller will re-deliver shortly.' }}
            </p>
          </section>

          <!-- Completed — seller earnings notice -->
          <!-- Hidden once admin approves clearance (earningsCleared = true) -->
          <section
            v-if="order.status === 'completed' && userRole === 'seller' && !earningsCleared"
            class="rounded-xl border border-cb-accent/20 bg-cb-accent-subtle p-4"
          >
            <p class="flex items-center gap-1.5 text-sm font-semibold text-cb-accent">
              <i class="fa-solid fa-hourglass-half"></i>
              Earnings Pending Clearance
            </p>
            <p class="mt-1 text-xs text-cb-accent/80">
              ₦{{ order.sellerEarningsNGN?.toLocaleString() }} is held in your pending earnings. Admin must approve the clearance before you can withdraw.
            </p>
          </section>

          <!-- Cleared — show once admin approves -->
          <section
            v-if="order.status === 'completed' && userRole === 'seller' && earningsCleared"
            class="rounded-xl border border-cb-positive/20 bg-cb-positive-subtle p-4"
          >
            <p class="flex items-center gap-1.5 text-sm font-semibold text-cb-positive">
              <i class="fa-solid fa-circle-check"></i>
              Earnings Cleared
            </p>
            <p class="mt-1 text-xs text-cb-positive/80">
              ₦{{ order.sellerEarningsNGN?.toLocaleString() }} has been approved and is now available for withdrawal.
            </p>
          </section>

          <!-- Dispute reason -->
          <section
            v-if="order.disputeReason || order.status === 'disputed'"
            class="rounded-xl border border-cb-negative/20 bg-cb-negative-subtle p-4"
          >
            <p
              class="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-negative"
            >
              <i class="fa-solid fa-scale-balanced"></i> Dispute — Under Admin Review
            </p>
            <p v-if="order.disputeReason" class="text-sm text-cb-text">{{ order.disputeReason }}</p>
            <p v-else class="text-xs text-cb-negative/80">Our team will contact both parties shortly.</p>
          </section>

          <!-- Add this section to OrderDetailDrawer.vue after the dispute section -->
          <!-- Review section (shown to buyer after completion) -->
          <section
            v-if="showReviewSection"
            class="rounded-xl border border-cb-accent/20 bg-cb-accent-subtle p-4"
          >
            <p
              class="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-accent"
            >
              <i class="fa-solid fa-star"></i> Leave a Review
            </p>

            <div v-if="!reviewSubmitted">
              <!-- Rating -->
              <div class="mb-3">
                <p class="mb-1.5 text-xs text-cb-muted">Rating</p>
                <div class="flex gap-1">
                  <button
                    v-for="star in 5"
                    :key="star"
                    @click="reviewRating = star"
                    class="text-2xl transition-transform hover:scale-110"
                    :class="
                      star <= reviewRating
                        ? 'text-cb-warning'
                        : 'text-cb-muted-40'
                    "
                  >
                    <i
                      :class="
                        star <= reviewRating
                          ? 'fa-solid fa-star'
                          : 'fa-regular fa-star'
                      "
                    ></i>
                  </button>
                </div>
              </div>

              <!-- Comment -->
              <div class="mb-3">
                <p class="mb-1.5 text-xs text-cb-muted">
                  Your Review (optional)
                </p>
                <textarea
                  v-model="reviewComment"
                  rows="2"
                  maxlength="500"
                  placeholder="Share your experience with this service..."
                  class="w-full resize-none rounded-xl border border-cb-divider bg-cb-card p-3 text-sm text-cb-text placeholder:text-cb-muted-40 focus:border-cb-accent focus:outline-none"
                ></textarea>
                <p class="mt-0.5 text-[10px] text-cb-muted">
                  {{ reviewComment.length }}/500
                </p>
              </div>

              <button
                @click="submitReview"
                :disabled="!reviewRating || reviewStore.submitting"
                class="flex w-full items-center justify-center gap-2 rounded-xl bg-cb-accent py-2.5 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark disabled:opacity-60"
              >
                <i
                  v-if="reviewStore.submitting"
                  class="fa-solid fa-spinner fa-spin"
                ></i>
                <i v-else class="fa-solid fa-paper-plane"></i>
                {{ reviewStore.submitting ? "Submitting..." : "Submit Review" }}
              </button>
            </div>

            <div v-else class="text-center">
              <i
                class="fa-solid fa-circle-check text-2xl text-cb-accent mb-2"
              ></i>
              <p class="text-sm font-semibold text-cb-text">
                Review Submitted!
              </p>
              <p class="text-xs text-cb-muted mt-0.5">
                Thank you for your feedback.
              </p>
            </div>
          </section>

          <!-- Existing review display -->
          <section
            v-if="existingReview"
            class="rounded-xl border border-cb-divider bg-cb-card p-4"
          >
            <p
              class="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-muted"
            >
              <i class="fa-solid fa-star text-cb-warning"></i> Review
            </p>
            <div class="flex items-center gap-1 mb-2">
              <i
                v-for="star in 5"
                :key="star"
                :class="[
                  'text-sm',
                  star <= existingReview.rating
                    ? 'fa-solid fa-star text-cb-warning'
                    : 'fa-regular fa-star text-cb-muted-40',
                ]"
              ></i>
            </div>
            <p v-if="existingReview.comment" class="text-sm text-cb-text">
              {{ existingReview.comment }}
            </p>
          </section>
          <!-- Timeline -->
          <section class="rounded-xl border border-cb-divider bg-cb-card p-4">
            <p
              class="mb-3 text-[10px] font-semibold uppercase tracking-wider text-cb-muted"
            >
              Timeline
            </p>
            <ol class="space-y-3 border-l border-cb-divider pl-4">
              <li class="relative">
                <div
                  class="absolute -left-[1.375rem] mt-0.5 h-3 w-3 rounded-full border-2 border-cb-card bg-cb-muted"
                ></div>
                <p class="text-xs font-semibold text-cb-text">Order placed</p>
                <p class="text-[10px] text-cb-muted">
                  {{ formatDateTime(order.createdAt) }}
                </p>
              </li>
              <li v-if="order.deliveredAt" class="relative">
                <div
                  class="absolute -left-[1.375rem] mt-0.5 h-3 w-3 rounded-full border-2 border-cb-card bg-cb-accent"
                ></div>
                <p class="text-xs font-semibold text-cb-text">Delivered</p>
                <p class="text-[10px] text-cb-muted">
                  {{ formatDateTime(order.deliveredAt) }}
                </p>
              </li>
              <li v-if="order.completedAt" class="relative">
                <div
                  class="absolute -left-[1.375rem] mt-0.5 h-3 w-3 rounded-full border-2 border-cb-card bg-cb-accent"
                ></div>
                <p class="text-xs font-semibold text-cb-text">Completed</p>
                <p class="text-[10px] text-cb-muted">
                  {{ formatDateTime(order.completedAt) }}
                </p>
              </li>
            </ol>
          </section>
        </div>
      </div>

      <!-- Footer actions -->
      <footer class="shrink-0 border-t border-cb-divider p-4 space-y-2">
        <!-- Chat button — active orders only -->
        <button
          v-if="canChat"
          @click="$emit('chat')"
          class="flex w-full items-center justify-center gap-2 rounded-xl border border-cb-accent-muted bg-cb-base py-2.5 text-sm font-semibold text-cb-accent transition-all hover:bg-cb-accent-subtle hover:shadow-sm"
        >
          <i class="fa-regular fa-message"></i>
          Message {{ userRole === "buyer" ? sellerName : buyerName }}
        </button>

        <!-- ── Buyer: Pay Now ── -->
        <button
          v-if="userRole === 'buyer' && order.status === 'pending_payment'"
          @click="$emit('pay')"
          :disabled="actionLoading"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark disabled:opacity-60"
        >
          <i v-if="actionLoading" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-credit-card"></i>
          {{ actionLoading ? "Processing…" : "Pay Now" }}
        </button>

        <!-- ── Buyer: Cancel (pending_payment only — before escrow confirmed) ── -->
        <button
          v-if="userRole === 'buyer' && order.status === 'pending_payment'"
          @click="$emit('cancel')"
          :disabled="actionLoading"
          class="flex w-full items-center justify-center gap-2 rounded-xl border border-cb-negative/20 bg-cb-negative-subtle py-2.5 text-sm font-semibold text-cb-negative hover:opacity-90 disabled:opacity-60"
        >
          <i class="fa-solid fa-xmark"></i> Cancel Order
        </button>

        <div class="flex flex-wrap gap-2">
          <!-- ── Seller: Deliver (in_progress or revision) ── -->
          <button
            v-if="userRole === 'seller' && ['in_progress', 'revision'].includes(order.status)"
            @click="$emit('deliver')"
            :disabled="actionLoading"
            class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-accent py-2.5 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark disabled:opacity-60"
          >
            <i class="fa-solid fa-truck-fast"></i> Deliver Order
          </button>

          <!-- ── Buyer: Confirm & Request Revision ── -->
          <template v-if="userRole === 'buyer'">
            <button
              v-if="order.status === 'delivered'"
              @click="$emit('confirm')"
              :disabled="actionLoading"
              class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-accent py-2.5 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark disabled:opacity-60"
            >
              <i class="fa-solid fa-check"></i> Confirm & Release
            </button>
            <button
              v-if="order.status === 'delivered'"
              @click="$emit('revision')"
              :disabled="actionLoading"
              class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-card py-2.5 text-sm font-semibold text-cb-text hover:bg-cb-field disabled:opacity-60"
            >
              <i class="fa-solid fa-rotate-left"></i> Request Revision
            </button>
          </template>

          <!-- ── Dispute — role-scoped, only when work is active ── -->
          <!-- Seller can dispute in_progress, revision, delivered -->
          <button
            v-if="userRole === 'seller' && ['in_progress', 'revision', 'delivered'].includes(order.status)"
            @click="$emit('dispute')"
            :disabled="actionLoading"
            class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-cb-warning/30 bg-cb-warning-subtle py-2.5 text-sm font-semibold text-cb-warning hover:opacity-90 disabled:opacity-60"
          >
            <i class="fa-solid fa-scale-balanced"></i> Open Dispute
          </button>
          <!-- Buyer can dispute in_progress, revision, delivered -->
          <button
            v-if="userRole === 'buyer' && ['in_progress', 'revision', 'delivered'].includes(order.status)"
            @click="$emit('dispute')"
            :disabled="actionLoading"
            class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-cb-warning/30 bg-cb-warning-subtle py-2.5 text-sm font-semibold text-cb-warning hover:opacity-90 disabled:opacity-60"
          >
            <i class="fa-solid fa-scale-balanced"></i> Open Dispute
          </button>
        </div>

        <!-- Terminal state messages -->
        <div
          v-if="order.status === 'completed'"
          class="flex items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-field py-3 text-sm font-semibold text-cb-accent"
        >
          <i class="fa-solid fa-circle-check"></i>
          Order Completed
        </div>
        <div
          v-if="order.status === 'cancelled'"
          class="flex items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-field py-3 text-sm text-cb-muted"
        >
          <i class="fa-solid fa-ban"></i>
          Order Cancelled
        </div>
        <div
          v-if="order.status === 'disputed'"
          class="flex items-center justify-center gap-2 rounded-xl border border-cb-negative/20 bg-cb-negative-subtle py-3 text-sm font-semibold text-cb-negative"
        >
          <i class="fa-solid fa-scale-balanced"></i>
          Under Admin Review
        </div>

        <!-- Loading indicator -->
        <div
          v-if="actionLoading"
          class="flex items-center justify-center gap-2 pt-1 text-xs text-cb-muted"
        >
          <i class="fa-solid fa-spinner fa-spin"></i> Processing…
        </div>
      </footer>
    </template>

    <!-- Error state -->
    <template v-else-if="!loading">
      <div
        class="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center"
      >
        <i class="fa-solid fa-circle-exclamation text-3xl text-cb-muted"></i>
        <p class="text-sm text-cb-muted">Could not load order details.</p>
        <button
          @click="$emit('close')"
          class="text-xs text-cb-accent hover:underline"
        >
          Close
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useReviewStore } from '@/stores/reviewStore'
import { useToast } from '@/composables/useToast'

const reviewStore = useReviewStore()
const toast = useToast()

// Review state
const reviewRating = ref(0)
const reviewComment = ref('')
const reviewSubmitted = ref(false)
const existingReview = ref(null)

const props = defineProps({
  order: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  actionLoading: { type: Boolean, default: false },
  userRole: { type: String, default: null }, // 'seller' | 'buyer'
});

defineEmits([
  "close",
  "pay",
  "deliver",
  "confirm",
  "revision",
  "dispute",
  "cancel",
  "chat",
]);

/**
 * True once admin has cleared the seller's earnings.
 * Checks all likely backend field names so we're not fragile to naming.
 */
const earningsCleared = computed(() => {
  const o = props.order
  if (!o) return false
  return !!(
    o.earningsCleared ||
    o.earningsClearedAt ||
    o.sellerEarningsClearedAt ||
    o.earningsPaid ||
    o.sellerPaid
  )
})

function getParty(field) {
  const val = props.order?.[field];
  if (typeof val === "object" && val) return val;
  return null;
}

function nameOf(field) {
  const p = getParty(field);
  if (p)
    return (
      p.displayName ||
      `${p.firstName || ""} ${p.lastName || ""}`.trim() ||
      "Unknown"
    );
  return "Unknown";
}

function initialsOf(field) {
  const p = getParty(field);
  if (p) {
    const f = p.firstName?.[0] || "";
    const l = p.lastName?.[0] || "";
    return (f + l).toUpperCase() || "?";
  }
  return "?";
}

const sellerName = computed(() => nameOf("sellerId"));
const buyerName = computed(() => nameOf("buyerId"));
const sellerAvatar = computed(() => getParty("sellerId")?.avatar || null);
const buyerAvatar = computed(() => getParty("buyerId")?.avatar || null);

// Chat when work is active (include revision — seller and buyer need to coordinate)
const canChat = computed(() => {
  if (!props.order) return false;
  return ["in_progress", "revision", "delivered"].includes(props.order.status);
});

const STATUS_MAP = {
  pending_payment: {
    label: "Awaiting Payment",
    cls: "bg-cb-warning-subtle text-cb-warning",
    dot: "bg-cb-warning",
  },
  pending: {
    label: "Pending",
    cls: "bg-cb-warning-subtle text-cb-warning",
    dot: "bg-cb-warning",
  },
  in_progress: {
    label: "In Progress",
    cls: "bg-cb-accent-subtle text-cb-accent",
    dot: "bg-cb-accent",
  },
  revision: {
    label: "Revision",
    cls: "bg-cb-warning-subtle text-cb-warning",
    dot: "bg-cb-warning",
  },
  delivered: {
    label: "Delivered",
    cls: "bg-cb-accent-subtle text-cb-accent",
    dot: "bg-cb-accent",
  },
  completed: {
    label: "Completed",
    cls: "bg-cb-field text-cb-muted",
    dot: "bg-cb-muted",
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-cb-field text-cb-muted",
    dot: "bg-cb-muted",
  },
  disputed: {
    label: "Disputed",
    cls: "bg-cb-negative-subtle text-cb-negative",
    dot: "bg-cb-negative",
  },
};

const statusLabel = computed(
  () => STATUS_MAP[props.order?.status]?.label || "",
);
const statusClass = computed(() => STATUS_MAP[props.order?.status]?.cls || "");
const statusDot = computed(() => STATUS_MAP[props.order?.status]?.dot || "");

function formatDateTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// Only buyers can review, only after completion
const showReviewSection = computed(() => {
  return props.userRole === 'buyer' &&
         props.order?.status === 'completed' &&
         !existingReview.value &&
         !reviewSubmitted.value
})

// Check if the buyer already reviewed this order by looking through myReviews
async function fetchExistingReview() {
  if (!props.order?._id || props.userRole !== 'buyer') return
  try {
    // Load buyer's own reviews if not already loaded
    if (!reviewStore.myReviews.length) {
      await reviewStore.fetchMyReviews()
    }
    // Find a review for this order
    const found = reviewStore.myReviews.find(
      (r) => r.refId === props.order._id && r.refType === 'order'
    )
    existingReview.value = found || null
    if (found) {
      reviewSubmitted.value = true
    }
  } catch {
    // Silently ignore — absence of reviews is fine
  }
}

async function submitReview() {
  if (!reviewRating.value || !props.order?._id) return
  try {
    const review = await reviewStore.createReview({
      refId: props.order._id,
      refType: 'order',
      rating: reviewRating.value,
      comment: reviewComment.value,
    })
    existingReview.value = review
    reviewSubmitted.value = true
    toast.success('Review submitted successfully')
  } catch (err) {
    toast.error(reviewStore.error || err?.response?.data?.message || 'Failed to submit review')
  }
}

// Reset review state and fetch when order changes
watch(() => props.order, (newOrder) => {
  reviewRating.value = 0
  reviewComment.value = ''
  reviewSubmitted.value = false
  existingReview.value = null
  if (newOrder) {
    fetchExistingReview()
  }
}, { immediate: true })
</script>