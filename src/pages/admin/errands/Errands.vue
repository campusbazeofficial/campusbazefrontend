<template>
  <div class="min-h-screen bg-cb-base">
    <div class="border-b border-cb-divider bg-cb-base py-5">
      <h1 class="text-xl font-bold text-cb-text">Errands</h1>
      <p class="text-sm text-cb-muted">{{ adminStore.errandsMeta.total }} total errands</p>
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <div class="relative min-w-0 flex-1 bg-cb-field rounded-xl">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-cb-muted" />
          <input v-model="search" type="text" placeholder="Search title or address…"
            class="h-10 w-full rounded-xl border border-cb-divider bg-cb-card pl-9 pr-4 text-sm text-cb-text placeholder:text-cb-muted/60 focus:border-cb-accent/50 focus:outline-none" />
        </div>

        <DropDownComponent ref="statusDrop" label="Status" :min-width="150" bgClass="bg-cb-field">
          <div class="p-1.5">
            <button v-for="s in statusOpts" :key="s.value"
              class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-cb-field"
              :class="filterStatus === s.value ? 'text-cb-accent font-semibold' : 'text-cb-text'"
              @click="filterStatus = s.value; statusDrop.close()">
              {{ s.label }}<i v-if="filterStatus === s.value" class="fa-solid fa-check ml-auto text-xs text-cb-accent" />
            </button>
          </div>
        </DropDownComponent>

        <button v-if="filterStatus || search"
          class="rounded-xl border border-cb-divider px-3 py-2 text-xs font-semibold text-cb-muted hover:text-cb-negative"
          @click="search = ''; filterStatus = ''">
          <i class="fa-solid fa-xmark mr-1" />Clear
        </button>
      </div>
    </div>

    <div class="mx-auto max-w-7xl py-6">
      <div v-if="adminStore.errandsLoading && !adminStore.errands.length" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-20 animate-pulse rounded-2xl bg-cb-card" />
      </div>
      <div v-else-if="!filtered.length" class="flex flex-col items-center gap-3 py-20 text-center">
        <i class="fa-solid fa-list-check text-4xl text-cb-muted/30" />
        <p class="font-semibold text-cb-text">No errands found</p>
      </div>
      <div v-else class="space-y-3">
        <router-link v-for="e in filtered" :key="e._id" :to="`/admin/errands/${e._id}`"
          class="flex items-start gap-4 rounded-2xl border bg-cb-card p-4 transition-all hover:shadow-sm"
          :class="e.status === 'disputed' ? 'border-cb-negative/40' : 'border-cb-divider hover:border-cb-accent/30'">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base"
            :class="errandStatusStyle(e.status).icon">
            <i :class="errandStatusStyle(e.status).fa" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <p class="font-semibold text-cb-text">{{ e.title }}</p>
              <span class="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" :class="errandStatusStyle(e.status).badge">
                {{ e.status }}
              </span>
            </div>
            <p class="mt-0.5 text-xs text-cb-muted line-clamp-1">{{ e.address }}</p>
            <div class="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-cb-muted">
              <span><i class="fa-solid fa-naira-sign mr-1 text-[10px]" />{{ e.budget?.toLocaleString() }}</span>
              <span><i class="fa-solid fa-gavel mr-1 text-[10px]" />{{ e.bidsCount }} bids</span>
              <span><i class="fa-regular fa-calendar mr-1 text-[10px]" />{{ fmtDate(e.deadline) }}</span>
              <span v-if="e.escrowConfirmed" class="text-cb-positive"><i class="fa-solid fa-lock mr-1 text-[10px]" />Escrow</span>
            </div>
          </div>
          <i class="fa-solid fa-chevron-right shrink-0 text-xs text-cb-muted/40 mt-1" />
        </router-link>
      </div>

      <div v-if="adminStore.errandsMeta.totalPages > 1" class="mt-4 flex items-center justify-center gap-2">
        <button class="rounded-xl border border-cb-divider px-4 py-2 text-sm text-cb-muted disabled:opacity-40"
          :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
          <i class="fa-solid fa-chevron-left text-xs" />
        </button>
        <span class="text-sm text-cb-muted">{{ currentPage }} / {{ adminStore.errandsMeta.totalPages }}</span>
        <button class="rounded-xl border border-cb-divider px-4 py-2 text-sm text-cb-muted disabled:opacity-40"
          :disabled="!adminStore.errandsMeta.hasNextPage" @click="changePage(currentPage + 1)">
          <i class="fa-solid fa-chevron-right text-xs" />
        </button>
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
const currentPage  = ref(1);

const statusDrop = ref(null);

const statusOpts = [
  { value: "",          label: "All"       },
  { value: "posted",    label: "Posted"    },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "disputed",  label: "Disputed"  },
  { value: "cancelled", label: "Cancelled" },
];

const filtered = computed(() => {
  let list = adminStore.errands;
  const q = search.value.toLowerCase();
  if (q) list = list.filter((e) => e.title?.toLowerCase().includes(q) || e.address?.toLowerCase().includes(q));
  if (filterStatus.value) list = list.filter((e) => e.status === filterStatus.value);
  return list;
});

const errandStatusStyle = (s) => ({
  posted:    { icon: "bg-blue-500/10 text-blue-500",       fa: "fa-solid fa-bullhorn",             badge: "bg-blue-500/10 text-blue-500"       },
  confirmed: { icon: "bg-cb-accent/10 text-cb-accent",     fa: "fa-solid fa-handshake",            badge: "bg-cb-accent/10 text-cb-accent"     },
  completed: { icon: "bg-cb-positive/10 text-cb-positive", fa: "fa-solid fa-circle-check",         badge: "bg-cb-positive/10 text-cb-positive" },
  disputed:  { icon: "bg-cb-negative/10 text-cb-negative", fa: "fa-solid fa-triangle-exclamation", badge: "bg-cb-negative/10 text-cb-negative" },
  cancelled: { icon: "bg-cb-muted/10 text-cb-muted",       fa: "fa-solid fa-circle-xmark",         badge: "bg-cb-muted/10 text-cb-muted"       },
}[s] ?? { icon: "bg-cb-field text-cb-muted", fa: "fa-solid fa-circle", badge: "bg-cb-field text-cb-muted" });

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short" }) : "—";

function changePage(p) { currentPage.value = p; adminStore.fetchErrands({ page: p }); }
onMounted(() => adminStore.fetchErrands());
</script>