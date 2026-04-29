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
          <span class="hidden font-medium text-cb-muted sm:inline">Errands</span>
          <i class="fa-solid fa-chevron-right hidden text-[9px] text-cb-muted-40 sm:inline"></i>
          <span class="truncate font-semibold text-cb-text">{{ errand?.title || 'Errand Detail' }}</span>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <template v-if="errand">
            <span :class="['inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold', statusBadge(errand.status).bg]">
              <span :class="['h-1.5 w-1.5 rounded-full', statusBadge(errand.status).dot]"></span>
              {{ formatStatus(errand.status) }}
            </span>
            <span v-if="urgent" class="hidden sm:inline-flex items-center gap-1 rounded-full border border-cb-warning/40 bg-cb-warning-subtle px-2 py-0.5 text-[10px] font-semibold text-cb-warning">
               Urgent
            </span>
          </template>
          <div v-else class="h-5 w-20 animate-pulse rounded-full bg-cb-field"></div>
        </div>
      </div>
    </header>

    <!-- ─── Loading ─────────────────────────────────────────────── -->
    <div v-if="loading" class="mx-auto max-w-7xl  py-8 ">
      <div class="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8">
        <div class="order-1 space-y-5">
          <div class="space-y-2.5">
            <div class="h-4 w-28 animate-pulse rounded-full bg-cb-field"></div>
            <div class="h-8 w-3/4 animate-pulse rounded-xl bg-cb-field"></div>
          </div>
          <div class="h-32 animate-pulse rounded-2xl bg-cb-field"></div>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded-xl bg-cb-field"></div>
          </div>
        </div>
        <div class="order-2 h-72 animate-pulse rounded-2xl bg-cb-field"></div>
      </div>
    </div>

    <!-- ─── Error ────────────────────────────────────────────────── -->
    <div v-else-if="loadError" class="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-cb-negative-subtle">
        <i class="fa-solid fa-circle-exclamation text-2xl text-cb-negative"></i>
      </div>
      <div>
        <p class="font-semibold text-cb-text">Could not load errand</p>
        <p class="mt-1 text-sm text-cb-muted">{{ loadError }}</p>
      </div>
      <button @click="load" class="rounded-xl bg-cb-accent px-5 py-2.5 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark">
        Try again
      </button>
    </div>

    <!-- ─── Page Body ────────────────────────────────────────────── -->
    <template v-else-if="errand">
      <div class="mx-auto max-w-7xl  py-6  lg:py-8">

        <!--
          Layout strategy:
          • Mobile  (flex-col):  ① title  →  ② action card  →  ③ rest of content
          • Desktop (2-col grid): col-1 gets ① then ③ stacked; col-2 gets ② as a sticky sidebar
          The `order-*` + `lg:order-none` + CSS grid auto-placement handles both.
        -->
        <div class="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8">

          <!-- ①  Title + urgency ───────────────────────────────── -->
          <div class="order-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-cb-accent-subtle px-2.5 py-1 text-xs font-semibold text-cb-accent">
                <i :class="[getCategoryIcon(errand.category), 'text-[10px]']"></i>
                {{ getCategoryLabel(errand.category) }}
              </span>
              <span v-if="urgent" class="inline-flex items-center gap-1 rounded-full border border-cb-warning/40 bg-cb-warning-subtle px-2 py-0.5 text-[10px] font-semibold text-cb-warning sm:hidden">
                 Urgent
              </span>
              <span class="text-xs text-cb-muted">Posted {{ formatTimeAgo(errand.createdAt) }}</span>
            </div>
            <h1 class="mt-2.5 text-xl font-bold leading-snug text-cb-text capitalize sm:text-2xl lg:text-3xl">
              {{ errand.title }}
            </h1>
          </div>

          <!-- ②  Action panel ─ sticky sidebar on desktop, inline on mobile ── -->
          <aside class="order-2 lg:sticky lg:top-[69px] lg:self-start">
            <div class="overflow-hidden rounded-2xl border border-cb-divider bg-cb-card ">

              <!-- Key stats -->
              <div class="grid grid-cols-3 divide-x divide-cb-divider border-b border-cb-divider">
                <div class="px-3 py-4 text-center sm:px-4">
                  <p class="text-[10px] font-semibold uppercase tracking-wider text-cb-muted">Budget</p>
                  <p class="mt-1 text-base font-bold text-cb-text sm:text-xs">₦{{ errand.budget?.toLocaleString() }}</p>
                  <span :class="['mt-0.5 inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold', errand.budgetType === 'fixed' ? 'bg-cb-warning-subtle text-cb-warning' : 'bg-cb-accent-subtle text-cb-accent']">
                    {{ errand.budgetType === 'fixed' ? 'Fixed' : 'Negotiable' }}
                  </span>
                </div>
                <div class="px-3 py-4 text-center sm:px-4">
                  <p class="text-[10px] font-semibold uppercase tracking-wider text-cb-muted">Deadline</p>
                  <p :class="['mt-1 text-xs font-bold leading-tight', urgent ? 'text-cb-warning' : 'text-cb-text']">
                    {{ formatDate(errand.deadline) }}
                  </p>
                  <p :class="['mt-0.5 text-[10px]', urgent ? 'text-cb-warning' : 'text-cb-muted']">
                    {{ formatDeadlineRelative(errand.deadline) }}
                  </p>
                </div>
                <div class="px-3 py-4 text-center sm:px-4">
                  <p class="text-[10px] font-semibold uppercase tracking-wider text-cb-muted">Location</p>
                  <p class="mt-1 line-clamp-2 text-xs font-bold leading-tight text-cb-text">{{ errand.address || '—' }}</p>
                </div>
              </div>

              <!-- CBC fee -->
              <div class="flex items-center justify-between border-b border-cb-divider px-4 py-2.5 text-xs">
                <span class="flex items-center gap-1.5 text-cb-muted">
                  <i class="fa-solid fa-coins text-[10px]"></i> Platform Fee
                </span>
                <span class="font-semibold text-cb-text">₦{{ (errand.cbcFeeCharged || 0).toLocaleString() }}</span>
              </div>

              <!-- CTA buttons -->
              <div class="space-y-2.5 p-4">

                <!-- Chat -->
                <button v-if="canChat" @click="handleChat"
                  class="flex w-full items-center justify-center gap-2 rounded-xl border border-cb-accent-muted bg-cb-base py-2.5 text-sm font-semibold text-cb-accent transition-all hover:bg-cb-accent-subtle">
                  <i class="fa-regular fa-message"></i> Message {{ chatPartnerName }}
                </button>

                <!-- posted → runner bid -->
                <button v-if="!isMyErrand && errand.status === 'posted' && !hasUserBid" @click="showBidModal = true"
                  class="flex w-full items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark ">
                  <i class="fa-solid fa-gavel"></i> Place a bid
                </button>

                <!-- posted → runner awaiting -->
                <div v-else-if="!isMyErrand && hasUserBid && errand.status === 'posted'" class="space-y-2">
                  <div class="flex items-start gap-3 rounded-xl border border-cb-warning/40 bg-cb-warning-subtle p-3">
                    <i class="fa-regular fa-hourglass-half mt-0.5 shrink-0 text-cb-warning"></i>
                    <div>
                      <p class="text-sm font-bold text-cb-warning">Awaiting Acceptance</p>
                      <p class="mt-0.5 text-xs text-cb-warning/80">The poster will accept or reject your bid.</p>
                    </div>
                  </div>
                  <button @click="handleWithdraw(errand.bids?.find(b => b.status === 'pending')?._id)" :disabled="errandStore.actionLoading"
                    class="flex w-full items-center justify-center gap-2 rounded-xl border border-cb-negative/30 bg-cb-negative-subtle py-2.5 text-sm font-semibold text-cb-negative hover:opacity-90 disabled:opacity-60">
                    <i class="fa-solid fa-xmark text-xs"></i> Withdraw bid
                  </button>
                </div>

                <!-- posted → poster cancel -->
                <button v-else-if="isMyErrand && errand.status === 'posted'" @click="confirmCancel" :disabled="errandStore.actionLoading"
                  class="flex w-full items-center justify-center gap-2 rounded-xl border border-cb-negative/30 bg-cb-negative-subtle py-2.5 text-sm font-semibold text-cb-negative hover:opacity-90 disabled:opacity-60">
                  <i class="fa-solid fa-xmark"></i> Cancel errand
                </button>

                <!-- accepted → poster pay -->
                <button v-else-if="isMyErrand && errand.status === 'accepted' && !errand.escrowConfirmed" @click="handlePay" :disabled="payLoading"
                  class="flex w-full items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark disabled:opacity-60">
                  <i v-if="payLoading" class="fa-solid fa-spinner fa-spin"></i>
                  <i v-else class="fa-solid fa-lock"></i>
                  Pay Now to secure runner
                </button>

                <!-- accepted → poster paid waiting -->
                <div v-else-if="isMyErrand && errand.status === 'accepted' && errand.escrowConfirmed"
                  class="flex items-center justify-center gap-2 rounded-xl border border-cb-accent-muted bg-cb-accent-subtle py-3 text-sm font-semibold text-cb-accent">
                   Payment secured — waiting for runner
                </div>

                <!-- accepted → runner start -->
                <button v-else-if="isAcceptedRunner && errand.status === 'accepted' && errand.escrowConfirmed" @click="confirmStart" :disabled="errandStore.actionLoading"
                  class="flex w-full items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark disabled:opacity-60">
                  <i v-if="errandStore.actionLoading" class="fa-solid fa-spinner fa-spin"></i>
                  <i v-else class="fa-solid fa-play"></i>
                  Start errand
                </button>

                <!-- accepted → runner waiting for payment -->
                <div v-else-if="isAcceptedRunner && errand.status === 'accepted' && !errand.escrowConfirmed"
                  class="flex items-center justify-center gap-2 rounded-xl border border-cb-warning/40 bg-cb-warning-subtle py-3 text-sm font-semibold text-cb-warning">
                   Waiting for poster to pay
                </div>

                <!-- in_progress → runner complete -->
                <button v-else-if="isAcceptedRunner && errand.status === 'in_progress'" @click="showCompleteModal = true" :disabled="errandStore.actionLoading"
                  class="flex w-full items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark disabled:opacity-60">
                  <i v-if="errandStore.actionLoading" class="fa-solid fa-spinner fa-spin"></i>
                  <i v-else class="fa-solid fa-circle-check"></i>
                  Mark as complete
                </button>

                <!-- in_progress → poster waiting -->
                <div v-else-if="isMyErrand && errand.status === 'in_progress'"
                  class="flex items-center justify-center gap-2 rounded-xl border border-cb-accent-muted bg-cb-accent-subtle py-3 text-sm font-semibold text-cb-accent">
                  <i class="fa-solid fa-play"></i> Errand in progress
                </div>

                <!-- completed → poster confirm -->
                <button v-else-if="isMyErrand && errand.status === 'completed'" @click="confirmConfirm" :disabled="errandStore.actionLoading"
                  class="flex w-full items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark disabled:opacity-60">
                  <i v-if="errandStore.actionLoading" class="fa-solid fa-spinner fa-spin"></i>
                  <i v-else class="fa-solid fa-check"></i>
                  Confirm & release payment
                </button>

                <!-- completed → runner awaiting confirm -->
                <div v-else-if="isAcceptedRunner && errand.status === 'completed'"
                  class="flex items-center justify-center gap-2 rounded-xl border border-cb-warning/40 bg-cb-warning-subtle py-3 text-sm font-semibold text-cb-warning">
                  <i class="fa-regular fa-hourglass-half"></i> Awaiting poster confirmation
                </div>

                <!-- confirmed → runner earnings notice -->
                <div v-else-if="isAcceptedRunner && errand.status === 'confirmed'" class="space-y-2">
                  <div class="flex items-center justify-center gap-2 rounded-xl border border-cb-accent-muted bg-cb-accent-subtle py-2.5 text-sm font-semibold text-cb-accent">
                    <i class="fa-solid fa-circle-check"></i> Errand completed — great work!
                  </div>
                  <div class="flex items-start gap-2.5 rounded-xl border border-cb-accent/20 bg-cb-accent-subtle p-3">
                    <i class="fa-solid fa-hourglass-half mt-0.5 shrink-0 text-cb-accent text-xs"></i>
                    <p class="text-xs text-cb-accent/80">Earnings pending admin clearance before withdrawal.</p>
                  </div>
                </div>

                <!-- confirmed → poster success -->
                <div v-else-if="isMyErrand && errand.status === 'confirmed'"
                  class="flex items-center justify-center gap-2 rounded-xl border border-cb-accent-muted bg-cb-accent-subtle py-3 text-sm font-semibold text-cb-accent">
                  <i class="fa-solid fa-circle-check"></i> Errand completed
                </div>

                <!-- cancelled -->
                <div v-else-if="errand.status === 'cancelled'"
                  class="flex items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-field py-3 text-sm font-semibold text-cb-muted">
                  <i class="fa-solid fa-ban"></i> Errand cancelled
                </div>

                <!-- disputed -->
                <div v-else-if="errand.status === 'disputed'"
                  class="flex items-center justify-center gap-2 rounded-xl border border-cb-negative/30 bg-cb-negative-subtle py-3 text-sm font-semibold text-cb-negative">
                  <i class="fa-solid fa-scale-balanced"></i> Under dispute review
                </div>

                <!-- Dispute trigger -->
                <button v-if="canDispute" @click="showDisputeModal = true" :disabled="errandStore.actionLoading"
                  class="flex w-full items-center justify-center gap-2 rounded-xl border border-cb-warning/30 bg-cb-warning-subtle py-2.5 text-sm font-semibold text-cb-warning hover:opacity-90 disabled:opacity-60">
                  <i class="fa-solid fa-scale-balanced text-xs"></i> Open dispute
                </button>
              </div>
            </div>
          </aside>

          <!-- ③  Main content sections ──────────────────────────── -->
          <div class="order-3 space-y-5">

            <!-- Description -->
            <section class="rounded-2xl border border-cb-divider bg-cb-card p-4 sm:p-5">
              <p class="mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">
                <i class="fa-solid fa-align-left"></i> Description
              </p>
              <p class="whitespace-pre-line text-sm leading-relaxed text-cb-text">{{ errand.description }}</p>
            </section>

            <!-- Bid stats banner -->
            <div v-if="errand.bidStats?.count > 0"
              class="grid grid-cols-4 divide-x divide-cb-divider rounded-2xl border border-cb-divider bg-cb-card">
              <div class="py-4 text-center">
                <p class="text-xl font-extrabold text-cb-text">{{ errand.bidStats.count }}</p>
                <p class="mt-0.5 text-[10px] text-cb-muted">Bids</p>
              </div>
              <div class="py-4 text-center">
                <p class="text-sm font-bold text-cb-text">₦{{ errand.bidStats.min?.toLocaleString() }}</p>
                <p class="mt-0.5 text-[10px] text-cb-muted">Min</p>
              </div>
              <div class="py-4 text-center">
                <p class="text-sm font-bold text-cb-text">₦{{ errand.bidStats.max?.toLocaleString() }}</p>
                <p class="mt-0.5 text-[10px] text-cb-muted">Max</p>
              </div>
              <div class="py-4 text-center">
                <p class="text-sm font-bold text-cb-accent">₦{{ Math.round(errand.bidStats.avg)?.toLocaleString() }}</p>
                <p class="mt-0.5 text-[10px] text-cb-muted">Avg</p>
              </div>
            </div>

            <!-- Poster -->
            <section class="rounded-2xl border border-cb-divider bg-cb-card p-4 sm:p-5">
              <p class="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">
                <i class="fa-solid fa-user"></i> Posted by
              </p>
              <div class="flex items-center gap-3">
                <div class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cb-accent text-sm font-bold text-cb-contrast">
                  <img v-if="posterAvatar" :src="posterAvatar" class="h-full w-full object-cover" alt="" />
                  <span v-else>{{ posterInitials }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-bold text-cb-text">
                    {{ isMyErrand ? 'You' : posterDisplayName || 'Anonymous' }}
                  </p>
                  <div class="mt-0.5 flex flex-wrap items-center gap-2">
                    <div class="flex items-center gap-0.5">
                      <i v-for="s in 5" :key="s" :class="['fa-star text-[10px]', s <= (errand.posterId?.averageRating ?? 0) ? 'fa-solid text-cb-warning' : 'fa-regular text-cb-muted-40']"></i>
                    </div>
                    <span v-if="errand.posterId?.identityVerificationBadge" class="inline-flex items-center gap-0.5 text-[10px] font-semibold text-cb-accent">
                      <i class="fa-solid fa-circle-check text-[9px]"></i> Verified
                    </span>
                  </div>
                </div>
                <button v-if="!isMyErrand && errand.posterId?.slug" @click="goToProfile(errand.posterId.slug)"
                  class="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-cb-divider bg-cb-card px-3 text-xs font-semibold text-cb-muted transition-colors hover:border-cb-accent hover:bg-cb-accent-subtle hover:text-cb-accent">
                  <i class="fa-solid fa-user text-[10px]"></i>
                  <span class="hidden sm:inline">Profile</span>
                </button>
              </div>
            </section>

            <!-- Accepted runner -->
            <section v-if="acceptedBid && ['accepted','in_progress','completed','confirmed'].includes(errand.status)"
              class="rounded-2xl border border-cb-divider bg-cb-card p-4 sm:p-5">
              <p class="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">
                <i class="fa-solid fa-person-running"></i> Assigned runner
              </p>
              <div class="flex items-center gap-3">
                <div class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cb-accent-subtle text-sm font-bold text-cb-text">
                  <img v-if="acceptedBid.runnerId?.avatar" :src="acceptedBid.runnerId.avatar" class="h-full w-full object-cover" alt="" />
                  <span v-else>{{ getRunnerInitials(acceptedBid) }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-bold text-cb-text">{{ getRunnerName(acceptedBid) }}</p>
                  <p class="text-xs text-cb-muted">₦{{ acceptedBid.amount?.toLocaleString() }} agreed</p>
                </div>
                <button v-if="!isAcceptedRunner && acceptedBid.runnerId?.slug" @click="goToProfile(acceptedBid.runnerId.slug)"
                  class="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-cb-divider bg-cb-card px-3 text-xs font-semibold text-cb-muted transition-colors hover:border-cb-accent hover:bg-cb-accent-subtle hover:text-cb-accent">
                  <i class="fa-solid fa-user text-[10px]"></i>
                  <span class="hidden sm:inline">Profile</span>
                </button>
              </div>
            </section>

            <!-- Bids list -->
            <section v-if="(errand.bidStats?.count > 0) || errand.bids?.length">
              <div class="mb-3 flex items-center gap-1.5">
                <i class="fa-solid fa-gavel text-cb-muted text-xs"></i>
                <h2 class="text-sm font-bold text-cb-text">
                  {{ isMyErrand ? `All Bids (${errand.bids?.length ?? 0})` : 'Your Bid' }}
                </h2>
              </div>

              <div v-if="!errand.bids?.length" class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-cb-divider bg-cb-card py-10 text-center">
                <i class="fa-solid fa-inbox mb-2.5 text-3xl text-cb-muted-40"></i>
                <p class="text-sm font-semibold text-cb-text">{{ isMyErrand ? 'No bids yet' : "You haven't bid yet" }}</p>
                <p class="mt-1 text-xs text-cb-muted">{{ isMyErrand ? 'Share your errand to attract runners.' : 'Use the button above to place a bid.' }}</p>
              </div>

              <div v-else class="space-y-3">
                <article v-for="bid in errand.bids" :key="bid._id"
                  :class="['rounded-2xl  p-4 transition-all', bid.status === 'accepted' ? 'bg-cb-field ' : isCurrentUserBid(bid) ? 'border-cb-warning/40 bg-cb-warning-subtle/30' : 'border-cb-divider bg-cb-card']">

                  <div v-if="isCurrentUserBid(bid)" class="mb-3 flex items-center gap-1.5  px-2.5 py-1.5">
                    <i class="fa-solid fa-gavel text-[10px] text-cb-warning"></i>
                    <span class="text-[11px] font-bold text-cb-warning">Your bid</span>
                    <span class="ml-auto text-[10px] capitalize text-cb-warning/70">{{ bid.status }}</span>
                  </div>

                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-2.5">
                      <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cb-field text-xs font-bold text-cb-text">
                        <img v-if="bid.runnerId?.avatar" :src="bid.runnerId.avatar" class="h-full w-full object-cover" alt="" />
                        <span v-else>{{ getRunnerInitials(bid) }}</span>
                      </div>
                      <div class="min-w-0">
                        <p class="truncate text-sm font-bold text-cb-text">{{ isCurrentUserBid(bid) ? 'You' : getRunnerName(bid) }}</p>
                        <div class="mt-0.5 flex items-center gap-0.5">
                          <i v-for="s in 5" :key="s" :class="['fa-star text-[9px]', s <= (bid.runnerId?.averageRating ?? 0) ? 'fa-solid text-cb-warning' : 'fa-regular text-cb-muted-40']"></i>
                        </div>
                      </div>
                    </div>
                    <div class="flex shrink-0 items-center gap-2">
                      <button v-if="isMyErrand && bid.runnerId?.slug" @click="goToProfile(bid.runnerId.slug)"
                        class="hidden sm:flex h-7 items-center gap-1 rounded-lg border border-cb-divider bg-cb-card px-2 text-[10px] font-semibold text-cb-muted hover:border-cb-accent hover:text-cb-accent">
                        <i class="fa-solid fa-user text-[9px]"></i> Profile
                      </button>
                      <div class="text-right">
                        <p class="text-base font-extrabold text-cb-text">₦{{ bid.amount?.toLocaleString() }}</p>
                        <span :class="['rounded-full px-1.5 py-0.5 text-[10px] font-semibold', bidStatusBadge(bid.status)]">{{ bid.status }}</span>
                      </div>
                    </div>
                  </div>

                  <p v-if="bid.message" class="mt-3 rounded-xl bg-cb-base/60 px-3 py-2.5 text-xs leading-relaxed text-cb-muted">{{ bid.message }}</p>

                  <div class="mt-3 flex items-center justify-between">
                    <span class="text-[10px] text-cb-muted-40">{{ formatTimeAgo(bid.createdAt) }}</span>
                    <button v-if="isMyErrand && bid.status === 'pending'" @click="handleAcceptBid(bid._id)" :disabled="errandStore.actionLoading"
                      class="inline-flex items-center gap-1.5 rounded-lg bg-cb-accent px-3 py-1.5 text-xs font-semibold text-cb-contrast hover:bg-cb-accent-dark disabled:opacity-60">
                      <i class="fa-solid fa-check text-[9px]"></i> Accept
                    </button>
                    <button v-else-if="!isMyErrand && isCurrentUserBid(bid) && bid.status === 'pending'" @click="handleWithdraw(bid._id)" :disabled="errandStore.actionLoading"
                      class="inline-flex items-center gap-1.5 rounded-lg border border-cb-negative/30 bg-cb-negative-subtle px-3 py-1.5 text-xs font-semibold text-cb-negative hover:opacity-90 disabled:opacity-60">
                      <i class="fa-solid fa-xmark text-[9px]"></i> Withdraw
                    </button>
                    <span v-if="bid.status === 'accepted'" class="inline-flex items-center gap-1 text-xs font-semibold text-cb-accent">
                      <i class="fa-solid fa-circle-check"></i> Accepted
                    </span>
                  </div>
                </article>
              </div>
            </section>

            <!-- Review (poster, after confirmed) -->
            <section v-if="isMyErrand && errand.status === 'confirmed'" class="rounded-2xl border border-cb-accent/20  p-4 sm:p-5">
              <p class="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-accent">
                <i class="fa-solid fa-star"></i> Leave a Review
              </p>
              <template v-if="!reviewSubmitted && !existingReview">
                <div class="mb-3 flex gap-1">
                  <button v-for="star in 5" :key="star" @click="reviewRating = star" class="text-2xl transition-transform hover:scale-110" :class="star <= reviewRating ? 'text-cb-warning' : 'text-cb-muted-40'">
                    <i :class="star <= reviewRating ? 'fa-solid fa-star' : 'fa-regular fa-star'"></i>
                  </button>
                </div>
                <textarea v-model="reviewComment" rows="2" maxlength="500" placeholder="Share your experience with this runner..." class="mb-3 w-full resize-none rounded-xl border border-cb-divider bg-cb-card p-3 text-sm text-cb-text placeholder:text-cb-muted-40 focus:border-cb-accent focus:outline-none"></textarea>
                <button @click="submitReview" :disabled="!reviewRating || reviewSubmitting"
                  class="flex w-full items-center justify-center gap-2 rounded-xl bg-cb-accent py-2.5 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark disabled:opacity-60">
                  <i v-if="reviewSubmitting" class="fa-solid fa-spinner fa-spin"></i>
                  <i v-else class="fa-solid fa-paper-plane"></i>
                  {{ reviewSubmitting ? 'Submitting...' : 'Submit Review' }}
                </button>
              </template>
              <div v-else class="flex flex-col items-center gap-2 py-2 text-center">
                <i class="fa-solid fa-circle-check text-2xl text-cb-accent"></i>
                <p class="text-sm font-semibold text-cb-text">Review Submitted</p>
                <p class="text-xs text-cb-muted">Thank you for your feedback.</p>
              </div>
            </section>

            <div class="h-6 lg:h-10"></div>
          </div>
          <!-- end ③ -->

        </div>
      </div>
    </template>

    <!-- ─── Modals ─────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="showBidModal" class="fixed inset-0 z-[300] flex items-end justify-center bg-cb-overlay p-0 backdrop-blur-sm sm:items-center sm:p-4" @click.self="showBidModal = false">
          <BidModal :errand="errand" :loading="errandStore.actionLoading" :error="bidError" @submit="handleBid" @close="showBidModal = false" />
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <CompleteErrandModal v-if="showCompleteModal" :errand="errand" :loading="errandStore.actionLoading" :store-error="errandStore.error" @close="showCompleteModal = false" @confirm="handleCompleteConfirm" />
    </Teleport>

    <Teleport to="body">
      <DisputeModal v-if="showDisputeModal" :errand="errand" :loading="errandStore.actionLoading" :store-error="errandStore.error" @close="showDisputeModal = false" @confirm="handleDisputeConfirm" />
    </Teleport>

    <Teleport to="body">
      <Transition name="overlay">
        <ConfirmModal v-if="confirmModal.open" :title="confirmModal.title" :message="confirmModal.message" :confirm-text="confirmModal.confirmText" :variant="confirmModal.variant" :loading="errandStore.actionLoading" @confirm="confirmModal.onConfirm" @cancel="confirmModal.open = false" />
      </Transition>
    </Teleport>

    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useErrandStore } from '@/stores/errandStore'
import { useUserStore } from '@/stores/userStore'
import { useReviewStore } from '@/stores/reviewStore'
import { useToast } from '@/composables/useToast'
import { getCategoryIcon, getCategoryLabel, isUrgent, formatTimeAgo, initials } from '@/utils/categories'

import BidModal from '@/components/errands/BidModal.vue'
import CompleteErrandModal from '@/components/errands/CompleteErrandModal.vue'
import DisputeModal from '@/components/errands/DisputeModal.vue'
import ConfirmModal from '@/components/reusables/ConfirmModal.vue'
import ToastContainer from '@/components/reusables/ToastContainer.vue'

const route = useRoute()
const router = useRouter()
const errandStore = useErrandStore()
const userStore = useUserStore()
const reviewStore = useReviewStore()
const toast = useToast()

const loading = ref(true)
const loadError = ref(null)
const payLoading = ref(false)
const showBidModal = ref(false)
const showCompleteModal = ref(false)
const showDisputeModal = ref(false)
const bidError = ref('')
const confirmModal = ref({ open: false, title: '', message: '', confirmText: '', variant: 'danger', onConfirm: null })

const errand = computed(() => errandStore.current)
const currentUserId = computed(() => userStore.user?._id || null)
const urgent = computed(() => isUrgent(errand.value?.deadline))

const isMyErrand = computed(() => {
  if (!errand.value || !currentUserId.value) return false
  const posterId = typeof errand.value.posterId === 'object' ? errand.value.posterId?._id : errand.value.posterId
  return posterId === currentUserId.value
})
const acceptedBid = computed(() => errand.value?.bids?.find(b => b.status === 'accepted') || null)
const isAcceptedRunner = computed(() => {
  if (!currentUserId.value || !acceptedBid.value) return false
  const runnerId = typeof acceptedBid.value.runnerId === 'string' ? acceptedBid.value.runnerId : acceptedBid.value.runnerId?._id
  return runnerId === currentUserId.value
})
const hasUserBid = computed(() => {
  if (!errand.value?._id || !currentUserId.value) return false
  if (errandStore.myBidErrandIds.has(errand.value._id)) return true
  return errand.value?.bids?.some(b => {
    const runnerId = typeof b.runnerId === 'object' ? b.runnerId?._id : b.runnerId
    return runnerId === currentUserId.value && !['withdrawn', 'rejected'].includes(b.status)
  }) ?? false
})
const canDispute = computed(() => {
  if (!errand.value || !['in_progress', 'completed'].includes(errand.value.status)) return false
  return isMyErrand.value || isAcceptedRunner.value
})
const canChat = computed(() => {
  if (!errand.value || !['accepted', 'in_progress', 'completed'].includes(errand.value.status)) return false
  return isMyErrand.value || isAcceptedRunner.value
})
const chatPartnerName = computed(() => {
  if (!errand.value) return ''
  if (isMyErrand.value) {
    const r = acceptedBid.value?.runnerId
    return r?.displayName || `${r?.firstName || ''} ${r?.lastName || ''}`.trim() || 'Runner'
  }
  const p = errand.value.posterId
  return p?.displayName || `${p?.firstName || ''} ${p?.lastName || ''}`.trim() || 'Poster'
})
const posterDisplayName = computed(() => {
  const p = errand.value?.posterId
  if (!p) return null
  return p.displayName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || null
})
const posterInitials = computed(() => { const p = errand.value?.posterId; return p ? initials(p.firstName, p.lastName) : '?' })
const posterAvatar = computed(() => errand.value?.posterId?.avatar || null)

async function load() {
  loading.value = true; loadError.value = null; errandStore.clearCurrent()
  try { await errandStore.fetchErrand(route.params.id); errandStore.fetchMyBids() }
  catch (err) { loadError.value = err?.response?.data?.message || 'Failed to load errand' }
  finally { loading.value = false }
}
onMounted(load)

function goBack() { if (window.history.length > 1) router.back(); else router.push({ name: 'ErrandMarket' }) }
function goToProfile(slug) { if (slug) router.push({ name: 'ServiceProviderProfile', params: { identifier: slug } }) }

function isCurrentUserBid(bid) {
  if (!currentUserId.value) return false
  const runnerId = typeof bid.runnerId === 'string' ? bid.runnerId : bid.runnerId?._id
  return runnerId === currentUserId.value
}
function getRunnerName(bid) {
  if (!bid.runnerId) return 'Unknown runner'
  if (typeof bid.runnerId === 'object' && bid.runnerId.displayName) return bid.runnerId.displayName
  const fn = bid.runnerId?.firstName || '', ln = bid.runnerId?.lastName || ''
  if (fn || ln) return `${fn} ${ln}`.trim()
  const id = typeof bid.runnerId === 'string' ? bid.runnerId : bid.runnerId?._id
  return id ? `Runner ${id.slice(-6)}` : 'Runner'
}
function getRunnerInitials(bid) {
  if (!bid.runnerId) return 'R'
  if (typeof bid.runnerId === 'object' && (bid.runnerId.firstName || bid.runnerId.lastName))
    return initials(bid.runnerId.firstName, bid.runnerId.lastName)
  const id = typeof bid.runnerId === 'string' ? bid.runnerId : bid.runnerId?._id
  return id ? id.slice(-2).toUpperCase() : 'R'
}
function statusBadge(s) {
  const m = { posted: { bg: 'bg-cb-accent-subtle text-cb-accent', dot: 'bg-cb-accent' }, accepted: { bg: 'bg-cb-accent-subtle text-cb-accent', dot: 'bg-cb-accent' }, in_progress: { bg: 'bg-cb-accent-subtle text-cb-accent', dot: 'bg-cb-accent' }, completed: { bg: 'bg-cb-warning-subtle text-cb-warning', dot: 'bg-cb-warning' }, confirmed: { bg: 'bg-cb-accent-subtle text-cb-accent', dot: 'bg-cb-accent' }, cancelled: { bg: 'bg-cb-field text-cb-muted', dot: 'bg-cb-muted' }, disputed: { bg: 'bg-cb-negative-subtle text-cb-negative', dot: 'bg-cb-negative' } }
  return m[s] || { bg: 'bg-cb-field text-cb-muted', dot: 'bg-cb-muted' }
}
function formatStatus(s) {
  const m = { posted: 'Open', accepted: 'Accepted', in_progress: 'In Progress', completed: 'Awaiting Confirmation', confirmed: 'Completed', cancelled: 'Cancelled', disputed: 'Disputed' }
  return m[s] || s?.replace(/_/g, ' ') || s
}
function bidStatusBadge(s) {
  const m = { pending: 'bg-cb-warning-subtle text-cb-warning', accepted: 'bg-cb-accent-subtle text-cb-accent', withdrawn: 'bg-cb-field text-cb-muted', rejected: 'bg-cb-field text-cb-muted' }
  return m[s] || 'bg-cb-field text-cb-muted'
}
function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function formatDeadlineRelative(iso) {
  if (!iso) return ''
  const h = (new Date(iso) - new Date()) / 3600_000
  if (h < 0) return 'Expired'
  if (h < 1) return `${Math.round(h * 60)}m left`
  if (h < 24) return `${Math.round(h)}h left`
  const d = Math.ceil(h / 24)
  return `${d} day${d > 1 ? 's' : ''} left`
}

async function handleBid({ amount, message }) {
  bidError.value = ''
  try { await errandStore.placeBid(errand.value._id, { amount, message }); showBidModal.value = false; toast.success('Bid placed successfully'); await load() }
  catch { bidError.value = errandStore.error || 'Failed to place bid' }
}
async function handleAcceptBid(bidId) {
  try { await errandStore.acceptBid(errand.value._id, bidId); toast.success('Bid accepted — please complete payment to secure the runner'); await load() }
  catch (err) { toast.error(err?.message || errandStore.error || 'Failed to accept bid') }
}
function handleWithdraw(bidId) {
  if (!bidId) return
  confirmModal.value = { open: true, title: 'Withdraw your bid?', message: 'Are you sure? This cannot be undone.', confirmText: 'Withdraw bid', variant: 'danger',
    onConfirm: async () => { try { await errandStore.withdrawBid(errand.value._id, bidId); toast.success('Bid withdrawn'); confirmModal.value.open = false; await load() } catch (err) { toast.error(err?.message || 'Failed') } } }
}
function confirmCancel() {
  confirmModal.value = { open: true, title: 'Cancel errand?', message: 'Any pending bids will be dismissed. This cannot be undone.', confirmText: 'Cancel errand', variant: 'danger',
    onConfirm: async () => { try { await errandStore.cancelErrand(errand.value._id); toast.success('Errand cancelled'); confirmModal.value.open = false; router.push({ name: 'MyErrands' }) } catch (err) { toast.error(err?.message || 'Failed') } } }
}
function confirmConfirm() {
  confirmModal.value = { open: true, title: 'Confirm completion', message: 'Confirming will release the escrow payment to the runner.', confirmText: 'Confirm & release', variant: 'success',
    onConfirm: async () => { try { await errandStore.confirmErrand(errand.value._id); toast.success('Payment released.'); confirmModal.value.open = false; await load() } catch (err) { toast.error(err?.message || 'Failed') } } }
}
function confirmStart() {
  confirmModal.value = { open: true, title: 'Start errand?', message: `Ready to begin '${errand.value?.title}'? This will move it to in-progress.`, confirmText: 'Start errand', variant: 'success',
    onConfirm: async () => { try { await errandStore.startErrand(errand.value._id); toast.success('Errand started!'); confirmModal.value.open = false; await load() } catch (err) { toast.error(err?.message || 'Failed') } } }
}
async function handleCompleteConfirm({ file }) {
  try { await errandStore.completeErrand(errand.value._id, file); showCompleteModal.value = false; toast.success('Errand marked as complete. Waiting for poster confirmation.'); await load() }
  catch (err) { toast.error(err?.message || 'Failed to complete errand') }
}
async function handleDisputeConfirm(reason) {
  try { await errandStore.disputeErrand(errand.value._id, reason); showDisputeModal.value = false; toast.success('Dispute submitted. Our team will review within 24–48 hours.'); await load() }
  catch (err) { toast.error(err?.message || 'Failed to submit dispute') }
}
async function handlePay() {
  payLoading.value = true
  try {
    const res = await errandStore.payErrand(errand.value._id)
    const url = res?.data?.payment?.authorizationUrl ?? res?.data?.authorizationUrl ?? res?.data?.authorization_url ?? res?.data?.paymentUrl ?? res?.data?.url
    if (url) { sessionStorage.setItem('cb_paid_errand', errand.value._id); window.location.href = url }
    else toast.error('No payment URL returned. Please try again.')
  } catch { toast.error(errandStore.error || 'Failed to initiate payment') }
  finally { payLoading.value = false }
}
function handleChat() {
  if (!errand.value) return
  router.push({ name: 'Chat', params: { roomId: `errand:${errand.value._id}` }, query: { contextTitle: errand.value.title, contextType: 'errand' } })
}

const reviewRating = ref(0), reviewComment = ref(''), reviewSubmitted = ref(false), reviewSubmitting = ref(false), existingReview = ref(null)
async function fetchExistingReview() {
  if (!errand.value?._id || !isMyErrand.value) return
  try {
    if (!reviewStore.myReviews?.length) await reviewStore.fetchMyReviews()
    const found = reviewStore.myReviews.find(r => r.refId === errand.value._id && r.refType === 'errand')
    existingReview.value = found || null
    if (found) reviewSubmitted.value = true
  } catch { /* silent */ }
}
async function submitReview() {
  if (!reviewRating.value || !errand.value?._id) return
  reviewSubmitting.value = true
  try {
    const review = await reviewStore.createReview({ refId: errand.value._id, refType: 'errand', rating: reviewRating.value, comment: reviewComment.value })
    existingReview.value = review; reviewSubmitted.value = true; toast.success('Review submitted successfully')
  } catch (err) { toast.error(reviewStore.error || err?.response?.data?.message || 'Failed to submit review') }
  finally { reviewSubmitting.value = false }
}
watch(errand, (e) => {
  reviewRating.value = 0; reviewComment.value = ''; reviewSubmitted.value = false; existingReview.value = null
  if (e?.status === 'confirmed' && isMyErrand.value) fetchExistingReview()
})
</script>

<style scoped>
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.2s ease; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }
</style>