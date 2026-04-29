<template>
  <div class="min-h-screen bg-cb-base">
    <div class="border-b border-cb-divider bg-cb-base  py-5 ">
      <div class="flex items-center gap-3">
        <button class="flex h-9 w-9 items-center justify-center rounded-xl border border-cb-divider bg-cb-card text-cb-muted hover:border-cb-accent/30 hover:text-cb-text active:scale-95"
          @click="$router.back()">
          <i class="fa-solid fa-arrow-left text-sm" />
        </button>
        <div>
          <h1 class="text-xl font-bold text-cb-text">Errand Detail</h1>
          <p class="text-sm text-cb-muted">Full errand information</p>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl space-y-4  py-6 ">

      <template v-if="adminStore.selectedErrandLoading">
        <div v-for="i in 4" :key="i" class="animate-pulse rounded-2xl bg-cb-card" :style="`height:${[120,160,100,80][i-1]}px`" />
      </template>

      <template v-else-if="errand">

        <!-- Header card -->
        <div class="overflow-hidden rounded-2xl border bg-cb-card"
          :class="errand.status === 'disputed' ? 'border-cb-negative/40' : 'border-cb-divider'">
          <div class="h-[3px]" :class="statusBarClass" />
          <div class="p-5">
            <div class="flex items-start justify-between gap-3">
              <h2 class="text-base font-bold text-cb-text">{{ errand.title }}</h2>
              <span class="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" :class="statusBadge">{{ errand.status }}</span>
            </div>
            <p class="mt-2 text-sm text-cb-muted">{{ errand.description }}</p>
            <div class="mt-4 grid grid-cols-2 gap-2">
              <div class="rounded-xl bg-cb-field px-4 py-3">
                <p class="text-[10px] text-cb-muted uppercase tracking-wide">Budget</p>
                <p class="font-bold text-cb-text">₦{{ errand.budget?.toLocaleString() }}</p>
              </div>
              <div class="rounded-xl bg-cb-field px-4 py-3">
                <p class="text-[10px] text-cb-muted uppercase tracking-wide">Category</p>
                <p class="font-bold capitalize text-cb-text">{{ errand.category?.replace(/_/g, ' ') }}</p>
              </div>
              <div class="rounded-xl bg-cb-field px-4 py-3">
                <p class="text-[10px] text-cb-muted uppercase tracking-wide">Deadline</p>
                <p class="font-bold text-cb-text">{{ fmtDate(errand.deadline) }}</p>
              </div>
              <div class="rounded-xl bg-cb-field px-4 py-3">
                <p class="text-[10px] text-cb-muted uppercase tracking-wide">Bids</p>
                <p class="font-bold text-cb-text">{{ errand.bidsCount }}</p>
              </div>
            </div>
            <div class="mt-2 flex items-center gap-2 rounded-xl bg-cb-field px-4 py-2.5 text-sm text-cb-muted">
              <i class="fa-solid fa-location-dot text-xs" />{{ errand.address }}
            </div>
          </div>
        </div>

        <!-- Poster info -->
        <div class="rounded-2xl border border-cb-divider bg-cb-card p-5">
          <h3 class="mb-3 text-xs font-bold uppercase tracking-widest text-cb-muted">Posted By</h3>
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-cb-field text-sm font-bold text-cb-muted">
              {{ posterInitials }}
            </div>
            <div>
              <p class="font-semibold text-cb-text">{{ errand.posterId?.firstName }} {{ errand.posterId?.lastName }}</p>
              <p class="text-xs text-cb-muted">{{ errand.posterId?.email }} · ⭐ {{ errand.posterId?.averageRating }}</p>
            </div>
          </div>
        </div>

        <!-- Financial info (if confirmed/completed) -->
        <div v-if="errand.agreedAmount" class="rounded-2xl border border-cb-divider bg-cb-card p-5">
          <h3 class="mb-3 text-xs font-bold uppercase tracking-widest text-cb-muted">Financials</h3>
          <div class="divide-y divide-cb-divider/60">
            <div v-for="row in financialRows" :key="row.label" class="flex items-center justify-between py-2.5">
              <span class="text-sm text-cb-muted">{{ row.label }}</span>
              <span class="text-sm font-semibold text-cb-text">{{ row.value }}</span>
            </div>
          </div>
        </div>

        <!-- Dispute info -->
        <div v-if="errand.disputeReason" class="rounded-2xl border border-cb-negative/30 bg-cb-negative/5 p-5">
          <h3 class="mb-2 text-xs font-bold uppercase tracking-widest text-cb-negative">Dispute</h3>
          <p class="text-sm text-cb-text">{{ errand.disputeReason }}</p>
          <div v-if="errand.disputeNote" class="mt-2 rounded-xl bg-cb-field px-4 py-2.5 text-sm text-cb-muted">
            <span class="font-semibold text-cb-text">Admin note: </span>{{ errand.disputeNote }}
          </div>
        </div>

        <!-- Bids list -->
        <div v-if="errand.bids?.length" class="rounded-2xl border border-cb-divider bg-cb-card">
          <div class="border-b border-cb-divider px-5 py-4">
            <h3 class="text-xs font-bold uppercase tracking-widest text-cb-muted">Bids ({{ errand.bids.length }})</h3>
          </div>
          <ul class="divide-y divide-cb-divider/60">
            <li v-for="bid in errand.bids" :key="bid._id" class="flex items-center gap-3 px-5 py-3.5">
              <div class="h-8 w-8 rounded-lg bg-cb-field flex items-center justify-center text-xs font-bold text-cb-muted shrink-0">
                <i class="fa-solid fa-user" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-cb-text">₦{{ bid.amount?.toLocaleString() }}</p>
                <p class="text-xs text-cb-muted line-clamp-1">{{ bid.message }}</p>
              </div>
              <span class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" :class="bidStatusClass(bid.status)">{{ bid.status }}</span>
            </li>
          </ul>
        </div>

        <!-- Completion proof -->
        <div v-if="errand.completionProofUrl" class="rounded-2xl border border-cb-divider bg-cb-card p-5">
          <h3 class="mb-3 text-xs font-bold uppercase tracking-widest text-cb-muted">Completion Proof</h3>
          <a :href="errand.completionProofUrl" target="_blank"
            class="flex items-center gap-3 rounded-xl border border-cb-divider bg-cb-field px-4 py-3 text-sm font-semibold text-cb-accent transition-all hover:border-cb-accent/40">
            <i class="fa-solid fa-file-arrow-down" />View proof document
          </a>
        </div>

        <!-- Dispute resolution (only if status is disputed or has a dispute) -->
        <div v-if="errand.disputeReason && !errand.disputeResolvedBy" class="flex gap-3">
          <button class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/8 py-3.5 text-sm font-bold text-blue-600 hover:bg-blue-500/15 active:scale-[0.98]"
            @click="openResolve('favour_poster')">
            <i class="fa-solid fa-user" />Favour Poster
          </button>
          <button class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/8 py-3.5 text-sm font-bold text-purple-600 hover:bg-purple-500/15 active:scale-[0.98]"
            @click="openResolve('favour_runner')">
            <i class="fa-solid fa-person-running" />Favour Runner
          </button>
        </div>
        <div v-else-if="errand.disputeResolvedBy" class="flex items-center gap-2 rounded-xl bg-cb-positive/8 px-4 py-3 text-sm text-cb-positive">
          <i class="fa-solid fa-circle-check" />Dispute has been resolved
        </div>

      </template>
    </div>

    <!-- Resolve Modal -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="showResolveModal"
          class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
          @click.self="showResolveModal = false">
          <div class="w-full max-w-sm overflow-hidden rounded-t-3xl bg-cb-card sm:rounded-2xl" @click.stop>
            <div class="h-1 bg-cb-accent" />
            <div class="p-6">
              <h2 class="mb-1 text-lg font-bold text-cb-text">Resolve Dispute</h2>
              <p class="text-sm text-cb-muted">
                Ruling in favour of <span class="font-semibold text-cb-text">{{ resolveOutcome === 'favour_poster' ? 'Poster' : 'Runner' }}</span>.
                This action will release or refund the escrow accordingly.
              </p>
              <div class="mt-4">
                <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cb-muted">Admin Note</label>
                <textarea v-model="resolveNote" placeholder="Explain your decision…"
                  class="w-full resize-none rounded-xl border border-cb-divider bg-cb-field px-4 py-3 text-sm text-cb-text placeholder:text-cb-muted/50 focus:border-cb-accent/50 focus:outline-none focus:ring-2 focus:ring-cb-accent/20"
                  rows="3" />
              </div>
              <div class="mt-5 flex gap-3">
                <button class="flex-1 rounded-xl border border-cb-divider py-3 text-sm font-semibold text-cb-muted" @click="showResolveModal = false">Cancel</button>
                <button class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-bold text-white disabled:opacity-60"
                  :disabled="adminStore.errandActionLoading" @click="submitResolve">
                  <svg v-if="adminStore.errandActionLoading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Confirm Resolution
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAdminStore } from "@/stores/adminStore";
import { useToast } from "@/composables/useToast";
import ToastContainer from "@/components/reusables/ToastContainer.vue";

