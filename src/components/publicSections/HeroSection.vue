<template>
  <section class="relative overflow-hidden">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-8 items-center">

        <!-- Left: Text Content -->
        <div class="flex flex-col gap-6 order-2 lg:order-1">
          <h1 class="hero-headline">
            <span class="text-cb-accent">Find Work.</span> Offer Help. 
             <span class="text-cb-accent">Earn Money.</span>
          </h1>

          <p class="hero-subtext">
           We help students showcase their skills, run errands, and connect with clients who need them.
          </p>

          <div class="flex flex-wrap gap-3 mt-2">
            <button @click="handlePostErrand" class="btn-primary">
              Post an Errand
            </button>
            <button @click="handleOfferService" class="btn-ghost">
              Offer a Service
            </button>
          </div>
        </div>

        <!-- Right: Image Grid -->
        <div class="relative hidden sm:flex gap-4 h-[420px] lg:h-[480px] order-1 lg:order-2">
          <!-- Tall left image -->
          <div class="w-[58%] rounded-2xl overflow-hidden">
            <img
              src="@/assets/img/heroImg-1.jpg"
              alt="Students collaborating on campus"
              class="w-full h-full object-cover"
            />
          </div>
          <!-- Shorter right image — offset down -->
          <div class="w-[48%] rounded-2xl overflow-hidden self-end h-[75%]">
            <img
              src="@/assets/img/heroImg-2.jpg"
              alt="Students working together"
              class="w-full h-full object-cover"
            />
          </div>
        </div>

        <!-- Mobile: single image -->
        <div class="sm:hidden rounded-2xl overflow-hidden h-56 order-1">
          <img
            src="@/assets/img/heroImg-1.jpg"
            alt="Students collaborating on campus"
            class="w-full h-full object-cover"
          />
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

function handlePostErrand() {
  if (authStore.isAuthenticated) {
    router.push('/user/post-errand')
  } else {
    toast.info('Please sign in to post an errand')
    router.push({
      name: 'Login',
      query: { redirect: '/user/post-errand' }
    })
  }
}

function handleOfferService() {
  if (authStore.isAuthenticated) {
    router.push('/user/services/create')
  } else {
    toast.info('Please sign in to offer a service')
    router.push({
      name: 'Login',
      query: { redirect: '/user/services/create' }
    })
  }
}
</script>

<style scoped>
@reference "@/style.css";

.hero-headline {
  font-size: clamp(2rem, 5vw, 3.25rem);
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--color-cb-text);
}

.hero-subtext {
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.75;
  color: var(--color-cb-muted);
  max-width: 520px;
}

.btn-primary {
  @apply inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm no-underline cursor-pointer;
  background-color: var(--color-cb-accent);
  color: var(--color-cb-contrast);
  border: none;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--color-cb-accent-dark);
}

.btn-ghost {
  @apply inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm no-underline cursor-pointer;
  border: 1.5px solid var(--color-cb-accent);
  color: var(--color-cb-accent);
  background: transparent;
  transition: background-color 0.2s ease;
}

.btn-ghost:hover {
  background-color: var(--color-cb-accent-subtle);
}
</style>