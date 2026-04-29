<template>
  <AuthLayout title="Hello" subtitle="Welcome Back!">
    <div class="form-header">
      <h2 class="form-title">Login Account</h2>
      <p class="form-sub">Enter your credentials to access your account.</p>
    </div>

    <form @submit.prevent="handleLogin" class="auth-form" novalidate>
      <AuthInput
        v-model="form.email"
        label="Email Address"
        placeholder="Your Email Address"
        type="email"
        icon="fa-regular fa-envelope"
        autocomplete="email"
        :error="errors.email"
        @blur="validateField('email')"
      />
      <AuthInput
        v-model="form.password"
        label="Password"
        placeholder="Your Password"
        type="password"
        autocomplete="current-password"
        :error="errors.password"
        @blur="validateField('password')"
      />

      <div class="form-meta">
        <router-link to="/auth/forgot-password" class="forgot-link">Forgot Password?</router-link>
      </div>

      <p v-if="errors.general" class="error-banner">{{ errors.general }}</p>

      <button type="submit" class="auth-btn" :disabled="!canSubmit">
        <span v-if="!authStore.loading">Login Account</span>
        <span v-else class="btn-loading">
          <i class="fa-solid fa-circle-notch fa-spin"></i> Logging in...
        </span>
      </button>

      <p class="auth-switch">
        Don't have an account?
        <router-link to="/auth/register" class="switch-link">Create New Account</router-link>
      </p>
    </form>
  </AuthLayout>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { getErrorMessage } from "@/utils/apiErrorHandler";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import AuthInput from "@/components/auth/AuthInput.vue";

const router    = useRouter();
const route     = useRoute();
const authStore = useAuthStore();
const userStore = useUserStore();

const form   = ref({ email: "", password: "" });
const errors = ref({});

const canSubmit = computed(() =>
  form.value.email.trim().length > 0 &&
  form.value.password.length > 0 &&
  !authStore.loading
);

function validateField(field) {
  if (field === "email") {
    if (!form.value.email.trim()) errors.value.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.value.email.trim())) errors.value.email = "Enter a valid email address";
    else errors.value.email = "";
  }
  if (field === "password") {
    errors.value.password = form.value.password ? "" : "Password is required";
  }
}

async function handleLogin() {
  errors.value = {};
  validateField("email");
  validateField("password");
  if (errors.value.email || errors.value.password) return;

  try {
    await authStore.login({
      email: form.value.email.trim().toLowerCase(),
      password: form.value.password,
    });

    if (!userStore.user?.isEmailVerified) {
      router.push({ path: "/auth/verify-email", query: { email: form.value.email.trim().toLowerCase() } });
      return;
    }

    const rawRedirect = route.query.redirect;
    const safePath =
      rawRedirect &&
      typeof rawRedirect === "string" &&
      rawRedirect.startsWith("/") &&
      !rawRedirect.startsWith("//")
        ? rawRedirect
        : null;

    router.push(safePath || (authStore.userRole === "admin" ? "/admin/dashboard" : "/user/dashboard"));
  } catch (e) {
    errors.value.general = getErrorMessage(e, "login");
  }
}
</script>

<style scoped>
@import "@/assets/auth-shared.css";
</style>