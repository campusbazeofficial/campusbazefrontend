<template>
  <div class="min-h-screen bg-cb-base">

    <!-- ─── Header ─────────────────────────────────────────────── -->
    <header class="sticky -top-8 z-20 border-b border-cb-divider bg-cb-base/95 backdrop-blur-sm">
      <div class="mx-auto flex max-w-7xl items-center gap-3  py-3 ">
        <button
          @click="goBack"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cb-divider bg-cb-card text-cb-muted transition-colors hover:bg-cb-field hover:text-cb-text"
          aria-label="Go back"
        >
          <i class="fa-solid fa-arrow-left text-sm"></i>
        </button>

        <div class="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
          <span class="hidden font-medium text-cb-muted sm:inline">My Services</span>
          <i class="fa-solid fa-chevron-right hidden text-[9px] text-cb-muted-40 sm:inline"></i>
          <span class="truncate font-semibold text-cb-text">
            Order #{{ order?._id?.slice(-8).toUpperCase() || '…' }}
          </span>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <template v-if="order">
            <span :class="['inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold', statusClass]">
              <span :class="['h-1.5 w-1.5 rounded-full', statusDot]"></span>
              {{ statusLabel }}
            </span>
          </template>
          <div v-else-if="loading" class="h-5 w-24 animate-pulse rounded-full bg-cb-field"></div>
        </div>
      </div>
    </header>

    <!-- ─── Loading ─────────────────────────────────────────────── -->
    <div v-if="loading" class="mx-auto max-w-7xl  py-8 ">
      <div class="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8">
        <div class="order-1 space-y-4">
          <div class="space-y-2">
            <div class="h-7 w-2/3 animate-pulse rounded-xl bg-cb-field"></div>
            <div class="h-4 w-1/4 animate-pulse rounded bg-cb-field"></div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="h-16 animate-pulse rounded-xl bg-cb-field"></div>
            <div class="h-16 animate-pulse rounded-xl bg-cb-field"></div>
          </div>
          <div class="h-40 animate-pulse rounded-2xl bg-cb-field"></div>
        </div>
        <div class="order-2 h-64 animate-pulse rounded-2xl bg-cb-field"></div>
      </div>
    </div>

    <!-- ─── Error ────────────────────────────────────────────────── -->
    <div v-else-if="loadError" class="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-cb-negative-subtle">
        <i class="fa-solid fa-circle-exclamation text-2xl text-cb-negative"></i>
      </div>
      <div>
        <p class="font-semibold text-cb-text">Could not load order</p>
        <p class="mt-1 text-sm text-cb-muted">{{ loadError }}</p>
      </div>
      <button @click="load" class="rounded-xl bg-cb-accent px-5 py-2.5 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark">
        Try again
      </button>
    </div>

    <!-- ─── Page Body ────────────────────────────────────────────── -->
    <template v-else-if="order">
      <div class="mx-auto max-w-7xl  py-6   lg:py-8">

        <!--
          Same three-child ordering pattern as Errand/ServiceDetailPage:
          Mobile  → ① service info  →  ② action panel  →  ③ details/timeline/review
          Desktop → col-1: ①③ stacked | col-2: ② sticky sidebar
        -->
        <div class="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8">

          <!-- ①  Service title + parties ─────────────────────────── -->
          <div class="order-1 space-y-4">
            <div>
              <h1 class="text-xl font-bold text-cb-text sm:text-2xl">
                {{ order.service?.title || order.listingId?.title || 'Service Order' }}
              </h1>
              <p class="mt-1 text-xs text-cb-muted">Order #{{ order._id?.slice(-8).toUpperCase() }}</p>
            </div>

            <!-- Seller + Buyer cards -->
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-2xl border border-cb-divider bg-cb-card p-3 sm:p-4">
                <p class="mb-2 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">Seller</p>
                <div class="flex items-center gap-2.5">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cb-accent text-[10px] font-bold text-cb-contrast">
                    <img v-if="sellerAvatar" :src="sellerAvatar" class="h-full w-full object-cover" alt="" />
                    <span v-else>{{ initialsOf('sellerId') }}</span>
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-cb-text">{{ sellerName }}</p>
                    <p class="text-[10px] text-cb-muted">{{ userRole === 'seller' ? 'You' : 'Seller' }}</p>
                  </div>
                </div>
              </div>
              <div class="rounded-2xl border border-cb-divider bg-cb-card p-3 sm:p-4">
                <p class="mb-2 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">Buyer</p>
                <div class="flex items-center gap-2.5">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cb-accent text-[10px] font-bold text-cb-contrast">
                    <img v-if="buyerAvatar" :src="buyerAvatar" class="h-full w-full object-cover" alt="" />
                    <span v-else>{{ initialsOf('buyerId') }}</span>
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-cb-text">{{ buyerName }}</p>
                    <p class="text-[10px] text-cb-muted">{{ userRole === 'buyer' ? 'You' : 'Buyer' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ②  Action panel ─ sticky sidebar on desktop ─────────── -->
          <aside class="order-2 lg:sticky lg:top-[69px] lg:self-start">
            <div class="overflow-hidden rounded-2xl border border-cb-divider bg-cb-card ">

              <!-- Pending payment warning (buyer) -->
              <div v-if="userRole === 'buyer' && order.status === 'pending_payment'"
                class="border-b border-cb-divider bg-cb-warning-subtle px-4 py-3">
                <div class="flex items-start gap-2.5">
                  <i class="fa-solid fa-triangle-exclamation mt-0.5 shrink-0 text-sm text-cb-warning"></i>
                  <div>
                    <p class="text-sm font-semibold text-cb-warning">Payment Required</p>
                    <p class="mt-0.5 text-xs text-cb-warning/80">Complete payment to allow the seller to begin work.</p>
                  </div>
                </div>
              </div>

              <!-- Revision notice -->
              <div v-if="order.status === 'revision'"
                class="border-b border-cb-divider bg-cb-warning-subtle px-4 py-3">
                <div class="flex items-start gap-2.5">
                  <i class="fa-solid fa-rotate-left mt-0.5 shrink-0 text-sm text-cb-warning"></i>
                  <div>
                    <p class="text-sm font-semibold text-cb-warning">Revision In Progress</p>
                    <p class="mt-0.5 text-xs text-cb-warning/80">
                      {{ userRole === 'seller'
                        ? 'The buyer has requested changes. Re-deliver when ready.'
                        : 'Your revision request has been sent. The seller will re-deliver shortly.' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="space-y-2.5 p-4">

                <!-- Chat -->
                <button v-if="canChat" @click="handleChat"
                  class="flex w-full items-center justify-center gap-2 rounded-xl border border-cb-accent-muted bg-cb-base py-2.5 text-sm font-semibold text-cb-accent hover:bg-cb-accent-subtle">
                  <i class="fa-regular fa-message"></i>
                  Message {{ userRole === 'buyer' ? sellerName : buyerName }}
                </button>

                <!-- Pay Now (buyer, pending_payment) -->
                <button v-if="userRole === 'buyer' && order.status === 'pending_payment'"
                  @click="handlePay" :disabled="serviceStore.actionLoading"
                  class="flex w-full items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark disabled:opacity-60">
                  <i v-if="serviceStore.actionLoading" class="fa-solid fa-spinner fa-spin"></i>
                  <i v-else class="fa-solid fa-credit-card"></i>
                  {{ serviceStore.actionLoading ? 'Processing…' : 'Pay Now' }}
                </button>

                <!-- Cancel Order (buyer, pending_payment) -->
                <button v-if="userRole === 'buyer' && order.status === 'pending_payment'"
                  @click="openCancelModal" :disabled="serviceStore.actionLoading"
                  class="flex w-full items-center justify-center gap-2 rounded-xl border border-cb-negative/20 bg-cb-negative-subtle py-2.5 text-sm font-semibold text-cb-negative hover:opacity-90 disabled:opacity-60">
                  <i class="fa-solid fa-xmark"></i> Cancel Order
                </button>

                <!-- Deliver (seller, in_progress or revision) -->
                <button v-if="userRole === 'seller' && ['in_progress', 'revision'].includes(order.status)"
                  @click="deliverModal.open = true" :disabled="serviceStore.actionLoading"
                  class="flex w-full items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark disabled:opacity-60">
                  <i class="fa-solid fa-truck-fast"></i> Deliver Order
                </button>

                <!-- Confirm + Revision (buyer, delivered) -->
                <template v-if="userRole === 'buyer' && order.status === 'delivered'">
                  <button @click="openConfirmModal" :disabled="serviceStore.actionLoading"
                    class="flex w-full items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark disabled:opacity-60">
                    <i class="fa-solid fa-check"></i> Confirm & Release
                  </button>
                  <button @click="revisionModal.open = true" :disabled="serviceStore.actionLoading"
                    class="flex w-full items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-card py-2.5 text-sm font-semibold text-cb-text hover:bg-cb-field disabled:opacity-60">
                    <i class="fa-solid fa-rotate-left"></i> Request Revision
                  </button>
                </template>

                <!-- Dispute (both, active statuses) -->
                <button
                  v-if="['in_progress', 'revision', 'delivered'].includes(order.status)"
                  @click="disputeModal.open = true" :disabled="serviceStore.actionLoading"
                  class="flex w-full items-center justify-center gap-2 rounded-xl border border-cb-warning/30 bg-cb-warning-subtle py-2.5 text-sm font-semibold text-cb-warning hover:opacity-90 disabled:opacity-60">
                  <i class="fa-solid fa-scale-balanced"></i> Open Dispute
                </button>

                <!-- Terminal states -->
                <div v-if="order.status === 'completed'"
                  class="flex items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-field py-3 text-sm font-semibold text-cb-accent">
                  <i class="fa-solid fa-circle-check"></i> Order Completed
                </div>
                <div v-if="order.status === 'cancelled'"
                  class="flex items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-field py-3 text-sm text-cb-muted">
                  <i class="fa-solid fa-ban"></i> Order Cancelled
                </div>
                <div v-if="order.status === 'disputed'"
                  class="flex items-center justify-center gap-2 rounded-xl border border-cb-negative/20 bg-cb-negative-subtle py-3 text-sm font-semibold text-cb-negative">
                  <i class="fa-solid fa-scale-balanced"></i> Under Admin Review
                </div>

                <!-- Seller: completed earnings notice -->
                <div v-if="order.status === 'completed' && userRole === 'seller' && !earningsCleared"
                  class="flex items-start gap-2.5 rounded-xl border border-cb-accent/20 bg-cb-accent-subtle p-3">
                  <i class="fa-solid fa-hourglass-half mt-0.5 shrink-0 text-xs text-cb-accent"></i>
                  <p class="text-xs text-cb-accent/80">
                    ₦{{ order.sellerEarningsNGN?.toLocaleString() }} is in pending earnings. Admin must approve before withdrawal.
                  </p>
                </div>
                <div v-if="order.status === 'completed' && userRole === 'seller' && earningsCleared"
                  class="flex items-start gap-2.5 rounded-xl border border-cb-accent/20 bg-cb-accent-subtle p-3">
                  <i class="fa-solid fa-circle-check mt-0.5 shrink-0 text-xs text-cb-accent"></i>
                  <p class="text-xs text-cb-accent/80">
                    ₦{{ order.sellerEarningsNGN?.toLocaleString() }} approved and available for withdrawal.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <!-- ③  Order details, delivery info, timeline, review ─────── -->
          <div class="order-3 space-y-5">

            <!-- Order Summary -->
            <section class="rounded-2xl border border-cb-divider bg-cb-card p-4 sm:p-5">
              <p class="mb-3 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">Order Summary</p>
              <div class="space-y-2.5 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-cb-muted">Tier</span>
                  <span class="font-semibold capitalize text-cb-text">{{ order.tierName || order.tier?.name || '—' }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-cb-muted">Amount</span>
                  <span class="font-semibold text-cb-text">₦{{ (order.amount ?? order.totalAmount)?.toLocaleString() ?? '—' }}</span>
                </div>
                <div v-if="order.commissionNGN != null" class="flex items-center justify-between">
                  <span class="text-cb-muted">Platform Fee</span>
                  <span class="text-cb-text">₦{{ order.commissionNGN?.toLocaleString() }}</span>
                </div>
                <div v-if="order.cbcFeeCharged != null" class="flex items-center justify-between">
                  <span class="text-cb-muted">CBC Fee</span>
                  <span class="text-cb-text">₦{{ order.cbcFeeCharged?.toLocaleString() }}</span>
                </div>
                <div v-if="order.sellerEarningsNGN != null" class="flex items-center justify-between">
                  <span class="text-cb-muted">Seller Earnings</span>
                  <span class="font-semibold text-cb-accent">₦{{ order.sellerEarningsNGN?.toLocaleString() }}</span>
                </div>
                <div v-if="order.deliveryDue" class="flex items-center justify-between">
                  <span class="text-cb-muted">Delivery Due</span>
                  <span class="text-cb-text">{{ formatDateTime(order.deliveryDue) }}</span>
                </div>
                <div v-if="order.revisionCount != null" class="flex items-center justify-between">
                  <span class="text-cb-muted">Revisions Used</span>
                  <span class="text-cb-text">{{ order.revisionCount }}</span>
                </div>
                <div class="flex items-center justify-between border-t border-cb-divider pt-2.5">
                  <span class="font-bold text-cb-text">Total Paid</span>
                  <span class="text-base font-bold text-cb-text">₦{{ (order.amount ?? order.totalAmount)?.toLocaleString() ?? '—' }}</span>
                </div>
              </div>
            </section>

            <!-- Escrow ref -->
            <div v-if="order.escrowReference"
              class="flex items-center justify-between rounded-2xl border border-cb-divider bg-cb-card px-4 py-3">
              <span class="text-xs text-cb-muted">Escrow Ref</span>
              <span class="font-mono text-xs text-cb-text">{{ order.escrowReference }}</span>
            </div>

            <!-- Requirements -->
            <section v-if="order.requirements" class="rounded-2xl border border-cb-divider bg-cb-card p-4 sm:p-5">
              <p class="mb-2 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">Requirements</p>
              <p class="whitespace-pre-line text-sm leading-relaxed text-cb-text">{{ order.requirements }}</p>
            </section>

            <!-- Delivery note -->
            <section v-if="order.deliveryNote" class="rounded-2xl border border-cb-accent/20 bg-cb-accent-subtle p-4 sm:p-5">
              <p class="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-accent">
                <i class="fa-solid fa-truck-fast"></i> Delivery Note
              </p>
              <p class="whitespace-pre-line text-sm leading-relaxed text-cb-text">{{ order.deliveryNote }}</p>
            </section>

            <!-- Dispute reason -->
            <section v-if="order.disputeReason || order.status === 'disputed'"
              class="rounded-2xl border border-cb-negative/20 bg-cb-negative-subtle p-4 sm:p-5">
              <p class="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-negative">
                <i class="fa-solid fa-scale-balanced"></i> Dispute — Under Admin Review
              </p>
              <p v-if="order.disputeReason" class="text-sm text-cb-text">{{ order.disputeReason }}</p>
              <p v-else class="text-xs text-cb-negative/80">Our team will contact both parties shortly.</p>
            </section>

            <!-- Timeline -->
            <section class="rounded-2xl border border-cb-divider bg-cb-card p-4 sm:p-5">
              <p class="mb-4 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">Timeline</p>
              <ol class="space-y-4 border-l border-cb-divider pl-5">
                <li class="relative">
                  <div class="absolute -left-[1.4rem] mt-0.5 h-3 w-3 rounded-full border-2 border-cb-card bg-cb-muted"></div>
                  <p class="text-xs font-semibold text-cb-text">Order placed</p>
                  <p class="mt-0.5 text-[10px] text-cb-muted">{{ formatDateTime(order.createdAt) }}</p>
                </li>
                <li v-if="order.deliveredAt" class="relative">
                  <div class="absolute -left-[1.4rem] mt-0.5 h-3 w-3 rounded-full border-2 border-cb-card bg-cb-accent"></div>
                  <p class="text-xs font-semibold text-cb-text">Delivered</p>
                  <p class="mt-0.5 text-[10px] text-cb-muted">{{ formatDateTime(order.deliveredAt) }}</p>
                </li>
                <li v-if="order.completedAt" class="relative">
                  <div class="absolute -left-[1.4rem] mt-0.5 h-3 w-3 rounded-full border-2 border-cb-card bg-cb-accent"></div>
                  <p class="text-xs font-semibold text-cb-text">Completed</p>
                  <p class="mt-0.5 text-[10px] text-cb-muted">{{ formatDateTime(order.completedAt) }}</p>
                </li>
              </ol>
            </section>

            <!-- Existing review display -->
            <section v-if="existingReview" class="rounded-2xl border border-cb-divider bg-cb-card p-4 sm:p-5">
              <p class="mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">
                <i class="fa-solid fa-star text-cb-warning"></i> Your Review
              </p>
              <div class="mb-2 flex items-center gap-0.5">
                <i v-for="s in 5" :key="s" :class="['text-sm', s <= existingReview.rating ? 'fa-solid fa-star text-cb-warning' : 'fa-regular fa-star text-cb-muted-40']"></i>
              </div>
              <p v-if="existingReview.comment" class="text-sm text-cb-text">{{ existingReview.comment }}</p>
            </section>

            <!-- Leave a review (buyer, after completion, not yet reviewed) -->
            <section v-if="showReviewSection" class="rounded-2xl border border-cb-accent/20 bg-cb-accent-subtle p-4 sm:p-5">
              <p class="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-accent">
                <i class="fa-solid fa-star"></i> Leave a Review
              </p>
              <div v-if="!reviewSubmitted">
                <div class="mb-3 flex gap-1">
                  <button v-for="star in 5" :key="star" @click="reviewRating = star"
                    class="text-2xl transition-transform hover:scale-110"
                    :class="star <= reviewRating ? 'text-cb-warning' : 'text-cb-muted-40'">
                    <i :class="star <= reviewRating ? 'fa-solid fa-star' : 'fa-regular fa-star'"></i>
                  </button>
                </div>
                <textarea v-model="reviewComment" rows="2" maxlength="500"
                  placeholder="Share your experience with this service..."
                  class="mb-1 w-full resize-none rounded-xl border border-cb-divider bg-cb-card p-3 text-sm text-cb-text placeholder:text-cb-muted-40 focus:border-cb-accent focus:outline-none"></textarea>
                <p class="mb-3 text-[10px] text-cb-muted">{{ reviewComment.length }}/500</p>
                <button @click="submitReview" :disabled="!reviewRating || reviewStore.submitting"
                  class="flex w-full items-center justify-center gap-2 rounded-xl bg-cb-accent py-2.5 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark disabled:opacity-60">
                  <i v-if="reviewStore.submitting" class="fa-solid fa-spinner fa-spin"></i>
                  <i v-else class="fa-solid fa-paper-plane"></i>
                  {{ reviewStore.submitting ? 'Submitting...' : 'Submit Review' }}
                </button>
              </div>
              <div v-else class="flex flex-col items-center gap-2 py-2 text-center">
                <i class="fa-solid fa-circle-check text-2xl text-cb-accent"></i>
                <p class="text-sm font-semibold text-cb-text">Review Submitted!</p>
                <p class="text-xs text-cb-muted">Thank you for your feedback.</p>
              </div>
            </section>

            <div class="h-6 lg:h-10"></div>
          </div>

        </div>
      </div>
    </template>

    <!-- ─── Deliver Modal ──────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="deliverModal.open" class="fixed inset-0 z-[300] flex items-end justify-center bg-cb-overlay backdrop-blur-sm sm:items-center sm:p-4" @click.self="deliverModal.open = false">
          <div class="w-full overflow-hidden rounded-t-3xl bg-cb-base  sm:max-w-md sm:rounded-2xl">
            <div class="flex justify-center pb-1 pt-3 sm:hidden"><div class="h-1 w-10 rounded-full bg-cb-divider"></div></div>
            <div class="p-6">
              <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cb-accent-subtle">
                <i class="fa-solid fa-truck-fast text-xl text-cb-accent"></i>
              </div>
              <h3 class="mb-1 text-lg font-bold text-cb-text">Deliver Order</h3>
              <p class="mb-5 text-sm text-cb-muted">Add a delivery note (optional).</p>
              <textarea v-model="deliverModal.note" rows="3" placeholder="e.g., Files attached, work completed..."
                class="w-full rounded-xl border border-cb-divider bg-cb-field p-3 text-sm text-cb-text placeholder:text-cb-muted-40 focus:border-cb-accent focus:outline-none"></textarea>
              <div class="mt-4 flex gap-3">
                <button @click="deliverModal.open = false" class="flex-1 rounded-xl border border-cb-divider bg-cb-card py-3 text-sm font-semibold text-cb-text hover:bg-cb-field">Cancel</button>
                <button @click="handleDeliver" :disabled="serviceStore.actionLoading"
                  class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark disabled:opacity-60">
                  <i v-if="serviceStore.actionLoading" class="fa-solid fa-spinner fa-spin text-xs"></i>
                  <i v-else class="fa-solid fa-check text-xs"></i>
                  Deliver
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ─── Revision Modal ─────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="revisionModal.open" class="fixed inset-0 z-[300] flex items-end justify-center bg-cb-overlay backdrop-blur-sm sm:items-center sm:p-4" @click.self="revisionModal.open = false">
          <div class="w-full overflow-hidden rounded-t-3xl bg-cb-base  sm:max-w-md sm:rounded-2xl">
            <div class="flex justify-center pb-1 pt-3 sm:hidden"><div class="h-1 w-10 rounded-full bg-cb-divider"></div></div>
            <div class="p-6">
              <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cb-warning-subtle">
                <i class="fa-solid fa-rotate-left text-xl text-cb-warning"></i>
              </div>
              <h3 class="mb-1 text-lg font-bold text-cb-text">Request Revision</h3>
              <p class="mb-5 text-sm text-cb-muted">Describe what changes you need.</p>
              <textarea v-model="revisionModal.note" rows="3" placeholder="Revision details..."
                class="w-full rounded-xl border border-cb-divider bg-cb-field p-3 text-sm text-cb-text placeholder:text-cb-muted-40 focus:border-cb-accent focus:outline-none"></textarea>
              <div class="mt-4 flex gap-3">
                <button @click="revisionModal.open = false" class="flex-1 rounded-xl border border-cb-divider bg-cb-card py-3 text-sm font-semibold text-cb-text hover:bg-cb-field">Cancel</button>
                <button @click="handleRevision" :disabled="serviceStore.actionLoading"
                  class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-warning py-3 text-sm font-semibold text-cb-contrast hover:bg-cb-warning/80 disabled:opacity-60">
                  <i v-if="serviceStore.actionLoading" class="fa-solid fa-spinner fa-spin text-xs"></i>
                  <i v-else class="fa-solid fa-pen text-xs"></i>
                  Request Revision
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ─── Dispute Modal ──────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="disputeModal.open" class="fixed inset-0 z-[300] flex items-end justify-center bg-cb-overlay backdrop-blur-sm sm:items-center sm:p-4" @click.self="disputeModal.open = false">
          <div class="w-full overflow-hidden rounded-t-3xl bg-cb-base  sm:max-w-md sm:rounded-2xl">
            <div class="flex justify-center pb-1 pt-3 sm:hidden"><div class="h-1 w-10 rounded-full bg-cb-divider"></div></div>
            <div class="p-6">
              <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cb-warning-subtle">
                <i class="fa-solid fa-scale-balanced text-xl text-cb-warning"></i>
              </div>
              <h3 class="mb-1 text-lg font-bold text-cb-text">Open Dispute</h3>
              <p class="mb-5 text-sm text-cb-muted">Describe the issue. Our team will review and contact both parties.</p>
              <textarea v-model="disputeModal.reason" rows="3" placeholder="Describe the issue with this order..."
                class="w-full rounded-xl border border-cb-divider bg-cb-field p-3 text-sm text-cb-text placeholder:text-cb-muted-40 focus:border-cb-accent focus:outline-none"></textarea>
              <div class="mt-4 flex gap-3">
                <button @click="disputeModal.open = false" class="flex-1 rounded-xl border border-cb-divider bg-cb-card py-3 text-sm font-semibold text-cb-text hover:bg-cb-field">Cancel</button>
                <button @click="handleDispute" :disabled="!disputeModal.reason.trim() || serviceStore.actionLoading"
                  class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-warning py-3 text-sm font-semibold text-cb-contrast hover:bg-cb-warning/80 disabled:opacity-60">
                  <i v-if="serviceStore.actionLoading" class="fa-solid fa-spinner fa-spin text-xs"></i>
                  <i v-else class="fa-solid fa-scale-balanced text-xs"></i>
                  Open Dispute
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ─── Confirm Modal ──────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="overlay">
        <ConfirmModal
          v-if="confirmModal.open"
          :title="confirmModal.title"
          :message="confirmModal.message"
          :confirm-text="confirmModal.confirmText"
          :variant="confirmModal.variant"
          :loading="serviceStore.actionLoading"
          @confirm="confirmModal.onConfirm"
          @cancel="confirmModal.open = false"
        />
      </Transition>
    </Teleport>

    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useServiceStore } from '@/stores/serviceStore'
import { useUserStore } from '@/stores/userStore'
import { useReviewStore } from '@/stores/reviewStore'
import { useToast } from '@/composables/useToast'

import ConfirmModal from '@/components/reusables/ConfirmModal.vue'
import ToastContainer from '@/components/reusables/ToastContainer.vue'

const route = useRoute()
const router = useRouter()
const serviceStore = useServiceStore()
const userStore = useUserStore()
const reviewStore = useReviewStore()
const toast = useToast()

// ── State ──────────────────────────────────────────────────────
const loading = ref(true)
const loadError = ref(null)

const deliverModal  = ref({ open: false, note: '' })
const revisionModal = ref({ open: false, note: '' })
const disputeModal  = ref({ open: false, reason: '' })
const confirmModal  = ref({ open: false, title: '', message: '', confirmText: '', variant: 'danger', onConfirm: null })

// Review
const reviewRating    = ref(0)
const reviewComment   = ref('')
const reviewSubmitted = ref(false)
const existingReview  = ref(null)

// ── Data ───────────────────────────────────────────────────────
const order = computed(() => serviceStore.currentOrder)
const currentUserId = computed(() => userStore.user?._id || null)

const userRole = computed(() => {
  if (!order.value || !currentUserId.value) return null
  const buyerId  = typeof order.value.buyerId  === 'object' ? order.value.buyerId?._id  : order.value.buyerId
  const sellerId = typeof order.value.sellerId === 'object' ? order.value.sellerId?._id : order.value.sellerId
  if (buyerId  === currentUserId.value) return 'buyer'
  if (sellerId === currentUserId.value) return 'seller'
  return null
})

const earningsCleared = computed(() => {
  const o = order.value
  if (!o) return false
  return !!(o.earningsCleared || o.earningsClearedAt || o.sellerEarningsClearedAt || o.earningsPaid || o.sellerPaid)
})

const canChat = computed(() => {
  if (!order.value) return false
  return ['in_progress', 'revision', 'delivered'].includes(order.value.status)
})

const showReviewSection = computed(() =>
  userRole.value === 'buyer' &&
  order.value?.status === 'completed' &&
  !existingReview.value &&
  !reviewSubmitted.value
)

// ── Party helpers ──────────────────────────────────────────────
function getParty(field) {
  const val = order.value?.[field]
  return typeof val === 'object' && val ? val : null
}
function nameOf(field) {
  const p = getParty(field)
  if (p) return p.displayName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unknown'
  return 'Unknown'
}
function initialsOf(field) {
  const p = getParty(field)
  if (p) { const f = p.firstName?.[0] || '', l = p.lastName?.[0] || ''; return (f + l).toUpperCase() || '?' }
  return '?'
}
const sellerName   = computed(() => nameOf('sellerId'))
const buyerName    = computed(() => nameOf('buyerId'))
const sellerAvatar = computed(() => getParty('sellerId')?.avatar || null)
const buyerAvatar  = computed(() => getParty('buyerId')?.avatar || null)

// ── Status map ─────────────────────────────────────────────────
const STATUS_MAP = {
  pending_payment: { label: 'Awaiting Payment', cls: 'bg-cb-warning-subtle text-cb-warning', dot: 'bg-cb-warning' },
  in_progress:     { label: 'In Progress',      cls: 'bg-cb-accent-subtle text-cb-accent',   dot: 'bg-cb-accent' },
  revision:        { label: 'Revision',          cls: 'bg-cb-warning-subtle text-cb-warning', dot: 'bg-cb-warning' },
  delivered:       { label: 'Delivered',         cls: 'bg-cb-accent-subtle text-cb-accent',   dot: 'bg-cb-accent' },
  completed:       { label: 'Completed',         cls: 'bg-cb-field text-cb-muted',            dot: 'bg-cb-muted' },
  cancelled:       { label: 'Cancelled',         cls: 'bg-cb-field text-cb-muted',            dot: 'bg-cb-muted' },
  disputed:        { label: 'Disputed',          cls: 'bg-cb-negative-subtle text-cb-negative', dot: 'bg-cb-negative' },
}
const statusLabel = computed(() => STATUS_MAP[order.value?.status]?.label || '')
const statusClass = computed(() => STATUS_MAP[order.value?.status]?.cls || '')
const statusDot   = computed(() => STATUS_MAP[order.value?.status]?.dot || '')

// ── Load ───────────────────────────────────────────────────────
async function load() {
  loading.value = true
  loadError.value = null
  serviceStore.clearCurrentOrder?.()
  try {
    await serviceStore.fetchOrder(route.params.id)
  } catch (err) {
    loadError.value = err?.response?.data?.message || 'Failed to load order'
  } finally {
    loading.value = false
  }
}
onMounted(load)

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push({ name: 'MyServices' })
}

function formatDateTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

// ── Actions ────────────────────────────────────────────────────
async function handlePay() {
  try {
    const res = await serviceStore.payOrder(order.value._id)
    const url = res?.data?.payment?.authorizationUrl ?? res?.data?.authorizationUrl ?? res?.data?.authorization_url ?? res?.data?.paymentUrl ?? res?.data?.url
    if (url) { window.location.href = url }
    else { toast.success('Payment initiated. Check your email or retry from orders.'); await load() }
  } catch { toast.error(serviceStore.error || 'Failed to initiate payment') }
}

async function handleDeliver() {
  try {
    await serviceStore.deliverOrder(order.value._id, deliverModal.value.note)
    deliverModal.value = { open: false, note: '' }
    toast.success('Order marked as delivered')
    await load()
  } catch { toast.error(serviceStore.error || 'Failed to deliver') }
}

async function handleRevision() {
  try {
    await serviceStore.requestRevision(order.value._id, revisionModal.value.note)
    revisionModal.value = { open: false, note: '' }
    toast.success('Revision requested')
    await load()
  } catch { toast.error(serviceStore.error || 'Failed to request revision') }
}

async function handleDispute() {
  const reason = disputeModal.value.reason.trim()
  if (!reason) return
  try {
    await serviceStore.disputeOrder(order.value._id, reason)
    disputeModal.value = { open: false, reason: '' }
    toast.success('Dispute opened — our team will review shortly')
    await load()
  } catch { toast.error(serviceStore.error || 'Failed to open dispute') }
}

function openConfirmModal() {
  confirmModal.value = {
    open: true,
    title: 'Confirm Completion?',
    message: 'Confirming releases payment to the seller. Earnings are held in escrow until admin clears them for withdrawal.',
    confirmText: 'Confirm & Release',
    variant: 'success',
    onConfirm: async () => {
      try {
        await serviceStore.confirmOrder(order.value._id)
        toast.success('Order completed — seller earnings pending admin clearance')
        confirmModal.value.open = false
        await load()
      } catch { toast.error(serviceStore.error || 'Failed to confirm') }
    },
  }
}

function openCancelModal() {
  confirmModal.value = {
    open: true,
    title: 'Cancel Order?',
    message: 'This will cancel the order. You can only cancel before payment is confirmed.',
    confirmText: 'Cancel Order',
    variant: 'danger',
    onConfirm: async () => {
      try {
        await serviceStore.cancelOrder(order.value._id)
        toast.success('Order cancelled')
        confirmModal.value.open = false
        router.push({ name: 'MyServices' })
      } catch { toast.error(serviceStore.error || 'Failed to cancel') }
    },
  }
}

function handleChat() {
  if (!order.value || !currentUserId.value) return
  const buyerId  = typeof order.value.buyerId  === 'object' ? order.value.buyerId?._id  : order.value.buyerId
  const sellerId = typeof order.value.sellerId === 'object' ? order.value.sellerId?._id : order.value.sellerId
  const partnerId = currentUserId.value === buyerId ? sellerId : buyerId
  if (partnerId) router.push({ name: 'Chat', query: { userId: partnerId } })
}

// ── Review ─────────────────────────────────────────────────────
async function fetchExistingReview() {
  if (!order.value?._id || userRole.value !== 'buyer') return
  try {
    if (!reviewStore.myReviews.length) await reviewStore.fetchMyReviews()
    const found = reviewStore.myReviews.find(r => r.refId === order.value._id && r.refType === 'order')
    existingReview.value = found || null
    if (found) reviewSubmitted.value = true
  } catch { /* silent */ }
}

async function submitReview() {
  if (!reviewRating.value || !order.value?._id) return
  try {
    const review = await reviewStore.createReview({
      refId: order.value._id, refType: 'order',
      rating: reviewRating.value, comment: reviewComment.value,
    })
    existingReview.value = review
    reviewSubmitted.value = true
    toast.success('Review submitted successfully')
  } catch (err) { toast.error(reviewStore.error || err?.response?.data?.message || 'Failed to submit review') }
}

watch(order, (o) => {
  reviewRating.value = 0; reviewComment.value = ''; reviewSubmitted.value = false; existingReview.value = null
  if (o) fetchExistingReview()
}, { immediate: true })
</script>

<style scoped>
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.2s ease; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }
</style>