<template>
  <div class="min-h-screen bg-cb-base">

    <!-- Header -->
    <div class="border-b border-cb-divider bg-cb-base  py-5 ">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-cb-text">Users</h1>
          <p class="text-sm text-cb-muted">{{ adminStore.usersMeta.total }} total members</p>
        </div>
      </div>

      <!-- Search + Filters -->
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <div class="relative min-w-0 flex-1">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-cb-muted" />
          <input
            v-model="search"
            type="text"
            placeholder="Search name or email…"
            class="h-10 w-full rounded-xl border border-cb-divider bg-cb-card pl-9 pr-4 text-sm text-cb-text placeholder:text-cb-muted/60 focus:border-cb-accent/50 focus:outline-none focus:ring-2 focus:ring-cb-accent/20"
          />
        </div>

        <DropDownComponent label="Role" :min-width="140">
          <div class="p-1.5">
            <button v-for="r in roles" :key="r.value"
              class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-cb-field"
              :class="filterRole === r.value ? 'text-cb-accent font-semibold' : 'text-cb-text'"
              @click="filterRole = r.value">
              <i :class="[r.icon, 'text-xs w-4']" />{{ r.label }}
              <i v-if="filterRole === r.value" class="fa-solid fa-check ml-auto text-xs text-cb-accent" />
            </button>
          </div>
        </DropDownComponent>

        <DropDownComponent label="Status" :min-width="140">
          <div class="p-1.5">
            <button v-for="s in statuses" :key="s.value"
              class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-cb-field"
              :class="filterStatus === s.value ? 'text-cb-accent font-semibold' : 'text-cb-text'"
              @click="filterStatus = s.value">
              {{ s.label }}
              <i v-if="filterStatus === s.value" class="fa-solid fa-check ml-auto text-xs text-cb-accent" />
            </button>
          </div>
        </DropDownComponent>

        <button v-if="hasFilters"
          class="flex items-center gap-1.5 rounded-xl border border-cb-divider px-3 py-2 text-xs font-semibold text-cb-muted transition-all hover:text-cb-negative"
          @click="clearFilters">
          <i class="fa-solid fa-xmark" />Clear
        </button>
      </div>
    </div>

    <!-- Body -->
    <div class="mx-auto max-w-7xl  py-6 ">

      <!-- Loading skeleton -->
      <div v-if="adminStore.usersLoading && !adminStore.users.length" class="space-y-3">
        <div v-for="i in 6" :key="i" class="h-16 animate-pulse rounded-2xl bg-cb-card"
          :style="`animation-delay:${i*50}ms`" />
      </div>

      <!-- Error -->
      <div v-else-if="adminStore.error && !adminStore.users.length"
        class="flex flex-col items-center gap-3 rounded-2xl border border-cb-negative/20 bg-cb-negative/5 py-14 text-center">
        <i class="fa-solid fa-circle-exclamation text-3xl text-cb-negative" />
        <p class="font-semibold text-cb-text">Failed to load users</p>
        <button class="rounded-xl bg-cb-accent px-4 py-2 text-sm font-bold text-white hover:brightness-110"
          @click="load">Retry</button>
      </div>

      <!-- Empty -->
      <div v-else-if="!filteredUsers.length"
        class="flex flex-col items-center gap-3 py-20 text-center">
        <i class="fa-solid fa-users text-4xl text-cb-muted/30" />
        <p class="font-semibold text-cb-text">No users found</p>
        <p class="text-sm text-cb-muted">Try adjusting your search or filters</p>
      </div>

      <!-- Mobile cards -->
      <div class="space-y-3 lg:hidden">
        <router-link
          v-for="u in filteredUsers" :key="u._id"
          :to="`/admin/users/${u._id}`"
          class="flex items-center gap-3 rounded-2xl border border-cb-divider bg-cb-card p-4 transition-all hover:border-cb-accent/30 hover:shadow-sm"
        >
          <!-- Avatar -->
          <div class="relative shrink-0">
            <img v-if="u.avatar" :src="u.avatar" :alt="u.displayName"
              class="h-10 w-10 rounded-xl object-cover" />
            <div v-else class="flex h-10 w-10 items-center justify-center rounded-xl bg-cb-field text-sm font-bold text-cb-muted">
              {{ initials(u) }}
            </div>
            <span v-if="u.isSuspended"
              class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-cb-negative text-[8px] text-white">
              <i class="fa-solid fa-ban" />
            </span>
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <p class="truncate text-sm font-semibold text-cb-text">{{ u.displayName }}</p>
              <span class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" :class="roleClass(u.role)">
                {{ u.role }}
              </span>
            </div>
            <p class="truncate text-xs text-cb-muted">{{ u.email }}</p>
            <div class="mt-1 flex items-center gap-2">
              <span class="text-[10px] text-cb-muted">{{ u.subscriptionTier }}</span>
              <span class="text-[10px] text-cb-muted/50">·</span>
              <span class="text-[10px]" :class="u.identityVerificationStatus === 'verified' ? 'text-cb-positive' : u.identityVerificationStatus === 'pending' ? 'text-amber-500' : 'text-cb-muted'">
                {{ u.identityVerificationStatus }}
              </span>
            </div>
          </div>
          <i class="fa-solid fa-chevron-right shrink-0 text-xs text-cb-muted/40" />
        </router-link>
      </div>

      <!-- Desktop table -->
      <div class="hidden overflow-hidden rounded-2xl border border-cb-divider bg-cb-card lg:block">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-cb-divider bg-cb-field/50">
              <th class="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-cb-muted">User</th>
              <th class="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-cb-muted">Role</th>
              <th class="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-cb-muted">Subscription</th>
              <th class="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-cb-muted">Verification</th>
              <th class="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-cb-muted">Status</th>
              <th class="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-cb-muted">Joined</th>
              <th class="px-4 py-3.5" />
            </tr>
          </thead>
          <tbody class="divide-y divide-cb-divider/60">
            <tr v-for="u in filteredUsers" :key="u._id"
              class="transition-colors hover:bg-cb-field/40 cursor-pointer"
              @click="$router.push(`/admin/users/${u._id}`)">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <img v-if="u.avatar" :src="u.avatar" class="h-8 w-8 rounded-lg object-cover" />
                  <div v-else class="flex h-8 w-8 items-center justify-center rounded-lg bg-cb-field text-xs font-bold text-cb-muted">
                    {{ initials(u) }}
                  </div>
                  <div class="min-w-0">
                    <p class="truncate font-semibold text-cb-text">{{ u.displayName }}</p>
                    <p class="truncate text-xs text-cb-muted">{{ u.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <span class="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" :class="roleClass(u.role)">{{ u.role }}</span>
              </td>
              <td class="px-4 py-3.5 text-xs font-medium capitalize text-cb-text">{{ u.subscriptionTier }}</td>
              <td class="px-4 py-3.5">
                <span class="rounded-full px-2.5 py-0.5 text-[10px] font-bold" :class="verifClass(u.identityVerificationStatus)">
                  {{ u.identityVerificationStatus }}
                </span>
              </td>
              <td class="px-4 py-3.5">
                <span v-if="u.isSuspended" class="inline-flex items-center gap-1 rounded-full bg-cb-negative/12 px-2.5 py-0.5 text-[10px] font-bold text-cb-negative">
                  <i class="fa-solid fa-ban text-[8px]" />Suspended
                </span>
                <span v-else class="inline-flex items-center gap-1 rounded-full bg-cb-positive/12 px-2.5 py-0.5 text-[10px] font-bold text-cb-positive">
                  <i class="fa-solid fa-circle text-[6px]" />Active
                </span>
              </td>
              <td class="px-4 py-3.5 text-xs text-cb-muted">{{ fmtDate(u.createdAt) }}</td>
              <td class="px-4 py-3.5">
                <i class="fa-solid fa-chevron-right text-xs text-cb-muted/40" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="adminStore.usersMeta.totalPages > 1" class="mt-4 flex items-center justify-center gap-2">
        <button class="rounded-xl border border-cb-divider px-4 py-2 text-sm font-semibold text-cb-muted transition-all hover:border-cb-accent/30 hover:text-cb-text disabled:opacity-40"
          :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
          <i class="fa-solid fa-chevron-left text-xs" />
        </button>
        <span class="text-sm text-cb-muted">{{ currentPage }} / {{ adminStore.usersMeta.totalPages }}</span>
        <button class="rounded-xl border border-cb-divider px-4 py-2 text-sm font-semibold text-cb-muted transition-all hover:border-cb-accent/30 hover:text-cb-text disabled:opacity-40"
          :disabled="!adminStore.usersMeta.hasNextPage" @click="changePage(currentPage + 1)">
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

const adminStore = useAdminStore();
const search      = ref("");
const filterRole  = ref("");
const filterStatus = ref("");
const currentPage = ref(1);

const roles = [
  { value: "",            label: "All Roles",    icon: "fa-solid fa-users" },
  { value: "student",     label: "Student",      icon: "fa-solid fa-graduation-cap" },
  { value: "professional",label: "Professional", icon: "fa-solid fa-briefcase" },
  { value: "corporate",   label: "Corporate",    icon: "fa-solid fa-building" },
  { value: "admin",       label: "Admin",        icon: "fa-solid fa-shield" },
];

const statuses = [
  { value: "",           label: "All Status" },
  { value: "active",     label: "Active" },
  { value: "suspended",  label: "Suspended" },
  { value: "verified",   label: "ID Verified" },
];

const hasFilters = computed(() => search.value || filterRole.value || filterStatus.value);

const filteredUsers = computed(() => {
  let list = adminStore.users;
  const q = search.value.toLowerCase().trim();
  if (q) list = list.filter((u) =>
    u.displayName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
  );
  if (filterRole.value) list = list.filter((u) => u.role === filterRole.value);
  if (filterStatus.value === "active")    list = list.filter((u) => !u.isSuspended);
  if (filterStatus.value === "suspended") list = list.filter((u) => u.isSuspended);
  if (filterStatus.value === "verified")  list = list.filter((u) => u.identityVerificationStatus === "verified");
  return list;
});

function clearFilters() { search.value = ""; filterRole.value = ""; filterStatus.value = ""; }

const initials = (u) => `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase();
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "2-digit" }) : "—";

const roleClass = (r) => ({
  student:      "bg-blue-500/10 text-blue-500",
  professional: "bg-purple-500/10 text-purple-500",
  corporate:    "bg-amber-500/10 text-amber-600",
  admin:        "bg-cb-negative/10 text-cb-negative",
}[r] ?? "bg-cb-field text-cb-muted");

const verifClass = (s) => ({
  verified:   "bg-cb-positive/10 text-cb-positive",
  pending:    "bg-amber-500/10 text-amber-600",
  unverified: "bg-cb-muted/10 text-cb-muted",
  rejected:   "bg-cb-negative/10 text-cb-negative",
}[s] ?? "bg-cb-field text-cb-muted");

async function load(page = 1) {
  currentPage.value = page;
  await adminStore.fetchUsers({ page, limit: 20 });
}

function changePage(p) { load(p); }

onMounted(() => load());
</script>