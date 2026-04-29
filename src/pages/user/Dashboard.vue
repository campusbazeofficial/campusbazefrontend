<template>
  <div class="dashboard-root">

    <!-- ══════════════════════════════════════
         SKELETON
    ══════════════════════════════════════ -->
    <template v-if="dashLoading">
      <div class="skeleton-wrap">
        <div class="skel skel-hero"></div>
        <div class="skel-grid-4">
          <div v-for="i in 4" :key="i" class="skel skel-stat"></div>
        </div>
        <div class="skel-grid-2">
          <div class="skel skel-card"></div>
          <div class="skel skel-card"></div>
        </div>
        <div class="skel-grid-3">
          <div v-for="i in 3" :key="i" class="skel skel-card-sm"></div>
        </div>
      </div>
    </template>

    <template v-else-if="data">

      <!-- ══════════════════════════════════════
           WELCOME HERO  (mirrors Profile.vue)
      ══════════════════════════════════════ -->
      <div class="hero-card">
        <!-- Gradient cover band -->
        <div class="hero-cover">
          <!-- Greeting top-left -->
          <span class="hero-greeting-chip ">Good {{ greeting }} 

            <i class="fa-solid fa-hand text-yellow-400"></i>
          </span>
          <!-- Tier badge top-right -->
          <span class="hero-tier-chip" :class="tierChipClass(data.profile.subscriptionTier)">
            <i :class="tierIcon(data.profile.subscriptionTier)"></i>
            {{ humanTier(data.profile.subscriptionTier) }}
          </span>
        </div>

        <div class="hero-body">
          <!-- Avatar row: avatar left, actions right -->
          <div class="hero-avatar-row">
            <div class="hero-avatar-wrap">
              <div class="hero-avatar">
                <img v-if="avatarSrc" :src="avatarSrc" alt="Profile" class="avatar-img" />
                <span v-else class="avatar-initials avatar-initials-lg">{{ userStore.initials }}</span>
              </div>
            </div>
            <!-- Quick actions -->
            <div class="hero-actions">
              <router-link to="/user/post-errand" class="btn btn-primary">
                <i class="fa-solid fa-plus"></i>
                <span>Post Errand</span>
              </router-link>
              <router-link to="/user/errand-market" class="btn btn-ghost">
                <i class="fa-solid fa-compass"></i>
                <span>Browse</span>
              </router-link>
            </div>
          </div>

          <!-- Name + role badge + identity badge -->
          <div class="hero-name-row">
            <h1 class="hero-name">{{ data.profile.displayName || data.profile.firstName }}</h1>
            <span class="badge badge-role">{{ humanRole(data.profile.role) }}</span>
            <span v-if="data.profile.identityBadge" class="badge badge-verified">
              <i class="fa-solid fa-circle-check"></i> Verified
            </span>
          </div>


        </div>
      </div>

      <!-- ══════════════════════════════════════
           VERIFICATION BANNER
      ══════════════════════════════════════ -->
      <div v-if="showVerificationBanner" class="verify-banner">
        <div class="verify-banner-header">
          <div class="verify-banner-title">
            <i class="fa-solid fa-shield-halved"></i>
            <span>Complete your verification</span>
            <span class="verify-count-chip">{{ pendingVerifications.length }} left</span>
          </div>
          <button class="verify-dismiss" @click="dismissBanner" title="Dismiss">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="verify-items">
          <router-link
            v-for="item in pendingVerifications"
            :key="item.key"
            :to="item.route"
            class="verify-item"
          >
            <div class="verify-item-icon" :class="item.iconClass">
              <i :class="item.icon"></i>
            </div>
            <div class="verify-item-body">
              <span class="verify-item-label">{{ item.label }}</span>
              <span class="verify-item-hint">{{ item.hint }}</span>
            </div>
            <i class="fa-solid fa-chevron-right verify-item-arrow"></i>
          </router-link>
        </div>
      </div>

      <!-- ══════════════════════════════════════
           STAT CARDS
      ══════════════════════════════════════ -->
      <div class="stat-grid">

        <div class="stat-card stat-accent">
          <div class="stat-icon"><i class="fa-solid fa-coins"></i></div>
          <div class="stat-body">
            <p class="stat-label">CBC Balance</p>
            <p class="stat-value">{{ data.wallet.cbcBalance.toLocaleString() }}</p>
            <p class="stat-sub">Coins</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon-green"><i class="fa-solid fa-sack-dollar"></i></div>
          <div class="stat-body">
            <p class="stat-label">Total Earned</p>
            <p class="stat-value">₦{{ data.wallet.totalEarnedNGN.toLocaleString() }}</p>
            <p class="stat-sub">Lifetime earnings</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon-blue"><i class="fa-solid fa-circle-check"></i></div>
          <div class="stat-body">
            <p class="stat-label">Completed</p>
            <p class="stat-value">{{ data.profile.totalOrdersCompleted }}</p>
            <p class="stat-sub">Tasks done</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon-amber"><i class="fa-solid fa-star"></i></div>
          <div class="stat-body">
            <p class="stat-label">Rating</p>
            <p class="stat-value">{{ data.profile.averageRating != null ? data.profile.averageRating.toFixed(1) : '—' }}</p>
            <p class="stat-sub">{{ data.profile.totalReviews }} review{{ data.profile.totalReviews !== 1 ? 's' : '' }}</p>
          </div>
        </div>

      </div>

      <!-- ══════════════════════════════════════
           MAIN GRID: ERRANDS + SERVICES
      ══════════════════════════════════════ -->
      <div class="main-grid">

        <!-- ── Errands ── -->
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title"><i class="fa-solid fa-clipboard-list"></i> Errands</h2>
            <router-link to="/user/my-errands" class="panel-link">View all <i class="fa-solid fa-arrow-right"></i></router-link>
          </div>

          <div class="section-label">As Poster</div>
          <div class="pill-grid">
            <div class="pill">
              <span class="pill-val">{{ data.errands.posted.total }}</span>
              <span class="pill-key">Total</span>
            </div>
            <div class="pill">
              <span class="pill-val clr-accent">{{ data.errands.posted.open }}</span>
              <span class="pill-key">Open</span>
            </div>
            <div class="pill">
              <span class="pill-val clr-blue">{{ data.errands.posted.active }}</span>
              <span class="pill-key">Active</span>
            </div>
            <div class="pill">
              <span class="pill-val clr-amber">{{ data.errands.posted.awaitingConfirm }}</span>
              <span class="pill-key">Awaiting</span>
            </div>
            <div class="pill">
              <span class="pill-val clr-green">{{ data.errands.posted.confirmed }}</span>
              <span class="pill-key">Done</span>
            </div>
            <div class="pill">
              <span class="pill-val clr-red">{{ data.errands.posted.disputed }}</span>
              <span class="pill-key">Disputed</span>
            </div>
          </div>

          <div class="section-divider"></div>

          <div class="section-label">As Runner</div>
          <div class="pill-grid">
            <div class="pill">
              <span class="pill-val">{{ data.errands.running.total }}</span>
              <span class="pill-key">Total</span>
            </div>
            <div class="pill">
              <span class="pill-val clr-blue">{{ data.errands.running.active }}</span>
              <span class="pill-key">Active</span>
            </div>
            <div class="pill">
              <span class="pill-val clr-amber">{{ data.errands.running.awaitingConfirm }}</span>
              <span class="pill-key">Awaiting</span>
            </div>
            <div class="pill">
              <span class="pill-val clr-green">{{ data.errands.running.completed }}</span>
              <span class="pill-key">Done</span>
            </div>
            <div class="pill">
              <span class="pill-val clr-red">{{ data.errands.running.disputed }}</span>
              <span class="pill-key">Disputed</span>
            </div>
          </div>

          <router-link to="/user/errand-market" class="panel-cta">
            <i class="fa-solid fa-map-location-dot"></i>
            Browse available errands
            <i class="fa-solid fa-chevron-right panel-cta-arrow"></i>
          </router-link>
        </div>

        <!-- ── Services ── -->
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title"><i class="fa-solid fa-handshake"></i> Services</h2>
            <router-link to="/user/services" class="panel-link">View all <i class="fa-solid fa-arrow-right"></i></router-link>
          </div>

          <div class="section-label">My Listings</div>
          <div class="pill-grid">
            <div class="pill">
              <span class="pill-val">{{ data.services.listings.total }}</span>
              <span class="pill-key">Total</span>
            </div>
            <div class="pill">
              <span class="pill-val clr-green">{{ data.services.listings.active }}</span>
              <span class="pill-key">Active</span>
            </div>
            <div class="pill">
              <span class="pill-val clr-amber">{{ data.services.listings.paused }}</span>
              <span class="pill-key">Paused</span>
            </div>
            <div class="pill">
              <span class="pill-val">{{ data.services.listings.draft }}</span>
              <span class="pill-key">Draft</span>
            </div>
          </div>

          <div class="section-divider"></div>

          <div class="section-label">Selling Orders</div>
          <div class="pill-grid">
            <div class="pill">
              <span class="pill-val">{{ data.services.ordersSelling.total }}</span>
              <span class="pill-key">Total</span>
            </div>
            <div class="pill">
              <span class="pill-val clr-blue">{{ data.services.ordersSelling.active }}</span>
              <span class="pill-key">Active</span>
            </div>
            <div class="pill">
              <span class="pill-val clr-amber">{{ data.services.ordersSelling.awaitingConfirm }}</span>
              <span class="pill-key">Awaiting</span>
            </div>
            <div class="pill">
              <span class="pill-val clr-green">{{ data.services.ordersSelling.completed }}</span>
              <span class="pill-key">Done</span>
            </div>
          </div>

          <div class="section-divider"></div>

          <div class="section-label">Buying Orders</div>
          <div class="pill-grid">
            <div class="pill">
              <span class="pill-val">{{ data.services.ordersBuying.total }}</span>
              <span class="pill-key">Total</span>
            </div>
            <div class="pill">
              <span class="pill-val clr-blue">{{ data.services.ordersBuying.active }}</span>
              <span class="pill-key">Active</span>
            </div>
            <div class="pill">
              <span class="pill-val clr-green">{{ data.services.ordersBuying.completed }}</span>
              <span class="pill-key">Done</span>
            </div>
            <div class="pill">
              <span class="pill-val clr-red">{{ data.services.ordersBuying.disputed }}</span>
              <span class="pill-key">Disputed</span>
            </div>
          </div>

          <router-link to="/user/services/create" class="panel-cta">
            <i class="fa-solid fa-file-signature"></i>
            Create a service listing
            <i class="fa-solid fa-chevron-right panel-cta-arrow"></i>
          </router-link>
        </div>

      </div>

      <!-- ══════════════════════════════════════
           BOTTOM ROW: PENDING + ACTIVITY
      ══════════════════════════════════════ -->
      <div class="bottom-grid">

        <!-- ── Pending Items ── -->
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title"><i class="fa-solid fa-hourglass-half"></i> Needs Attention</h2>
            <span v-if="pendingCount > 0" class="count-badge">{{ pendingCount }}</span>
          </div>

          <div
            v-if="pendingCount === 0"
            class="empty-state"
          >
            <i class="fa-solid fa-inbox empty-icon"></i>
            <p>All caught up!</p>
            <span>Nothing pending right now.</span>
          </div>

          <div v-else class="pending-list">
            <router-link
              v-for="item in data.pendingErrands"
              :key="'e-' + item._id"
              :to="{ name: 'ErrandDetail', params: { id: item._id } }"
              class="pending-item no-underline"
            >
              <span class="pending-dot dot-accent"></span>
              <div class="pending-info">
                <p class="pending-title">{{ item.title }}</p>
                <p class="pending-meta">Errand · <span class="capitalize">{{ humanStatus(item.status) }}</span></p>
              </div>
              <i class="fa-solid fa-chevron-right pending-arrow"></i>
            </router-link>
            <router-link
              v-for="item in data.pendingOrders"
              :key="'o-' + item._id"
              :to="{ name: 'OrderDetail', params: { id: item._id } }"
              class="pending-item no-underline"
            >
              <span class="pending-dot dot-blue"></span>
              <div class="pending-info">
                <p class="pending-title">{{ item.title }}</p>
                <p class="pending-meta">Order · <span class="capitalize">{{ humanStatus(item.status) }}</span></p>
              </div>
              <i class="fa-solid fa-chevron-right pending-arrow"></i>
            </router-link>
          </div>
        </div>

        <!-- ── Recent Activity ── -->
        <div class="panel">
          <div class="panel-header">
            <h2 class="panel-title"><i class="fa-solid fa-clock-rotate-left"></i> Recent Activity</h2>
          </div>

          <div v-if="data.recentActivity.length === 0" class="empty-state">
            <i class="fa-solid fa-sparkles empty-icon"></i>
            <p>No activity yet</p>
            <router-link to="/user/post-errand" class="btn btn-primary btn-sm">
              Post an Errand
            </router-link>
          </div>

      <div v-else class="activity-list">
  <component
    v-for="(activity, i) in formattedActivity"
    :key="i"
    :is="activity.route ? 'router-link' : 'div'"
    :to="activity.route || undefined"
    class="activity-item"
    :class="{ 'activity-item-link': activity.route }"
  >
    <span class="activity-dot"></span>
    <div class="activity-body">
      <p class="activity-desc">{{ activity.description }}</p>
      <p class="activity-time">{{ activity.time }}</p>
    </div>
    <i v-if="activity.route" class="fa-solid fa-chevron-right activity-arrow"></i>
  </component>
