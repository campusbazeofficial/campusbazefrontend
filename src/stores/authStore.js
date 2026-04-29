// src/stores/authStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authApi } from "@/api/authApi";
import { useUserStore } from "./userStore";
import { socketService } from "@/services/socket";
import { initRealtime, teardownRealtime } from "@/services/realtimeSync";

export const useAuthStore = defineStore("auth", () => {
  // State
  const accessToken = ref(localStorage.getItem("accessToken") || null);
  const refreshToken = ref(localStorage.getItem("refreshToken") || null);
  const loading = ref(false);
  const error = ref(null);

  // Flag to prevent the storage listener from reacting to our own
  // clearAuth() calls — avoids the clearAuth → auth:logout → clearAuth loop
  let isLoggingOut = false;

  let cleanupListeners = null;
  let loginPromise = null;

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value);
  const userRole = computed(() => {
    const userStore = useUserStore();
    return userStore.user?.role || null;
  });

  // Actions
  function setTokens(access, refresh) {
    accessToken.value = access;
    refreshToken.value = refresh;
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
  }

  // Connect socket and wire real-time store bindings — fire and forget.
  // Deliberately NOT awaited so it never blocks login/initialize.
  function _bindSocket(token) {
    socketService.connect(token);
    // initRealtime wires Pinia stores to socket events.
    // If socket is already connected (e.g. page reload), run immediately.
    // Otherwise wait for the connect event — the unsub cleans itself up.
    if (socketService.isConnected) {
      initRealtime();
    } else {
      const unsub = socketService.onConnectionChange((connected) => {
        if (connected) { initRealtime(); unsub(); }
      });
    }
  }

  async function validateReferralCode(code) {
    try {
      const response = await authApi.validateReferralCode(code);
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || "Invalid referral code";
      throw err;
    }
  }

  // Clears auth state and storage.
  // Does NOT dispatch any events — callers decide what happens next.
  function clearAuth() {
    isLoggingOut = true;

    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("theme-preference");
    localStorage.removeItem("sidebar-accordion-state");

    const userStore = useUserStore();
    userStore.clearUser();

    teardownRealtime();
    socketService.disconnect();

    isLoggingOut = false;
  }

  function setupStorageListeners() {
    // Handles token changes from OTHER tabs only.
    // Our own setTokens/clearAuth calls are guarded by isLoggingOut.
    const handleStorageChange = (e) => {
      if (isLoggingOut) return;

      if (e.key === "accessToken") {
        if (!e.newValue) {
          // Another tab logged out — clear and redirect
          clearAuth();
          if (!window.location.pathname.startsWith("/auth")) {
            window.location.href = "/auth/login";
          }
        } else {
          accessToken.value = e.newValue;
        }
      } else if (e.key === "refreshToken") {
        if (!isLoggingOut) refreshToken.value = e.newValue;
      }
    };

    // Handles forced logouts fired from api.js (token refresh failure)
    // NOT fired by clearAuth() anymore — breaks the loop
    const handleForcedLogout = () => {
      if (isLoggingOut) return;
      clearAuth();
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/login";
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth:logout", handleForcedLogout);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth:logout", handleForcedLogout);
    };
  }

  async function registerIndividual(userData) {
    loading.value = true;
    error.value = null;
    try {
      const response = await authApi.registerIndividual(userData);
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || "Registration failed";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function registerCorporate(userData) {
    loading.value = true;
    error.value = null;
    try {
      const response = await authApi.registerCorporate(userData);
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || "Registration failed";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function verifyEmail(email, otp) {
    loading.value = true;
    error.value = null;
    try {
      const response = await authApi.verifyEmail(email, otp);
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || "Verification failed";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function resendOtp(email) {
    loading.value = true;
    error.value = null;
    try {
      const response = await authApi.resendOtp(email);
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to resend code";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function login(credentials) {
    if (loginPromise) return loginPromise;

    loginPromise = (async () => {
      loading.value = true;
      error.value = null;
      try {
        const response = await authApi.login(credentials);
        const { user: userData, tokens } = response.data || response;

        if (tokens) {
          setTokens(tokens.accessToken, tokens.refreshToken);
          _bindSocket(tokens.accessToken);
        }

        if (userData) {
          const userStore = useUserStore();
          await userStore.setInitialUser(userData);
          try {
            await userStore.fetchMe();
          } catch {}
        }

        return response;
      } catch (err) {
        error.value = err.response?.data?.message || "Login failed";
        throw err;
      } finally {
        loading.value = false;
        loginPromise = null;
      }
    })();

    return loginPromise;
  }

  async function adminLogin(credentials) {
    loading.value = true;
    error.value = null;
    try {
      const response = await authApi.adminLogin(credentials);
      const { user: userData, tokens } = response.data || response;

      if (tokens) {
        setTokens(tokens.accessToken, tokens.refreshToken);
        _bindSocket(tokens.accessToken);
      }

      if (userData) {
        const userStore = useUserStore();
        await userStore.setInitialUser(userData);
        try {
          await userStore.fetchMe();
        } catch {}
      }

      return response;
    } catch (err) {
      error.value = err.response?.data?.message || "Admin login failed";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Intentional logout — clears auth then hard-redirects to login.
  // Using window.location.href is intentional: it guarantees navigation
  // regardless of router guards, socket callbacks, or reactive side-effects.
  async function logout() {
    loading.value = true;
    error.value = null;
    try {
      if (refreshToken.value) {
        await authApi.logout(refreshToken.value);
      }
    } catch {}
    finally {
      clearAuth();
      loading.value = false;
      window.location.href = "/auth/login";
    }
  }

  // Logout all sessions across every device, then redirect.
  async function logoutAll() {
    loading.value = true;
    error.value = null;
    try {
      await authApi.logoutAll();
    } catch {}
    finally {
      clearAuth();
      loading.value = false;
      window.location.href = "/auth/login";
    }
  }

  async function forgotPassword(email) {
    loading.value = true;
    error.value = null;
    try {
      const response = await authApi.forgotPassword(email);
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to send reset link";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function resetPassword(token, newPassword) {
    loading.value = true;
    error.value = null;
    try {
      const response = await authApi.resetPassword(token, newPassword);
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || "Password reset failed";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function initialize() {
    if (cleanupListeners) cleanupListeners();
    cleanupListeners = setupStorageListeners();

    if (isAuthenticated.value) {
      // Reconnect socket with stored token
      _bindSocket(accessToken.value);

      const userStore = useUserStore();

      const storedUser = localStorage.getItem("user");
      if (storedUser && !userStore.user) {
        try {
          await userStore.setInitialUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("user");
        }
      }

      if (!userStore.user) {
        try {
          await userStore.fetchMe();
        } catch {
          clearAuth();
        }
      }
    }
  }

  function cleanup() {
    if (cleanupListeners) {
      cleanupListeners();
      cleanupListeners = null;
    }
  }

  return {
    accessToken,
    refreshToken,
    loading,
    error,
    isAuthenticated,
    userRole,
    registerIndividual,
    registerCorporate,
    verifyEmail,
    resendOtp,
    login,
    adminLogin,
    logout,
    logoutAll,
    forgotPassword,
    resetPassword,
    clearAuth,
    validateReferralCode,
    initialize,
    cleanup,
  };
});