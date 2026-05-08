<template>
  <header class="sticky top-0 z-50 bg-cb-base-96 backdrop-blur-md">
    <nav
      class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-2 min-[1180px]:gap-3 lg:gap-8"
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
      <div class="hidden min-[1180px]:flex items-center gap-0 lg:gap-1 flex-1 justify-center">
        <template v-for="link in navLinks" :key="link.label">
          <!-- Hash scroll link -->
          <a
            v-if="link.hash"
            :href="link.to"
            class="nav-link"
            :class="{ active: activeHash === link.hash }"
            @click.prevent="scrollToSection(link.hash)"
          >
            {{ link.label }}
          </a>
          <!-- Regular router link -->
          <router-link
            v-else-if="!link.dropdown"
            :to="link.to"
            class="nav-link"
            :exact-active-class="activeHash ? '' : 'active'"
            @click="activeHash = null"
          >
            {{ link.label }}
          </router-link>
        </template>

        <!-- Legal Dropdown (Desktop) -->
        <div
          v-if="isLegalDropdownVisible"
          class="relative"
          v-click-outside="() => legalDropdownOpen = false"
        >
          <button
            class="nav-link flex items-center gap-1"
            :class="{ active: isLegalRouteActive }"
            @click="legalDropdownOpen = !legalDropdownOpen"
          >
            Legal
            <i class="fa-solid fa-chevron-down text-xs" :class="{ 'rotate-180': legalDropdownOpen }"></i>
          </button>

          <Transition name="dropdown">
            <div
              v-show="legalDropdownOpen"
              class="absolute left-0 mt-1 w-56 rounded-lg shadow-lg overflow-hidden"
              style="background-color: var(--color-cb-card); border: 1px solid var(--color-cb-divider)"
            >
              <router-link
                v-for="legalLink in legalLinks"
                :key="legalLink.path"
                :to="legalLink.path"
                class="legal-dropdown-link"
                @click="legalDropdownOpen = false"
              >
                {{ legalLink.label }}
              </router-link>
            </div>
          </Transition>
        </div>
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
          class="hidden min-[1180px]:flex items-center gap-2 px-3 lg:px-4 py-2.5 bg-cb-accent text-cb-contrast rounded-lg font-semibold text-sm hover:bg-cb-accent-dark shrink-0"
          title="My Dashboard"
        >
          <i class="fa-solid fa-gauge-high"></i>
          <span class="hidden lg:inline">My Dashboard</span>
        </router-link>
        <router-link
          v-else
          to="/auth/login"
          class="hidden min-[1180px]:flex items-center gap-2 px-3 lg:px-4 py-2.5 bg-cb-accent text-cb-contrast rounded-lg font-semibold text-sm hover:bg-cb-accent-dark shrink-0"
          title="Sign in"
        >
          <i class="fa-solid fa-arrow-right-to-bracket"></i>
          <span class="hidden lg:inline">Sign in</span>
        </router-link>

        <!-- Mobile Menu Toggle -->
        <button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="min-[1180px]:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 cursor-pointer p-0 bg-transparent border-none"
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
        class="min-[1180px]:hidden fixed inset-0 z-40"
        style="background-color: var(--color-cb-overlay)"
        @click="isMobileMenuOpen = false"
      />
    </Transition>

    <!-- Mobile Bottom Sheet -->
    <Transition name="bottom-sheet">
      <div
        v-if="isMobileMenuOpen"
        class="min-[1180px]:hidden fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl shadow-2xl"
        style="
          max-height: 85dvh;
          background-color: var(--color-cb-card);
        "
      >
        <!-- Drag Handle -->
        <div class="flex justify-center pt-3 pb-1 shrink-0">
          <div
            class="w-10 h-1 rounded-full"
            style="background-color: var(--color-cb-divider)"
          ></div>
        </div>

        <!-- Sheet Header -->
        <div
          class="flex items-center justify-between px-5 py-3 shrink-0"
          style="border-bottom: 1px solid var(--color-cb-divider)"
        >
          <span class="text-sm font-semibold" style="color: var(--color-cb-muted)">Menu</span>
          <button
            @click="isMobileMenuOpen = false"
            class="w-8 h-8 flex items-center justify-center rounded-lg border-none cursor-pointer"
            style="background: transparent; color: var(--color-cb-muted)"
          >
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Nav Links (Mobile) -->
        <nav class="flex flex-col px-4 py-4 gap-1 overflow-y-auto flex-1">
          <template v-for="(link, index) in navLinks" :key="link.label">
            <a
              v-if="link.hash"
              :href="link.to"
              class="mobile-nav-link"
              :class="{ active: activeHash === link.hash }"
              :style="{ animationDelay: `${50 + index * 60}ms` }"
              @click.prevent="scrollToSection(link.hash, true)"
            >
              {{ link.label }}
            </a>
            <router-link
              v-else-if="!link.dropdown"
              :to="link.to"
              class="mobile-nav-link"
              :style="{ animationDelay: `${50 + index * 60}ms` }"
              :exact-active-class="activeHash ? '' : 'active'"
              @click="isMobileMenuOpen = false; activeHash = null"
            >
              {{ link.label }}
            </router-link>
          </template>

          <!-- Legal Accordion (Mobile) -->
          <div class="mobile-legal-section">
            <button
              @click="mobileLegalOpen = !mobileLegalOpen"
              class="mobile-nav-link w-full flex items-center justify-between"
              :style="{ animationDelay: `${50 + navLinks.length * 60}ms` }"
            >
              <span>Legal</span>
              <i
                class="fa-solid fa-chevron-down text-xs transition-transform duration-200"
                :class="{ 'rotate-180': mobileLegalOpen }"
              ></i>
            </button>

            <Transition
              name="accordion"
              @enter="onAccordionEnter"
              @after-enter="onAccordionAfterEnter"
              @leave="onAccordionLeave"
              @after-leave="onAccordionAfterLeave"
            >
              <div v-if="mobileLegalOpen" class="ml-4 mt-1 space-y-1 border-l-2 pl-3" style="border-color: var(--color-cb-divider)">
                <router-link
                  v-for="legalLink in legalLinks"
                  :key="legalLink.path"
                  :to="legalLink.path"
                  class="mobile-sub-nav-link"
                  @click="isMobileMenuOpen = false"
                >
                  {{ legalLink.label }}
                </router-link>
              </div>
            </Transition>
          </div>
        </nav>

        <!-- Auth Button (Mobile) -->
        <div class="px-4 pt-2 pb-8 shrink-0" style="border-top: 1px solid var(--color-cb-divider)">
          <router-link
            v-if="isAuthenticated"
            to="/user/dashboard"
            class="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg font-semibold text-sm no-underline mt-3"
            style="
              background-color: var(--color-cb-accent);
              color: var(--color-cb-contrast);
            "
            @click="isMobileMenuOpen = false"
          >
            My Dashboard
          </router-link>
          <router-link
            v-else
            to="/auth/login"
            class="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg font-semibold text-sm no-underline mt-3"
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
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTheme } from "@/composables/Usetheme";
import { useAuthStore } from "@/stores/authStore";