</div>
        </div>

      </div>

    </template>

    <!-- ══════════════════════════════════════
         ERROR STATE
    ══════════════════════════════════════ -->
    <div v-else-if="error" class="error-state">
      <i class="fa-solid fa-circle-exclamation error-icon"></i>
      <p class="error-msg">{{ error }}</p>
      <button class="btn btn-primary" @click="load">Try again</button>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { useUserStore } from '@/stores/userStore'

const userStore   = useUserStore()
const data        = computed(() => userStore.dashboard)
const dashLoading = computed(() => userStore.dashLoading)
const error       = computed(() => userStore.error)

const pendingCount = computed(() =>
  (data.value?.pendingErrands?.length || 0) + (data.value?.pendingOrders?.length || 0)
)

// ── Verification Banner ──────────────────────────────────
const BANNER_DISMISSED_KEY = 'cb_verify_banner_done'

const bannerManuallyClosed = ref(false)

const pendingVerifications = computed(() => {
  if (!data.value?.profile) return []
  const p = data.value.profile
  const items = []
  if (!p.isEmailVerified) {
    items.push({
      key: 'email',
      label: 'Verify your email',
      hint: 'Confirm your email address to secure your account.',
      icon: 'fa-solid fa-envelope',
      iconClass: 'vi-warn',
      route: '/user/profile',
    })
  }
  if (!p.isPhoneVerified) {
    items.push({
      key: 'phone',
      label: 'Verify your phone',
      hint: 'Add and verify your phone number.',
      icon: 'fa-solid fa-phone',
      iconClass: 'vi-warn',
      route: '/user/profile',
    })
  }
  if (!p.identityBadge) {
    items.push({
      key: 'identity',
      label: 'Verify your identity',
      hint: 'Submit a valid ID to unlock more opportunities.',
      icon: 'fa-solid fa-id-card',
      iconClass: 'vi-amber',
      route: '/user/profile',
    })
  }
  return items
})

