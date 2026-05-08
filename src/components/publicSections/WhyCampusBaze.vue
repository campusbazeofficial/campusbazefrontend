<template>
  <section class="relative overflow-hidden py-16 sm:py-20 lg:py-28" style="background-color: var(--color-cb-card)">

    <!-- Background decorations -->
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -top-32 -left-32 size-[500px] rounded-full blur-[120px]"
        style="background: radial-gradient(circle, color-mix(in srgb, var(--color-cb-accent) 10%, transparent), transparent 70%)" />
      <div class="absolute -bottom-32 -right-32 size-[400px] rounded-full blur-[100px]"
        style="background: radial-gradient(circle, color-mix(in srgb, var(--color-cb-accent) 8%, transparent), transparent 70%)" />
      <div class="absolute inset-0 opacity-25"
        style="
          background-image: radial-gradient(circle, var(--color-cb-divider) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black, transparent);
        " />
    </div>

    <div class="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

      <!-- Header -->
      <div class="max-w-2xl mb-16 sm:mb-20">
        <p class="section-label">Why Campus Base</p>
        <h2 class="section-title">Built for Campus Life</h2>
        <p class="section-sub">
          Campus Baze also connects the students community to real world opportunities by attracting entrepreneurs, organizations who can hire the students, offer internship and scholarship opportunities to students.
        </p>
      </div>

      <!-- Zigzag Features -->
      <div class="flex flex-col gap-16 sm:gap-20 lg:gap-24">
        <div
          v-for="(feature, index) in features"
          :key="feature.id"
          class="feature-row"
          :class="{ 'lg:flex-row-reverse': index % 2 !== 0 }"
        >
          <!-- Icon Block -->
          <div class="feature-icon-block">
            <div class="glow-ring" />
            <div class="mid-ring" />
            <div class="icon-card">
              <component :is="feature.icon" class="icon-svg" />
            </div>
            <div class="feature-number">0{{ index + 1 }}</div>
            <div class="accent-dot accent-dot--tl" />
            <div class="accent-dot accent-dot--br" />
          </div>

          <!-- Text Block -->
          <div class="feature-text">
            <span class="feature-tag">{{ feature.tag }}</span>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
            <ul class="feature-points">
              <li v-for="point in feature.points" :key="point" class="feature-point">
                <span class="point-check">
                  <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                {{ point }}
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { defineComponent, h } from 'vue'

const IconErrand = defineComponent({ render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.5' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' }),
]) })

const IconService = defineComponent({ render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.5' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z' }),
]) })

const IconEarn = defineComponent({ render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.5' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z' }),
]) })

const IconTrust = defineComponent({ render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.5' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z' }),
]) })

const IconPayment = defineComponent({ render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.5' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' }),
]) })

const IconCampus = defineComponent({ render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.5' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5' }),
]) })

const features = [
  {
    id: 1,
    tag: 'Get help fast',
    title: 'Post Errands in Seconds',
    desc: 'Need something done? Post an errand in seconds and get matched with a trusted student nearby who can handle it whether it\'s a grocery run, printing, or delivery across campus.',
    points: ['Describe your task and set your budget', 'Get matched with nearby students', 'Track progress in real time'],
    icon: IconErrand,
  },
  {
    id: 2,
    tag: 'Share your skills',
    title: 'Offer Your Services',
    desc: 'From tutoring and design to coding and photography list what you\'re good at and start earning from students who need exactly what you offer.',
    points: ['Create a service listing in minutes', 'Set your own price and availability', 'Build your campus reputation'],
    icon: IconService,
  },
  {
    id: 3,
    tag: 'Your terms',
    title: 'Earn Flexibly Around Classes',
    desc: 'No 9-to-5. No boss. Complete tasks and earn money on your own schedule between lectures, on weekends, or whenever works best for you.',
    points: ['Work when it suits your timetable', 'Get paid directly after task completion', 'No minimum hours required'],
    icon: IconEarn,
  },
  {
    id: 4,
    tag: 'Community first',
    title: 'A Trusted Campus Community',
    desc: 'Everyone on Campus Baze is verified through their university. Ratings, reviews, and profiles ensure you always know who you\'re dealing with.',
    points: ['University-verified accounts', 'Ratings and reviews after every task', 'Report and moderation system'],
    icon: IconTrust,
  },
  {
    id: 5,
    tag: 'Peace of mind',
    title: 'Secure Payments, Every Time',
    desc: 'Payments are held safely until a task is completed and confirmed. No more chasing people for money or worrying about being scammed.',
    points: ['Escrow-style payment protection', 'Instant payout after confirmation', 'Dispute resolution support'],
    icon: IconPayment,
  },
  {
    id: 6,
    tag: 'Made for you',
    title: 'Campus-Global Access',
    desc: 'Campusbaze connects  the students with Entrepreneurs, organizations, individuals and also students who need to hire freelancers. ',
    points: ['Campus-scoped listing for errands', 'Verified students community. ', 'Trusted and talented students.'],
    icon: IconCampus,
  },
]
</script>

