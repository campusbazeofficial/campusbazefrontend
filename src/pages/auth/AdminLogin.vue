<template>
  <div class="admin-login-root">
    <!-- Background grid + glow -->
    <div class="bg-grid" aria-hidden="true"></div>
    <div class="bg-glow" aria-hidden="true"></div>

    <div class="admin-card">
      <!-- Left panel -->
      <div class="admin-card__brand">
        <h1 class="brand-title">Admin Portal</h1>
        <p class="brand-sub">Restricted access. Authorised personnel only.</p>
        <ul class="brand-features" aria-hidden="true">
          <li>
            <i class="fa-solid fa-circle-check"></i> Full dashboard control
          </li>
          <li><i class="fa-solid fa-circle-check"></i> User management</li>
        </ul>
      </div>

      <!-- Right panel – form -->
      <div class="admin-card__form">
        <div class="form-head">
          <h2 class="form-title">Sign In</h2>
          <p class="form-sub">Enter your admin credentials to continue.</p>
        </div>

        <form @submit.prevent="handleLogin" novalidate>
          <!-- Email -->
          <div class="field" :class="{ 'field--error': errors.email }">
            <label for="email" class="field__label">Email Address</label>
            <div class="field__wrap">
              <i class="fa-regular fa-envelope field__icon"></i>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="field__input"
                placeholder="admin@example.com"
                autocomplete="email"
                @blur="validateField('email')"
              />
            </div>
            <span v-if="errors.email" class="field__error">{{ errors.email }}</span>
          </div>

          <!-- Password -->
          <div class="field" :class="{ 'field--error': errors.password }">
            <label for="password" class="field__label">Password</label>
            <div class="field__wrap">
              <i class="fa-solid fa-lock field__icon"></i>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="field__input"
                placeholder="Your password"
                autocomplete="current-password"
                @blur="validateField('password')"
              />
              <button
                type="button"
                class="field__toggle"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
              >
                <i :class="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
              </button>
            </div>
            <span v-if="errors.password" class="field__error">{{ errors.password }}</span>
          </div>

          <!-- General error -->
          <div v-if="errors.general" class="error-banner" role="alert">
            <i class="fa-solid fa-triangle-exclamation"></i>
            {{ errors.general }}
          </div>

          <!-- Submit -->
          <button type="submit" class="submit-btn" :disabled="!canSubmit">
            <span v-if="!authStore.loading">
              <i class="fa-solid fa-right-to-bracket"></i> Sign In to Dashboard
            </span>
            <span v-else class="btn-loading">
              <i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...
            </span>
          </button>
        </form>

        <p class="back-link">
          <router-link to="/auth/login">
            <i class="fa-solid fa-arrow-left"></i> Back to user login
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { getErrorMessage } from "@/utils/apiErrorHandler";

const router = useRouter();
const authStore = useAuthStore();

const form = ref({ email: "", password: "" });
const errors = ref({});
const showPassword = ref(false);

const canSubmit = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.value.email.trim()) &&
  form.value.password.length > 0 &&
  !authStore.loading
);

function validateField(field) {
  if (field === 'email') {
    if (!form.value.email.trim()) errors.value.email = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.value.email.trim())) errors.value.email = 'Enter a valid email address'
    else errors.value.email = ''
  }
  if (field === 'password') {
    errors.value.password = form.value.password ? '' : 'Password is required'
  }
}

async function handleLogin() {
  errors.value = {};
  validateField('email');
  validateField('password');
  if (errors.value.email || errors.value.password) return;

  try {
    await authStore.adminLogin({
      email: form.value.email.trim().toLowerCase(),
      password: form.value.password,
    });

    if (authStore.userRole === "admin") {
      router.push("/admin/dashboard");
    } else {
      authStore.clearAuth();
      errors.value.general = "Access denied. Admin credentials required.";
    }
  } catch (e) {
    errors.value.general = getErrorMessage(e, 'login', 'Login failed. Check your credentials and try again.');
  }
}
</script>