import logoLight from "@/assets/img/campusBaseLogo-light.png";
import logoDark from "@/assets/img/campusBaseLogo-dark.png";

const { theme, toggleTheme } = useTheme();
const isMobileMenuOpen = ref(false);
const legalDropdownOpen = ref(false);
const mobileLegalOpen = ref(false);
const activeHash = ref(null);
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Clear hash active state when navigating away from home page
watch(() => route.path, (path) => {
  if (path !== "/") activeHash.value = null;
});

// v-click-outside directive for closing dropdown when clicking outside
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutsideHandler = (event) => {
      if (!el.contains(event.target)) {
        binding.value(event);
      }
    };
    document.addEventListener("mousedown", el._clickOutsideHandler);
  },
  unmounted(el) {
    document.removeEventListener("mousedown", el._clickOutsideHandler);
  },
};

// Accordion transition JS hooks — animate real height so it works correctly
function onAccordionEnter(el) {
  el.style.height = "0";
  el.style.opacity = "0";
  el.style.overflow = "hidden";
  el.offsetHeight;
  el.style.transition = "height 0.25s ease, opacity 0.25s ease";
  el.style.height = el.scrollHeight + "px";
  el.style.opacity = "1";
}

function onAccordionAfterEnter(el) {
  el.style.height = "";
  el.style.overflow = "";
  el.style.transition = "";
  el.style.opacity = "";
}

