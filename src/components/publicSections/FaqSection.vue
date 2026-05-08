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
          Everything you need to know about Campus Baze. Can't find what you're
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
      "CampusBaze is a campus-based marketplace where students and people within the university community can offer services, discover talent, and earn money by solving everyday needs on campus.",
  },
  {
    id: 2,
    question: "Who can use CampusBaze?",
    answer:
      "Students, skilled individuals within the campus community, and anyone who needs services from students can use CampusBaze.",
  },
  {
    id: 3,
    question: "What kind of services can I offer on CampusBaze?",
    answer:
      "You can offer any legitimate service such as graphic design, typing, hair styling, laundry, photography, delivery errands, tech support, tutoring, and many others.",
  },
  {
    id: 4,
    question: "How do I start offering my services on CampusBaze?",
    answer:
      "Create an account, set up your profile, list the services you offer, and start receiving requests from people who need those services.",
  },
  {
    id: 5,
    question: "How do clients find service providers on CampusBaze?",
    answer:
      "Clients can browse through service listings, view profiles, check reviews, and choose the provider that best fits their needs.",
  },
  {
    id: 6,
    question: "How are payments handled on CampusBaze?",
    answer:
      "Payments are made through the CampusBaze platform and held temporarily until the client confirms that the service has been successfully delivered.",
  },
  {
    id: 7,
    question: "Does CampusBaze charge a commission?",
    answer:
      "Yes. CampusBaze charges a commission between 15% and 30% depending on the service category.",
  },
  {
    id: 8,
    question: "What happens if there is a dispute between a client and a service provider?",
    answer:
      "CampusBaze reviews the situation and resolves disputes before releasing the payment to ensure fairness for both parties.",
  },
  {
    id: 9,
    question: "Can non-students hire services on CampusBaze?",
    answer:
      "Yes. People outside the university can also hire talented students through the platform.",
  },
  {
    id: 10,
    question: "How do I get more clients on CampusBaze?",
    answer:
      "Complete your profile, upload examples of your work, respond quickly to requests, deliver quality service, and maintain positive reviews from clients.",
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