<style scoped>
@reference "@/style.css";

/* ── Section header ── */
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
  max-width: 560px;
}

/* ── Row layout ── */
.feature-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
}
@media (min-width: 1024px) {
  .feature-row {
    flex-direction: row;
    gap: 5rem;
    align-items: center;
  }
}

/* ── Icon block ── */
.feature-icon-block {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 320px;
  height: 260px;
}
@media (max-width: 1023px) {
  .feature-icon-block {
    display: none;
  }
}
@media (min-width: 1024px) {
  .feature-icon-block {
    width: 340px;
    height: 300px;
  }
}

/* Outer pulsing glow ring */
.glow-ring {
  position: absolute;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  border: 1px dashed color-mix(in srgb, var(--color-cb-accent) 30%, transparent);
  animation: spin-slow 18s linear infinite;
}
.glow-ring::before {
  content: '';
  position: absolute;
  inset: -40px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--color-cb-accent) 12%, transparent), transparent 70%);
  filter: blur(20px);
}

/* Mid ring */
.mid-ring {
  position: absolute;
  width: 170px;
  height: 170px;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--color-cb-accent) 20%, transparent);
  background: color-mix(in srgb, var(--color-cb-accent) 4%, transparent);
}

/* Icon card */
.icon-card {
  position: relative;
  width: 110px;
  height: 110px;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--color-cb-accent) 18%, var(--color-cb-card)),
    var(--color-cb-card)
  );
  border: 1px solid color-mix(in srgb, var(--color-cb-accent) 30%, transparent);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-cb-accent) 10%, transparent),
    0 8px 32px color-mix(in srgb, var(--color-cb-accent) 15%, transparent),
    inset 0 1px 0 color-mix(in srgb, white 8%, transparent);
}

.icon-svg {
  width: 52px;
  height: 52px;
  color: var(--color-cb-accent);
  filter: drop-shadow(0 0 8px color-mix(in srgb, var(--color-cb-accent) 50%, transparent));
}

/* Feature number */
.feature-number {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 5rem;
  font-weight: 700;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in srgb, var(--color-cb-accent) 18%, transparent);
  user-select: none;
  pointer-events: none;
}
@media (max-width: 1023px) {
  .feature-number {
    font-size: 3rem;
    top: -0.5rem;
    right: 1rem;
  }
}

/* Floating accent dots */
/* .accent-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-cb-accent);
  opacity: 0.6;
}
.accent-dot--tl { top: 24px; left: 30px; animation: float 4s ease-in-out infinite; }
.accent-dot--br { bottom: 24px; right: 30px; animation: float 4s ease-in-out infinite 2s; } */

/* ── Text block ── */
.feature-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature-tag {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-cb-accent);
  background-color: var(--color-cb-accent-subtle);
  padding: 4px 12px;
  border-radius: 20px;
  display: inline-block;
  width: fit-content;
}

.feature-title {
  font-size: clamp(1.25rem, 2.5vw, 1.625rem);
  font-weight: 500;
  color: var(--color-cb-text);
  line-height: 1.25;
  margin: 0;
}

.feature-desc {
  font-size: 1rem;
  line-height: 1.75;
  color: var(--color-cb-muted);
  margin: 0;
}

.feature-points {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature-point {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.9rem;
  color: var(--color-cb-muted);
}

/* Checkmark badge replacing plain dot */
.point-check {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: var(--color-cb-accent-subtle);
  color: var(--color-cb-accent);
  display: flex;
  align-items: center;
  justify-content: center;
}
.point-check svg {
  width: 10px;
  height: 10px;
}

/* ── Keyframes ── */
/* @keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0);    opacity: 0.6; }
  50%       { transform: translateY(-8px); opacity: 1;   }
} */
</style>