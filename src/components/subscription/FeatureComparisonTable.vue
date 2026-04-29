<template>
  <div class="overflow-hidden rounded-2xl border border-cb-divider bg-cb-card">
    <div class="overflow-x-auto">
      <table class="w-full text-sm" :style="`min-width: ${minWidth}px`">

        <!-- Header -->
        <thead>
          <tr class="border-b border-cb-divider">
            <th class="w-48 px-6 py-4 text-left">
              <span class="text-[10px] font-bold uppercase tracking-widest text-cb-muted">Feature</span>
            </th>

            <th
              v-for="plan in visiblePlans"
              :key="plan.tier"
              class="px-4 py-4 text-center transition-opacity"
              :class="plan.eligible === false ? 'opacity-50' : ''"
            >
              <div class="flex flex-col items-center gap-1">

                <div class="relative mx-auto mb-1">
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
                    :class="tierStyle(plan.tier).iconBg"
                  >
                    <i :class="tierStyle(plan.tier).icon" />
                  </div>

                  <span
                    v-if="plan.eligible === false"
                    class="absolute -right-1.5 -bottom-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-cb-divider bg-cb-field"
                  >
                    <i class="fa-solid fa-lock text-[8px] text-cb-muted" />
                  </span>
                </div>

                <span
                  class="text-xs font-bold"
                  :class="plan.eligible === false ? 'text-cb-muted' : plan.highlight ? 'text-cb-accent' : 'text-cb-text'"
                >
                  {{ plan.nameLabel }}
                </span>

                <span
                  v-if="plan.highlight && plan.eligible !== false"
                  class="rounded-full bg-cb-accent/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cb-accent"
                >
                  Popular
                </span>

                <span
                  v-else-if="plan.eligible === false"
                  class="rounded-full border border-cb-divider bg-cb-field px-2 py-0.5 text-[9px] font-medium text-cb-muted"
                >
                  Locked
                </span>

              </div>
            </th>
          </tr>
        </thead>

        <tbody>

          <!-- Pricing -->
          <tr class="border-b border-cb-divider bg-cb-field/50">
            <td :colspan="visiblePlans.length + 1" class="px-6 py-2">
              <span class="text-[10px] font-bold uppercase tracking-widest text-cb-muted">Pricing</span>
            </td>
          </tr>

          <tr class="border-b border-cb-divider/60 hover:bg-cb-field/40">
            <td class="px-6 py-3.5 font-medium text-cb-muted">Monthly price</td>
            <td
              v-for="plan in visiblePlans"
              :key="plan.tier + '-m'"
              class="px-4 py-3.5 text-center font-semibold"
              :class="plan.highlight ? 'bg-cb-accent/[0.025]' : ''"
            >
              {{ formatPrice(monthlyPrice(plan)) }}
            </td>
          </tr>

          <tr class="border-b border-cb-divider/60 hover:bg-cb-field/40">
            <td class="px-6 py-3.5 font-medium text-cb-muted">Yearly price</td>

            <td
              v-for="plan in visiblePlans"
              :key="plan.tier + '-y'"
              class="px-4 py-3.5 text-center"
              :class="plan.highlight ? 'bg-cb-accent/[0.025]' : ''"
            >
              <span class="font-semibold text-cb-text">
                {{ formatPrice(yearlyPrice(plan)) }}
              </span>

              <span
                v-if="plan.yearlySavingPct"
                class="ml-1.5 rounded-full bg-cb-accent/12 px-1.5 py-0.5 text-[9px] font-bold text-cb-accent"
              >
                Save {{ plan.yearlySavingPct }}%
              </span>
            </td>
          </tr>

          <!-- Commission -->
          <tr class="border-b border-cb-divider bg-cb-field/50">
            <td :colspan="visiblePlans.length + 1" class="px-6 py-2">
              <span class="text-[10px] font-bold uppercase tracking-widest text-cb-muted">
                Commission & Rewards
              </span>
            </td>
          </tr>

          <tr class="border-b border-cb-divider/60 hover:bg-cb-field/40">
            <td class="px-6 py-3.5 font-medium text-cb-muted">Commission rate</td>

            <td
              v-for="plan in visiblePlans"
              :key="plan.tier + '-c'"
              class="px-4 py-3.5 text-center font-semibold"
              :class="plan.highlight ? 'bg-cb-accent/[0.025]' : ''"
            >
              {{ getCommission(plan) ? `${getCommission(plan)}%` : '—' }}
            </td>
          </tr>

          <tr class="border-b border-cb-divider/60 hover:bg-cb-field/40">
            <td class="px-6 py-3.5 font-medium text-cb-muted">CBC rewards / mo</td>

            <td
              v-for="plan in visiblePlans"
              :key="plan.tier + '-cbc'"
              class="px-4 py-3.5 text-center"
              :class="plan.highlight ? 'bg-cb-accent/[0.025]' : ''"
            >
              <span :class="getCbc(plan) ? 'text-cb-accent' : 'text-cb-muted'">
                {{ getCbc(plan) ? getCbc(plan).toLocaleString() : '—' }}
              </span>
            </td>
          </tr>

          <tr class="border-b border-cb-divider/60 hover:bg-cb-field/40">
            <td class="px-6 py-3.5 font-medium text-cb-muted">CBC discount</td>

            <td
              v-for="plan in visiblePlans"
              :key="plan.tier + '-cbcd'"
              class="px-4 py-3.5 text-center"
              :class="plan.highlight ? 'bg-cb-accent/[0.025]' : ''"
            >
              <span :class="getCbcDiscount(plan) ? 'text-cb-positive' : 'text-cb-muted'">
                {{ getCbcDiscount(plan) ? `${getCbcDiscount(plan)}%` : '—' }}
              </span>
            </td>
          </tr>

          <!-- Features -->
          <template v-if="featureRows.length">
            <tr class="border-b border-cb-divider bg-cb-field/50">
              <td :colspan="visiblePlans.length + 1" class="px-6 py-2">
                <span class="text-[10px] font-bold uppercase tracking-widest text-cb-muted">
                  Features
                </span>
              </td>
            </tr>

            <tr
              v-for="row in featureRows"
              :key="row.key"
              class="border-b border-cb-divider/60 hover:bg-cb-field/40"
            >
              <td class="px-6 py-3.5 font-medium text-cb-muted">
                {{ row.label }}
              </td>

              <td
                v-for="plan in visiblePlans"
                :key="plan.tier + row.key"
                class="px-4 py-3.5 text-center"
                :class="plan.highlight ? 'bg-cb-accent/[0.025]' : ''"
              >
                <span v-if="hasFeature(plan, row.key)" class="text-cb-positive">
                  <i class="fa-solid fa-check" />
                </span>
                <span v-else class="text-cb-divider">—</span>
              </td>
            </tr>
          </template>

          <!-- Benefits -->
          <template v-if="benefitRows.length">
            <tr class="border-b border-cb-divider bg-cb-field/50">
              <td :colspan="visiblePlans.length + 1" class="px-6 py-2">
                <span class="text-[10px] font-bold uppercase tracking-widest text-cb-muted">
                  Benefits
                </span>
              </td>
            </tr>

            <tr
              v-for="benefit in benefitRows"
              :key="benefit"
              class="border-b border-cb-divider/60 hover:bg-cb-field/40"
            >
              <td class="px-6 py-3.5 font-medium text-cb-muted">
                {{ benefit }}
              </td>

              <td
                v-for="plan in visiblePlans"
                :key="plan.tier + benefit"
                class="px-4 py-3.5 text-center"
                :class="plan.highlight ? 'bg-cb-accent/[0.025]' : ''"
              >
                <span v-if="hasBenefit(plan, benefit)" class="text-cb-positive">
                  <i class="fa-solid fa-check" />
                </span>
                <span v-else class="text-cb-divider">—</span>
              </td>
            </tr>
          </template>

        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  plans: { type: Array, default: () => [] },
  freePlan: { type: Object, default: null }
});

