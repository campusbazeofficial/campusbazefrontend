<template>
  <div class="flex h-full flex-col bg-cb-base">
    <!-- Header -->
    <header
      class="flex shrink-0 items-center justify-between border-b border-cb-divider px-5 py-4"
    >
      <div class="flex items-center gap-2.5">
        <template v-if="errand">
          <span
            :class="[
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
              statusBadge(errand.status).bg,
            ]"
          >
            <span
              :class="[
                'h-1.5 w-1.5 rounded-full',
                statusBadge(errand.status).dot,
              ]"
            ></span>
            {{ formatStatus(errand.status) }}
          </span>
          <span
            v-if="urgent"
            class="inline-flex items-center gap-1 rounded-full border border-cb-warning/40 bg-cb-warning-subtle px-2 py-0.5 text-[10px] font-semibold text-cb-warning"
          >
            <i class="fa-solid fa-bolt text-[8px]"></i> Urgent
          </span>
        </template>
        <div
          v-else
          class="h-5 w-20 animate-pulse rounded-full bg-cb-field"
        ></div>
      </div>
      <button
        @click="$emit('close')"
        class="flex h-9 w-9 items-center justify-center rounded-lg text-cb-muted transition-colors hover:bg-cb-field hover:text-cb-text"
        aria-label="Close drawer"
      >
        <i class="fa-solid fa-times text-sm"></i>
      </button>
    </header>

    <!-- Skeleton -->
    <template v-if="loading">
      <div class="flex-1 space-y-5 overflow-y-auto p-5">
        <div class="space-y-2">
          <div class="h-6 w-3/4 animate-pulse rounded-xl bg-cb-field"></div>
          <div class="h-4 w-1/3 animate-pulse rounded-xl bg-cb-field"></div>
        </div>
        <div class="space-y-2">
          <div class="h-3 w-full animate-pulse rounded bg-cb-field"></div>
          <div class="h-3 w-5/6 animate-pulse rounded bg-cb-field"></div>
          <div class="h-3 w-4/6 animate-pulse rounded bg-cb-field"></div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="i in 4"
            :key="i"
            class="h-20 animate-pulse rounded-xl bg-cb-field"
          ></div>
        </div>
      </div>
    </template>

    <!-- Content -->
    <template v-else-if="errand">
      <div class="flex-1 overflow-y-auto">
        <div class="space-y-5 p-5">
          <!-- Title block -->
          <div>
            <div class="mb-2 flex items-center gap-2">
              <span
                class="inline-flex items-center gap-1.5 rounded-full bg-cb-accent-subtle px-2.5 py-1 text-xs font-semibold text-cb-accent"
              >
                <i
                  :class="[getCategoryIcon(errand.category), 'text-[10px]']"
                ></i>
                {{ getCategoryLabel(errand.category) }}
              </span>
              <span class="text-xs text-cb-muted"
                >• Posted {{ formatTimeAgo(errand.createdAt) }}</span
              >
            </div>
            <h2
              class="text-lg font-semibold leading-snug text-cb-text capitalize"
            >
              {{ errand.title }}
            </h2>
          </div>

          <!-- Description -->
          <section class="rounded-xl bg-cb-card p-4">
            <p
              class="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-muted"
            >
              <i class="fa-solid fa-align-left"></i>
              Description
            </p>
            <p class="whitespace-pre-line text-sm leading-relaxed text-cb-text">
              {{ errand.description }}
            </p>
          </section>

          <!-- Key details grid -->
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-xl bg-cb-card p-3.5">
              <p
                class="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-muted"
              >
                <i class="fa-solid fa-wallet"></i>Budget
              </p>
              <p class="text-lg font-semibold text-cb-text">
                ₦{{ errand.budget?.toLocaleString() }}
              </p>
              <span
                :class="[
                  'mt-1 inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                  errand.budgetType === 'fixed'
                    ? 'bg-cb-warning-subtle text-cb-warning'
                    : 'bg-cb-accent-subtle text-cb-accent',
                ]"
              >
                {{ errand.budgetType === "fixed" ? "Fixed" : "Negotiable" }}
              </span>
            </div>

            <div class="rounded-xl bg-cb-card p-3.5">
              <p
                class="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-muted"
              >
                <i class="fa-regular fa-calendar"></i>Deadline
              </p>
              <p
                :class="[
                  'text-sm font-semibold',
                  urgent ? 'text-cb-warning' : 'text-cb-text',
                ]"
              >
                {{ formatDate(errand.deadline) }}
              </p>
              <p
                :class="[
                  'text-xs',
                  urgent ? 'text-cb-warning' : 'text-cb-muted',
                ]"
              >
                {{ formatDeadlineRelative(errand.deadline) }}
              </p>
            </div>

            <div class="rounded-xl bg-cb-card p-3.5">
              <p
                class="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-muted"
              >
                <i class="fa-solid fa-location-dot"></i>Location
              </p>
              <p class="text-sm font-semibold text-cb-text">
                {{ errand.address }}
              </p>
            </div>

            <div class="rounded-xl bg-cb-card p-3.5">
              <p
                class="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-muted"
              >
                <i class="fa-solid fa-coins"></i>CBC Fee
              </p>
              <p class="text-sm font-semibold text-cb-text">
                ₦{{ (errand.cbcFeeCharged || 0).toLocaleString() }}
              </p>
            </div>
          </div>

          <!-- Poster section -->
          <section class="rounded-xl bg-cb-card p-4">
            <p
              class="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-muted"
            >
              <i class="fa-solid fa-user"></i>Posted by
            </p>
            <div class="flex items-center gap-3">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cb-accent text-sm font-bold text-cb-contrast overflow-hidden"
              >
                <img
                  v-if="posterAvatar"
                  :src="posterAvatar"
                  class="h-full w-full object-cover"
                  alt="Poster avatar"
                />
                <span v-else>{{ posterInitials }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-bold text-cb-text">
                  {{ isMyErrand ? "You" : posterDisplayName || "Anonymous" }}
                </p>
                <div class="mt-0.5 flex flex-wrap items-center gap-2">
                  <div class="flex items-center gap-0.5">
                    <i
                      v-for="s in 5"
                      :key="s"
                      :class="[
                        'fa-star text-[10px]',
                        s <= (errand.posterId?.averageRating ?? 0)
                          ? 'fa-solid text-cb-warning'
                          : 'fa-regular text-cb-muted-40',
                      ]"
                    ></i>
                  </div>
                  <span
                    v-if="errand.posterId?.identityVerificationBadge"
                    class="inline-flex items-center gap-0.5 text-[10px] font-semibold text-cb-accent"
                  >
                    <i class="fa-solid fa-circle-check text-[9px]"></i> Verified
                  </span>
                </div>
              </div>
              <!-- View Profile — only when it's not the current user's own errand -->
              <button
                v-if="!isMyErrand && errand.posterId?.slug"
                @click="goToProfile(errand.posterId.slug)"
                class="ml-auto flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-cb-divider bg-cb-card px-3 text-xs font-semibold text-cb-muted transition-colors hover:border-cb-accent hover:bg-cb-accent-subtle hover:text-cb-accent"
              >
                <i class="fa-solid fa-user text-[10px]"></i>
                View Profile
              </button>
            </div>
          </section>

          <!-- Accepted runner section (when errand has been assigned) -->
          <section
            v-if="
              acceptedBid &&
              ['accepted', 'in_progress', 'completed', 'confirmed'].includes(
                errand.status,
              )
            "
            class="rounded-xl bg-cb-card p-4"
          >
            <p
              class="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-muted"
            >
              <i class="fa-solid fa-person-running"></i>Assigned runner
            </p>
            <div class="flex items-center gap-3">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cb-accent-subtle text-sm font-bold text-cb-text overflow-hidden"
              >
                <img
                  v-if="acceptedBid.runnerId?.avatar"
                  :src="acceptedBid.runnerId.avatar"
                  class="h-full w-full object-cover"
                  alt=""
                />
                <span v-else>{{ getRunnerInitials(acceptedBid) }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-bold text-cb-text">
                  {{ getRunnerName(acceptedBid) }}
                </p>
                <p class="text-xs text-cb-muted">
                  ₦{{ acceptedBid.amount?.toLocaleString() }} agreed
                </p>
              </div>
              <!-- View Profile — only when current user is not the runner -->
              <button
                v-if="!isAcceptedRunner && acceptedBid.runnerId?.slug"
                @click="goToProfile(acceptedBid.runnerId.slug)"
                class="ml-auto flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-cb-divider bg-cb-card px-3 text-xs font-semibold text-cb-muted transition-colors hover:border-cb-accent hover:bg-cb-accent-subtle hover:text-cb-accent"
              >
                <i class="fa-solid fa-user text-[10px]"></i>
                View Profile
              </button>
            </div>
          </section>

          <!-- Bids section -->
          <section v-if="(errand.bidStats?.count > 0) || (errand.bids?.length > 0)">

            <!-- Bid Stats — only shown when at least one bid exists -->
            <div
              v-if="errand.bidStats && errand.bidStats.count > 0"
              class="mb-4 grid grid-cols-4 gap-2 rounded-xl border border-cb-divider bg-cb-card p-3"
            >
              <div class="text-center">
                <p class="text-xl font-extrabold text-cb-text">{{ errand.bidStats.count }}</p>
                <p class="text-[10px] text-cb-muted">Total Bids</p>
              </div>
              <div class="text-center">
                <p class="text-sm font-bold text-cb-text">&#8358;{{ errand.bidStats.min?.toLocaleString() }}</p>
                <p class="text-[10px] text-cb-muted">Min</p>
              </div>
              <div class="text-center">
                <p class="text-sm font-bold text-cb-text">&#8358;{{ errand.bidStats.max?.toLocaleString() }}</p>
                <p class="text-[10px] text-cb-muted">Max</p>
              </div>
              <div class="text-center">
                <p class="text-sm font-bold text-cb-accent">&#8358;{{ Math.round(errand.bidStats.avg)?.toLocaleString() }}</p>
                <p class="text-[10px] text-cb-muted">Avg</p>
              </div>
            </div>

            <!-- Section header -->
            <div class="mb-3 flex items-center justify-between">
              <p class="flex items-center gap-1.5 text-xs font-bold text-cb-text">
                <i class="fa-solid fa-gavel text-cb-muted"></i>
                {{ isMyErrand ? `All Bids (${errand.bids?.length ?? 0})` : 'Your Bid' }}
              </p>
            </div>

            <!-- No bids -->
            <div
              v-if="!errand.bids?.length"
              class="flex flex-col items-center justify-center rounded-xl border border-dashed border-cb-divider bg-cb-card py-8"
            >
              <i class="fa-solid fa-inbox mb-2 text-2xl text-cb-muted-40"></i>
              <p class="text-sm font-semibold text-cb-text">
                {{ isMyErrand ? 'No bids yet' : "You haven't bid yet" }}
              </p>
              <p class="text-xs text-cb-muted">
                {{ isMyErrand ? 'Share your errand to attract runners.' : 'Place a bid to participate.' }}
              </p>
            </div>

            <div v-else class="space-y-3">
              <article
                v-for="bid in errand.bids"
                :key="bid._id"
                :class="[
                  'rounded-xl border p-4 transition-all',
                  bid.status === 'accepted'
                    ? 'border-cb-accent-muted bg-cb-accent-subtle'
                    : isCurrentUserBid(bid)
                      ? 'border-cb-warning/40 bg-cb-warning-subtle/30'
                      : 'border-cb-divider bg-cb-card',
                ]"
              >
                <div
                  v-if="isCurrentUserBid(bid)"
                  class="mb-2.5 flex items-center gap-1.5 rounded-lg bg-cb-warning/10 px-2.5 py-1.5"
                >
                  <i class="fa-solid fa-gavel text-[10px] text-cb-warning"></i>
                  <span class="text-[11px] font-bold text-cb-warning">Your bid</span>
                  <span class="ml-auto text-[10px] capitalize text-cb-warning/70">{{ bid.status }}</span>
                </div>

                <div class="mb-2 flex items-start justify-between gap-2">
                  <div class="flex items-center gap-2.5">
                    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cb-field text-xs font-bold text-cb-text overflow-hidden">
                      <img v-if="bid.runnerId?.avatar" :src="bid.runnerId.avatar" class="h-full w-full object-cover" alt="" />
                      <span v-else>{{ getRunnerInitials(bid) }}</span>
                    </div>
                    <div class="min-w-0">
                      <p class="truncate text-sm font-bold text-cb-text">
                        {{ isCurrentUserBid(bid) ? 'You' : getRunnerName(bid) }}
                      </p>
                      <div class="flex items-center gap-1">
                        <i v-for="s in 5" :key="s" :class="['fa-star text-[9px]', s <= (bid.runnerId?.averageRating ?? 0) ? 'fa-solid text-cb-warning' : 'fa-regular text-cb-muted-40']"></i>
                      </div>
                    </div>
                  </div>
                  <div class="flex shrink-0 items-center gap-2">
                    <button
                      v-if="isMyErrand && bid.runnerId?.slug"
                      @click="goToProfile(bid.runnerId.slug)"
                      class="flex h-7 items-center gap-1 rounded-lg border border-cb-divider bg-cb-card px-2 text-[10px] font-semibold text-cb-muted transition-colors hover:border-cb-accent hover:text-cb-accent"
                    >
                      <i class="fa-solid fa-user text-[9px]"></i>
                      Profile
                    </button>
                    <div class="text-right">
                      <p class="text-base font-extrabold text-cb-text">&#8358;{{ bid.amount?.toLocaleString() }}</p>
                      <span :class="['rounded-full px-1.5 py-0.5 text-[10px] font-semibold', bidStatusBadge(bid.status)]">{{ bid.status }}</span>
                    </div>
                  </div>
                </div>

                <p v-if="bid.message" class="mb-3 rounded-lg bg-cb-base/40 px-3 py-2 text-xs leading-relaxed text-cb-muted">{{ bid.message }}</p>

                <div class="flex items-center justify-between">
                  <span class="text-[10px] text-cb-muted-40">{{ formatTimeAgo(bid.createdAt) }}</span>
                  <button
                    v-if="isMyErrand && bid.status === 'pending'"
                    @click="$emit('accept-bid', bid._id)"
                    :disabled="actionLoading"
                    class="inline-flex items-center gap-1.5 rounded-lg bg-cb-accent px-3 py-1.5 text-xs font-semibold text-cb-contrast hover:bg-cb-accent-dark disabled:opacity-60"
                  >
                    <i class="fa-solid fa-check text-[9px]"></i> Accept
                  </button>
                  <button
                    v-else-if="!isMyErrand && isCurrentUserBid(bid) && bid.status === 'pending'"
                    @click="$emit('withdraw', bid._id)"
                    :disabled="actionLoading"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-cb-negative/30 bg-cb-negative-subtle px-3 py-1.5 text-xs font-semibold text-cb-negative hover:opacity-90 disabled:opacity-60"
                  >
                    <i class="fa-solid fa-xmark text-[9px]"></i> Withdraw bid
                  </button>
                  <span v-if="bid.status === 'accepted'" class="inline-flex items-center gap-1 text-xs font-semibold text-cb-accent">
                    <i class="fa-solid fa-circle-check text-xs"></i> Accepted
                  </span>
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>

      <!-- Footer actions -->
      <footer
        class="shrink-0 border-t border-cb-divider bg-cb-base p-4 space-y-2"
      >
        <!-- Chat button (for involved parties on active errands) -->
        <button
          v-if="canChat"
          @click="$emit('chat', errand)"
          class="flex w-full items-center justify-center gap-2 rounded-xl border border-cb-accent-muted bg-cb-base py-2.5 text-sm font-semibold text-cb-accent transition-all hover:bg-cb-accent-subtle hover:shadow-sm"
        >
          <i class="fa-regular fa-message"></i>
          Message {{ chatPartnerName }}
        </button>

        <!-- STATUS: posted — runner can bid -->
        <button
          v-if="!isMyErrand && errand.status === 'posted' && !hasUserBid"
          @click="$emit('bid')"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark hover:shadow-md hover:shadow-cb-accent/25"
        >
          <i class="fa-solid fa-gavel text-sm"></i>
          Place a bid
        </button>

        <!-- STATUS: posted — runner has active bid awaiting acceptance -->
        <div
          v-else-if="!isMyErrand && hasUserBid && errand.status === 'posted'"
          class="space-y-2"
        >
          <div class="flex items-center gap-3 rounded-xl border border-cb-warning/40 bg-cb-warning-subtle p-3.5">
            <i class="fa-regular fa-hourglass-half shrink-0 text-lg text-cb-warning"></i>
            <div>
              <p class="text-sm font-bold text-cb-warning">Awaiting Acceptance</p>
              <p class="mt-0.5 text-xs text-cb-warning/80">
                Your bid is pending. The poster will accept or reject it.
              </p>
            </div>
          </div>
          <button
            @click="$emit('withdraw', errand.bids?.find(b => b.status === 'pending')?._id)"
            :disabled="actionLoading"
            class="flex w-full items-center justify-center gap-2 rounded-xl border border-cb-negative/30 bg-cb-negative-subtle py-2.5 text-sm font-semibold text-cb-negative transition-all hover:opacity-90 disabled:opacity-60"
          >
            <i class="fa-solid fa-xmark text-xs"></i>
            Withdraw bid
          </button>
        </div>

        <!-- STATUS: posted — poster can cancel -->
        <button
          v-else-if="isMyErrand && errand.status === 'posted'"
          @click="$emit('cancel', errand._id)"
          :disabled="actionLoading"
          class="flex w-full items-center justify-center gap-2 rounded-xl border border-cb-negative/30 bg-cb-negative-subtle py-3 text-sm font-semibold text-cb-negative transition-all hover:opacity-90 disabled:opacity-60"
        >
          <i class="fa-solid fa-xmark"></i>
          Cancel errand
        </button>

        <!-- STATUS: accepted — poster must pay -->
        <button
          v-else-if="isMyErrand && errand.status === 'accepted' && !errand.escrowConfirmed"
          @click="$emit('pay', errand._id)"
          :disabled="payLoading"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark disabled:opacity-60"
        >
          <i v-if="payLoading" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-lock text-sm"></i>
          Pay Now to secure runner
        </button>

        <!-- STATUS: accepted — escrow confirmed, waiting for runner -->
        <div
          v-else-if="isMyErrand && errand.status === 'accepted' && errand.escrowConfirmed"
          class="flex items-center justify-center gap-2 rounded-xl border border-cb-accent-muted bg-cb-accent-subtle py-3 text-sm font-semibold text-cb-accent"
        >
          <i class="fa-solid fa-shield-check"></i>
          Payment secured — waiting for runner to start
        </div>

        <!-- STATUS: accepted — runner can start (only if paid) -->
        <button
          v-else-if="
            isAcceptedRunner &&
            errand.status === 'accepted' &&
            errand.escrowConfirmed
          "
          @click="$emit('start', errand)"
          :disabled="actionLoading"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark disabled:opacity-60"
        >
          <i v-if="actionLoading" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-play"></i>
          Start errand
        </button>

        <!-- STATUS: accepted — runner waiting for poster to pay -->
        <div
          v-else-if="
            isAcceptedRunner &&
            errand.status === 'accepted' &&
            !errand.escrowConfirmed
          "
          class="flex items-center justify-center gap-2 rounded-xl border border-cb-warning/40 bg-cb-warning-subtle py-3 text-sm font-semibold text-cb-warning"
        >
          <i class="fa-solid fa-hourglass-half"></i>
          Waiting for poster to complete payment
        </div>

        <!-- STATUS: in_progress — runner can complete -->
        <button
          v-else-if="isAcceptedRunner && errand.status === 'in_progress'"
          @click="$emit('complete', errand)"
          :disabled="actionLoading"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark disabled:opacity-60"
        >
          <i v-if="actionLoading" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-circle-check"></i>
          Mark as complete
        </button>

        <!-- STATUS: in_progress — poster waiting -->
        <div
          v-else-if="isMyErrand && errand.status === 'in_progress'"
          class="flex items-center justify-center gap-2 rounded-xl border border-cb-accent-muted bg-cb-accent-subtle py-3 text-sm font-semibold text-cb-accent"
        >
          <i class="fa-solid fa-play"></i>
          Errand in progress
        </div>

        <!-- STATUS: completed — poster can confirm -->
        <button
          v-else-if="isMyErrand && errand.status === 'completed'"
          @click="$emit('confirm', errand._id)"
          :disabled="actionLoading"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark disabled:opacity-60"
        >
          <i v-if="actionLoading" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-check"></i>
          Confirm & release payment
        </button>

        <!-- STATUS: completed — runner waiting for confirm -->
        <div
          v-else-if="isAcceptedRunner && errand.status === 'completed'"
          class="flex items-center justify-center gap-2 rounded-xl border border-cb-warning/40 bg-cb-warning-subtle py-3 text-sm font-semibold text-cb-warning"
        >
          <i class="fa-regular fa-hourglass-half"></i>
          Awaiting poster confirmation
        </div>

        <!-- STATUS: confirmed — runner sees earnings pending notice -->
        <div
          v-else-if="isAcceptedRunner && errand.status === 'confirmed'"
          class="space-y-2"
        >
          <div class="flex items-center justify-center gap-2 rounded-xl border border-cb-accent-muted bg-cb-accent-subtle py-3 text-sm font-semibold text-cb-accent">
            <i class="fa-solid fa-circle-check"></i>
            Errand completed — great work!
          </div>
          <div class="flex items-start gap-3 rounded-xl border border-cb-accent/20 bg-cb-accent-subtle p-3">
            <i class="fa-solid fa-hourglass-half mt-0.5 shrink-0 text-cb-accent"></i>
            <div>
              <p class="text-sm font-semibold text-cb-accent">Earnings Pending Clearance</p>
              <p class="mt-0.5 text-xs text-cb-accent/80">
                Your earnings are held in pending balance. Admin must approve clearance before you can withdraw.
              </p>
            </div>
          </div>
        </div>

        <!-- STATUS: confirmed — poster sees success + review prompt -->
        <div
          v-else-if="isMyErrand && errand.status === 'confirmed'"
          class="space-y-2"
        >
          <div class="flex items-center justify-center gap-2 rounded-xl border border-cb-accent-muted bg-cb-accent-subtle py-3 text-sm font-semibold text-cb-accent">
            <i class="fa-solid fa-circle-check"></i>
            Errand completed
          </div>
          <!-- Review form (only if not yet reviewed) -->
          <div v-if="!reviewSubmitted && !existingReview" class="rounded-xl border border-cb-accent/20 bg-cb-accent-subtle p-4">
            <p class="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-accent">
              <i class="fa-solid fa-star"></i> Leave a Review
            </p>
            <!-- Stars -->
            <div class="mb-3 flex gap-1">
              <button
                v-for="star in 5"
                :key="star"
                @click="reviewRating = star"
                class="text-2xl transition-transform hover:scale-110"
                :class="star <= reviewRating ? 'text-cb-warning' : 'text-cb-muted-40'"
              >
                <i :class="star <= reviewRating ? 'fa-solid fa-star' : 'fa-regular fa-star'"></i>
              </button>
            </div>
            <!-- Comment -->
            <textarea
              v-model="reviewComment"
              rows="2"
              maxlength="500"
              placeholder="Share your experience with this runner..."
              class="mb-3 w-full resize-none rounded-xl border border-cb-divider bg-cb-card p-3 text-sm text-cb-text placeholder:text-cb-muted-40 focus:border-cb-accent focus:outline-none"
            ></textarea>
            <button
              @click="submitReview"
              :disabled="!reviewRating || reviewSubmitting"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-cb-accent py-2.5 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark disabled:opacity-60"
            >
              <i v-if="reviewSubmitting" class="fa-solid fa-spinner fa-spin"></i>
              <i v-else class="fa-solid fa-paper-plane"></i>
              {{ reviewSubmitting ? "Submitting..." : "Submit Review" }}
            </button>
          </div>
          <!-- Submitted state -->
          <div v-else class="rounded-xl border border-cb-divider bg-cb-card p-4 text-center">
            <i class="fa-solid fa-circle-check mb-2 text-2xl text-cb-accent"></i>
            <p class="text-sm font-semibold text-cb-text">Review Submitted</p>
            <p class="mt-0.5 text-xs text-cb-muted">Thank you for your feedback.</p>
          </div>
        </div>

        <!-- STATUS: confirmed — generic (non-involved viewer) -->
        <div
          v-else-if="errand.status === 'confirmed'"
          class="flex items-center justify-center gap-2 rounded-xl border border-cb-accent-muted bg-cb-accent-subtle py-3 text-sm font-semibold text-cb-accent"
        >
          <i class="fa-solid fa-circle-check"></i>
          Errand completed
        </div>

        <!-- STATUS: cancelled -->
        <div
          v-else-if="errand.status === 'cancelled'"
          class="flex items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-field py-3 text-sm font-semibold text-cb-muted"
        >
          <i class="fa-solid fa-ban"></i>
          Errand cancelled
        </div>

        <!-- STATUS: disputed -->
        <div
          v-else-if="errand.status === 'disputed'"
          class="flex items-center justify-center gap-2 rounded-xl border border-cb-negative/30 bg-cb-negative-subtle py-3 text-sm font-semibold text-cb-negative"
        >
          <i class="fa-solid fa-scale-balanced"></i>
          Under dispute review
        </div>

        <!-- Dispute button (available for active errands for involved parties) -->
        <button
          v-if="canDispute"
          @click="$emit('dispute', errand)"
          :disabled="actionLoading"
          class="flex w-full items-center justify-center gap-2 rounded-xl border border-cb-warning/30 bg-cb-warning-subtle py-2.5 text-sm font-semibold text-cb-warning transition-all hover:opacity-90 disabled:opacity-60"
        >
          <i class="fa-solid fa-scale-balanced text-xs"></i>
          Open dispute
        </button>
      </footer>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useReviewStore } from "@/stores/reviewStore";
