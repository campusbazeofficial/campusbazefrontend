<!-- src/layouts/dashboard/BottomNavSheet.vue -->
<template>
  <Teleport to="body">

    <!-- Backdrop -->
    <Transition name="sheet-backdrop">
      <div v-if="visible" class="sheet-backdrop" @click="close" />
    </Transition>

    <!-- Panel -->
    <Transition name="sheet-slide" @after-leave="emit('close')">
      <div v-if="visible" class="sheet-panel">

        <!-- Handle -->
        <div class="sheet-handle-wrap" @click="close">
          <div class="sheet-handle" />
        </div>

        <!-- Header -->
        <div class="sheet-header">
          <span class="sheet-title">Menu</span>
          <button class="sheet-close-btn" @click="close" aria-label="Close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Nav rows -->
        <div class="sheet-body">
          <router-link
            v-for="(link, i) in overflowLinks"
            :key="link.path"
            :to="link.path"
            class="sheet-row"
            active-class="active"
            :style="{ transitionDelay: visible ? `${i * 22}ms` : '0ms' }"
            @click="close"
          >
            <span class="row-icon-wrap">
              <i :class="link.icon"></i>
            </span>
            <span class="row-label">{{ link.label }}</span>
            <span v-if="getBadgeValue(link)" class="row-badge">
              {{ getBadgeValue(link) > 99 ? '99+' : getBadgeValue(link) }}
            </span>
            <i class="fa-solid fa-chevron-right row-chevron"></i>
          </router-link>
        </div>

        <!-- Logout -->
        <div class="sheet-footer">
          <button class="sheet-logout" @click="onLogout">
            <span class="logout-icon-wrap">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </span>
            <span class="logout-text">Log out</span>
            <i class="fa-solid fa-chevron-right logout-chevron"></i>
          </button>
        </div>

      </div>
    </Transition>

  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useNotificationStore } from '@/stores/notificationStore'

const props = defineProps({
  overflowLinks: { type: Array, required: true },
})

const emit = defineEmits(['close', 'logout'])

const chatStore = useChatStore()
const notificationStore = useNotificationStore()

const visible = ref(false)
onMounted(() => requestAnimationFrame(() => { visible.value = true }))

function close() {
  visible.value = false
}

function getBadgeValue(link) {
  if (!link.badge) return null
  if (link.badge === 'unreadCount') return chatStore.totalUnread || null
  if (link.badge === 'notificationCount') return notificationStore.unreadCount || null
  if (typeof link.badge === 'number') return link.badge || null
  return null
}

function onLogout() {
  visible.value = false
  setTimeout(() => emit('logout'), 280)
}
</script>

<style scoped>
/* ── Backdrop ── */
.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.36);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  z-index: 60;
}
.sheet-backdrop-enter-active { transition: opacity 0.3s ease; }
.sheet-backdrop-leave-active  { transition: opacity 0.24s ease; }
.sheet-backdrop-enter-from,
.sheet-backdrop-leave-to      { opacity: 0; }

/* ── Panel ── */
.sheet-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 61;
  background-color: var(--color-cb-card);
  border-radius: 20px 20px 0 0;
  border-top: 1px solid var(--color-cb-divider);
  display: flex;
  flex-direction: column;
  max-height: 78vh;
  padding-bottom: calc(60px + env(safe-area-inset-bottom));
  box-shadow:
    0 -1px 0 var(--color-cb-divider),
    0 -24px 64px rgba(0, 0, 0, 0.14);
  will-change: transform;
}

/* ── Slide transition — true spring feel ── */
.sheet-slide-enter-active {
  transition:
    transform 0.44s cubic-bezier(0.16, 1, 0.3, 1),
    opacity   0.28s ease;
}
.sheet-slide-leave-active {
  transition:
    transform 0.28s cubic-bezier(0.4, 0, 1, 1),
    opacity   0.22s ease;
}
.sheet-slide-enter-from { transform: translateY(100%); opacity: 0.7; }
.sheet-slide-leave-to   { transform: translateY(100%); opacity: 0; }

