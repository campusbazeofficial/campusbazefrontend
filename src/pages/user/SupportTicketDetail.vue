<template>
  <div class="min-h-screen bg-cb-base">

    <!-- ── Header ──────────────────────────────────────────── -->
    <header class="sticky -top-8 z-10 border-b border-cb-divider bg-cb-base/95 backdrop-blur-sm">
      <div class="mx-auto flex max-w-7xl items-center gap-3  py-3 ">
        <button
          @click="goBack"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cb-divider bg-cb-card text-cb-muted transition-colors hover:bg-cb-field hover:text-cb-text"
          aria-label="Go back"
        >
          <i class="fa-solid fa-arrow-left text-sm"></i>
        </button>

        <div class="flex min-w-0 flex-1 items-center gap-2">
          <span v-if="ticket" class="font-mono text-sm font-bold text-cb-muted">
            {{ ticket.ticketNumber }}
          </span>
          <div v-else class="h-4 w-24 animate-pulse rounded-full bg-cb-field"></div>
        </div>

        <template v-if="ticket">
          <span :class="['inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold', statusClass(ticket.status)]">
            <span :class="['h-1.5 w-1.5 rounded-full', statusDot(ticket.status)]"></span>
            {{ statusLabel(ticket.status) }}
          </span>
        </template>
      </div>
    </header>

    <!-- ── Loading ─────────────────────────────────────────── -->
    <div v-if="supportStore.loading && !ticket" class="mx-auto max-w-7xl space-y-4  py-6 sm:px-6">
      <div class="h-28 animate-pulse rounded-2xl bg-cb-field"></div>
      <div class="h-40 animate-pulse rounded-2xl bg-cb-field"></div>
      <div class="h-24 animate-pulse rounded-2xl bg-cb-field"></div>
    </div>

    <!-- ── Error ────────────────────────────────────────────── -->
    <div v-else-if="loadError" class="mx-auto flex max-w-md flex-col items-center gap-4  py-24 text-center">
      <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-cb-negative-subtle">
        <i class="fa-solid fa-circle-exclamation text-2xl text-cb-negative"></i>
      </div>
      <div>
        <p class="font-semibold text-cb-text">Could not load ticket</p>
        <p class="mt-1 text-sm text-cb-muted">{{ loadError }}</p>
      </div>
      <button @click="load" class="rounded-xl bg-cb-accent px-5 py-2.5 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark">
        Try again
      </button>
    </div>

    <!-- ── Content ──────────────────────────────────────────── -->
    <template v-else-if="ticket">
      <div class="mx-auto max-w-7xl space-y-4  py-5">

        <!-- Ticket meta card -->
        <section class="overflow-hidden rounded-2xl border border-cb-divider bg-cb-card">
          <!-- Priority banner for urgent/high -->
          <div
            v-if="['urgent', 'high'].includes(ticket.priority)"
            :class="['flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold', priorityBanner(ticket.priority)]"
          >
            <i :class="ticket.priority === 'urgent' ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-exclamation'"></i>
            {{ ticket.priority === 'urgent' ? 'Urgent — our team is prioritising this' : 'High priority ticket' }}
          </div>

          <div class="p-4 sm:p-5">
            <div class="mb-3 flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-cb-accent-subtle px-2.5 py-1 text-xs font-semibold text-cb-accent">
                <i :class="getCategoryIcon(ticket.category)"></i>
                {{ categoryLabel(ticket.category) }}
              </span>
              <i class="fa-solid fa-chevron-right text-[10px] text-cb-muted-40"></i>
              <span class="rounded-full border border-cb-divider bg-cb-field px-2.5 py-1 text-xs font-semibold text-cb-text">
                {{ typeLabel(ticket.category, ticket.type) }}
              </span>
            </div>

            <!-- Meta rows -->
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-cb-muted">Priority</span>
                <span :class="['rounded-full px-2 py-0.5 text-[10px] font-semibold', priorityClass(ticket.priority)]">
                  {{ capitalize(ticket.priority) }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-cb-muted">Submitted</span>
                <span class="text-cb-text">{{ formatDateTime(ticket.createdAt) }}</span>
              </div>
              <div v-if="ticket.updatedAt !== ticket.createdAt" class="flex items-center justify-between">
                <span class="text-cb-muted">Last updated</span>
                <span class="text-cb-text">{{ formatDateTime(ticket.updatedAt) }}</span>
              </div>
              <div v-if="ticket.relatedId" class="flex items-center justify-between">
                <span class="text-cb-muted">Related ID</span>
                <span class="font-mono text-xs text-cb-text">{{ ticket.relatedId }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Description -->
        <section class="rounded-2xl border border-cb-divider bg-cb-card p-4 sm:p-5">
          <p class="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">Your message</p>
          <p class="whitespace-pre-line text-sm leading-relaxed text-cb-text">{{ ticket.description }}</p>
        </section>

        <!-- Admin note / response -->
        <section v-if="ticket.adminNote" class="rounded-2xl border border-cb-accent/20 bg-cb-accent-subtle p-4 sm:p-5">
          <div class="mb-3 flex items-center gap-2">
            <div class="flex h-7 w-7 items-center justify-center rounded-full bg-cb-accent text-[10px] font-bold text-cb-contrast">
              CB
            </div>
            <div>
              <p class="text-xs font-semibold text-cb-accent">CampusBaze Support</p>
              <p class="text-[10px] text-cb-accent/70">Official response</p>
            </div>
          </div>
          <p class="whitespace-pre-line text-sm leading-relaxed text-cb-text">{{ ticket.adminNote }}</p>
        </section>

        <!-- Status timeline -->
      <section class="rounded-2xl border border-cb-divider bg-cb-card p-4 sm:p-5">
  <p class="mb-4 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">Timeline</p>
  <div class="relative">
    <!-- The connector line as an explicit div -->
    <div class="absolute left-[5px] top-2 bottom-2 w-px bg-cb-divider"></div>

    <ol class="space-y-4">
      <li class="relative pl-7">
        <div class="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-cb-card bg-cb-muted"></div>
        <p class="text-xs font-semibold text-cb-text">Ticket submitted</p>
        <p class="mt-0.5 text-[11px] text-cb-muted">{{ formatDateTime(ticket.createdAt) }}</p>
      </li>
      <li v-if="ticket.status === 'in_progress' || ticket.status === 'resolved' || ticket.status === 'closed'" class="relative pl-7">
        <div class="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-cb-card bg-cb-accent"></div>
        <p class="text-xs font-semibold text-cb-text">Under review</p>
        <p class="mt-0.5 text-[11px] text-cb-muted">Our team is investigating</p>
      </li>
      <li v-if="ticket.status === 'resolved' || ticket.status === 'closed'" class="relative pl-7">
        <div class="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-cb-card bg-cb-accent"></div>
        <p class="text-xs font-semibold text-cb-text">Resolved</p>
        <p class="mt-0.5 text-[11px] text-cb-muted">{{ formatDateTime(ticket.updatedAt) }}</p>
      </li>
      <li v-if="ticket.status === 'open'" class="relative pl-7 opacity-40">
        <div class="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-dashed border-cb-divider bg-cb-base"></div>
        <p class="text-xs font-semibold text-cb-text">Under review</p>
        <p class="mt-0.5 text-[11px] text-cb-muted">Pending — we'll respond within 24–48 hours</p>
      </li>
    </ol>
  </div>
</section>
        <!-- Info banner for open tickets -->
        <div v-if="['open', 'in_progress'].includes(ticket.status)" class="flex items-start gap-3 rounded-2xl border border-cb-accent/20 bg-cb-accent-subtle p-4">
          <i class="fa-solid fa-circle-info mt-0.5 shrink-0 text-sm text-cb-accent"></i>
          <p class="text-xs leading-relaxed text-cb-accent/80">
            We typically respond within 24–48 hours. You'll receive an email and in-app notification when there's an update on your ticket.
          </p>
        </div>

        <!-- Actions for resolved ticket -->
        <div v-if="ticket.status === 'resolved'" class="rounded-2xl border border-cb-divider bg-cb-card p-4 sm:p-5">
          <p class="mb-3 text-sm font-semibold text-cb-text">Was your issue resolved?</p>
          <div class="flex gap-2.5">
            <button class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-accent py-2.5 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark">
              <i class="fa-solid fa-thumbs-up text-xs"></i> Yes, resolved
            </button>
            <button
              @click="router.push({ name: 'CreateTicket' })"
              class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-card py-2.5 text-sm font-semibold text-cb-text hover:bg-cb-field"
            >
              <i class="fa-solid fa-rotate-right text-xs"></i> Still an issue
            </button>
          </div>
        </div>

        <div class="h-6"></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSupportStore } from '@/stores/supportStore'

const route        = useRoute()
const router       = useRouter()
const supportStore = useSupportStore()

const loadError = ref(null)
const ticket    = computed(() => supportStore.currentTicket)

async function load() {
  loadError.value = null
  supportStore.clearCurrentTicket()
  try {
    await supportStore.fetchTicket(route.params.ticketId)
    // Also load categories so labels resolve
    supportStore.fetchCategories()
  } catch (err) {
    loadError.value = err?.response?.data?.message || 'Failed to load ticket'
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push({ name: 'Support' })
}

// ── Display helpers ──────────────────────────────────────────
const STATUS_MAP = {
  open:        { label: 'Open',        cls: 'bg-cb-accent-subtle text-cb-accent',   dot: 'bg-cb-accent' },
  in_progress: { label: 'In Progress', cls: 'bg-cb-warning-subtle text-cb-warning', dot: 'bg-cb-warning' },
  resolved:    { label: 'Resolved',    cls: 'bg-cb-accent-subtle text-cb-accent',   dot: 'bg-cb-accent' },
  closed:      { label: 'Closed',      cls: 'bg-cb-field text-cb-muted',            dot: 'bg-cb-muted' },
}
const PRIORITY_CLS = {
  urgent: 'bg-cb-negative-subtle text-cb-negative',
  high:   'bg-cb-warning-subtle text-cb-warning',
  medium: 'bg-cb-accent-subtle text-cb-accent',
  low:    'bg-cb-field text-cb-muted',
}
const PRIORITY_BANNER = {
  urgent: 'bg-cb-negative-subtle text-cb-negative',
  high:   'bg-cb-warning-subtle text-cb-warning',
}

function statusLabel(s)    { return STATUS_MAP[s]?.label ?? s }
function statusClass(s)    { return STATUS_MAP[s]?.cls ?? 'bg-cb-field text-cb-muted' }
function statusDot(s)      { return STATUS_MAP[s]?.dot ?? 'bg-cb-muted' }
function priorityClass(p)  { return PRIORITY_CLS[p] ?? 'bg-cb-field text-cb-muted' }
function priorityBanner(p) { return PRIORITY_BANNER[p] ?? '' }
function capitalize(s)     { return s ? s.charAt(0).toUpperCase() + s.slice(1) : '' }

const CATEGORY_ICONS = {
  payment:   'fa-solid fa-credit-card',
  errand:    'fa-solid fa-box',
  order:     'fa-solid fa-bag-shopping',
  account:   'fa-solid fa-user',
  technical: 'fa-solid fa-wrench',
  other:     'fa-solid fa-ellipsis',
}
function getCategoryIcon(value) { return CATEGORY_ICONS[value] ?? 'fa-solid fa-circle-question' }

function categoryLabel(val) {
  const cat = supportStore.categories.find(c => c.value === val)
  return cat?.label ?? val?.replace(/_/g, ' ') ?? val
}
function typeLabel(catVal, typeVal) {
  const types = supportStore.getTypesForCategory(catVal)
  const t = types.find(t => t.value === typeVal)
  return t?.label ?? typeVal?.replace(/_/g, ' ') ?? typeVal
}

function formatDateTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

onMounted(load)
</script>