<template>
  <div class="min-h-screen bg-cb-base">

    <section class="bg-cb-card rounded-md">
      <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div class="pt-5 pb-0 flex items-center justify-between">
          <button @click="goBack" class="inline-flex items-center gap-1.5 text-xs text-cb-muted hover:text-cb-text transition-colors">
            <i class="fa-solid fa-arrow-left text-[9px]"></i> Back
          </button>
          <span class="inline-flex items-center gap-1.5 rounded-full border border-cb-divider bg-cb-field px-3 py-1 text-[10px] font-semibold text-cb-muted">
            <i class="fa-solid fa-globe text-[8px]"></i> Public Profile
          </span>
        </div>

        <template v-if="loading">
          <div class="py-7 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
            <div class="h-24 w-24 shrink-0 animate-pulse rounded-full bg-cb-field sm:h-28 sm:w-28"></div>
            <div class="flex-1 space-y-3 pt-1">
              <div class="h-7 w-52 animate-pulse rounded-xl bg-cb-field"></div>
              <div class="h-4 w-36 animate-pulse rounded-lg bg-cb-field"></div>
            </div>
          </div>
        </template>

        <template v-else-if="profile">
          <div class="py-7 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
            <div class="relative shrink-0 self-start">
              <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-cb-accent text-2xl font-bold text-cb-contrast ring-4 ring-cb-card sm:h-28 sm:w-28">
                <img 
                  v-if="profile.avatar" 
                  :src="typeof profile.avatar === 'string' ? profile.avatar : profile.avatar?.url" 
                  class="h-full w-full object-cover" 
                  :alt="profile.displayName" 
                />
                <span v-else>{{ initials }}</span>
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="text-md md:text-xl font-bold text-cb-text sm:text-2xl leading-tight">{{ profile.displayName }}</h1>
                <span v-if="profile.identityVerificationBadge" class="inline-flex items-center gap-1 rounded-full bg-cb-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-cb-accent">
                  <i class="fa-solid fa-circle-check text-[8px]"></i> Verified
                </span>
              </div>

              <div class="mt-3 flex flex-wrap gap-2">
                <span class="inline-flex items-center gap-1.5 rounded-full border border-cb-divider bg-cb-field px-3 py-1 text-[11px] font-medium text-cb-text">
                  <i class="fa-solid fa-user-tag text-[8px] text-cb-muted"></i>
                  {{ roleLabel }}
                </span>
                <span v-if="profile.institutionName" class="inline-flex items-center gap-1.5 rounded-full border border-cb-divider bg-cb-field px-3 py-1 text-[11px] font-medium text-cb-text">
                  <i class="fa-solid fa-graduation-cap text-[8px] text-cb-muted"></i>
                  {{ profile.institutionName }}
                </span>
              </div>
            </div>

            <div class="shrink-0 self-start">
              <button @click="copyProfileLink" class="flex items-center gap-2 rounded-xl border border-cb-divider bg-cb-field px-4 py-2.5 text-xs font-semibold text-cb-muted hover:text-cb-accent transition-all">
                <i class="fa-solid fa-share-nodes text-xs"></i> Share
              </button>
            </div>
          </div>
        </template>
      </div>
    </section>

    <div v-if="profile" class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      
      <div class="rounded-2xl border border-cb-divider bg-cb-card p-5">
        <div class="mb-3 flex items-center justify-between">
          <p class="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-cb-muted">
            <i class="fa-solid fa-quote-left"></i> About
          </p>
          
          <button 
            v-if="isOwnProfile && !isEditingBio" 
            @click="startEditBio"
            class="text-[10px] font-bold text-cb-accent hover:underline flex items-center gap-1"
          >
            <i class="fa-solid fa-pen-to-square"></i> Edit Bio
          </button>
        </div>

        <div v-if="!isEditingBio">
          <p class="text-xs leading-relaxed text-cb-text whitespace-pre-line">
            {{ profile.bio || 'No bio available.' }}
          </p>
        </div>

        <div v-else class="space-y-4">
          <textarea
            v-model="editBioText"
            rows="5"
            class="w-full rounded-xl border border-cb-divider bg-cb-field p-4 text-xs text-cb-text focus:border-cb-accent outline-none transition-all resize-none"
            placeholder="Write your bio here..."
          ></textarea>
          <div class="flex justify-end gap-3">
            <button @click="isEditingBio = false" class="px-4 py-2 text-[11px] font-semibold text-cb-muted">Cancel</button>
            <button 
              @click="handleSaveBio" 
              :disabled="savingBio"
              class="flex items-center gap-2 rounded-lg bg-cb-accent px-5 py-2 text-[11px] font-bold text-white disabled:opacity-50"
            >
              <i v-if="savingBio" class="fa-solid fa-circle-notch animate-spin"></i>
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="rounded-2xl border border-cb-divider bg-cb-card px-4 py-4 text-center">
          <p class="text-sm md:text-lg font-bold text-cb-text">{{ profile.totalOrdersCompleted || 0 }}</p>
          <p class="text-[11px] text-cb-muted">Orders</p>
        </div>
        <div class="rounded-2xl border border-cb-divider bg-cb-card px-4 py-4 text-center">
          <p class="text-sm md:text-lg font-bold text-cb-text">{{ profile.averageRating || '0.0' }}</p>
          <p class="text-[11px] text-cb-muted">Rating</p>
        </div>
        <div class="rounded-2xl border border-cb-divider bg-cb-card px-4 py-4 text-center">
          <p class="text-sm md:text-lg font-bold text-cb-text">{{ profile.totalReviews || 0 }}</p>
          <p class="text-[11px] text-cb-muted">Reviews</p>
        </div>
        <div class="rounded-2xl border border-cb-divider bg-cb-card px-4 py-4 text-center">
          <p class="text-sm md:text-lg font-bold text-cb-text truncate">{{ formatLastSeen }}</p>
          <p class="text-[11px] text-cb-muted">Last Active</p>
        </div>
      </div>

      <div v-if="recentOrders.length" class="rounded-2xl border border-cb-divider bg-cb-card p-5">
        <p class="mb-4 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-cb-muted">
          <i class="fa-solid fa-bag-shopping"></i> Recent Orders
        </p>
        <div class="space-y-3">
          <div v-for="order in recentOrders" :key="order._id" class="flex items-center justify-between p-3 rounded-xl bg-cb-field border border-cb-divider">
            <div class="min-w-0">
              <p class="text-xs font-semibold text-cb-text truncate">Order #{{ order._id.slice(-6).toUpperCase() }}</p>
              <p class="text-[9px] text-cb-muted">{{ new Date(order.createdAt).toLocaleDateString() }}</p>
            </div>
            <span class="px-2 py-1 rounded-md bg-cb-accent/10 text-[9px] font-bold text-cb-accent">COMPLETED</span>
          </div>
        </div>
      </div>

      <div v-if="recentErrands.length" class="rounded-2xl border border-cb-divider bg-cb-card p-5">
        <p class="mb-4 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-cb-muted">
          <i class="fa-solid fa-truck-ramp-box"></i> Recent Errands
        </p>
        <div class="space-y-3">
          <div v-for="errand in recentErrands" :key="errand._id" class="p-3 rounded-xl bg-cb-field border border-cb-divider">
             <p class="text-xs font-semibold text-cb-text capitalize">{{ errand.title || 'Errand' }}</p>
          </div>
        </div>
      </div>

    </div>

    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useToast } from '@/composables/useToast'