const allVerified = computed(() => pendingVerifications.value.length === 0)

const showVerificationBanner = computed(() => {
  if (bannerManuallyClosed.value) return false
  if (localStorage.getItem(BANNER_DISMISSED_KEY) === '1') return false
  if (!data.value?.profile) return false
  return !allVerified.value
})

// Auto-persist when all verifications are done
watch(allVerified, (done) => {
  if (done) localStorage.setItem(BANNER_DISMISSED_KEY, '1')
})

function dismissBanner() {
  bannerManuallyClosed.value = true
}

const avatarSrc = computed(() => {
  const a = userStore.user?.avatar
  if (!a) return null
  return typeof a === 'string' ? a : a?.url || null
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
})
const activityLabelMap = {
  order_placed:     'Placed an order',
  order_received:   'Received an order',
  errand_posted:    'Posted an errand',
  errand_running:   'Accepted an errand',
  errand_completed: 'Completed an errand',
  payment_made:     'Made a payment',
  payment_received: 'Received a payment',
}

function formatRelativeTime(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'Just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

// ADD this function
function getActivityRoute(activity) {
  const id = activity._id || activity.refId
  switch (activity.type) {
    case 'errand_posted':
    case 'errand_running':
    case 'errand_completed':
      return id ? { name: 'ErrandDetail', params: { id } } : { name: 'MyErrands' }
    case 'order_placed':
    case 'order_received':
      return id ? { name: 'OrderDetail', params: { id } } : { name: 'MyServices' }
    case 'payment_made':
    case 'payment_received':
      return { name: 'Wallet' }
    default:
      return null
  }
}


const formattedActivity = computed(() =>
  (data.value?.recentActivity ?? []).slice(0, 3).map(a => ({
    description: `${activityLabelMap[a.type] ?? a.type.replace(/_/g, ' ')} · ${a.title}${a.amountNGN ? ' · ₦' + a.amountNGN.toLocaleString() : ''}`,
    time: formatRelativeTime(a.updatedAt),
    route: getActivityRoute(a),
  }))
)
// ── Human-readable helpers ───────────────────────────────

function humanTier(tier) {
  const map = {
    free:             'Free',
    basic:            'Basic',
    pro:              'Pro',
    elite:            'Elite',
    corporate_free:   'Corporate Free',
    corporate_pro:    'Corporate Pro',
    corporate_elite:  'Corporate Elite',
  }
  return map[tier?.toLowerCase()] ?? (tier ?? 'Free')
}

function humanRole(role) {
  const map = {
    individual: 'Individual',
    corporate:  'Corporate',
    student:    'Student',
    admin:      'Admin',
  }
  return map[role?.toLowerCase()] ?? (role ?? 'User')
}

function humanStatus(status) {
  const map = {
    open:              'Open',
    active:            'In Progress',
    awaiting_confirm:  'Awaiting Confirmation',
    awaitingconfirm:   'Awaiting Confirmation',
    confirmed:         'Completed',
    completed:         'Completed',
    disputed:          'Disputed',
    cancelled:         'Cancelled',
    draft:             'Draft',
    paused:            'Paused',
  }
  return map[status?.toLowerCase().replace(/\s+/g, '_')] ?? status ?? '—'
}

function tierChipClass(tier) {
  const t = tier?.toLowerCase() ?? 'free'
  if (t === 'elite' || t === 'corporate_elite') return 'tier-chip-elite'
  if (t === 'pro'   || t === 'corporate_pro')   return 'tier-chip-pro'
  if (t === 'basic')                             return 'tier-chip-basic'
  return 'tier-chip-free'
}

function tierIcon(tier) {
  const t = tier?.toLowerCase() ?? 'free'
  if (t === 'elite' || t === 'corporate_elite') return 'fa-solid fa-gem'
  if (t === 'pro'   || t === 'corporate_pro')   return 'fa-solid fa-crown'
  if (t === 'basic')                             return 'fa-solid fa-bolt'
  return 'fa-solid fa-circle'
}

// ── Actions ──────────────────────────────────────────────

async function load() {
  await userStore.fetchDashboard()
}

onMounted(load)
</script>

<style scoped>
/* ── Root ──────────────────────────────────────────── */
.dashboard-root {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 100%;
}

/* ── Skeletons ─────────────────────────────────────── */
.skeleton-wrap { display: flex; flex-direction: column; gap: 1.25rem; }
.skel {
  background: var(--color-cb-card);
  border-radius: 1rem;
  animation: pulse 1.6s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .45 } }
