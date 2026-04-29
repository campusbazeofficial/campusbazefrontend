<template>
  <footer class="bg-cb-card ">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <!-- Main Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

        <!-- Brand Column -->
        <div class="sm:col-span-2 lg:col-span-1 flex flex-col gap-4">
          <router-link to="/" class="inline-flex items-center  w-fit">
           <!-- <img src="@/assets/img/campusBaseLogo.png" alt="CampusBase Logo" class=" h-8 w-auto object-contain" /> -->
           
             <img
          :src="currentLogo"
          alt="CampusBase Logo"
          class="h-8 w-auto object-contain"
        />
            
          </router-link>
          <p class="text-cb-muted text-sm leading-relaxed">
            Connecting students with opportunities. Your gateway to campus life and professional growth.
          </p>
          <div class="flex items-center gap-2 mt-1">
            <a href="https://www.facebook.com/share/p/1AbVjoP32M/" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="Facebook">
              <i class="fa-brands fa-facebook-f text-sm"></i>
            </a>
            <a href="https://x.com/i/status/2043723306931474875" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="Twitter">
              <i class="fa-brands fa-x-twitter text-sm"></i>
            </a>
            <a href="https://www.instagram.com/p/DXE_Vo3DSFm/" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="Instagram">
              <i class="fa-brands fa-instagram text-sm"></i>
            </a>
            <a href="https://www.linkedin.com/posts/campus-baze_campusbaze-knowyourworth-skillbasedincome-activity-7449489345360592897-EX8o?utm_source=share&utm_medium=member_android&rcm=ACoAAGBTErIBcUEPCEFQSFpiyZ3vqGiO2uR_H1g" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="LinkedIn">
              <i class="fa-brands fa-linkedin-in text-sm"></i>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="flex flex-col gap-4">
          <h3 class="text-xs text-cb-text uppercase tracking-widest">Quick Links</h3>
          <nav class="flex flex-col gap-2.5">
            <router-link to="/" class="footer-link">Home</router-link>
            <a href="/#how-it-works" class="footer-link" @click.prevent="scrollTo('how-it-works')">How it Works</a>
            <router-link to="/about" class="footer-link">About Us</router-link>
            <router-link to="/about" class="footer-link">About Us</router-link>
             <router-link to="/subscription" class="footer-link">Subscription Plans</router-link>
            <a href="/#faq" class="footer-link" @click.prevent="scrollTo('faq')">FAQ</a>
            <router-link to="/contact" class="footer-link">Contact Us</router-link>
          </nav>
        </div>

        <!-- Legal -->
        <div class="flex flex-col gap-4">
          <h3 class="text-xs text-cb-text uppercase tracking-widest">Legal</h3>
          <nav class="flex flex-col gap-2.5">
            <router-link to="/privacy-policy" class="footer-link">Privacy Policy</router-link>
            <router-link to="/terms-of-service" class="footer-link">Terms of Service</router-link>
            <router-link to="/cookie-policy" class="footer-link">Cookie Policy</router-link>
            <router-link to="/disclaimer" class="footer-link">Disclaimer</router-link>
          </nav>
        </div>

        <!-- CTA Column -->
        <div class="flex flex-col gap-4">
          <h3 class="text-xs text-cb-text uppercase tracking-widest">Get Early Access</h3>
          <p class="text-cb-muted text-sm leading-relaxed">
            Be the first to know when we launch. Join our WhatsApp waitlist.
          </p>
          <a
            href="https://chat.whatsapp.com/HdwfFSzVQu69DAH8UPweJT?mode=hqctcla"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-cb-accent text-cb-contrast rounded-lg font-semibold text-sm hover:bg-cb-accent-dark w-full sm:w-fit no-underline"
            aria-label="Join waitlist on WhatsApp"
          >
            <i class="fa-brands fa-whatsapp text-base"></i>
            Join Waitlist
          </a>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-cb-divider"></div>

      <!-- Bottom Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6">
        <p class="text-sm text-cb-muted">
          &copy; {{ currentYear }} CampusBaze. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from "@/composables/Usetheme"; // ✅ ADD

import logoLight from "@/assets/img/campusBaseLogo-light.png";
import logoDark from "@/assets/img/campusBaseLogo-dark.png";

const { theme } = useTheme(); // ✅ ADD

const currentLogo = computed(() =>
   theme.value === "dark" ? logoLight  : logoDark,
);

const currentYear = ref(new Date().getFullYear())
const router = useRouter()
const route = useRoute()

async function scrollTo(id) {
  if (route.path !== '/') {
    await router.push('/')
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
@reference "@/style.css";

.footer-link {
  @apply text-sm text-cb-muted no-underline hover:text-cb-accent cursor-pointer;
}

.social-icon {
  @apply w-9 h-9 rounded-lg border border-cb-divider bg-cb-base text-cb-muted flex items-center justify-center hover:bg-cb-accent hover:text-cb-contrast hover:border-cb-accent;
}
</style>