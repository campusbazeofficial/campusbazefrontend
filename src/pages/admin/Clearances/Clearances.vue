<template>
  <div class="min-h-screen bg-cb-base">
    <div class="border-b border-cb-divider bg-cb-base  py-5 ">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-cb-text">Earnings Clearances</h1>
          <p class="text-sm text-cb-muted">{{ adminStore.clearancesMeta.total }} total · {{ adminStore.pendingClearances.length }} pending</p>
        </div>
        <button
          v-if="adminStore.selectedClearanceIds.length"
          class="flex items-center gap-2 rounded-xl bg-cb-positive px-4 py-2.5 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
          :disabled="adminStore.bulkClearanceLoading"
          @click="handleBulkApprove">
          <svg v-if="adminStore.bulkClearanceLoading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <i v-else class="fa-solid fa-check-double text-xs" />
          Approve {{ adminStore.selectedClearanceIds.length }} Selected
        </button>
        <button
          v-else-if="adminStore.pendingClearances.length > 0"
          class="flex items-center gap-2 rounded-xl border border-cb-divider bg-cb-card px-4 py-2.5 text-sm font-semibold text-cb-muted transition-all hover:border-cb-positive/40 hover:text-cb-positive active:scale-95"
          @click="adminStore.selectAllPendingClearances()">
          <i class="fa-solid fa-check-double text-xs" />
          Select All Pending
        </button>
      </div>

      <!-- Filters -->
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <DropDownComponent ref="statusDrop" label="Status" :min-width="140" bgClass="bg-cb-field">
          <div class="p-1.5">
            <button v-for="s in ['', 'pending', 'approved', 'rejected']" :key="s"
              class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-cb-field capitalize"
              :class="filterStatus === s ? 'text-cb-accent font-semibold' : 'text-cb-text'"
              @click="filterStatus = s; statusDrop.close()">
              {{ s || 'All' }}<i v-if="filterStatus === s" class="fa-solid fa-check ml-auto text-xs text-cb-accent" />
            </button>
          </div>
        </DropDownComponent>

        <DropDownComponent ref="typeDrop" label="Type" :min-width="140" bgClass="bg-cb-field">
          <div class="p-1.5">
            <button v-for="t in ['', 'errand', 'order']" :key="t"
              class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-cb-field capitalize"
              :class="filterType === t ? 'text-cb-accent font-semibold' : 'text-cb-text'"
              @click="filterType = t; typeDrop.close()">
              {{ t || 'All Types' }}<i v-if="filterType === t" class="fa-solid fa-check ml-auto text-xs text-cb-accent" />
            </button>
          </div>
        </DropDownComponent>

        <button v-if="adminStore.selectedClearanceIds.length"
          class="rounded-xl border border-cb-divider px-3 py-2 text-xs font-semibold text-cb-muted hover:text-cb-negative"
          @click="adminStore.clearClearanceSelection()">
          <i class="fa-solid fa-xmark mr-1" />Deselect All
        </button>
      </div>
    </div>

    <div class="mx-auto max-w-7xl  py-6 ">

      <!-- Loading -->
      <div v-if="adminStore.clearancesLoading && !adminStore.clearances.length" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-20 animate-pulse rounded-2xl bg-cb-card" />
      </div>

      <!-- Empty -->
      <div v-else-if="!filtered.length" class="flex flex-col items-center gap-3 py-20 text-center">
        <i class="fa-solid fa-circle-check text-4xl text-cb-positive/50" />
        <p class="font-semibold text-cb-text">All clearances processed</p>
        <p class="text-sm text-cb-muted">No pending payouts at this time</p>
      </div>

      <!-- List -->
      <div v-else class="space-y-3">
        <div v-for="c in filtered" :key="c._id"
          class="flex items-center gap-3 rounded-2xl border bg-cb-card p-4 transition-all"
          :class="[
            c.status === 'pending' ? 'hover:border-cb-accent/30 cursor-pointer' : '',
            adminStore.isClearanceSelected(c._id) ? 'border-cb-accent/50 bg-cb-accent/3' : 'border-cb-divider',
          ]"
          @click="c.status === 'pending' ? adminStore.toggleClearanceSelection(c._id) : null">

          <!-- Checkbox (pending only) -->
          <div v-if="c.status === 'pending'" class="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors"
            :class="adminStore.isClearanceSelected(c._id) ? 'border-cb-accent bg-cb-accent' : 'border-cb-divider'">
            <i v-if="adminStore.isClearanceSelected(c._id)" class="fa-solid fa-check text-[9px] text-white" />
          </div>
          <div v-else class="h-5 w-5 shrink-0" />

          <!-- Icon -->
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm" :class="clearanceStyle(c.status).icon">
            <i :class="clearanceStyle(c.status).fa" />
          </div>

          <!-- Info -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <p class="font-semibold text-cb-text">{{ c.userId?.firstName }} {{ c.userId?.lastName }}</p>
              <span class="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize" :class="roleClass(c.userId?.role)">{{ c.userId?.role }}</span>
            </div>
            <p class="text-xs text-cb-muted">{{ c.userId?.email }}</p>
            <div class="mt-1 flex flex-wrap gap-2 text-xs text-cb-muted">
              <span class="font-semibold text-cb-positive">₦{{ c.amountNGN?.toLocaleString() }}</span>
              <span>·</span>
              <span class="capitalize">{{ c.sourceType }}</span>
              <span>·</span>
              <span>{{ fmtDate(c.createdAt) }}</span>
            </div>
          </div>

          <!-- Status badge + actions -->
          <div class="flex shrink-0 flex-col items-end gap-2">
            <span class="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" :class="clearanceStyle(c.status).badge">
              {{ c.status }}
            </span>
            <div v-if="c.status === 'pending'" class="flex items-center gap-1" @click.stop>
              <button class="rounded-lg bg-cb-negative/10 px-2.5 py-1 text-[10px] font-bold text-cb-negative transition-all hover:bg-cb-negative/20"
                :disabled="adminStore.clearanceActionLoading" @click="openReject(c)">
                Reject
              </button>
              <button class="rounded-lg bg-cb-positive/10 px-2.5 py-1 text-[10px] font-bold text-cb-positive transition-all hover:bg-cb-positive/20"
                :disabled="adminStore.clearanceActionLoading" @click="handleApprove(c._id)">
                Approve
              </button>
            </div>
            <button v-if="c.status === 'rejected'" @click.stop="handleReapprove(c._id)"
              class="rounded-lg bg-cb-accent/10 px-2.5 py-1 text-[10px] font-bold text-cb-accent transition-all hover:bg-cb-accent/20"
              :disabled="adminStore.clearanceActionLoading">
              Reapprove
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="adminStore.clearancesMeta.totalPages > 1" class="mt-4 flex items-center justify-center gap-2">
        <button class="rounded-xl border border-cb-divider px-4 py-2 text-sm text-cb-muted disabled:opacity-40"
          :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
          <i class="fa-solid fa-chevron-left text-xs" />
        </button>
        <span class="text-sm text-cb-muted">{{ currentPage }} / {{ adminStore.clearancesMeta.totalPages }}</span>
        <button class="rounded-xl border border-cb-divider px-4 py-2 text-sm text-cb-muted disabled:opacity-40"
          :disabled="!adminStore.clearancesMeta.hasNextPage" @click="changePage(currentPage + 1)">
          <i class="fa-solid fa-chevron-right text-xs" />
        </button>
      </div>
    </div>

    <!-- Reject modal -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="showRejectModal"
          class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
          @click.self="showRejectModal = false">
          <div class="w-full max-w-sm overflow-hidden rounded-t-3xl bg-cb-card sm:rounded-2xl" @click.stop>
            <div class="h-1 bg-cb-negative" />
            <div class="p-6">
              <h2 class="mb-1 text-lg font-bold text-cb-text">Reject Clearance?</h2>
              <p class="text-sm text-cb-muted">₦{{ rejectingClearance?.amountNGN?.toLocaleString() }} for {{ rejectingClearance?.userId?.firstName }} {{ rejectingClearance?.userId?.lastName }}</p>
              <div class="mt-4">
                <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-cb-muted">Admin Note</label>
                <textarea v-model="rejectNote" placeholder="Reason for rejection…"
                  class="w-full resize-none rounded-xl border border-cb-divider bg-cb-field px-4 py-3 text-sm text-cb-text focus:border-cb-accent/50 focus:outline-none focus:ring-2 focus:ring-cb-accent/20"
                  rows="3" />
              </div>
              <div class="mt-5 flex gap-3">
                <button class="flex-1 rounded-xl border border-cb-divider py-3 text-sm font-semibold text-cb-muted" @click="showRejectModal = false">Cancel</button>
                <button class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-negative py-3 text-sm font-bold text-white disabled:opacity-60"
                  :disabled="adminStore.clearanceActionLoading" @click="submitReject">
                  <svg v-if="adminStore.clearanceActionLoading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Reject
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
import { useAdminStore } from "@/stores/adminStore";
import { useToast } from "@/composables/useToast";
import DropDownComponent from "@/components/reusables/DropDownComponent.vue";
import ToastContainer from "@/components/reusables/ToastContainer.vue";

