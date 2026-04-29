<template>
  <div class="min-h-screen bg-cb-base">
    <div class="border-b border-cb-divider bg-cb-base  py-5 ">
      <div class="flex items-center gap-3">
        <button class="flex h-9 w-9 items-center justify-center rounded-xl border border-cb-divider bg-cb-card text-cb-muted hover:border-cb-accent/30 hover:text-cb-text active:scale-95"
          @click="$router.back()">
          <i class="fa-solid fa-arrow-left text-sm" />
        </button>
        <div><h1 class="text-xl font-bold text-cb-text">Subscription Detail</h1></div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl space-y-4  py-6 ">
      <template v-if="adminStore.selectedSubscriptionLoading">
        <div v-for="i in 4" :key="i" class="animate-pulse rounded-2xl bg-cb-card" :style="`height:${[150,130,120,100][i-1]}px`" />
      </template>

      <template v-else-if="sub">
        <!-- Header -->
        <div class="overflow-hidden rounded-2xl border border-cb-divider bg-cb-card">
          <div class="h-[3px]" :class="statusBar" />
          <div class="p-5">
            <div class="flex items-start justify-between">
              <div>
                <h2 class="text-lg font-bold text-cb-text">{{ sub.planSnapshot?.nameLabel ?? sub.tier }}</h2>
                <p class="text-sm text-cb-muted capitalize">{{ sub.billingPeriod }} · ₦{{ sub.priceNGN?.toLocaleString() }}</p>
              </div>
              <span class="rounded-full px-3 py-1 text-xs font-bold uppercase" :class="statusBadge">{{ sub.status }}</span>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div class="rounded-xl bg-cb-field px-4 py-3">
                <p class="text-[10px] text-cb-muted uppercase tracking-wide">Starts</p>
                <p class="font-semibold text-cb-text">{{ fmtDate(sub.startsAt) }}</p>
              </div>
              <div class="rounded-xl bg-cb-field px-4 py-3">
                <p class="text-[10px] text-cb-muted uppercase tracking-wide">Expires</p>
                <p class="font-semibold text-cb-text">{{ fmtDate(sub.expiresAt) }}</p>
              </div>
              <div class="rounded-xl bg-cb-field px-4 py-3">
                <p class="text-[10px] text-cb-muted uppercase tracking-wide">Paid At</p>
                <p class="font-semibold text-cb-text">{{ fmtDate(sub.paidAt) }}</p>
              </div>
              <div class="rounded-xl bg-cb-field px-4 py-3">
                <p class="text-[10px] text-cb-muted uppercase tracking-wide">Auto-renew</p>
                <p class="font-semibold" :class="sub.autoRenew ? 'text-cb-positive' : 'text-cb-muted'">{{ sub.autoRenew ? 'On' : 'Off' }}</p>
              </div>
            </div>
            <div class="mt-2 rounded-xl bg-cb-field px-4 py-2.5">
              <p class="text-[10px] text-cb-muted uppercase tracking-wide">Paystack Reference</p>
              <p class="font-mono text-xs font-semibold text-cb-text">{{ sub.paystackReference }}</p>
            </div>
            <div v-if="sub.cancellationNote" class="mt-2 rounded-xl bg-cb-negative/8 px-4 py-2.5">
              <p class="text-xs text-cb-muted"><span class="font-semibold text-cb-negative">Cancelled:</span> {{ sub.cancellationNote || 'No note provided' }}</p>
            </div>
          </div>
        </div>

        <!-- User info -->
        <div v-if="sub.userId" class="rounded-2xl border border-cb-divider bg-cb-card p-5">
          <h3 class="mb-3 text-xs font-bold uppercase tracking-widest text-cb-muted">User</h3>
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-cb-field text-sm font-bold text-cb-muted">
              {{ `${sub.userId.firstName?.[0] ?? ""}${sub.userId.lastName?.[0] ?? ""}`.toUpperCase() }}
            </div>
            <div>
              <p class="font-semibold text-cb-text">{{ sub.userId.firstName }} {{ sub.userId.lastName }}</p>
              <p class="text-xs text-cb-muted">{{ sub.userId.email }} · {{ sub.userId.role }}</p>
            </div>
            <router-link :to="`/admin/users/${sub.userId._id}`"
              class="ml-auto rounded-lg bg-cb-accent/10 px-3 py-1.5 text-xs font-semibold text-cb-accent hover:bg-cb-accent/20">
              View Profile
            </router-link>
          </div>
        </div>

        <!-- Plan snapshot -->
        <div class="rounded-2xl border border-cb-divider bg-cb-card p-5">
          <h3 class="mb-3 text-xs font-bold uppercase tracking-widest text-cb-muted">Plan Snapshot</h3>
          <div class="space-y-2 text-sm">
            <div v-for="row in planRows" :key="row.label" class="flex items-center justify-between">
              <span class="text-cb-muted">{{ row.label }}</span>
              <span class="font-semibold text-cb-text">{{ row.value }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAdminStore } from "@/stores/adminStore";

const route      = useRoute();
const adminStore = useAdminStore();

const sub = computed(() => adminStore.selectedSubscription);

const STATUS_STYLES = {
  active:    { bar: "bg-cb-positive", badge: "bg-cb-positive/10 text-cb-positive" },
  cancelled: { bar: "bg-cb-negative", badge: "bg-cb-negative/10 text-cb-negative" },
  expired:   { bar: "bg-amber-400",   badge: "bg-amber-500/10 text-amber-600"     },
  pending:   { bar: "bg-blue-400",    badge: "bg-blue-500/10 text-blue-500"       },
};
const statusBar  = computed(() => STATUS_STYLES[sub.value?.status]?.bar ?? "bg-cb-divider");
const statusBadge = computed(() => STATUS_STYLES[sub.value?.status]?.badge ?? "bg-cb-field text-cb-muted");

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "—";

const planRows = computed(() => {
  const p = sub.value?.planSnapshot;
  if (!p) return [];
  return [
    { label: "Monthly Price",   value: p.monthlyNGN ? `₦${p.monthlyNGN.toLocaleString()}` : "Free" },
    { label: "Yearly Price",    value: p.yearlyNGN  ? `₦${p.yearlyNGN.toLocaleString()}`  : "Free" },
    { label: "Commission Rate", value: `${p.commissionRate}%` },
    { label: "CBC / month",     value: p.monthlyCbc ? p.monthlyCbc.toLocaleString() : "—" },
    { label: "CBC Discount",    value: p.cbcDiscount ? `${p.cbcDiscount}%` : "—" },
    { label: "Student Rate",    value: p.studentCommissionRate ? `${p.studentCommissionRate}%` : "—" },
  ];
});

onMounted(() => adminStore.fetchSubscription(route.params.id));
</script>