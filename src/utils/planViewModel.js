// src/utils/planViewModel.js

/**
 * Converts a normalized backend plan into a UI-ready view model.
 * This is the ONLY place where pricing/commission logic should be resolved.
 *
 * UI MUST NOT read nested pricing/commission anymore.
 */

export function toPlanViewModel(plan, userType = "guest", billingPeriod = "monthly") {
  const isStudent = userType === "student";
  const isCorporate = userType === "corporate";

  // -----------------------------
  // PRICE RESOLUTION
  // Read flat fields set by normalizeRawPlan (plan.pricing no longer exists)
  // -----------------------------
  let activePrice = 0;

  if (isStudent) {
    activePrice =
      billingPeriod === "monthly"
        ? (plan.studentMonthlyNGN ?? plan.monthlyNGN ?? 0)
        : (plan.studentYearlyNGN  ?? plan.yearlyNGN  ?? 0);
  } else {
    // both corporate and non-student use standard pricing
    activePrice =
      billingPeriod === "monthly"
        ? (plan.monthlyNGN ?? 0)
        : (plan.yearlyNGN  ?? 0);
  }

  // -----------------------------
  // COMMISSION RESOLUTION
  // plan.commission is gone after normalization — read flat fields
  // -----------------------------
  const activeCommission = isStudent
    ? (plan.studentCommissionRate ?? plan.commissionRate ?? 0)
    : (plan.commissionRate ?? 0);

  // -----------------------------
  // CBC RESOLUTION
  // plan.cbc is gone after normalization — read flat fields
  // -----------------------------
  const activeCbc         = plan.monthlyCbc   ?? 0;
  const activeCbcDiscount = plan.cbcDiscount  ?? 0;

  return {
    // original
    ...plan,

    // resolved UI values
    activePrice,
    activeCommission,
    activeCbc,
    activeCbcDiscount,

    // flags
    isStudentView:  isStudent,
    isCorporateView: isCorporate,

    // safe fallback label
    audienceType: isCorporate
      ? "corporate"
      : isStudent
        ? "student"
        : "non-student"
  };
}