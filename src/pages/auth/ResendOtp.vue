<template>
  <AuthLayout title="Resend OTP" subtitle="We'll send a new code">

    <div class="form-header">
      <h2 class="form-title">Resend Code</h2>
      <p class="form-sub">Enter your email address and we'll send you a fresh verification code.</p>
    </div>

    <form @submit.prevent="handleResend" class="auth-form">
      <AuthInput
        v-model="form.email"
        label="Email Address"
        placeholder="Your Email Address"
        type="email"
        icon="fa-regular fa-envelope"
        autocomplete="email"
        :error="errors.email"
      />

      <p v-if="errors.general" class="error-banner">{{ errors.general }}</p>
      <p v-if="success" class="success-banner">
        <i class="fa-solid fa-check"></i> A new code has been sent to {{ form.email }}
      </p>

      <button type="submit" class="auth-btn" :disabled="loading || cooldown > 0">
        <span v-if="loading" class="btn-loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Sending...</span>
        <span v-else-if="cooldown > 0">Resend in {{ cooldown }}s</span>
        <span v-else>Send New Code</span>
      </button>

      <p class="auth-switch">
        Have a code already?
        <router-link :to="{ path: '/auth/verify-email', query: { email: form.email } }" class="switch-link">Enter OTP</router-link>
      </p>
    </form>

  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import AuthLayout from '../../components/auth/AuthLayout.vue'
import AuthInput from '../../components/auth/AuthInput.vue'

const route = useRoute()
const loading = ref(false)
const success = ref(false)
const cooldown = ref(0)
const errors = ref({})
const form = ref({ email: route.query.email || '' })

async function handleResend() {
  errors.value = {}
  success.value = false
  if (!form.value.email) { errors.value.email = 'Email is required'; return }
  loading.value = true
  try {
    // TODO: await api.resendOtp({ email: form.value.email })
    await new Promise(r => setTimeout(r, 1500))
    success.value = true
    cooldown.value = 60
    const interval = setInterval(() => {
      cooldown.value--
      if (cooldown.value <= 0) clearInterval(interval)
    }, 1000)
  } catch (e) {
    errors.value.general = e?.message || 'Failed to send code. Please try again.'
  } finally {
    loading.value = false
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