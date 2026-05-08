<template>
  <main>
    <!-- Hero with background image -->
    <section class="contact-hero">
      <!-- Dark overlay -->
      <div class="hero-overlay"></div>

      <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        <!-- Header -->
        <div class="hero-header">
          <h1 class="page-title">Contact Us</h1>
          <p class="page-sub">
            Have a question, suggestion, or need assistance? We’re here to help. Reach out to us and our team will respond as soon as possible.
          </p>
        </div>

        <!-- Content grid -->
        <div class="contact-grid">
          <!-- Left: Info -->
          <div class="contact-info">
            <div
              v-for="item in contactItems"
              :key="item.label"
              class="info-item"
            >
              <div class="info-icon">
                <component :is="item.icon" />
              </div>
              <div>
                <p class="info-label">{{ item.label }}</p>
                <p class="info-value">{{ item.value }}</p>
              </div>
            </div>

            <!-- Social -->
            <div class="social-row">
              <a
                href="https://www.facebook.com/61555774271352/posts/122111110616192475/?app=fbl"
                target="_blank"
                rel="noopener noreferrer"
                class="social-btn"
                aria-label="Facebook"
              >
                <i class="fa-brands fa-facebook-f"></i>
              </a>
              <a
                href="https://x.com/i/status/2043001280365310172"
                target="_blank"
                rel="noopener noreferrer"
                class="social-btn"
                aria-label="Twitter"
              >
                <i class="fa-brands fa-x-twitter"></i>
              </a>
              <a
                href="https://www.instagram.com/campus_baze?igsh=MXFrNm1vMHR4c2I5Zg=="
                target="_blank"
                rel="noopener noreferrer"
                class="social-btn"
                aria-label="Instagram"
              >
                <i class="fa-brands fa-instagram"></i>
              </a>
              <a
                href="https://t.me/campusbazers1"
                target="_blank"
                rel="noopener noreferrer"
                class="social-btn"
                aria-label="Telegram"
              >
                <i class="fa-brands fa-telegram"></i>
              </a>
              <a
                href="https://www.tiktok.com/@campusbaze?_r=1&_t=ZS-96AUORqfjuu"
                target="_blank"
                rel="noopener noreferrer"
                class="social-btn"
                aria-label="TikTok"
              >
                <i class="fa-brands fa-tiktok"></i>
              </a>
            </div>
          </div>

          <!-- Right: Form card -->
          <div class="form-card">
            <h2 class="form-title">Send a Message</h2>

            <form @submit.prevent="handleSubmit" class="form-body">
              <div class="form-group">
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="Full Name"
                  class="form-input"
                  required
                />
              </div>
              <div class="form-group">
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="Email Address"
                  class="form-input"
                  required
                />
              </div>
              <div class="form-group">
                <input
                  v-model="form.subject"
                  type="text"
                  placeholder="Subject"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <textarea
                  v-model="form.message"
                  placeholder="Type your message..."
                  class="form-input form-textarea"
                  rows="5"
                  required
                ></textarea>
              </div>

              <p v-if="formError" class="form-error">
                <i class="fa-solid fa-circle-exclamation"></i> {{ formError }}
              </p>

              <button type="submit" class="submit-btn" :disabled="submitting || submitted">
                <span v-if="submitting" class="success-msg">
                  <i class="fa-solid fa-spinner fa-spin"></i> Sending…
                </span>
                <span v-else-if="submitted" class="success-msg">
                  <i class="fa-solid fa-check"></i> Message sent!
                </span>
                <span v-else>Send Message</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
    <ScrollToTop />
  </main>
</template>

<script setup>
import { ref, defineComponent, h } from "vue";
import ScrollToTop from "@/components/reusables/ScrollToTop.vue";

const FORMSPREE_URL = "https://formspree.io/f/xpqbjnqe";

const form = ref({ name: "", email: "", subject: "", message: "" });
const submitting = ref(false);
const submitted = ref(false);
const formError = ref("");

