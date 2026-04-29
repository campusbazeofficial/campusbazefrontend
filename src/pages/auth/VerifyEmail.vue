<template>
  <AuthLayout title="Check Your Email" subtitle="One step away">

    <div class="form-header">
      <h2 class="form-title">Enter Verification Code</h2>
      <p class="form-sub">
        We sent a 6-digit code to
        <strong style="color: var(--color-cb-text)">{{ email }}</strong>.
        It expires in 10 minutes.
      </p>
    </div>

    <form @submit.prevent="handleVerify" class="auth-form">

      <!-- OTP boxes -->
      <div class="otp-row">
        <input
          v-for="(_, i) in 6"
          :key="i"
          :ref="el => (otpRefs[i] = el)"
          v-model="otpDigits[i]"
          type="text"
          inputmode="numeric"
          maxlength="1"
          class="otp-box"
          :class="{
            filled: otpDigits[i],
            error: hasError,
            success: isVerified
          }"
          @input="onInput(i, $event)"
          @keydown.backspace="onBackspace(i)"
          @paste.prevent="onPaste($event)"
        />
      </div>

      <!-- Expiry countdown -->
      <div class="expiry-row">
        <i class="fa-regular fa-clock" style="font-size: 0.75rem"></i>
        <span v-if="expirySeconds > 0">Code expires in {{ formatExpiry(expirySeconds) }}</span>
        <span v-else class="expired-text">Code has expired. Please resend.</span>
      </div>

      <!-- Error / success feedback -->
      <p v-if="hasError" class="error-banner">
        <i class="fa-solid fa-circle-exclamation"></i> {{ errorMsg }}
      </p>
      <p v-if="isVerified" class="success-banner">
        <i class="fa-solid fa-circle-check"></i> Verified! Redirecting to login...
      </p>

      <!-- Submit -->
      <button
        type="submit"
        class="auth-btn"
        :disabled="authStore.loading || otpValue.length < 6 || isVerified || expirySeconds === 0"
      >
        <span v-if="authStore.loading" class="btn-loading">
          <i class="fa-solid fa-circle-notch fa-spin"></i> Verifying...
        </span>
        <span v-else>Verify Account</span>
      </button>

      <!-- Resend inline -->
      <div class="resend-row">
        <span class="resend-label">Didn't receive the code?</span>
        <button
          type="button"
          class="resend-btn"
          :disabled="resendCooldown > 0 || resending"
          @click="handleResend"
        >
          <span v-if="resending" class="btn-loading">
            <i class="fa-solid fa-circle-notch fa-spin"></i> Sending...
          </span>
          <span v-else-if="resendCooldown > 0">Resend in {{ resendCooldown }}s</span>
          <span v-else>Resend OTP</span>
        </button>
      </div>

      <p v-if="resendSuccess" class="success-banner" style="margin-top: 0">
        <i class="fa-solid fa-paper-plane"></i> A new code was sent to {{ email }}
      </p>

    </form>

  </AuthLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import AuthLayout from '@/components/auth/AuthLayout.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const email = route.query.email?.trim() || ''

// OTP state
const otpDigits = ref(Array(6).fill(''))
const otpRefs = ref([])
const hasError = ref(false)
const errorMsg = ref('')
const isVerified = ref(false)

// Resend state
const resending = ref(false)
const resendSuccess = ref(false)
const resendCooldown = ref(0)
let resendTimer = null

// Expiry countdown — 10 minutes
const expirySeconds = ref(10 * 60)
let expiryTimer = null

const otpValue = computed(() => otpDigits.value.join(''))

// ── Expiry countdown ──
function startExpiry() {
  clearInterval(expiryTimer)
  expirySeconds.value = 10 * 60
  expiryTimer = setInterval(() => {
    if (expirySeconds.value > 0) expirySeconds.value--
    else clearInterval(expiryTimer)
  }, 1000)
}

function formatExpiry(s) {
  const m = String(Math.floor(s / 60)).padStart(2, '0')
  const sec = String(s % 60).padStart(2, '0')
  return `${m}:${sec}`
}

// ── OTP input handlers ──
function onInput(index, e) {
  hasError.value = false
  const val = e.target.value.replace(/\D/, '')
  otpDigits.value[index] = val
  if (val && index < 5) otpRefs.value[index + 1]?.focus()
}

