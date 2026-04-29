// src/utils/planAccess.js

/**
 * USER TYPES:
 * - guest (unauthenticated)
 * - individual student
 * - individual non-student
 * - corporate
 * - admin
 */

/* -----------------------------------
 * HELPERS
 * --------------------------------- */
export function getUserType(user = null) {
  if (!user) return "guest";

  const role = (user.role || '').toLowerCase();
  
  if (role === "admin") return "admin";
  if (role === "corporate") return "corporate";
  
  // Handle individual users with various role names
  if (role === "individual" || role === "student" || role === "professional") {
    const isStudent = role === "student" || user.isStudent === true;
    return isStudent ? "student" : "non-student";
  }

  return "guest";
}


/* -----------------------------------
 * PLAN DISPLAY NORMALIZER
 * Adds user-context pricing
 * --------------------------------- */

export function resolvePlanForUser(plan, userType) {
  switch (userType) {
    case "student":
      return {
        ...plan,
        audienceType: "student",
        activeMonthlyPrice: plan.studentMonthlyNGN,
        activeYearlyPrice: plan.studentYearlyNGN,
        activeCommission: plan.studentCommissionRate
      };

    case "non-student":
      return {
        ...plan,
        audienceType: "non-student",
        activeMonthlyPrice: plan.monthlyNGN,
        activeYearlyPrice: plan.yearlyNGN,
        activeCommission: plan.commissionRate
      };

    case "corporate":
      return {
        ...plan,
        audienceType: "corporate",
        activeMonthlyPrice: plan.monthlyNGN,
        activeYearlyPrice: plan.yearlyNGN,
        activeCommission: plan.commissionRate
      };

    case "admin":
      return {
        ...plan,
        audienceType: "admin"
      };

    default:
      return plan;
  }
}


/* -----------------------------------
 * AUTHENTICATED USER PLANS
 * --------------------------------- */

export function getAuthenticatedPlans(plans = [], user = null) {
  const userType = getUserType(user);

  if (userType === "admin") {
    return plans.map(plan => resolvePlanForUser(plan, userType));
  }

  if (userType === "corporate") {
    return plans
      .filter(plan => plan.planType === "corporate")
      .map(plan => resolvePlanForUser(plan, userType));
  }

  // This now catches both "student" and "non-student"
  if (userType === "student" || userType === "non-student") {
    return plans
      .filter(plan => plan.planType === "individual")
      .map(plan => resolvePlanForUser(plan, userType));
  }

  return [];
}


/* -----------------------------------
 * PUBLIC / GUEST PLANS
 * Show all plans categorized
 * --------------------------------- */

export function getPublicPlans(plans = []) {
  return {
    individual: {
      student: plans
        .filter(plan => plan.planType === "individual")
        .map(plan =>
          resolvePlanForUser(plan, "student")
        ),

      nonStudent: plans
        .filter(plan => plan.planType === "individual")
        .map(plan =>
          resolvePlanForUser(plan, "non-student")
        )
    },

    corporate: plans
      .filter(plan => plan.planType === "corporate")
      .map(plan =>
        resolvePlanForUser(plan, "corporate")
      )
  };
}


/* -----------------------------------
 * UNIVERSAL CATALOG ENTRY
 * --------------------------------- */

export function getPlanCatalog(plans = [], user = null) {
  const userType = getUserType(user);

  if (userType === "guest") {
    return getPublicPlans(plans);
  }

  return getAuthenticatedPlans(plans, user);
}