<template>
  <div class="min-h-screen bg-cb-base">

    <!-- Header -->
    <div class="border-b border-cb-divider bg-cb-base py-5">
      <div class="mx-auto max-w-7xl px-4">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h1 class="text-xl font-bold text-cb-text">Subscription Plans</h1>
            <p class="text-sm text-cb-muted">
              {{ subStore.adminPlansMeta.total }} plan{{ subStore.adminPlansMeta.total !== 1 ? 's' : '' }} configured
            </p>
          </div>
          <router-link
            to="/admin/plans/new"
            class="flex items-center gap-2 rounded-xl bg-cb-accent px-4 py-2.5 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95"
          >
            <i class="fa-solid fa-plus text-xs" />
            New Plan
          </router-link>
        </div>

        <!-- Filters -->
        <div class="mt-4 flex flex-wrap gap-2">
          <DropDownComponent ref="typeDrop" label="Type" :min-width="148" bgClass="bg-cb-field">
            <div class="p-1.5">
              <button
                v-for="t in ['', 'individual', 'corporate']"
                :key="t"
                class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm capitalize hover:bg-cb-field"
                :class="filterType === t ? 'font-semibold text-cb-accent' : 'text-cb-text'"
                @click="filterType = t; typeDrop.close()"
              >
                <i v-if="t === 'individual'" class="fa-solid fa-user w-3 text-[10px]" />
                <i v-else-if="t === 'corporate'" class="fa-solid fa-building w-3 text-[10px]" />
                <i v-else class="fa-solid fa-layer-group w-3 text-[10px]" />
                {{ t || 'All Types' }}
                <i v-if="filterType === t" class="fa-solid fa-check ml-auto text-xs text-cb-accent" />
              </button>
            </div>
          </DropDownComponent>

          <DropDownComponent ref="statusDrop" label="Status" :min-width="148" bgClass="bg-cb-field">
            <div class="p-1.5">
              <button
                v-for="s in statusOpts"
                :key="s.value"
                class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-cb-field"
                :class="filterActive === s.value ? 'font-semibold text-cb-accent' : 'text-cb-text'"
                @click="filterActive = s.value; statusDrop.close()"
              >
                <span class="h-1.5 w-1.5 rounded-full" :class="s.dot" />
                {{ s.label }}
                <i v-if="filterActive === s.value" class="fa-solid fa-check ml-auto text-xs text-cb-accent" />
              </button>
            </div>
          </DropDownComponent>

          <!-- Active filter pills -->
          <button
            v-if="filterType || filterActive"
            class="flex items-center gap-1.5 rounded-xl border border-cb-divider px-3 py-2 text-xs text-cb-muted hover:text-cb-negative"
            @click="filterType = ''; filterActive = ''"
          >
            <i class="fa-solid fa-xmark" />
            Clear filters
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="mx-auto max-w-7xl px-4 py-6">

      <!-- Skeleton -->
      <div v-if="subStore.adminPlansLoading && !subStore.adminPlans.length" class="space-y-3">
        <div
          v-for="i in 5"
          :key="i"
          class="h-20 animate-pulse rounded-2xl bg-cb-card"
          :style="`animation-delay:${i * 50}ms`"
        />
      </div>

      <!-- Empty -->
      <div
        v-else-if="!filtered.length"
        class="flex flex-col items-center gap-3 rounded-2xl border border-cb-divider bg-cb-card py-20 text-center"
      >
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-cb-field">
          <i class="fa-solid fa-crown text-xl text-cb-muted/40" />
        </div>
        <div>
          <p class="font-semibold text-cb-text">No plans found</p>
          <p class="mt-0.5 text-sm text-cb-muted">
            {{ filterType || filterActive ? 'Try adjusting your filters' : 'Create your first plan to get started' }}
          </p>
        </div>
        <router-link
          v-if="!filterType && !filterActive"
          to="/admin/plans/create"
          class="mt-1 rounded-xl bg-cb-accent px-5 py-2.5 text-sm font-bold text-white"
        >
          Create First Plan
        </router-link>
      </div>

      <!-- Plan rows -->
      <div v-else class="space-y-3">
        <TransitionGroup name="list">
          <div
            v-for="plan in filtered"
            :key="plan._id"
            class="group flex flex-col gap-3 rounded-2xl border bg-cb-card p-4 transition-all sm:flex-row sm:items-center"
            :class="plan.isActive
              ? 'border-cb-divider hover:border-cb-accent/25 hover:shadow-sm'
              : 'border-cb-divider/50 opacity-55'"
          >
            <!-- Icon + info -->
            <div class="flex min-w-0 flex-1 items-center gap-3">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm"
                :class="tierIconBg(plan.tier)"
              >
                <i :class="tierIcon(plan.tier)" />
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="font-bold text-cb-text">{{ plan.nameLabel }}</p>

                  <span
                    class="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize"
                    :class="plan.planType === 'corporate'
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'bg-blue-500/10 text-blue-500'"
                  >
                    {{ plan.planType }}
                  </span>

                  <span
                    v-if="!plan.isActive"
                    class="rounded-full bg-cb-muted/10 px-2 py-0.5 text-[10px] font-bold text-cb-muted"
                  >
                    Inactive
                  </span>
                </div>

                <div class="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-cb-muted">
                  <span>
                    <span class="font-semibold text-cb-text">{{ formatPrice(plan.monthlyNGN) }}</span>/mo
                  </span>
                  <span v-if="plan.planType === 'individual' && plan.studentMonthlyNGN > 0">
                    Student: <span class="font-semibold text-cb-text">{{ formatPrice(plan.studentMonthlyNGN) }}</span>/mo
                  </span>
                  <span>{{ plan.commissionRate }}% commission</span>
                  <span v-if="plan.monthlyCbc > 0">{{ plan.monthlyCbc.toLocaleString() }} CBC/mo</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex shrink-0 items-center gap-2 sm:justify-end">
              <button
                class="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-80 active:scale-95 disabled:opacity-40"
                :class="plan.isActive
                  ? 'bg-cb-negative/10 text-cb-negative'
                  : 'bg-cb-positive/10 text-cb-positive'"
                :disabled="subStore.planActionLoading"
                @click="handleToggle(plan)"
              >
                <i :class="plan.isActive ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" class="text-[10px]" />
                {{ plan.isActive ? 'Disable' : 'Enable' }}
              </button>

              <router-link
                :to="`/admin/plans/${plan._id}/edit`"
                class="flex items-center gap-1.5 rounded-xl bg-cb-field px-3 py-2 text-xs font-semibold text-cb-text transition-all hover:bg-cb-accent/10 hover:text-cb-accent"
              >
                <i class="fa-solid fa-pen text-[10px]" />
                Edit
              </router-link>

              <button
                class="flex h-8 w-8 items-center justify-center rounded-xl bg-cb-negative/8 text-cb-negative transition-all hover:bg-cb-negative/20 active:scale-95 disabled:opacity-40"
                :disabled="subStore.planActionLoading"
                @click="confirmDelete(plan)"
              >
                <i class="fa-solid fa-trash text-xs" />
              </button>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Pagination (if needed later) -->
      <div
        v-if="subStore.adminPlansMeta.pages > 1"
        class="mt-6 flex justify-center gap-2"
      >
        <button
          v-for="p in subStore.adminPlansMeta.pages"
          :key="p"
          class="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition-all"
          :class="currentPage === p
            ? 'bg-cb-accent text-white'
            : 'bg-cb-card border border-cb-divider text-cb-muted hover:border-cb-accent/30 hover:text-cb-text'"
          @click="loadPage(p)"
        >
          {{ p }}
        </button>
      </div>
    </div>

    <!-- Delete confirm modal -->
    <Teleport to="body">
      <Transition name="overlay">
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
          @click.self="showDeleteModal = false"
        >
          <div class="w-full max-w-sm overflow-hidden rounded-t-3xl bg-cb-card sm:rounded-2xl" @click.stop>
            <div class="h-1 bg-cb-negative" />
            <div class="p-6">
              <div class="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cb-negative/10">
                <i class="fa-solid fa-trash text-cb-negative" />
              </div>
              <h2 class="mb-1 text-lg font-bold text-cb-text">Delete Plan?</h2>
              <p class="text-sm text-cb-muted">
                This will permanently delete
                <span class="font-semibold text-cb-text">{{ deletingPlan?.nameLabel }}</span>.
                This action cannot be undone.
              </p>
              <div class="mt-5 flex gap-3">
                <button
                  class="flex-1 rounded-xl border border-cb-divider py-3 text-sm font-semibold text-cb-muted hover:border-cb-accent/30"
                  @click="showDeleteModal = false"
                >
                  Cancel
                </button>
                <button
                  class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-negative py-3 text-sm font-bold text-white disabled:opacity-60"
                  :disabled="subStore.planActionLoading"
                  @click="handleDelete"
                >
                  <svg v-if="subStore.planActionLoading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Delete
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
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { useToast } from "@/composables/useToast";
import DropDownComponent from "@/components/reusables/DropDownComponent.vue";
import ToastContainer from "@/components/reusables/ToastContainer.vue";

