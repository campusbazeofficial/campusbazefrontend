<template>
  <header class="sticky top-0 z-50 bg-cb-base-96 backdrop-blur-md">
    <nav
      class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-6 sm:gap-8"
    >
      <!-- Logo -->
      <router-link to="/" class="shrink-0 flex items-center">
        <img
          :src="currentLogo"
          alt="CampusBase Logo"
          class="h-8 w-auto object-contain"
        />
      </router-link>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center gap-1 flex-1 justify-center">
        <template v-for="link in navLinks" :key="link.label">
          <!-- Hash scroll link -->
          <a
            v-if="link.hash"
            :href="link.to"
            class="nav-link"
            @click.prevent="scrollToSection(link.hash)"
          >
            {{ link.label }}
          </a>
          <!-- Regular router link -->
          <router-link
            v-else
            :to="link.to"
            class="nav-link"
            exact-active-class="active"
          >
            {{ link.label }}
          </router-link>
        </template>
      </div>

      <!-- Right Side Actions -->
      <div class="flex items-center gap-3 sm:gap-4 shrink-0">
        <!-- Theme Toggle -->
        <button
          @click="toggleTheme"
          :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
          :title="`${theme === 'dark' ? 'Light' : 'Dark'} Mode`"
          class="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-cb-divider bg-cb-card text-cb-accent cursor-pointer hover:bg-cb-field hover:border-cb-accent"
        >
          <i v-if="theme === 'dark'" class="fa-solid fa-sun text-lg"></i>
          <i v-else class="fa-solid fa-moon text-lg"></i>
        </button>

        <!-- Auth Button (Desktop) - Conditional -->
        <router-link
          v-if="isAuthenticated"
          to="/user/dashboard"
          class="hidden md:flex items-center gap-2 px-4 py-2.5 bg-cb-accent text-cb-contrast rounded-lg font-semibold text-sm hover:bg-cb-accent-dark"
        >
          <!-- <i class="fa-solid fa-gauge-high"></i> -->
          My Dashboard
        </router-link>
        <router-link
          v-else
          to="/auth/login"
          class="hidden md:flex items-center gap-2 px-4 py-2.5 bg-cb-accent text-cb-contrast rounded-lg font-semibold text-sm hover:bg-cb-accent-dark"
        >
          <i class="fa-solid fa-arrow-right-to-bracket"></i>
          Sign in
        </router-link>

        <!-- Mobile Menu Toggle -->
        <button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="md:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 cursor-pointer p-0 bg-transparent border-none"
          :aria-expanded="isMobileMenuOpen"
          aria-label="Toggle navigation menu"
        >
          <i class="fa-solid fa-bars-staggered text-xl text-cb-text"></i>
        </button>
      </div>
    </nav>
  </header>

  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="overlay">
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden fixed inset-0 z-40"
        style="background-color: var(--color-cb-overlay)"
        @click="isMobileMenuOpen = false"
      />
    </Transition>

    <!-- Mobile Drawer -->
    <Transition name="drawer">
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden fixed top-0 right-0 z-50 w-72 flex flex-col shadow-xl"
        style="height: 100dvh; background-color: var(--color-cb-card)"
      >
        <!-- Drawer Header -->
        <div
          class="flex items-center justify-end px-6 py-4"
          style="border-bottom: 1px solid var(--color-cb-divider)"
        >
          <!-- <span class="text-sm font-semibold text-cb-text">Menu</span> -->
          <button
            @click="isMobileMenuOpen = false"
            class="w-8 h-8 flex items-center justify-center rounded-lg border-none cursor-pointer"
            style="background: transparent; color: var(--color-cb-muted)"
          >
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Nav Links -->
        <nav class="flex flex-col px-4 py-6 gap-1 flex-1">
          <template v-for="(link, index) in navLinks" :key="link.label">
            <a
              v-if="link.hash"
              :href="link.to"
              class="mobile-nav-link"
              :style="{ animationDelay: `${100 + index * 100}ms` }"
              @click.prevent="scrollToSection(link.hash, true)"
            >
              {{ link.label }}
            </a>
            <router-link
              v-else
              :to="link.to"
              class="mobile-nav-link"
              :style="{ animationDelay: `${100 + index * 100}ms` }"
              exact-active-class="active"
              @click="isMobileMenuOpen = false"
            >
              {{ link.label }}
            </router-link>
          </template>
        </nav>

        <!-- Auth Button (Mobile) - Conditional -->
        <div class="px-4 pb-8">
          <router-link
            v-if="isAuthenticated"
            to="/user/dashboard"
            class="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg font-semibold text-sm no-underline"
            style="
              background-color: var(--color-cb-accent);
              color: var(--color-cb-contrast);
            "
            @click="isMobileMenuOpen = false"
          >
            <!-- <i class="fa-solid fa-gauge-high"></i> -->
            My Dashboard
          </router-link>
          <router-link
            v-else
            to="/auth/login"
            class="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg font-semibold text-sm no-underline"
            style="
              background-color: var(--color-cb-accent);
              color: var(--color-cb-contrast);
            "
            @click="isMobileMenuOpen = false"
          >
            <i class="fa-solid fa-arrow-right-to-bracket"></i>
            Sign in
          </router-link>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTheme } from "@/composables/Usetheme";
import { useAuthStore } from "@/stores/authStore";

import logoLight from "@/assets/img/campusBaseLogo-light.png";
import logoDark from "@/assets/img/campusBaseLogo-dark.png";

const { theme, toggleTheme } = useTheme();
const isMobileMenuOpen = ref(false);
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Check if user is authenticated
const isAuthenticated = computed(() => authStore.isAuthenticated);

const navLinks = [
  { to: "/", label: "Home", hash: null },
  { to: "/#how-it-works", label: "How it works", hash: "how-it-works" },
  { to: "/about", label: "About Us", hash: null },
  { to: "/subscription", label: "Subscription Plans", hash: null },
  { to: "/#faq", label: "FAQ", hash: "faq" },
];

async function scrollToSection(id, closeMenu = false) {
  if (closeMenu) isMobileMenuOpen.value = false;

  // If not on home page, navigate there first then scroll
  if (route.path !== "/") {
    await router.push("/");
    // Wait for next tick so DOM is ready
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

const currentLogo = computed(() =>
  theme.value === "dark" ? logoLight  : logoDark,
);
</script>

<style scoped>
@reference "@/style.css";

.nav-link {
  @apply px-4 py-2 text-sm font-medium text-cb-muted no-underline rounded-lg hover:text-cb-accent hover:bg-cb-accent-subtle cursor-pointer;
}

.nav-link.active {
  @apply text-cb-accent bg-cb-accent-subtle font-semibold;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  border-radius: 0.5rem;
  border: none;
  color: var(--color-cb-muted);
  opacity: 0;
  animation: fadeSlideIn 0.4s ease forwards;
  cursor: pointer;
}

.mobile-nav-link:hover {
  background-color: var(--color-cb-field);
  color: var(--color-cb-text);
}

.mobile-nav-link.active {
  color: var(--color-cb-accent);
  font-weight: 600;
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
