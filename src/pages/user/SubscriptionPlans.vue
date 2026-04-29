<template>
  <div class="min-h-screen bg-cb-base">
    <!-- HERO -->
    <div class="relative overflow-hidden border-b border-cb-divider">
      <div class="pointer-events-none absolute inset-0">
        <div class="absolute inset-0 opacity-[0.07]"
          style="background:radial-gradient(ellipse 70% 50% at 50% -5%,var(--color-cb-accent),transparent)" />
        <div class="absolute inset-0 opacity-[0.025]"
          style="background-image:radial-gradient(circle,var(--color-cb-accent) 1px,transparent 1px);background-size:28px 28px;" />
      </div>

      <div class="relative mx-auto max-w-7xl  py-14 text-center">
        <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-cb-accent/30 bg-cb-accent/10 px-4 py-1.5 text-[11px] font-bold tracking-widest text-cb-accent uppercase">
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-cb-accent" />
          Subscription Plans
        </div>

        <h1 class="mb-3 text-xl  tracking-tight text-cb-text sm:text-4xl lg:text-5xl">
          Unlock your full potential
        </h1>

        <p class="mx-auto max-w-xl text-base text-cb-muted sm:text-lg">
          Choose the plan that fits your goals. Upgrade anytime, cancel whenever.
        </p>

        <!-- Billing toggle -->
        <div class="mt-8 flex items-center justify-center gap-4">
          <span :class="['text-sm font-semibold', billingPeriod==='monthly'?'text-cb-text':'text-cb-muted']">Monthly</span>

          <button
            class="relative h-7 w-13 rounded-full transition-colors"
            :class="billingPeriod==='yearly'?'bg-cb-accent':'bg-cb-field border border-cb-divider'"
            @click="toggleBilling"
          >
            <span class="absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300"
              :class="billingPeriod==='yearly'?'translate-x-6':'translate-x-0'" />
          </button>

          <span :class="['text-sm font-semibold', billingPeriod==='yearly'?'text-cb-text':'text-cb-muted']">
            Yearly
            <span v-if="averageYearlySaving > 0"
              class="ml-1.5 rounded-full bg-cb-accent/15 px-2.5 py-0.5 text-[10px] font-bold text-cb-accent">
              Save ~{{ averageYearlySaving }}%
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div v-if="dataFetched && tabs.length > 1"
      class="sticky top-0 z-10 border-b border-cb-divider bg-cb-base/95 backdrop-blur-md">
      <div class="mx-auto max-w-7xl ">
        <div class="flex gap-1">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            class="relative px-5 py-4 text-sm font-semibold"
            :class="activeTab===tab.value?'text-cb-accent':'text-cb-muted'"
            @click="activeTab = tab.value"
          >
            <i :class="tab.icon" class="mr-2" />
            {{ tab.label }}
            <span
              class="absolute bottom-0 left-0 h-0.5 w-full bg-cb-accent transition"
              :class="activeTab===tab.value?'opacity-100':'opacity-0'"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- CONTENT -->
    <main class="mx-auto max-w-7xl  py-10">
      <!-- Loading -->
      <template v-if="isInitialLoading">
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="i in 3" :key="i" class="h-[460px] animate-pulse rounded-2xl bg-cb-card" />
        </div>
      </template>

      <!-- Error -->
      <div v-else-if="subscriptionStore.error && !displayPlans.length"
        class="rounded-2xl border border-cb-negative/20 bg-cb-negative/5 p-10 text-center">
        <p class="font-semibold text-cb-text">Failed to load plans</p>
        <p class="mt-2 text-sm text-cb-muted">{{ subscriptionStore.error }}</p>
        <button class="mt-5 rounded-xl bg-cb-accent px-5 py-2 text-white" @click="loadData">
          Retry
        </button>
      </div>

      <!-- PLANS -->
      <template v-else>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <PlanCard
            v-for="plan in displayPlans"
            :key="plan._id || plan.tier"
            :plan="plan"
            :billing-period="billingPeriod"
            :is-current="isCurrentPlan(plan.tier)"
            :is-loading="actionPlanTier===plan.tier && subscriptionStore.actionLoading"
            :current-tier="subscriptionStore.currentTier"
            @select="handleSelectPlan"
          />
        </div>

        <div v-if="displayPlans.length === 0 && dataFetched" class="text-center py-10">
          <p class="text-cb-muted">No plans available for your account type.</p>
        </div>

        <div v-if="displayPlans.length > 0" class="mt-14">
          <h2 class="mb-6 text-center text-xl font-bold text-cb-text">
            Compare plans
          </h2>
          <FeatureComparisonTable
            :plans="displayPlans"
            :free-plan="freePlanForTab"
          />
        </div>
      </template>
    </main>

    <!-- Confirm modal -->
    <SubscribeConfirmModal
      v-if="confirmModal.open"
      :plan="confirmModal.plan"
      :billing-period="billingPeriod"
      :loading="subscriptionStore.actionLoading"
      :is-upgrade="isUpgradeAction"
      @confirm="doSubscribe"
      @cancel="confirmModal.open = false"
    />

    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore }             from "@/stores/authStore";