const subStore = useSubscriptionStore();
const toast    = useToast();

// ── Filters
const filterType   = ref("");
const filterActive = ref("");
const currentPage  = ref(1);

const typeDrop   = ref(null);
const statusDrop = ref(null);

// ── Delete modal
const showDeleteModal = ref(false);
const deletingPlan    = ref(null);

const statusOpts = [
  { value: "",         label: "All",      dot: "bg-cb-muted"    },
  { value: "active",   label: "Active",   dot: "bg-cb-positive" },
  { value: "inactive", label: "Inactive", dot: "bg-cb-muted"    },
];

// ── Filtered list (client-side — server-side if pagination needed)
const filtered = computed(() => {
  let list = subStore.adminPlans;
  if (filterType.value)                  list = list.filter((p) => p.planType === filterType.value);
  if (filterActive.value === "active")   list = list.filter((p) => p.isActive);
  if (filterActive.value === "inactive") list = list.filter((p) => !p.isActive);
  return list;
});

// ── Tier visuals
const TIER_STYLES = {
  free:            { iconBg: "bg-cb-field",      icon: "fa-solid fa-gift text-cb-muted"       },
  basic:           { iconBg: "bg-blue-500/10",   icon: "fa-solid fa-bolt text-blue-400"       },
  pro:             { iconBg: "bg-cb-accent/10",  icon: "fa-solid fa-rocket text-cb-accent"    },
  elite:           { iconBg: "bg-yellow-500/10", icon: "fa-solid fa-crown text-yellow-400"    },
  corporate_free:  { iconBg: "bg-cb-field",      icon: "fa-solid fa-building text-cb-muted"   },
  corporate_pro:   { iconBg: "bg-purple-500/10", icon: "fa-solid fa-building text-purple-400" },
  corporate_elite: { iconBg: "bg-teal-500/10",   icon: "fa-solid fa-gem text-teal-400"        },
};
const tierIconBg = (t) => TIER_STYLES[t?.toLowerCase()]?.iconBg ?? "bg-cb-field";
const tierIcon   = (t) => TIER_STYLES[t?.toLowerCase()]?.icon   ?? "fa-solid fa-star text-cb-muted";