const adminStore = useAdminStore();
const toast      = useToast();

const filterStatus = ref("");
const filterType   = ref("");
const currentPage  = ref(1);

const statusDrop = ref(null);
const typeDrop   = ref(null);

const showRejectModal    = ref(false);
const rejectingClearance = ref(null);
const rejectNote         = ref("");

const filtered = computed(() => {
  let list = adminStore.clearances;
  if (filterStatus.value) list = list.filter((c) => c.status === filterStatus.value);
  if (filterType.value)   list = list.filter((c) => c.sourceType === filterType.value);
  return list;
});

const clearanceStyle = (s) => ({
  pending:  { icon: "bg-amber-500/10 text-amber-500",     fa: "fa-solid fa-clock",        badge: "bg-amber-500/12 text-amber-600"     },
  approved: { icon: "bg-cb-positive/10 text-cb-positive", fa: "fa-solid fa-circle-check", badge: "bg-cb-positive/12 text-cb-positive" },
  rejected: { icon: "bg-cb-negative/10 text-cb-negative", fa: "fa-solid fa-circle-xmark", badge: "bg-cb-negative/12 text-cb-negative" },
}[s] ?? { icon: "bg-cb-field text-cb-muted", fa: "fa-solid fa-clock", badge: "bg-cb-field text-cb-muted" });