/* ── Handle ── */
.sheet-handle-wrap {
  display: flex;
  justify-content: center;
  padding: 0.75rem 0 0;
  cursor: pointer;
  flex-shrink: 0;
}
.sheet-handle {
  width: 36px;
  height: 3.5px;
  border-radius: 2px;
  background-color: var(--color-cb-divider);
  transition: width 0.2s ease, background-color 0.2s ease;
}
.sheet-handle-wrap:hover .sheet-handle {
  width: 48px;
  background-color: var(--color-cb-muted);
}

/* ── Header ── */
.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem 0.5rem;
  flex-shrink: 0;
}
.sheet-title {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-cb-muted);
}
.sheet-close-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--color-cb-divider);
  background: var(--color-cb-base);
  color: var(--color-cb-muted);
  font-size: 0.72rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.sheet-close-btn:active {
  background: var(--color-cb-field);
  color: var(--color-cb-text);
}

/* ── Body ── */
.sheet-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.25rem 0.75rem 0.5rem;
  scrollbar-width: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sheet-body::-webkit-scrollbar { display: none; }

/* ── Row ── */
@keyframes row-in {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}

.sheet-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.72rem 0.75rem;
  border-radius: 12px;
  text-decoration: none;
  color: var(--color-cb-text);
  font-size: 0.875rem;
  font-weight: 500;
  font-family: var(--font-sans);
  -webkit-tap-highlight-color: transparent;
  transition: background 0.14s ease;
  animation: row-in 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.sheet-row:active {
  background: var(--color-cb-field);
}
.sheet-row.active {
  background: var(--color-cb-accent-subtle);
  color: var(--color-cb-accent);
}
.sheet-row.active .row-icon-wrap {
  background: var(--color-cb-accent-subtle);
  color: var(--color-cb-accent);
  border-color: color-mix(in srgb, var(--color-cb-accent) 25%, transparent);
}
.sheet-row.active .row-chevron {
  color: var(--color-cb-accent);
  opacity: 0.5;
}

/* ── Row icon ── */
.row-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: var(--color-cb-base);
  border: 1px solid var(--color-cb-divider);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: var(--color-cb-muted);
  flex-shrink: 0;
  transition: background 0.14s, color 0.14s, border-color 0.14s;
}

/* ── Row label ── */
.row-label {
  flex: 1;
  line-height: 1;
}

/* ── Row badge ── */
.row-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 20px;
  background: var(--color-cb-negative);
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── Row chevron ── */
.row-chevron {
  font-size: 0.6rem;
  color: var(--color-cb-muted);
  opacity: 0.35;
  flex-shrink: 0;
  transition: opacity 0.14s, transform 0.14s;
}
.sheet-row:active .row-chevron {
  opacity: 0.6;
  transform: translateX(2px);
}

/* ── Footer ── */
.sheet-footer {
  padding: 0.6rem 0.75rem 0.4rem;
  border-top: 1px solid var(--color-cb-divider);
  flex-shrink: 0;
}

/* ── Logout ── */
.sheet-logout {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
  padding: 0.72rem 0.75rem;
  border-radius: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: var(--font-sans);
  -webkit-tap-highlight-color: transparent;
  transition: background 0.14s ease;
}
.sheet-logout:active {
  background: color-mix(in srgb, #ef4444 8%, var(--color-cb-base));
}
.sheet-logout:active .logout-icon-wrap {
  background: color-mix(in srgb, #ef4444 16%, var(--color-cb-card));
  border-color: color-mix(in srgb, #ef4444 30%, transparent);
}

.logout-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: var(--color-cb-base);
  border: 1px solid var(--color-cb-divider);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  font-size: 0.88rem;
  flex-shrink: 0;
  transition: background 0.14s, border-color 0.14s;
}

.logout-text {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: #ef4444;
  text-align: left;
}

.logout-chevron {
  font-size: 0.6rem;
  color: #ef4444;
  opacity: 0.35;
  flex-shrink: 0;
  transition: opacity 0.14s, transform 0.14s;
}
.sheet-logout:active .logout-chevron {
  opacity: 0.6;
  transform: translateX(2px);
}
</style>