<style scoped>
/* ── Root ────────────────────────────────────────────────── */
.admin-login-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: #0a0c10;
  position: relative;
  overflow: hidden;
  font-family: "Segoe UI", system-ui, sans-serif;
}

/* ── Background ──────────────────────────────────────────── */
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(99, 179, 237, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 179, 237, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

.bg-glow {
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 700px;
  height: 500px;
  background: radial-gradient(
    ellipse at center,
    rgba(66, 153, 225, 0.12) 0%,
    transparent 70%
  );
  pointer-events: none;
}

/* ── Card ────────────────────────────────────────────────── */
.admin-card {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  max-width: 900px;
  min-height: 520px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.06),
    0 32px 64px rgba(0, 0, 0, 0.5);
  animation: cardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ── Brand panel (left) ──────────────────────────────────── */
.admin-card__brand {
  flex: 0 0 340px;
  background: linear-gradient(145deg, #1a2035 0%, #0f1624 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.brand-badge {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #3182ce, #2b6cb0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #fff;
  box-shadow: 0 8px 24px rgba(49, 130, 206, 0.35);
}

.brand-title {
  font-size: 2.25rem;
  font-weight: 600;
  line-height: 1.1;
  color: #fff;
  letter-spacing: -0.03em;
  margin: 0;
}

.brand-sub {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.6;
  margin: 0;
}

.brand-features {
  list-style: none;
  margin: auto 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.brand-features li {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand-features li i {
  color: #3182ce;
  font-size: 0.75rem;
}

/* ── Form panel (right) ──────────────────────────────────── */
.admin-card__form {
  flex: 1;
  background: #111827;
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
}

.form-head {
  margin-bottom: 0.25rem;
}

.form-title {
  font-size: 1.6rem;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0 0 0.35rem;
  letter-spacing: -0.02em;
}

.form-sub {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

/* ── Field ───────────────────────────────────────────────── */
.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.field__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.field__wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field__icon {
  position: absolute;
  left: 1rem;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.9rem;
  pointer-events: none;
}

.field__input {
  width: 100%;
  padding: 0.75rem 2.75rem 0.75rem 2.75rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: #f1f5f9;
  font-size: 0.9rem;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  outline: none;
}

.field__input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.field__input:focus {
  border-color: #3a2ee4;
  box-shadow: 0 0 0 3px rgba(58, 46, 228, 0.12);
  background: rgba(255, 255, 255, 0.06);
}

.field--error .field__input {
  border-color: rgba(252, 129, 74, 0.6);
  box-shadow: 0 0 0 3px rgba(252, 129, 74, 0.1);
}

.field__toggle {
  position: absolute;
  right: 0.9rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem;
  transition: color 0.2s;
}

.field__toggle:hover {
  color: rgba(255, 255, 255, 0.6);
}

.field__error {
  font-size: 0.78rem;
  color: #fc814a;
}

/* ── Error banner ────────────────────────────────────────── */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(252, 129, 74, 0.08);
  border: 1px solid rgba(252, 129, 74, 0.2);
  border-radius: 8px;
  font-size: 0.85rem;
  color: #fc814a;
  margin-bottom: 0.5rem;
}

/* ── Submit button ───────────────────────────────────────── */
.submit-btn {
  width: 100%;
  padding: 0.85rem;
  background: #3a2ee4;
  color: #fff;
  font-size: 0.92rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition:
    opacity 0.2s,
    transform 0.15s;
    

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
 
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ── Back link ───────────────────────────────────────────── */
.back-link {
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.82rem;
}

.back-link a {
  color: rgba(255, 255, 255, 0.35);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: color 0.2s;
}

.back-link a:hover {
  color: rgba(255, 255, 255, 0.65);
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 680px) {
  .admin-card {
    flex-direction: column;
  }

  .admin-card__brand {
    flex: none;
    padding: 2rem 1.75rem;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .brand-features {
    display: none;
  }

  .admin-card__form {
    padding: 2rem 1.75rem;
  }
}
</style>