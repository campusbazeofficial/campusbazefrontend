<!-- src/layouts/dashboard/Header.vue -->
<template>
  <header
    class="h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 bg-(--color-cb-card) border-b border-(--color-cb-divider) gap-3"
  >
    <!-- ── Left ── -->
    <div class="flex items-center gap-3 min-w-0">

      <!-- Back/close button — only on mobile when search is open -->
      <button
        v-if="searchOpen"
        @click="searchOpen = false"
        aria-label="Close search"
        class="flex sm:hidden items-center justify-center w-9 h-9 shrink-0 rounded-xl border border-(--color-cb-divider) bg-(--color-cb-base) text-(--color-cb-muted) hover:bg-(--color-cb-field) hover:text-(--color-cb-text) transition-all duration-150"
      >
        <i class="fa-solid fa-arrow-left text-sm"></i>
      </button>

      <!-- Page title — hidden on mobile while search is open to free up space -->
      <div class="min-w-0" :class="searchOpen ? 'hidden sm:block' : ''">
        <h1
          class="text-[0.95rem] font-bold text-(--color-cb-text) m-0 truncate tracking-tight leading-tight"
        >
          {{ pageTitle }}
        </h1>
        <p
          class="hidden sm:flex items-center gap-1.5 text-[0.7rem] text-(--color-cb-muted) m-0 mt-px leading-none"
        >
          <span
            class="w-1.5 h-1.5 rounded-full bg-(--color-cb-accent) shrink-0 inline-block"
          ></span>
          {{ formattedDate }}
        </p>
      </div>
    </div>

    <!-- ── Right ── -->
    <div class="flex items-center gap-1.5 shrink-0">

      <!-- ── Wallet balances — hidden for admins ── -->
      <router-link
        v-if="!isAdmin"
        to="/user/wallet"
        class="hidden sm:flex items-center gap-2 rounded-xl border border-(--color-cb-divider) bg-(--color-cb-base) px-3 h-9 text-xs no-underline transition-all duration-150 hover:border-(--color-cb-accent)/40 hover:bg-(--color-cb-accent-subtle)"
        title="Go to Wallet"
      >
        <template v-if="walletStore.balanceLoading">
          <i class="fa-solid fa-spinner fa-spin text-[11px] text-(--color-cb-muted)"></i>
          <span class="text-(--color-cb-muted)">Loading…</span>
        </template>
        <template v-else>
          <span class="flex items-center gap-1">
            <i class="fa-solid fa-coins text-[10px] text-(--color-cb-accent)"></i>
            <span class="font-semibold text-(--color-cb-text) tabular-nums">{{ walletStore.cbcBalance ?? 0 }}</span>
            <span class="text-(--color-cb-muted)">CBC</span>
          </span>
          <span class="w-px h-4 bg-(--color-cb-divider)"></span>
          <span class="flex items-center gap-1">
            <span class="font-semibold text-(--color-cb-text) tabular-nums">Earnings: {{ formatNGN(walletStore.ngnEarnings ?? 0) }}</span>
          </span>
        </template>
      </router-link>

      <!-- ── Search — hidden for admins ── -->
      <button
        v-if="!isAdmin"
        @click="searchOpen = true"
        aria-label="Search users"
        class="flex items-center justify-center w-9 h-9 rounded-xl border border-(--color-cb-divider) bg-(--color-cb-base) text-(--color-cb-muted) hover:bg-(--color-cb-field) hover:text-(--color-cb-text) transition-all duration-150"
      >
        <i class="fa-solid fa-magnifying-glass text-[0.875rem]"></i>
      </button>

      <!-- ── Notification bell — hidden on mobile (bottom nav handles it), hidden for admins ── -->
      <div v-if="!isAdmin" class="relative hidden md:block">
        <router-link
          to="/user/notifications"
          aria-label="Notifications"
          :class="[
            'relative flex items-center justify-center w-9 h-9 rounded-xl border cursor-pointer transition-all duration-150',
            notificationStore.hasUnread
              ? 'border-(--color-cb-accent)/40 text-(--color-cb-accent) bg-(--color-cb-accent-subtle)'
              : 'border-(--color-cb-divider) text-(--color-cb-muted) bg-(--color-cb-base) hover:bg-(--color-cb-field) hover:text-(--color-cb-text)',
          ]"
        >
          <i
            class="fa-regular fa-bell text-[0.875rem]"
            :class="{ 'bell-ring': notificationStore.hasUnread }"
          ></i>

          <span
            v-if="notificationStore.unreadCount > 0"
            class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-(--color-cb-negative) text-white text-[0.58rem] font-bold flex items-center justify-center border-2 border-(--color-cb-card) z-10 tabular-nums"
          >
            {{ notificationStore.unreadCount > 9 ? "9+" : notificationStore.unreadCount }}
          </span>

          <span
            v-if="notificationStore.hasUnread"
            class="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-(--color-cb-negative)/40 pulse-ring pointer-events-none"
          ></span>
        </router-link>
      </div>

      <!-- Theme toggle — hidden on mobile when search is open to avoid crowding -->
      <button
        @click="toggleTheme"
        :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
        class="flex items-center justify-center w-9 h-9 rounded-xl border cursor-pointer border-(--color-cb-divider) bg-(--color-cb-base) text-(--color-cb-muted) hover:bg-(--color-cb-field) hover:text-(--color-cb-text) transition-all duration-150"
        :class="searchOpen ? 'hidden sm:flex' : ''"
      >
        <Transition name="icon-swap" mode="out-in">
          <i
            v-if="theme === 'dark'"
            class="fa-solid fa-sun text-sm"
            key="sun"
          ></i>
          <i v-else class="fa-solid fa-moon text-sm" key="moon"></i>
        </Transition>
      </button>

      <!-- Avatar — hidden for admins, hidden on mobile when search is open ── -->
      <router-link
        v-if="!isAdmin"
        to="/user/profile"
        :title="userStore.fullName || 'Profile'"
        class="relative flex items-center justify-center w-9 h-9 rounded-full bg-(--color-cb-accent) text-white text-[0.78rem] font-bold overflow-hidden shrink-0 no-underline cursor-pointer hover:opacity-85 transition-opacity duration-150"
        :class="searchOpen ? 'hidden sm:flex' : ''"
      >
        <img
          v-if="avatarSrc"
          :src="avatarSrc"
          alt="Profile"
          class="w-full h-full object-cover"
        />
        <span v-else>{{ userInitials }}</span>
      </router-link>
    </div>
  </header>

  <!-- User search modal — only mounted for non-admins -->
  <UserSearchModal v-if="!isAdmin" v-model="searchOpen" />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useWalletStore } from "@/stores/walletStore";