const tierStyle = (tier) => ({
  free: { iconBg: "bg-cb-field", icon: "fa-solid fa-gift text-cb-muted" },
  basic: { iconBg: "bg-blue-500/10", icon: "fa-solid fa-bolt text-blue-400" },
  pro: { iconBg: "bg-cb-accent/10", icon: "fa-solid fa-rocket text-cb-accent" },
  elite: { iconBg: "bg-yellow-500/10", icon: "fa-solid fa-crown text-yellow-400" },
  corporate_free: { iconBg: "bg-cb-field", icon: "fa-solid fa-building text-cb-muted" },
  corporate_pro: { iconBg: "bg-purple-500/10", icon: "fa-solid fa-building text-purple-400" },
  corporate_elite: { iconBg: "bg-teal-500/10", icon: "fa-solid fa-gem text-teal-400" }
}[tier?.toLowerCase()] || { iconBg: "bg-cb-field", icon: "fa-solid fa-star" });

// Normalize plan tier to lowercase
const normalize = (p) => ({
  ...p,
  tier: p.tier?.toLowerCase()
});

const visiblePlans = computed(() => {
  const base = props.freePlan ? [normalize(props.freePlan)] : [];
  return [...base, ...props.plans.map(normalize)];
});

const minWidth = computed(() => 180 + visiblePlans.value.length * 140);

