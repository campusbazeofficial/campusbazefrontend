<template>
  <router-view v-if="appReady" />

  <div v-else class="loading-app">
    <div class="spinner"></div>
    <p>Loading...</p>
  </div>

  <ToastContainer />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { cancelAllRequests, sessionManager } from "@/api/api";
import ToastContainer from "@/components/reusables/ToastContainer.vue";

const appReady = ref(false);
const authStore = useAuthStore();
const userStore = useUserStore();

let removeSessionListener = null;

onMounted(async () => {
  try {
    await authStore.initialize();

    if (authStore.isAuthenticated && !userStore.initialized) {
      try {
        await userStore.fetchMe();
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        authStore.clearAuth();
      }
    }

    // ── Start proactive silent refresh cycle ──────────────
    // Fires 3 minutes before each 15-min access token expires.
    // Reschedules itself automatically on every successful refresh.
    // User will never see a session expiry unless their refresh token
    // itself expires (30 days of inactivity) or is revoked server-side.
    if (authStore.isAuthenticated && authStore.accessToken) {
      sessionManager.scheduleProactiveRefresh(authStore.accessToken);
    }

    // Only listen for the 'expired' event — fired when both proactive
    // refresh and the reactive interceptor have both failed.
    removeSessionListener = sessionManager.addEventListener((event) => {
      if (event === "expired") {
        authStore.logout();
      }
    });

  } catch (error) {
    console.error("App initialization failed:", error);
  } finally {
    appReady.value = true;
    requestAnimationFrame(() => {
      document.documentElement.classList.remove("no-transitions");
    });
  }
});

onBeforeUnmount(() => {
  cancelAllRequests();
  authStore.cleanup();
  sessionManager.reset();
  if (removeSessionListener) removeSessionListener();
});
</script>

<style scoped>
.loading-app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: system-ui, -apple-system, sans-serif;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>