import ToastContainer from '@/components/reusables/ToastContainer.vue'

const route     = useRoute()
const router    = useRouter()
const userStore = useUserStore()
const toast     = useToast()

const rawPayload    = ref(null)
const isEditingBio  = ref(false)
const editBioText   = ref('')
const savingBio     = ref(false)

const identifier    = computed(() => route.params.identifier)
const loading       = computed(() => userStore.profileLoading)

// --- Correct Mapping Based on Your JSON ---
const profile = computed(() => {
  return userStore.publicProfile || rawPayload.value?.data?.user || null
})

const isOwnProfile = computed(() => rawPayload.value?.data?.isOwnProfile ?? false)

// These are now correctly mapped to data.recentOrders / data.recentErrands
const recentOrders  = computed(() => rawPayload.value?.data?.recentOrders ?? [])
const recentErrands = computed(() => rawPayload.value?.data?.recentErrands ?? [])

const initials = computed(() => {
  if (!profile.value) return '?'
  const f = profile.value.firstName?.[0] || ''
  const l = profile.value.lastName?.[0] || ''
  return (f + l).toUpperCase() || '?'
})

const roleLabel = computed(() => {
  const p = profile.value
  if (!p) return ''
  if (p.isStudent || p.role === 'student') return 'Student'
  if (p.role === 'corporate') return 'Corporate'
  return 'Professional'
})

const formatLastSeen = computed(() => {
  if (!profile.value?.lastSeen) return 'Recently'
  const diff = Date.now() - new Date(profile.value.lastSeen)
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  return new Date(profile.value.lastSeen).toLocaleDateString()
})

async function loadProfile() {
  if (!identifier.value) return
  const res = await userStore.fetchUserProfile(identifier.value)
  rawPayload.value = res
}

function startEditBio() {
  editBioText.value = profile.value.bio || ''
  isEditingBio.value = true
}

async function handleSaveBio() {
  if (savingBio.value) return
  savingBio.value = true
  try {
    const payload = { bio: editBioText.value.trim() }
    if (profile.value?.role === 'corporate') {
      await userStore.updateCorporateMe(payload)
    } else {
      await userStore.updateMe(payload)
    }
    // Update local state so change is visible immediately
    if (userStore.publicProfile) userStore.publicProfile.bio = payload.bio
    if (rawPayload.value?.data?.user) rawPayload.value.data.user.bio = payload.bio
    
    isEditingBio.value = false
    toast.success('Bio updated')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Update failed')
  } finally {
    savingBio.value = false
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

async function copyProfileLink() {
  await navigator.clipboard.writeText(window.location.href)
  toast.success('Link copied')
}

onMounted(loadProfile)
watch(identifier, loadProfile)
</script>