import { useToast } from "@/composables/useToast";
import { useErrandStore } from "@/stores/errandStore";
import {
  getCategoryIcon,
  getCategoryLabel,
  isUrgent,
  formatTimeAgo,
  initials,
} from "@/utils/categories";

const reviewStore = useReviewStore();
const errandStore = useErrandStore();
const toast = useToast();

defineEmits([
  "close",
  "bid",
  "accept-bid",
  "withdraw",
  "cancel",
  "confirm",
  "start",
  "complete",
  "dispute",
  "chat",
  "pay",
]);

const router = useRouter();

const props = defineProps({
  errand: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  actionLoading: { type: Boolean, default: false },
  payLoading: { type: Boolean, default: false },
  isMyErrand: { type: Boolean, default: false },
  currentUserId: { type: String, default: null },
});

const urgent = computed(() => isUrgent(props.errand?.deadline));

/**
 * True when the current user has an active bid on this errand.
 * Checks myBidErrandIds (reactive Set from store) first — works even when
 * errand.bids isn't populated. Falls back to checking bids array directly.
 */
const hasUserBid = computed(() => {
  if (!props.errand?._id || !props.currentUserId) return false;

  // Primary: check the store's reactive Set (populated from myBids)
  if (errandStore.myBidErrandIds.has(props.errand._id)) return true;

  // Fallback: check bids array directly (when bids are populated on the errand)
  const bids = props.errand?.bids;
  if (!bids?.length) return false;
  return bids.some((b) => {
    const runnerId = typeof b.runnerId === 'object' ? b.runnerId?._id : b.runnerId;
    return (
      runnerId === props.currentUserId &&
      !['withdrawn', 'rejected'].includes(b.status)
    );
  });
});