.skel-hero  { height: 88px; }
.skel-stat  { height: 88px; }
.skel-card  { height: 220px; }
.skel-card-sm { height: 180px; }
.skel-grid-4 { display: grid; grid-template-columns: repeat(2, 1fr); gap: .75rem; }
.skel-grid-2 { display: grid; grid-template-columns: 1fr; gap: 1rem; }
.skel-grid-3 { display: grid; grid-template-columns: 1fr; gap: 1rem; }
@media (min-width: 640px) {
  .skel-grid-4 { grid-template-columns: repeat(4, 1fr); }
}
@media (min-width: 768px) {
  .skel-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .skel-grid-3 { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1280px) {
  .skel-grid-3 { grid-template-columns: repeat(3, 1fr); }
}

/* ── Hero Card (Profile-style) ─────────────────────── */
.hero-card {
  background: var(--color-cb-card);
  border-radius: 1.25rem;
  overflow: hidden;
}

.hero-cover {
  height: 96px;
  background: var(--color-cb-accent);
  position: relative;
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: .75rem 1rem;
  flex-shrink: 0;
}

.hero-greeting-chip {
  font-size: .72rem; font-weight: 600;
  color: var(--color-cb-contrast);
}

/* Tier chip on cover */
.hero-tier-chip {
  display: inline-flex; align-items: center; gap: .4rem;
  padding: .25rem .75rem;
  border-radius: 999px;
  font-size: .72rem; font-weight: 700;
  background: rgba(255,255,255,.2);
  color: #fff;
  backdrop-filter: blur(4px);
}
.tier-chip-elite { background: rgba(124,58,237,.35); }
.tier-chip-pro   { background: rgba(245,158,11,.35); }
.tier-chip-basic { background: rgba(14,165,233,.35); }
.tier-chip-free  { background: rgba(255,255,255,.15); }

.hero-body {
  padding: 3.25rem 1.25rem 1.25rem;
  position: relative;
}

/* Avatar row: avatar overlaps the cover, actions float right */
.hero-avatar-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 0;
  margin-bottom: .875rem;
  position: absolute;
  top: -2.75rem;
  left: 1.25rem;
  right: 1.25rem;
}
.hero-avatar-wrap { flex-shrink: 0; }
.hero-avatar {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: var(--color-cb-accent);
  border: 4px solid var(--color-cb-card);
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-initials { color: #fff; font-weight: 700; font-size: 1rem; }
.avatar-initials-lg { font-size: 1.4rem; }

/* Hero actions sit on same row as avatar */
.hero-actions { display: flex; gap: .5rem; padding-bottom: .25rem; }

/* On small screens: icon-only buttons to avoid squishing */
@media (max-width: 479px) {
  .hero-actions .btn span { display: none; }
  .hero-actions .btn { padding: .5rem .65rem; }
  .hero-avatar { width: 64px; height: 64px; }
  .avatar-initials-lg { font-size: 1.2rem; }
}

/* Name row */
.hero-name-row {
  display: flex; align-items: center; gap: .5rem;
  flex-wrap: wrap; margin-bottom: .5rem;
}
.hero-name {
  font-size: 1.15rem; font-weight: 700;
  color: var(--color-cb-text);
  margin: 0;
  line-height: 1.2;
}

/* Badges */
.badge {
  display: inline-flex; align-items: center; gap: .3rem;
  padding: .2rem .55rem;
  border-radius: 999px;
  font-size: .65rem; font-weight: 700;
  white-space: nowrap;
}
.badge-role     { background: var(--color-cb-accent-subtle); color: var(--color-cb-accent); }
.badge-verified { background: var(--color-cb-positive-subtle); color: var(--color-cb-positive); }

/* ── Buttons ───────────────────────────────────────── */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: .4rem;
  padding: .5rem .875rem;
  border-radius: .625rem;
  font-size: .78rem; font-weight: 700;
  text-decoration: none; border: none; cursor: pointer;
  transition: opacity .15s, transform .1s;
  white-space: nowrap;
}
.btn:active { transform: scale(.97); }
.btn-primary { background: var(--color-cb-accent-dark); color: var(--color-cb-contrast); }
.btn-primary:hover { opacity: .88; }
.btn-ghost {
  background: goldenrod;
  color: #fff;
  /* border: 1.5px solid var(--color-cb-divider); */
}
.btn-ghost:hover { opacity: .88; };
.btn-sm { padding: .35rem .75rem; font-size: .72rem; }

/* ── Verification Banner ───────────────────────────── */
.verify-banner {
  background: var(--color-cb-card);
  border-radius: 1rem;
  border: 1.5px solid var(--color-cb-warning);
  overflow: hidden;
}

.verify-banner-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: .75rem 1rem;
  background: var(--color-cb-warning-subtle);
  border-bottom: 1px solid var(--color-cb-divider);
}

