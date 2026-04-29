<template>
  <div class="min-h-screen bg-cb-base">

    <!-- Header -->
    <header class="sticky -top-8 z-10  bg-cb-base/95 backdrop-blur-sm">
      <div class="mx-auto max-w-7xl ">
        <div class="flex items-center justify-between gap-3 py-4">
          <div>
            <h1 class="text-lg font-bold text-cb-text sm:text-xl">Support</h1>
            <p class="mt-0.5 text-xs text-cb-muted">Get help with your account and activity</p>
          </div>
          <router-link
            :to="{ name: 'CreateTicket' }"
            class="inline-flex items-center gap-2 rounded-xl bg-cb-accent px-4 py-2.5 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark hover:shadow-md hover:shadow-cb-accent/25"
          >
            <i class="fa-solid fa-plus text-xs"></i>
            <span class="hidden sm:inline">New Issue</span>
            <span class="sm:hidden">New</span>
          </router-link>
        </div>

        <!-- Status tabs -->
        <div class="flex gap-0 overflow-x-auto border-b border-cb-divider -mb-px no-scrollbar">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeStatus = tab.key"
            :class="[
              'relative shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-colors',
              activeStatus === tab.key ? 'text-cb-accent' : 'text-cb-muted hover:text-cb-text',
            ]"
          >
            {{ tab.label }}
            <span
              v-if="statusCount(tab.key) > 0"
              :class="['inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[9px] font-bold', activeStatus === tab.key ? 'bg-cb-accent text-cb-contrast' : 'bg-cb-field text-cb-muted']"
            >
              {{ statusCount(tab.key) }}
            </span>
            <span v-if="activeStatus === tab.key" class="absolute inset-x-0 -bottom-px h-0.5 rounded-t bg-cb-accent"></span>
          </button>
        </div>
      </div>
    </header>

    <!-- Body -->
    <div class="mx-auto max-w-7xl  py-5">

      <!-- Loading -->
      <div v-if="supportStore.loading && !supportStore.tickets.length" class="space-y-3">
        <div v-for="i in 4" :key="i" class="rounded-2xl border border-cb-divider bg-cb-card p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 space-y-2">
              <div class="h-4 w-1/3 animate-pulse rounded-full bg-cb-field"></div>
              <div class="h-3 w-2/3 animate-pulse rounded-full bg-cb-field"></div>
              <div class="h-3 w-1/2 animate-pulse rounded-full bg-cb-field"></div>
            </div>
            <div class="h-6 w-16 animate-pulse rounded-full bg-cb-field"></div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="!filteredTickets.length" class="flex flex-col items-center justify-center py-20 text-center">
        <div class="mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-cb-divider bg-cb-card">
          <i class="fa-regular fa-headset text-3xl text-cb-muted-40"></i>
        </div>
        <h3 class="mb-1.5 text-base font-bold text-cb-text">
          {{ activeStatus === 'all' ? 'No tickets yet' : `No ${tabLabel(activeStatus)} tickets` }}
        </h3>
        <p class="mb-6 max-w-xs text-sm leading-relaxed text-cb-muted">
          {{ activeStatus === 'all' ? "Need help? Submit a ticket and our team will get back to you." : "No tickets with this status." }}
        </p>
        <router-link
          v-if="activeStatus === 'all'"
          :to="{ name: 'CreateTicket' }"
          class="inline-flex items-center gap-2 rounded-xl bg-cb-accent px-5 py-2.5 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark"
        >
          <i class="fa-solid fa-plus text-xs"></i>
          Submit a ticket
        </router-link>
      </div>

      <!-- Ticket list -->
      <div v-else class="space-y-3">
        <TransitionGroup name="card-list" tag="div" class="space-y-3">
          <div
            v-for="ticket in filteredTickets"
            :key="ticket._id"
            @click="router.push({ name: 'SupportTicket', params: { ticketId: ticket._id } })"
            class="group cursor-pointer rounded-2xl border border-cb-divider bg-cb-card p-4 transition-all hover:border-cb-accent/30 hover:shadow-sm sm:p-5"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div class="mb-1.5 flex flex-wrap items-center gap-2">
                  <span class="font-mono text-xs font-bold text-cb-muted">{{ ticket.ticketNumber }}</span>
                  <span :class="['inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', priorityClass(ticket.priority)]">
                    <span :class="['h-1.5 w-1.5 rounded-full', priorityDot(ticket.priority)]"></span>
                    {{ capitalize(ticket.priority) }}
                  </span>
                </div>

                <p class="mb-1 text-sm font-semibold text-cb-text">
                  {{ categoryLabel(ticket.category) }}
                  <span class="mx-1 text-cb-muted-40">·</span>
                  <span class="font-normal text-cb-muted">{{ typeLabel(ticket.category, ticket.type) }}</span>
                </p>

                <p class="line-clamp-2 text-xs leading-relaxed text-cb-muted">{{ ticket.description }}</p>

                <div class="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-cb-muted-40">
                  <span class="flex items-center gap-1">
                    <i class="fa-regular fa-clock text-[9px]"></i>
                    {{ formatTime(ticket.createdAt) }}
                  </span>
                  <span v-if="ticket.updatedAt !== ticket.createdAt" class="flex items-center gap-1">
                    <i class="fa-solid fa-rotate text-[9px]"></i>
                    Updated {{ formatTime(ticket.updatedAt) }}
                  </span>
                </div>
              </div>

              <div class="flex shrink-0 flex-col items-end gap-2">
                <span :class="['inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold', statusClass(ticket.status)]">
                  {{ statusLabel(ticket.status) }}
                </span>
                <i class="fa-solid fa-chevron-right text-[10px] text-cb-muted-40 transition-transform group-hover:translate-x-0.5"></i>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <!-- Load more -->
        <div v-if="supportStore.meta?.hasNextPage" class="flex justify-center py-2">
          <button @click="loadMore" :disabled="loadingMore"
            class="flex items-center gap-2 rounded-xl border border-cb-divider bg-cb-card px-6 py-2.5 text-sm font-semibold text-cb-text transition-all hover:border-cb-accent/50 hover:bg-cb-field disabled:opacity-50">
            <i v-if="loadingMore" class="fa-solid fa-spinner fa-spin text-xs"></i>
            <i v-else class="fa-solid fa-chevron-down text-xs text-cb-muted"></i>
            {{ loadingMore ? 'Loading…' : 'Load more' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSupportStore } from '@/stores/supportStore'

const router       = useRouter()
const supportStore = useSupportStore()

const activeStatus = ref('all')
const loadingMore  = ref(false)
const currentPage  = ref(1)

// Correct status values matching the API
const tabs = [
  { key: 'all',       label: 'All' },
  { key: 'open',      label: 'Open' },
  { key: 'in_review', label: 'In Review' },
  { key: 'resolved',  label: 'Resolved' },
  { key: 'closed',    label: 'Closed' },
]

const filteredTickets = computed(() => {
  if (activeStatus.value === 'all') return supportStore.tickets
  return supportStore.tickets.filter(t => t.status === activeStatus.value)
})

function statusCount(key) {
  if (key === 'all') return supportStore.tickets.length
  return supportStore.tickets.filter(t => t.status === key).length
}

function tabLabel(key) {
  return tabs.find(t => t.key === key)?.label ?? key
}

const STATUS_MAP = {
  open:      { label: 'Open',      cls: 'bg-cb-accent-subtle text-cb-accent' },
  in_review: { label: 'In Review', cls: 'bg-cb-warning-subtle text-cb-warning' },
  resolved:  { label: 'Resolved',  cls: 'bg-cb-accent-subtle text-cb-accent' },
  closed:    { label: 'Closed',    cls: 'bg-cb-field text-cb-muted' },
}
const PRIORITY_MAP = {
  urgent: { cls: 'bg-cb-negative-subtle text-cb-negative', dot: 'bg-cb-negative' },
  high:   { cls: 'bg-cb-warning-subtle text-cb-warning',   dot: 'bg-cb-warning' },
  medium: { cls: 'bg-cb-accent-subtle text-cb-accent',     dot: 'bg-cb-accent' },
  low:    { cls: 'bg-cb-field text-cb-muted',              dot: 'bg-cb-muted' },
}

function statusLabel(s)   { return STATUS_MAP[s]?.label ?? s?.replace(/_/g, ' ') ?? s }
function statusClass(s)   { return STATUS_MAP[s]?.cls ?? 'bg-cb-field text-cb-muted' }
function priorityClass(p) { return PRIORITY_MAP[p]?.cls ?? 'bg-cb-field text-cb-muted' }
function priorityDot(p)   { return PRIORITY_MAP[p]?.dot ?? 'bg-cb-muted' }
function capitalize(s)    { return s ? s.charAt(0).toUpperCase() + s.slice(1) : '' }

function categoryLabel(val) {
  return supportStore.categories.find(c => c.value === val)?.label ?? val?.replace(/_/g, ' ') ?? val
}
function typeLabel(catVal, typeVal) {
  return supportStore.getTypesForCategory(catVal).find(t => t.value === typeVal)?.label ?? typeVal?.replace(/_/g, ' ') ?? typeVal
}
function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const diffMs = Date.now() - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs  = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1)  return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHrs  < 24) return `${diffHrs}h ago`
  if (diffDays < 7)  return `${diffDays}d ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

async function loadMore() {
  if (loadingMore.value || !supportStore.meta?.hasNextPage) return
  loadingMore.value = true
  currentPage.value++
  try { await supportStore.fetchMyTickets({ page: currentPage.value }) }
  finally { loadingMore.value = false }
}

onMounted(async () => {
  await supportStore.fetchMyTickets()
  supportStore.fetchCategories()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.card-list-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.card-list-leave-active  { transition: opacity 0.15s ease; }
.card-list-enter-from    { opacity: 0; transform: translateY(6px); }
.card-list-leave-to      { opacity: 0; }
</style>