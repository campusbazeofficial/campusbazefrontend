import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { userApi } from "@/api/userApi";
import { authApi } from "@/api/authApi";

export const useUserStore = defineStore("user", () => {
  // ── State ─────────────────────────────────────────────────
  const profile = ref(null);
  const publicProfile = ref(null); // public user profile (ServiceProviderProfile page)
  const dashboard = ref(null);
  const sessions = ref([]);
  const loading = ref(false);
  const profileLoading = ref(false); // dedicated loader for public profile fetches
  const dashLoading = ref(false);
  const error = ref(null);
  const initialized = ref(false);

  // ➕ NEW: Referral state
  const referralInfo = ref(null);
  const referralLoading = ref(false);

  // ── Getters ───────────────────────────────────────────────
  const user = computed(() => profile.value?.user || null);
  const company = computed(() => profile.value?.company || null);
  const isCorporate = computed(() => user.value?.role === "corporate");
  const fullName = computed(() => {
    if (!user.value) return "";
    return (
      user.value.displayName ||
      `${user.value.firstName ?? ""} ${user.value.lastName ?? ""}`.trim() ||
      ""
    );
  });
  const initials = computed(() => {
    const name = fullName.value;
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  });
  const avatarUrl = computed(() => user.value?.avatar?.url || null);
  const isVerified = computed(() => user.value?.isEmailVerified || false);
  const tier = computed(() => user.value?.subscriptionTier || "free");
  const userRole = computed(() => user.value?.role || null);
  const isEmailVerified = computed(() => user.value?.isEmailVerified || false);
  const userFullName = computed(() => fullName.value);

  // ➕ NEW: Referral getters
  const referralCode = computed(() => referralInfo.value?.referralCode || null);
  const referralLink = computed(() => {
  const code = referralInfo.value?.referralCode;
  if (!code) return null;
  return `${window.location.origin}/auth/register?ref=${code}`;
});
  const referralQrCode = computed(() => referralInfo.value?.qrCode || null);

  // ── Actions ───────────────────────────────────────────────

  async function setInitialUser(userData) {
    if (!profile.value) {
      profile.value = { user: userData, company: userData.company || null };
    } else {
      profile.value.user = { ...profile.value.user, ...userData };
      if (userData.company) {
        profile.value.company = userData.company;
      }
    }
    localStorage.setItem("user", JSON.stringify(userData));
    initialized.value = true;
  }
  async function generateBio() {
    try {
      const res = await userApi.generateBio();
      return res.data;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to generate bio";
      throw err;
    }
  }
  async function fetchMe() {
    loading.value = true;
    error.value = null;
    try {
      const res = await userApi.getMe();
      profile.value = res.data;
      if (profile.value?.user) {
        localStorage.setItem("user", JSON.stringify(profile.value.user));
      }
      initialized.value = true;
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load profile";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateMe(data) {
    loading.value = true;
    error.value = null;
    try {
      const res = await userApi.updateMe(data);
      if (profile.value?.user) {
        profile.value.user = { ...profile.value.user, ...res.data?.user };
        localStorage.setItem("user", JSON.stringify(profile.value.user));
      }
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to update profile";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateCorporateMe(data) {
    loading.value = true;
    error.value = null;
    try {
      const res = await userApi.updateCorporateMe(data);
      if (profile.value?.user) {
        profile.value.user = { ...profile.value.user, ...res.data?.user };
        localStorage.setItem("user", JSON.stringify(profile.value.user));
      }
      if (profile.value?.company) {
        profile.value.company = {
          ...profile.value.company,
          ...res.data?.company,
        };
      }
      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to update corporate profile";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchDashboard() {
    dashLoading.value = true;
    error.value = null;
    try {
      const res = await userApi.getDashboard();
      dashboard.value = res.data;
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load dashboard";
      throw err;
    } finally {
      dashLoading.value = false;
    }
  }

  async function uploadAvatar(file) {
    loading.value = true;
    error.value = null;
    try {
      const res = await userApi.uploadAvatar(file);
      const avatarUrl = res.data?.avatarUrl || res.avatarUrl;
      if (avatarUrl && profile.value?.user) {
        profile.value.user.avatar = { url: avatarUrl };
        localStorage.setItem("user", JSON.stringify(profile.value.user));
      }
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to upload avatar";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteAvatar() {
    loading.value = true;
    error.value = null;
    try {
      const res = await userApi.deleteAvatar();
      if (profile.value?.user) {
        profile.value.user.avatar = null;
        localStorage.setItem("user", JSON.stringify(profile.value.user));
      }
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to delete avatar";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function uploadCompanyLogo(file) {
    loading.value = true;
    error.value = null;
    try {
      const res = await userApi.uploadCompanyLogo(file);
      if (profile.value?.company) {
        profile.value.company.logo = res.data?.logo;
      }
      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to upload company logo";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchSessions() {
    loading.value = true;
    error.value = null;
    try {
      const res = await userApi.getSessions();
      sessions.value = res.data?.sessions || res.data || [];
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load sessions";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Revoke a specific session by ID (logout another device).
  // Optimistically removes the session from local state on success.
  async function revokeSession(sessionId) {
    loading.value = true;
    error.value = null;
    try {
      const res = await authApi.revokeSession(sessionId);
      sessions.value = sessions.value.filter((s) => s._id !== sessionId);
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to revoke session";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Permanently delete the account. confirmationText must be exactly:
  // sudo-delete-{firstName} {lastName}
  // Blocked by the API if the user has active errands or orders.
  async function deleteAccount({ confirmationText }) {
    loading.value = true;
    error.value = null;
    try {
      const res = await userApi.deleteAccount(confirmationText);
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to delete account";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchUserProfile(slug) {
    profileLoading.value = true;
    error.value = null;
    publicProfile.value = null;

    try {
      const res = await userApi.getUserProfile(slug);

      const data = res.data?.data || res.data;

      publicProfile.value = data?.user || null;

      return res;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to load user profile";
      throw err;
    } finally {
      profileLoading.value = false;
    }
  }
  
  async function searchUsers(params = {}) {
    try {
      return await userApi.searchUsers(params);
    } catch (err) {
      error.value = err.response?.data?.message || "Search failed";
      throw err;
    }
  }

  // ➕ NEW: Fetch referral info from API
  async function fetchReferralInfo() {
    referralLoading.value = true;
    error.value = null;
    try {
      const res = await userApi.getReferralInfo();
      referralInfo.value = res.data;
      return res;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to load referral info";
      throw err;
    } finally {
      referralLoading.value = false;
    }
  }

  function clearUser() {
    profile.value = null;
    dashboard.value = null;
    sessions.value = [];
    error.value = null;
    initialized.value = false;
    referralInfo.value = null; // ➕ NEW: clear referral info on logout
    localStorage.removeItem("user");
  }

  function initializeFromStorage() {
    const storedUser = localStorage.getItem("user");
    if (storedUser && !profile.value) {
      try {
        const userData = JSON.parse(storedUser);
        profile.value = { user: userData, company: userData.company || null };
        initialized.value = true;
      } catch (e) {
        // console.error("Failed to parse stored user:", e);
        localStorage.removeItem("user");
      }
    }
  }

  initializeFromStorage();

  return {
    profile,
    publicProfile,
    dashboard,
    sessions,
    loading,
    profileLoading,
    dashLoading,
    error,
    initialized,
    user,
    company,
    isCorporate,
    fullName,
    initials,
    avatarUrl,
    isVerified,
    tier,
    userRole,
    isEmailVerified,
    userFullName,
    setInitialUser,
    fetchMe,
    updateMe,
    updateCorporateMe,
    fetchDashboard,
    uploadAvatar,
    deleteAvatar,
    uploadCompanyLogo,
    fetchSessions,
    revokeSession,
    deleteAccount,
    searchUsers,
    fetchUserProfile,
    generateBio,
    clearUser,
    initializeFromStorage,
    // ➕ NEW: Referral exports
    referralInfo,
    referralLoading,
    referralCode,
    referralLink,
    referralQrCode,
    fetchReferralInfo,
  };
});