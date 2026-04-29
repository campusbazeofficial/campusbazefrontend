<template>
  <section class="we-fit-section py-16 sm:py-20 lg:py-28">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

        <!-- Left: Image -->
        <div class="image-wrapper order-1 lg:order-1">
          <img
            src="@/assets/img/heroImg-2.jpg"
            alt="Students collaborating on campus"
            class="section-image"
          />
          <!-- Floating accent card -->
          <div class="accent-card">
            <span class="accent-dot"></span>
            <span class="accent-card-text">Trusted by campus communities</span>
          </div>
        </div>

        <!-- Right: Text -->
        <div class="flex flex-col gap-6 order-2 lg:order-2">
          <p class="section-label">We Fit Your Needs</p>
          <h2 class="section-title">The right people,<br />right on your campus.</h2>

          <div class="quote-block">
            <p class="quote-text">
              Whether you need something done quickly or you're looking to earn by offering
              your skills, CampusBaze brings the right people together. Post errands, find
              trusted help within your campus community, or turn your abilities into
              income all in one place.
            </p>
          </div>

          <p class="section-body">
            We make it simple to connect, agree, and get things done, while you stay in
            control of your interactions. No middlemen, just a reliable platform that helps
            you meet your needs efficiently and securely.
          </p>

          <div class="cta-row">
            <button @click="handlePostErrand" class="btn-primary">Post an Errand</button>
            <button @click="handleOfferService" class="btn-ghost">Offer a Service</button>
          </div>
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

.we-fit-section {
  background-color: var(--color-cb-subtle);
  /* background-image: radial-gradient(
    ellipse at 20% 50%,
    var(--color-cb-accent-subtle) 0%,
    transparent 60%
  ); */
  position: relative;
}

/* Fallback solid dark bg for both themes */
[data-theme="dark"] .we-fit-section,
:root .we-fit-section {
  background-color: #151b23;
}

[data-theme="light"] .we-fit-section {
  background-color: #1f2937;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-cb-muted);
}

.section-title {
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 500;
  line-height: 1.2;
  color: #ffffff;
  margin: 0;
}

.quote-block {
  border-left: 3px solid var(--color-cb-accent);
  padding-left: 1.25rem;
}

.quote-text {
  font-size: 1rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
  font-style: italic;
}

.section-body {
  font-size: 0.95rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

.btn-primary:hover {
  background-color: var(--color-cb-accent-dark);
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.85);
  background: transparent;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.btn-ghost:hover {
  background-color: var(--color-cb-contrast);
  border-color:transparent;
  transition: all 0.5s ;
  color: var(--color-cb-accent);
}

/* Image */
.image-wrapper {
  position: relative;
}

.section-image {
  width: 100%;
  height: 420px;
  object-fit: cover;
  border-radius: 16px;
  display: block;
}

@media (min-width: 1024px) {
  .section-image {
    height: 520px;
  }
}

/* Floating card */
.accent-card {
  position: absolute;
  bottom: -1rem;
  right: -1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 10px;
  background-color: var(--color-cb-contrast);
  color: var(--color-cb-muted);
  font-size: 0.8rem;
  font-weight: 600;
  /* box-shadow: 0 4px 20px rgba(82, 177, 124, 0.35); */
}

.accent-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-cb-accent);
  opacity: 0.8;
  flex-shrink: 0;
}

.accent-card-text {
  white-space: nowrap;
}
</style>