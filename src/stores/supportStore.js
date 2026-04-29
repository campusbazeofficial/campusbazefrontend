// src/stores/supportStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supportApi } from '@/api/supportApi'

export const useSupportStore = defineStore('support', () => {
  // ── State ───────────────────────────────────────────────────
  const categories    = ref([])
  const tickets       = ref([])
  const currentTicket = ref(null)
  const meta          = ref(null)

  // Admin
  const adminTickets  = ref([])
  const adminMeta     = ref(null)

  const loading           = ref(false)
  const actionLoading     = ref(false)
  const categoriesLoading = ref(false)
  const error             = ref(null)

  // ── Getters ─────────────────────────────────────────────────
  const openTickets    = computed(() => tickets.value.filter(t => t.status === 'open'))
  const hasOpenTickets = computed(() => openTickets.value.length > 0)

  // ── Category helpers ─────────────────────────────────────────
  function getTypesForCategory(categoryValue) {
    const cat = categories.value.find(c => c.value === categoryValue)
    return cat?.types ?? []
  }

  function getTemplate(categoryValue, typeValue) {
    const types = getTypesForCategory(categoryValue)
    return types.find(t => t.value === typeValue)?.descriptionTemplate ?? ''
  }

  // ── User actions ─────────────────────────────────────────────
  async function fetchCategories() {
    if (categories.value.length) return
    categoriesLoading.value = true
    error.value = null
    try {
      const res = await supportApi.getCategories()
      // Shape: { success, data: { categories: [...] } }
      categories.value = res.data?.categories ?? res.categories ?? []
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load categories'
      throw err
    } finally {
      categoriesLoading.value = false
    }
  }

  async function fetchMyTickets(params = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await supportApi.getMyTickets({ page: 1, limit: 20, ...params })
      // Shape: { success, data: [...], meta: {...} }
      tickets.value = res.data ?? []
      meta.value    = res.meta ?? null
      return res
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load tickets'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchTicket(ticketId) {
    loading.value = true
    error.value = null
    currentTicket.value = null
    try {
      const res = await supportApi.getTicket(ticketId)
      // Shape: { success, data: { ticket: {...} } }
      currentTicket.value = res.data?.ticket ?? res.data ?? res
      return currentTicket.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load ticket'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createTicket(data) {
    actionLoading.value = true
    error.value = null
    try {
      const res = await supportApi.createTicket(data)
      const created = res.data?.ticket ?? res.ticket ?? res.data ?? res
      tickets.value.unshift(created)
      return created
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to submit ticket'
      throw err
    } finally {
      actionLoading.value = false
    }
  }

  // ── Admin actions ────────────────────────────────────────────
  async function fetchAdminTickets(params = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await supportApi.getAdminTickets({ page: 1, limit: 20, ...params })
      adminTickets.value = res.data ?? []
      adminMeta.value    = res.meta ?? null
      return res
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load tickets'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchAdminTicket(ticketId) {
    loading.value = true
    error.value = null
    currentTicket.value = null
    try {
      const res = await supportApi.getAdminTicket(ticketId)
      currentTicket.value = res.data?.ticket ?? res.data ?? res
      return currentTicket.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load ticket'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTicket(ticketId, data) {
    actionLoading.value = true
    error.value = null
    try {
      const res = await supportApi.updateTicket(ticketId, data)
      const updated = res.data?.ticket ?? res.ticket ?? res.data ?? res
      if (currentTicket.value?._id === ticketId) {
        currentTicket.value = { ...currentTicket.value, ...updated }
      }
      const idx = adminTickets.value.findIndex(t => t._id === ticketId)
      if (idx !== -1) adminTickets.value[idx] = { ...adminTickets.value[idx], ...updated }
      return updated
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update ticket'
      throw err
    } finally {
      actionLoading.value = false
    }
  }

  function clearCurrentTicket() {
    currentTicket.value = null
  }

  return {
    categories, tickets, currentTicket, meta,
    adminTickets, adminMeta,
    loading, actionLoading, categoriesLoading, error,
    openTickets, hasOpenTickets,
    getTypesForCategory, getTemplate,
    fetchCategories,
    fetchMyTickets, fetchTicket, createTicket,
    fetchAdminTickets, fetchAdminTicket, updateTicket,
    clearCurrentTicket,
  }
})