async function handleSubmit() {
  submitting.value = true;
  formError.value = "";

  try {
    const response = await fetch(FORMSPREE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: form.value.name,
        email: form.value.email,
        subject: form.value.subject,
        message: form.value.message,
      }),
    });

    if (response.ok) {
      submitted.value = true;
      form.value = { name: "", email: "", subject: "", message: "" };
      // Reset success state after 4 seconds
      setTimeout(() => {
        submitted.value = false;
      }, 4000);
    } else {
      const data = await response.json();
      formError.value =
        data?.errors?.[0]?.message ||
        "Something went wrong. Please try again.";
    }
  } catch {
    formError.value = "Network error. Please check your connection and try again.";
  } finally {
    submitting.value = false;
  }
}

const IconLocation = defineComponent({
  render: () =>
    h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        "stroke-width": "1.8",
      },
      [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          d: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z",
        }),
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          d: "M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
        }),
      ],
    ),
});
const IconPhone = defineComponent({
  render: () =>
    h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        "stroke-width": "1.8",
      },
      [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          d: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
        }),
      ],
    ),
});
const IconEmail = defineComponent({
  render: () =>
    h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        "stroke-width": "1.8",
      },
      [
        h("path", {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          d: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
        }),
      ],
    ),
});

const contactItems = [
  { label: "Address", value: " (1st floor left,) after St. Johns Hotel nodu Okpuno", icon: IconLocation },
  { label: "Phone", value: "+234 701 567 6490", icon: IconPhone },
  { label: "Email", value: "campusbazeofficial@gmail.com", icon: IconEmail },
];
</script>

<style scoped>
@reference "@/style.css";

/* ── Hero ── */
.contact-hero {
  position: relative;
  min-height: 100vh;
  background-image: url("@/assets/img/publicImages/contact_img.png");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  padding: 5rem 0 4rem;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 20, 30, 0.82);
  z-index: 0;
}

/* ── Header ── */
.hero-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.page-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 1rem;
}

.page-sub {
  font-size: 1rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.65);
  max-width: 600px;
  margin: 0 auto;
}

/* ── Grid ── */
.contact-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  align-items: start;
}

@media (min-width: 768px) {
  .contact-grid {
    grid-template-columns: 1fr 2fr;
    gap: 4rem;
    align-items: center;
  }
}

/* ── Left info ── */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
}

.info-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-cb-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #ffffff;
}

.info-icon svg {
  width: 22px;
  height: 22px;
}

.info-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-cb-accent);
  margin: 0 0 3px;
  letter-spacing: 0.02em;
}

.info-value {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.6;
}

.social-row {
  display: flex;
  gap: 0.75rem;
  padding-top: 0.5rem;
}

.social-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.social-btn:hover {
  background-color: var(--color-cb-accent);
  border-color: var(--color-cb-accent);
  color: #ffffff;
}

/* ── Form card ── */
.form-card {
  background-color: var(--color-cb-base);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  border: 1px solid var(--color-cb-divider);
}

@media (min-width: 640px) {
  .form-card {
    padding: 2.5rem;
  }
}

.form-title {
  font-size: 1.35rem;
  font-weight: 500;
  color: var(--color-cb-text);
  margin: 0 0 1.75rem;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-input {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1.5px solid var(--color-cb-divider);
  border-radius: 0;
  padding: 0.6rem 0;
  font-size: 0.9rem;
  color: var(--color-cb-text);
  outline: none;
  font-family: var(--font-sans);
  transition: border-color 0.2s ease;
}

.form-input::placeholder {
  color: var(--color-cb-muted);
}

.form-input:focus {
  border-bottom-color: var(--color-cb-accent);
}

.form-textarea {
  resize: none;
  line-height: 1.6;
}

.submit-btn {
  margin-top: 0.5rem;
  width: 100%;
  padding: 0.85rem;
  border-radius: 10px;
  border: none;
  background-color: var(--color-cb-accent);
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: background-color 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--color-cb-accent-dark);
}

.submit-btn:disabled {
  opacity: 0.85;
  cursor: not-allowed;
}

.success-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.form-error {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #ef4444;
  margin: 0;
}
</style>