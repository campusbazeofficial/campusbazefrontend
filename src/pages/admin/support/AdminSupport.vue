<template>
  <div class="min-h-screen bg-cb-base">

    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-cb-text">Support Tickets</h1>
        <p class="mt-0.5 text-sm text-cb-muted">
          {{ supportStore.adminMeta?.total ?? 0 }} ticket{{ supportStore.adminMeta?.total !== 1 ? 's' : '' }} total
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <div v-for="stat in quickStats" :key="stat.label"
          class="flex items-center gap-2 rounded-xl border border-cb-divider bg-cb-card px-3 py-2">
          <span :class="['h-2 w-2 rounded-full', stat.dot]"></span>
          <span class="text-xs font-bold text-cb-text">{{ stat.count }}</span>
          <span class="text-xs text-cb-muted">{{ stat.label }}</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-5 flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-1 rounded-xl border border-cb-divider bg-cb-card p-1">
        <button v-for="s in statusOptions" :key="s.value" @click="setFilter('status', s.value)"
          :class="['rounded-lg px-3 py-1.5 text-xs font-semibold transition-all', filters.status === s.value ? 'bg-cb-accent text-cb-contrast shadow-sm' : 'text-cb-muted hover:text-cb-text']">
          {{ s.label }}
        </button>
      </div>

      <DropDownComponent ref="priorityDrop" :label="priorityFilterLabel" :min-width="160" bgClass="bg-cb-card" textClass="text-cb-text">
        <div class="p-1.5">
          <button
            v-for="p in priorityOptions" :key="p.value"
            type="button"
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-cb-field"
            :class="filters.priority === p.value ? 'text-cb-accent font-semibold' : 'text-cb-text'"
            @click="filters.priority = p.value; priorityDrop.close(); applyFilters()">
            {{ p.label }}
            <i v-if="filters.priority === p.value" class="fa-solid fa-check ml-auto text-xs text-cb-accent" />
          </button>
        </div>
      </DropDownComponent>

      <DropDownComponent ref="categoryDrop" :label="categoryFilterLabel" :min-width="180" bgClass="bg-cb-card" textClass="text-cb-text">
        <div class="p-1.5">
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-cb-field"
            :class="filters.category === '' ? 'text-cb-accent font-semibold' : 'text-cb-text'"
            @click="filters.category = ''; categoryDrop.close(); applyFilters()">
            All categories
            <i v-if="filters.category === ''" class="fa-solid fa-check ml-auto text-xs text-cb-accent" />
          </button>
          <button
            v-for="cat in supportStore.categories" :key="cat.value"
            type="button"
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-cb-field"
            :class="filters.category === cat.value ? 'text-cb-accent font-semibold' : 'text-cb-text'"
            @click="filters.category = cat.value; categoryDrop.close(); applyFilters()">
            {{ cat.label }}
            <i v-if="filters.category === cat.value" class="fa-solid fa-check ml-auto text-xs text-cb-accent" />
          </button>
        </div>
      </DropDownComponent>

      <button v-if="hasActiveFilters" @click="clearFilters"
        class="flex items-center gap-1.5 rounded-xl border border-cb-divider bg-cb-card px-3 py-2 text-xs font-semibold text-cb-muted hover:text-cb-text">
        <i class="fa-solid fa-xmark text-[10px]"></i> Clear
      </button>
      <span class="ml-auto text-xs text-cb-muted">{{ supportStore.adminTickets.length }} shown</span>
    </div>

    <!-- Loading -->
    <div v-if="supportStore.loading && !supportStore.adminTickets.length" class="space-y-2">
      <div v-for="i in 5" :key="i" class="h-20 animate-pulse rounded-2xl bg-cb-field"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="!supportStore.adminTickets.length"
      class="flex flex-col items-center justify-center py-20 text-center">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-cb-divider bg-cb-card">
        <i class="fa-regular fa-ticket text-2xl text-cb-muted-40"></i>
      </div>
      <p class="font-semibold text-cb-text">No tickets found</p>
      <p class="mt-1 text-sm text-cb-muted">{{ hasActiveFilters ? 'Try adjusting your filters.' : 'No support tickets yet.' }}</p>
    </div>

    <!-- List -->
    <div v-else class="space-y-2">
      <div class="hidden grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 text-[10px] font-bold uppercase tracking-wider text-cb-muted sm:grid">
        <span>User</span><span>Category / Type</span><span>Ticket</span><span>Priority</span><span>Status</span><span>Submitted</span><span></span>
      </div>

      <TransitionGroup name="card-list" tag="div" class="space-y-2">
        <div v-for="ticket in supportStore.adminTickets" :key="ticket._id"
          @click="router.push({ name: 'AdminSupportDetail', params: { ticketId: ticket._id } })"
          class="group cursor-pointer rounded-2xl border border-cb-divider bg-cb-card p-4 transition-all hover:border-cb-accent/30 hover:shadow-sm">

          <!-- Mobile -->
          <div class="sm:hidden">
            <div class="mb-2 flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-cb-text">{{ userName(ticket) }}</p>
                <p class="text-[11px] text-cb-muted">{{ userEmail(ticket) }}</p>
              </div>
              <span :class="['shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold', statusClass(ticket.status)]">
                {{ statusLabel(ticket.status) }}
              </span>
            </div>
            <div class="flex flex-wrap items-center gap-2 text-[11px] text-cb-muted">
              <span class="font-mono font-bold">{{ ticket.ticketNumber }}</span>
              <span>·</span>
              <span>{{ categoryLabel(ticket.category) }}</span>
              <span>·</span>
              <span :class="['font-semibold', priorityTextClass(ticket.priority)]">{{ capitalize(ticket.priority) }}</span>
              <span class="ml-auto">{{ formatTime(ticket.createdAt) }}</span>
            </div>
          </div>

          <!-- Desktop -->
          <div class="hidden grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 sm:grid">
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-cb-text">{{ userName(ticket) }}</p>
              <p class="truncate text-xs text-cb-muted">{{ userEmail(ticket) }}</p>
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-cb-text">{{ categoryLabel(ticket.category) }}</p>
              <p class="truncate text-xs text-cb-muted">{{ typeLabel(ticket.category, ticket.type) }}</p>
            </div>
            <span class="font-mono text-xs font-bold text-cb-muted">{{ ticket.ticketNumber }}</span>
            <span :class="['inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', priorityClass(ticket.priority)]">
              <span :class="['h-1.5 w-1.5 rounded-full', priorityDot(ticket.priority)]"></span>
              {{ capitalize(ticket.priority) }}
            </span>
            <span :class="['inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold', statusClass(ticket.status)]">
              {{ statusLabel(ticket.status) }}
            </span>
            <span class="text-xs text-cb-muted">{{ formatTime(ticket.createdAt) }}</span>
            <i class="fa-solid fa-chevron-right text-[10px] text-cb-muted-40 transition-transform group-hover:translate-x-0.5"></i>
          </div>
        </div>
      </TransitionGroup>

      <!-- Pagination -->
      <div v-if="supportStore.adminMeta && supportStore.adminMeta.totalPages > 1"
        class="flex items-center justify-center gap-2 pt-4">
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1 || supportStore.loading"
          class="flex h-9 w-9 items-center justify-center rounded-xl border border-cb-divider bg-cb-card text-sm text-cb-muted disabled:opacity-40 hover:bg-cb-field">
          <i class="fa-solid fa-chevron-left text-xs"></i>
        </button>
        <span class="text-sm text-cb-muted">Page {{ currentPage }} of {{ supportStore.adminMeta.totalPages }}</span>
        <button @click="goToPage(currentPage + 1)" :disabled="!supportStore.adminMeta.hasNextPage || supportStore.loading"
          class="flex h-9 w-9 items-center justify-center rounded-xl border border-cb-divider bg-cb-card text-sm text-cb-muted disabled:opacity-40 hover:bg-cb-field">
          <i class="fa-solid fa-chevron-right text-xs"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSupportStore } from '@/stores/supportStore'
