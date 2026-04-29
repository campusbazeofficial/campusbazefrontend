<template>
  <div class="min-h-screen bg-cb-base">
    <!-- Header -->
    <div class="border-b border-cb-divider bg-cb-base/95 backdrop-blur-md">
      <div class="mx-auto max-w-7xl px-4 py-5">
        <div class="flex items-center gap-3">
          <button
            class="flex h-9 w-9 items-center justify-center rounded-xl border border-cb-divider bg-cb-card text-cb-muted transition-all hover:border-cb-accent/30 hover:text-cb-text active:scale-95"
            @click="$router.push('/user/subscription-plans')"
          >
            <i class="fa-solid fa-arrow-left text-sm" />
          </button>

          <div>
            <h1 class="text-xl font-bold text-cb-text">My Subscription</h1>
            <p class="text-sm text-cb-muted">Manage your plan and billing</p>
          </div>
        </div>
      </div>
    </div>

    <main class="mx-auto max-w-7xl px-4 py-8">
      <!-- Skeleton -->
      <template v-if="isInitialLoading">
        <div class="space-y-4">
          <div
            v-for="i in 3"
            :key="i"
            class="animate-pulse rounded-2xl bg-cb-card"
            :style="`height:${i === 1 ? 220 : 140}px;animation-delay:${(i - 1) * 80}ms`"
          />
        </div>
      </template>

      <!-- Error -->
      <template v-else-if="loadError">
        <div
          class="rounded-2xl border border-cb-negative/20 bg-cb-negative/5 p-10 text-center"
        >
          <div
            class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cb-negative/10 text-2xl text-cb-negative"
          >
            <i class="fa-solid fa-circle-exclamation" />
          </div>
          <h2 class="mb-2 text-lg font-bold text-cb-text">
            Failed to load subscription
          </h2>
          <p class="mb-6 text-sm text-cb-muted">{{ loadError }}</p>
          <button
            class="rounded-xl bg-cb-accent px-6 py-2.5 text-sm font-bold text-white hover:brightness-110 active:scale-95"
            @click="loadData"
          >
            Retry
          </button>
        </div>
      </template>

      <template v-else>
        <Transition name="page-fade" appear>
          <div class="space-y-4">
            <!-- ───────── FREE TIER ───────── -->
            <template v-if="subscriptionStore.isFreeTier">
              <div
                class="overflow-hidden rounded-2xl border border-cb-divider bg-cb-card"
              >
                <div class="h-[3px] w-full bg-cb-divider" />

                <div class="relative px-8 py-10 text-center">
                  <div
                    class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cb-field text-2xl text-cb-muted"
                  >
                    <i :class="freeIcon" />
                  </div>

                  <h2 class="mb-1 text-xl font-bold text-cb-text">
                    {{ currentPlanLabel }}
                  </h2>

                  <p class="mb-6 text-sm text-cb-muted">
                    {{ freePlanDescription }}
                  </p>

                  <div class="mx-auto mb-8 max-w-xs space-y-2.5 text-left">
                    <div
                      v-for="item in freePlanMetrics"
                      :key="item.label"
                      class="flex items-center gap-3 text-sm"
                      :class="item.positive ? 'text-cb-text' : 'text-cb-muted'"
                    >
                      <div
                        class="flex h-5 w-5 items-center justify-center rounded-full text-[9px]"
                        :class="
                          item.positive
                            ? 'bg-cb-positive/15 text-cb-positive'
                            : 'bg-cb-divider text-cb-muted'
                        "
                      >
                        <i
                          :class="
                            item.positive
                              ? 'fa-solid fa-check'
                              : 'fa-solid fa-minus'
                          "
                        />
                      </div>
                      {{ item.label }}
                    </div>
                  </div>

                  <button
                    class="rounded-xl bg-cb-accent px-8 py-3 text-sm font-bold text-white hover:brightness-110 active:scale-95"
                    @click="$router.push('/user/subscription-plans')"
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            </template>

            <!-- ───────── PAID TIER ───────── -->
            <template v-else>
              <!-- Plan Card -->
              <div
                class="overflow-hidden rounded-2xl border bg-cb-card"
                :class="planBorderClass"
              >
                <div class="h-[3px] w-full" :class="planBarClass" />

                <div class="p-6">
                  <div
                    class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div class="flex items-center gap-4">
                      <div
                        class="flex h-12 w-12 items-center justify-center rounded-xl text-xl"
                        :class="tierIconBg"
                      >
                        <i :class="tierIcon" />
                      </div>

                      <div>
                        <div class="flex items-center gap-2">
                          <h2 class="text-lg font-bold text-cb-text">
                            {{ currentPlanLabel }}
                          </h2>

                          <span
                            class="rounded-full px-2.5 py-0.5 text-xs font-bold"
                            :class="statusBadgeClass"
                          >
                            {{ statusLabel }}
                          </span>
                        </div>

                        <p class="text-sm text-cb-muted">
                          {{ billingPeriodLabel }} · {{ currentPriceDisplay }}
                        </p>
                      </div>
                    </div>

                    <div class="flex flex-col items-start sm:items-end">
                      <span class="text-2xl font-black text-cb-text">
                        {{ currentPriceDisplay }}
                      </span>
                      <span class="text-xs text-cb-muted">
                        per {{ billingPeriodLabel }}
                      </span>
                    </div>
                  </div>

                  <!-- Expiry -->
                  <div v-if="subscriptionStore.expiresAt" class="mt-6">
                    <div
                      class="mb-2 flex justify-between text-xs text-cb-muted"
                    >
                      <span>Access until {{ expiryDisplay }}</span>
                      <span :class="daysClass"
                        >{{ subscriptionStore.daysUntilExpiry }}d left</span
                      >
                    </div>

                    <div class="h-1.5 rounded-full bg-cb-field">
                      <div
                        class="h-full rounded-full transition-all"
                        :class="expiryBarClass"
                        :style="`width:${expiryProgressPct}%`"
                      />
                    </div>
                  </div>

                  <!-- Meta -->
                  <div
                    class="mt-5 divide-y divide-cb-divider/60 rounded-xl border border-cb-divider bg-cb-field/50"
                  >
                    <div
                      v-if="startedAtDisplay"
                      class="flex justify-between px-4 py-2.5 text-xs"
                    >
                      <span class="text-cb-muted">Started</span>
                      <span class="text-cb-text">{{ startedAtDisplay }}</span>
                    </div>

                    <div
                      v-if="nextBillingDisplay && !isTerminalState"
                      class="flex justify-between px-4 py-2.5 text-xs"
                    >
                      <span class="text-cb-muted">Next billing</span>
                      <span class="text-cb-accent">{{
                        nextBillingDisplay
                      }}</span>
                    </div>

                    <div
                      v-if="subscriptionStore.expiresAt"
                      class="flex justify-between px-4 py-2.5 text-xs"
                    >
                      <span class="text-cb-muted">{{
                        isCancelledOrExpiredLabel
                      }}</span>
                      <span class="text-cb-text">{{ expiryDisplay }}</span>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div
                    v-if="!isTerminalState"
                    class="mt-5 flex flex-wrap gap-3"
                  >
                    <button
                      v-if="subAutoRenew"
                      class="rounded-xl border border-cb-divider px-4 py-2.5 text-sm font-semibold text-cb-muted transition-all hover:border-cb-negative/30 hover:text-cb-negative active:scale-95"
                      @click="toggleAutoRenew"
                    >
                      <i class="fa-solid fa-rotate mr-2" />
                      Turn Off Auto-Renew
                    </button>

                    <button
                      v-if="!subAutoRenew"
                      class="rounded-xl border border-cb-divider px-4 py-2.5 text-sm font-semibold text-cb-muted transition-all hover:border-cb-positive/30 hover:text-cb-positive active:scale-95"
                      @click="toggleAutoRenew"
                    >
                      <i class="fa-solid fa-rotate mr-2" />
                      Turn On Auto-Renew
                    </button>

                    <button
                      v-if="!subscriptionStore.subAutoRenew"
                      class="rounded-xl border border-cb-divider px-4 py-2.5 text-sm font-semibold text-cb-muted transition-all hover:border-cb-positive/30 hover:text-cb-positive active:scale-95"
                      @click="toggleAutoRenew"
                    >
                      <i class="fa-solid fa-rotate mr-2" />
                      Turn On Auto-Renew
                    </button>

                    <button
                      class="rounded-xl border border-cb-negative/30 px-4 py-2.5 text-sm font-semibold text-cb-negative transition-all hover:bg-cb-negative/5 active:scale-95"
                      @click="cancelSubscription"
                    >
                      <i class="fa-solid fa-xmark mr-2" />
                      Cancel Subscription
                    </button>
                  </div>

                  <!-- Cancelled/Expired actions -->
                  <div v-else class="mt-5">
                    <button
                      class="rounded-xl bg-cb-accent px-6 py-2.5 text-sm font-bold text-white hover:brightness-110 active:scale-95"
                      @click="$router.push('/user/subscription-plans')"
                    >
                      <i class="fa-solid fa-arrow-up mr-2" />
                      Choose a New Plan
                    </button>
                  </div>
                </div>
              </div>

              <!-- Metrics -->
              <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div
                  class="rounded-2xl border border-cb-divider bg-cb-card p-4"
                >
                  <p class="text-xs uppercase text-cb-muted">Commission</p>
                  <p class="mt-1 text-xl font-black text-cb-text">
                    {{ planCommission ?? "—" }}%
                  </p>
                </div>

                <div
                  class="rounded-2xl border border-cb-divider bg-cb-card p-4"
                >
                  <p class="text-xs uppercase text-cb-muted">CBC / mo</p>
                  <p
                    class="mt-1 text-xl font-black"
                    :class="planCbcMonthly ? 'text-cb-accent' : 'text-cb-muted'"
                  >
                    {{ planCbcMonthly ? planCbcMonthly.toLocaleString() : "—" }}
                  </p>
                </div>

                <div
                  class="rounded-2xl border border-cb-divider bg-cb-card p-4"
                >
                  <p class="text-xs uppercase text-cb-muted">CBC Discount</p>
                  <p
                    class="mt-1 text-xl font-black"
                    :class="
                      planCbcDiscount ? 'text-cb-positive' : 'text-cb-muted'
                    "
                  >
                    {{ planCbcDiscount ? `${planCbcDiscount}%` : "—" }}
                  </p>
                </div>
              </div>

              <!-- Features -->
              <div
                v-if="activePlanFeatures.length"
                class="rounded-2xl border border-cb-divider bg-cb-card p-6"
              >
                <h3 class="mb-4 text-xs font-bold uppercase text-cb-muted">
                  Features
                </h3>

                <div class="grid gap-3 sm:grid-cols-2">
                  <div
                    v-for="f in activePlanFeatures"
                    :key="f.key"
                    class="flex items-center gap-3 text-sm text-cb-text"
                  >
                    <div
                      class="flex h-6 w-6 items-center justify-center rounded-lg bg-cb-accent/10 text-[10px] text-cb-accent"
                    >
                      <i class="fa-solid fa-check" />
                    </div>
                    {{ f.label }}
                  </div>
                </div>
              </div>
            </template>
          </div>
        </Transition>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  useSubscriptionStore,
  SUBSCRIPTION_STATUS,
} from "@/stores/subscriptionStore";
import { useUserStore } from "@/stores/userStore";
import { useToast } from "@/composables/useToast";