// Pricing - handles both normalized flat fields and nested objects
const monthlyPrice = (p) => {
  // Normalized fields (from planNormalizer)
  if (p.monthlyNGN) return p.monthlyNGN;
  // Nested pricing (from API directly)
  if (p.pricing?.monthlyNGN) return p.pricing.monthlyNGN;
  // View model fields (from toPlanViewModel)
  if (p.activePrice) return p.activePrice;
  return 0;
};

const yearlyPrice = (p) => {
  if (p.yearlyNGN) return p.yearlyNGN;
  if (p.pricing?.yearlyNGN) return p.pricing.yearlyNGN;
  return 0;
};

const formatPrice = (v) => (!v ? "Free" : `₦${Number(v).toLocaleString()}`);

// Commission - handles all possible field locations
const getCommission = (p) => {
  // Normalized flat fields
  if (p.commissionRate != null) return p.commissionRate;
  // Nested objects
  if (p.commission?.standard != null) return p.commission.standard;
  if (p.commission?.rate != null) return p.commission.rate;
  // View model
  if (p.activeCommission != null) return p.activeCommission;
  return null;
};

// CBC - handles all possible field locations
const getCbc = (p) => {
  // Normalized flat fields
  if (p.monthlyCbc != null) return p.monthlyCbc;
  // Nested objects
  if (p.cbc?.monthly != null) return p.cbc.monthly;
  if (p.cbc?.monthlyAllocation != null) return p.cbc.monthlyAllocation;
  // View model
  if (p.activeCbc != null) return p.activeCbc;
  return 0;
};

const getCbcDiscount = (p) => {
  // Normalized flat fields
  if (p.cbcDiscount != null) return p.cbcDiscount;
  // Nested objects
  if (p.cbc?.discount != null) return p.cbc.discount;
  // View model
  if (p.activeCbcDiscount != null) return p.activeCbcDiscount;
  return 0;
};

// Feature checks
const hasFeature = (p, key) => p.features?.[key] === true;
const hasBenefit = (p, b) => Array.isArray(p.benefits) && p.benefits.includes(b);

// Feature labels
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

const featureRows = computed(() => {
  const keys = new Set();
  visiblePlans.value.forEach(p => {
    Object.keys(p.features ?? {}).forEach(k => keys.add(k));
  });

  return [...keys]
    .filter(k => FEATURE_LABELS[k])
    .filter(k => visiblePlans.value.some(p => p.features?.[k] === true))
    .map(k => ({ key: k, label: FEATURE_LABELS[k] }));
});

const benefitRows = computed(() => {
  const set = new Set();
  visiblePlans.value.forEach(p => (p.benefits ?? []).forEach(b => set.add(b)));
  return [...set];
});
</script>