// Find the accepted bid object
const acceptedBid = computed(() => {
  if (!props.errand?.bids) return null;
  return props.errand.bids.find((b) => b.status === "accepted") || null;
});

// Check if current user is the accepted runner
const isAcceptedRunner = computed(() => {
  if (!props.currentUserId || !acceptedBid.value) return false;
  const runnerId =
    typeof acceptedBid.value.runnerId === "string"
      ? acceptedBid.value.runnerId
      : acceptedBid.value.runnerId?._id;
  return runnerId === props.currentUserId;
});

// Dispute available for involved parties only on in_progress or completed
const canDispute = computed(() => {
  if (!props.errand) return false;
  const disputeStatuses = ["in_progress", "completed"];
  if (!disputeStatuses.includes(props.errand.status)) return false;
  return props.isMyErrand || isAcceptedRunner.value;
});

// Chat available when errand is active and user is involved
const canChat = computed(() => {
  if (!props.errand) return false;
  const chatStatuses = ["accepted", "in_progress", "completed"];
  if (!chatStatuses.includes(props.errand.status)) return false;
  return props.isMyErrand || isAcceptedRunner.value;
});

const chatPartnerName = computed(() => {
  if (!props.errand) return "";
  if (props.isMyErrand) {
    const runner = acceptedBid.value?.runnerId;
    if (!runner) return "Runner";
    return (
      runner.displayName ||
      `${runner.firstName || ""} ${runner.lastName || ""}`.trim() ||
      "Runner"
    );
  } else {
    const poster = props.errand.posterId;
    return (
      poster?.displayName ||
      `${poster?.firstName || ""} ${poster?.lastName || ""}`.trim() ||
      "Poster"
    );
  }
});