const subscriptionStore = useSubscriptionStore();
const userStore = useUserStore();
const toast = useToast();

const dataFetched = ref(false);
const loadError = ref(null);
const isInitialLoading = computed(() => !dataFetched.value && !loadError.value);

const FEATURE_LABELS = {
  profileHighlight: "Profile highlight",
  priorityListings: "Priority listings",
  featuredBadge: "Featured badge",
  interviewTools: "Interview tools",
  dedicatedSupport: "Dedicated support",
  contractModule: "Contract module",
  analyticsDashboard: "Analytics dashboard",
  unlimitedJobPosts: "Unlimited job posts",
  apiAccess: "API access",
};

/* ───────── Derived state ───────── */

const currentPlan = computed(() => subscriptionStore.currentPlanDetails);

const currentPlanLabel = computed(() => {
  const sub = subscriptionStore.subscription;
  return (
    sub?.nameLabel ||
    subscriptionStore.currentPlanDetails?.nameLabel ||
    (subscriptionStore.isFreeTier ? "Free Plan" : "Current Plan")
  );
});

const freeIcon = computed(() =>
  userStore.isCorporate ? "fa-solid fa-building" : "fa-solid fa-gift",
);

const freePlanDescription = computed(() =>
  userStore.isCorporate
    ? "Corporate free tier - Upgrade to unlock premium features"
    : "Free tier - Upgrade to unlock premium features",
);

