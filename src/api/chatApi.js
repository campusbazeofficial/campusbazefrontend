// src/api/chatApi.js
import api from "./api";

export const chatApi = {
  /**
   * Get all chat rooms for the current user
   * GET /api/v1/chat/rooms
   */
  async getRooms() {
    const response = await api.get("/api/v1/chat/rooms");
    return response.data;
  },

  /**
   * Get messages for a room (cursor-based pagination)
   * GET /api/v1/chat/:roomId/messages
   * @param {string} roomId
   * @param {Object} params - { before, limit }
   *   - Omit `before` on first load
   *   - Pass the returned `nextCursor` as `before` to load older messages
   *   - Messages returned chronological order (oldest → newest)
   */
  async getMessages(roomId, params = {}) {
    const query = new URLSearchParams();
    if (params.before) query.append("before", params.before);
    if (params.limit)  query.append("limit",  params.limit);
    const url = `/api/v1/chat/${roomId}/messages${query.toString() ? `?${query}` : ""}`;
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Send a message via HTTP
   * POST /api/v1/chat/:roomId/messages
   * @param {string} roomId
   * @param {Object} data - { content, replyToId? }
   */
  async sendMessage(roomId, data) {
    const response = await api.post(`/api/v1/chat/${roomId}/messages`, data);
    return response.data;
  },

  /**
   * Mark all messages in a room as read
   * PUT /api/v1/chat/:roomId/read
   * Call on initial room open (NOT on pagination/scroll).
   * Server emits to sender:
   *   chat:read:ack      { roomId, readBy, readAt }
   *   chat:unread:update { roomId, unreadCount }
   */
  async markRoomRead(roomId) {
    const response = await api.put(`/api/v1/chat/${roomId}/read`);
    return response.data;
  },
};