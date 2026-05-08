<!-- src/pages/public/PublicSubscriptionPlans.vue -->
<template>
  <div class="min-h-screen bg-cb-base">

    <!-- ───── HERO ───── -->
    <section
      class="relative overflow-hidden pb-10 pt-14 sm:pb-14 sm:pt-20"
      :style="{ backgroundImage: `url(${heroImg1})`, backgroundSize: 'cover', backgroundPosition: 'bottom', backgroundRepeat: 'no-repeat' }"
    >
      <!-- Dark overlay so text stays readable -->
      <div class="pointer-events-none absolute inset-0 bg-black/55" />

      <!-- Content -->
      <div class="relative mx-auto flex max-w-7xl flex-col items-center gap-4 text-center px-4 sm:px-6">

        <!-- Badge -->
        <div class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-bold tracking-widest text-white uppercase backdrop-blur-sm">
          <span class="size-1.5 animate-pulse rounded-full bg-white" />
          Subscription Plans
        </div>

        <h1 class="text-[clamp(1.5rem,4.5vw,3rem)] leading-[1.1] tracking-tight text-white">
          The right plan,<br>
          <span class="text-cb-accent">right now.</span>
        </h1>

        <p class="m-0 max-w-xs text-sm leading-relaxed text-white/75 sm:text-base md:max-w-md">
          Start free. Upgrade when you're ready. No hidden fees, cancel anytime.
        </p>

        <!-- Billing toggle -->
        <div class="mt-2 flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
          <span :class="['text-sm font-semibold transition-colors', billingPeriod === 'monthly' ? 'text-white' : 'text-white/50']">
            Monthly
          </span>

          <button
            class="relative h-[26px] w-11 shrink-0 cursor-pointer rounded-full border border-white/30 bg-white/20 transition-all duration-200"
            :class="billingPeriod === 'yearly' ? '!border-cb-accent !bg-cb-accent' : ''"
            @click="toggleBilling"
            aria-label="Switch billing period"
          >
            <span
              class="absolute top-[3px] left-[3px] size-[18px] rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              :class="billingPeriod === 'yearly' ? 'translate-x-[18px]' : 'translate-x-0'"
            />
          </button>

          <span :class="['flex items-center gap-1.5 text-sm font-semibold transition-colors', billingPeriod === 'yearly' ? 'text-white' : 'text-white/50']">
            Yearly
            <span v-if="averageYearlySaving > 0"
              class="rounded-full bg-cb-accent-subtle px-2 py-0.5 text-[10px] font-bold text-cb-accent">
              Save {{ averageYearlySaving }}%
            </span>
          </span>
        </div>

      </div>
    </section>

    <!-- ───── TABS ───── -->
    <nav v-if="dataFetched"
      class="sticky top-0 z-20 bg-cb-base-96 backdrop-blur-md px-12 flex items-center justify-center"
      role="tablist"
    >
      <div class="mx-auto flex max-w-5xl gap-0 overflow-x-auto [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          role="tab"
          :aria-selected="activeTab === tab.value"
          class="relative flex shrink-0 cursor-pointer items-center gap-2 border-none bg-transparent px-5 py-3.5 text-sm font-semibold whitespace-nowrap outline-none transition-colors"
          :class="activeTab === tab.value ? 'text-cb-accent' : 'text-cb-muted hover:text-cb-text'"
          @click="activeTab = tab.value"
        >
          <i :class="tab.icon" aria-hidden="true" />
          {{ tab.label }}
          <span
            class="absolute right-0 bottom-0 left-0 h-0.5 rounded-t-sm bg-cb-accent transition-opacity duration-200"
            :class="activeTab === tab.value ? 'opacity-100' : 'opacity-0'"
          />
        </button>
      </div>
    </nav>

    <!-- ───── MAIN CONTENT ───── -->
    <main class="mx-auto flex max-w-5xl flex-col gap-8 py-8 px-4 sm:py-12">

      <!-- Skeleton loading -->
      <template v-if="isInitialLoading">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          <div
            v-for="i in 3" :key="i"
            class="h-[460px] rounded-2xl"
            style="
              background: linear-gradient(90deg, var(--color-cb-card) 25%, color-mix(in srgb, var(--color-cb-card) 60%, var(--color-cb-field)) 50%, var(--color-cb-card) 75%);
              background-size: 400% 100%;
              animation: shimmer 1.6s ease-in-out infinite;
            "
          />
        </div>
      </template>

      <!-- Error state -->
      <div v-else-if="loadError"
        class="flex flex-col items-center gap-3 py-20 text-center"
      >
        <div class="mb-1 grid size-14 place-items-center rounded-2xl bg-cb-negative-subtle text-2xl text-cb-negative">
          <i class="fa-solid fa-satellite-dish" />
        </div>
        <h2 class="m-0 text-lg font-bold text-cb-text">Something went wrong</h2>
        <p class="m-0 max-w-sm text-sm text-cb-muted">{{ loadError }}</p>
        <button
          class="mt-2 cursor-pointer rounded-xl bg-cb-accent px-6 py-2.5 text-sm font-bold text-white transition-[filter,transform] hover:brightness-110 active:scale-95"
          @click="loadData"
        >
          Try again
        </button>
      </div>

      <!-- Plans -->
      <template v-else>

        <!-- Student segment toggle -->
        <Transition name="fade-down">
          <div v-if="activeTab === 'individual' && hasStudentPlans"
            class="flex self-center rounded-xl border border-cb-divider bg-cb-card p-1"
          >
            <button
              :class="[
                'flex cursor-pointer items-center gap-1.5 rounded-lg border-none px-4 py-2 text-sm font-semibold transition-all',
                !isStudentView ? 'bg-cb-base text-cb-text shadow-sm' : 'bg-transparent text-cb-muted'
              ]"
              @click="isStudentView = false"
            >
              Standard
            </button>
            <button
              :class="[
                'flex cursor-pointer items-center gap-1.5 rounded-lg border-none px-4 py-2 text-sm font-semibold transition-all',
                isStudentView ? 'bg-cb-base text-cb-text shadow-sm' : 'bg-transparent text-cb-muted'
              ]"
              @click="isStudentView = true"
            >
              Student
              <span class="rounded-full bg-cb-positive-subtle px-1.5 py-0.5 text-[10px] font-bold text-cb-positive">
                Save
              </span>
            </button>
          </div>
        </Transition>

        <!-- Plan cards -->
        <Transition name="tab-slide" mode="out-in">
          <div
            :key="activeTab + String(isStudentView)"
            class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
          >
            <PlanCard
              v-for="(plan, idx) in displayPlans"
              :key="plan._id || plan.tier"
              :plan="plan"
              :billing-period="billingPeriod"
              :is-current="false"
              :current-tier="null"
              :style="{ '--card-delay': idx * 60 + 'ms' }"
              class="[animation-delay:var(--card-delay)] [animation:card-in_0.35s_ease_both]"
              @select="handleSelectPlan"
            />
          </div>
        </Transition>

        <!-- Empty state -->
        <div v-if="displayPlans.length === 0 && dataFetched"
          class="flex flex-col items-center gap-2 py-20 text-center"
        >
          <div class="mb-1 grid size-14 place-items-center rounded-2xl bg-cb-field text-2xl text-cb-muted">
            <i class="fa-solid fa-box-open" />
          </div>
          <h3 class="m-0 text-lg font-bold text-cb-text">No plans here yet</h3>
          <p class="m-0 text-sm text-cb-muted">Check back soon — new plans are on the way.</p>
        </div>

        <!-- CTA block -->
        <div v-if="displayPlans.length > 0"
          class="relative overflow-hidden rounded-2xl border border-cb-divider bg-cb-card p-6 sm:p-10"
        >
          <div class="pointer-events-none absolute inset-0"
            style="background: radial-gradient(ellipse 60% 80% at 100% 100%, color-mix(in srgb, var(--color-cb-accent) 8%, transparent), transparent)" />

          <div class="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="m-0 text-[10px] font-bold tracking-widest text-cb-accent uppercase">Ready to begin?</p>
              <h2 class="m-0 mt-1 text-[clamp(1.125rem,3vw,1.5rem)] font-bold leading-snug text-cb-text">
                Join thousands already on CampusBase
              </h2>
              <p class="m-0 mt-1.5 text-sm text-cb-muted">Start free, upgrade when you need more.</p>
            </div>

            <div class="flex shrink-0 flex-wrap gap-3">
              <button
                class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cb-accent px-6 py-2.5 text-sm font-bold whitespace-nowrap text-white transition-[filter,transform] hover:brightness-110 active:scale-95"
                @click="handleGetStarted"
              >
                Get started free
                <i class="fa-solid fa-arrow-right text-xs" />
              </button>
              <button
                v-if="!authStore.isAuthenticated"
                class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-cb-divider px-6 py-2.5 text-sm font-semibold whitespace-nowrap text-cb-text transition-[border-color,transform] hover:border-cb-accent-muted active:scale-95"
                @click="$router.push('/auth/register')"
              >
                Create account
              </button>
            </div>
          </div>
        </div>

      </template>
    </main>

    <ToastContainer />
      <ScrollToTop />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { subscriptionApi } from "@/api/subscriptionApi";