const posterDisplayName = computed(() => {
  const p = props.errand?.posterId;
  if (!p) return null;
  return (
    p.displayName || `${p.firstName || ""} ${p.lastName || ""}`.trim() || null
  );
});

const posterInitials = computed(() => {
  const p = props.errand?.posterId;
  if (!p) return "?";
  return initials(p.firstName, p.lastName);
});

const posterAvatar = computed(() => props.errand?.posterId?.avatar || null);

function getRunnerName(bid) {
  if (!bid.runnerId) return "Unknown runner";
  if (typeof bid.runnerId === "object" && bid.runnerId.displayName)
    return bid.runnerId.displayName;
  const fn = bid.runnerId?.firstName || "";
  const ln = bid.runnerId?.lastName || "";
  if (fn || ln) return `${fn} ${ln}`.trim();
  const id =
    typeof bid.runnerId === "string" ? bid.runnerId : bid.runnerId?._id;
  return id ? `Runner ${id.slice(-6)}` : "Runner";
}

function getRunnerInitials(bid) {
  if (!bid.runnerId) return "R";
  if (
    typeof bid.runnerId === "object" &&
    (bid.runnerId.firstName || bid.runnerId.lastName)
  ) {
    return initials(bid.runnerId.firstName, bid.runnerId.lastName);
  }
  const id =
    typeof bid.runnerId === "string" ? bid.runnerId : bid.runnerId?._id;
  return id ? id.slice(-2).toUpperCase() : "R";
}

