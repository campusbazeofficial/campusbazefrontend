<!-- Shared layout for all auth pages — colored top half, white card floating up -->
<template>
  <div class="auth-shell">
    <!-- Top colored section -->
    <div class="auth-top">
      <div class="auth-top-bar">
        <router-link to="/" class="auth-logo">
          <img
            src="@/assets/img/campusBaseLogo-light-form.png"
            alt="CampusBase Logo"
            class="h-8 w-auto object-contain"
          />
        </router-link>
        <router-link to="/" class="back-home-btn">
          <i class="fa-solid fa-arrow-left"></i>
          <span>Home</span>
        </router-link>
      </div>
      <div class="auth-headline">
        <h1 class="auth-title">{{ title }}</h1>
        <p class="auth-subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <!-- Floating white card -->
    <div class="auth-card">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  subtitle: String,
});
</script>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-cb-base);
}

.auth-top {
  background-color: var(--color-cb-accent);
  padding: 2rem 1.5rem 5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex-shrink: 0;
}

.auth-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.auth-logo {
  display: inline-flex;
  align-items: center;
  /* gap: 8px; */
  text-decoration: none;
}

.logo-img {
  height: 32px;
  width: auto;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.logo-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: #ffffff;
}

.back-home-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  background-color: rgba(255, 255, 255, 0.15);
  padding: 6px 12px;
  border-radius: 20px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.back-home-btn:hover {
  background-color: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.auth-headline {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.auth-title {
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: 500;
  color: #ffffff;
  margin: 0;
  line-height: 1.15;
}

.auth-subtitle {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* Floating card pulls up over the green section */
.auth-card {
  background-color: var(--color-cb-card);
  border-radius: 24px 24px 0 0;
  padding: 2rem 1.5rem 3rem;
  margin-top: -2.5rem;
  flex: 1;
  position: relative;
  z-index: 1;
}

@media (min-width: 480px) {
  .auth-shell {
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    background-color: var(--color-cb-field);
    background-image:
      radial-gradient(
        circle at 15% 50%,
        var(--color-cb-accent-subtle) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 85% 20%,
        var(--color-cb-accent-subtle) 0%,
        transparent 40%
      );
    min-height: 100vh;
  }

  .auth-top {
    width: 100%;
    max-width: 480px;
    border-radius: 24px 24px 0 0;
    padding: 2rem 2rem 5rem;
  }

  .auth-card {
    width: 100%;
    max-width: 480px;
    border-radius: 0 0 24px 24px;
    padding: 2rem 2rem 2.5rem;
    flex: unset;
    /* box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12); */
  }
}
</style>
