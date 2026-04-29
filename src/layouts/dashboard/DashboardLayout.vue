<!-- src/layouts/dashboard/DashboardLayout.vue -->
<template>
  <div class="dash-shell">

    <!-- Sidebar (desktop only) -->
    <Sidebar
      :navLinks="navLinks"
      :isCollapsed="isCollapsed"
      :isMobileOpen="false"
      @toggle-collapse="isCollapsed = !isCollapsed"
      @close-mobile="() => {}"
      @logout="showLogoutModal = true"
    />

    <!-- Main area -->
    <div class="dash-main" :class="{ expanded: isCollapsed }">

      <!-- Header -->
      <DashHeader
        :pageTitle="currentPageLabel"
        @logout="showLogoutModal = true"
      />

      <!-- Page content -->
      <!-- flush mode: no padding, no scroll — Chat manages its own layout -->
      <main class="dash-content" :class="{ 'dash-content--flush': isChatRoute }" data-scroll-container>
        <router-view />
      </main>

    </div>

    <!-- Mobile bottom nav -->
    <BottomNav
      :navLinks="navLinks"
      :isAdmin="isAdmin"
      @logout="showLogoutModal = true"
    />

    <!-- Logout confirmation modal -->
    <Transition name="modal">
      <div v-if="showLogoutModal" class="modal-backdrop" @click.self="showLogoutModal = false">
        <div class="modal-card">
          <!-- <div class="modal-icon">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
          </div> -->
          <h3 class="modal-title">Log out?</h3>
          <p class="modal-body">You'll need to sign in again to access your account.</p>
          <div class="modal-actions">
            <button class="modal-cancel" @click="showLogoutModal = false">Cancel</button>
            <button class="modal-confirm" :disabled="logoutLoading" @click="handleLogout">
              <span v-if="logoutLoading">
                <i class="fa-solid fa-circle-notch fa-spin"></i> Logging out...
              </span>
              <span v-else>Yes, log out</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Sidebar    from './Sidebar.vue'
import DashHeader from './Header.vue'
import BottomNav  from './BottomNav.vue'

const props = defineProps({
  navLinks: { type: Array, required: true },
})

const route      = useRoute()
const router     = useRouter()
const authStore  = useAuthStore()

const isCollapsed     = ref(false)
const showLogoutModal = ref(false)
const logoutLoading   = ref(false)

const isAdmin = computed(() => authStore.userRole === 'admin')

// Derive active page label from nav links
const allItems = computed(() => props.navLinks.flatMap(g => g.items))

const currentPageLabel = computed(() => {
  // First try exact match
  const exactMatch = allItems.value.find(l => l.path === route.path)
  if (exactMatch) return exactMatch.label
  
  // Then fall back to startsWith for parent routes
  const startsWithMatch = allItems.value.find(l => route.path.startsWith(l.path))
  return startsWithMatch?.label || 'Dashboard'
})

// Chat route gets a flush content area (no padding, no scroll)
const isChatRoute = computed(() => route.path.includes('/chat'))

// Logout — navigate first so the router guard doesn't re-render
// the dashboard in an unauthenticated state before the redirect completes
async function handleLogout() {
  logoutLoading.value = true
  showLogoutModal.value = false
  try {
    await router.push('/auth/login')
    await authStore.logout()
  } finally {
    logoutLoading.value = false
  }
}

// Close mobile drawer on resize to desktop (no-op now, kept for safety)
function handleResize() {}

onMounted(()   => window.addEventListener('resize', handleResize))
onUnmounted(() => window.removeEventListener('resize', handleResize))
</script>

<style scoped>
/* ── Shell: explicit height so children can fill 100% ── */
.dash-shell {
  display: flex;
  height: 100dvh;          /* was min-height — children couldn't inherit it */
  overflow: hidden;        /* prevents any bleed-out */
  background-color: var(--color-cb-base);
  position: relative;
}

/* Overlay (kept as placeholder — no longer used on mobile) */

/* ── Main column ── */
.dash-main {
  flex: 1;
  min-width: 0;            /* prevent flex blowout */
  min-height: 0;           /* allow children to shrink/scroll properly */
  display: flex;
  flex-direction: column;
  overflow: hidden;        /* contain children — each section manages its own scroll */
  margin-left: 240px;
  transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.dash-main.expanded { margin-left: 68px; }

@media (max-width: 1023px) {
  .dash-main { margin-left: 0 !important; }
}

/* ── Content area ── */
.dash-content {
  flex: 1;
  min-height: 0;           /* critical — lets flex child shrink so it scrolls */
  padding: 1.5rem;
  overflow-y: auto;        /* normal pages scroll here */
}

@media (max-width: 1023px) {
  .dash-content {
    padding-bottom: calc(1.5rem + 60px + env(safe-area-inset-bottom));
  }
}

@media (min-width: 640px) { .dash-content { padding: 2rem; } }

/* Chat gets full container — no padding, no outer scroll */
.dash-content--flush {
  padding: 0 !important;
  overflow: hidden !important;
}

/* Logout modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: var(--color-cb-overlay);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-card {
  background-color: var(--color-cb-card);
  border-radius: 20px;
  padding: 2rem 2rem 1.75rem;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
  border: 1px solid var(--color-cb-divider);
}

.modal-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--color-cb-negative-subtle);
  color: var(--color-cb-negative);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.modal-title { font-size: 1.1rem; font-weight: 700; color: var(--color-cb-text); margin: 0; }
.modal-body  { font-size: 0.875rem; color: var(--color-cb-muted); margin: 0; line-height: 1.6; }

.modal-actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
  margin-top: 0.5rem;
}

.modal-cancel {
  flex: 1;
  padding: 0.7rem;
  border-radius: 10px;
  border: 1px solid var(--color-cb-divider);
  background: transparent;
  color: var(--color-cb-muted);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: background-color 0.15s ease;
}

.modal-cancel:hover { background-color: var(--color-cb-field); }

.modal-confirm {
  flex: 1;
  padding: 0.7rem;
  border-radius: 10px;
  border: none;
  background-color: var(--color-cb-negative);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: opacity 0.15s ease;
}

.modal-confirm:disabled { opacity: 0.7; cursor: not-allowed; }
.modal-confirm:not(:disabled):hover { opacity: 0.9; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal-card { transition: transform 0.2s ease; }
.modal-enter-from .modal-card { transform: scale(0.95); }
</style>