// src/utils/apiErrorHandler.js
// Central place for translating HTTP status codes and axios errors into
// friendly, descriptive messages the user can actually understand.

// ── Generic status-code messages ─────────────────────────────────────────────
const STATUS_MESSAGES = {
  400: 'The information you submitted is invalid or incomplete. Please review your inputs.',
  401: 'Your session has expired or your credentials are incorrect. Please log in again.',
  403: 'You don\'t have permission to do that. If this seems wrong, contact support.',
  404: 'We couldn\'t find what you were looking for.',
  409: 'A conflict occurred — this resource may already exist.',
  410: 'This link has expired and is no longer valid. Please request a new one.',
  422: 'Some of the data you provided couldn\'t be processed. Please check all fields.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again in a few moments.',
  502: 'Our service is temporarily unavailable. Please try again shortly.',
  503: 'The service is down for maintenance. Please check back soon.',
  504: 'The server took too long to respond. Please try again.',
}

// ── Context-specific overrides ────────────────────────────────────────────────
// These take precedence over the generic table when a context key is passed.
const CONTEXT_MESSAGES = {
  login: {
    400: 'Your email or password is incorrect. Please check and try again.',
    401: 'Your email or password is incorrect. Please check and try again.',
    403: 'Your account has been suspended or blocked. Please contact support.',
    404: 'No account found with this email address. Check the spelling or register instead.',
    429: 'Too many failed login attempts. Please wait a few minutes and try again.',
  },
  register: {
    409: 'An account with this email already exists. Try logging in, or use a different email.',
    422: 'Some information you provided is invalid. Please review all fields.',
    429: 'Too many registration attempts. Please wait before trying again.',
  },
  forgotPassword: {
    404: 'No account found with this email address. Check the spelling or create a new account.',
    429: 'Too many reset requests. Please wait a few minutes before trying again.',
  },
  resetPassword: {
    400: 'This reset link is invalid or has already been used. Please request a new one.',
    401: 'This reset link has expired. Password reset links are only valid for a limited time.',
    404: 'This reset link is invalid. Please request a new password reset from the login page.',
    410: 'This reset link has already been used. Please request a new one if you still need to reset your password.',
  },
  verifyEmail: {
    400: 'That verification code is incorrect. Double-check the code in your email and try again.',
    401: 'This verification code has expired. Please request a new one.',
    404: 'No pending verification found for this email. You may need to register again.',
    429: 'Too many verification attempts. Please wait a moment before trying again.',
  },
  resendOtp: {
    404: 'No account found for this email address.',
    429: 'You\'ve requested too many codes. Please wait 60 seconds before requesting another.',
  },
  referral: {
    400: 'This referral code is not valid.',
    404: 'This referral code doesn\'t exist or has expired.',
    422: 'This referral code cannot be used for this account type.',
  },
}

// ── Patterns that suggest a server message is internal / not user-safe ────────
const INTERNAL_PATTERNS = [
  /at\s+\w+\s*\(/,          // Stack trace: "at Object.fn (file.js:10)"
  /TypeError:/,
  /SyntaxError:/,
  /ReferenceError:/,
  /\[object Object\]/,
  /Cannot read propert/,
  /is not a function/,
  /undefined/i,
]

/**
 * Returns true if the server-provided message is safe to show to the user.
 */
function isUserSafeMessage(msg) {
  if (!msg || typeof msg !== 'string') return false
  if (msg.length > 250) return false
  return !INTERNAL_PATTERNS.some(pattern => pattern.test(msg))
}

/**
 * Extracts a human-readable, user-friendly error message from any caught error.
 *
 * Priority order:
 *   1. Server message (if it looks user-safe)
 *   2. Context-specific override for the HTTP status code
 *   3. Generic status-code message
 *   4. Network / timeout messages
 *   5. The provided fallback
 *
 * @param {Error}   error    - The caught error (axios error, network error, etc.)
 * @param {string}  [context] - Optional context key to pick specific overrides.
 *                              One of: login | register | forgotPassword |
 *                              resetPassword | verifyEmail | resendOtp | referral
 * @param {string}  [fallback] - Message of last resort.
 * @returns {string}
 */
export function getErrorMessage(
  error,
  context = null,
  fallback = 'Something went wrong. Please try again.',
) {
  if (!error) return fallback

  const status = error?.response?.status
  const serverMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.errors?.[0]?.message

  // 1. Prefer a human-safe server message
  if (serverMessage && isUserSafeMessage(serverMessage)) {
    return serverMessage
  }

  // 2. Context-specific override
  if (context && status && CONTEXT_MESSAGES[context]?.[status]) {
    return CONTEXT_MESSAGES[context][status]
  }

  // 3. Generic status message
  if (status && STATUS_MESSAGES[status]) {
    return STATUS_MESSAGES[status]
  }

  // 4. Network / connectivity errors
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Unable to connect. Please check your internet connection and try again.'
  }
  if (error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED') {
    return 'The request timed out. Please try again.'
  }
  if (error.code === 'ERR_BAD_REQUEST') {
    return STATUS_MESSAGES[400]
  }

  return fallback
}

/**
 * Convenience: returns true when the error is a 429 (rate limit).
 */
export function isRateLimited(error) {
  return error?.response?.status === 429
}

/**
 * Convenience: returns true when the error is a 401 (unauthenticated).
 */
export function isUnauthorized(error) {
  return error?.response?.status === 401
}