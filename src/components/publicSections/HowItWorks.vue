<template>
  <section class="py-16 sm:py-20 lg:py-28" style="background-color: var(--color-cb-base)">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

      <!-- Header -->
      <div class="max-w-2xl mb-12 sm:mb-16">
        <p class="section-label">How It Works</p>
        <h2 class="section-title">Simple steps to get things done.</h2>
        <p class="section-sub">
          Whether you need help or want to earn, you're just a few steps away from
          getting things done.
        </p>
      </div>

      <!-- Steps Grid -->
      <div class="steps-grid">
        <div v-for="(step, index) in steps" :key="step.number" class="step-card">
          <!-- Connector line between cards (desktop) -->
          <div v-if="index < steps.length - 1" class="connector" />

          <div class="step-number">{{ step.number }}</div>
          <div class="step-body">
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-desc">{{ step.desc }}</p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="mt-12 sm:mt-16">
        <button @click="handleGetStarted" class="get-started-btn">
          {{ buttonText }}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>

    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const steps = [
  {
    number: '01',
    title: 'Post or Discover Tasks',
    desc: 'Tell others what you need help with, or browse available tasks and opportunities around your campus.',
  },
  {
    number: '02',
    title: 'Connect & Agree',
    desc: 'Chat with users, agree on the details, and choose the right person for the task.',
  },
  {
    number: '03',
    title: 'Get It Done',
    desc: 'Complete the task or have it handled quickly and efficiently by someone you trust.',
  },
  {
    number: '04',
    title: 'Pay & Get Paid',
    desc: 'Securely make payments or receive earnings directly through the platform.',
  },
]

// Dynamic button text based on auth state
const buttonText = computed(() => {
  return authStore.isAuthenticated ? 'Go to Dashboard' : 'Get Started'
})

function handleGetStarted() {
  if (authStore.isAuthenticated) {
    // If logged in, go to dashboard
    router.push('/user/dashboard')
  } else {
    // If not logged in, go to register page
    router.push('/auth/register')
  }
}
</script>

<style scoped>
@reference "@/style.css";

.section-label {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-cb-accent);
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 500;
  line-height: 1.2;
  color: var(--color-cb-text);
  margin-bottom: 1rem;
}

.section-sub {
  font-size: 1rem;
  line-height: 1.75;
  color: var(--color-cb-muted);
  margin: 0;
}

/* Steps */
.steps-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  position: relative;
}

@media (min-width: 640px) {
  .steps-grid {
    grid-template-columns: 1fr 1fr;
    gap: 2rem 3rem;
  }
}

@media (min-width: 1024px) {
  .steps-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
  }
}

.step-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  padding-right: 1.5rem;
}

/* Horizontal connector on desktop */
.connector {
  display: none;
}

@media (min-width: 1024px) {
  .connector {
    display: block;
    position: absolute;
    top: 24px;
    left: 48px;
    right: 0;
    height: 1px;
    background: linear-gradient(to right, var(--color-cb-accent-muted), transparent);
    z-index: 0;
  }
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-cb-accent-subtle);
  border: 1.5px solid var(--color-cb-accent-muted);
  color: var(--color-cb-accent);
  font-size: 0.9rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.step-body {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.step-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-cb-text);
  margin: 0;
}

.step-desc {
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--color-cb-muted);
  margin: 0;
}

/* CTA */
.get-started-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
  background-color: var(--color-cb-accent);
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.get-started-btn:hover {
  background-color: var(--color-cb-accent-dark);
}
</style>