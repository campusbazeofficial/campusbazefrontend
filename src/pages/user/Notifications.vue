<template>
  <div class="min-h-screen bg-cb-base">

    <!-- ── Sticky Header ─────────────────────────────────────── -->
    <header class="sticky -top-8 z-10 border-b border-cb-divider bg-cb-base/95 backdrop-blur-sm">
      <div class="mx-auto max-w-7xl ">
        <div class="flex items-center justify-between gap-3 py-4">
          <div class="flex items-center gap-3">
            <h1 class="text-lg font-bold text-cb-text sm:text-xl">Notifications</h1>
            <!-- <span
              v-if="notificationStore.unreadCount > 0"
              class="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-cb-accent text-[10px] font-bold text-cb-contrast"
            >
              {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
            </span> -->
          </div>

          <button
            v-if="notificationStore.hasUnread"
            @click="handleMarkAllRead"
            :disabled="notificationStore.actionLoading"
            class="flex items-center gap-1.5 rounded-xl border border-cb-divider bg-cb-card px-3 py-2 text-xs font-semibold text-cb-muted transition-all hover:border-cb-accent/50 hover:bg-cb-accent-subtle hover:text-cb-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <i class="fa-solid text-[10px]" :class="notificationStore.actionLoading ? 'fa-spinner fa-spin' : 'fa-check-double'"></i>
            <span class="hidden sm:inline">Mark all read</span>
            <span class="sm:hidden">All read</span>
          </button>
        </div>

        <!-- Tab strip -->
        <div class="flex gap-0 border-b border-cb-divider -mb-px">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key; selectedType = null"
            :class="[
              'relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-colors',
              activeTab === tab.key
                ? 'text-cb-accent'
                : 'text-cb-muted hover:text-cb-text',
            ]"
          >
            {{ tab.label }}
            <span
              v-if="tab.key === 'unread' && notificationStore.unreadCount > 0"
              class="inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-cb-accent px-1 text-[9px] font-bold text-cb-contrast"
            >
              {{ notificationStore.unreadCount }}
            </span>
            <span
              v-if="tab.key === 'all' && notificationStore.notifications.length > 0"
              class="text-[10px] text-cb-muted-40"
            >
              {{ notificationStore.notifications.length }}
            </span>
            <span
              v-if="activeTab === tab.key"
              class="absolute inset-x-0 -bottom-px h-0.5 rounded-t bg-cb-accent"
            ></span>
          </button>
        </div>

        <!-- Type filter chips (only shown when there are 2+ distinct types) -->
        <div
          v-if="availableTypes.length > 1"
          class="flex gap-2 overflow-x-auto py-2.5 no-scrollbar"
        >
          <button
            @click="selectedType = null"
            :class="[
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
              selectedType === null
                ? 'border-cb-accent bg-cb-accent text-cb-contrast'
                : 'border-cb-divider bg-cb-card text-cb-muted hover:border-cb-accent/40 hover:text-cb-text',
            ]"
          >
            All types
          </button>
          <button
            v-for="type in availableTypes"
            :key="type"
            @click="selectedType = selectedType === type ? null : type"
            :class="[
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
              selectedType === type
                ? 'border-cb-accent bg-cb-accent text-cb-contrast'
                : 'border-cb-divider bg-cb-card text-cb-muted hover:border-cb-accent/40 hover:text-cb-text',
            ]"
          >
            <i :class="[TYPE_META[type]?.icon, 'text-[10px]']"></i>
            {{ TYPE_META[type]?.label ?? type }}
          </button>
        </div>
      </div>
    </header>

    <!-- ── Body ──────────────────────────────────────────────── -->
    <div class="mx-auto max-w-7xl py-5">

      <!-- Loading skeletons -->
      <div v-if="notificationStore.loading && !notificationStore.notifications.length" class="space-y-2">
        <div
          v-for="i in 6"
          :key="i"
          class="flex items-start gap-3 rounded-2xl border border-cb-divider bg-cb-card p-4"
        >
          <div class="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-cb-field"></div>
          <div class="flex-1 space-y-2 pt-0.5">
            <div class="h-3.5 w-2/3 animate-pulse rounded-full bg-cb-field"></div>
            <div class="h-3 w-full animate-pulse rounded-full bg-cb-field"></div>
            <div class="h-3 w-4/5 animate-pulse rounded-full bg-cb-field"></div>
            <div class="h-2.5 w-1/4 animate-pulse rounded-full bg-cb-field"></div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="!filteredNotifications.length && !notificationStore.loading"
        class="flex flex-col items-center justify-center px-4 py-20 text-center"
      >
        <div class="relative mb-5">
          <div class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-cb-divider bg-cb-card">
            <i class="fa-regular fa-bell text-3xl text-cb-muted-40"></i>
          </div>
          <div
            v-if="activeTab === 'unread'"
            class="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-cb-base bg-cb-accent-subtle"
          >
            <i class="fa-solid fa-check text-[11px] text-cb-accent"></i>
          </div>
        </div>
        <h3 class="mb-1.5 text-base font-bold tracking-tight text-cb-text">
          {{ activeTab === 'unread' ? 'All caught up!' : 'No notifications yet' }}
        </h3>
        <p class="max-w-xs text-sm leading-relaxed text-cb-muted">
          {{ activeTab === 'unread'
            ? "You've read all your notifications."
            : 'When you get notifications, they\'ll show up here.' }}
        </p>
        <router-link
          v-if="activeTab !== 'unread'"
          :to="{ name: 'ErrandMarket' }"
          class="mt-5 inline-flex items-center gap-2 rounded-xl bg-cb-accent px-5 py-2.5 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark"
        >
          Browse Errands
          <i class="fa-solid fa-arrow-right text-xs"></i>
        </router-link>
      </div>

      <!-- Notification groups -->
      <div v-else class="space-y-6">
        <div
          v-for="(groupNotifs, dateGroup) in filteredGrouped"
          :key="dateGroup"
          class="space-y-2"
        >
          <!-- Date group label -->
          <div class="flex items-center gap-3">
            <span class="shrink-0 text-[10px] font-bold uppercase tracking-widest text-cb-muted">
              {{ dateGroup }}
            </span>
            <div class="h-px flex-1 bg-cb-divider"></div>
            <span class="shrink-0 rounded-full bg-cb-field px-2 py-0.5 text-[10px] font-semibold text-cb-muted-40">
              {{ groupNotifs.length }}
            </span>
          </div>

          <!-- Notification cards -->
          <TransitionGroup name="card-list" tag="div" class="space-y-2">
            <div
              v-for="notification in groupNotifs"
              :key="notification._id"
              :class="[
                'group relative overflow-hidden rounded-2xl border transition-all duration-150',
                notification.isRead
                  ? 'border-cb-divider bg-cb-card hover:border-cb-divider/60 hover:bg-cb-field/50'
                  : 'border-cb-accent/25 bg-cb-accent/[0.05] hover:border-cb-accent/40 hover:bg-cb-accent/[0.08]',
                isNavigable(notification) ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default',
                navigating === notification._id ? 'opacity-60 pointer-events-none' : '',
              ]"
              @click="openNotification(notification)"
            >
              <!-- Unread accent bar -->
              <div
                v-if="!notification.isRead"
                class="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-cb-accent"
              ></div>

              <div class="flex items-start gap-3 p-4 sm:gap-4">
                <!-- Type icon -->
                <div
                  :class="[
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm sm:h-11 sm:w-11',
                    getIconColors(notification.type),
                  ]"
                >
                  <i
                    v-if="navigating === notification._id"
                    class="fa-solid fa-spinner fa-spin"
                  ></i>
                  <i v-else :class="notificationStore.getNotificationIcon(notification.type).icon"></i>
                </div>

                <!-- Content -->
                <div class="min-w-0 flex-1">
                  <div class="mb-1 flex items-start justify-between gap-2">
                    <h4 class="text-sm font-semibold leading-snug tracking-tight text-cb-text">
                      {{ notification.title }}
                    </h4>
                    <span class="shrink-0 whitespace-nowrap text-[11px] tabular-nums text-cb-muted-40">
                      {{ formatDetailedTime(notification.createdAt) }}
                    </span>
                  </div>

                  <p class="mb-2.5 text-sm leading-relaxed text-cb-muted">
                    {{ notification.body }}
                  </p>

                  <!-- Context chips -->
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span
                      v-if="notification.data?.errandTitle"
                      class="inline-flex items-center gap-1 rounded-lg border border-cb-divider/50 bg-cb-field px-2 py-0.5 text-[11px] font-medium text-cb-muted"
                    >
                      <i class="fa-solid fa-box text-[9px]"></i>
                      <span class="max-w-[140px] truncate sm:max-w-[200px]">{{ notification.data.errandTitle }}</span>
                    </span>
                    <span
                      v-if="notification.data?.amount"
                      class="inline-flex items-center gap-1 rounded-lg bg-cb-accent-subtle px-2 py-0.5 text-[11px] font-semibold text-cb-accent"
                    >
                      <i class="fa-solid fa-naira-sign text-[9px]"></i>
                      {{ Number(notification.data.amount).toLocaleString() }}
                    </span>
                    <span
                      v-if="notification.data?.fee"
                      class="inline-flex items-center gap-1 rounded-lg bg-cb-warning-subtle px-2 py-0.5 text-[11px] font-semibold text-cb-warning"
                    >
                      <i class="fa-solid fa-coins text-[9px]"></i>
                      {{ notification.data.fee }} CBC
                    </span>
                    <span
                      v-if="notification.data?.escrowReference"
                      class="inline-flex items-center gap-1 rounded-lg border border-cb-divider/50 bg-cb-field px-2 py-0.5 font-mono text-[11px] text-cb-muted"
                    >
                      <i class="fa-solid fa-key text-[9px]"></i>
                      {{ truncateRef(notification.data.escrowReference) }}
                    </span>
                    <!-- Navigate affordance or info-only label -->
                    <span
                      v-if="isNavigable(notification)"
                      class="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-cb-accent opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      View <i class="fa-solid fa-arrow-right text-[9px]"></i>
                    </span>
                    <span
                      v-else
                      class="ml-auto inline-flex items-center gap-1 rounded-md bg-cb-field px-1.5 py-0.5 text-[10px] text-cb-muted-40"
                    >
                      Info only
                    </span>
                  </div>
                </div>

                <!-- Action buttons — stop propagation so they don't fire openNotification -->
                <div
                  class="flex shrink-0 flex-col items-center gap-1.5 self-start sm:flex-row sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity"
                  @click.stop
                >
                  <button
                    v-if="!notification.isRead"
                    @click="handleMarkAsRead(notification._id)"
                    title="Mark as read"
                    class="flex h-8 w-8 items-center justify-center rounded-xl border border-cb-divider bg-cb-field text-xs text-cb-muted transition-all hover:border-cb-accent hover:bg-cb-accent hover:text-cb-contrast"
                  >
                    <i class="fa-solid fa-check"></i>
                  </button>
                  <button
                    @click="confirmDelete(notification)"
                    title="Delete"
                    class="flex h-8 w-8 items-center justify-center rounded-xl border border-cb-divider bg-cb-field text-xs text-cb-muted transition-all hover:border-cb-negative/30 hover:bg-cb-negative-subtle hover:text-cb-negative"
                  >
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <!-- Load more -->
        <div v-if="notificationStore.meta?.hasNextPage" class="flex justify-center py-2">
          <button
            @click="loadMore"
            :disabled="loadingMore"
            class="flex items-center gap-2 rounded-xl border border-cb-divider bg-cb-card px-6 py-2.5 text-sm font-semibold text-cb-text transition-all hover:border-cb-accent/50 hover:bg-cb-field disabled:cursor-not-allowed disabled:opacity-50"
          >
            <i v-if="loadingMore" class="fa-solid fa-spinner fa-spin text-xs"></i>
            <i v-else class="fa-solid fa-chevron-down text-xs text-cb-muted"></i>
            {{ loadingMore ? 'Loading…' : 'Load more' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Delete Confirm Modal ───────────────────────────────── -->
    <Teleport to="body">
      <Transition name="overlay">
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 z-50 flex items-end justify-center bg-cb-overlay backdrop-blur-sm sm:items-center sm:p-4"
          @click.self="showDeleteModal = false"
        >
          <div class="w-full overflow-hidden rounded-t-3xl bg-cb-base shadow-2xl sm:max-w-sm sm:rounded-2xl">
            <!-- Handle (mobile) -->
            <div class="flex justify-center pb-1 pt-3 sm:hidden">
              <div class="h-1 w-10 rounded-full bg-cb-divider"></div>
            </div>
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-cb-divider px-5 py-4">
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-cb-negative-subtle">
                  <i class="fa-solid fa-trash-can text-sm text-cb-negative"></i>
                </div>
                <h3 class="text-base font-bold text-cb-text">Delete notification?</h3>
              </div>
              <button
                @click="showDeleteModal = false"
                class="flex h-8 w-8 items-center justify-center rounded-xl border border-cb-divider bg-cb-field text-cb-muted hover:bg-cb-negative-subtle hover:text-cb-negative transition-all"
              >
                <i class="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>
            <!-- Body -->
            <div class="px-5 py-4">
              <p class="text-sm leading-relaxed text-cb-muted">
                This notification will be permanently removed. This action cannot be undone.
              </p>
            </div>
            <!-- Footer -->
            <div class="flex gap-2.5 px-5 pb-6 pt-1 sm:pb-4">
              <button
                @click="showDeleteModal = false"
                class="flex-1 rounded-xl border border-cb-divider bg-cb-field py-2.5 text-sm font-semibold text-cb-text hover:bg-cb-card transition-colors"
              >
                Cancel
              </button>
              <button
                @click="handleDelete"
                :disabled="deleting"
                class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-negative py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
              >
                <i v-if="deleting" class="fa-solid fa-spinner fa-spin text-xs"></i>
                {{ deleting ? 'Deleting…' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const notificationStore = useNotificationStore()
const { showToast } = useToast()

// ── State ─────────────────────────────────────────────────────
const loadingMore      = ref(false)
const showDeleteModal  = ref(false)
const notificationToDelete = ref(null)
const deleting         = ref(false)
const currentPage      = ref(1)
const activeTab        = ref('all')
const selectedType     = ref(null) // null = all types

const tabs = [
  { key: 'all',    label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read',   label: 'Read' },
]

// ── Type labels & icons (for filter chips) ───────────────────
const TYPE_META = {
  errand_update: { label: 'Errands',      icon: 'fa-solid fa-box' },
  new_bid:       { label: 'Bids',         icon: 'fa-solid fa-gavel' },
  cbc_credit:    { label: 'CBC Credits',  icon: 'fa-solid fa-coins' },
  payment:       { label: 'Payments',     icon: 'fa-solid fa-credit-card' },
  message:       { label: 'Messages',     icon: 'fa-solid fa-message' },
  review:        { label: 'Reviews',      icon: 'fa-solid fa-star' },
  system:        { label: 'System',       icon: 'fa-solid fa-circle-info' },
  dispute:       { label: 'Disputes',     icon: 'fa-solid fa-scale-balanced' },
  verification:  { label: 'Verification', icon: 'fa-solid fa-badge-check' },
}

// ── Navigation ────────────────────────────────────────────────
// ROUTE_MAP: keyed by notification.type.
// Returns a route object or null (non-navigable = read-only card).
const ROUTE_MAP = {
  errand_update: (data) =>
    data?.errandId ? { name: 'ErrandDetail', params: { id: data.errandId } } : null,

  new_bid: (data) =>
    data?.errandId ? { name: 'ErrandDetail', params: { id: data.errandId } } : null,

  payment: (data) => {
    if (data?.errandId) return { name: 'ErrandDetail', params: { id: data.errandId } }
    if (data?.orderId)  return { name: 'OrderDetail',  params: { id: data.orderId  } }
    return { name: 'Wallet' }
  },

  cbc_credit: () => ({ name: 'Wallet' }),

  message: (data) =>
    data?.roomId ? { name: 'Chat', params: { roomId: data.roomId } } : { name: 'Chat' },

  review: (data) => {
    if (data?.errandId) return { name: 'ErrandDetail', params: { id: data.errandId } }
    if (data?.orderId)  return { name: 'OrderDetail',  params: { id: data.orderId  } }
    return null
  },

  dispute: (data) => {
    if (data?.errandId) return { name: 'ErrandDetail', params: { id: data.errandId } }
    if (data?.orderId)  return { name: 'OrderDetail',  params: { id: data.orderId  } }
    return null
  },

  verification: () => ({ name: 'Profile' }),

  // system: carries ticketId for support tickets.
  system: (data) =>
    data?.ticketId ? { name: 'SupportTicket', params: { ticketId: data.ticketId } } : null,
}

function getRoute(data, type) {
  const builder = ROUTE_MAP[type]
  if (!builder) return null
  return builder(data ?? {})
}

function isNavigable(notification) {
  return !!getRoute(notification.data ?? {}, notification.type)
}

const navigating = ref(null)

async function openNotification(notification) {
  if (navigating.value === notification._id) return
  if (!isNavigable(notification)) return

  navigating.value = notification._id
  try {
    const response = await notificationStore.resolveNotification(notification)
    const enrichedData = response?.notification?.data ?? notification.data ?? {}
    const route = getRoute(enrichedData, notification.type)
    if (route) router.push(route)
  } catch {
    const route = getRoute(notification.data ?? {}, notification.type)
    if (route) router.push(route)
  } finally {
    navigating.value = null
  }
}

// ── Filtering & grouping ──────────────────────────────────────
// Types actually present in the full list (for chip generation)
const availableTypes = computed(() => {
  const seen = new Set()
  notificationStore.notifications.forEach(n => seen.add(n.type))
  return [...seen].filter(t => TYPE_META[t]) // only known types
})

const filteredNotifications = computed(() => {
  let list = notificationStore.notifications
  if (activeTab.value === 'unread') list = notificationStore.unreadNotifications
  if (activeTab.value === 'read')   list = notificationStore.readNotifications
  if (selectedType.value) list = list.filter(n => n.type === selectedType.value)
  return list
})

const filteredGrouped = computed(() => {
  const groups = {}
  const today     = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  filteredNotifications.value.forEach((n) => {
    const d  = new Date(n.createdAt)
    const ds = d.toDateString()
    const key =
      ds === today     ? 'Today'     :
      ds === yesterday ? 'Yesterday' :
      d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    if (!groups[key]) groups[key] = []
    groups[key].push(n)
  })
  return groups
})

// ── Helpers ───────────────────────────────────────────────────
function getIconColors(type) {
  const cls = notificationStore.getNotificationIcon(type).class
  if (cls === 'success') return 'bg-cb-accent-subtle text-cb-accent'
  if (cls === 'warning') return 'bg-cb-warning-subtle text-cb-warning'
  return 'bg-cb-accent-subtle text-cb-accent'
}

function formatDetailedTime(dateString) {
  const date     = new Date(dateString)
  const now      = new Date()
  const diffMs   = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs  = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1)  return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHrs  < 24) return `${diffHrs}h ago`
  if (diffDays <  7) return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: diffDays > 365 ? 'numeric' : undefined,
  })
}

function truncateRef(ref) {
  if (!ref) return ''
  return ref.length > 12 ? `${ref.slice(0, 8)}…${ref.slice(-4)}` : ref
}

// ── Actions ───────────────────────────────────────────────────
async function handleMarkAsRead(id) {
  try {
    await notificationStore.markAsRead(id)
    showToast('Marked as read', 'success')
  } catch {
    showToast('Failed to mark as read', 'error')
  }
}

async function handleMarkAllRead() {
  try {
    await notificationStore.markAllAsRead()
    showToast('All notifications marked as read', 'success')
  } catch {
    showToast('Failed to mark all as read', 'error')
  }
}

function confirmDelete(notification) {
  notificationToDelete.value = notification
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!notificationToDelete.value) return
  deleting.value = true
  try {
    await notificationStore.deleteNotification(notificationToDelete.value._id)
    showToast('Notification deleted', 'success')
    showDeleteModal.value = false
    notificationToDelete.value = null
  } catch {
    showToast('Failed to delete', 'error')
  } finally {
    deleting.value = false
  }
}

async function loadMore() {
  if (loadingMore.value || !notificationStore.meta?.hasNextPage) return
  loadingMore.value = true
  currentPage.value++
  try {
    await notificationStore.fetchNotifications({ page: currentPage.value, append: true })
  } catch {
    showToast('Failed to load more', 'error')
  } finally {
    loadingMore.value = false
  }
}

onMounted(() => notificationStore.fetchNotifications())
</script>

<style scoped>
/* Card list transitions */
.card-list-enter-active { transition: opacity 0.22s ease, transform 0.22s ease; }
.card-list-leave-active  { transition: opacity 0.15s ease, transform 0.15s ease; }
.card-list-enter-from    { opacity: 0; transform: translateY(6px); }
.card-list-leave-to      { opacity: 0; transform: translateY(-4px); }

/* Delete modal overlay */
.overlay-enter-active { transition: opacity 0.2s ease; }
.overlay-leave-active { transition: opacity 0.15s ease; }
.overlay-enter-from,
.overlay-leave-to     { opacity: 0; }

/* Hide scrollbar on type chip row */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>