.verify-banner-title {
  display: flex; align-items: center; gap: .5rem;
  font-size: .825rem; font-weight: 700; color: var(--color-cb-text);
}

.verify-banner-title i { color: var(--color-cb-warning); font-size: .875rem; }

.verify-count-chip {
  display: inline-flex; align-items: center;
  background: var(--color-cb-warning); color: #fff;
  font-size: .6rem; font-weight: 700;
  border-radius: 999px; padding: .15rem .5rem;
}

.verify-dismiss {
  background: none; border: none; cursor: pointer;
  color: var(--color-cb-muted); font-size: .85rem;
  padding: .2rem .4rem; border-radius: .375rem;
  transition: color .15s, background .15s;
  line-height: 1;
}
.verify-dismiss:hover { color: var(--color-cb-text); background: var(--color-cb-base); }

.verify-items { display: flex; flex-direction: column; }

.verify-item {
  display: flex; align-items: center; gap: .875rem;
  padding: .75rem 1rem;
  text-decoration: none; color: inherit;
  border-bottom: 1px solid var(--color-cb-divider);
  transition: background .15s;
}
.verify-item:last-child { border-bottom: none; }
.verify-item:hover { background: var(--color-cb-base); }

.verify-item-icon {
  width: 36px; height: 36px; border-radius: .625rem;
  display: flex; align-items: center; justify-content: center;
  font-size: .85rem; flex-shrink: 0;
}
.vi-warn  { background: var(--color-cb-negative-subtle); color: var(--color-cb-negative); }
.vi-amber { background: var(--color-cb-warning-subtle);  color: var(--color-cb-warning); }