import DropDownComponent from '@/components/reusables/DropDownComponent.vue'

const router       = useRouter()
const supportStore = useSupportStore()
const currentPage  = ref(1)
const filters      = ref({ status: '', priority: '', category: '' })

const priorityDrop = ref(null)
const categoryDrop = ref(null)

const priorityOptions = [
  { value: '',       label: 'All priorities' },
  { value: 'urgent', label: '🔴 Urgent'      },
  { value: 'high',   label: '🟠 High'        },
  { value: 'medium', label: '🔵 Medium'      },
  { value: 'low',    label: '🟢 Low'         },
]

const priorityFilterLabel = computed(() =>
  priorityOptions.find(p => p.value === filters.value.priority)?.label ?? 'All priorities'
)

const categoryFilterLabel = computed(() =>
  supportStore.categories.find(c => c.value === filters.value.category)?.label ?? 'All categories'
)

const statusOptions = [
  { value: '',          label: 'All'       },
  { value: 'open',      label: 'Open'      },
  { value: 'in_review', label: 'In Review' },
  { value: 'resolved',  label: 'Resolved'  },
  { value: 'closed',    label: 'Closed'    },
]

const hasActiveFilters = computed(() =>
  !!(filters.value.status || filters.value.priority || filters.value.category)
)

const quickStats = computed(() => {
  const all = supportStore.adminTickets
  return [
    { label: 'Urgent',    count: all.filter(t => t.priority === 'urgent').length,  dot: 'bg-cb-negative' },
    { label: 'Open',      count: all.filter(t => t.status === 'open').length,      dot: 'bg-cb-accent'   },
    { label: 'In Review', count: all.filter(t => t.status === 'in_review').length, dot: 'bg-cb-warning'  },
  ]
})