import { useTheme } from "@/composables/Usetheme";
import UserSearchModal from "@/components/search/UserSearchModal.vue";

const props = defineProps({
  pageTitle: { type: String, default: "Dashboard" },
});
defineEmits(["toggle-mobile", "logout"]);

const authStore         = useAuthStore();
const userStore         = useUserStore();
const notificationStore = useNotificationStore();
const walletStore       = useWalletStore();
const { theme, toggleTheme } = useTheme();

const searchOpen = ref(false);

// Hide wallet, search, and avatar for admin users
const isAdmin = computed(() => authStore.userRole === "admin");

function formatNGN(amount) {
  if (!amount) return "₦0";
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000)     return `₦${(amount / 1_000).toFixed(1)}k`;
  return `₦${amount.toLocaleString()}`;
}

const avatarSrc = computed(() => {
  const a = userStore.user?.avatar;
  if (!a) return null;
  return typeof a === "string" ? a : a?.url || null;
});

const userInitials = computed(() => {
  const name = userStore.fullName;
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

const formattedDate = computed(() =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }),
);

watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (isAuth) {
      if (!isAdmin.value) {
        notificationStore.fetchUnreadCount();
        notificationStore.startPolling(45000);
        walletStore.fetchBalance();
      }
    } else {
      notificationStore.stopPolling();
      notificationStore.clearNotifications();
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (authStore.isAuthenticated && !isAdmin.value) {
    notificationStore.fetchUnreadCount();
    walletStore.fetchBalance();
  }
});

onUnmounted(() => {
  notificationStore.stopPolling();
});
</script>

<style scoped>
/* Bell swing */
.bell-ring {
  animation: bell-sway 3.5s ease-in-out infinite;
}
@keyframes bell-sway {
  0%, 100% { transform: rotate(0); }
  6%  { transform: rotate(-14deg); }
  12% { transform: rotate(12deg); }
  18% { transform: rotate(-9deg); }
  24% { transform: rotate(6deg); }
  30% { transform: rotate(0); }
}

/* Badge pulse */
.pulse-ring {
  animation: pulse-out 2.2s ease-out infinite;
}
@keyframes pulse-out {
  0%   { transform: scale(1); opacity: 0.45; }
  100% { transform: scale(2.4); opacity: 0; }
}

/* Panel shadow */
.notif-shadow {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.14),
    0 16px 40px -4px rgba(0, 0, 0, 0.24),
    0 0 0 1px rgba(255, 255, 255, 0.03);
}

/* Skeleton shimmer */
.skeleton-pulse {
  animation: shimmer 1.6s ease-in-out infinite;
}
@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}

/* Panel entrance */
.panel-drop-enter-active {
  transition: opacity 0.18s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.panel-drop-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.panel-drop-enter-from { opacity: 0; transform: scale(0.93) translateY(-8px); }
.panel-drop-leave-to   { opacity: 0; transform: scale(0.96) translateY(-4px); }

/* List items */
.notif-list-enter-active {
  transition: opacity 0.2s, transform 0.2s;
}
.notif-list-leave-active {
  transition: opacity 0.15s, transform 0.15s;
  position: absolute;
  width: 100%;
}
.notif-list-enter-from { opacity: 0; transform: translateX(-8px); }
.notif-list-leave-to   { opacity: 0; transform: translateX(8px); }

/* Theme icon swap */
.icon-swap-enter-active { transition: opacity 0.15s, transform 0.15s; }
.icon-swap-leave-active { transition: opacity 0.1s, transform 0.1s; }
.icon-swap-enter-from { opacity: 0; transform: rotate(-30deg) scale(0.7); }
.icon-swap-leave-to   { opacity: 0; transform: rotate(30deg) scale(0.7); }
</style>