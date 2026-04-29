<template>
  <AuthLayout title="New Password" subtitle="Almost there">

    <div class="form-header">
      <h2 class="form-title">Reset Your Password</h2>
      <p class="form-sub">Enter a strong new password for your account.</p>
    </div>

    <form @submit.prevent="handleReset" class="auth-form" novalidate>
      <AuthInput
        v-model="form.newPassword"
        label="New Password"
        placeholder="Min. 8 characters"
        type="password"
        autocomplete="new-password"
        :error="errors.newPassword"
        @blur="validateField('newPassword')"
      />

      <!-- Password strength indicator -->
      <div class="strength-wrap" v-if="form.newPassword">
        <div class="strength-bars">
          <div v-for="i in 4" :key="i" class="strength-bar" :class="strengthClass(i)"></div>
        </div>
        <span class="strength-label">{{ strengthLabel }}</span>
      </div>

      <!-- Strength tips -->
      <ul class="strength-tips" v-if="form.newPassword && passwordStrength < 4">
        <li :class="{ met: form.newPassword.length >= 8 }">
          <i :class="form.newPassword.length >= 8 ? 'fa-solid fa-check' : 'fa-solid fa-circle'"></i>
          At least 8 characters
        </li>
        <li :class="{ met: /[A-Z]/.test(form.newPassword) }">
          <i :class="/[A-Z]/.test(form.newPassword) ? 'fa-solid fa-check' : 'fa-solid fa-circle'"></i>
          One uppercase letter
        </li>
        <li :class="{ met: /[0-9]/.test(form.newPassword) }">
          <i :class="/[0-9]/.test(form.newPassword) ? 'fa-solid fa-check' : 'fa-solid fa-circle'"></i>
          One number
        </li>
        <li :class="{ met: /[^A-Za-z0-9]/.test(form.newPassword) }">
          <i :class="/[^A-Za-z0-9]/.test(form.newPassword) ? 'fa-solid fa-check' : 'fa-solid fa-circle'"></i>
          One special character
        </li>
      </ul>

      <AuthInput
        v-model="form.confirmPassword"
        label="Confirm Password"
        placeholder="Repeat your new password"
        type="password"
        :error="errors.confirmPassword"
        @blur="validateField('confirmPassword')"
      />

      <p v-if="errors.general" class="error-banner">{{ errors.general }}</p>

      <button type="submit" class="auth-btn" :disabled="!canSubmit">
        <span v-if="authStore.loading" class="btn-loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Resetting...</span>
        <span v-else>Set New Password</span>
      </button>

      <p class="auth-switch">
        <router-link to="/auth/login" class="switch-link">Back to Login</router-link>
      </p>
    </form>

  </AuthLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import AuthInput from '@/components/auth/AuthInput.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const token = route.query.token || ''
const errors = ref({})
const form = ref({ newPassword: '', confirmPassword: '' })

// Guard: if no token, show error immediately
if (!token) {
  errors.value.general = 'This reset link is invalid or has expired. Please request a new one from the login page.'
}

const passwordStrength = computed(() => {
  const p = form.value.newPassword
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthLabel = computed(() => ['', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength.value])

const canSubmit = computed(() =>
  !errors.value.newPassword &&
  !errors.value.confirmPassword &&
  form.value.newPassword.length >= 8 &&
  form.value.confirmPassword === form.value.newPassword &&
  passwordStrength.value >= 2 &&
  !!token &&
  !authStore.loading
)

function strengthClass(bar) {
  const s = passwordStrength.value
  if (bar > s) return ''
  if (s <= 1) return 'weak'
  if (s === 2) return 'fair'
  if (s === 3) return 'good'
  return 'strong'
}

async function handleReset() {
  errors.value = {}
  validateField('newPassword')
  validateField('confirmPassword')
  if (errors.value.newPassword || errors.value.confirmPassword) return

  if (!token) {
    errors.value.general = 'Invalid or missing reset token. Please request a new password reset.'
    return
  }

  try {
    await authStore.resetPassword(token, form.value.newPassword)
    router.push('/auth/login')
  } catch (e) {
    errors.value.general = getErrorMessage(e, 'resetPassword', 'Reset failed. The link may have expired.')
  }
}

function validateField(field) {
  if (field === 'newPassword') {
    if (!form.value.newPassword) errors.value.newPassword = 'Password is required'
    else if (form.value.newPassword.length < 8) errors.value.newPassword = 'Password must be at least 8 characters'
    else errors.value.newPassword = ''
    if (form.value.confirmPassword) validateField('confirmPassword')
  }
  if (field === 'confirmPassword') {
    errors.value.confirmPassword = form.value.confirmPassword !== form.value.newPassword
      ? 'Passwords do not match'
      : ''
  }
}
</script>

<style scoped>
@import '@/assets/auth-shared.css';

.strength-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.strength-bars {
  display: flex;
  gap: 4px;
  flex: 1;
}

.strength-bar {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  background-color: var(--color-cb-divider);
  transition: background-color 0.3s ease;
}

.strength-bar.weak   { background-color: var(--color-cb-negative); }
.strength-bar.fair   { background-color: var(--color-cb-warning); }
.strength-bar.good   { background-color: var(--color-cb-accent); }
.strength-bar.strong { background-color: var(--color-cb-positive); }

.strength-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-cb-muted);
  min-width: 40px;
}

.strength-tips {
  list-style: none;
  padding: 0.75rem 1rem;
  margin: -0.25rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background-color: var(--color-cb-field);
  border-radius: 10px;
}

.strength-tips li {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.78rem;
  color: var(--color-cb-muted);
  transition: color 0.2s ease;
}

.strength-tips li i {
  font-size: 0.6rem;
  width: 10px;
  color: var(--color-cb-muted);
  transition: color 0.2s ease;
}

.strength-tips li.met {
  color: var(--color-cb-positive);
}

.strength-tips li.met i {
  color: var(--color-cb-positive);
}
</style>