import { normalizeRawPlan } from "@/utils/planNormalizer";
import { toPlanViewModel } from "@/utils/planViewModel";
import PlanCard from "@/components/subscription/PlanCard.vue";
import ToastContainer from "@/components/reusables/ToastContainer.vue";
import ScrollToTop         from '@/components/reusables/ScrollToTop.vue'
import heroImg1 from "@/assets/img/publicImages/subscription_hero.png";

const router = useRouter();
const authStore = useAuthStore();

const billingPeriod  = ref("monthly");
const activeTab      = ref("individual");
const isStudentView  = ref(false);
const dataFetched    = ref(false);
const loadError      = ref(null);
const allPlans       = ref([]);

const isInitialLoading = computed(() => !dataFetched.value && !loadError.value);

const tabs = [
  { value: "individual", label: "Individual", icon: "fa-solid fa-user" },
  { value: "corporate",  label: "Corporate",  icon: "fa-solid fa-building" },
];

const normalizedPlans = computed(() => allPlans.value.map(normalizeRawPlan));

const individualStandardPlans = computed(() =>
  normalizedPlans.value
    .filter(p => p.planType === "individual" && !p.isFree)
    .map(p => toPlanViewModel(p, "non-student", billingPeriod.value))
);

const individualStudentPlans = computed(() =>
  normalizedPlans.value
    .filter(p => p.planType === "individual" && !p.isFree)
    .map(p => toPlanViewModel(p, "student", billingPeriod.value))
);