const route      = useRoute();
const adminStore = useAdminStore();
const toast      = useToast();

const showResolveModal = ref(false);
const resolveOutcome   = ref("favour_poster");
const resolveNote      = ref("");

const errand = computed(() => adminStore.selectedErrand);

const posterInitials = computed(() => {
  const p = errand.value?.posterId;
  return `${p?.firstName?.[0] ?? ""}${p?.lastName?.[0] ?? ""}`.toUpperCase();
});

const STATUS_STYLES = {
  posted:    { bar: "bg-blue-400",    badge: "bg-blue-500/10 text-blue-500"       },
  confirmed: { bar: "bg-cb-accent",   badge: "bg-cb-accent/10 text-cb-accent"     },
  completed: { bar: "bg-cb-positive", badge: "bg-cb-positive/10 text-cb-positive" },
  disputed:  { bar: "bg-cb-negative", badge: "bg-cb-negative/10 text-cb-negative" },
  cancelled: { bar: "bg-cb-divider",  badge: "bg-cb-muted/10 text-cb-muted"       },
};
const statusBarClass = computed(() => STATUS_STYLES[errand.value?.status]?.bar ?? "bg-cb-divider");
const statusBadge    = computed(() => STATUS_STYLES[errand.value?.status]?.badge ?? "bg-cb-field text-cb-muted");

