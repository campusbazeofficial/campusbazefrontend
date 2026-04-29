// src/composables/useErrandLifecycle.js
import { ref } from 'vue'
import { useErrandStore } from '@/stores/errandStore'
import { ERRAND_STATUS } from '@/constants/errandStatus'

export function useErrandLifecycle() {
  const store = useErrandStore()
  
  // Modal visibility state
  const showStartModal = ref(false)
  const showCompleteModal = ref(false)
  const showConfirmModal = ref(false)
  const showCancelModal = ref(false)
  const showDisputeModal = ref(false)
  const showPayLoading = ref(false)
  
  // Selected errand for action
  const selectedErrand = ref(null)
  const selectedErrandId = ref(null)

  // ─── Action Triggers (open modals) ─────────────────────────────
  function triggerStart(errand) {
    selectedErrand.value = errand
    selectedErrandId.value = errand._id
    showStartModal.value = true
  }

  function triggerComplete(errand) {
    selectedErrand.value = errand
    selectedErrandId.value = errand._id
    showCompleteModal.value = true
  }

  function triggerConfirm(errand) {
    selectedErrand.value = errand
    selectedErrandId.value = errand._id
    showConfirmModal.value = true
  }

  function triggerCancel(errand) {
    selectedErrand.value = errand
    selectedErrandId.value = errand._id
    showCancelModal.value = true
  }

  function triggerDispute(errand) {
    selectedErrand.value = errand
    selectedErrandId.value = errand._id
    showDisputeModal.value = true
  }

  async function executePay(errandId) {
    showPayLoading.value = true
    try {
      const res = await store.payErrand(errandId)
      const authorizationUrl =
        res?.data?.payment?.authorizationUrl ??
        res?.data?.authorizationUrl ??
        res?.data?.authorization_url ??
        res?.data?.paymentUrl ??
        res?.data?.url

      if (authorizationUrl) {
        // Save the errandId so MyErrands can fetch fresh escrow status on return
        sessionStorage.setItem('cb_paid_errand', errandId)
        window.location.href = authorizationUrl
        return { success: true }
      } else {
        return { success: false, error: 'No payment URL returned from server' }
      }
    } catch (error) {
      const status = error?.response?.status
      const msg = error?.response?.data?.data?.message ||
                  error?.response?.data?.message || ''

      // Backend returns 500 when payment was already initiated (escrow already exists).
      // Tell the user to wait for confirmation instead of showing a generic error.
      if (status === 500 || msg.toLowerCase().includes('already')) {
        return {
          success: false,
          alreadyPaid: true,
          error: 'Payment already initiated — please wait for confirmation or check your email.',
        }
      }
      return { success: false, error: store.error }
    } finally {
      showPayLoading.value = false
    }
  }

  // ─── Action Executors (API calls) ─────────────────────────────
  async function executeStart() {
    try {
      await store.startErrand(selectedErrandId.value)
      closeAllModals()
      return { success: true }
    } catch (error) {
      return { success: false, error: store.error }
    }
  }

  async function executeComplete(proofFile) {
    try {
      await store.completeErrand(selectedErrandId.value, proofFile)
      closeAllModals()
      return { success: true }
    } catch (error) {
      return { success: false, error: store.error }
    }
  }

  async function executeConfirm() {
    try {
      await store.confirmErrand(selectedErrandId.value)
      closeAllModals()
      return { success: true }
    } catch (error) {
      return { success: false, error: store.error }
    }
  }

  async function executeCancel() {
    try {
      await store.cancelErrand(selectedErrandId.value)
      closeAllModals()
      return { success: true }
    } catch (error) {
      return { success: false, error: store.error }
    }
  }

  async function executeDispute(reason) {
    try {
      await store.disputeErrand(selectedErrandId.value, reason)
      closeAllModals()
      return { success: true }
    } catch (error) {
      return { success: false, error: store.error }
    }
  }

  async function executeAcceptBid(errandId, bidId) {
    try {
      await store.acceptBid(errandId, bidId)
      return { success: true }
    } catch (error) {
      return { success: false, error: store.error }
    }
  }

  async function executeWithdrawBid(errandId, bidId) {
    try {
      await store.withdrawBid(errandId, bidId)
      return { success: true }
    } catch (error) {
      return { success: false, error: store.error }
    }
  }

  // ─── Modal Management ─────────────────────────────────────────
  function closeAllModals() {
    showStartModal.value = false
    showCompleteModal.value = false
    showConfirmModal.value = false
    showCancelModal.value = false
    showDisputeModal.value = false
    selectedErrand.value = null
    selectedErrandId.value = null
  }

  // ─── Computed Helpers ────────────────────────────────────────
  function isActionLoading() {
    return store.actionLoading
  }

  function getActionError() {
    return store.error
  }

  return {
    // State
    showStartModal,
    showCompleteModal,
    showConfirmModal,
    showCancelModal,
    showDisputeModal,
    showPayLoading,
    selectedErrand,
    actionLoading: store.actionLoading,
    actionError: store.error,
    
    // Triggers
    triggerStart,
    triggerComplete,
    triggerConfirm,
    triggerCancel,
    triggerDispute,
    
    // Executors
    executeStart,
    executeComplete,
    executeConfirm,
    executeCancel,
    executeDispute,
    executePay,
    executeAcceptBid,
    executeWithdrawBid,
    
    // Utilities
    closeAllModals,
    isActionLoading,
    getActionError,
  }
}