function isCurrentUserBid(bid) {
  if (!props.currentUserId) return false;
  const runnerId =
    typeof bid.runnerId === "string" ? bid.runnerId : bid.runnerId?._id;
  return runnerId === props.currentUserId;
}

function goToProfile(slug) {
  if (!slug) return;
  router.push({ name: "ServiceProviderProfile", params: { identifier: slug } });
}

function statusBadge(s) {
  const map = {
    posted: { bg: "bg-cb-accent-subtle text-cb-accent", dot: "bg-cb-accent" },
    accepted: { bg: "bg-cb-accent-subtle text-cb-accent", dot: "bg-cb-accent" },
    in_progress: {
      bg: "bg-cb-accent-subtle text-cb-accent",
      dot: "bg-cb-accent",
    },
    completed: {
      bg: "bg-cb-warning-subtle text-cb-warning",
      dot: "bg-cb-warning",
    },
    confirmed: {
      bg: "bg-cb-accent-subtle text-cb-accent",
      dot: "bg-cb-accent",
    },
    cancelled: { bg: "bg-cb-field text-cb-muted", dot: "bg-cb-muted" },
    disputed: {
      bg: "bg-cb-negative-subtle text-cb-negative",
      dot: "bg-cb-negative",
    },
  };
  return map[s] || { bg: "bg-cb-field text-cb-muted", dot: "bg-cb-muted" };
}

