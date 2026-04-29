<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="modal-backdrop">
      <div
        class="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        style="background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);"
        @click.self="!loading && $emit('cancel')"
      >
        <!-- Sheet / Dialog -->
        <Transition name="modal-sheet">
          <div
            class="modal-panel w-full sm:max-w-md overflow-hidden rounded-t-3xl sm:rounded-2xl bg-cb-card max-h-[92dvh] flex flex-col"
            @click.stop
          >
            <!-- Mobile drag handle -->
            <div class="flex shrink-0 justify-center pt-3 pb-1 sm:hidden">
              <div class="h-1 w-10 rounded-full bg-cb-divider" />
            </div>



            <!-- Scrollable body -->
            <div class="overflow-y-auto flex-1 p-6 sm:p-7">

              <!-- Header -->
              <div class="mb-6 flex items-start gap-4">
                <div
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl"
                  :class="tierIconBg"
                >
                  <i :class="tierIcon" />
                </div>

                <div class="flex-1 min-w-0">
                  <h2 class="text-xl font-bold text-cb-text">
                    {{ isUpgrade ? 'Confirm Upgrade' : 'Confirm Subscription' }}
                  </h2>
                  <p class="mt-0.5 text-sm text-cb-muted">
                    {{ isUpgrade ? 'Upgrading to' : 'Subscribing to' }}
                    <span class="font-semibold text-cb-text">{{ plan?.nameLabel }}</span>
                  </p>
                </div>

                <!-- Close button -->
                <button
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cb-divider text-cb-muted transition-all hover:border-cb-accent/30 hover:text-cb-text active:scale-95 disabled:opacity-40"
                  :disabled="loading"
                  @click="$emit('cancel')"
                >
                  <i class="fa-solid fa-xmark text-sm" />
                </button>
              </div>

              <!-- Summary rows -->
              <div class="overflow-hidden rounded-xl border border-cb-divider bg-cb-field">
                <div class="divide-y divide-cb-divider">
                  <div class="flex items-center justify-between px-4 py-3">
                    <span class="text-sm text-cb-muted">Plan</span>
                    <span class="font-semibold text-cb-text">{{ plan?.nameLabel }}</span>
                  </div>
                  <div class="flex items-center justify-between px-4 py-3">
                    <span class="text-sm text-cb-muted">Billing</span>
                    <span class="font-semibold capitalize text-cb-text">{{ billingPeriod }}</span>
                  </div>
                  <div v-if="commissionRate != null" class="flex items-center justify-between px-4 py-3">
                    <span class="text-sm text-cb-muted">Commission rate</span>
                    <span class="font-semibold text-cb-text">{{ commissionRate }}%</span>
                  </div>
                  <div v-if="cbcMonthly" class="flex items-center justify-between px-4 py-3">
                    <span class="text-sm text-cb-muted">CBC rewards</span>
                    <span class="font-semibold text-cb-accent">{{ cbcMonthly.toLocaleString() }}/mo</span>
                  </div>
                  <div v-if="billingPeriod === 'yearly' && yearlyMonthlyEquiv" class="flex items-center justify-between px-4 py-3">
                    <span class="text-sm text-cb-muted">Monthly equiv.</span>
                    <span class="text-sm font-medium text-cb-accent">≈ {{ yearlyMonthlyEquiv }}/mo</span>
                  </div>
                  <div class="flex items-center justify-between bg-cb-card/60 px-4 py-4">
                    <span class="text-sm font-bold text-cb-muted">Total due now</span>
                    <span class="text-xl font-bold text-cb-text">{{ formattedPrice }}</span>
                  </div>
                </div>
              </div>

              <!-- Yearly savings banner -->
              <div
                v-if="billingPeriod === 'yearly' && yearlySavingPct > 0"
                class="mt-3 flex items-center gap-2.5 rounded-xl bg-cb-positive/8 px-4 py-3"
              >
                <i class="fa-solid fa-piggy-bank shrink-0 text-sm text-cb-positive" />
                <p class="text-xs font-medium text-cb-positive">
                  You're saving {{ yearlySavingPct }}% by paying annually.
                </p>
              </div>

              <!-- Security note -->
              <div class="mt-3 flex items-start gap-2.5 rounded-xl bg-cb-field px-4 py-3">
                <i class="fa-solid fa-shield-halved mt-0.5 shrink-0 text-sm text-cb-accent" />
                <p class="text-xs leading-relaxed text-cb-muted">
                  Secured by <span class="font-semibold text-cb-text">Paystack</span>.
                  You'll be redirected to complete payment safely. Cancel or change anytime.
                </p>
              </div>

            </div>

            <!-- Sticky footer with actions -->
            <div class="shrink-0 border-t border-cb-divider bg-cb-card px-6 py-4 sm:px-7">
              <div class="flex gap-3">
                <button
                  class="flex-1 rounded-xl border border-cb-divider py-3 text-sm font-semibold text-cb-muted transition-all hover:border-cb-accent/30 hover:text-cb-text active:scale-95 disabled:opacity-50"
                  :disabled="loading"
                  @click="$emit('cancel')"
                >
                  Go Back
                </button>
                <button
                  class="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  :class="ctaBg"
                  :disabled="loading"
                  @click="$emit('confirm')"
                >
                  <svg v-if="loading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <i v-else class="fa-solid fa-lock text-xs" />
                  {{ loading ? 'Processing…' : 'Pay with Paystack' }}
                </button>
              </div>
              <!-- iOS safe-area spacer -->
              <div class="h-[env(safe-area-inset-bottom,0px)] sm:hidden" />
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  plan:          { type: Object,  default: null },
  billingPeriod: { type: String,  default: "monthly" },
  loading:       { type: Boolean, default: false },
  isUpgrade:     { type: Boolean, default: false },
});