const formatPrice = (v) => (!v ? "Free" : `₦${Number(v).toLocaleString()}`);

// ── Actions
async function handleToggle(plan) {
  const wasActive = plan.isActive;
  try {
    await subStore.togglePlanStatus(plan._id);
    toast.success(wasActive ? `${plan.nameLabel} disabled` : `${plan.nameLabel} enabled`);
  } catch (err) {
    toast.error(err?.response?.data?.message || "Toggle failed");
  }
}

function confirmDelete(plan) {
  deletingPlan.value  = plan;
  showDeleteModal.value = true;
}

async function handleDelete() {
  try {
    await subStore.deletePlan(deletingPlan.value._id);
    toast.success(`${deletingPlan.value.nameLabel} deleted`);
    showDeleteModal.value = false;
    deletingPlan.value    = null;
  } catch (err) {
    toast.error(err?.response?.data?.message || "Delete failed");
  }
}

async function loadPage(page) {
  currentPage.value = page;
  await subStore.fetchAdminPlans({ page, limit: 20 });
}

onMounted(() => subStore.fetchAdminPlans());
</script>

<style scoped>
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.22s ease; }
.overlay-enter-from, .overlay-leave-to       { opacity: 0; }

.list-enter-active { transition: all 0.2s ease; }
.list-leave-active { transition: all 0.15s ease; }
.list-enter-from   { opacity: 0; transform: translateY(-6px); }
.list-leave-to     { opacity: 0; transform: translateY(4px); }
</style>