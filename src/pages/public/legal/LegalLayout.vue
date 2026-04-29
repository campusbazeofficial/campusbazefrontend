<!-- Shared layout for all legal pages -->
<template>
  <main>
    <!-- Hero -->
    <section class="legal-hero">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <p class="page-label">{{ label }}</p>
        <h1 class="page-title">{{ title }}</h1>
        <p class="page-meta">Last updated: {{ lastUpdated }}</p>
      </div>
    </section>

    <!-- Content -->
    <section class="legal-body">
      <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <!-- Table of Contents -->
        <div class="toc" v-if="sections.length">
          <p class="toc-title">Contents</p>
          <ol class="toc-list">
            <li v-for="(section, i) in sections" :key="i">
              <a :href="`#section-${i}`" class="toc-link">{{
                section.heading
              }}</a>
            </li>
          </ol>
        </div>

        <!-- Sections -->
        <div class="sections">
          <div
            v-for="(section, i) in sections"
            :key="i"
            :id="`section-${i}`"
            class="legal-section"
          >
            <h2 class="section-heading">
              <span class="section-num">{{ i + 1 }}</span>
              {{ section.heading }}
            </h2>
            <div class="section-body">
              <p v-if="section.intro" class="section-intro">
                {{ section.intro }}
              </p>
              <ul v-if="section.bullets" class="section-bullets">
                <li v-for="bullet in section.bullets" :key="bullet">
                  {{ bullet }}
                </li>
              </ul>
              <p v-if="section.body" class="section-text">{{ section.body }}</p>
              <template v-if="section.subsections">
                <div
                  v-for="sub in section.subsections"
                  :key="sub.title"
                  class="subsection"
                >
                  <h3 class="sub-title">{{ sub.title }}</h3>
                  <p v-if="sub.text" class="section-text">{{ sub.text }}</p>
                  <ul v-if="sub.bullets" class="section-bullets">
                    <li v-for="b in sub.bullets" :key="b">{{ b }}</li>
                  </ul>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Contact block -->
        <div class="contact-block" v-if="contact">
          <p class="contact-title">Questions?</p>
          <p class="contact-text">{{ contact.text }}</p>
          <a :href="`mailto:${contact.email}`" class="contact-email">{{
            contact.email
          }}</a>
        </div>
      </div>
    </section>
    <ScrollToTop />
  </main>
</template>

<script setup>
import ScrollToTop from "@/components/reusables/ScrollToTop.vue";
defineProps({
  label: String,
  title: String,
  lastUpdated: String,
  sections: Array,
  contact: Object,
});
</script>

<style scoped>
@reference "@/style.css";

.legal-hero {
  background-color: var(--color-cb-card);
  border-bottom: 1px solid var(--color-cb-divider);
}

.page-label {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-cb-accent);
  margin-bottom: 0.75rem;
}

.page-title {
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 500;
  line-height: 1.15;
  color: var(--color-cb-text);
  margin-bottom: 0.75rem;
}

.page-meta {
  font-size: 0.875rem;
  color: var(--color-cb-muted);
  margin: 0;
}

.legal-body {
  background-color: var(--color-cb-base);
}

/* TOC */
.toc {
  background-color: var(--color-cb-card);
  border: 1px solid var(--color-cb-divider);
  border-radius: 14px;
  padding: 1.5rem 2rem;
  margin-bottom: 3rem;
}

.toc-title {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-cb-muted);
  margin: 0 0 0.75rem;
}

.toc-list {
  list-style: decimal;
  padding-left: 1.25rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.toc-link {
  font-size: 0.875rem;
  color: var(--color-cb-accent);
  text-decoration: none;
}

.toc-link:hover {
  text-decoration: underline;
}

/* Sections */
.sections {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.legal-section {
  padding-top: 1rem;
  border-top: 1px solid var(--color-cb-divider);
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--color-cb-text);
  margin: 0 0 1rem;
}

.section-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: var(--color-cb-accent-subtle);
  color: var(--color-cb-accent);
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.section-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-intro,
.section-text {
  font-size: 0.9rem;
  line-height: 1.8;
  color: var(--color-cb-muted);
  margin: 0;
}

.section-bullets {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.section-bullets li {
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--color-cb-muted);
  padding-left: 1.1rem;
  position: relative;
}

.section-bullets li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 10px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: var(--color-cb-accent);
}

/* Subsections */
.subsection {
  padding-left: 1rem;
  border-left: 2px solid var(--color-cb-accent-muted);
  margin-top: 0.5rem;
}

.sub-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-cb-text);
  margin: 0 0 0.4rem;
}

/* Contact */
.contact-block {
  margin-top: 3rem;
  padding: 2rem;
  border-radius: 14px;
  background-color: var(--color-cb-accent-subtle);
  border: 1px solid var(--color-cb-accent-muted);
}

.contact-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-cb-text);
  margin: 0 0 0.4rem;
}

.contact-text {
  font-size: 0.875rem;
  color: var(--color-cb-muted);
  margin: 0 0 0.75rem;
}

.contact-email {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-cb-accent);
  text-decoration: none;
}

.contact-email:hover {
  text-decoration: underline;
}
</style>