function getUser(ticket) { return typeof ticket.userId === 'object' ? ticket.userId : null }
function userName(ticket) {
  const u = getUser(ticket)
  if (!u) return 'Unknown user'
  return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown'
}
function userEmail(ticket) { return getUser(ticket)?.email ?? '' }

const STATUS_MAP = {
  open:      { label: 'Open',      cls: 'bg-cb-accent-subtle text-cb-accent'   },
  in_review: { label: 'In Review', cls: 'bg-cb-warning-subtle text-cb-warning' },
  resolved:  { label: 'Resolved',  cls: 'bg-cb-accent-subtle text-cb-accent'   },
  closed:    { label: 'Closed',    cls: 'bg-cb-field text-cb-muted'            },
}
const PRIORITY_MAP = {
  urgent: { cls: 'bg-cb-negative-subtle text-cb-negative', dot: 'bg-cb-negative', text: 'text-cb-negative' },
  high:   { cls: 'bg-cb-warning-subtle text-cb-warning',   dot: 'bg-cb-warning',  text: 'text-cb-warning'  },
  medium: { cls: 'bg-cb-accent-subtle text-cb-accent',     dot: 'bg-cb-accent',   text: 'text-cb-accent'   },
  low:    { cls: 'bg-cb-field text-cb-muted',              dot: 'bg-cb-muted',    text: 'text-cb-muted'    },
}

function statusLabel(s)       { return STATUS_MAP[s]?.label ?? s?.replace(/_/g, ' ') ?? s }
function statusClass(s)       { return STATUS_MAP[s]?.cls ?? 'bg-cb-field text-cb-muted' }
function priorityClass(p)     { return PRIORITY_MAP[p]?.cls ?? 'bg-cb-field text-cb-muted' }
function priorityDot(p)       { return PRIORITY_MAP[p]?.dot ?? 'bg-cb-muted' }
function priorityTextClass(p) { return PRIORITY_MAP[p]?.text ?? 'text-cb-muted' }
function capitalize(s)        { return s ? s.charAt(0).toUpperCase() + s.slice(1) : '' }
function categoryLabel(val)   { return supportStore.categories.find(c => c.value === val)?.label ?? val?.replace(/_/g, ' ') ?? val }
function typeLabel(catVal, typeVal) {
  return supportStore.getTypesForCategory(catVal).find(t => t.value === typeVal)?.label ?? typeVal?.replace(/_/g, ' ') ?? typeVal
}
function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso), diff = Math.floor((Date.now() - d) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7)  return `${diff}d ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function buildParams() {
  const p = { page: currentPage.value }
  if (filters.value.status)   p.status   = filters.value.status
  if (filters.value.priority) p.priority = filters.value.priority
  if (filters.value.category) p.category = filters.value.category
  return p
}

function setFilter(key, value) { filters.value[key] = value; currentPage.value = 1; applyFilters() }
async function applyFilters()  { currentPage.value = 1; await supportStore.fetchAdminTickets(buildParams()) }
async function goToPage(page)  { currentPage.value = page; await supportStore.fetchAdminTickets(buildParams()); window.scrollTo({ top: 0 }) }
function clearFilters()        { filters.value = { status: '', priority: '', category: '' }; currentPage.value = 1; supportStore.fetchAdminTickets() }

onMounted(async () => { await supportStore.fetchAdminTickets(); supportStore.fetchCategories() })
</script>

<style scoped>
.card-list-enter-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.card-list-leave-active  { transition: opacity 0.12s ease; }
.card-list-enter-from    { opacity: 0; transform: translateY(4px); }
.card-list-leave-to      { opacity: 0; }
</style>