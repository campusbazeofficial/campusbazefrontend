<template>
  <div class="min-h-screen bg-cb-base">

    <!-- Page header -->
    <div class="border-b border-cb-divider bg-cb-base  py-5 ">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-cb-text">Dashboard</h1>
          <p class="mt-0.5 text-sm text-cb-muted">Platform overview · {{ today }}</p>
        </div>
        <button
          class="flex items-center gap-2 rounded-xl border border-cb-divider bg-cb-card px-4 py-2 text-sm font-semibold text-cb-muted transition-all hover:border-cb-accent/40 hover:text-cb-text active:scale-95"
          :disabled="refreshing"
          @click="refreshAll"
        >
          <i class="fa-solid fa-rotate-right text-xs" :class="{'animate-spin': refreshing}" />
          Refresh
        </button>
      </div>
    </div>

    <div class="mx-auto max-w-7xl space-y-6  py-6 ">

      <!-- Stat cards -->
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 ">
        <div
          v-for="stat in stats" :key="stat.label"
          class="flex flex-col gap-2 rounded-2xl border border-cb-divider bg-cb-card p-4 transition-all hover:border-cb-accent/20 hover:shadow-sm"
          :class="stat.span ? 'col-span-2 sm:col-span-1' : ''"
        >
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-bold uppercase tracking-widest text-cb-muted">{{ stat.label }}</p>
            <div class="flex h-7 w-7 items-center justify-center rounded-lg" :class="stat.iconBg">
              <i :class="[stat.icon, 'text-xs']" />
            </div>
          </div>
          <p class="text-xl font-bold text-cb-text">
            <span v-if="loading" class="inline-block h-7 w-12 animate-pulse rounded-lg bg-cb-field" />
            <span v-else>{{ stat.value }}</span>
          </p>
          <p v-if="stat.sub" class="text-[11px] text-cb-muted">{{ stat.sub }}</p>
        </div>
      </div>

      <!-- Quick-action cards -->
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <router-link
          v-for="link in quickLinks" :key="link.name"
          :to="link.to"
          class="group flex items-center gap-4 rounded-2xl border border-cb-divider bg-cb-card p-5 transition-all hover:border-cb-accent/40 hover:shadow-md"
        >
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base transition-transform duration-300 group-hover:scale-110" :class="link.iconBg">
            <i :class="link.icon" />
          </div>
          <div class="min-w-0">
            <p class="truncate font-semibold text-cb-text">{{ link.label }}</p>
            <p class="truncate text-xs text-cb-muted">{{ link.sub }}</p>
          </div>
          <i class="fa-solid fa-chevron-right ml-auto text-xs text-cb-muted/50 transition-transform duration-200 group-hover:translate-x-0.5" />
        </router-link>
      </div>

      <!-- Two-col: recent verifications + pending clearances -->
      <div class="grid gap-4 lg:grid-cols-2">

        <!-- Recent Verifications -->
        <div class="rounded-2xl border border-cb-divider bg-cb-card">
          <div class="flex items-center justify-between border-b border-cb-divider px-5 py-4">
            <h2 class="font-bold text-cb-text">Pending Verifications</h2>
            <router-link to="/admin/verifications" class="text-xs font-semibold text-cb-accent hover:underline">View all</router-link>
          </div>

          <div v-if="verificationsLoading" class="space-y-3 p-5">
            <div v-for="i in 3" :key="i" class="h-12 animate-pulse rounded-xl bg-cb-field" />
          </div>

          <div v-else-if="!pendingVerifs.length" class="flex flex-col items-center py-10 text-center">
            <i class="fa-solid fa-shield-check mb-2 text-2xl text-cb-positive/60" />
            <p class="text-sm text-cb-muted">No pending verifications</p>
          </div>

          <ul v-else class="divide-y divide-cb-divider">
            <li v-for="v in pendingVerifs.slice(0, 5)" :key="v._id" class="flex items-center gap-3 px-5 py-3.5">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 text-sm">
             <i class="fa-solid fa-id-card" />

              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-cb-text">{{ v.userId?.firstName }} {{ v.userId?.lastName }}</p>
                <p class="text-xs text-cb-muted">{{ docTypeLabel(v.docType) }} · {{ fmtDate(v.submittedAt) }}</p>
              </div>
              <router-link :to="`/admin/verifications/${v._id}`"
                class="shrink-0 rounded-lg bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-600 transition-colors hover:bg-amber-500/20">
                Review
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Pending Clearances -->
        <div class="rounded-2xl border border-cb-divider bg-cb-card">
          <div class="flex items-center justify-between border-b border-cb-divider px-5 py-4">
            <h2 class="font-bold text-cb-text">Pending Clearances</h2>
            <router-link to="/admin/clearances" class="text-xs font-semibold text-cb-accent hover:underline">View all</router-link>
          </div>

          <div v-if="clearancesLoading" class="space-y-3 p-5">
            <div v-for="i in 3" :key="i" class="h-12 animate-pulse rounded-xl bg-cb-field" />
          </div>

          <div v-else-if="!pendingClearanceList.length" class="flex flex-col items-center py-10 text-center">
            <i class="fa-solid fa-circle-check mb-2 text-2xl text-cb-positive/60" />
            <p class="text-sm text-cb-muted">All clearances processed</p>
          </div>

          <ul v-else class="divide-y divide-cb-divider">
            <li v-for="c in pendingClearanceList.slice(0, 5)" :key="c._id" class="flex items-center gap-3 px-5 py-3.5">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cb-accent/10 text-cb-accent text-sm">
                <i class="fa-solid fa-money-bill-transfer" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-cb-text">{{ c.userId?.firstName }} {{ c.userId?.lastName }}</p>
                <p class="text-xs text-cb-muted">₦{{ c.amountNGN?.toLocaleString() }} · {{ c.sourceType }}</p>
              </div>
              <span class="shrink-0 rounded-full bg-amber-500/12 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-600">
                Pending
              </span>
            </li>
          </ul>
        </div>

      </div>

      <!-- Recent errands + recent orders -->
      <div class="grid gap-4 lg:grid-cols-2">

        <!-- Disputed Errands -->
        <div class="rounded-2xl border border-cb-divider bg-cb-card">
          <div class="flex items-center justify-between border-b border-cb-divider px-5 py-4">
            <h2 class="font-bold text-cb-text">Disputed Errands</h2>
            <router-link to="/admin/errands" class="text-xs font-semibold text-cb-accent hover:underline">View all</router-link>
          </div>
          <div v-if="errandsLoading" class="space-y-3 p-5">
            <div v-for="i in 2" :key="i" class="h-12 animate-pulse rounded-xl bg-cb-field" />
          </div>
          <div v-else-if="!disputedErrandList.length" class="flex flex-col items-center py-10 text-center">
            <i class="fa-solid fa-handshake mb-2 text-2xl text-cb-positive/60" />
            <p class="text-sm text-cb-muted">No disputed errands</p>
          </div>
          <ul v-else class="divide-y divide-cb-divider">
            <li v-for="e in disputedErrandList.slice(0, 4)" :key="e._id" class="flex items-center gap-3 px-5 py-3.5">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cb-negative/10 text-cb-negative text-sm">
                <i class="fa-solid fa-triangle-exclamation" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-cb-text">{{ e.title }}</p>
                <p class="text-xs text-cb-muted">₦{{ e.budget?.toLocaleString() }} · {{ fmtDate(e.createdAt) }}</p>
              </div>
              <router-link :to="`/admin/errands/${e._id}`"
                class="shrink-0 rounded-lg bg-cb-negative/10 px-3 py-1 text-[11px] font-bold text-cb-negative transition-colors hover:bg-cb-negative/20">
                Resolve
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Recent Orders -->
        <div class="rounded-2xl border border-cb-divider bg-cb-card">
          <div class="flex items-center justify-between border-b border-cb-divider px-5 py-4">
            <h2 class="font-bold text-cb-text">Recent Orders</h2>
            <router-link to="/admin/orders" class="text-xs font-semibold text-cb-accent hover:underline">View all</router-link>
          </div>
          <div v-if="ordersLoading" class="space-y-3 p-5">
            <div v-for="i in 2" :key="i" class="h-12 animate-pulse rounded-xl bg-cb-field" />
          </div>
          <div v-else-if="!adminStore.orders.length" class="flex flex-col items-center py-10 text-center">
            <i class="fa-solid fa-bag-shopping mb-2 text-2xl text-cb-muted/40" />
            <p class="text-sm text-cb-muted">No orders yet</p>
          </div>
          <ul v-else class="divide-y divide-cb-divider">
            <li v-for="o in adminStore.orders.slice(0, 4)" :key="o._id" class="flex items-center gap-3 px-5 py-3.5">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cb-accent/10 text-cb-accent text-sm">
                <i class="fa-solid fa-briefcase" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-cb-text">₦{{ o.amount?.toLocaleString() }}</p>
                <p class="text-xs text-cb-muted">{{ o.tierName }} · {{ statusLabel(o.status) }}</p>
              </div>
              <span class="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" :class="orderStatusClass(o.status)">
                {{ o.status?.replace('_', ' ') }}
              </span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAdminStore } from "@/stores/adminStore";