const freePlanMetrics = computed(() => {
  const benefits = subscriptionStore.getTierFeatures?.benefits || [];
  if (benefits.length) {
    return benefits.map((b) => ({ label: b, positive: true }));
  }
  // Fallback for when no benefits are defined
  return [
    { label: "Basic profile listing", positive: true },
    { label: "Limited errand posts", positive: true },
    { label: "Priority support", positive: false },
    { label: "Featured badge", positive: false },
  ];
});

/* status */
const isCancelled = computed(() => subscriptionStore.isCancelledOrInactive);
const isExpired = computed(
  () => subscriptionStore.subscriptionStatus === SUBSCRIPTION_STATUS.EXPIRED,
);

const isTerminalState = computed(() => isCancelled.value || isExpired.value);

const statusLabel = computed(() => {
  const s = subscriptionStore.subscriptionStatus;
  if (s === SUBSCRIPTION_STATUS.ACTIVE) return "Active";
  if (s === SUBSCRIPTION_STATUS.CANCELLED) return "Cancelled";
  if (s === SUBSCRIPTION_STATUS.EXPIRED) return "Expired";
  return "Inactive";
});

const statusBadgeClass = computed(() => {
  const s = subscriptionStore.subscriptionStatus;
  if (s === SUBSCRIPTION_STATUS.ACTIVE)
    return "bg-cb-positive/12 text-cb-positive";
  if (s === SUBSCRIPTION_STATUS.CANCELLED)
    return "bg-cb-negative/12 text-cb-negative";
  if (s === SUBSCRIPTION_STATUS.EXPIRED)
    return "bg-amber-500/12 text-amber-500";
  return "bg-cb-field text-cb-muted";
});

