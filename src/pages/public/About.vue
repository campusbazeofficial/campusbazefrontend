<template>
  <main>

    <!-- Hero -->
    <section class="about-hero">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div class="hero-grid">

          <!-- Left: Text -->
          <div class="hero-text">
            <p class="page-label">About Us</p>
            <h1 class="page-title">Unlocking opportunity within campus ecosystems.</h1>
            <p class="page-sub">
              Campus Baze was created on a simple belief: there is enormous talent within campuses,
              there are everyday problems that need solving, and when the right people are connected,
              opportunity begins to circulate.
            </p>
            <div class="hero-stats">
              <div v-for="stat in stats" :key="stat.label" class="stat-item">
                <span class="stat-value">{{ stat.value }}</span>
                <span class="stat-label">{{ stat.label }}</span>
              </div>
            </div>
          </div>

          <!-- Right: Stacked images -->
          <div class="hero-images">
            <div class="img-stack">
              <div class="img-main">
                <img src="@/assets/img/publicImages/about_us_img_1.png" alt="Students collaborating on campus" />
              </div>
              <div class="img-secondary">
                <img src="@/assets/img/publicImages/about_us_img_2.png" alt="Campus community connecting" />
              </div>
              <!-- Floating accent -->
              <div class="img-badge">
                <span class="badge-dot"></span>
                <span>Campus-verified community</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- Mission -->
    <section class="section-pad" style="background-color: var(--color-cb-card)">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div class="two-col">
          <div>
            <p class="section-label">Our Mission</p>
            <h2 class="section-title">The structure that makes exchange possible.</h2>
          </div>
          <div class="prose-block">
            <p>
              Campus Baze provides the structure that allows talent and need to connect fairly,
              safely, and efficiently. Whether you need something done quickly or you're looking
              to earn by offering your skills, Campus Baze brings the right people together.
            </p>
            <p>
              We are not just a marketplace. We are a trust layer built specifically for campus
              communities ensuring every interaction is accountable, every payment is protected,
              and every user is treated with dignity.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- What we do -->
    <section class="section-pad">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div class="max-w-xl mb-12">
          <p class="section-label">What We Do</p>
          <h2 class="section-title">A platform built around real campus needs.</h2>
        </div>
        <div class="features-grid">
          <div v-for="feature in whatWeDo" :key="feature.title" class="feature-card">
            <div class="feature-icon">
              <component :is="feature.icon" />
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="section-pad" style="background-color: var(--color-cb-card)">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div class="max-w-xl mb-12">
          <p class="section-label">Our Values</p>
          <h2 class="section-title">What we stand for.</h2>
        </div>
        <div class="values-grid">
          <div v-for="value in values" :key="value.title" class="value-item">
            <div class="value-dot"></div>
            <div>
              <h3 class="value-title">{{ value.title }}</h3>
              <p class="value-desc">{{ value.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section-pad">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div class="cta-box">
          <h2 class="cta-title">{{ ctaTitle }}</h2>
          <p class="cta-sub">{{ ctaSubtitle }}</p>
          <div class="cta-buttons">
            <button @click="handlePrimaryCta" class="btn-primary">
              {{ primaryCtaText }}
            </button>
            <router-link to="/contact" class="btn-ghost">Contact us</router-link>
          </div>
        </div>
      </div>
    </section>
  <ScrollToTop />
  </main>
</template>

<script setup>
import { computed, defineComponent, h } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import ScrollToTop from '@/components/reusables/ScrollToTop.vue'

const router = useRouter()
const authStore = useAuthStore()

const IconErrand = defineComponent({ render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.5' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' })]) })
const IconService = defineComponent({ render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.5' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z' })]) })
const IconPayment = defineComponent({ render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.5' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' })]) })
const IconCommunity = defineComponent({ render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.5' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z' })]) })

const stats = [
  { value: '500+', label: 'Tasks completed' },
  { value: '200+', label: 'Active earners' },
  { value: '10+', label: 'Partner universities' },
]

const whatWeDo = [
  { title: 'Post Errands', desc: 'Students can post tasks they need completed  from grocery runs to document delivery  and get matched with someone nearby.', icon: IconErrand },
  { title: 'Offer Services', desc: 'Anyone with a skill design, coding, tutoring, photography  can list their service and start earning from fellow students.', icon: IconService },
  { title: 'Secure Payments', desc: 'Funds are held in escrow and only released after successful task completion, protecting both parties in every transaction.', icon: IconPayment },
  { title: 'Campus Community', desc: 'Every user is verified through their campus affiliation, ensuring a trusted, accountable environment for all interactions.', icon: IconCommunity },
]

const values = [
  { title: 'Trust', desc: 'Every feature we build is designed to make users feel safe. From verified profiles to escrow payments, trust is the foundation of Campus Baze.' },
  { title: 'Fairness', desc: 'We believe in fair exchange. Whether you are earning or spending, Campus Baze ensures both sides of every transaction are protected.' },
  { title: 'Efficiency', desc: 'Campus life moves fast. Campus Baze is built to match that pace  making it easy to post, connect, and complete tasks without friction.' },
  { title: 'Community', desc: 'We exist to strengthen campus communities by circulating opportunity and talent within them, not extracting it.' },
]

// Dynamic CTA content based on auth state
const ctaTitle = computed(() => {
  return authStore.isAuthenticated 
    ? 'Ready to get things done?' 
    : 'Ready to get started?'
})