import { useSubscriptionStore } from "@/stores/subscriptionStore";

const adminStore        = useAdminStore();
const subscriptionStore = useSubscriptionStore();

const loading             = ref(false);
const refreshing          = ref(false);
const verificationsLoading = ref(false);
const clearancesLoading    = ref(false);
const errandsLoading       = ref(false);
const ordersLoading        = ref(false);

const today = new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

const pendingVerifs       = computed(() => adminStore.pendingVerifications);
const pendingClearanceList = computed(() => adminStore.pendingClearances);
const disputedErrandList  = computed(() => adminStore.disputedErrands);

const stats = computed(() => [
  { label: "Total Users",          value: adminStore.usersMeta.total,          icon: "fa-solid fa-users text-cb-accent",        iconBg: "bg-cb-accent/10",      sub: "registered" },
  { label: "Verifications",        value: pendingVerifs.value.length,           icon: "fa-solid fa-id-card text-amber-500",      iconBg: "bg-amber-500/10",      sub: "pending review" },
  { label: "Active Errands",       value: adminStore.postedErrands.length,      icon: "fa-solid fa-list-check text-cb-positive", iconBg: "bg-cb-positive/10",    sub: "posted" },
  { label: "Disputes",             value: adminStore.disputedErrands.length + adminStore.disputedOrders.length, icon: "fa-solid fa-triangle-exclamation text-cb-negative", iconBg: "bg-cb-negative/10", sub: "open" },
  { label: "Subscriptions",        value: adminStore.subscriptionsMeta.total,   icon: "fa-solid fa-crown text-purple-500",       iconBg: "bg-purple-500/10",     sub: "total" },
  { label: "Clearances",           value: pendingClearanceList.value.length,    icon: "fa-solid fa-money-bill-transfer text-teal-500", iconBg: "bg-teal-500/10", sub: "pending payout" },
]);