/* pricing */
const billingPeriodLabel = computed(() => {
  const sub = subscriptionStore.subscription;
  return (sub?.billingPeriod || "monthly") === "yearly" ? "year" : "month";
});
const currentPriceDisplay = computed(() => {
  const sub = subscriptionStore.subscription;
  if (!sub) return "₦0";

  const period = sub.billingPeriod || "monthly";
  const price =
    period === "yearly"
      ? sub.pricing?.yearlyNGN || 0
      : sub.pricing?.monthlyNGN || sub.priceNGN || 0;

  return price ? `₦${price.toLocaleString()}` : "Free";
});

/* dates */
const startedAtDisplay = computed(() => {
  const sub = subscriptionStore.subscription;
  const d = sub?.startedAt;
  return d
    ? new Date(d).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
});

const nextBillingDisplay = computed(() => {
  const sub = subscriptionStore.subscription;
  const d = sub?.nextBillingDate;
  return d
    ? new Date(d).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
});
const expiryDisplay = computed(() => {
  const d = subscriptionStore.expiresAt;
  return d
    ? new Date(d).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";
});

/* plan features */
const activePlanFeatures = computed(() => {
  const sub = subscriptionStore.subscription;
  const f = sub?.features || subscriptionStore.currentPlanDetails?.features;
  if (!f) return [];
  return Object.entries(f)
    .filter(([, v]) => v === true)
    .map(([k]) => ({ key: k, label: FEATURE_LABELS[k] ?? k }));
});

/* plan metrics */
const planCommission = computed(() => {
  const sub = subscriptionStore.subscription;
  return (
    sub?.commission?.rate ??
    subscriptionStore.currentPlanDetails?.commission?.standard ??
    subscriptionStore.currentPlanDetails?.commissionRate ??
    null
  );
});

const planCbcMonthly = computed(() => {
  const sub = subscriptionStore.subscription;
  return (
    sub?.cbc?.monthlyAllocation ??
    subscriptionStore.currentPlanDetails?.cbc?.monthly ??
    subscriptionStore.currentPlanDetails?.monthlyCbc ??
    0
  );
});

const planCbcDiscount = computed(() => {
  const sub = subscriptionStore.subscription;
  return (
    sub?.cbc?.discount ??
    subscriptionStore.currentPlanDetails?.cbc?.discount ??
    subscriptionStore.currentPlanDetails?.cbcDiscount ??
    0
  );
});
// Auto-renew
const subAutoRenew = computed(() => {
  return subscriptionStore.subscription?.autoRenew ?? false;
});
/* ───────── Styling helpers ───────── */

