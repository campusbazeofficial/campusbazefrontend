<template>
  <div class="min-h-screen bg-cb-base">
    <div class="border-b border-cb-divider bg-cb-base py-5">
      <h1 class="text-xl font-bold text-cb-text">Subscriptions</h1>
      <p class="text-sm text-cb-muted">{{ adminStore.subscriptionsMeta.total }} total subscriptions</p>
      <div class="mt-4 flex flex-wrap gap-2">
        <div class="relative min-w-0 flex-1 bg-cb-field rounded-xl">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-cb-muted" />
          <input v-model="search" type="text" placeholder="Search email or reference…"
            class="h-10 w-full rounded-xl border border-cb-divider bg-cb-card pl-9 pr-4 text-sm text-cb-text placeholder:text-cb-muted/60 focus:border-cb-accent/50 focus:outline-none" />
        </div>

        <DropDownComponent ref="statusDrop" label="Status" :min-width="140"
          bgClass="bg-cb-field" textClass="text-cb-text">
          <div class="p-1.5">
            <button v-for="s in ['', 'active', 'cancelled', 'expired']" :key="s"
              class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-cb-field capitalize"
              :class="filterStatus === s ? 'text-cb-accent font-semibold' : 'text-cb-text'"
              @click="filterStatus = s; statusDrop.close()">
              {{ s || 'All' }}<i v-if="filterStatus === s" class="fa-solid fa-check ml-auto text-xs text-cb-accent" />
            </button>
          </div>
        </DropDownComponent>

        <DropDownComponent ref="tierDrop" label="Tier" :min-width="140"
          bgClass="bg-cb-field" textClass="text-cb-text">
          <div class="p-1.5">
            <button v-for="t in tierOpts" :key="t"
              class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-cb-field capitalize"
              :class="filterTier === t ? 'text-cb-accent font-semibold' : 'text-cb-text'"
              @click="filterTier = t; tierDrop.close()">
              {{ t || 'All Tiers' }}<i v-if="filterTier === t" class="fa-solid fa-check ml-auto text-xs text-cb-accent" />
            </button>
          </div>
        </DropDownComponent>

        <button v-if="filterStatus || filterTier || search"
          class="rounded-xl border border-cb-divider px-3 py-2 text-xs font-semibold text-cb-muted hover:text-cb-negative"
          @click="search = ''; filterStatus = ''; filterTier = ''">
          <i class="fa-solid fa-xmark mr-1" />Clear
        </button>
      </div>
    </div>

    <div class="mx-auto max-w-7xl py-6">
      <div v-if="adminStore.subscriptionsLoading && !adminStore.subscriptions.length" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-20 animate-pulse rounded-2xl bg-cb-card" />
      </div>
      <div v-else-if="!filtered.length" class="flex flex-col items-center gap-3 py-20 text-center">
        <i class="fa-solid fa-crown text-4xl text-cb-muted/30" />
        <p class="font-semibold text-cb-text">No subscriptions found</p>
      </div>
      <div v-else class="space-y-3">
        <router-link v-for="s in filtered" :key="s._id" :to="`/admin/subscriptions/${s._id}`"
          class="flex items-center gap-4 rounded-2xl border border-cb-divider bg-cb-card p-4 transition-all hover:border-cb-accent/30 hover:shadow-sm">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base"
            :class="subStatusStyle(s.status).icon">
            <i :class="subStatusStyle(s.status).fa" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <p class="font-semibold capitalize text-cb-text">{{ s.planSnapshot?.nameLabel ?? s.tier }}</p>
              <span class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" :class="subStatusStyle(s.status).badge">{{ s.status }}</span>
            </div>
            <p class="text-xs text-cb-muted">{{ s.paystackCustomerEmail }} · ₦{{ s.priceNGN?.toLocaleString() }}/{{ s.billingPeriod }}</p>
            <p class="text-xs text-cb-muted">Expires {{ fmtDate(s.expiresAt) }}</p>
          </div>
          <i class="fa-solid fa-chevron-right shrink-0 text-xs text-cb-muted/40" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAdminStore } from "@/stores/adminStore";
import DropDownComponent from "@/components/reusables/DropDownComponent.vue";

const adminStore   = useAdminStore();
const search       = ref("");
const filterStatus = ref("");
const filterTier   = ref("");

const statusDrop = ref(null);
const tierDrop   = ref(null);

const tierOpts = ["", "free", "basic", "pro", "elite", "corporate_free", "corporate_pro", "corporate_elite"];

const filtered = computed(() => {
  let list = adminStore.subscriptions;
  const q = search.value.toLowerCase();
  if (q) list = list.filter((s) => s.paystackCustomerEmail?.toLowerCase().includes(q) || s.paystackReference?.toLowerCase().includes(q));
  if (filterStatus.value) list = list.filter((s) => s.status === filterStatus.value);
  if (filterTier.value)   list = list.filter((s) => s.tier === filterTier.value);
  return list;
});

const subStatusStyle = (s) => ({
  active:    { icon: "bg-cb-positive/10 text-cb-positive",  fa: "fa-solid fa-crown",         badge: "bg-cb-positive/10 text-cb-positive" },
  cancelled: { icon: "bg-cb-negative/10 text-cb-negative",  fa: "fa-solid fa-crown-slash",   badge: "bg-cb-negative/10 text-cb-negative" },
  expired:   { icon: "bg-amber-500/10 text-amber-500",      fa: "fa-solid fa-hourglass-end", badge: "bg-amber-500/10 text-amber-600"     },
  pending:   { icon: "bg-blue-500/10 text-blue-500",        fa: "fa-solid fa-clock",         badge: "bg-blue-500/10 text-blue-500"       },
}[s] ?? { icon: "bg-cb-field text-cb-muted", fa: "fa-solid fa-crown", badge: "bg-cb-field text-cb-muted" });

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";

onMounted(() => adminStore.fetchSubscriptions());
</script>