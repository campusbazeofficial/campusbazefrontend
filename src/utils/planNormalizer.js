// src/utils/planNormalizer.js

/**
 * NORMALIZES BACKEND PLAN RESPONSE
 * --------------------------------
 * Converts nested API response into frontend-friendly structure
 *
 * Handles:
 * - individual (standard + student)
 * - corporate (standard only)
 * - eligibility
 * - pricing flattening
 */

export function normalizeRawPlan(plan) {
  const isCorporate = plan.planType === "corporate";
  const standardPricing = plan.pricing?.standard || {};
  const studentPricing = plan.pricing?.student || {};

  return {
    // CORE
    tier: plan.tier,
    nameLabel: plan.nameLabel,
    planType: plan.planType,

    // STANDARD PRICING
    monthlyNGN: standardPricing.monthlyNGN ?? 0,
    yearlyNGN: standardPricing.yearlyNGN ?? 0,

    // STUDENT PRICING (0 for corporate)
    studentMonthlyNGN: isCorporate
      ? 0
      : studentPricing.monthlyNGN ?? 0,

    studentYearlyNGN: isCorporate
      ? 0
      : studentPricing.yearlyNGN ?? 0,

    // COMMISSION
    commissionRate: plan.commission?.standard ?? 0,
    studentCommissionRate: isCorporate
      ? 0
      : plan.commission?.student ?? 0,

    // CBC
    monthlyCbc: plan.cbc?.monthly ?? 0,
    cbcDiscount: plan.cbc?.discount ?? 0,
    welcomeBonusCbc: plan.cbc?.welcomeBonus ?? 0,

    // FEATURES + BENEFITS
    features: {
      profileHighlight: plan.features?.profileHighlight ?? false,
      priorityListings: plan.features?.priorityListings ?? false,
      featuredBadge: plan.features?.featuredBadge ?? false,
      interviewTools: plan.features?.interviewTools ?? false,
      dedicatedSupport: plan.features?.dedicatedSupport ?? false,
      contractModule: plan.features?.contractModule ?? false,
      analyticsDashboard: plan.features?.analyticsDashboard ?? false,
      unlimitedJobPosts: plan.features?.unlimitedJobPosts ?? false,
      apiAccess: plan.features?.apiAccess ?? false
    },

    benefits: Array.isArray(plan.benefits)
      ? plan.benefits
      : [],

    // ACCESS CONTROL
    eligible: plan.eligible ?? true,
    ineligibleReason: plan.ineligibleReason ?? null,

    // SAVINGS
    yearlySavingPct: plan.yearlySavingPct ?? 0,

    // FLAGS
    isCorporate,
    isIndividual: !isCorporate,
    isFree:
      (standardPricing.monthlyNGN ?? 0) === 0 &&
      (standardPricing.yearlyNGN ?? 0) === 0,

    isPaid:
      (standardPricing.monthlyNGN ?? 0) > 0 ||
      (standardPricing.yearlyNGN ?? 0) > 0
  };
}


/**
 * Batch normalize all plans from API response
 */
export function normalizePlansResponse(apiResponse) {
  return apiResponse?.data?.plans?.map(normalizeRawPlan) || [];
}