const planBorderClass = computed(() => {
  if (subscriptionStore.isActive) return "border-cb-positive/40";
  if (isCancelled.value) return "border-cb-negative/30";
  if (isExpired.value) return "border-amber-500/30";
  return "border-cb-divider";
});

const planBarClass = computed(() => {
  const tier = subscriptionStore.currentTier?.toLowerCase();
  if (tier === "free" || tier === "corporate_free") return "bg-cb-divider";
  if (tier === "basic") return "bg-blue-400";
  if (tier === "pro") return "bg-cb-accent";
  if (tier === "elite") return "bg-amber-400";
  if (tier === "corporate_pro") return "bg-purple-500";
  if (tier === "corporate_elite") return "bg-teal-500";
  return "bg-cb-divider";
});

const tierIconBg = computed(() => {
  const tier = subscriptionStore.currentTier?.toLowerCase();
  if (tier === "basic") return "bg-blue-500/10";
  if (tier === "pro") return "bg-cb-accent/10";
  if (tier === "elite") return "bg-yellow-500/10";
  if (tier === "corporate_pro") return "bg-purple-500/10";
  if (tier === "corporate_elite") return "bg-teal-500/10";
  return "bg-cb-field";
});

const tierIcon = computed(() => {
  const tier = subscriptionStore.currentTier?.toLowerCase();
  if (tier === "free" || tier === "corporate_free")
    return "fa-solid fa-gift text-cb-muted";
  if (tier === "basic") return "fa-solid fa-bolt text-blue-400";
  if (tier === "pro") return "fa-solid fa-rocket text-cb-accent";
  if (tier === "elite") return "fa-solid fa-crown text-yellow-400";
  if (tier === "corporate_pro") return "fa-solid fa-building text-purple-400";
  if (tier === "corporate_elite") return "fa-solid fa-gem text-teal-400";
  return "fa-solid fa-gift text-cb-muted";
});

const daysClass = computed(() => {
  if (subscriptionStore.daysUntilExpiry <= 3) return "text-cb-negative";
  if (subscriptionStore.daysUntilExpiry <= 14) return "text-amber-500";
  return "text-cb-positive";
});

const isCancelledOrExpiredLabel = computed(() => {
  if (isCancelled.value) return "Access until";
  if (isExpired.value) return "Expired on";
  return "Expires at";
});

const expiryBarClass = computed(() => {
  if (isExpired.value) return "bg-amber-500";
  if (isCancelled.value) return "bg-cb-negative";
  if (subscriptionStore.daysUntilExpiry <= 7) return "bg-cb-accent";
  return "bg-cb-positive";
});

const expiryProgressPct = computed(() => {
  const sub = subscriptionStore.subscription;
  if (!subscriptionStore.expiresAt || !sub?.startedAt) return 100;

  const start = new Date(sub.startedAt).getTime();
  const end = new Date(subscriptionStore.expiresAt).getTime();
  const now = Date.now();

  if (now >= end) return 100;
  if (now <= start) return 0;
  return Math.round(((now - start) / (end - start)) * 100);
});

/* ───────── Actions ───────── */

async function toggleAutoRenew() {
  try {
    await subscriptionStore.toggleAutoRenew();
    toast.success(
      subscriptionStore.subAutoRenew
        ? "Auto-renew turned on"
        : "Auto-renew turned off",
    );
    await subscriptionStore.fetchMySubscription();
  } catch (err) {
    toast.error(err?.response?.data?.message || "Failed to update auto-renew");
  }
}

async function cancelSubscription() {
  if (
    !confirm(
      "Are you sure you want to cancel your subscription? You'll still have access until the end of your billing period.",
    )
  ) {
    return;
  }

  try {
    await subscriptionStore.cancelSubscription();
    toast.success("Subscription cancelled");
    await subscriptionStore.fetchMySubscription();
  } catch (err) {
    toast.error(
      err?.response?.data?.message || "Failed to cancel subscription",
    );
  }
}

/* ───────── Lifecycle ───────── */

async function loadData() {
  loadError.value = null;

  try {
    await subscriptionStore.fetchMySubscription();
  } catch (err) {
    if (
      err?.code !== "ERR_CANCELED" &&
      err?.message !== "Duplicate request cancelled"
    ) {
      loadError.value =
        err?.response?.data?.message || "Failed to load subscription";
    }
  } finally {
    dataFetched.value = true;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>
