<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-cb-base px-4 py-16 text-center">

    <!-- Floating illustration -->
    <div class="relative mb-8 select-none">
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="h-40 w-40 rounded-full border border-dashed border-cb-divider orbit sm:h-48 sm:w-48"></div>
      </div>
      <div class="relative z-10 float-anim">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="mx-auto" aria-hidden="true">
          <ellipse cx="60" cy="108" rx="28" ry="6" class="shadow-ellipse" />
          <rect x="20" y="42" width="80" height="58" rx="4" class="box-body" />
          <rect x="16" y="34" width="88" height="14" rx="4" class="box-lid" />
          <rect x="53" y="34" width="14" height="62" rx="2" class="box-tape" />
          <rect x="53" y="34" width="14" height="14" rx="2" class="box-tape" />
          <text x="60" y="80" text-anchor="middle" font-family="system-ui, sans-serif" font-size="26" font-weight="700" class="box-question">?</text>
        </svg>
      </div>
    </div>

    <!-- 404 -->
    <div class="mb-3 flex items-center gap-2">
      <span class="font-mono text-6xl font-bold tracking-tight text-cb-muted-40 sm:text-7xl">4</span>
      <span class="font-mono text-6xl font-bold tracking-tight text-cb-accent sm:text-7xl">0</span>
      <span class="font-mono text-6xl font-bold tracking-tight text-cb-muted-40 sm:text-7xl">4</span>
    </div>

    <h1 class="mb-2 text-xl font-bold text-cb-text sm:text-2xl">
      This errand went missing
    </h1>
    <p class="mb-8 max-w-sm text-sm leading-relaxed text-cb-muted">
      The page you're looking for doesn't exist, was moved, or the link might be broken.
    </p>

    <!-- Primary actions — differ by auth state -->
    <div class="flex flex-col items-center gap-3 sm:flex-row">
      <template v-if="isAuthenticated">
        <router-link
          :to="homeTo"
          class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cb-accent px-6 py-2.5 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark hover:shadow-md hover:shadow-cb-accent/20 sm:w-auto"
        >
          <i class="fa-solid fa-house text-xs"></i>
          Go to dashboard
        </router-link>
        <router-link
          :to="{ name: 'ErrandMarket' }"
          class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-card px-6 py-2.5 text-sm font-semibold text-cb-text transition-all hover:border-cb-accent/40 hover:bg-cb-field sm:w-auto"
        >
          <i class="fa-solid fa-store text-xs text-cb-muted"></i>
          Browse errands
        </router-link>
      </template>

      <template v-else>
        <router-link
          :to="{ name: 'Home' }"
          class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cb-accent px-6 py-2.5 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark hover:shadow-md hover:shadow-cb-accent/20 sm:w-auto"
        >
          <i class="fa-solid fa-house text-xs"></i>
          Go home
        </router-link>
        <router-link
          :to="{ name: 'Login' }"
          class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-card px-6 py-2.5 text-sm font-semibold text-cb-text transition-all hover:border-cb-accent/40 hover:bg-cb-field sm:w-auto"
        >
          <i class="fa-solid fa-arrow-right-to-bracket text-xs text-cb-muted"></i>
          Sign in
        </router-link>
      </template>
    </div>

    <!-- Quick links — differ by auth state -->
    <div class="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
      <span class="text-xs text-cb-muted-40">Quick links</span>
      <router-link
        v-for="link in quickLinks"
        :key="link.label"
        :to="link.to"
        class="text-xs text-cb-muted transition-colors hover:text-cb-accent"
      >
        {{ link.label }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const isAuthenticated = computed(() => !!authStore.accessToken)
const isAdmin         = computed(() => authStore.userRole === 'admin')

// Primary home destination based on role
const homeTo = computed(() => {
  if (isAdmin.value) return { name: 'AdminDashboard' }
  return { name: 'UserDashboard' }
})

// Quick links swap entirely based on auth state + role
const quickLinks = computed(() => {
  if (!isAuthenticated.value) {
    return [
      { label: 'Home',     to: { name: 'Home' } },
      { label: 'Register', to: { name: 'Register' } },
      { label: 'About',    to: { name: 'About' } },
      { label: 'Contact',  to: { name: 'Contact' } },
    ]
  }
  if (isAdmin.value) {
    return [
      { label: 'Dashboard',     to: { name: 'AdminDashboard' } },
      { label: 'Users',         to: { name: 'AdminUsers' } },
      { label: 'Errands',       to: { name: 'AdminErrands' } },
      { label: 'Orders',        to: { name: 'AdminOrders' } },
      { label: 'Support',       to: { name: 'AdminSupport' } },
    ]
  }
  return [
    { label: 'Dashboard',  to: { name: 'UserDashboard' } },
    { label: 'My Errands', to: { name: 'MyErrands' } },
    { label: 'Services',   to: { name: 'Services' } },
    { label: 'Wallet',     to: { name: 'Wallet' } },
    { label: 'Support',    to: { name: 'Support' } },
  ]
})
</script>

<style scoped>
.box-body     { fill: var(--color-cb-card, #f8f7f5); stroke: var(--color-cb-divider, #e5e3de); stroke-width: 1; }
.box-lid      { fill: var(--color-cb-field, #f0ede8); stroke: var(--color-cb-divider, #e5e3de); stroke-width: 1; }
.box-tape     { fill: var(--color-cb-accent, #5b6ef5); opacity: 0.25; }
.box-question { fill: var(--color-cb-accent, #5b6ef5); }
.shadow-ellipse { fill: var(--color-cb-divider, #e5e3de); opacity: 0.6; }

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-10px); }
}
.float-anim { animation: float 3.6s ease-in-out infinite; }

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.orbit { animation: spin-slow 18s linear infinite; }
</style>