function onAccordionLeave(el) {
  el.style.height = el.scrollHeight + "px";
  el.style.overflow = "hidden";
  el.offsetHeight;
  el.style.transition = "height 0.25s ease, opacity 0.25s ease";
  el.style.height = "0";
  el.style.opacity = "0";
}

function onAccordionAfterLeave(el) {
  el.style.height = "";
  el.style.overflow = "";
  el.style.transition = "";
  el.style.opacity = "";
}

// Check if user is authenticated
const isAuthenticated = computed(() => authStore.isAuthenticated);

const navLinks = [
  { to: "/", label: "Home", hash: null },
  { to: "/#how-it-works", label: "How it works", hash: "how-it-works" },
  { to: "/about", label: "About Us", hash: null },
  { to: "/subscription", label: "Subscription Plans", hash: null },
  { to: "/#faq", label: "FAQ", hash: "faq" },
  { to: "/contact", label: "Contact Us", hash: null },
];

const legalLinks = [
  { path: "/privacy-policy", label: "Privacy Policy" },
  { path: "/terms-of-service", label: "Terms of Service" },
  { path: "/cookie-policy", label: "Cookie Policy" },
  { path: "/disclaimer", label: "Disclaimer" },
];

// Check if any legal route is active (for desktop dropdown active state)
const isLegalRouteActive = computed(() => {
  return legalLinks.some(link => route.path === link.path);
});

// Check if legal dropdown should be visible on desktop
const isLegalDropdownVisible = computed(() => {
  return true;
});

async function scrollToSection(id, closeMenu = false) {
  if (closeMenu) isMobileMenuOpen.value = false;
  activeHash.value = id;

  if (route.path !== "/") {
    await router.push("/");
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

const currentLogo = computed(() =>
  theme.value === "dark" ? logoLight : logoDark,
);
</script>

<style scoped>
@reference "@/style.css";

.nav-link {
  @apply px-2 py-2 lg:px-4 text-xs lg:text-sm font-medium text-cb-muted no-underline rounded-lg hover:text-cb-accent hover:bg-cb-accent-subtle cursor-pointer whitespace-nowrap;
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
  animation: fadeSlideUp 0.35s ease forwards;
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

.mobile-sub-nav-link {
  display: block;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 400;
  text-decoration: none;
  border-radius: 0.5rem;
  color: var(--color-cb-muted);
  transition: all 0.2s ease;
  cursor: pointer;
}

.mobile-sub-nav-link:hover {
  background-color: var(--color-cb-field);
  color: var(--color-cb-text);
}

.mobile-sub-nav-link.router-link-active {
  color: var(--color-cb-accent);
  font-weight: 500;
}

/* Legal Dropdown Styles */
.legal-dropdown-link {
  display: block;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 400;
  text-decoration: none;
  color: var(--color-cb-muted);
  transition: all 0.2s ease;
  cursor: pointer;
}

.legal-dropdown-link:hover {
  background-color: var(--color-cb-field);
  color: var(--color-cb-text);
}

.legal-dropdown-link.router-link-active {
  background-color: var(--color-cb-accent-subtle);
  color: var(--color-cb-accent);
  font-weight: 500;
}

/* Dropdown Animations */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Accordion Animation — handled via JS transition hooks */
.accordion-enter-active,
.accordion-leave-active {
  /* transitions applied dynamically in JS hooks */
}

/* Overlay Animations */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Bottom Sheet Animations */
.bottom-sheet-enter-active,
.bottom-sheet-leave-active {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.bottom-sheet-enter-from,
.bottom-sheet-leave-to {
  transform: translateY(100%);
}

.rotate-180 {
  transform: rotate(180deg);
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>