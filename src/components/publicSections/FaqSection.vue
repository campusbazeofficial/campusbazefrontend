<template>
  <section
    class="py-16 sm:py-20 lg:py-28"
    style="background-color: var(--color-cb-base)"
  >
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="max-w-2xl mb-12 sm:mb-16">
        <p class="section-label">FAQ</p>
        <h2 class="section-title">Frequently asked questions</h2>
        <p class="section-sub">
          Everything you need to know about CampusBaze. Can't find what you're
          looking for? Feel free to reach out to us.
        </p>
      </div>

      <!-- Two column layout on desktop -->
      <div class="faq-layout">
        <!-- Left col -->
        <div class="faq-col">
          <div
            v-for="faq in leftFaqs"
            :key="faq.id"
            class="faq-item rounded-md"
            :class="{ open: openId === faq.id }"
            @click="toggle(faq.id)"
          >
            <div class="faq-question  ">
              <span>{{ faq.question }}</span>
              <div class="faq-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <Transition name="accordion">
              <div v-if="openId === faq.id" class="faq-answer">
                <p>{{ faq.answer }}</p>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Right col -->
        <div class="faq-col">
          <div
            v-for="faq in rightFaqs"
            :key="faq.id"
            class="faq-item rounded-md"
            :class="{ open: openId === faq.id }"
            @click="toggle(faq.id)"
          >
            <div class="faq-question">
              <span>{{ faq.question }}</span>
              <div class="faq-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <Transition name="accordion">
              <div v-if="openId === faq.id" class="faq-answer">
                <p>{{ faq.answer }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Bottom CTA -->
      <div class="faq-cta">
        <p class="faq-cta-text">Still have questions?</p>
        <router-link to="/contact" class="faq-cta-btn">Contact us</router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";

const openId = ref(1);

function toggle(id) {
  openId.value = openId.value === id ? null : id;
}

const faqs = [
  {
    id: 1,
    question: "What is CampusBaze?",
    answer:
      "CampusBaze is a campus-focused platform that connects students who need errands done with students who have the skills and time to do them. It's a trusted marketplace built exclusively for university communities.",
  },
  {
    id: 2,
    question: "Who can use CampusBaze?",
    answer:
      "CampusBaze is available to students and staff of partner universities. You must verify your identity using a valid university email address to access the platform.",
  },
  {
    id: 3,
    question: "How do I post an errand?",
    answer:
      "Simply sign up, go to the Post Errand page, describe what you need done, set your budget, and submit. You'll start receiving offers from nearby students right away.",
  },
  {
    id: 4,
    question: "How do I earn on CampusBaze?",
    answer:
      "You can earn by listing a service you offer or by browsing and accepting errands posted by other students. Once a task is completed and confirmed, your earnings are paid out directly through the platform.",
  },
  {
    id: 5,
    question: "Is my payment secure?",
    answer:
      "Yes. CampusBaze uses an escrow-style payment system. Funds are held securely until the task is completed and confirmed by both parties, ensuring neither side is at risk.",
  },
  {
    id: 6,
    question: "What happens if there is a dispute?",
    answer:
      "CampusBaze has a dedicated dispute resolution process. If an issue arises between a poster and an earner, our support team will step in to review the situation and mediate a fair outcome.",
  },
  {
    id: 7,
    question: "Are user profiles verified?",
    answer:
      "Yes. Every user is verified through their university email before they can post or accept tasks. Ratings and reviews are also collected after each completed task to help maintain community trust.",
  },
  {
    id: 8,
    question: "Is CampusBaze available on mobile?",
    answer:
      "CampusBaze works fully on mobile browsers. A dedicated mobile app is currently in development and will be available soon for both Android and iOS.",
  },
];

const leftFaqs = computed(() => faqs.filter((_, i) => i % 2 === 0));
const rightFaqs = computed(() => faqs.filter((_, i) => i % 2 !== 0));
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

/* Two column layout */
.faq-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}

@media (min-width: 768px) {
  .faq-layout {
    grid-template-columns: 1fr 1fr;
    gap: 0 2.5rem;
  }
}

.faq-col {
  display: flex;
  gap: 10px;
  flex-direction: column;
}

/* Item */
.faq-item {
  background-color: var(--color-cb-card);
  /* border-bottom: 1px solid var(--color-cb-divider); */
  cursor: pointer;
  padding: 0 10px;
  overflow: hidden;
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-cb-text);
  user-select: none;
}

.faq-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--color-cb-divider);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-cb-muted);
  transition:
    transform 0.3s ease,
    background-color 0.3s ease,
    border-color 0.3s ease,
    color 0.3s ease;
}

.faq-item.open .faq-icon {
  transform: rotate(180deg);
  background-color: var(--color-cb-accent-subtle);
  border-color: var(--color-cb-accent);
  color: var(--color-cb-accent);
}

.faq-item.open .faq-question {
  color: var(--color-cb-accent);
}

.faq-answer {
  padding-bottom: 1.25rem;
}

.faq-answer p {
  font-size: 0.9rem;
  line-height: 1.75;
  color: var(--color-cb-muted);
  margin: 0;
}

/* Accordion transition */
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Bottom CTA */
.faq-cta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 2rem;
  /* border-top: 1px solid var(--color-cb-divider); */
  flex-wrap: wrap;
}

.faq-cta-text {
  font-size: 0.95rem;
  color: var(--color-cb-muted);
  margin: 0;
}

.faq-cta-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.4rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  border: 1.5px solid var(--color-cb-accent);
  color: var(--color-cb-accent);
  background: transparent;
}

.faq-cta-btn:hover {
  background-color: var(--color-cb-accent-subtle);
}
</style>