defineEmits(["confirm", "cancel"]);

// ── Pricing — nested (user API) with flat fallback (admin API)
const price = computed(() => {
  if (!props.plan) return 0;
  const p = props.plan.pricing ?? {};
  return props.billingPeriod === "monthly"
    ? (p.monthlyNGN ?? props.plan.monthlyNGN ?? 0)
    : (p.yearlyNGN  ?? props.plan.yearlyNGN  ?? 0);
});

const formattedPrice = computed(() => {
  if (!price.value) return "Free";
  return `₦${price.value.toLocaleString()}`;
});

const yearlyMonthlyEquiv = computed(() => {
  const yearly = props.plan?.pricing?.yearlyNGN ?? props.plan?.yearlyNGN;
  if (!yearly) return null;
  return `₦${Math.round(yearly / 12).toLocaleString()}`;
});

const yearlySavingPct = computed(() => {
  if (props.plan?.yearlySavingPct) return props.plan.yearlySavingPct;
  const monthly = props.plan?.pricing?.monthlyNGN ?? props.plan?.monthlyNGN;
  const yearly  = props.plan?.pricing?.yearlyNGN  ?? props.plan?.yearlyNGN;
  if (!monthly || !yearly) return 0;
  return Math.round((1 - yearly / (monthly * 12)) * 100);
});

// ── Commission & CBC
const commissionRate = computed(() =>
  props.plan?.commission?.standard ?? props.plan?.commissionRate ?? null
);
const cbcMonthly = computed(() =>
  props.plan?.cbc?.monthly ?? props.plan?.monthlyCbc ?? 0
);

// ── Visual per tier
const TIER_STYLES = {
  free:            { bar: "bg-cb-divider",    iconBg: "bg-cb-field",       icon: "fa-solid fa-gift text-cb-muted",       cta: "bg-cb-accent"  },
  basic:           { bar: "bg-blue-400",      iconBg: "bg-blue-500/10",    icon: "fa-solid fa-bolt text-blue-400",       cta: "bg-blue-500"   },
  pro:             { bar: "bg-cb-accent",     iconBg: "bg-cb-accent/10",   icon: "fa-solid fa-rocket text-cb-accent",    cta: "bg-cb-accent"  },
  elite:           { bar: "bg-amber-400",     iconBg: "bg-yellow-500/10",  icon: "fa-solid fa-crown text-yellow-400",    cta: "bg-amber-500"  },
  corporate_free:  { bar: "bg-cb-divider",    iconBg: "bg-cb-field",       icon: "fa-solid fa-building text-cb-muted",   cta: "bg-cb-accent"  },
  corporate_pro:   { bar: "bg-purple-500",    iconBg: "bg-purple-500/10",  icon: "fa-solid fa-building text-purple-400", cta: "bg-purple-600" },
  corporate_elite: { bar: "bg-teal-500",      iconBg: "bg-teal-500/10",    icon: "fa-solid fa-gem text-teal-400",        cta: "bg-teal-600"   },
};

const style      = computed(() => TIER_STYLES[props.plan?.tier?.toLowerCase()] ?? TIER_STYLES.free);
const tierBar    = computed(() => style.value.bar);
const tierIconBg = computed(() => style.value.iconBg);
const tierIcon   = computed(() => style.value.icon);
const ctaBg      = computed(() => style.value.cta);
</script>

<style scoped>
/* ── Backdrop fade ─────────────────────────────────────── */
.modal-backdrop-enter-active { transition: opacity 0.25s ease; }
.modal-backdrop-leave-active { transition: opacity 0.2s ease; }
.modal-backdrop-enter-from,
.modal-backdrop-leave-to    { opacity: 0; }

/* ── Sheet: slides up from bottom on mobile ────────────── */
.modal-sheet-enter-active {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.2s ease;
}
.modal-sheet-leave-active {
  transition: transform 0.22s ease, opacity 0.18s ease;
}
.modal-sheet-enter-from,
.modal-sheet-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* ── On sm+ : scale + fade instead of slide ────────────── */
@media (min-width: 640px) {
  .modal-sheet-enter-from,
  .modal-sheet-leave-to {
    transform: scale(0.96) translateY(8px);
  }
}
</style>