const quickLinks = [
  { label: "Manage Users",        sub: "View & suspend accounts",  to: "/admin/users",          icon: "fa-solid fa-users text-cb-accent",    iconBg: "bg-cb-accent/10"  },
  { label: "Verifications",       sub: "Review ID documents",      to: "/admin/verifications",  icon: "fa-solid fa-shield-check text-amber-500", iconBg: "bg-amber-500/10" },
  { label: "Clearances",         sub: "Approve earnings payouts", to: "/admin/clearances",     icon: "fa-solid fa-sack-dollar text-teal-500", iconBg: "bg-teal-500/10"  },
  { label: "Subscription Plans", sub: "Create & edit plans",      to: "/admin/plans",          icon: "fa-solid fa-crown text-purple-500",   iconBg: "bg-purple-500/10" },
];

const docTypeLabel = (t) => ({ national_id: "National ID", passport: "Passport", drivers_license: "Driver's License" }[t] ?? t);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short" }) : "—";
const statusLabel = (s) => s?.replace(/_/g, " ") ?? "—";

const orderStatusClass = (s) => ({
  in_progress: "bg-blue-500/10 text-blue-500",
  completed:   "bg-cb-positive/10 text-cb-positive",
  disputed:    "bg-cb-negative/10 text-cb-negative",
  cancelled:   "bg-cb-muted/10 text-cb-muted",
  pending:     "bg-amber-500/10 text-amber-500",
}[s] ?? "bg-cb-field text-cb-muted");

async function loadAll() {
  verificationsLoading.value = true;
  clearancesLoading.value    = true;
  errandsLoading.value       = true;
  ordersLoading.value        = true;
  loading.value              = true;
  try {
    await Promise.all([
      adminStore.fetchVerifications().finally(() => { verificationsLoading.value = false; }),
      adminStore.fetchClearances().finally(() => { clearancesLoading.value = false; }),
      adminStore.fetchErrands().finally(() => { errandsLoading.value = false; }),
      adminStore.fetchOrders().finally(() => { ordersLoading.value = false; }),
      adminStore.fetchUsers(),
      adminStore.fetchSubscriptions(),
    ]);
  } finally {
    loading.value = false;
  }
}

async function refreshAll() {
  refreshing.value = true;
  await loadAll().finally(() => { refreshing.value = false; });
}

onMounted(loadAll);
</script>