// src/stores/subscriptionStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { subscriptionApi } from "@/api/subscriptionApi";
import { getPlanCatalog } from "@/utils/planAccess";
import { normalizePlansResponse } from "@/utils/planNormalizer";
import { useUserStore } from "./userStore";

export const SUBSCRIPTION_TIERS = {
  FREE: "free", BASIC: "basic", PRO: "pro", ELITE: "elite",
  CORPORATE_FREE: "corporate_free", CORPORATE_PRO: "corporate_pro", CORPORATE_ELITE: "corporate_elite",
};
export const BILLING_PERIODS = { MONTHLY: "monthly", YEARLY: "yearly" };
export const SUBSCRIPTION_STATUS = { ACTIVE: "active", CANCELLED: "cancelled", EXPIRED: "expired", PENDING: "pending" };

export const useSubscriptionStore = defineStore("subscription", () => {
  const plans = ref([]);
  const plansLoading = ref(false);
  const plansLoaded = ref(false);

  const currentTier = ref(SUBSCRIPTION_TIERS.FREE);
  const expiresAt = ref(null);
  const isActive = ref(false);
  const subscription = ref(null);
  const mySubscriptionLoading = ref(false);
  const subscriptionLoaded = ref(false);
  const actionLoading = ref(false);
  const error = ref(null);

  // Admin
  const adminPlans = ref([]);
  const adminPlansLoading = ref(false);
  const adminPlansMeta = ref({ page: 1, limit: 20, total: 0, pages: 1 });
  const selectedPlan = ref(null);
  const selectedPlanLoading = ref(false);
  const planActionLoading = ref(false);

  // ── Getters
  const allPlans = computed(() => plans.value);

  const individualPlans = computed(() =>
    plans.value.filter((p) => {
      if (p.planType) return p.planType === "individual";
      const t = p.tier?.toLowerCase() ?? "";
      return !t.includes("corporate");
    })
  );

  const corporatePlans = computed(() =>
    plans.value.filter((p) => {
      if (p.planType) return p.planType === "corporate";
      const t = p.tier?.toLowerCase() ?? "";
      return t.includes("corporate");
    })
  );

  const freePlan = computed(() => plans.value.find((p) => p.tier?.toLowerCase() === "free") ?? null);
  const corporateFreePlan = computed(() => plans.value.find((p) => p.tier?.toLowerCase() === "corporate_free") ?? null);

  const currentPlanDetails = computed(() => {
    // First try to find in plans array
    if (currentTier.value && plans.value.length) {
      const plan = plans.value.find((p) => p.tier === currentTier.value);
      if (plan) return plan;
    }
    
    // Fallback: build plan details from subscription data
    const sub = subscription.value;
    if (!sub) return freePlan.value;
    
    return {
      tier: sub.currentTier || currentTier.value,
      nameLabel: sub.nameLabel || sub.currentTier,
      planType: sub.planType || (currentTier.value?.includes('corporate') ? 'corporate' : 'individual'),
      pricing: sub.pricing || {},
      commission: sub.commission || {},
      cbc: sub.cbc || {},
      features: sub.features || {},
      benefits: sub.benefits || [],
      monthlyNGN: sub.pricing?.monthlyNGN,
      yearlyNGN: sub.pricing?.yearlyNGN,
    };
  });

  const hasActiveSubscription = computed(() => isActive.value);

  const isExpired = computed(() => {
    if (!expiresAt.value) return false;
    return new Date(expiresAt.value) < new Date();
  });

  const daysUntilExpiry = computed(() => {
    if (!expiresAt.value) return 0;
    return Math.max(0, Math.ceil((new Date(expiresAt.value) - new Date()) / (1000 * 60 * 60 * 24)));
  });

  const isFreeTier = computed(() => {
    const t = currentTier.value?.toLowerCase();
    return !t || t === SUBSCRIPTION_TIERS.FREE || t === SUBSCRIPTION_TIERS.CORPORATE_FREE;
  });

  const isCorporateUser = computed(() => {
    const t = currentTier.value?.toLowerCase() ?? "";
    if (t.startsWith("corporate_")) return true;
    
    try {
      const userStore = useUserStore();
      return userStore.isCorporate;
    } catch {
      return false;
    }
  });

  const isCancelledOrInactive = computed(() => {
    if (subscription.value?.status === SUBSCRIPTION_STATUS.CANCELLED) return true;
    if (!subscription.value && !isFreeTier.value && !isActive.value) return true;
    return false;
  });

  const subscriptionStatus = computed(() => {
    if (isFreeTier.value) return null;
    if (isExpired.value) return SUBSCRIPTION_STATUS.EXPIRED;
    if (isCancelledOrInactive.value) return SUBSCRIPTION_STATUS.CANCELLED;
    if (isActive.value) return SUBSCRIPTION_STATUS.ACTIVE;
    return SUBSCRIPTION_STATUS.PENDING;
  });

  const autoRenewEnabled = computed(() => subscription.value?.autoRenew ?? false);
  const canPostErrands = computed(() => true);
  const canBidOnErrands = computed(() => !!(currentTier.value && currentTier.value !== SUBSCRIPTION_TIERS.FREE));

  const getTierFeatures = computed(() => {
    const plan = currentPlanDetails.value;
    const sub = subscription.value;
    
    return {
      commissionRate: sub?.commission?.rate ?? plan?.commission?.standard ?? plan?.commissionRate ?? null,
      cbcMonthly: sub?.cbc?.monthlyAllocation ?? plan?.cbc?.monthly ?? plan?.monthlyCbc ?? 0,
      cbcDiscount: sub?.cbc?.discount ?? plan?.cbc?.discount ?? plan?.cbcDiscount ?? 0,
      yearlySavingPct: plan?.yearlySavingPct ?? 0,
      features: plan?.features ?? {},
      benefits: Array.isArray(plan?.benefits) ? plan.benefits : [],
    };
  });

  // Admin getters
  const adminIndividualPlans = computed(() => adminPlans.value.filter((p) => p.planType === "individual"));
  const adminCorporatePlans  = computed(() => adminPlans.value.filter((p) => p.planType === "corporate"));
  const activePlans   = computed(() => adminPlans.value.filter((p) => p.isActive));
  const inactivePlans = computed(() => adminPlans.value.filter((p) => !p.isActive));

  // ── Helpers
  function getPlanByTier(tier) {
    return plans.value.find((p) => p.tier === tier) ?? null;
  }

  function getCommissionRate(tier) {
    const plan = getPlanByTier(tier);
    if (plan?.commission?.standard !== undefined) return plan.commission.standard / 100;
    if (plan?.commission?.rate !== undefined) return plan.commission.rate / 100;
    if (plan?.commissionRate !== undefined) return plan.commissionRate / 100;
    const fallback = {
      [SUBSCRIPTION_TIERS.FREE]: 0.10, [SUBSCRIPTION_TIERS.BASIC]: 0.08,
      [SUBSCRIPTION_TIERS.PRO]: 0.07, [SUBSCRIPTION_TIERS.ELITE]: 0.04,
      [SUBSCRIPTION_TIERS.CORPORATE_FREE]: 0.12, [SUBSCRIPTION_TIERS.CORPORATE_PRO]: 0.08,
      [SUBSCRIPTION_TIERS.CORPORATE_ELITE]: 0.10,
    };
    return fallback[tier] ?? 0.15;
  }

  function calculatePrice(tier, billingPeriod, isStudent = false) {
    const plan = getPlanByTier(tier);
    if (!plan) return 0;
    const p = plan.pricing ?? {};
    if (isStudent && (p.studentMonthlyNGN ?? 0) > 0) {
      return billingPeriod === BILLING_PERIODS.MONTHLY ? (p.studentMonthlyNGN ?? 0) : (p.studentYearlyNGN ?? 0);
    }
    return billingPeriod === BILLING_PERIODS.MONTHLY
      ? (p.monthlyNGN ?? plan.monthlyNGN ?? 0)
      : (p.yearlyNGN  ?? plan.yearlyNGN  ?? 0);
  }

  function formatPrice(priceNGN) {
    if (!priceNGN) return "Free";
    return `₦${Number(priceNGN).toLocaleString()}`;
  }

  function getSavingsPercentage(tier) {
    const plan = getPlanByTier(tier);
    if (!plan) return 0;
    if (plan.yearlySavingPct) return plan.yearlySavingPct;
    const p = plan.pricing ?? {};
    const monthly = p.monthlyNGN ?? plan.monthlyNGN ?? 0;
    const yearly  = p.yearlyNGN  ?? plan.yearlyNGN  ?? 0;
    if (!monthly || !yearly) return 0;
    return Math.round((1 - yearly / (monthly * 12)) * 100);
  }

  function getFeaturesForTier(tier) { return getPlanByTier(tier)?.features ?? {}; }
  
  function isPaidSubscription() {
    const t = currentTier.value?.toLowerCase();
    return !!t && t !== "free" && t !== "corporate_free";
  }

  function canPerformAction(action) {
    const tier = currentTier.value;
    return {
      postErrand:        true,
      bidOnErrand:       tier !== SUBSCRIPTION_TIERS.FREE,
      unlimitedErrands:  ![SUBSCRIPTION_TIERS.FREE, SUBSCRIPTION_TIERS.CORPORATE_FREE].includes(tier),
      prioritySupport:   [SUBSCRIPTION_TIERS.ELITE, SUBSCRIPTION_TIERS.CORPORATE_ELITE].includes(tier),
      reducedCommission: tier !== SUBSCRIPTION_TIERS.FREE,
    }[action] ?? true;
  }

  // ── Subscription Actions
  async function fetchPlans(force = false) {
    if (!force && plansLoaded.value && plans.value.length) {
      return { data: { plans: plans.value } };
    }

    plansLoading.value = true;
    error.value = null;

    try {
      const res = await subscriptionApi.getPlans();
      
      // Handle cancelled response
      if (res?.cancelled) {
        return res;
      }
      
      const normalized = normalizePlansResponse(res);
      if (Array.isArray(normalized) && normalized.length > 0) {
        plans.value = normalized;
        plansLoaded.value = true;
      }
      return res;
    } catch (err) {
      if (err?.code === 'ERR_CANCELED' || err?.message === 'Duplicate request cancelled') {
        if (plans.value.length > 0) {
          plansLoaded.value = true;
          return { data: { plans: plans.value } };
        }
        return null;
      }
      error.value = err.response?.data?.message || err.message || "Failed to load plans";
      throw err;
    } finally {
      plansLoading.value = false;
    }
  }

  async function fetchMySubscription() {
    mySubscriptionLoading.value = true;
    error.value = null;
    
    try {
      const res = await subscriptionApi.getMySubscription();
      const data = res?.data ?? {};
      
      currentTier.value  = data.currentTier  || SUBSCRIPTION_TIERS.FREE;
      expiresAt.value    = data.expiresAt    || null;
      isActive.value     = data.isActive     ?? false;
      
      subscription.value = (data.isFree || !data.billingPeriod) ? null : data;
      subscriptionLoaded.value = true;
      
      return res;
    } catch (err) {
      if (err?.code === 'ERR_CANCELED' || err?.message === 'Duplicate request cancelled') {
        return null;
      }
      
      currentTier.value  = SUBSCRIPTION_TIERS.FREE;
      isActive.value     = false;
      subscription.value = null;
      error.value = err.response?.data?.message || err.message || "Failed to load subscription";
      throw err;
    } finally { 
      mySubscriptionLoading.value = false; 
    }
  }

  async function subscribe(data) {
    actionLoading.value = true; error.value = null;
    try {
      const res = await subscriptionApi.subscribe(data);
      const d = res?.data ?? {};
      if (!d.authorizationUrl) { currentTier.value = d.tier; expiresAt.value = d.expiresAt; isActive.value = true; }
      return res;
    } catch (err) { error.value = err.response?.data?.message || err.message || "Failed to subscribe"; throw err; }
    finally { actionLoading.value = false; }
  }

  async function upgrade(data) {
    actionLoading.value = true; error.value = null;
    try {
      const res = await subscriptionApi.upgrade(data);
      const d = res?.data ?? {};
      if (!d.authorizationUrl) { currentTier.value = d.tier; expiresAt.value = d.expiresAt; }
      return res;
    } catch (err) { error.value = err.response?.data?.message || err.message || "Failed to upgrade"; throw err; }
    finally { actionLoading.value = false; }
  }

  async function toggleAutoRenew() {
    actionLoading.value = true; error.value = null;
    try {
      const res = await subscriptionApi.toggleAutoRenew();
      if (subscription.value) subscription.value.autoRenew = res?.data?.autoRenew ?? !subscription.value.autoRenew;
      return res;
    } catch (err) { error.value = err.response?.data?.message || err.message || "Failed"; throw err; }
    finally { actionLoading.value = false; }
  }

  async function cancelSubscription(payload = {}) {
    actionLoading.value = true; error.value = null;
    try {
      const res = await subscriptionApi.cancel(payload);
      if (subscription.value) { subscription.value.status = SUBSCRIPTION_STATUS.CANCELLED; subscription.value.autoRenew = false; }
      await fetchMySubscription();
      return res;
    } catch (err) { error.value = err.response?.data?.message || err.message || "Failed to cancel"; throw err; }
    finally { actionLoading.value = false; }
  }

  function getPlansForCurrentUser(user) {
    const normalized = normalizePlansResponse({ data: { plans: plans.value } });
    return getPlanCatalog(normalized, user);  
  }

  // ── Admin Actions
  async function fetchAdminPlans(params = {}) {
    adminPlansLoading.value = true; error.value = null;
    try {
      const res = await subscriptionApi.listPlans(params);
      adminPlans.value = Array.isArray(res?.data) ? res.data : [];
      if (res?.meta) adminPlansMeta.value = res.meta;
      return res;
    } catch (err) { error.value = err.response?.data?.message || err.message || "Failed"; throw err; }
    finally { adminPlansLoading.value = false; }
  }

  async function fetchPlanById(id) {
    selectedPlanLoading.value = true; error.value = null;
    try { const res = await subscriptionApi.getPlanById(id); selectedPlan.value = res?.data ?? res ?? null; return res; }
    catch (err) { error.value = err.response?.data?.message || err.message || "Failed"; throw err; }
    finally { selectedPlanLoading.value = false; }
  }

  async function createPlan(data) {
    planActionLoading.value = true; error.value = null;
    try {
      const res = await subscriptionApi.createPlan(data);
      const np = res?.data ?? res;
      if (np?._id) { adminPlans.value.unshift(np); adminPlansMeta.value.total += 1; }
      return res;
    } catch (err) { error.value = err.response?.data?.message || err.message || "Failed"; throw err; }
    finally { planActionLoading.value = false; }
  }

  async function updatePlan(id, data) {
    planActionLoading.value = true; error.value = null;
    try {
      const res = await subscriptionApi.updatePlan(id, data);
      const u = res?.data ?? res;
      const i = adminPlans.value.findIndex((p) => p._id === id);
      if (i !== -1 && u?._id) adminPlans.value[i] = { ...adminPlans.value[i], ...u };
      if (selectedPlan.value?._id === id) selectedPlan.value = { ...selectedPlan.value, ...u };
      return res;
    } catch (err) { error.value = err.response?.data?.message || err.message || "Failed"; throw err; }
    finally { planActionLoading.value = false; }
  }

  async function togglePlanStatus(id) {
    planActionLoading.value = true; error.value = null;
    try {
      const res = await subscriptionApi.togglePlan(id);
      const d = res?.data ?? {};
      const i = adminPlans.value.findIndex((p) => p._id === id);
      if (i !== -1 && d.isActive !== undefined) adminPlans.value[i] = { ...adminPlans.value[i], isActive: d.isActive };
      if (selectedPlan.value?._id === id && d.isActive !== undefined) selectedPlan.value = { ...selectedPlan.value, isActive: d.isActive };
      return res;
    } catch (err) { error.value = err.response?.data?.message || err.message || "Failed"; throw err; }
    finally { planActionLoading.value = false; }
  }

  async function deletePlan(id) {
    planActionLoading.value = true; error.value = null;
    try {
      const res = await subscriptionApi.deletePlan(id);
      adminPlans.value = adminPlans.value.filter((p) => p._id !== id);
      adminPlansMeta.value.total = Math.max(0, adminPlansMeta.value.total - 1);
      if (selectedPlan.value?._id === id) selectedPlan.value = null;
      return res;
    } catch (err) { error.value = err.response?.data?.message || err.message || "Failed"; throw err; }
    finally { planActionLoading.value = false; }
  }

  function resetError() { error.value = null; }
  
  function clearSubscriptionData() {
    currentTier.value = SUBSCRIPTION_TIERS.FREE; expiresAt.value = null; isActive.value = false;
    subscription.value = null; error.value = null; plansLoaded.value = false; subscriptionLoaded.value = false;
  }
  
  function clearAdminPlanData() {
    adminPlans.value = []; adminPlansMeta.value = { page: 1, limit: 20, total: 0, pages: 1 };
    selectedPlan.value = null; error.value = null;
  }
  
  async function refreshSubscriptionData() {
    plansLoaded.value = false; subscriptionLoaded.value = false;
    await Promise.all([fetchPlans(), fetchMySubscription().catch(() => {})]);
  }
  
  async function initialize() {
    if (!subscriptionLoaded.value) await fetchMySubscription().catch(() => {});
    if (!plansLoaded.value)        await fetchPlans().catch(() => {});
  }

  return {
    // State
    plans, plansLoading, plansLoaded, currentTier, expiresAt, isActive, subscription,
    mySubscriptionLoading, subscriptionLoaded, actionLoading, error,
    adminPlans, adminPlansLoading, adminPlansMeta, selectedPlan, selectedPlanLoading, planActionLoading,
    
    // Getters
    allPlans, individualPlans, corporatePlans, freePlan, corporateFreePlan,
    currentPlanDetails, hasActiveSubscription, isExpired, daysUntilExpiry,
    isFreeTier, isCorporateUser, isCancelledOrInactive, subscriptionStatus,
    autoRenewEnabled, canPostErrands, canBidOnErrands, getTierFeatures,
    adminIndividualPlans, adminCorporatePlans, activePlans, inactivePlans,
    
    // Helpers
    getPlanByTier, calculatePrice, formatPrice, getSavingsPercentage,
    getCommissionRate, canPerformAction, getFeaturesForTier, isPaidSubscription,
    
    // Actions
    fetchPlans, fetchMySubscription, subscribe, upgrade, toggleAutoRenew, cancelSubscription,
    getPlansForCurrentUser,
    fetchAdminPlans, fetchPlanById, createPlan, updatePlan, togglePlanStatus, deletePlan,
    resetError, clearSubscriptionData, clearAdminPlanData, refreshSubscriptionData, initialize,
  };
});