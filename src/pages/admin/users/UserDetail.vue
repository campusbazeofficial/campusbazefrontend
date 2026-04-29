<template>
  <div class="min-h-screen bg-cb-base">

    <!-- Header -->
    <div class="border-b border-cb-divider bg-cb-base  py-5 ">
      <div class="flex items-center gap-3">
        <button class="flex h-9 w-9 items-center justify-center rounded-xl border border-cb-divider bg-cb-card text-cb-muted transition-all hover:border-cb-accent/30 hover:text-cb-text active:scale-95"
          @click="$router.back()">
          <i class="fa-solid fa-arrow-left text-sm" />
        </button>
        <div>
          <h1 class="text-xl font-bold text-cb-text">User Detail</h1>
          <p class="text-sm text-cb-muted">Full account information</p>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl space-y-4  py-6">

      <!-- Loading -->
      <template v-if="adminStore.selectedUserLoading">
        <div v-for="i in 3" :key="i" class="animate-pulse rounded-2xl bg-cb-card" :style="`height:${i===1?180:120}px`" />
      </template>

      <!-- Error -->
      <div v-else-if="!user" class="flex flex-col items-center gap-3 py-20 text-center">
        <i class="fa-solid fa-circle-exclamation text-3xl text-cb-negative" />
        <p class="text-cb-text font-semibold">User not found</p>
        <button class="rounded-xl bg-cb-accent px-4 py-2 text-sm font-bold text-white" @click="load">Retry</button>
      </div>

      <template v-else>

        <!-- Profile card -->
        <div class="overflow-hidden rounded-2xl border bg-cb-card" :class="user.isSuspended ? 'border-cb-negative/30' : 'border-cb-divider'">
          <div class="h-[3px]" :class="user.isSuspended ? 'bg-cb-negative' : 'bg-cb-accent'" />
          <div class="p-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div class="relative shrink-0">
                <img v-if="user.avatar" :src="user.avatar" class="h-16 w-16 rounded-2xl object-cover" />
                <div v-else class="flex h-16 w-16 items-center justify-center rounded-2xl bg-cb-field text-xl font-bold text-cb-muted">
                  {{ initials }}
                </div>
                <span v-if="user.identityVerificationBadge"
                  class="absolute -right-1.5 -bottom-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-cb-positive text-[9px] text-white">
                  <i class="fa-solid fa-check" />
                </span>
              </div>

              <div class="flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h2 class="text-lg font-bold text-cb-text">{{ user.displayName }}</h2>
                  <span class="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" :class="roleClass">{{ user.role }}</span>
                  <span v-if="user.isSuspended" class="rounded-full bg-cb-negative/12 px-2.5 py-0.5 text-[10px] font-bold text-cb-negative">Suspended</span>
                </div>
                <p class="mt-0.5 text-sm text-cb-muted">{{ user.email }}</p>
                <p v-if="user.phone" class="text-sm text-cb-muted">{{ user.phone }}</p>
                <p v-if="user.bio" class="mt-2 text-sm text-cb-muted line-clamp-2">{{ user.bio }}</p>
              </div>

              <!-- Actions -->
              <div class="flex shrink-0 gap-2 sm:flex-col sm:items-end">
                <button
                  class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
                  :class="user.isSuspended ? 'bg-cb-positive/10 text-cb-positive hover:bg-cb-positive/20' : 'bg-cb-negative/10 text-cb-negative hover:bg-cb-negative/20'"
                  :disabled="adminStore.userActionLoading"
                  @click="showSuspendModal = true">
                  <i :class="user.isSuspended ? 'fa-solid fa-lock-open' : 'fa-solid fa-ban'" class="text-xs" />
                  {{ user.isSuspended ? 'Unsuspend' : 'Suspend' }}
                </button>
                <button
                  class="flex items-center gap-2 rounded-xl bg-cb-accent/10 px-4 py-2 text-sm font-semibold text-cb-accent transition-all hover:bg-cb-accent/20 active:scale-95"
                  @click="showCbcModal = true">
                  <i class="fa-solid fa-coins text-xs" />Credit CBC
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats row -->
        <div class="grid grid-cols-3 gap-3">
          <div class="rounded-2xl border border-cb-divider bg-cb-card p-4 text-center">
            <p class="text-2xl font-black text-cb-text">{{ user.totalOrdersCompleted }}</p>
            <p class="text-[10px] font-bold uppercase tracking-wide text-cb-muted">Orders</p>
          </div>
          <div class="rounded-2xl border border-cb-divider bg-cb-card p-4 text-center">
            <p class="text-2xl font-black text-cb-text">{{ user.averageRating?.toFixed(1) }}</p>
            <p class="text-[10px] font-bold uppercase tracking-wide text-cb-muted">Rating</p>
          </div>
          <div class="rounded-2xl border border-cb-divider bg-cb-card p-4 text-center">
            <p class="text-2xl font-black text-cb-text">{{ user.totalReviews }}</p>
            <p class="text-[10px] font-bold uppercase tracking-wide text-cb-muted">Reviews</p>
          </div>
        </div>

        <!-- Account details -->
        <div class="rounded-2xl border border-cb-divider bg-cb-card">
          <div class="border-b border-cb-divider px-5 py-4">
            <h3 class="text-xs font-bold uppercase tracking-widest text-cb-muted">Account Details</h3>
          </div>
          <div class="divide-y divide-cb-divider/60">
            <div v-for="row in accountRows" :key="row.label" class="flex items-center justify-between px-5 py-3.5">
              <span class="text-sm text-cb-muted">{{ row.label }}</span>
              <span class="text-sm font-semibold" :class="row.class ?? 'text-cb-text'">{{ row.value }}</span>
            </div>
          </div>
        </div>

        <!-- Company info (corporate only) -->
        <div v-if="adminStore.selectedUser?.company" class="rounded-2xl border border-cb-divider bg-cb-card p-5">
          <h3 class="mb-3 text-xs font-bold uppercase tracking-widest text-cb-muted">Company</h3>
          <p class="font-semibold text-cb-text">{{ adminStore.selectedUser.company?.name }}</p>
        </div>

      </template>
    </div>

    <!-- Suspend Modal -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="showSuspendModal"
          class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
          @click.self="showSuspendModal = false">
          <div class="w-full max-w-sm overflow-hidden rounded-t-3xl bg-cb-card sm:rounded-2xl" @click.stop>
            <div class="h-1" :class="user?.isSuspended ? 'bg-cb-positive' : 'bg-cb-negative'" />
            <div class="p-6">
              <h2 class="mb-1 text-lg font-bold text-cb-text">
                {{ user?.isSuspended ? 'Unsuspend User?' : 'Suspend User?' }}
              </h2>
              <p class="text-sm text-cb-muted">
                {{ user?.isSuspended ? 'This will restore access to their account.' : 'This will block access to all platform features.' }}
              </p>
              <textarea v-if="!user?.isSuspended" v-model="suspendReason" placeholder="Reason for suspension…"
                class="mt-4 w-full resize-none rounded-xl border border-cb-divider bg-cb-field px-4 py-3 text-sm text-cb-text placeholder:text-cb-muted/50 focus:border-cb-accent/50 focus:outline-none focus:ring-2 focus:ring-cb-accent/20"
                rows="3" />
              <div class="mt-5 flex gap-3">
                <button class="flex-1 rounded-xl border border-cb-divider py-3 text-sm font-semibold text-cb-muted hover:text-cb-text"
                  @click="showSuspendModal = false">Cancel</button>
                <button
                  class="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60"
                  :class="user?.isSuspended ? 'bg-cb-positive' : 'bg-cb-negative'"
                  :disabled="adminStore.userActionLoading" @click="handleSuspend">
                  <svg v-if="adminStore.userActionLoading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {{ user?.isSuspended ? 'Yes, Unsuspend' : 'Yes, Suspend' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- CBC Credit Modal -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="showCbcModal"
          class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
          @click.self="showCbcModal = false">
          <div class="w-full max-w-sm overflow-hidden rounded-t-3xl bg-cb-card sm:rounded-2xl" @click.stop>
            <div class="h-1 bg-cb-accent" />
            <div class="p-6">
              <div class="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cb-accent/10">
                <i class="fa-solid fa-coins text-cb-accent" />
              </div>
              <h2 class="mb-1 text-lg font-bold text-cb-text">Credit CBC</h2>
              <p class="text-sm text-cb-muted">Manually add CBC tokens to {{ user?.displayName }}'s wallet</p>
              <div class="mt-4 space-y-3">
                <div>
                  <label class="mb-1.5 block text-xs font-semibold text-cb-muted uppercase tracking-wide">Amount</label>
                  <input v-model.number="cbcAmount" type="number" min="1" placeholder="e.g. 100"
                    class="w-full rounded-xl border border-cb-divider bg-cb-field px-4 py-2.5 text-sm text-cb-text focus:border-cb-accent/50 focus:outline-none focus:ring-2 focus:ring-cb-accent/20" />
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-semibold text-cb-muted uppercase tracking-wide">Note</label>
                  <input v-model="cbcNote" type="text" placeholder="Reason for credit…"
                    class="w-full rounded-xl border border-cb-divider bg-cb-field px-4 py-2.5 text-sm text-cb-text focus:border-cb-accent/50 focus:outline-none focus:ring-2 focus:ring-cb-accent/20" />
                </div>
              </div>
              <div class="mt-5 flex gap-3">
                <button class="flex-1 rounded-xl border border-cb-divider py-3 text-sm font-semibold text-cb-muted" @click="showCbcModal = false">Cancel</button>
                <button class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-bold text-white disabled:opacity-60"
                  :disabled="!cbcAmount || adminStore.cbcCreditLoading" @click="handleCbcCredit">
                  <svg v-if="adminStore.cbcCreditLoading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Credit {{ cbcAmount || 0 }} CBC
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

