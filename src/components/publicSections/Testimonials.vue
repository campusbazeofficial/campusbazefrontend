<template>
  <section class="reviews-section">
    <div class="green-circle"></div>

    <div class="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 relative z-10">
      <!-- Loading State -->
      <div v-if="store.loading" class="card flex items-center justify-center min-h-[300px]">
        <div class="flex flex-col items-center gap-4">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-cb-accent)] border-t-transparent"></div>
          <p class="text-[var(--color-cb-muted)] text-sm">Loading reviews...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="store.error" class="card flex items-center justify-center min-h-[300px]">
        <div class="text-center">
          <p class="text-red-500 mb-2">Failed to load reviews</p>
          <button @click="loadReviews" class="text-[var(--color-cb-accent)] underline text-sm hover:no-underline">
            Try again
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="testimonials.length === 0" class="card flex items-center justify-center min-h-[300px]">
        <p class="text-[var(--color-cb-muted)] text-sm">No reviews yet. Be the first to share your experience!</p>
      </div>

      <!-- Reviews Display -->
      <div v-else class="card">
        <!-- Left: reviewer list -->
        <div class="reviewer-list">
          <p class="section-label">Student Reviews</p>

          <div class="avatar-track">
            <svg class="curve-svg" viewBox="0 0 60 280" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 50 20 Q 0 140, 50 260"
                stroke="var(--color-cb-divider)"
                stroke-width="1.5"
                stroke-dasharray="5 5"
                fill="none"
              />
            </svg>

            <div class="avatars-col">
              <TransitionGroup name="slide" tag="div" class="avatars-inner">
                <div
                  v-for="t in visibleTestimonials"
                  :key="t._id"
                  class="avatar-slot"
                  :class="t.slotClass"
                  @click="goTo(t.originalIndex)"
                >
                  <img :src="t.avatar" :alt="t.name" class="avatar-img" />
                  <div v-if="t.slotClass === 'slot-active'" class="avatar-info">
                    <p class="reviewer-name">{{ t.name }}</p>
                    <div class="stars">
                      <span class="star">★</span>
                      <span class="rating-text">{{ t.rating }} on {{ t.date }}</span>
                    </div>
                  </div>
                  <div v-else class="avatar-info-muted">
                    <p class="reviewer-name-muted">{{ t.name }}</p>
                    <div class="stars-muted">
                      <span class="star-muted">★</span>
                      <span class="rating-text-muted">{{ t.rating }} on {{ t.date }}</span>
                    </div>
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="divider"></div>

        <!-- Right: quote -->
        <div class="quote-side">
          <Transition name="fade" mode="out-in">
            <div :key="activeIndex" class="quote-content">
              <span class="quote-mark">"</span>
              <blockquote class="quote-text">
                <span class="drop-cap">{{ testimonials[activeIndex].quote.charAt(0) }}</span>{{ testimonials[activeIndex].quote.slice(1) }}
              </blockquote>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <div class="green-circle-br"></div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useReviewStore } from '@/stores/reviewStore'

const store = useReviewStore()
const activeIndex = ref(0)
let timer = null

// Transform API reviews to testimonials format
const testimonials = computed(() => {
  return store.publicReviews.map(review => ({
    _id: review._id,
    name: review.reviewerId?.fullName || 'Anonymous',
    avatar: review.reviewerId?.avatar || 'https://i.pravatar.cc/150?img=1',
    rating: review.rating.toFixed(1),
    date: formatDate(review.createdAt),
    quote: review.comment,
    originalIndex: 0 // Will be set by visibleTestimonials
  }))
})

// Format date helper
function formatDate(dateString) {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.toLocaleString('en-US', { month: 'short' })
  const year = date.getFullYear()
  return `${day} ${month}, ${year}`
}

const visibleTestimonials = computed(() => {
  const len = testimonials.value.length
  if (len === 0) return []
  
  // Handle case with only 1 or 2 testimonials
  if (len === 1) {
    return [{ ...testimonials.value[0], slotClass: 'slot-active', originalIndex: 0 }]
  }
  
  if (len === 2) {
    const curr = activeIndex.value % 2
    const next = (curr + 1) % 2
    return [
      { ...testimonials.value[curr], slotClass: 'slot-prev', originalIndex: curr },
      { ...testimonials.value[next], slotClass: 'slot-active', originalIndex: next },
    ]
  }
  
  // Normal case: 3 or more testimonials
  const prev = (activeIndex.value - 1 + len) % len
  const curr = activeIndex.value
  const next = (activeIndex.value + 1) % len
  return [
    { ...testimonials.value[prev], slotClass: 'slot-prev', originalIndex: prev },
    { ...testimonials.value[curr], slotClass: 'slot-active', originalIndex: curr },
    { ...testimonials.value[next], slotClass: 'slot-next', originalIndex: next },
  ]
})

function goTo(index) {
  activeIndex.value = index
  resetTimer()
}

