<template>
  <AuthLayout title="Forgot Password?" subtitle="We'll help you reset it">

    <div class="form-header">
      <h2 class="form-title">Reset Password</h2>
      <p class="form-sub">Enter your registered email and we'll send you a password reset link.</p>
    </div>

    <form @submit.prevent="handleSubmit" class="auth-form" novalidate>
      <AuthInput
        v-model="form.email"
        label="Email Address"
        placeholder="Your Email Address"
        type="email"
        icon="fa-regular fa-envelope"
        autocomplete="email"
        :error="errors.email"
        @blur="validateEmail"
      />

      <p v-if="errors.general" class="error-banner">{{ errors.general }}</p>
      <p v-if="success" class="success-banner">
        <i class="fa-solid fa-check"></i> Reset link sent! Check your inbox.
      </p>

      <button type="submit" class="auth-btn" :disabled="!canSubmit">
        <span v-if="authStore.loading" class="btn-loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Sending...</span>
        <span v-else>Send Reset Link</span>
      </button>

      <p class="auth-switch">
        Remembered your password?
        <router-link to="/auth/login" class="switch-link">Back to Login</router-link>
      </p>
    </form>

  </AuthLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import AuthInput from '@/components/auth/AuthInput.vue'

const authStore = useAuthStore()
const success = ref(false)
const errors = ref({})
const form = ref({ email: '' })

const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.value.email.trim()))
const canSubmit = computed(() => emailValid.value && !authStore.loading && !success.value)

function validateEmail() {
  if (!form.value.email.trim()) errors.value.email = 'Email address is required'
  else if (!emailValid.value) errors.value.email = 'Enter a valid email address'
  else errors.value.email = ''
}

async function handleSubmit() {
  errors.value = {}
  success.value = false
  validateEmail()
  if (errors.value.email) return

  try {
    await authStore.forgotPassword(form.value.email.trim().toLowerCase())
    success.value = true
  } catch (e) {
    errors.value.general = getErrorMessage(e, 'forgotPassword', 'Failed to send reset link. Please try again.')
  }
}
</script>

<style scoped>
@import '@/assets/auth-shared.css';

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
</style>