.verify-item-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .1rem; }
.verify-item-label { font-size: .825rem; font-weight: 600; color: var(--color-cb-text); }
.verify-item-hint  { font-size: .72rem; color: var(--color-cb-muted); }
.verify-item-arrow { font-size: .65rem; color: var(--color-cb-muted); flex-shrink: 0; }

/* ── Stat Grid ─────────────────────────────────────── */
.stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .75rem; }
@media (min-width: 640px) { .stat-grid { grid-template-columns: repeat(4, 1fr); } }

.stat-card {
  background: var(--color-cb-card);
  border-radius: 1rem; padding: 1rem;
  display: flex; align-items: center; gap: .875rem;
  transition: transform .15s;
}
.stat-card:hover { transform: translateY(-2px); }
.stat-accent { background: var(--color-cb-accent-subtle); }
.stat-icon {
  width: 40px; height: 40px; border-radius: .75rem;
  background: var(--color-cb-accent-muted); color: var(--color-cb-accent);
  display: flex; align-items: center; justify-content: center;
  font-size: .95rem; flex-shrink: 0;
}
.stat-icon-green { background: var(--color-cb-positive-subtle); color: var(--color-cb-positive); }
.stat-icon-blue  { background: #dbeafe; color: #2563eb; }
.stat-icon-amber { background: var(--color-cb-warning-subtle); color: var(--color-cb-warning); }
.stat-body { min-width: 0; }
.stat-label { font-size: .65rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--color-cb-muted); margin: 0 0 .15rem; }
.stat-value { font-size: 1.15rem; font-weight: 700; color: var(--color-cb-text); line-height: 1.2; margin: 0 0 .15rem; }
.stat-sub { font-size: .65rem; color: var(--color-cb-muted); margin: 0; }

