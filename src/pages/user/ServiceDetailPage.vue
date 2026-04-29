<template>
  <div class="min-h-screen bg-cb-base">

    <!-- ─── Header ─────────────────────────────────────────────── -->
    <header class="sticky -top-8 z-20 border-b border-cb-divider bg-cb-base/95 backdrop-blur-sm">
      <div class="mx-auto flex max-w-7xl items-center gap-3  py-3 ">
        <button
          @click="goBack"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cb-divider bg-cb-card text-cb-muted transition-colors hover:bg-cb-field hover:text-cb-text"
          aria-label="Go back"
        >
          <i class="fa-solid fa-arrow-left text-sm"></i>
        </button>

        <div class="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
          <span class="hidden font-medium text-cb-muted sm:inline">Services</span>
          <i class="fa-solid fa-chevron-right hidden text-[9px] text-cb-muted-40 sm:inline"></i>
          <span class="truncate font-semibold text-cb-text">{{ service?.title || 'Service Detail' }}</span>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <template v-if="!loading && service">
            <span :class="['inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold', statusClass]">
              <span :class="['h-1.5 w-1.5 rounded-full', statusDot]"></span>
              {{ statusLabel }}
            </span>
          </template>
          <div v-else-if="loading" class="h-5 w-20 animate-pulse rounded-full bg-cb-field"></div>
        </div>
      </div>
    </header>

    <!-- ─── Loading ─────────────────────────────────────────────── -->
    <div v-if="loading" class="mx-auto max-w-7xl  py-8 ">
      <div class="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8">
        <div class="order-1 space-y-5">
          <div class="space-y-2.5">
            <div class="h-4 w-24 animate-pulse rounded-full bg-cb-field"></div>
            <div class="h-8 w-3/4 animate-pulse rounded-xl bg-cb-field"></div>
            <div class="flex items-center gap-3 pt-2">
              <div class="h-10 w-10 shrink-0 animate-pulse rounded-full bg-cb-field"></div>
              <div class="flex-1 space-y-1.5">
                <div class="h-4 w-1/2 animate-pulse rounded bg-cb-field"></div>
                <div class="h-3 w-1/3 animate-pulse rounded bg-cb-field"></div>
              </div>
            </div>
          </div>
          <div class="h-24 animate-pulse rounded-2xl bg-cb-field"></div>
        </div>
        <div class="order-2 space-y-3">
          <div v-for="i in 3" :key="i" class="h-24 animate-pulse rounded-2xl bg-cb-field"></div>
        </div>
      </div>
    </div>

    <!-- ─── Error ────────────────────────────────────────────────── -->
    <div v-else-if="loadError" class="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-cb-negative-subtle">
        <i class="fa-solid fa-circle-exclamation text-2xl text-cb-negative"></i>
      </div>
      <div>
        <p class="font-semibold text-cb-text">Could not load service</p>
        <p class="mt-1 text-sm text-cb-muted">{{ loadError }}</p>
      </div>
      <button @click="load" class="rounded-xl bg-cb-accent px-5 py-2.5 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark">
        Try again
      </button>
    </div>

    <!-- ─── Page Body ────────────────────────────────────────────── -->
    <template v-else-if="service">
      <div class="mx-auto max-w-7xl  py-6  lg:py-8">

        <!--
          Layout strategy (same as ErrandDetailPage):
          Mobile  → ① title+seller  →  ② order panel  →  ③ description+portfolio+stats
          Desktop → col-1: ①③ stacked | col-2: ② sticky sidebar
        -->
        <div class="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8">

          <!-- ①  Title, category, seller ─────────────────────────── -->
          <div class="order-1 space-y-4">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center gap-1.5 rounded-full bg-cb-accent-subtle px-2.5 py-1 text-xs font-semibold text-cb-accent">
                  <i :class="[categoryIcon, 'text-[10px]']"></i>
                  {{ categoryLabel }}
                </span>
                <span class="inline-flex items-center gap-1 rounded-full bg-cb-field px-2 py-0.5 text-[10px] text-cb-muted">
                  <i class="fa-solid fa-shopping-cart text-[9px]"></i>
                  {{ service.totalOrders ?? 0 }} orders
                </span>
              </div>
              <h1 class="mt-2.5 text-xl font-bold leading-snug text-cb-text sm:text-2xl lg:text-3xl">
                {{ service.title }}
              </h1>
            </div>

            <!-- Seller card -->
            <div class="flex items-center gap-3 rounded-2xl border border-cb-divider bg-cb-card p-3 sm:p-4">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cb-accent text-sm font-bold text-cb-contrast">
                <img v-if="sellerAvatar" :src="sellerAvatar" class="h-full w-full object-cover" :alt="sellerName" />
                <span v-else>{{ sellerInitials }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <p class="truncate text-sm font-semibold text-cb-text">{{ sellerName }}</p>
                  <span v-if="sellerBadge" class="inline-flex items-center gap-0.5 text-[10px] font-semibold text-cb-accent">
                    <i class="fa-solid fa-circle-check"></i> Verified
                  </span>
                </div>
                <div class="mt-0.5 flex items-center gap-1.5 text-xs text-cb-muted">
                  <span class="flex items-center gap-0.5">
                    <i v-for="s in 5" :key="s" :class="['fa-star text-[10px]', s <= Math.round(sellerRating) ? 'fa-solid text-cb-warning' : 'fa-regular text-cb-muted-40']"></i>
                  </span>
                  <span>{{ sellerRating?.toFixed(1) }}</span>
                  <span v-if="seller?.isStudent" class="inline-flex items-center gap-0.5 rounded-full border border-cb-divider px-1.5 py-0.5 text-[9px]">
                    <i class="fa-solid fa-graduation-cap text-[8px]"></i> Student
                  </span>
                </div>
              </div>
              <button @click="goToProviderProfile"
                class="ml-auto flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-cb-divider bg-cb-card px-3 text-xs font-semibold text-cb-muted transition-colors hover:border-cb-accent hover:bg-cb-accent-subtle hover:text-cb-accent">
                <i class="fa-solid fa-user text-[10px]"></i>
                <span class="hidden sm:inline">Profile</span>
              </button>
            </div>
          </div>

          <!-- ②  Order / action panel ─ sticky sidebar on desktop ── -->
          <aside class="order-2 lg:sticky lg:top-[69px] lg:self-start">
            <div class="overflow-hidden rounded-2xl border border-cb-divider bg-cb-card ">

              <!-- Deactivated -->
              <div v-if="service?.status === 'deactivated'" class="p-4">
                <div class="flex items-center gap-3 rounded-xl border border-cb-warning/30 bg-cb-warning-subtle p-3.5">
                  <i class="fa-solid fa-ban shrink-0 text-cb-warning"></i>
                  <p class="text-sm font-semibold text-cb-warning">This service has been deactivated</p>
                </div>
              </div>

              <!-- Owner view -->
              <div v-else-if="isOwner" class="p-4 space-y-3">
                <div class="flex items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-field py-3 text-sm font-semibold text-cb-muted">
                  <i class="fa-solid fa-user"></i> This is your service
                </div>
                <button @click="router.push({ name: 'EditService', params: { id: service._id } })"
                  class="flex w-full items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-card py-2.5 text-sm font-semibold text-cb-text hover:bg-cb-field">
                  <i class="fa-solid fa-pen text-xs"></i> Edit Service
                </button>
              </div>

              <!-- Active order states -->
              <template v-else-if="activeOrderStatus">

                <!-- Pending payment -->
                <div v-if="activeOrderStatus === 'pending_payment'" class="space-y-3 p-4">
                  <div class="flex items-start gap-3 rounded-xl border border-cb-warning/30 bg-cb-warning-subtle p-3">
                    <i class="fa-solid fa-triangle-exclamation mt-0.5 shrink-0 text-cb-warning"></i>
                    <div>
                      <p class="text-sm font-semibold text-cb-warning">Payment Pending</p>
                      <p class="mt-0.5 text-xs text-cb-warning/80">Complete payment to activate your order.</p>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button @click="handlePayExistingOrder" :disabled="serviceStore.actionLoading"
                      class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-accent py-3 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark disabled:opacity-60">
                      <i v-if="serviceStore.actionLoading" class="fa-solid fa-spinner fa-spin"></i>
                      <i v-else class="fa-solid fa-credit-card"></i>
                      {{ serviceStore.actionLoading ? 'Processing…' : 'Pay Now' }}
                    </button>
                    <button v-if="canChat" @click="handleChat"
                      class="flex items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-card px-4 text-sm text-cb-muted hover:bg-cb-field">
                      <i class="fa-regular fa-message"></i>
                    </button>
                  </div>
                </div>

                <!-- In progress -->
                <div v-else-if="activeOrderStatus === 'in_progress'" class="space-y-3 p-4">
                  <div class="flex items-center gap-3 rounded-xl border border-cb-accent/20 bg-cb-accent-subtle p-3">
                    <i class="fa-solid fa-hourglass-half shrink-0 text-cb-accent"></i>
                    <div>
                      <p class="text-sm font-semibold text-cb-accent">Order In Progress</p>
                      <p class="mt-0.5 text-xs text-cb-accent/80">The seller is working on your order.</p>
                    </div>
                  </div>
                  <button v-if="canChat" @click="handleChat"
                    class="flex w-full items-center justify-center gap-2 rounded-xl border border-cb-accent-muted bg-cb-base py-2.5 text-sm font-semibold text-cb-accent hover:bg-cb-accent-subtle">
                    <i class="fa-regular fa-message"></i> Message {{ sellerName }}
                  </button>
                </div>

                <!-- Revision -->
                <div v-else-if="activeOrderStatus === 'revision'" class="space-y-3 p-4">
                  <div class="flex items-center gap-3 rounded-xl border border-cb-warning/30 bg-cb-warning-subtle p-3">
                    <i class="fa-solid fa-rotate-left shrink-0 text-cb-warning"></i>
                    <div>
                      <p class="text-sm font-semibold text-cb-warning">Revision In Progress</p>
                      <p class="mt-0.5 text-xs text-cb-warning/80">The seller is revising your order.</p>
                    </div>
                  </div>
                  <button v-if="canChat" @click="handleChat"
                    class="flex w-full items-center justify-center gap-2 rounded-xl border border-cb-accent-muted bg-cb-base py-2.5 text-sm font-semibold text-cb-accent hover:bg-cb-accent-subtle">
                    <i class="fa-regular fa-message"></i> Message {{ sellerName }}
                  </button>
                </div>

                <!-- Delivered -->
                <div v-else-if="activeOrderStatus === 'delivered'" class="space-y-3 p-4">
                  <div class="flex items-center gap-3 rounded-xl border border-cb-accent/20 bg-cb-accent-subtle p-3">
                    <i class="fa-solid fa-truck-fast shrink-0 text-cb-accent"></i>
                    <div>
                      <p class="text-sm font-semibold text-cb-accent">Order Delivered</p>
                      <p class="mt-0.5 text-xs text-cb-accent/80">Confirm or request a revision in My Services.</p>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button @click="router.push({ name: 'MyServices' })"
                      class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cb-accent py-2.5 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark">
                      <i class="fa-solid fa-briefcase text-[10px]"></i> Go to My Services
                    </button>
                    <button v-if="canChat" @click="handleChat"
                      class="flex items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-card px-4 text-sm text-cb-muted hover:bg-cb-field">
                      <i class="fa-regular fa-message"></i>
                    </button>
                  </div>
                </div>
              </template>

              <!-- New order — tier selection + form -->
              <template v-else-if="canOrder">

                <!-- Tier list -->
                <div class="space-y-2 border-b border-cb-divider p-4">
                  <p class="mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">
                    <i class="fa-solid fa-layer-group"></i> Choose a tier
                  </p>
                  <div
                    v-for="tier in service.tiers"
                    :key="tier.name"
                    @click="selectedTier = tier.name"
                    :class="['flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all', selectedTier === tier.name ? 'border-cb-accent bg-cb-accent-subtle' : 'border-cb-divider hover:border-cb-accent/40']"
                  >
                    <div :class="['flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all', selectedTier === tier.name ? 'border-cb-accent bg-cb-accent' : 'border-cb-divider']">
                      <i v-if="selectedTier === tier.name" class="fa-solid fa-check text-[7px] text-cb-contrast"></i>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-baseline justify-between gap-2">
                        <p class="text-sm font-bold capitalize text-cb-text">{{ tier.name }}</p>
                        <p class="shrink-0 text-sm font-bold text-cb-text">₦{{ tier.price.toLocaleString() }}</p>
                      </div>
                      <p class="mt-0.5 line-clamp-1 text-xs text-cb-muted">{{ tier.description }}</p>
                      <div class="mt-1 flex items-center gap-3 text-[10px] text-cb-muted">
                        <span class="flex items-center gap-1"><i class="fa-regular fa-clock"></i> {{ tier.deliveryDays }}d delivery</span>
                        <span class="flex items-center gap-1"><i class="fa-solid fa-rotate-left"></i> {{ tier.revisions }} revision{{ tier.revisions !== 1 ? 's' : '' }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Order form -->
                <div class="space-y-3 p-4">
                  <button v-if="canChat" @click="handleChat"
                    class="flex w-full items-center justify-center gap-2 rounded-xl border border-cb-accent-muted bg-cb-base py-2.5 text-sm font-semibold text-cb-accent transition-all hover:bg-cb-accent-subtle">
                    <i class="fa-regular fa-message"></i> Message {{ sellerName }}
                  </button>

                  <textarea v-model="requirements" rows="2" placeholder="Describe your requirements (optional)..."
                    class="w-full resize-none rounded-xl border border-cb-divider bg-cb-field p-3 text-sm text-cb-text placeholder:text-cb-muted-40 focus:border-cb-accent focus:outline-none"></textarea>

                  <div class="flex items-center justify-between gap-3">
                    <div class="text-sm">
                      <span v-if="selectedTierData">
                        <span class="text-cb-muted">Total: </span>
                        <span class="font-bold text-cb-text">₦{{ selectedTierData.price?.toLocaleString() }}</span>
                      </span>
                      <span v-else class="text-xs text-cb-muted">Select a tier above</span>
                    </div>
                    <button @click="handlePlaceOrder" :disabled="!selectedTier || serviceStore.actionLoading"
                      class="inline-flex items-center justify-center gap-2 rounded-xl bg-cb-accent px-5 py-2.5 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark  disabled:cursor-not-allowed disabled:opacity-60">
                      <i v-if="serviceStore.actionLoading" class="fa-solid fa-spinner fa-spin"></i>
                      <i v-else class="fa-solid fa-bag-shopping"></i>
                      {{ serviceStore.actionLoading ? 'Placing…' : selectedTier ? 'Place Order' : 'Select Tier' }}
                    </button>
                  </div>
                </div>
              </template>

              <!-- Not accepting orders -->
              <div v-else class="p-4">
                <div class="flex items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-field py-3 text-sm font-semibold text-cb-muted">
                  <i class="fa-solid fa-clock"></i> Not currently accepting orders
                </div>
              </div>
            </div>
          </aside>

          <!-- ③  Description, portfolio, tags, stats ─────────────── -->
          <div class="order-3 space-y-5">

            <!-- Description -->
            <section class="rounded-2xl border border-cb-divider bg-cb-card p-4 sm:p-5">
              <p class="mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">
                <i class="fa-solid fa-align-left"></i> Description
              </p>
              <p class="whitespace-pre-line text-sm leading-relaxed text-cb-text">{{ service.description }}</p>
            </section>

            <!-- Portfolio -->
            <section v-if="service.portfolioUrls?.length">
              <p class="mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">
                <i class="fa-solid fa-images"></i> Portfolio
              </p>
              <div class="flex flex-wrap gap-2">
                <a v-for="(url, i) in service.portfolioUrls" :key="i" :href="url" target="_blank" rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 rounded-full border border-cb-divider bg-cb-card px-3 py-1.5 text-xs text-cb-text transition-colors hover:bg-cb-field hover:text-cb-accent">
                  <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i> Portfolio {{ i + 1 }}
                </a>
              </div>
            </section>

            <!-- Tags -->
            <div v-if="service.tags?.length" class="flex flex-wrap gap-1.5">
              <span v-for="tag in service.tags" :key="tag"
                class="rounded-full border border-cb-divider bg-cb-field px-2.5 py-1 text-xs text-cb-muted">
                #{{ tag }}
              </span>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-3 divide-x divide-cb-divider rounded-2xl border border-cb-divider bg-cb-card text-center">
              <div class="py-4">
                <p class="text-lg font-bold text-cb-text">{{ service.totalOrders ?? 0 }}</p>
                <p class="mt-0.5 text-[10px] text-cb-muted">Orders</p>
              </div>
              <div class="py-4">
                <p class="text-lg font-bold text-cb-text">{{ service.averageRating?.toFixed(1) || '—' }}</p>
                <p class="mt-0.5 text-[10px] text-cb-muted">Rating</p>
              </div>
              <div class="py-4">
                <p class="text-lg font-bold text-cb-text">{{ service.totalReviews ?? 0 }}</p>
                <p class="mt-0.5 text-[10px] text-cb-muted">Reviews</p>
              </div>
            </div>

            <div class="h-6 lg:h-10"></div>
          </div>
          <!-- end ③ -->

        </div>
      </div>
    </template>

    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useServiceStore } from '@/stores/serviceStore'
import { useUserStore } from '@/stores/userStore'
import { useToast } from '@/composables/useToast'
import { getCategoryIcon, getCategoryLabel } from '@/utils/serviceCategories'
import ToastContainer from '@/components/reusables/ToastContainer.vue'

const route = useRoute()
const router = useRouter()
const serviceStore = useServiceStore()
const userStore = useUserStore()
const toast = useToast()

const loading = ref(true)
const loadError = ref(null)
const selectedTier = ref(null)
const requirements = ref('')

const service = computed(() => serviceStore.currentService)
const currentUserId = computed(() => userStore.user?._id || null)

const isOwner = computed(() => {
  if (!service.value || !currentUserId.value) return false
  const sellerId = typeof service.value.sellerId === 'object' ? service.value.sellerId?._id : service.value.sellerId
  return sellerId === currentUserId.value
})

const activeOrderWithSeller = computed(() => {
  if (!service.value || !currentUserId.value) return null
  const activeStatuses = ['pending_payment', 'in_progress', 'delivered', 'revision']
  return serviceStore.buyingOrders.find(o => {
    const listingId = typeof o.listingId === 'object' ? o.listingId?._id : o.listingId
    return listingId === service.value._id && activeStatuses.includes(o.status)
  }) ?? null
})
const activeOrderStatus = computed(() => activeOrderWithSeller.value?.status ?? null)
const canOrder = computed(() => !isOwner.value && service.value?.status === 'active' && !activeOrderWithSeller.value)
const canChat = computed(() => !isOwner.value && !!currentUserId.value && !!activeOrderWithSeller.value)
const selectedTierData = computed(() => service.value?.tiers?.find(t => t.name === selectedTier.value) || null)

const categoryIcon = computed(() => getCategoryIcon(service.value?.category) || 'fa-solid fa-tag')
const categoryLabel = computed(() => {
  const label = getCategoryLabel(service.value?.category) || 'other'
  return label.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
})

const seller = computed(() => typeof service.value?.sellerId === 'object' ? service.value.sellerId : null)
const sellerName = computed(() => seller.value ? (seller.value.displayName || `${seller.value.firstName || ''} ${seller.value.lastName || ''}`.trim() || 'Seller') : 'Seller')
const sellerInitials = computed(() => { if (!seller.value) return 'S'; const f = seller.value.firstName?.[0] || '', l = seller.value.lastName?.[0] || ''; return (f + l).toUpperCase() || 'S' })
const sellerAvatar = computed(() => seller.value?.avatar || null)
const sellerRating = computed(() => seller.value?.averageRating || 0)
const sellerBadge = computed(() => seller.value?.identityVerificationBadge || false)

const STATUS_MAP = {
  active:      { label: 'Active',      cls: 'bg-cb-accent-subtle text-cb-accent',   dot: 'bg-cb-accent' },
  draft:       { label: 'Draft',       cls: 'bg-cb-field text-cb-muted',            dot: 'bg-cb-muted' },
  paused:      { label: 'Paused',      cls: 'bg-cb-warning-subtle text-cb-warning', dot: 'bg-cb-warning' },
  deactivated: { label: 'Deactivated', cls: 'bg-cb-field text-cb-muted',            dot: 'bg-cb-muted' },
}
const statusLabel = computed(() => STATUS_MAP[service.value?.status]?.label || service.value?.status || '')
const statusClass = computed(() => STATUS_MAP[service.value?.status]?.cls || 'bg-cb-field text-cb-muted')
const statusDot   = computed(() => STATUS_MAP[service.value?.status]?.dot || 'bg-cb-muted')

async function load() {
  loading.value = true; loadError.value = null; serviceStore.clearCurrentService()
  try { await serviceStore.fetchService(route.params.id); serviceStore.fetchBuyingOrders() }
  catch (err) { loadError.value = err?.response?.data?.message || 'Failed to load service' }
  finally { loading.value = false }
}
onMounted(load)

// Auto-select cheapest tier for non-owners
watch(service, (svc) => {
  if (svc?.tiers?.length && !isOwner.value && svc.status === 'active') {
    const sorted = [...svc.tiers].sort((a, b) => a.price - b.price)
    selectedTier.value = sorted[0].name
  } else { selectedTier.value = null }
}, { immediate: true })

function goBack() { if (window.history.length > 1) router.back(); else router.push({ name: 'Services' }) }

function goToProviderProfile() {
  const s = service.value?.sellerId
  const slug = typeof s === 'object' ? s?.slug : null
  if (!slug) { toast.error('Cannot open seller profile'); return }
  router.push({ name: 'ServiceProviderProfile', params: { identifier: slug } })
}

async function handlePlaceOrder() {
  if (!selectedTier.value) return
  const tier = selectedTierData.value
  if (!tier) { toast.error('Please select a valid tier'); return }
  try {
    await serviceStore.createOrder(service.value._id, {
      tierName: tier.name,
      requirements: requirements.value || '',
      callbackUrl: `${window.location.origin}/payment/service/callback`,
    })
    toast.success('Order placed! Now complete your payment.')
  } catch { toast.error(serviceStore.error || 'Failed to place order') }
}

async function handlePayExistingOrder() {
  const orderId = activeOrderWithSeller.value?._id
  if (!orderId) return
  try {
    const payRes = await serviceStore.payOrder(orderId)
    const url = payRes?.data?.payment?.authorizationUrl ?? payRes?.data?.authorizationUrl ?? payRes?.data?.authorization_url ?? payRes?.data?.paymentUrl ?? payRes?.data?.url
    if (url) { window.location.href = url } else { toast.success('Payment initiated. Check your orders page.') }
  } catch { toast.error(serviceStore.error || 'Failed to initiate payment') }
}

function handleChat() {
  const order = activeOrderWithSeller.value
  if (!order) return
  const sellerId = typeof order.sellerId === 'object' ? order.sellerId?._id : order.sellerId
  if (sellerId) router.push({ name: 'Chat', query: { userId: sellerId } })
}
</script>