const showSuspendModal = ref(false);
const suspendReason    = ref("");
const showCbcModal     = ref(false);
const cbcAmount        = ref(null);
const cbcNote          = ref("");

const user = computed(() => adminStore.selectedUser?.user ?? null);

const initials  = computed(() => `${user.value?.firstName?.[0] ?? ""}${user.value?.lastName?.[0] ?? ""}`.toUpperCase());
const roleClass = computed(() => ({
  student:      "bg-blue-500/10 text-blue-500",
  professional: "bg-purple-500/10 text-purple-500",
  corporate:    "bg-amber-500/10 text-amber-600",
  admin:        "bg-cb-negative/10 text-cb-negative",
}[user.value?.role] ?? "bg-cb-field text-cb-muted"));

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "—";

const accountRows = computed(() => {
  const u = user.value;
  if (!u) return [];
  return [
    { label: "Email verified",  value: u.isEmailVerified ? "Yes" : "No", class: u.isEmailVerified ? "text-cb-positive" : "text-cb-negative" },
    { label: "Phone verified",  value: u.isPhoneVerified ? "Yes" : "No", class: u.isPhoneVerified ? "text-cb-positive" : "text-cb-muted"    },
    { label: "ID Verification", value: u.identityVerificationStatus },
    { label: "Subscription",    value: u.subscriptionTier },
    { label: "Institution",     value: u.institutionName ?? "—" },
    { label: "Referral Code",   value: u.referralCode ?? "—" },
    { label: "Last Seen",       value: fmtDate(u.lastSeen) },
    { label: "Member Since",    value: fmtDate(u.createdAt) },
  ];
});

async function handleSuspend() {
  try {
    await adminStore.toggleUserSuspension(user.value._id, { reason: suspendReason.value });
    toast.success(user.value.isSuspended ? "User unsuspended" : "User suspended");
    showSuspendModal.value = false;
    suspendReason.value    = "";
  } catch (err) {
    toast.error(err?.response?.data?.message || "Action failed");
  }
}

async function handleCbcCredit() {
  try {
    await adminStore.creditCBC({ userId: user.value._id, amount: cbcAmount.value, note: cbcNote.value });
    toast.success(`${cbcAmount.value} CBC credited successfully`);
    showCbcModal.value = false;
    cbcAmount.value    = null;
    cbcNote.value      = "";
  } catch (err) {
    toast.error(err?.response?.data?.message || "CBC credit failed");
  }
}

async function load() {
  await adminStore.fetchUser(route.params.id);
}

onMounted(load);
</script>

<style scoped>
.overlay-enter-active,.overlay-leave-active{transition:opacity 0.22s ease}
.overlay-enter-from,.overlay-leave-to{opacity:0}
</style>