import { useUserStore }             from "@/stores/userStore";
import { useSubscriptionStore }     from "@/stores/subscriptionStore";
import { getUserType, getAuthenticatedPlans } from "@/utils/planAccess";
import { toPlanViewModel }          from "@/utils/planViewModel";
import PlanCard                     from "@/components/subscription/PlanCard.vue";
import SubscribeConfirmModal        from "@/components/subscription/SubscribeConfirmModal.vue";
import FeatureComparisonTable       from "@/components/subscription/FeatureComparisonTable.vue";
import ToastContainer               from "@/components/reusables/ToastContainer.vue";
import { useToast }                 from "@/composables/useToast";

const authStore         = useAuthStore();
const userStore         = useUserStore();
const subscriptionStore = useSubscriptionStore();
const toast             = useToast();

const billingPeriod  = ref("monthly");
const activeTab      = ref("individual");
const dataFetched    = ref(false);
const isInitializing = ref(false);
const actionPlanTier = ref(null);
const confirmModal   = ref({ open: false, plan: null });

// ── User context ──────────────────────────────────────────────
const currentUser = computed(() => {
  if (!authStore.isAuthenticated) return null;
  
  const user = userStore.user;
  if (!user) return null;
  
  return {
    role: user.role ?? null,
    isStudent: user.role === "student" || user.isStudent === true,
  };
});

const userType = computed(() => getUserType(currentUser.value));

// ── Plan resolution ───────────────────────────────────────────
const resolvedPlans = computed(() => {
  if (!currentUser.value || !subscriptionStore.plans.length) return [];
  const plans = getAuthenticatedPlans(subscriptionStore.plans, currentUser.value);
  return plans.map(p => toPlanViewModel(p, userType.value, billingPeriod.value));
});

// Display plans - use the filtered plans directly
const displayPlans = computed(() => resolvedPlans.value);

// Find the free plan for the comparison table
const freePlanForTab = computed(() => {
  if (userStore.isCorporate) {
    return resolvedPlans.value.find(p => p.tier?.toLowerCase() === 'corporate_free') || null;
  }
  return resolvedPlans.value.find(p => p.tier?.toLowerCase() === 'free') || null;
});

// ── Tabs ──────────────────────────────────────────────────────
const tabs = computed(() => {
  if (!dataFetched.value) return [];
  
  if (userStore.isCorporate) {
    return [{ value: "corporate", label: "Corporate", icon: "fa-solid fa-building" }];
  }
  
  return [{ value: "individual", label: "Individual", icon: "fa-solid fa-user" }];
});

// ── Helpers ───────────────────────────────────────────────────
const isInitialLoading = computed(() => !dataFetched.value);

const averageYearlySaving = computed(() => {
  const values = displayPlans.value.map(p => p.yearlySavingPct || 0).filter(Boolean);
  return values.length
    ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    : 0;
});

const isUpgradeAction = computed(() => {
  const t = subscriptionStore.currentTier;
  return t && t !== "free" && subscriptionStore.isActive;
});

function isCurrentPlan(tier) {
  return subscriptionStore.currentTier === tier;
}

function toggleBilling() {
  billingPeriod.value = billingPeriod.value === "monthly" ? "yearly" : "monthly";
}

function handleSelectPlan(plan) {
  if (isCurrentPlan(plan.tier))  return toast.info("Already your active plan");
  if (plan.eligible === false)   return toast.error(plan.ineligibleReason);
  confirmModal.value = { open: true, plan };
}

async function doSubscribe() {
  const plan = confirmModal.value.plan;
  actionPlanTier.value = plan.tier;
  try {
    const fn  = isUpgradeAction.value ? subscriptionStore.upgrade : subscriptionStore.subscribe;
    const res = await fn({ tier: plan.tier, billingPeriod: billingPeriod.value });

    if (res?.data?.authorizationUrl) {
      window.location.href = res.data.authorizationUrl;
      return;
    }

    toast.success("Subscription updated");
    confirmModal.value.open = false;
    await subscriptionStore.fetchMySubscription();
  } catch (e) {
    toast.error(e?.response?.data?.message || "Subscription failed");
  } finally {
    actionPlanTier.value = null;
  }
}

async function loadData() {
  if (isInitializing.value || dataFetched.value) return;
  
  isInitializing.value = true;
  
  try {
    await Promise.all([
      subscriptionStore.fetchMySubscription(),
      subscriptionStore.fetchPlans(true)
    ]);
    
    activeTab.value = userStore.isCorporate ? "corporate" : "individual";
    dataFetched.value = true;
  } catch (error) {
    if (error?.code !== 'ERR_CANCELED' && error?.message !== 'Duplicate request cancelled') {
      console.error('Failed to load plans:', error);
    }
    dataFetched.value = true;
  } finally {
    isInitializing.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.tab-fade-enter-active,.tab-fade-leave-active {
  transition: all .2s ease;
}
.tab-fade-enter-from,.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>