const financialRows = computed(() => {
  const e = errand.value;
  if (!e) return [];
  return [
    { label: "Agreed Amount",  value: `₦${e.agreedAmount?.toLocaleString()}` },
    { label: "Commission",     value: `₦${e.commissionNGN?.toLocaleString()} (${(e.commissionRate * 100).toFixed(0)}%)` },
    { label: "Seller Earns",   value: `₦${e.sellerEarningsNGN?.toLocaleString()}` },
    { label: "Escrow Ref",     value: e.escrowReference ?? "—" },
  ].filter((r) => r.value && r.value !== "—");
});

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";

const bidStatusClass = (s) => ({
  pending:  "bg-amber-500/10 text-amber-600",
  accepted: "bg-cb-positive/10 text-cb-positive",
  rejected: "bg-cb-negative/10 text-cb-negative",
}[s] ?? "bg-cb-field text-cb-muted");

function openResolve(outcome) {
  resolveOutcome.value = outcome;
  resolveNote.value    = "";
  showResolveModal.value = true;
}

async function submitResolve() {
  try {
    await adminStore.resolveErrand(errand.value._id, { outcome: resolveOutcome.value, adminNote: resolveNote.value });
    toast.success("Dispute resolved successfully");
    showResolveModal.value = false;
  } catch (err) {
    toast.error(err?.response?.data?.message || "Resolution failed");
  }
}

onMounted(() => adminStore.fetchErrand(route.params.id));
</script>

<style scoped>
.overlay-enter-active,.overlay-leave-active{transition:opacity 0.22s ease}
.overlay-enter-from,.overlay-leave-to{opacity:0}
</style>