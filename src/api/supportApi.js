// src/api/supportApi.js
import api from './api'

export const supportApi = {
  // ─── User endpoints ──────────────────────────────────────────

  /** GET /api/v1/support/categories */
  async getCategories() {
    const response = await api.get('/api/v1/support/categories')
    return response.data
  },

  /** GET /api/v1/support — user's own tickets */
  async getMyTickets(params = {}) {
    const response = await api.get('/api/v1/support', { params })
    return response.data
  },

  /** GET /api/v1/support/:ticketId */
  async getTicket(ticketId) {
    const response = await api.get(`/api/v1/support/${ticketId}`)
    return response.data
  },

  /** POST /api/v1/support */
  async createTicket(data) {
    const response = await api.post('/api/v1/support', data)
    return response.data
  },

  // ─── Admin endpoints ─────────────────────────────────────────

  /**
   * GET /api/v1/admin/support
   * @param {{ page?, limit?, status?, priority?, category? }} params
   */
  async getAdminTickets(params = {}) {
    const response = await api.get('/api/v1/admin/support', { params })
    return response.data
  },

  /**
   * GET /api/v1/admin/support/:ticketId
   */
  async getAdminTicket(ticketId) {
    const response = await api.get(`/api/v1/admin/support/${ticketId}`)
    return response.data
  },

  /**
   * PATCH /api/v1/admin/support/:ticketId
   * @param {{ status?, priority?, adminNote? }} data
   */
  async updateTicket(ticketId, data) {
    const response = await api.patch(`/api/v1/admin/support/${ticketId}`, data)
    return response.data
  },
}