/* ── Panels ────────────────────────────────────────── */
.panel { background: var(--color-cb-card); border-radius: 1.25rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
.panel-header { display: flex; align-items: center; justify-content: space-between; }
.panel-title { font-size: .875rem; font-weight: 700; color: var(--color-cb-text); display: flex; align-items: center; gap: .5rem; margin: 0; }
.panel-title i { font-size: .8rem; color: var(--color-cb-accent); }
.panel-link { font-size: .72rem; font-weight: 600; color: var(--color-cb-accent); text-decoration: none; display: flex; align-items: center; gap: .3rem; }
.panel-link:hover { text-decoration: underline; }

.section-label { font-size: .62rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--color-cb-muted); margin-bottom: -.25rem; }
.section-divider { height: 1px; background: var(--color-cb-divider); }

/* ── Pill Grid ─────────────────────────────────────── */
.pill-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; }
.pill { display: flex; flex-direction: column; align-items: center; background: var(--color-cb-base); border: 1px solid var(--color-cb-divider); border-radius: .625rem; padding: .5rem .25rem; gap: .2rem; }
.pill-val { font-size: .95rem; font-weight: 700; color: var(--color-cb-text); line-height: 1.2; }
.pill-key { font-size: .58rem; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; color: var(--color-cb-muted); }