function formatStatus(s) {
  const map = {
    posted: "Open",
    accepted: "Accepted",
    in_progress: "In Progress",
    completed: "Awaiting Confirmation",
    confirmed: "Completed",
    cancelled: "Cancelled",
    disputed: "Disputed",
  };
  return map[s] || s?.replace(/_/g, " ") || s;
}

function bidStatusBadge(s) {
  const map = {
    pending: "bg-cb-warning-subtle text-cb-warning",
    accepted: "bg-cb-accent-subtle text-cb-accent",
    withdrawn: "bg-cb-field text-cb-muted",
    rejected: "bg-cb-field text-cb-muted",
  };
  return map[s] || "bg-cb-field text-cb-muted";
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDeadlineRelative(iso) {
  if (!iso) return "";
  const h = (new Date(iso) - new Date()) / 3600_000;
  if (h < 0) return "Expired";
  if (h < 1) return `${Math.round(h * 60)}m left`;
  if (h < 24) return `${Math.round(h)}h left`;
  const d = Math.ceil(h / 24);
  return `${d} day${d > 1 ? "s" : ""} left`;
}

// ── Review (poster only, after confirmed) ─────────────────────
const reviewRating    = ref(0);
const reviewComment   = ref("");
const reviewSubmitted = ref(false);
const reviewSubmitting = ref(false);
const existingReview  = ref(null);

async function fetchExistingReview() {
  if (!props.errand?._id || !props.isMyErrand) return;
  try {
    if (!reviewStore.myReviews?.length) await reviewStore.fetchMyReviews();
    const found = reviewStore.myReviews.find(
      (r) => r.refId === props.errand._id && r.refType === "errand",
    );
    existingReview.value  = found || null;
    if (found) reviewSubmitted.value = true;
  } catch {
    // Silently ignore — review absence is fine
  }
}

async function submitReview() {
  if (!reviewRating.value || !props.errand?._id) return;
  reviewSubmitting.value = true;
  try {
    const review = await reviewStore.createReview({
      refId:   props.errand._id,
      refType: "errand",
      rating:  reviewRating.value,
      comment: reviewComment.value,
    });
    existingReview.value  = review;
    reviewSubmitted.value = true;
    toast.success("Review submitted successfully");
  } catch (err) {
    toast.error(reviewStore.error || err?.response?.data?.message || "Failed to submit review");
  } finally {
    reviewSubmitting.value = false;
  }
}

// Reset review state when errand changes
watch(
  () => props.errand,
  (newErrand) => {
    reviewRating.value    = 0;
    reviewComment.value   = "";
    reviewSubmitted.value = false;
    existingReview.value  = null;
    if (newErrand?.status === "confirmed" && props.isMyErrand) {
      fetchExistingReview();
    }
  },
  { immediate: true },
);
</script>