function onBackspace(index) {
  hasError.value = false
  if (!otpDigits.value[index] && index > 0) {
    otpDigits.value[index - 1] = ''
    otpRefs.value[index - 1]?.focus()
  }
}

function onPaste(e) {
  const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
  otpDigits.value = [...text.split(''), ...Array(6 - text.length).fill('')]
  otpRefs.value[Math.min(text.length, 5)]?.focus()
}

// Auto-submit when all 6 digits filled
watch(otpValue, (val) => {
  if (val.length === 6 && !authStore.loading && !isVerified.value) {
    handleVerify()
  }
})

// ── Verify ──
async function handleVerify() {
  if (otpValue.value.length < 6 || authStore.loading || isVerified.value) return
  hasError.value = false

  try {
    await authStore.verifyEmail(email, otpValue.value)
    
    isVerified.value = true
    clearInterval(expiryTimer)
    setTimeout(() => router.push('/auth/login'), 2000)
  } catch (e) {
    hasError.value = true
    errorMsg.value = getErrorMessage(e, 'verifyEmail', 'Invalid or expired code. Please try again.')
    otpDigits.value = Array(6).fill('')
    otpRefs.value[0]?.focus()
  }
}

// ── Resend ──
async function handleResend() {
  if (resendCooldown.value > 0 || resending.value) return
  resending.value = true
  resendSuccess.value = false
  hasError.value = false

  try {
    await authStore.resendOtp(email)
    
    resendSuccess.value = true
    otpDigits.value = Array(6).fill('')
    otpRefs.value[0]?.focus()

    // Restart expiry
    startExpiry()

    // 60s cooldown before user can resend again
    resendCooldown.value = 60
    clearInterval(resendTimer)
    resendTimer = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0) clearInterval(resendTimer)
    }, 1000)

    // Hide success message after 4s
    setTimeout(() => { resendSuccess.value = false }, 4000)
  } catch (e) {
    hasError.value = true
    errorMsg.value = getErrorMessage(e, 'resendOtp', 'Failed to resend code. Please try again.')
  } finally {
    resending.value = false
  }
}

onMounted(() => {
  startExpiry()
  otpRefs.value[0]?.focus()
})

onUnmounted(() => {
  clearInterval(expiryTimer)
  clearInterval(resendTimer)
})
</script>

<style scoped>
@import '@/assets/auth-shared.css';

.otp-row {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin: 0.25rem 0;
}

.otp-box {
  width: 46px;
  height: 54px;
  border-radius: 10px;
  border: 1.5px solid var(--color-cb-divider);
  background-color: var(--color-cb-base);
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-cb-text);
  outline: none;
  font-family: var(--font-sans);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.otp-box:focus {
  border-color: var(--color-cb-accent);
}

.otp-box.filled {
  border-color: var(--color-cb-accent);
  background-color: var(--color-cb-accent-subtle);
}

.otp-box.error {
  border-color: var(--color-cb-negative);
  background-color: var(--color-cb-negative-subtle);
  animation: shake 0.4s ease;
}

.otp-box.success {
  border-color: var(--color-cb-positive);
  background-color: var(--color-cb-positive-subtle);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}

/* Expiry countdown */
.expiry-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 0.78rem;
  color: var(--color-cb-muted);
}

.expired-text {
  color: var(--color-cb-negative);
  font-weight: 600;
}

/* Banners */
.success-banner {
  font-size: 0.8rem;
  color: var(--color-cb-positive);
  background-color: var(--color-cb-positive-subtle);
  border-radius: 8px;
  padding: 0.6rem 0.85rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Resend row */
.resend-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.resend-label {
  font-size: 0.84rem;
  color: var(--color-cb-muted);
}

.resend-btn {
  background: none;
  border: none;
  font-size: 0.84rem;
  font-weight: 500;
  color: var(--color-cb-accent);
  cursor: pointer;
  font-family: var(--font-sans);
  padding: 0;
  transition: color 0.2s ease, opacity 0.2s ease;
}

.resend-btn:disabled {
  color: var(--color-cb-muted);
  cursor: not-allowed;
}

.resend-btn:not(:disabled):hover {
  text-decoration: underline;
}
</style>