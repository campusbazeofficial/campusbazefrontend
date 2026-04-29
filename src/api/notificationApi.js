// src/api/notificationApi.js
import api from './api'
import { withRetryDecorator } from './apiRetry'

export const notificationApi = {
  /**
   * GET /api/v1/notifications - List all notifications
   * @param {Object} params - Query params (page, limit, isRead)
   */
  async getNotifications(params = {}) {
    const response = await api.get('/api/v1/notifications', { params })
    return response.data
  },

  /**
   * PATCH /api/v1/notifications/read-all - Mark all as read
   */
  async markAllAsRead() {
    const response = await api.patch('/api/v1/notifications/read-all')
    return response.data
  },

  /**
   * PATCH /api/v1/notifications/:notificationId/read - Mark single as read
   */
  async markAsRead(notificationId) {
    const response = await api.patch(`/api/v1/notifications/${notificationId}/read`)
    return response.data
  },

  /**
   * GET /api/v1/notifications/:type/:notificationId
   * Fetches the full notification AND marks it as read in one call.
   * Use this when the user taps a notification to navigate somewhere.
   * @param {string} type - notification.type (e.g. 'errand_update', 'new_bid')
   * @param {string} notificationId - notification._id
   */
  async resolveNotification(type, notificationId) {
    const response = await api.get(`/api/v1/notifications/${type}/${notificationId}`)
    return response.data
  },

  /**
   * DELETE /api/v1/notifications/:notificationId - Delete notification
   */
  async deleteNotification(notificationId) {
    const response = await api.delete(`/api/v1/notifications/${notificationId}`)
    return response.data
  },

  /**
   * Get unread count only (lightweight polling)
   */
  async getUnreadCount() {
    const response = await api.get('/api/v1/notifications', { 
      params: { limit: 1, page: 1 } 
    })
    return response.data?.unreadCount || 0
  }
}

// Retry-enabled version for critical operations
export const notificationApiWithRetry = {
  getNotifications: withRetryDecorator(
    notificationApi.getNotifications, 
    'getNotifications'
  ),
  markAllAsRead: withRetryDecorator(
    notificationApi.markAllAsRead, 
    'markAllAsRead'
  ),
}