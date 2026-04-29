// src/utils/cbcFeeUtils.js
//
// CBC Contact Fee — charged upfront in CBC coins to the poster/buyer
// when posting an errand or placing a service order.
//
// This is SEPARATE from commission (which is NGN deducted from seller earnings).

const FEE_TABLE = [
  { maxBudget: 1_000,    standard: 15,   student: 10  },
  { maxBudget: 5_000,    standard: 35,   student: 20  },
  { maxBudget: 15_000,   standard: 70,   student: 40  },
  { maxBudget: 30_000,   standard: 150,  student: 80  },
  { maxBudget: 75_000,   standard: 350,  student: 200 },
  { maxBudget: 150_000,  standard: 700,  student: 400 },
  { maxBudget: Infinity, standard: 1_000, student: 1_000 }, // capped
];

/**
 * Look up the base CBC contact fee for a given budget amount.
 *
 * @param {number} budget         - Job budget or tier price in NGN
 * @param {boolean} isStudentVerified - Whether the poster/buyer is a verified student
 * @returns {number} Base CBC fee before plan discount
 */
export function getCbcContactFee(budget, isStudentVerified = false) {
  const row = FEE_TABLE.find((r) => budget < r.maxBudget) ?? FEE_TABLE[FEE_TABLE.length - 1];
  return isStudentVerified ? row.student : row.standard;
}

/**
 * Apply a plan's CBC discount to a base fee.
 *
 * @param {number} baseFee      - Raw fee from getCbcContactFee()
 * @param {number} cbcDiscount  - Whole-number percentage discount from plan (e.g. 15 = 15% off)
 * @returns {number} Final fee after discount, floored to nearest integer
 */
export function applyPlanDiscount(baseFee, cbcDiscount = 0) {
  if (!cbcDiscount) return baseFee;
  return Math.floor(baseFee * (1 - cbcDiscount / 100));
}

/**
 * Get the final CBC contact fee after plan discount.
 *
 * @param {number}  budget            - Job budget or tier price in NGN
 * @param {boolean} isStudentVerified - Whether the poster/buyer is a verified student
 * @param {number}  cbcDiscount       - Plan discount percentage (0 if on free plan)
 * @returns {number} Final CBC fee to deduct
 */
export function getFinalCbcFee(budget, isStudentVerified = false, cbcDiscount = 0) {
  const base = getCbcContactFee(budget, isStudentVerified);
  return applyPlanDiscount(base, cbcDiscount);
}