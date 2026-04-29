<template>
  <div class="min-h-screen bg-cb-base">
    <div class="border-b border-cb-divider bg-cb-base py-5">
      <h1 class="text-xl font-bold text-cb-text">Verifications</h1>
      <p class="text-sm text-cb-muted">{{ adminStore.verificationsMeta.total }} total submissions</p>

      <div class="mt-4 flex flex-wrap items-center gap-2 ">
        <div class="relative min-w-0 flex-1 bg-cb-field rounded-xl">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-cb-muted" />
          <input v-model="search" type="text" placeholder="Search name or email…"
            class="h-10 w-full rounded-xl border border-cb-divider bg-cb-card pl-9 pr-4 text-sm text-cb-text placeholder:text-cb-muted/60 focus:border-cb-accent/50 focus:outline-none" />
        </div>

        <DropDownComponent ref="statusDrop" label="Status" :min-width="140"
        bgClass="bg-cb-field"
        >
          <div class="p-1.5">
            <button v-for="s in statusOpts" :key="s.value"
              class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-cb-field"
              :class="filterStatus === s.value ? 'text-cb-accent font-semibold' : 'text-cb-text'"
              @click="filterStatus = s.value; statusDrop.close()">
              {{ s.label }}
              <i v-if="filterStatus === s.value" class="fa-solid fa-check ml-auto text-xs text-cb-accent" />
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
      <!-- Loading -->
      <div v-if="adminStore.verificationsLoading && !adminStore.verifications.length" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-20 animate-pulse rounded-2xl bg-cb-card" />
      </div>

      <!-- Error -->
      <div v-else-if="fetchError" class="flex flex-col items-center gap-3 py-20 text-center">
        <i class="fa-solid fa-circle-exclamation text-4xl text-cb-negative/40" />
        <p class="font-semibold text-cb-text">Failed to load verifications</p>
        <p class="text-sm text-cb-muted">{{ fetchError }}</p>
        <button class="mt-2 rounded-xl bg-cb-accent px-5 py-2 text-sm font-bold text-white" @click="load">
          <i class="fa-solid fa-rotate-right mr-2" />Retry
        </button>
      </div>

      <!-- Empty -->
      <div v-else-if="!filtered.length" class="flex flex-col items-center gap-3 py-20 text-center">
        <i class="fa-solid fa-id-card text-4xl text-cb-muted/30" />
        <p class="font-semibold text-cb-text">No verifications found</p>
      </div>

      <!-- List -->
      <div v-else class="space-y-3">
        <router-link
          v-for="v in filtered" :key="v._id"
          :to="`/admin/verifications/${v._id}`"
          class="flex items-center gap-4 rounded-2xl border bg-cb-card p-4 transition-all hover:shadow-sm"
          :class="v.aiFlaggedForReview ? 'border-amber-500/40' : 'border-cb-divider hover:border-cb-accent/30'"
        >
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base"
            :class="statusIconBg(v.status)">
            <i :class="statusIcon(v.status)" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-sm font-semibold text-cb-text">{{ v.userId?.firstName }} {{ v.userId?.lastName }}</p>
              <span class="rounded-full px-2 py-0.5 text-[10px] font-bold" :class="roleClass(v.userId?.role)">{{ v.userId?.role }}</span>
              <span v-if="v.aiFlaggedForReview" class="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                <i class="fa-solid fa-robot mr-1 text-[8px]" />AI Flagged
              </span>
            </div>
            <p class="text-xs text-cb-muted">{{ v.userId?.email }}</p>
            <p class="mt-0.5 text-xs text-cb-muted">{{ docTypeLabel(v.docType) }} · Submitted {{ fmtDate(v.submittedAt) }}</p>
          </div>

          <div class="flex shrink-0 flex-col items-end gap-1.5">
            <span class="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" :class="statusBadge(v.status)">{{ v.status }}</span>
            <i class="fa-solid fa-chevron-right text-xs text-cb-muted/40" />
          </div>
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
const fetchError   = ref("");
const statusDrop   = ref(null);

async function load() {
  fetchError.value = "";
  try {
    await adminStore.fetchVerifications();
  } catch (e) {
    fetchError.value = e?.response?.data?.message || e?.message || "Something went wrong. Please retry.";
  }
}

onMounted(load);

const statusOpts = [
  { value: "",         label: "All" },
  { value: "pending",  label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

const filtered = computed(() => {
  let list = adminStore.verifications;
  const q = search.value.toLowerCase();
  if (q) list = list.filter((v) =>
    `${v.userId?.firstName} ${v.userId?.lastName}`.toLowerCase().includes(q) ||
    v.userId?.email?.toLowerCase().includes(q)
  );
  if (filterStatus.value) list = list.filter((v) => v.status === filterStatus.value);
  return list;
});

const docTypeLabel = (t) => ({ national_id: "National ID", passport: "Passport", drivers_license: "Driver's License" }[t] ?? t);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "2-digit" }) : "—";

const roleClass = (r) => ({ student: "bg-blue-500/10 text-blue-500", professional: "bg-purple-500/10 text-purple-500", corporate: "bg-amber-500/10 text-amber-600" }[r] ?? "bg-cb-field text-cb-muted");

const statusBadge = (s) => ({
  pending:  "bg-amber-500/12 text-amber-600",
  verified: "bg-cb-positive/12 text-cb-positive",
  rejected: "bg-cb-negative/12 text-cb-negative",
}[s] ?? "bg-cb-field text-cb-muted");

const statusIconBg = (s) => ({
  pending:  "bg-amber-500/10 text-amber-500",
  verified: "bg-cb-positive/10 text-cb-positive",
  rejected: "bg-cb-negative/10 text-cb-negative",
}[s] ?? "bg-cb-field text-cb-muted");

const statusIcon = (s) => ({
  pending:  "fa-solid fa-clock",
  verified: "fa-solid fa-shield-check",
  rejected: "fa-solid fa-shield-xmark",
}[s] ?? "fa-solid fa-id-card");

</script>