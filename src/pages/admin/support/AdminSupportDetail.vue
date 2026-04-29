<template>
  <div class="min-h-screen bg-cb-base">

    <!-- Header -->
    <div class="mb-6 flex items-center gap-3">
      <button @click="router.back()"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cb-divider bg-cb-card text-cb-muted transition-colors hover:bg-cb-field hover:text-cb-text">
        <i class="fa-solid fa-arrow-left text-sm"></i>
      </button>
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <span v-if="ticket" class="font-mono text-sm font-bold text-cb-muted">{{ ticket.ticketNumber }}</span>
        <div v-else class="h-4 w-24 animate-pulse rounded-full bg-cb-field"></div>
      </div>
      <template v-if="ticket">
        <span :class="['rounded-full px-2.5 py-1 text-[10px] font-semibold', statusClass(ticket.status)]">
          {{ statusLabel(ticket.status) }}
        </span>
        <span :class="['inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold', priorityClass(ticket.priority)]">
          <span :class="['h-1.5 w-1.5 rounded-full', priorityDot(ticket.priority)]"></span>
          {{ capitalize(ticket.priority) }}
        </span>
      </template>
    </div>

    <!-- Loading -->
    <div v-if="supportStore.loading && !ticket" class="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_380px] lg:items-start">
      <div class="space-y-4">
        <div class="h-28 animate-pulse rounded-2xl bg-cb-field"></div>
        <div class="h-40 animate-pulse rounded-2xl bg-cb-field"></div>
      </div>
      <div class="h-80 animate-pulse rounded-2xl bg-cb-field"></div>
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="flex flex-col items-center gap-4 py-20 text-center">
      <i class="fa-solid fa-circle-exclamation text-3xl text-cb-negative"></i>
      <p class="font-semibold text-cb-text">{{ loadError }}</p>
      <button @click="load" class="rounded-xl bg-cb-accent px-5 py-2.5 text-sm font-semibold text-cb-contrast">Retry</button>
    </div>

    <!-- Content -->
    <template v-else-if="ticket">
      <div class="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_380px] lg:items-start">

        <!-- ── LEFT ── -->
        <div class="space-y-4">

          <!-- User + ticket meta -->
          <section class="rounded-2xl border border-cb-divider bg-cb-card p-4 sm:p-5">
            <!-- Priority banner -->
            <div v-if="['urgent', 'high'].includes(ticket.priority)"
              :class="['mb-4 -mx-4 -mt-4 sm:-mx-5 sm:-mt-5 flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs font-semibold rounded-t-2xl', priorityBanner(ticket.priority)]">
              <i :class="ticket.priority === 'urgent' ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-exclamation'"></i>
              {{ ticket.priority === 'urgent' ? 'Urgent — prioritise this ticket' : 'High priority ticket' }}
            </div>

            <!-- User info -->
            <div class="mb-4 flex items-center gap-3 rounded-xl border border-cb-divider bg-cb-field p-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cb-accent text-sm font-bold text-cb-contrast">
                {{ userInitials(ticket) }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-cb-text">{{ userName(ticket) }}</p>
                <p class="text-xs text-cb-muted">{{ userEmail(ticket) }}</p>
              </div>
              <span class="rounded-full border border-cb-divider bg-cb-card px-2 py-0.5 text-[10px] font-semibold capitalize text-cb-muted">
                {{ getUser(ticket)?.role ?? 'user' }}
              </span>
            </div>

            <!-- Category / type -->
            <div class="mb-3 flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-cb-accent-subtle px-2.5 py-1 text-xs font-semibold text-cb-accent">
                <i :class="getCategoryIcon(ticket.category)"></i>
                {{ categoryLabel(ticket.category) }}
              </span>
              <i class="fa-solid fa-chevron-right text-[10px] text-cb-muted-40"></i>
              <span class="rounded-full border border-cb-divider bg-cb-field px-2.5 py-1 text-xs text-cb-text">
                {{ typeLabel(ticket.category, ticket.type) }}
              </span>
            </div>

            <!-- Meta rows -->
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-cb-muted">Ticket ID</span>
                <span class="font-mono text-xs text-cb-text">{{ ticket._id }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-cb-muted">Submitted</span>
                <span class="text-cb-text">{{ formatDateTime(ticket.createdAt) }}</span>
              </div>
              <div v-if="ticket.resolvedAt" class="flex items-center justify-between">
                <span class="text-cb-muted">Resolved</span>
                <span class="text-cb-text">{{ formatDateTime(ticket.resolvedAt) }}</span>
              </div>
              <div v-if="ticket.relatedId" class="flex items-center justify-between">
                <span class="text-cb-muted">Related ID</span>
                <span class="font-mono text-xs text-cb-text">{{ ticket.relatedId }}</span>
              </div>
            </div>
          </section>

          <!-- Description -->
          <section class="rounded-2xl border border-cb-divider bg-cb-card p-4 sm:p-5">
            <p class="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">User's message</p>
            <p class="whitespace-pre-line text-sm leading-relaxed text-cb-text">{{ ticket.description }}</p>
          </section>

          <!-- Existing admin note -->
          <section v-if="ticket.adminNote" class="rounded-2xl border border-cb-accent/20 bg-cb-accent-subtle p-4 sm:p-5">
            <p class="mb-2 text-[10px] font-semibold uppercase tracking-wider text-cb-accent">Admin response (saved)</p>
            <p class="whitespace-pre-line text-sm leading-relaxed text-cb-text">{{ ticket.adminNote }}</p>
          </section>
        </div>

        <!-- ── RIGHT: Action panel ── -->
        <aside class="lg:sticky lg:top-6 lg:self-start">
          <div class="overflow-hidden rounded-2xl border border-cb-divider bg-cb-card shadow-sm">

            <div class="border-b border-cb-divider px-4 py-3.5">
              <p class="text-sm font-bold text-cb-text">Respond to Ticket</p>
            </div>

            <div class="p-4 space-y-4">

              <!-- ── Quick workflow buttons ── -->
              <div>
                <p class="mb-2 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">Quick actions</p>
                <div class="space-y-2">

                  <!-- Mark In Review -->
                  <button
                    v-if="ticket.status === 'open'"
                    @click="applyWorkflow('in_review')"
                    :disabled="supportStore.actionLoading"
                    class="flex w-full items-center gap-3 rounded-xl border border-cb-warning/30 bg-cb-warning-subtle px-3.5 py-2.5 text-left transition-all hover:border-cb-warning/60 disabled:opacity-60"
                  >
                    <i class="fa-solid fa-magnifying-glass shrink-0 text-sm text-cb-warning"></i>
                    <div>
                      <p class="text-sm font-semibold text-cb-warning">Mark In Review</p>
                      <p class="text-[11px] text-cb-warning/70">Notify the user we're investigating</p>
                    </div>
                  </button>

                  <!-- Resolve with note -->
                  <button
                    v-if="['open', 'in_review'].includes(ticket.status)"
                    @click="applyWorkflow('resolved')"
                    :disabled="supportStore.actionLoading"
                    class="flex w-full items-center gap-3 rounded-xl border border-cb-accent/30 bg-cb-accent-subtle px-3.5 py-2.5 text-left transition-all hover:border-cb-accent/60 disabled:opacity-60"
                  >
                    <i class="fa-solid fa-circle-check shrink-0 text-sm text-cb-accent"></i>
                    <div>
                      <p class="text-sm font-semibold text-cb-accent">Resolve with Note</p>
                      <p class="text-[11px] text-cb-accent/70">Mark resolved and send a response</p>
                    </div>
                  </button>

                  <!-- Close -->
                  <button
                    v-if="['open', 'in_review', 'resolved'].includes(ticket.status)"
                    @click="applyWorkflow('closed')"
                    :disabled="supportStore.actionLoading"
                    class="flex w-full items-center gap-3 rounded-xl border border-cb-divider bg-cb-field px-3.5 py-2.5 text-left transition-all hover:border-cb-divider/60 disabled:opacity-60"
                  >
                    <i class="fa-solid fa-xmark-circle shrink-0 text-sm text-cb-muted"></i>
                    <div>
                      <p class="text-sm font-semibold text-cb-text">Close Ticket</p>
                      <p class="text-[11px] text-cb-muted">Close without further action</p>
                    </div>
                  </button>

                  <!-- Already closed/resolved note -->
                  <div v-if="['closed', 'resolved'].includes(ticket.status)"
                    class="flex items-center gap-2 rounded-xl border border-cb-divider bg-cb-field px-3.5 py-2.5 text-xs font-semibold text-cb-muted">
                    <i class="fa-solid fa-lock text-[11px]"></i>
                    Ticket is {{ statusLabel(ticket.status).toLowerCase() }}
                  </div>
                </div>
              </div>

              <!-- Divider -->
              <div class="border-t border-cb-divider"></div>

              <!-- ── Manual update form ── -->
              <div>
                <p class="mb-3 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">Manual update</p>

                <!-- Status -->
                <div class="mb-3">
                  <label class="mb-1.5 block text-xs font-semibold text-cb-muted">Status</label>
                  <div class="grid grid-cols-2 gap-2">
                    <button v-for="s in statusOptions" :key="s.value" @click="form.status = s.value"
                      :class="['rounded-xl border-2 px-3 py-2 text-xs font-semibold transition-all text-center', form.status === s.value ? `${s.activeCls} border-current` : 'border-cb-divider text-cb-muted hover:border-cb-accent/30']">
                      {{ s.label }}
                    </button>
                  </div>
                </div>

                <!-- Priority override -->
                <div class="mb-3">
                  <label class="mb-1.5 block text-xs font-semibold text-cb-muted">Priority</label>
                  <div class="grid grid-cols-2 gap-2">
                    <button v-for="p in priorityOptions" :key="p.value" @click="form.priority = p.value"
                      :class="['rounded-xl border-2 px-3 py-2 text-xs font-semibold transition-all text-center', form.priority === p.value ? `${p.activeCls} border-current` : 'border-cb-divider text-cb-muted hover:border-cb-accent/30']">
                      {{ p.label }}
                    </button>
                  </div>
                </div>

                <!-- Admin note -->
                <div class="mb-4">
                  <label class="mb-1.5 block text-xs font-semibold text-cb-muted">
                    Response to user
                    <span class="font-normal text-cb-muted-40">(optional)</span>
                  </label>
                  <textarea v-model="form.adminNote" rows="4"
                    placeholder="Write a response the user will see on their ticket…"
                    class="w-full resize-none rounded-xl border border-cb-divider bg-cb-field p-3 text-sm text-cb-text placeholder:text-cb-muted-40 focus:border-cb-accent focus:outline-none"></textarea>
                </div>

                <!-- Error -->
                <div v-if="updateError" class="mb-3 flex items-start gap-2 rounded-xl border border-cb-negative/20 bg-cb-negative-subtle p-3">
                  <i class="fa-solid fa-circle-exclamation mt-0.5 text-xs text-cb-negative"></i>
                  <p class="text-xs text-cb-negative">{{ updateError }}</p>
                </div>

                <!-- Success -->
                <div v-if="updateSuccess" class="mb-3 flex items-center gap-2 rounded-xl border border-cb-accent/20 bg-cb-accent-subtle p-3">
                  <i class="fa-solid fa-circle-check text-sm text-cb-accent"></i>
                  <p class="text-sm font-semibold text-cb-accent">Ticket updated</p>
                </div>

                <button @click="handleUpdate" :disabled="supportStore.actionLoading || !hasChanges"
                  class="flex w-full items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark disabled:cursor-not-allowed disabled:opacity-50">
                  <i v-if="supportStore.actionLoading" class="fa-solid fa-spinner fa-spin text-xs"></i>
                  <i v-else class="fa-solid fa-floppy-disk text-xs"></i>
                  {{ supportStore.actionLoading ? 'Saving…' : 'Save Changes' }}
                </button>
                <p v-if="!hasChanges" class="mt-1.5 text-center text-[11px] text-cb-muted-40">No changes to save</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSupportStore } from '@/stores/supportStore'
import { useToast } from '@/composables/useToast'

const route        = useRoute()
const router       = useRouter()
const supportStore = useSupportStore()
const toast        = useToast()

const loadError     = ref(null)
const updateError   = ref('')
const updateSuccess = ref(false)
const ticket        = computed(() => supportStore.currentTicket)

const form = ref({ status: '', priority: '', adminNote: '' })

const hasChanges = computed(() => {
  if (!ticket.value) return false
  return (
    form.value.status    !== ticket.value.status ||
    form.value.priority  !== ticket.value.priority ||
    form.value.adminNote !== (ticket.value.adminNote ?? '')
  )
})

watch(ticket, (t) => {
  if (t) form.value = { status: t.status, priority: t.priority, adminNote: t.adminNote ?? '' }
}, { immediate: true })

async function load() {
  loadError.value = null
  supportStore.clearCurrentTicket()
  try {
    await supportStore.fetchAdminTicket(route.params.ticketId)
    supportStore.fetchCategories()
  } catch (err) {
    loadError.value = err?.response?.data?.message || 'Failed to load ticket'
  }
}

// ── Quick workflow: one-click status transitions matching PATCH examples ──
async function applyWorkflow(targetStatus) {
  updateError.value = ''
  updateSuccess.value = false

  // Pre-fill form with the workflow's values but don't send adminNote
  // unless the user has typed one — the quick buttons just change status
  const payload = { status: targetStatus }
  if (form.value.adminNote.trim()) payload.adminNote = form.value.adminNote.trim()

  try {
    await supportStore.updateTicket(ticket.value._id, payload)
    updateSuccess.value = true
    toast.success(`Ticket ${statusLabel(targetStatus).toLowerCase()}`)
    setTimeout(() => { updateSuccess.value = false }, 3000)
  } catch {
    updateError.value = supportStore.error || 'Failed to update ticket'
  }
}

async function handleUpdate() {
  updateError.value = ''
  updateSuccess.value = false

  const payload = {}
  if (form.value.status   !== ticket.value.status)             payload.status    = form.value.status
  if (form.value.priority !== ticket.value.priority)           payload.priority  = form.value.priority
  if (form.value.adminNote !== (ticket.value.adminNote ?? '')) payload.adminNote = form.value.adminNote

  try {
    await supportStore.updateTicket(ticket.value._id, payload)
    updateSuccess.value = true
    setTimeout(() => { updateSuccess.value = false }, 3000)
  } catch {
    updateError.value = supportStore.error || 'Failed to update ticket'
  }
}

// ── Options ────────────────────────────────────────────────────
const statusOptions = [
  { value: 'open',      label: 'Open',      activeCls: 'text-cb-accent bg-cb-accent-subtle' },
  { value: 'in_review', label: 'In Review', activeCls: 'text-cb-warning bg-cb-warning-subtle' },
  { value: 'resolved',  label: 'Resolved',  activeCls: 'text-cb-accent bg-cb-accent-subtle' },
  { value: 'closed',    label: 'Closed',    activeCls: 'text-cb-muted bg-cb-field' },
]
const priorityOptions = [
  { value: 'urgent', label: '🔴 Urgent', activeCls: 'text-cb-negative bg-cb-negative-subtle' },
  { value: 'high',   label: '🟠 High',   activeCls: 'text-cb-warning bg-cb-warning-subtle' },
  { value: 'medium', label: '🔵 Medium', activeCls: 'text-cb-accent bg-cb-accent-subtle' },
  { value: 'low',    label: '🟢 Low',    activeCls: 'text-cb-muted bg-cb-field' },
]

// ── User helpers ───────────────────────────────────────────────
function getUser(ticket)     { return typeof ticket.userId === 'object' ? ticket.userId : null }
function userName(ticket)    { const u = getUser(ticket); if (!u) return 'Unknown'; return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown' }
function userEmail(ticket)   { return getUser(ticket)?.email ?? '' }
function userInitials(ticket){ const u = getUser(ticket); if (!u) return '?'; const f = u.firstName?.[0] || '', l = u.lastName?.[0] || ''; return (f + l).toUpperCase() || '?' }

// ── Display helpers ────────────────────────────────────────────
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
const CATEGORY_ICONS = { payment: 'fa-solid fa-credit-card', errand: 'fa-solid fa-box', order: 'fa-solid fa-bag-shopping', account: 'fa-solid fa-user', technical: 'fa-solid fa-wrench', other: 'fa-solid fa-ellipsis' }
const PRIORITY_BANNER = { urgent: 'bg-cb-negative-subtle text-cb-negative', high: 'bg-cb-warning-subtle text-cb-warning' }

function statusLabel(s)    { return STATUS_MAP[s]?.label ?? s?.replace(/_/g, ' ') ?? s }
function statusClass(s)    { return STATUS_MAP[s]?.cls ?? 'bg-cb-field text-cb-muted' }
function priorityClass(p)  { return PRIORITY_MAP[p]?.cls ?? 'bg-cb-field text-cb-muted' }
function priorityDot(p)    { return PRIORITY_MAP[p]?.dot ?? 'bg-cb-muted' }
function priorityBanner(p) { return PRIORITY_BANNER[p] ?? '' }
function capitalize(s)     { return s ? s.charAt(0).toUpperCase() + s.slice(1) : '' }
function getCategoryIcon(v){ return CATEGORY_ICONS[v] ?? 'fa-solid fa-circle-question' }
function categoryLabel(val){ return supportStore.categories.find(c => c.value === val)?.label ?? val?.replace(/_/g, ' ') ?? val }
function typeLabel(catVal, typeVal){ return supportStore.getTypesForCategory(catVal).find(t => t.value === typeVal)?.label ?? typeVal?.replace(/_/g, ' ') ?? typeVal }
function formatDateTime(iso){ if (!iso) return ''; return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) }

onMounted(load)
</script>