const roleClass = (r) => ({ student: "bg-blue-500/10 text-blue-500", professional: "bg-purple-500/10 text-purple-500", corporate: "bg-amber-500/10 text-amber-600" }[r] ?? "bg-cb-field text-cb-muted");
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "2-digit" }) : "—";

async function handleApprove(id) {
  try {
    await adminStore.approveClearance(id);
    toast.success("Clearance approved");
  } catch (err) {
    toast.error(err?.response?.data?.message || "Approval failed");
  }
}

async function handleReapprove(id) {
  try {
    await adminStore.reapproveClearance(id);
    toast.success("Clearance reapproved");
  } catch (err) {
    toast.error(err?.response?.data?.message || "Reapproval failed");
  }
}

function openReject(c) {
  rejectingClearance.value = c;
  rejectNote.value         = "";
  showRejectModal.value    = true;
}

async function submitReject() {
  try {
    await adminStore.rejectClearance(rejectingClearance.value._id, { adminNote: rejectNote.value });
    toast.success("Clearance rejected");
    showRejectModal.value = false;
  } catch (err) {
    toast.error(err?.response?.data?.message || "Rejection failed");
  }
}

async function handleBulkApprove() {
  try {
    const res = await adminStore.bulkApproveClearances();
    toast.success(res?.data?.message ?? "Bulk approval complete");
  } catch (err) {
    toast.error(err?.response?.data?.message || "Bulk approval failed");
  }
}

function changePage(p) {
  currentPage.value = p;
  adminStore.fetchClearances({ page: p });
}

onMounted(() => adminStore.fetchClearances());
</script>

<style scoped>
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.22s ease; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }
</style>