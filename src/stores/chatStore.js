// src/stores/chatStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { io } from "socket.io-client";
import { chatApi } from "@/api/chatApi";
import { useUserStore } from "@/stores/userStore";
import { useAuthStore } from "@/stores/authStore";

export const useChatStore = defineStore("chat", () => {
  // ─── State ─────────────────────────────────────────────────────────────────

  const rooms = ref([]);

  // Lazily resolved — avoids circular store issues
  const currentUserId = computed(() => useUserStore().user?._id || null);
  const roomsLoading = ref(false);

  // Keyed by roomId
  const messagesByRoom = ref({});
  const messagesLoadingByRoom = ref({});
  const hasMoreByRoom = ref({});
  const nextCursorByRoom = ref({});

  const activeRoomId = ref(null);

  const actionLoading = ref(false);
  const error = ref(null);

  // Socket state
  const socket = ref(null);
  const socketConnected = ref(false);
  const socketError = ref(null);

  // Typing indicators — { [roomId]: { userId, name, avatar, expiresAt } | null }
  const typingByRoom = ref({});

  // Polling fallback
  let pollInterval = null;

  // ─── Getters ───────────────────────────────────────────────────────────────

  const sortedRooms = computed(() =>
    [...rooms.value].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    )
  );

  const totalUnread = computed(() =>
    rooms.value.reduce((sum, r) => sum + (r.unreadCount || 0), 0)
  );

  const activeRoom = computed(() =>
    rooms.value.find((r) => r.roomId === activeRoomId.value) || null
  );

  const activeMessages = computed(() =>
    messagesByRoom.value[activeRoomId.value] || []
  );

  const activeMessagesLoading = computed(
    () => messagesLoadingByRoom.value[activeRoomId.value] || false
  );

  const activeHasMore = computed(
    () => hasMoreByRoom.value[activeRoomId.value] || false
  );

  /** Who is typing in the active room right now */
  const activeTyping = computed(
    () => typingByRoom.value[activeRoomId.value] || null
  );

  /**
   * Contacts grouped by otherParty._id — one entry per person,
   * with all their rooms listed underneath.
   */
  const groupedContacts = computed(() => {
    const map = new Map();

    for (const room of sortedRooms.value) {
      const cid = room.otherParty?._id;
      if (!cid) continue;

      if (!map.has(cid)) {
        map.set(cid, {
          contactId: cid,
          otherParty: room.otherParty,
          rooms: [],
          totalUnread: 0,
          lastActivity: null,
          lastMessage: null,
          lastContextTitle: null,
        });
      }

      const contact = map.get(cid);
      contact.rooms.push(room);
      contact.totalUnread += room.unreadCount || 0;

      // Track most recent activity across all rooms for this contact
      const roomTime = new Date(room.lastMessage?.createdAt || room.updatedAt || 0);
      const currentBest = new Date(contact.lastActivity || 0);
      if (roomTime > currentBest) {
        contact.lastActivity = room.lastMessage?.createdAt || room.updatedAt;
        contact.lastMessage = room.lastMessage || null;
        contact.lastContextTitle = room.contextTitle;
      }
    }

    // Sort contacts by most recent activity
    return [...map.values()].sort(
      (a, b) => new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0)
    );
  });

  // ─── Helpers ───────────────────────────────────────────────────────────────

  function getRoomTypeIcon(roomType) {
    return roomType === "order"
      ? "fa-solid fa-bag-shopping"
      : "fa-solid fa-thumbtack";
  }

  function getRoomTypeLabel(roomType) {
    return roomType === "order" ? "Order" : "Errand";
  }

  function formatRoomTime(isoString) {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
  }

  function formatMessageTime(isoString) {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatMessageDate(isoString) {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
    return date.toLocaleDateString("en-NG", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  /** Returns true for axios duplicate-cancel and AbortController errors — safe to swallow */
  function isCancelled(err) {
    return (
      err?.code === "ERR_CANCELED" ||
      err?.name === "CanceledError" ||
      err?.name === "AbortError"
    );
  }

  async function fetchRooms() {
    if (roomsLoading.value) return; // already in flight — don't duplicate
    roomsLoading.value = true;
    error.value = null;
    try {
      const res = await chatApi.getRooms();
      rooms.value = res?.data?.rooms || [];
      return res;
    } catch (err) {
      if (isCancelled(err)) return;
      error.value = err.response?.data?.message || "Failed to load chats";
      throw err;
    } finally {
      roomsLoading.value = false;
    }
  }

  async function fetchMessages(roomId, { before } = {}) {
    if (messagesLoadingByRoom.value[roomId]) return; // guard duplicate in-flight
    messagesLoadingByRoom.value[roomId] = true;
    error.value = null;
    try {
      const res = await chatApi.getMessages(roomId, { before, limit: 30 });
      const data = res?.data || {};
      const incoming = data.messages || [];

      if (before) {
        // Prepend older messages (full spread for reactivity)
        messagesByRoom.value = {
          ...messagesByRoom.value,
          [roomId]: [...incoming, ...(messagesByRoom.value[roomId] || [])],
        };
      } else {
        messagesByRoom.value = {
          ...messagesByRoom.value,
          [roomId]: incoming,
        };
      }

      hasMoreByRoom.value[roomId] = data.hasMore || false;
      nextCursorByRoom.value[roomId] = data.nextCursor || null;

      return res;
    } catch (err) {
      if (isCancelled(err)) return;
      error.value = err.response?.data?.message || "Failed to load messages";
      throw err;
    } finally {
      messagesLoadingByRoom.value[roomId] = false;
    }
  }

  async function sendMessage(roomId, content, replyToId = null) {
    actionLoading.value = true;
    error.value = null;
    try {
      const payload = { content };
      if (replyToId) payload.replyToId = replyToId;

      const res = await chatApi.sendMessage(roomId, payload);
      const message = res?.data?.message;

      if (message) {
        const existing = messagesByRoom.value[roomId] || [];
        const msgId = message._id || message.id;
        const exists = existing.some((m) => (m._id || m.id) === msgId);

        // Spread assignment — guaranteed reactivity
        messagesByRoom.value = {
          ...messagesByRoom.value,
          [roomId]: exists ? existing : [...existing, message],
        };

        // Update room's lastMessage — full array replacement guarantees totalUnread recomputes
        const roomIdx = rooms.value.findIndex((r) => r.roomId === roomId);
        if (roomIdx !== -1) {
          const updated = [...rooms.value];
          updated[roomIdx] = {
            ...updated[roomIdx],
            lastMessage: {
              content,
              senderId: message.senderId,
              createdAt: message.createdAt,
            },
            updatedAt: message.createdAt,
          };
          rooms.value = updated;
        }
      }

      return res;
    } catch (err) {
      if (isCancelled(err)) return; // duplicate request — silently ignore
      error.value = err.response?.data?.message || "Failed to send message";
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  /**
   * Inject a message received via socket into local state
   */
  function injectSocketMessage(roomId, message) {
    const existing = messagesByRoom.value[roomId] || [];
    const msgId = message._id || message.id;
    const exists = existing.some((m) => (m._id || m.id) === msgId);

    // Always reassign (never .push) — guarantees Vue reactivity on dynamic keys
    messagesByRoom.value = {
      ...messagesByRoom.value,
      [roomId]: exists ? existing : [...existing, message],
    };

    // Update room lastMessage + unread — full array replacement guarantees totalUnread recomputes
    const roomIdx = rooms.value.findIndex((r) => r.roomId === roomId);
    if (roomIdx !== -1) {
      const updated = [...rooms.value];
      updated[roomIdx] = {
        ...updated[roomIdx],
        lastMessage: {
          content: message.content,
          senderId: message.senderId,
          createdAt: message.createdAt,
        },
        updatedAt: message.createdAt,
        unreadCount:
          roomId !== activeRoomId.value
            ? (updated[roomIdx].unreadCount || 0) + 1
            : 0,
      };
      rooms.value = updated;
    }
  }

  // ─── Socket ────────────────────────────────────────────────────────────────

  /**
   * Connect using the stored access token — no need to pass it manually.
   * Call this from the Chat page on mount.
   */
  function connectSocketAuto() {
    const authStore = useAuthStore()
    if (authStore.accessToken) connectSocket(authStore.accessToken)
  }

  /**
   * Connect to the socket.io server.
   * @param {string} token - Auth token for the socket handshake
   *
   * Server → Client events handled:
   *   "new_message"      { roomId, message }
   *   "message_updated"  { roomId, message }
   *   "message_deleted"  { roomId, messageId }
   *   "typing_start"     { roomId, userId, firstName, avatar }
   *   "typing_stop"      { roomId, userId }
   *   "chat:read:ack"    { roomId, readBy, readAt }
   *
   * Client → Server events emitted:
   *   "join_room"        { roomId }
   *   "typing_start"     { roomId }
   *   "typing_stop"      { roomId }
   *   (read marking is now done via REST PUT /:roomId/read)
   */
  function connectSocket(token) {
    if (socket.value?.connected) return;

    const socketUrl =
      import.meta.env.VITE_API_BASE_URL || window.location.origin;

    const s = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socket.value = s;

    s.on("connect", () => {
      socketConnected.value = true;
      socketError.value = null;
      // Re-join every known room
      for (const room of rooms.value) {
        s.emit("join_room", { roomId: room.roomId });
      }
      _stopPolling();
      // Fetch latest messages for active room to fill any gap during disconnect
      if (activeRoomId.value) {
        fetchMessages(activeRoomId.value).catch(() => {});
      }
    });

    s.on("disconnect", (reason) => {
      socketConnected.value = false;
      // Clear all typing indicators — they'd be stale after disconnect
      typingByRoom.value = {};
      if (reason === "io server disconnect") s.connect();
      _startPolling();
    });

    s.on("connect_error", (err) => {
      socketError.value = err.message;
      socketConnected.value = false;
      _startPolling();
    });

    // ── New message ──────────────────────────────────────────────
    s.on("new_message", ({ roomId, message }) => {
      injectSocketMessage(roomId, message);
    });

    // ── Message edited ───────────────────────────────────────────
    s.on("message_updated", ({ roomId, message }) => {
      if (!messagesByRoom.value[roomId]) return;
      const msgId = message._id || message.id;
      const idx = messagesByRoom.value[roomId].findIndex(
        (m) => (m._id || m.id) === msgId
      );
      if (idx !== -1) {
        messagesByRoom.value[roomId][idx] = {
          ...messagesByRoom.value[roomId][idx],
          ...message,
        };
      }
    });

    // ── Message deleted ──────────────────────────────────────────
    s.on("message_deleted", ({ roomId, messageId }) => {
      if (!messagesByRoom.value[roomId]) return;
      const idx = messagesByRoom.value[roomId].findIndex(
        (m) => (m._id || m.id) === messageId
      );
      if (idx !== -1) {
        messagesByRoom.value[roomId][idx] = {
          ...messagesByRoom.value[roomId][idx],
          isDeleted: true,
          content: "",
        };
      }
    });

    // ── Typing start ─────────────────────────────────────────────
    s.on("typing_start", ({ roomId, userId, firstName, avatar }) => {
      typingByRoom.value = {
        ...typingByRoom.value,
        [roomId]: { userId, firstName, avatar },
      };
    });

    // ── Typing stop ──────────────────────────────────────────────
    s.on("typing_stop", ({ roomId }) => {
      typingByRoom.value = {
        ...typingByRoom.value,
        [roomId]: null,
      };
    });

    // ── chat:read:ack — receiver read the room; update tick icons ──
    // Fires for the SENDER (the other party), so our sent messages go blue
    s.on("chat:read:ack", ({ roomId, readAt }) => {
      if (!messagesByRoom.value[roomId]) return;
      const ts = readAt || new Date().toISOString();
      messagesByRoom.value = {
        ...messagesByRoom.value,
        [roomId]: messagesByRoom.value[roomId].map((m) =>
          m.senderId === currentUserId ? { ...m, deliveryStatus: "read", readAt: ts } : m
        ),
      };
    });

    // ── chat:unread:update — reset unread badge ──────────────────
    // Fires for BOTH parties after a PUT /read; unreadCount will be 0
    s.on("chat:unread:update", ({ roomId, unreadCount }) => {
      const roomIdx = rooms.value.findIndex((r) => r.roomId === roomId);
      if (roomIdx !== -1) {
        const updated = [...rooms.value];
        updated[roomIdx] = { ...updated[roomIdx], unreadCount: unreadCount ?? 0 };
        rooms.value = updated;
      }
    });
  }

  function disconnectSocket() {
    _stopPolling();
    socket.value?.disconnect();
    socket.value = null;
    socketConnected.value = false;
  }

  /** Join a specific room on the socket (call after opening a new room) */
  function joinSocketRoom(roomId) {
    if (socket.value?.connected) {
      socket.value.emit("join_room", { roomId });
    }
  }

  /** Emit typing_start — debounce on the caller side */
  function emitTyping(roomId) {
    if (socket.value?.connected) {
      socket.value.emit("typing_start", { roomId });
    }
  }

  /** Emit typing_stop */
  function emitStopTyping(roomId) {
    if (socket.value?.connected) {
      socket.value.emit("typing_stop", { roomId });
    }
  }

  /**
   * Mark all messages in a room as read via REST.
   * Only call on initial room open — NOT on scroll/pagination.
   * Server emits chat:read:ack + chat:unread:update via socket to both parties.
   */
  async function markRoomRead(roomId) {
    try {
      await chatApi.markRoomRead(roomId);
      // Optimistically clear our own unread count immediately
      const roomIdx = rooms.value.findIndex((r) => r.roomId === roomId);
      if (roomIdx !== -1) {
        const updated = [...rooms.value];
        updated[roomIdx] = { ...updated[roomIdx], unreadCount: 0 };
        rooms.value = updated;
      }
    } catch {
      // Non-critical — silently ignore
    }
  }

  // ─── Polling Fallback ──────────────────────────────────────────────────────

  function _startPolling() {
    if (pollInterval || !activeRoomId.value) return;
    pollInterval = setInterval(() => {
      const roomId = activeRoomId.value;
      if (roomId && !messagesLoadingByRoom.value[roomId]) {
        fetchMessages(roomId).catch(() => {});
      }
    }, 5_000); // 5s when socket is down
  }

  /** Call when page regains visibility — fetches both rooms list and active messages */
  async function syncActiveRoom() {
    fetchRooms().catch(() => {});
    if (activeRoomId.value && !messagesLoadingByRoom.value[activeRoomId.value]) {
      fetchMessages(activeRoomId.value).catch(() => {});
    }
  }

  function _stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  // ─── Room management ───────────────────────────────────────────────────────

  function setActiveRoom(roomId) {
    activeRoomId.value = roomId;
    // Clear unread — full array replacement guarantees totalUnread recomputes
    const roomIdx = rooms.value.findIndex((r) => r.roomId === roomId);
    if (roomIdx !== -1) {
      const updated = [...rooms.value];
      updated[roomIdx] = { ...updated[roomIdx], unreadCount: 0 };
      rooms.value = updated;
    }
    joinSocketRoom(roomId);
  }

  function clearActiveRoom() {
    activeRoomId.value = null;
    _stopPolling();
  }

  function resetError() {
    error.value = null;
  }

  function clearChatData() {
    rooms.value = [];
    messagesByRoom.value = {};
    messagesLoadingByRoom.value = {};
    hasMoreByRoom.value = {};
    nextCursorByRoom.value = {};
    activeRoomId.value = null;
    error.value = null;
    disconnectSocket();
  }

  return {
    // State
    rooms,
    roomsLoading,
    messagesByRoom,
    messagesLoadingByRoom,
    hasMoreByRoom,
    nextCursorByRoom,
    activeRoomId,
    actionLoading,
    error,

    // Socket state
    socket,
    socketConnected,
    socketError,
    typingByRoom,

    // Getters
    sortedRooms,
    groupedContacts,
    totalUnread,
    activeRoom,
    activeMessages,
    activeMessagesLoading,
    activeHasMore,
    activeTyping,

    // Helpers
    getRoomTypeIcon,
    getRoomTypeLabel,
    formatRoomTime,
    formatMessageTime,
    formatMessageDate,

    // Actions
    fetchRooms,
    fetchMessages,
    sendMessage,
    injectSocketMessage,
    setActiveRoom,
    clearActiveRoom,
    resetError,
    clearChatData,

    // Socket actions
    connectSocket,
    connectSocketAuto,
    disconnectSocket,
    joinSocketRoom,
    emitTyping,
    emitStopTyping,
    markRoomRead,
    syncActiveRoom,
  };
});