function next() {
  if (testimonials.value.length === 0) return
  activeIndex.value = (activeIndex.value + 1) % testimonials.value.length
}

function resetTimer() {
  clearInterval(timer)
  timer = setInterval(next, 5000)
}

async function loadReviews() {
  try {
    await store.fetchPublicReviews({ limit: 20 })
    activeIndex.value = 0 // Reset to first review
  } catch (error) {
    console.error('Failed to load reviews:', error)
  }
}

onMounted(() => {
  loadReviews()
  timer = setInterval(next, 5000)
})

onUnmounted(() => {
  clearInterval(timer)
  store.reset()
})
</script>

<style scoped>
@reference "@/style.css";

/* ── Section ── */
.reviews-section {
  position: relative;
  background-color: var(--color-cb-field);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  overflow: hidden;
}

/* Decorative circles */
.green-circle {
  position: absolute;
  top: -100px;
  left: -100px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background-color: var(--color-cb-accent);
  z-index: 0;
  opacity: 0.9;
}

.green-circle-br {
  position: absolute;
  bottom: -110px;
  right: -80px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background-color: var(--color-cb-accent);
  z-index: 0;
  opacity: 0.9;
}

/* ── Card ── */
.card {
  background-color: var(--color-cb-base);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2rem;
  padding: 2rem 1.5rem;
  width: 100%;
}

@media (min-width: 768px) {
  .card {
    flex-direction: row;
    align-items: center;
    gap: 0;
    padding: 2.5rem 2.5rem;
    min-height: 300px;
  }
}

/* ── Loading Spinner ── */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ── Left ── */
.reviewer-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  flex-shrink: 0;
  width: 100%;
}

@media (min-width: 768px) {
  .reviewer-list {
    width: 240px;
  }
}

@media (min-width: 1024px) {
  .reviewer-list {
    width: 280px;
  }
}

.section-label {
  font-size: 0.75rem;
  text-align:center;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-cb-accent);
  margin-bottom: 0.5rem;
}


.avatar-track {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.curve-svg {
  width: 40px;
  height: 200px;
  flex-shrink: 0;
}

.avatars-col {
  flex: 1;
  height: 200px;
  overflow: hidden;
  position: relative;
}

.avatars-inner {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  position: relative;
}

/* ── Slots ── */
.avatar-slot {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.slot-prev,
.slot-next { opacity: 0.4; }
.slot-active { opacity: 1; }

.avatar-img {
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  display: block;
  transition: width 0.45s ease, height 0.45s ease, border-color 0.45s ease;
}

.slot-prev .avatar-img,
.slot-next .avatar-img {
  width: 38px;
  height: 38px;
  border: 2px solid var(--color-cb-divider);
}

.slot-active .avatar-img {
  width: 50px;
  height: 50px;
  border: 2.5px solid var(--color-cb-accent);
}

.avatar-info { display: flex; flex-direction: column; gap: 2px; }
.reviewer-name { font-size: 0.875rem; font-weight: 700; color: var(--color-cb-text); margin: 0; white-space: nowrap; }
.stars { display: flex; align-items: center; gap: 2px; }
.star { font-size: 0.65rem; color: var(--color-cb-accent); }
.rating-text { font-size: 0.62rem; color: var(--color-cb-accent); font-weight: 600; margin-left: 2px; }

.avatar-info-muted { display: flex; flex-direction: column; gap: 2px; }
.reviewer-name-muted { font-size: 0.8rem; font-weight: 500; color: var(--color-cb-muted); margin: 0; white-space: nowrap; }
.stars-muted { display: flex; align-items: center; gap: 2px; }
.star-muted { font-size: 0.6rem; color: var(--color-cb-muted); }
.rating-text-muted { font-size: 0.6rem; color: var(--color-cb-muted); margin-left: 2px; }

/* ── Divider ── */
.divider {
  display: none;
}

@media (min-width: 768px) {
  .divider {
    display: block;
    width: 1px;
    height: 180px;
    background-color: var(--color-cb-divider);
    flex-shrink: 0;
    margin: 0 2rem;
  }
}

/* ── Right ── */
.quote-side {
  flex: 1;
  display: flex;
  align-items: center;
}

.quote-content { display: flex; flex-direction: column; }

.quote-mark {
  font-size: 4.5rem;
  line-height: 0.75;
  color: var(--color-cb-muted);
  font-family: Georgia, serif;
  display: block;
  margin-bottom: 10px;
}

.quote-text {
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  line-height: 1.85;
  color: var(--color-cb-muted);
  font-style: italic;
  margin: 0;
}

.drop-cap {
  font-size: 1.3rem;
  font-weight: 700;
  font-style: normal;
  color: var(--color-cb-text);
  line-height: 1;
  margin-right: 1px;
}

/* ── Slide transition ── */
.slide-move {
  transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  width: 100%;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(-40px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(40px);
}

/* ── Quote fade ── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>