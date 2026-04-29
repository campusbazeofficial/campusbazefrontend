<!-- src/layouts/dashboard/BottomNav.vue -->
<template>
  <nav class="bottom-nav">
    <router-link
      v-for="tab in primaryTabs"
      :key="tab.path"
      :to="tab.path"
      class="bottom-tab"
      active-class="active"
    >
      <span class="tab-icon-wrap">
        <i :class="tab.icon"></i>
        <span v-if="getBadgeValue(tab)" class="tab-badge">
          {{ getBadgeValue(tab) > 99 ? '99+' : getBadgeValue(tab) }}
        </span>
      </span>
      <span class="tab-label">{{ tab.label }}</span>
    </router-link>

    <!-- More tab -->
    <button class="bottom-tab more-tab" :class="{ active: sheetOpen }" @click="sheetOpen = true">
      <span class="tab-icon-wrap">
        <i class="fa-solid fa-grip"></i>
      </span>
      <span class="tab-label">More</span>
    </button>
  </nav>

  <!-- Sheet -->
  <BottomNavSheet
    v-if="sheetOpen"
    :overflowLinks="overflowLinks"
    @close="sheetOpen = false"
    @logout="emit('logout')"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useNotificationStore } from '@/stores/notificationStore'
import BottomNavSheet from './BottomNavSheet.vue'

const props = defineProps({
  navLinks: { type: Array, required: true },
  isAdmin: { type: Boolean, default: false },
})

const emit = defineEmits(['logout'])

const chatStore = useChatStore()
const notificationStore = useNotificationStore()
const sheetOpen = ref(false)

// Flatten all links from the navLinks groups
const allLinks = computed(() => props.navLinks.flatMap(g => g.items))

// Pick 4 primary tabs depending on role
const PRIMARY_USER_PATHS  = ['/user/dashboard', '/user/wallet', '/user/chat', '/user/notifications']
const PRIMARY_ADMIN_PATHS = ['/admin/dashboard', '/admin/users', '/admin/errands', '/admin/subscriptions']

const primaryPaths = computed(() =>
  props.isAdmin ? PRIMARY_ADMIN_PATHS : PRIMARY_USER_PATHS
)

const primaryTabs = computed(() =>
  primaryPaths.value
    .map(p => allLinks.value.find(l => l.path === p))
    .filter(Boolean)
)

const overflowLinks = computed(() =>
  allLinks.value.filter(l => !primaryPaths.value.includes(l.path))
)

function getBadgeValue(link) {
  if (!link.badge) return null
  if (link.badge === 'unreadCount') return chatStore.totalUnread || null
  if (link.badge === 'notificationCount') return notificationStore.unreadCount || null
  if (typeof link.badge === 'number') return link.badge || null
  return null
}
</script>

<style scoped>
.bottom-nav {
  display: none;
}

@media (max-width: 1023px) {
  .bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    background-color: var(--color-cb-card);
    border-top: 1px solid var(--color-cb-divider);
    height: 60px;
    padding: 0 0.25rem;
    padding-bottom: env(safe-area-inset-bottom);
    align-items: stretch;
  }
}

.bottom-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  text-decoration: none;
  color: var(--color-cb-muted);
  font-size: 0.6rem;
  font-weight: 600;
  font-family: var(--font-sans);
  letter-spacing: 0.02em;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  position: relative;
}

.bottom-tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 28px;
  height: 2px;
  border-radius: 0 0 3px 3px;
  background-color: var(--color-cb-accent);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bottom-tab.active {
  color: var(--color-cb-accent);
}

.bottom-tab.active::before {
  transform: translateX(-50%) scaleX(1);
}

.tab-icon-wrap {
  position: relative;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.tab-badge {
  position: absolute;
  top: -4px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: 20px;
  background-color: var(--color-cb-negative);
  color: #fff;
  font-size: 0.55rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--color-cb-card);
  line-height: 1;
}

.tab-label {
  line-height: 1;
}
</style>