.clr-accent { color: var(--color-cb-accent) !important; }
.clr-blue   { color: #2563eb !important; }
.clr-amber  { color: var(--color-cb-warning) !important; }
.clr-green  { color: var(--color-cb-positive) !important; }
.clr-red    { color: var(--color-cb-negative) !important; }

/* ── Panel CTA ─────────────────────────────────────── */
.panel-cta { display: flex; align-items: center; gap: .625rem; padding: .75rem 1rem; border-radius: .75rem; background: var(--color-cb-base); border: 1.5px dashed var(--color-cb-divider); font-size: .8rem; font-weight: 600; color: var(--color-cb-muted); text-decoration: none; transition: border-color .15s, color .15s; margin-top: auto; }
.panel-cta:hover { border-color: var(--color-cb-accent); color: var(--color-cb-accent); }
.panel-cta-arrow { margin-left: auto; font-size: .7rem; }

/* ── Main Grid ─────────────────────────────────────── */
.main-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
@media (min-width: 1024px) { .main-grid { grid-template-columns: repeat(2, 1fr); } }

/* ── Bottom Grid (2-col max now profile is removed) ── */
.bottom-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
@media (min-width: 768px) { .bottom-grid { grid-template-columns: repeat(2, 1fr); } }

/* ── Count Badge ───────────────────────────────────── */
.count-badge { display: inline-flex; align-items: center; justify-content: center; background: var(--color-cb-negative-subtle); color: var(--color-cb-negative); font-size: .65rem; font-weight: 700; border-radius: 999px; min-width: 20px; height: 20px; padding: 0 6px; }

/* ── Pending List ──────────────────────────────────── */
.pending-list { display: flex; flex-direction: column; gap: .5rem; }
.pending-item { display: flex; align-items: center; gap: .75rem; padding: .625rem .875rem; border-radius: .75rem; background: var(--color-cb-base); border: 1px solid var(--color-cb-divider); transition: border-color .15s, background .15s; color: inherit; }
.pending-item:hover { border-color: var(--color-cb-accent); background: var(--color-cb-accent-subtle); }
.pending-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot-accent { background: var(--color-cb-accent); }
.dot-blue   { background: #2563eb; }
.pending-info { flex: 1; min-width: 0; }
.pending-title { font-size: .825rem; font-weight: 600; color: var(--color-cb-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0 0 .1rem; }
.pending-meta { font-size: .7rem; color: var(--color-cb-muted); margin: 0; }
.pending-arrow { font-size: .65rem; color: var(--color-cb-muted); flex-shrink: 0; }

/* ── Activity List ─────────────────────────────────── */
.activity-list { display: flex; flex-direction: column; }
.activity-item { display: flex; gap: .75rem; padding: .75rem 0; border-bottom: 1px solid var(--color-cb-divider); }
.activity-item:last-child { border-bottom: none; }
.activity-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--color-cb-accent); flex-shrink: 0; margin-top: .35rem; }
.activity-body { flex: 1; min-width: 0; }
.activity-desc { font-size: .8rem; color: var(--color-cb-text); margin: 0 0 .2rem; line-height: 1.4; }
.activity-time { font-size: .68rem; color: var(--color-cb-muted); margin: 0; }

/* ── Empty State ───────────────────────────────────── */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: .5rem; padding: 2rem 1rem; text-align: center; color: var(--color-cb-muted); }
.empty-icon { font-size: 2rem; color: var(--color-cb-divider); }
.empty-state p { font-size: .875rem; font-weight: 600; margin: 0; color: var(--color-cb-text); }
.empty-state span { font-size: .78rem; margin: 0; }

/* ── Error State ───────────────────────────────────── */
.error-state { display: flex; flex-direction: column; align-items: center; gap: .875rem; padding: 4rem 1rem; text-align: center; }
.error-icon { font-size: 2.5rem; color: var(--color-cb-negative); }
.error-msg { font-size: .875rem; color: var(--color-cb-muted); margin: 0; }

/* ── Misc ──────────────────────────────────────────── */
.capitalize { text-transform: capitalize; }
.no-underline { text-decoration: none; }
/* ── Mobile stat card optimization ─────────────────── */
@media (max-width: 639px) {
  .stat-card {
    justify-content: center;
    padding: .875rem .75rem;
    gap: 0;
  }

  .stat-icon {
    display: none;
  }

  .stat-body {
    width: 100%;
    text-align: center;
  }

  .stat-value {
    font-size: 1.05rem;
  }

  .stat-label,
  .stat-sub {
    text-align: center;
  }
}
.activity-item-link {
  text-decoration: none;
  cursor: pointer;
  border-radius: .625rem;
  margin: 0 -.5rem;
  padding-left: .5rem;
  padding-right: .5rem;
  transition: background .15s;
}
.activity-item-link:hover {
  background: var(--color-cb-accent-subtle);
}
.activity-arrow {
  font-size: .65rem;
  color: var(--color-cb-muted);
  flex-shrink: 0;
  margin-left: auto;
}
</style>