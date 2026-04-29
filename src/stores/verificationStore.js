// src/stores/verificationStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { verificationApi } from '@/api/verificationApi'
import { useSubscriptionStore } from '@/stores/subscriptionStore'

export const useVerificationStore = defineStore('verification', () => {

  // ── State ─────────────────────────────────────────────────
  const submissions      = ref([])
  const status           = ref(null)
  const submitting       = ref(false)
  const loading          = ref(false)
  const error            = ref(null)
  const phoneOtpSent     = ref(false)
  const phoneOtpCooldown = ref(0)
  const allowedDocs      = ref([]) // Allowed document types for current user
  const accountType      = ref(null) // 'corporate', 'student', or 'individual'
  let cooldownTimer      = null

  // ── Getters ───────────────────────────────────────────────

  // The latest submitted document — used to determine the real rejection state
  // since identityStatus can stay 'pending' even after a doc is rejected.
  const latestDoc = computed(() => {
    // Prefer fetched submissions (more complete data)
    if (submissions.value?.length) return submissions.value[0]
    const docs = status.value?.documents
    if (docs?.length) return docs[docs.length - 1]
    return null
  })

  // A doc is effectively rejected if either the top-level status says so,
  // OR the most recent document was rejected (API sometimes keeps identityStatus
  // as 'pending' even after rejecting the document).
  const isVerified   = computed(() => status.value?.identityStatus === 'verified')
  const isRejected   = computed(() =>
    status.value?.identityStatus === 'rejected' ||
    latestDoc.value?.status === 'rejected'
  )
  const isPending    = computed(() =>
    status.value?.identityStatus === 'pending' &&
    latestDoc.value?.status !== 'rejected'
  )
  const isUnverified = computed(() =>
    !status.value || status.value?.identityStatus === 'unverified'
  )
  const currentStatus = computed(() => {
    // Surface the document-level status when it's more accurate
    if (latestDoc.value?.status === 'rejected') return 'rejected'
    return status.value?.identityStatus || 'unverified'
  })
  const hasBadge        = computed(() => status.value?.badgeEarned || false)
  const allowedDocTypes = computed(() => allowedDocs.value || [])
  const userAccountType = computed(() => accountType.value || 'individual')

  const latestSubmission = computed(() => latestDoc.value)

  // ── Actions ───────────────────────────────────────────────

  function stopCooldown() {
    if (cooldownTimer) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }

  function startCooldown(seconds = 60) {
    stopCooldown()
    phoneOtpCooldown.value = seconds
    cooldownTimer = setInterval(() => {
      phoneOtpCooldown.value--
      if (phoneOtpCooldown.value <= 0) {
        stopCooldown()
      }
    }, 1000)
  }

  async function fetchAllowedDocs() {
    loading.value = true
    error.value   = null
    try {
      const res = await verificationApi.getAllowedDocs()
      if (res.data) {
        allowedDocs.value = res.data.allowedDocTypes || []
        accountType.value = res.data.accountType || 'individual'
      }
      return res
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load allowed document types'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function submitVerification(payload) {
    submitting.value = true
    error.value      = null
    try {
      const res = await verificationApi.submitVerification(payload)
      if (res.data) {
        submissions.value = [res.data, ...submissions.value]
      }
      await fetchVerificationStatus()
      // Verification status changed — plans eligibility is user-specific and stale.
      // Reset so the next visit to the plans page re-fetches with updated eligibility.
      useSubscriptionStore().plansLoaded = false
      return res
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to submit verification'
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function fetchMyVerifications() {
    loading.value = true
    error.value   = null
    try {
      const res = await verificationApi.getMyVerifications()
      submissions.value = res.data?.verifications || []
      return res
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load verifications'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchVerificationStatus() {
    loading.value = true
    error.value   = null
    try {
      const res = await verificationApi.getVerificationStatus()
      status.value = res.data?.status || null
      return res
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load verification status'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearVerification() {
    submissions.value  = []
    status.value       = null
    error.value        = null
    phoneOtpSent.value = false
    phoneOtpCooldown.value = 0
    allowedDocs.value  = []
    accountType.value  = null
    stopCooldown()
  }

  async function sendPhoneOtp(phone) {
    loading.value = true
    error.value   = null
    try {
      const res = await verificationApi.sendPhoneOtp(phone)
      phoneOtpSent.value = true
      startCooldown(60)
      return res
    } catch (err) {
      error.value = err.response?.data?.data?.message
                 || err.response?.data?.message
                 || 'Failed to send OTP'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function verifyPhoneOtp(otp) {
    submitting.value = true
    error.value      = null
    try {
      const res = await verificationApi.verifyPhoneOtp(otp)
      await fetchVerificationStatus()
      phoneOtpSent.value     = false
      phoneOtpCooldown.value = 0
      stopCooldown()
      // Phone verified — may unlock plans that require phone verification (e.g. Elite).
      // Reset plans cache so eligibility is re-computed server-side on next page visit.
      useSubscriptionStore().plansLoaded = false
      return res
    } catch (err) {
      error.value = err.response?.data?.message || 'Invalid or expired OTP'
      throw err
    } finally {
      submitting.value = false
    }
  }

  return {
    submissions,
    status,
    submitting,
    loading,
    error,
    phoneOtpSent,
    phoneOtpCooldown,
    allowedDocs,
    accountType,
    isVerified,
    isPending,
    isRejected,
    isUnverified,
    currentStatus,
    hasBadge,
    latestSubmission,
    allowedDocTypes,
    userAccountType,
    submitVerification,
    fetchMyVerifications,
    fetchVerificationStatus,
    fetchAllowedDocs,
    sendPhoneOtp,
    verifyPhoneOtp,
    clearVerification,
    stopCooldown,
  }
})