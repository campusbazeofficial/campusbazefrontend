// src/stores/notificationStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  notificationApi,
  notificationApiWithRetry,
} from "@/api/notificationApi";
import { useAuthStore } from "./authStore";

export const useNotificationStore = defineStore("notification", () => {
  // State
  const notifications = ref([]);
  const unreadCount = ref(0);
  const meta = ref(null);
  const loading = ref(false);
  const actionLoading = ref(false);
  const error = ref(null);
  let fetchingUnreadCount = false

  let pollInterval = null;
  let isPollingEnabled = ref(false);

  // Getters
  const hasUnread = computed(() => unreadCount.value > 0);
  const unreadNotifications = computed(() =>
    notifications.value.filter((n) => !n.isRead),
  );
  const readNotifications = computed(() =>
    notifications.value.filter((n) => n.isRead),
  );
  const latestNotifications = computed(() => notifications.value.slice(0, 5));

  // Group by date
  const groupedByDate = computed(() => {
    const groups = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    notifications.value.forEach((notification) => {
      const date = new Date(notification.createdAt);
      const dateString = date.toDateString();

      let groupKey;
      if (dateString === today) groupKey = "Today";
      else if (dateString === yesterday) groupKey = "Yesterday";
      else
        groupKey = date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(notification);
    });

    return groups;
  });

  // Get notification icon based on type
  function getNotificationIcon(type) {
    const icons = {
      errand_update: { icon: "fa-solid fa-box", class: "info" },
      new_bid: { icon: "fa-solid fa-gavel", class: "success" },
      cbc_credit: { icon: "fa-solid fa-coins", class: "warning" },
      payment: { icon: "fa-solid fa-credit-card", class: "success" },
      message: { icon: "fa-solid fa-message", class: "info" },
      review: { icon: "fa-solid fa-star", class: "warning" },
      system: { icon: "fa-solid fa-circle-info", class: "info" },
      dispute: { icon: "fa-solid fa-scale-balanced", class: "warning" },
      verification: { icon: "fa-solid fa-badge-check", class: "success" },
    };
    return icons[type] || { icon: "fa-solid fa-bell", class: "info" };
  }

  // Format time ago
  function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  // Actions
  async function fetchNotifications(params = {}) {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) return;

    loading.value = true;
    error.value = null;

    try {
      const response = await notificationApiWithRetry.getNotifications({
        page: 1,
        limit: 20,
        ...params,
      });

      notifications.value = response.data || [];
      unreadCount.value = response.unreadCount || 0;
      meta.value = response.meta || null;

      return response;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to fetch notifications";
      // console.error("Failed to fetch notifications:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchUnreadCount() {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) return
  if (fetchingUnreadCount) return // skip if already in progress

  fetchingUnreadCount = true
  try {
    const count = await notificationApi.getUnreadCount()
    unreadCount.value = count
    return count
  } catch (err) {
    // console.error("Failed to fetch unread count:", err)
  } finally {
    fetchingUnreadCount = false
  }
}

  async function resolveNotification(notification) {
    // Optimistically mark as read in local state so UI feels instant
    const index = notifications.value.findIndex(n => n._id === notification._id)
    if (index !== -1 && !notifications.value[index].isRead) {
      notifications.value[index].isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }

    try {
      const response = await notificationApi.resolveNotification(
        notification.type,
        notification._id,
      )
      // Backend returns { notification: {...} }
      const enriched = response.notification
      if (enriched && index !== -1) {
        notifications.value[index] = { ...notifications.value[index], ...enriched }
      }
      return response
    } catch (err) {
      // Roll back optimistic update on failure
      if (index !== -1) {
        notifications.value[index].isRead = false
        unreadCount.value++
      }
      error.value = err.response?.data?.message || 'Failed to open notification'
      throw err
    }
  }

  async function markAsRead(notificationId) {
    const notification = notifications.value.find(
      (n) => n._id === notificationId,
    );
    if (notification?.isRead) return;

    try {
      await notificationApi.markAsRead(notificationId);

      // Update local state
      const index = notifications.value.findIndex(
        (n) => n._id === notificationId,
      );
      if (index !== -1) {
        notifications.value[index].isRead = true;
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to mark as read";
      // console.error("Failed to mark notification as read:", err);
    }
  }

  async function markAllAsRead() {
    if (unreadCount.value === 0) return;

    actionLoading.value = true;
    error.value = null;

    try {
      await notificationApiWithRetry.markAllAsRead();

      // Update local state
      notifications.value.forEach((n) => {
        n.isRead = true;
      });
      unreadCount.value = 0;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to mark all as read";
      // console.error("Failed to mark all as read:", err);
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  async function deleteNotification(notificationId) {
    actionLoading.value = true;
    error.value = null;

    try {
      await notificationApi.deleteNotification(notificationId);

      // Remove from local state
      const index = notifications.value.findIndex(
        (n) => n._id === notificationId,
      );
      if (index !== -1) {
        const wasUnread = !notifications.value[index].isRead;
        notifications.value.splice(index, 1);
        if (wasUnread) {
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
      }
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to delete notification";
      // console.error("Failed to delete notification:", err);
      throw err;
    } finally {
      actionLoading.value = false;
    }
  }

  function startPolling(intervalMs = 30000) {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) return;

    stopPolling();
    isPollingEnabled.value = true;

    pollInterval = setInterval(async () => {
      if (isPollingEnabled.value) {
        await fetchUnreadCount();
      }
    }, intervalMs);
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    isPollingEnabled.value = false;
  }

  function addRealtimeNotification(notification) {
    notifications.value.unshift(notification);
    if (!notification.isRead) {
      unreadCount.value++;
    }
  }

  function clearNotifications() {
    notifications.value = [];
    unreadCount.value = 0;
    meta.value = null;
    error.value = null;
    stopPolling();
  }

  return {
    // State
    notifications,
    unreadCount,
    meta,
    loading,
    actionLoading,
    error,

    // Getters
    hasUnread,
    unreadNotifications,
    readNotifications,
    latestNotifications,
    groupedByDate,

    // Helpers
    getNotificationIcon,
    formatTimeAgo,

    // Actions
    fetchNotifications,
    fetchUnreadCount,
    resolveNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    startPolling,
    stopPolling,
    addRealtimeNotification,
    clearNotifications,
  };
});