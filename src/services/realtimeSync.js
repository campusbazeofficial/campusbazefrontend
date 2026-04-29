// src/services/realtimeSync.js
// ─────────────────────────────────────────────────────────────────────────────
// Wires Pinia stores to socket events after the user authenticates.
// Uses static ES imports — no require() (Vite/ESM only).
//
// initRealtime()    — call once after socket connects
// teardownRealtime() — call on logout to remove all listeners
// ─────────────────────────────────────────────────────────────────────────────
import { socketService, SOCKET_EVENTS } from '@/services/socket'
import { useNotificationStore } from '@/stores/notificationStore'
import { useWalletStore }        from '@/stores/walletStore'
import { useUserStore }          from '@/stores/userStore'
import { useVerificationStore }  from '@/stores/verificationStore'
import { useErrandStore }        from '@/stores/errandStore'
import { useServiceStore }       from '@/stores/serviceStore'
import { useSubscriptionStore }  from '@/stores/subscriptionStore'

let _bound = false
// Keep named references so off() removes the exact same function
const _h = {}

export function initRealtime() {
  if (_bound) return
  _bound = true

  const notif  = useNotificationStore()
  const wallet = useWalletStore()
  const user   = useUserStore()
  const vStore = useVerificationStore()
  const errand = useErrandStore()
  const svc    = useServiceStore()
  const sub    = useSubscriptionStore()

  // ── Notifications ──────────────────────────────────────────────────────────
  _h.notifNew = (n) => notif.addRealtimeNotification(n)

  _h.notifCount = ({ count }) => { notif.unreadCount = count ?? 0 }

  _h.notifRead = ({ id, all }) => {
    if (all) {
      notif.notifications.forEach(n => { n.isRead = true })
      notif.unreadCount = 0
    } else if (id) {
      const n = notif.notifications.find(n => n._id === id)
      if (n && !n.isRead) {
        n.isRead = true
        notif.unreadCount = Math.max(0, notif.unreadCount - 1)
      }
    }
  }

  // ── Wallet ─────────────────────────────────────────────────────────────────
  _h.wallet = ({ cbcBalance, ngnEarnings }) => {
    if (cbcBalance  != null) wallet.cbcBalance  = cbcBalance
    if (ngnEarnings != null) wallet.ngnEarnings = ngnEarnings
  }

  // ── Account ────────────────────────────────────────────────────────────────
  _h.suspended = ({ reason }) => {
    if (user.profile?.user) {
      user.profile.user.isSuspended   = true
      user.profile.user.suspendReason = reason
    }
  }
  _h.unsuspended = () => {
    if (user.profile?.user) {
      user.profile.user.isSuspended   = false
      user.profile.user.suspendReason = null
    }
  }

  // ── Verification ───────────────────────────────────────────────────────────
  // When the admin approves/rejects, re-fetch both status and submissions so
  // latestDoc (which drives isVerified/isPending/isRejected) reflects the new
  // document-level status rather than reading stale submissions[0].status.
  _h.verification = async ({ status, adminNote, badgeEarned }) => {
    try {
      await Promise.all([
        vStore.fetchVerificationStatus(),
        vStore.fetchMyVerifications(),
      ])
    } catch {}
    // Also patch userStore so the header badge/chip updates immediately
    if (user.profile?.user) {
      user.profile.user.identityVerificationStatus = status
      if (badgeEarned) user.profile.user.identityBadge = true
    }
  }

  // ── Errands ────────────────────────────────────────────────────────────────
  _h.errandUpdated = ({ errandId, status, escrowConfirmed, ...rest }) => {
    // Build patch from whatever the server sends
    const patch = {}
    if (status          !== undefined) patch.status          = status
    if (escrowConfirmed !== undefined) patch.escrowConfirmed = escrowConfirmed
    // Spread any other top-level fields the backend chooses to send
    Object.assign(patch, rest)

    if (!Object.keys(patch).length) return

    // Patch detail view
    if (errand.current?._id === errandId) {
      errand.current = { ...errand.current, ...patch }
    }
    // Patch every list that might contain this errand
    for (const list of [
      errand.posted    ?? [],
      errand.running   ?? [],
      errand.inProgress ?? [],
      errand.market    ?? [],
    ]) {
      const idx = list.findIndex(e => e._id === errandId)
      if (idx !== -1) list[idx] = { ...list[idx], ...patch }
    }
  }

  _h.errandBid = ({ errandId, bid }) => {
    if (errand.current?._id === errandId && bid) {
      const bids = errand.current.bids ?? []
      if (!bids.some(b => b._id === bid._id)) {
        errand.current = { ...errand.current, bids: [...bids, bid] }
      }
    }
  }

  // ── Orders ─────────────────────────────────────────────────────────────────
  _h.orderUpdated = ({ orderId, status }) => {
    if (svc.currentOrder?._id === orderId) {
      svc.currentOrder = { ...svc.currentOrder, status }
    }
    for (const list of [svc.buyingOrders ?? [], svc.sellingOrders ?? []]) {
      const idx = list.findIndex(o => o._id === orderId)
      if (idx !== -1) list[idx] = { ...list[idx], status }
    }
  }

  // ── Subscription ───────────────────────────────────────────────────────────
  _h.subscription = (subscription) => {
    if (!subscription) return
    sub.subscription = subscription
    sub.plansLoaded  = false
    if (subscription.tier && user.profile?.user) {
      user.profile.user.subscriptionTier = subscription.tier
    }
  }

  // ── Register ───────────────────────────────────────────────────────────────
  socketService.on(SOCKET_EVENTS.NOTIFICATION_NEW,     _h.notifNew)
  socketService.on(SOCKET_EVENTS.NOTIFICATION_COUNT,   _h.notifCount)
  socketService.on(SOCKET_EVENTS.NOTIFICATION_READ,    _h.notifRead)
  socketService.on(SOCKET_EVENTS.WALLET_UPDATED,       _h.wallet)
  socketService.on(SOCKET_EVENTS.USER_SUSPENDED,       _h.suspended)
  socketService.on(SOCKET_EVENTS.USER_UNSUSPENDED,     _h.unsuspended)
  socketService.on(SOCKET_EVENTS.VERIFICATION_RESULT,  _h.verification)
  socketService.on(SOCKET_EVENTS.ERRAND_UPDATED,       _h.errandUpdated)
  socketService.on(SOCKET_EVENTS.ERRAND_BID_NEW,       _h.errandBid)
  socketService.on(SOCKET_EVENTS.ORDER_UPDATED,        _h.orderUpdated)
  socketService.on(SOCKET_EVENTS.SUBSCRIPTION_UPDATED, _h.subscription)
}

export function teardownRealtime() {
  if (!_bound) return
  _bound = false

  socketService.off(SOCKET_EVENTS.NOTIFICATION_NEW,     _h.notifNew)
  socketService.off(SOCKET_EVENTS.NOTIFICATION_COUNT,   _h.notifCount)
  socketService.off(SOCKET_EVENTS.NOTIFICATION_READ,    _h.notifRead)
  socketService.off(SOCKET_EVENTS.WALLET_UPDATED,       _h.wallet)
  socketService.off(SOCKET_EVENTS.USER_SUSPENDED,       _h.suspended)
  socketService.off(SOCKET_EVENTS.USER_UNSUSPENDED,     _h.unsuspended)
  socketService.off(SOCKET_EVENTS.VERIFICATION_RESULT,  _h.verification)
  socketService.off(SOCKET_EVENTS.ERRAND_UPDATED,       _h.errandUpdated)
  socketService.off(SOCKET_EVENTS.ERRAND_BID_NEW,       _h.errandBid)
  socketService.off(SOCKET_EVENTS.ORDER_UPDATED,        _h.orderUpdated)
  socketService.off(SOCKET_EVENTS.SUBSCRIPTION_UPDATED, _h.subscription)
}