const corporatePlansList = computed(() =>
  normalizedPlans.value
    .filter(p => p.planType === "corporate")
    .map(p => ({ ...toPlanViewModel(p, "corporate", billingPeriod.value), eligible: true }))
);

const displayPlans = computed(() => {
  if (activeTab.value === "individual") {
    return isStudentView.value ? individualStudentPlans.value : individualStandardPlans.value;
  }
  return corporatePlansList.value;
});

const hasStudentPlans = computed(() =>
  individualStudentPlans.value.some(p => (p.studentMonthlyNGN || p.studentYearlyNGN) > 0)
);

const averageYearlySaving = computed(() => {
  const savings = displayPlans.value.map(p => p.yearlySavingPct || 0).filter(Boolean);
  return savings.length ? Math.round(Math.max(...savings)) : 0;
});

function toggleBilling() {
  billingPeriod.value = billingPeriod.value === "monthly" ? "yearly" : "monthly";
}

function handleSelectPlan() {
  if (!authStore.isAuthenticated) {
    router.push({ path: "/auth/login", query: { redirect: "/user/subscription-plans" } });
    return;
  }
  router.push("/user/subscription-plans");
}

function handleGetStarted() {
  if (authStore.isAuthenticated) {
    router.push("/user/subscription-plans");
  } else {
    router.push({ path: "/auth/login", query: { redirect: "/user/subscription-plans" } });
  }
}

async function loadData() {
  loadError.value = null;
  try {
    const res   = await subscriptionApi.getPublicPlans();
    const plans = res?.data?.plans || [];
    allPlans.value = plans;
    if (!plans.length) {
      loadError.value = "No plans are currently available. Please check back later.";
    }
  } catch (err) {
    if (err?.code !== "ERR_CANCELED" && err?.message !== "Duplicate request cancelled") {
      loadError.value = err?.response?.data?.message || "Failed to load plans. Please try again.";
    }
  } finally {
    dataFetched.value = true;
  }
}

onMounted(loadData);
</script>

<style scoped>
@keyframes shimmer {
  0%   { background-position: 100% 50%; }
  100% { background-position: 0%   50%; }
}

@keyframes card-in {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0);    }
}

.tab-slide-enter-active,
.tab-slide-leave-active  { transition: all 0.22s ease; }
.tab-slide-enter-from    { opacity: 0; transform: translateY(10px);  }
.tab-slide-leave-to      { opacity: 0; transform: translateY(-6px);  }

.fade-down-enter-active,
.fade-down-leave-active  { transition: all 0.2s ease; }
.fade-down-enter-from,
.fade-down-leave-to      { opacity: 0; transform: translateY(-8px); }
</style>