<template>
  <div
    class="plan-card group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300"
    :class="[
      isCurrent
        ? 'border-cb-positive/40 bg-cb-card shadow-[0_0_0_1px_rgba(var(--color-cb-positive-rgb),0.1)]'
        : plan.highlight && !isCurrent
          ? 'border-cb-accent/50 bg-cb-card shadow-[0_8px_40px_-12px_var(--color-cb-accent)/35]'
          : 'border-cb-divider bg-cb-card hover:border-cb-accent/30 hover:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.2)]',
    ]"
  >
    <!-- Tier bar -->
    <div class="h-[3px] w-full" :class="tierBar" />

    <!-- Badges -->
    <div
      v-if="plan.highlight && !isCurrent"
      class="absolute right-4 top-0 rounded-b-xl px-3 py-1 text-[11px] font-bold uppercase text-white"
      :class="tierAccentBg"
    >
      Popular
    </div>

    <div
      v-else-if="isCurrent"
      class="absolute right-4 top-0 rounded-b-xl bg-cb-positive px-3 py-1 text-[11px] font-bold uppercase text-white"
    >
      <i class="fa fa-circle-check"></i> Your Plan
    </div>

    <!-- HEADER -->
    <div class="p-6 pb-4" :class="plan.highlight || isCurrent ? 'pt-7' : ''">
      <div class="mb-5 flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-xl"
          :class="tierIconBg"
        >
          <i :class="tierIcon" />
        </div>

        <div>
          <h3 class="text-base font-bold text-cb-text">
            {{ plan.nameLabel }}
          </h3>
          <p class="text-xs text-cb-muted capitalize">
            {{ plan.planType }}
          </p>
        </div>
      </div>

      <!-- PRICE (NOW FULLY FLAT) -->
      <div class="mb-4">
        <div class="flex items-end gap-1.5">
          <span class="text-[1.75rem] font-bold text-cb-text">
            {{ formattedPrice }}
          </span>

          <span
            v-if="plan.activePrice > 0"
            class="mb-1.5 text-sm text-cb-muted"
          >
            /{{ billingPeriod === "monthly" ? "mo" : "yr" }}
          </span>
        </div>
      </div>

      <!-- KEY METRICS -->
      <div class="grid grid-cols-2 gap-2">
        <div class="rounded-xl bg-cb-field px-3 py-2">
          <p class="text-[10px] uppercase text-cb-muted">Commission</p>
          <p class="text-sm font-bold text-cb-text">
            {{ plan.activeCommission }}%
          </p>
        </div>

        <div class="rounded-xl bg-cb-field px-3 py-2">
          <p class="text-[10px] uppercase text-cb-muted">CBC / mo</p>
          <p class="text-sm font-bold text-cb-accent">
            {{ plan.activeCbc ? plan.activeCbc.toLocaleString() : "—" }}
          </p>
        </div>

        <div
          v-if="plan.activeCbcDiscount"
          class="col-span-2 rounded-xl bg-cb-field px-3 py-2"
        >
          <p class="text-[10px] uppercase text-cb-muted">
            CBC Discount
          </p>
          <p class="text-sm font-bold text-cb-accent">
            {{ plan.activeCbcDiscount }}%
          </p>
        </div>
      </div>
    </div>

    <div class="mx-5 h-px bg-cb-divider" />

    <!-- FEATURES -->
    <ul class="flex-1 p-5 space-y-2.5">
      <li
        v-for="feat in featureEntries"
        :key="feat.key"
        class="flex items-start gap-2.5 text-sm text-cb-text"
      >
        <span
          class="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-cb-positive/15 text-cb-positive"
        >
          <i class="fa-solid fa-check " />
        </span>
        {{ feat.label }}
      </li>

      <li v-if="!featureEntries.length" class="text-xs text-cb-muted italic">
        Core plan — see comparison table for full details
      </li>
    </ul>

    <!-- CTA -->
    <div class="p-5 pt-2">
      <button
        class="w-full rounded-xl py-3 text-sm font-bold transition-all"
        :class="ctaClass"
        :disabled="isCurrent || isLoading || isIneligible"
        @click="$emit('select', plan)"
      >
        <span v-if="isLoading">Processing...</span>
        <span v-else-if="isIneligible">Not Available</span>
        <span v-else>{{ ctaText }}</span>
      </button>

      <p
        v-if="isIneligible && plan.ineligibleReason"
        class="mt-2 text-xs text-cb-muted"
      >
        {{ plan.ineligibleReason }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  plan: Object,
  billingPeriod: { type: String, default: "monthly" },
  isCurrent: Boolean,
  isLoading: Boolean,
  currentTier: String
});

defineEmits(["select"]);

/* -------------------------
   PRICE (NOW FLAT ONLY)
-------------------------- */
const price = computed(() => props.plan.activePrice ?? 0);

const formattedPrice = computed(() => {
  if (!price.value) return "Free";
  return `₦${price.value.toLocaleString()}`;
});

/* -------------------------
   FEATURES
-------------------------- */
const FEATURE_LABELS = {
  profileHighlight: "Profile highlight",
  priorityListings: "Priority listings",
  featuredBadge: "Featured badge",
  interviewTools: "Interview tools",
  dedicatedSupport: "Dedicated support",
  contractModule: "Contract module",
  analyticsDashboard: "Analytics dashboard",
  unlimitedJobPosts: "Unlimited job posts",
  apiAccess: "API access"
};

const featureEntries = computed(() => {
  const f = props.plan.features;
  if (!f) return [];

  return Object.entries(f)
    .filter(([, v]) => v === true)
    .map(([k]) => ({
      key: k,
      label: FEATURE_LABELS[k] ?? k
    }));
});

/* -------------------------
   UI STATE
-------------------------- */
const isIneligible = computed(() => props.plan.eligible === false);

const ctaText = computed(() => {
  if (props.isCurrent) return "Current Plan";
  return "Get Plan";
});

const ctaClass = computed(() =>
  props.isCurrent
    ? "bg-gray-200 text-gray-500"
    : "bg-cb-accent text-white hover:opacity-90"
);

/* -------------------------
   STYLE HELPERS
-------------------------- */
const TIER_STYLES = {
  free: { bar: "bg-gray-400", iconBg: "bg-gray-100", icon: "fa-gift" },
  basic: { bar: "bg-blue-400", iconBg: "bg-blue-100", icon: "fa-bolt" },
  pro: { bar: "bg-purple-500", iconBg: "bg-purple-100", icon: "fa-rocket" },
  elite: { bar: "bg-yellow-500", iconBg: "bg-yellow-100", icon: "fa-crown" },
};

const style = computed(
  () => TIER_STYLES[props.plan.tier] ?? TIER_STYLES.free
);

const tierBar = computed(() => style.value.bar);
const tierIconBg = computed(() => style.value.iconBg);
const tierIcon = computed(() => `fa-solid ${style.value.icon}`);
const tierAccentBg = computed(() => "bg-cb-accent");
</script>