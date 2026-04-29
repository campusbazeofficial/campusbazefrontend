<template>
  <div class="min-h-screen bg-cb-base">

    <!-- Header -->
    <div class="border-b border-cb-divider bg-cb-base py-5">
      <div class="mx-auto max-w-7xl flex items-center gap-4">
        <button
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cb-divider text-cb-muted transition-all hover:border-cb-accent/30 hover:text-cb-text"
          @click="$router.push('/admin/plans')"
        >
          <i class="fa-solid fa-arrow-left text-sm" />
        </button>
        <div>
          <h1 class="text-xl font-bold text-cb-text">
            {{ isEdit ? 'Edit Plan' : 'Create Plan' }}
          </h1>
          <p class="text-sm text-cb-muted">
            {{ isEdit ? `Editing · ${form.nameLabel || '…'}` : 'Add a new subscription tier' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Edit loading skeleton -->
    <div v-if="isEdit && pageLoading" class="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <div
        v-for="i in 5"
        :key="i"
        class="animate-pulse rounded-2xl bg-cb-card"
        :style="`height:${i === 1 ? 100 : 160}px; animation-delay:${i * 60}ms`"
      />
    </div>

    <!-- Form -->
    <form
      v-else
      class="mx-auto max-w-7xl py-6 space-y-5"
      @submit.prevent="handleSubmit"
    >

      <!-- ── PLAN TYPE ───────────────────────────────── -->
      <section class="rounded-2xl border border-cb-divider bg-cb-card p-6">
        <h2 class="mb-4 text-[10px] font-bold uppercase tracking-widest text-cb-muted">Plan Type</h2>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="pt in ['individual', 'corporate']"
            :key="pt"
            type="button"
            class="flex items-center gap-3 rounded-xl border p-4 text-left transition-all"
            :class="form.planType === pt
              ? 'border-cb-accent bg-cb-accent/5'
              : 'border-cb-divider hover:border-cb-accent/30'"
            :disabled="isEdit"
            @click="setPlanType(pt)"
          >
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
              :class="form.planType === pt ? 'bg-cb-accent/15 text-cb-accent' : 'bg-cb-field text-cb-muted'"
            >
              <i :class="pt === 'individual' ? 'fa-solid fa-user' : 'fa-solid fa-building'" />
            </div>
            <div>
              <p class="font-semibold capitalize" :class="form.planType === pt ? 'text-cb-accent' : 'text-cb-text'">
                {{ pt }}
              </p>
              <p class="text-[10px] text-cb-muted">
                {{ pt === 'individual' ? 'Supports student pricing' : 'Corporate accounts only' }}
              </p>
            </div>
          </button>
        </div>
        <p v-if="isEdit" class="mt-3 text-xs text-cb-muted">
          <i class="fa-solid fa-lock mr-1 text-[9px]" />
          Plan type cannot be changed after creation.
        </p>
      </section>

      <!-- ── IDENTITY ───────────────────────────────── -->
      <section class="rounded-2xl border border-cb-divider bg-cb-card p-6 space-y-4">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-cb-muted">Identity</h2>

        <div>
          <label class="mb-1.5 block text-xs font-semibold text-cb-muted">
            Tier <span class="text-cb-negative">*</span>
          </label>
          <DropDownComponent
            ref="tierDrop"
            :label="selectedTierLabel"
            :min-width="220"
            bgClass="bg-cb-field"
            textClass="text-cb-text"
            class="w-full"
            :class="{ 'opacity-60 pointer-events-none': isEdit }"
          >
            <div class="p-1.5">
              <template v-if="form.planType === 'individual'">
                <button
                  v-for="t in individualTiers" :key="t.value"
                  type="button"
                  class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-cb-field"
                  :class="form.tier === t.value ? 'text-cb-accent font-semibold' : 'text-cb-text'"
                  @click="form.tier = t.value; tierDrop.close()"
                >
                  {{ t.label }}
                  <i v-if="form.tier === t.value" class="fa-solid fa-check ml-auto text-xs text-cb-accent" />
                </button>
              </template>
              <template v-else>
                <button
                  v-for="t in corporateTiers" :key="t.value"
                  type="button"
                  class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-cb-field"
                  :class="form.tier === t.value ? 'text-cb-accent font-semibold' : 'text-cb-text'"
                  @click="form.tier = t.value; tierDrop.close()"
                >
                  {{ t.label }}
                  <i v-if="form.tier === t.value" class="fa-solid fa-check ml-auto text-xs text-cb-accent" />
                </button>
              </template>
            </div>
          </DropDownComponent>
          <p v-if="isEdit" class="mt-1 text-[11px] text-cb-muted">
            Tier is locked after creation.
          </p>
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-semibold text-cb-muted">
            Display Name <span class="text-cb-negative">*</span>
          </label>
          <input
            v-model="form.nameLabel"
            type="text"
            placeholder="e.g. Pro Plan"
            class="w-full rounded-xl border border-cb-divider bg-cb-field px-4 py-3 text-sm text-cb-text placeholder:text-cb-muted/40 focus:border-cb-accent focus:outline-none"
            required
          />
        </div>
      </section>

      <!-- ── PRICING ────────────────────────────────── -->
      <section class="rounded-2xl border border-cb-divider bg-cb-card p-6 space-y-5">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-cb-muted">Pricing (NGN)</h2>

        <div>
          <p class="mb-3 text-xs font-semibold text-cb-muted">
            {{ form.planType === 'corporate' ? 'Corporate' : 'Standard' }} Pricing
          </p>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-xs text-cb-muted">Monthly</label>
              <div class="relative">
                <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-cb-muted">₦</span>
                <input
                  v-model.number="form.monthlyNGN"
                  type="number" min="0" placeholder="0"
                  class="w-full rounded-xl border border-cb-divider bg-cb-field py-3 pl-8 pr-4 text-sm text-cb-text placeholder:text-cb-muted/40 focus:border-cb-accent focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label class="mb-1.5 block text-xs text-cb-muted">Yearly</label>
              <div class="relative">
                <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-cb-muted">₦</span>
                <input
                  v-model.number="form.yearlyNGN"
                  type="number" min="0" placeholder="0"
                  class="w-full rounded-xl border border-cb-divider bg-cb-field py-3 pl-8 pr-4 text-sm text-cb-text placeholder:text-cb-muted/40 focus:border-cb-accent focus:outline-none"
                />
              </div>
            </div>
          </div>
          <p v-if="yearlySavingPct > 0" class="mt-1.5 text-xs text-cb-positive">
            <i class="fa-solid fa-tag mr-1 text-[9px]" />
            Yearly saves {{ yearlySavingPct }}% vs monthly
          </p>
        </div>

        <!-- Student pricing — individual only -->
        <template v-if="form.planType === 'individual'">
          <div class="h-px bg-cb-divider" />
          <div>
            <p class="mb-3 text-xs font-semibold text-cb-muted">
              Student Pricing
              <span class="ml-1.5 rounded-full bg-cb-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase text-cb-accent">
                Individual only
              </span>
            </p>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-xs text-cb-muted">Student Monthly</label>
                <div class="relative">
                  <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-cb-muted">₦</span>
                  <input
                    v-model.number="form.studentMonthlyNGN"
                    type="number" min="0" placeholder="0"
                    class="w-full rounded-xl border border-cb-divider bg-cb-field py-3 pl-8 pr-4 text-sm text-cb-text placeholder:text-cb-muted/40 focus:border-cb-accent focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label class="mb-1.5 block text-xs text-cb-muted">Student Yearly</label>
                <div class="relative">
                  <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-cb-muted">₦</span>
                  <input
                    v-model.number="form.studentYearlyNGN"
                    type="number" min="0" placeholder="0"
                    class="w-full rounded-xl border border-cb-divider bg-cb-field py-3 pl-8 pr-4 text-sm text-cb-text placeholder:text-cb-muted/40 focus:border-cb-accent focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <p
              v-if="form.studentMonthlyNGN > form.monthlyNGN && form.monthlyNGN > 0"
              class="mt-1.5 text-xs text-cb-negative"
            >
              <i class="fa-solid fa-triangle-exclamation mr-1 text-[9px]" />
              Student monthly should not exceed standard monthly.
            </p>
          </div>
        </template>
      </section>

      <!-- ── COMMISSION ─────────────────────────────── -->
      <section class="rounded-2xl border border-cb-divider bg-cb-card p-6 space-y-4">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-cb-muted">Commission (%)</h2>
        <div :class="form.planType === 'individual' ? 'grid grid-cols-2 gap-4' : 'max-w-xs'">
          <div>
            <label class="mb-1.5 block text-xs text-cb-muted">Standard Commission</label>
            <div class="relative">
              <input
                v-model.number="form.commissionRate"
                type="number" min="0" max="100" step="0.1" placeholder="0"
                class="w-full rounded-xl border border-cb-divider bg-cb-field px-4 py-3 pr-8 text-sm text-cb-text placeholder:text-cb-muted/40 focus:border-cb-accent focus:outline-none"
              />
              <span class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-cb-muted">%</span>
            </div>
          </div>
          <div v-if="form.planType === 'individual'">
            <label class="mb-1.5 block text-xs text-cb-muted">
              Student Commission
              <span class="ml-1 rounded-full bg-cb-accent/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-cb-accent">Individual</span>
            </label>
            <div class="relative">
              <input
                v-model.number="form.studentCommissionRate"
                type="number" min="0" max="100" step="0.1" placeholder="0"
                class="w-full rounded-xl border border-cb-divider bg-cb-field px-4 py-3 pr-8 text-sm text-cb-text placeholder:text-cb-muted/40 focus:border-cb-accent focus:outline-none"
              />
              <span class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-cb-muted">%</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── CBC REWARDS ────────────────────────────── -->
      <section class="rounded-2xl border border-cb-divider bg-cb-card p-6 space-y-4">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-cb-muted">CBC Rewards</h2>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="mb-1.5 block text-xs text-cb-muted">Monthly CBC</label>
            <input
              v-model.number="form.monthlyCbc"
              type="number" min="0" placeholder="0"
              class="w-full rounded-xl border border-cb-divider bg-cb-field px-4 py-3 text-sm text-cb-text placeholder:text-cb-muted/40 focus:border-cb-accent focus:outline-none"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-xs text-cb-muted">CBC Discount</label>
            <div class="relative">
              <input
                v-model.number="form.cbcDiscount"
                type="number" min="0" max="100" placeholder="0"
                class="w-full rounded-xl border border-cb-divider bg-cb-field px-4 py-3 pr-8 text-sm text-cb-text placeholder:text-cb-muted/40 focus:border-cb-accent focus:outline-none"
              />
              <span class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-cb-muted">%</span>
            </div>
          </div>
          <div>
            <label class="mb-1.5 block text-xs text-cb-muted">Welcome Bonus</label>
            <input
              v-model.number="form.welcomeBonusCbc"
              type="number" min="0" placeholder="0"
              class="w-full rounded-xl border border-cb-divider bg-cb-field px-4 py-3 text-sm text-cb-text placeholder:text-cb-muted/40 focus:border-cb-accent focus:outline-none"
            />
          </div>
        </div>
      </section>

      <!-- ── FEATURES ───────────────────────────────── -->
      <section class="rounded-2xl border border-cb-divider bg-cb-card p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-[10px] font-bold uppercase tracking-widest text-cb-muted">Features</h2>
          <div class="flex gap-2">
            <button type="button" class="text-xs text-cb-accent hover:underline" @click="setAllFeatures(true)">Enable all</button>
            <span class="text-cb-divider">·</span>
            <button type="button" class="text-xs text-cb-muted hover:text-cb-negative hover:underline" @click="setAllFeatures(false)">Disable all</button>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <label
            v-for="(label, key) in FEATURE_LABELS"
            :key="key"
            class="flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all select-none"
            :class="form.features[key] ? 'border-cb-accent/40 bg-cb-accent/5' : 'border-cb-divider hover:border-cb-accent/20'"
            @click.prevent="form.features[key] = !form.features[key]"
          >
            <span class="text-sm" :class="form.features[key] ? 'text-cb-text' : 'text-cb-muted'">{{ label }}</span>
            <div
              class="relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200"
              :class="form.features[key] ? 'bg-cb-accent' : 'bg-cb-divider'"
            >
              <span
                class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                :class="form.features[key] ? 'left-[18px]' : 'left-0.5'"
              />
            </div>
          </label>
        </div>
      </section>

      <!-- ── BENEFITS ───────────────────────────────── -->
      <section class="rounded-2xl border border-cb-divider bg-cb-card p-6 space-y-4">
        <h2 class="text-[10px] font-bold uppercase tracking-widest text-cb-muted">Benefits</h2>
        <div v-if="form.benefits.length" class="flex flex-wrap gap-2">
          <span
            v-for="(b, i) in form.benefits"
            :key="i"
            class="flex items-center gap-1.5 rounded-full border border-cb-divider bg-cb-field px-3 py-1 text-xs text-cb-text"
          >
            {{ b }}
            <button
              type="button"
              class="flex h-3.5 w-3.5 items-center justify-center rounded-full text-cb-muted hover:bg-cb-negative/20 hover:text-cb-negative"
              @click="form.benefits.splice(i, 1)"
            >
              <i class="fa-solid fa-xmark text-[8px]" />
            </button>
          </span>
        </div>
        <p v-else class="text-xs text-cb-muted italic">No benefits added yet.</p>
        <div class="flex gap-2">
          <input
            v-model="newBenefit"
            type="text"
            placeholder="e.g. Priority customer support"
            class="flex-1 rounded-xl border border-cb-divider bg-cb-field px-4 py-2.5 text-sm text-cb-text placeholder:text-cb-muted/40 focus:border-cb-accent focus:outline-none"
            @keydown.enter.prevent="addBenefit"
          />
          <button
            type="button"
            class="rounded-xl bg-cb-field px-4 py-2.5 text-sm font-semibold text-cb-text transition-all hover:bg-cb-accent/10 hover:text-cb-accent"
            @click="addBenefit"
          >
            Add
          </button>
        </div>
      </section>

      <!-- ── SUBMIT ─────────────────────────────────── -->
      <div class="flex gap-3 pb-8">
        <button
          type="button"
          class="flex-1 rounded-xl border border-cb-divider py-3 text-sm font-semibold text-cb-muted transition-all hover:border-cb-accent/30 hover:text-cb-text"
          @click="$router.push('/admin/plans')"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          :disabled="subStore.planActionLoading || !isFormValid"
        >
          <svg v-if="subStore.planActionLoading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ isEdit ? 'Save Changes' : 'Create Plan' }}
        </button>
      </div>
    </form>

    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { useToast } from "@/composables/useToast";
import DropDownComponent from "@/components/reusables/DropDownComponent.vue";
import ToastContainer from "@/components/reusables/ToastContainer.vue";

const route    = useRoute();
const router   = useRouter();
const subStore = useSubscriptionStore();
const toast    = useToast();

const isEdit      = computed(() => !!route.params.id);
const pageLoading = ref(false);

const tierDrop = ref(null);

const individualTiers = [
  { value: "free",  label: "Free"  },
  { value: "basic", label: "Basic" },
  { value: "pro",   label: "Pro"   },
  { value: "elite", label: "Elite" },
];

const corporateTiers = [
  { value: "corporate_free",  label: "Corporate Free"  },
  { value: "corporate_pro",   label: "Corporate Pro"   },
  { value: "corporate_elite", label: "Corporate Elite" },
];

const allTiers = [...individualTiers, ...corporateTiers];

const selectedTierLabel = computed(() =>
  allTiers.find((t) => t.value === form.tier)?.label ?? "Select tier…"
);

const FEATURE_LABELS = {
  profileHighlight:   "Profile Highlight",
  priorityListings:   "Priority Listings",
  featuredBadge:      "Featured Badge",
  interviewTools:     "Interview Tools",
  dedicatedSupport:   "Dedicated Support",
  contractModule:     "Contract Module",
  analyticsDashboard: "Analytics Dashboard",
  unlimitedJobPosts:  "Unlimited Job Posts",
  apiAccess:          "API Access",
};

function defaultFeatures() {
  return Object.fromEntries(Object.keys(FEATURE_LABELS).map((k) => [k, false]));
}

const form = reactive({
  tier: "", nameLabel: "", planType: "individual",
  monthlyNGN: 0, yearlyNGN: 0, studentMonthlyNGN: 0, studentYearlyNGN: 0,
  commissionRate: 0, studentCommissionRate: 0,
  monthlyCbc: 0, cbcDiscount: 0, welcomeBonusCbc: 0,
  benefits: [],
  features: defaultFeatures(),
});

const newBenefit = ref("");

function setPlanType(pt) {
  if (isEdit.value) return;
  form.planType = pt;
  if (pt === "corporate") {
    form.studentMonthlyNGN     = 0;
    form.studentYearlyNGN      = 0;
    form.studentCommissionRate = 0;
    if (!form.tier?.startsWith("corporate_")) form.tier = "";
  } else {
    if (form.tier?.startsWith("corporate_")) form.tier = "";
  }
}

function populateForm(plan) {
  form.tier                  = plan.tier                  ?? "";
  form.nameLabel             = plan.nameLabel             ?? "";
  form.planType              = plan.planType              ?? "individual";
  form.monthlyNGN            = plan.monthlyNGN            ?? 0;
  form.yearlyNGN             = plan.yearlyNGN             ?? 0;
  form.studentMonthlyNGN     = plan.studentMonthlyNGN     ?? 0;
  form.studentYearlyNGN      = plan.studentYearlyNGN      ?? 0;
  form.commissionRate        = plan.commissionRate        ?? 0;
  form.studentCommissionRate = plan.studentCommissionRate ?? 0;
  form.monthlyCbc            = plan.monthlyCbc            ?? 0;
  form.cbcDiscount           = plan.cbcDiscount           ?? 0;
  form.welcomeBonusCbc       = plan.welcomeBonusCbc       ?? 0;
  form.benefits              = Array.isArray(plan.benefits) ? [...plan.benefits] : [];
  form.features              = { ...defaultFeatures(), ...(plan.features ?? {}) };
}

function formatPlanPayload(f) {
  return {
    tier:      f.tier,
    nameLabel: f.nameLabel,
    planType:  f.planType,
    monthlyNGN:            f.monthlyNGN,
    yearlyNGN:             f.yearlyNGN,
    studentMonthlyNGN:     f.planType === "individual" ? f.studentMonthlyNGN     : 0,
    studentYearlyNGN:      f.planType === "individual" ? f.studentYearlyNGN      : 0,
    commissionRate:        f.commissionRate,
    studentCommissionRate: f.planType === "individual" ? f.studentCommissionRate : 0,
    monthlyCbc:      f.monthlyCbc,
    cbcDiscount:     f.cbcDiscount,
    welcomeBonusCbc: f.welcomeBonusCbc,
    benefits: f.benefits,
    features: f.features,
  };
}

const yearlySavingPct = computed(() => {
  const m = form.monthlyNGN;
  const y = form.yearlyNGN;
  if (!m || !y) return 0;
  return Math.round((1 - y / (m * 12)) * 100);
});

const isFormValid = computed(() => !!form.tier && !!form.nameLabel.trim());

function setAllFeatures(val) {
  Object.keys(form.features).forEach((k) => { form.features[k] = val; });
}

function addBenefit() {
  const b = newBenefit.value.trim();
  if (!b || form.benefits.includes(b)) return;
  form.benefits.push(b);
  newBenefit.value = "";
}

async function handleSubmit() {
  if (!isFormValid.value) return;
  const payload = formatPlanPayload(form);
  try {
    if (isEdit.value) {
      await subStore.updatePlan(route.params.id, payload);
      toast.success(`${form.nameLabel} updated`);
    } else {
      await subStore.createPlan(payload);
      toast.success(`${form.nameLabel} created`);
    }
    router.push("/admin/plans");
  } catch (err) {
    toast.error(err?.response?.data?.message || (isEdit.value ? "Update failed" : "Create failed"));
  }
}

onMounted(async () => {
  if (isEdit.value) {
    pageLoading.value = true;
    try {
      const res  = await subStore.fetchPlanById(route.params.id);
      const plan = res?.data ?? subStore.selectedPlan;
      if (plan) populateForm(plan);
    } catch {
      toast.error("Failed to load plan");
      router.push("/admin/plans");
    } finally {
      pageLoading.value = false;
    }
  }
});
</script>