const ctaSubtitle = computed(() => {
  return authStore.isAuthenticated
    ? 'Head to your dashboard to post an errand, offer a service, or manage your tasks.'
    : 'Join thousands of students already using Campus Baze to get things done and earn on their own terms.'
})

const primaryCtaText = computed(() => {
  return authStore.isAuthenticated ? 'Go to Dashboard' : 'Create an account'
})

function handlePrimaryCta() {
  if (authStore.isAuthenticated) {
    router.push('/user/dashboard')
  } else {
    router.push('/auth/register')
  }
}
</script>

<style scoped>
@reference "@/style.css";

/* ── Hero ── */
.about-hero {
  background-color: var(--color-cb-base);
  border-bottom: 1px solid var(--color-cb-divider);
  padding: 5rem 0 0;
  overflow: hidden;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  align-items: center;
}

@media (min-width: 1024px) {
  .hero-grid {
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    min-height: 580px;
  }
}

/* Text side */
.hero-text {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-bottom: 3rem;
}

.page-label {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-cb-accent);
}

.page-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 500;
  line-height: 1.15;
  color: var(--color-cb-text);
  margin: 0;
}

.page-sub {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--color-cb-muted);
  max-width: 520px;
  margin: 0;
}

.hero-stats {
  display: flex;
  gap: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-cb-divider);
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 500;
  color: var(--color-cb-accent);
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-cb-muted);
}

/* Image side */
.hero-images {
  display: none;
  position: relative;
  height: 520px;
  align-self: stretch;
}

@media (min-width: 1024px) {
  .hero-images {
    display: block;
  }
}

.img-stack {
  position: relative;
  width: 100%;
  height: 100%;
}

.img-main {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 60px;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
}

.img-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.img-secondary {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 55%;
  height: 200px;
  border-radius: 16px;
  overflow: hidden;
  border: 4px solid var(--color-cb-base);
}

.img-secondary img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.img-badge {
  position: absolute;
  bottom: 20px;
  left: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #ffffff;
  background-color: var(--color-cb-accent);
  box-shadow: 0 4px 16px rgba(82, 177, 124, 0.35);
  white-space: nowrap;
}

.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffffff;
  opacity: 0.8;
  flex-shrink: 0;
}

/* ── Shared ── */
.section-pad {
  padding: 4rem 0;
}

@media (min-width: 640px) { .section-pad { padding: 5rem 0; } }
@media (min-width: 1024px) { .section-pad { padding: 6rem 0; } }

.section-label {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-cb-accent);
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 500;
  line-height: 1.2;
  color: var(--color-cb-text);
  margin: 0;
}

.two-col {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}

@media (min-width: 768px) {
  .two-col { grid-template-columns: 1fr 1fr; gap: 5rem; align-items: start; }
}

.prose-block { display: flex; flex-direction: column; gap: 1.25rem; }
.prose-block p { font-size: 1rem; line-height: 1.8; color: var(--color-cb-muted); margin: 0; }

/* Features */
.features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 640px) { .features-grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1024px) { .features-grid { grid-template-columns: repeat(4, 1fr); } }

.feature-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--color-cb-divider);
  background-color: var(--color-cb-card);
}

.feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background-color: var(--color-cb-accent-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-cb-accent);
}

.feature-icon svg { width: 22px; height: 22px; }
.feature-title { font-size: 0.95rem; font-weight: 600; color: var(--color-cb-text); margin: 0; }
.feature-desc { font-size: 0.875rem; line-height: 1.7; color: var(--color-cb-muted); margin: 0; }

/* Values */
.values-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
@media (min-width: 640px) { .values-grid { grid-template-columns: 1fr 1fr; } }

.value-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--color-cb-divider);
  background-color: var(--color-cb-base);
}

.value-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background-color: var(--color-cb-accent);
  flex-shrink: 0; margin-top: 6px;
}

.value-title { font-size: 0.95rem; font-weight: 500; color: var(--color-cb-text); margin: 0 0 0.35rem; }
.value-desc { font-size: 0.875rem; line-height: 1.7; color: var(--color-cb-muted); margin: 0; }

/* CTA */
.cta-box {
  background-color: var(--color-cb-accent-subtle);
  border: 1px solid var(--color-cb-accent-muted);
  border-radius: 20px;
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.cta-title { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 500; color: var(--color-cb-text); margin: 0; }
.cta-sub { font-size: 1rem; line-height: 1.75; color: var(--color-cb-muted); max-width: 480px; margin: 0; }
.cta-buttons { display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; margin-top: 0.5rem; }

.btn-primary {
  display: inline-flex; align-items: center;
  padding: 0.75rem 1.5rem; border-radius: 10px;
  font-weight: 600; font-size: 0.875rem; text-decoration: none;
  background-color: var(--color-cb-accent); color: #ffffff;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.btn-primary:hover { background-color: var(--color-cb-accent-dark); }

.btn-ghost {
  display: inline-flex; align-items: center;
  padding: 0.75rem 1.5rem; border-radius: 10px;
  font-weight: 600; font-size: 0.875rem; text-decoration: none;
  border: 1.5px solid var(--color-cb-accent); color: var(--color-cb-accent); background: transparent;
}
.btn-ghost:hover { background-color: var(--color-cb-accent-subtle); }
</style>