<template>
  <div class="support-home min-h-screen bg-cb-base">
    <!-- ═══════════════════════════════════════════
     HERO — background image with overlay
═══════════════════════════════════════════ -->
    <div
      class="hero relative rounded-lg overflow-hidden"
      :style="{
        // backgroundImage: `url(${heroImage})`,
        backgroundSize: '',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
      }"
    >
      <!-- Dark gradient overlay -->
      <div class="absolute inset-0 bg-cb-accent"></div>

      <!-- Content -->
      <div
        class="hero-content relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 py-10 text-center sm:py-12 lg:flex-row lg:items-center lg:gap-12 lg:py-14 lg:text-left"
      >
        <!-- Avatar + text -->
        <div class="flex flex-col items-center lg:items-start">
          <!-- Avatar -->
          <div
            class="mb-4 h-16 w-16 overflow-hidden rounded-full sm:h-20 sm:w-20"
          >
            <img
              v-if="avatarSrc"
              :src="avatarSrc"
              alt="Profile"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-cb-base/20 text-xl font-bold text-white sm:text-2xl"
            >
              {{ userStore.initials }}
            </div>
          </div>
          <h1 class="text-2xl font-bold text-white sm:text-3xl">
            Hi, {{ firstName }}
            <span class="inline-block wave">
              <!-- <i class="fa-solid fa-hand text-md"></i> -->
            </span>
          </h1>
          <p class="mt-1.5 text-sm text-white/60 sm:text-base">
            How can we help you today?
          </p>
        </div>

        <!-- Desktop: quick stats strip -->
        <div class="mt-6 hidden gap-6 lg:ml-auto lg:flex">
          <div class="text-center">
            <p class="text-2xl font-bold text-white">{{ openTickets }}</p>
            <p class="text-xs text-white/50">Open tickets</p>
          </div>
          <div class="w-px bg-white/10"></div>
          <div class="text-center">
            <p class="text-2xl font-bold text-white">~5 min</p>
            <p class="text-xs text-white/50">Avg response</p>
          </div>
          <div class="w-px bg-white/10"></div>
          <div class="text-center">
            <p class="text-2xl font-bold text-white">24/7</p>
            <p class="text-xs text-white/50">Support</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════
         PAGE BODY
    ═══════════════════════════════════════════ -->
    <div class="mx-auto max-w-4xl px-4 py-6 lg:py-8">
      <!--
        Mobile:  single column, sections stacked
        Desktop: two-column grid — left: actions, right: contact+social
      -->
      <div
        class="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_340px] lg:items-start lg:gap-8"
      >
        <!-- ── LEFT COLUMN ────────────────────── -->
        <div class="space-y-6">
          <!-- Active Request -->
          <section>
            <h2
              class="mb-3 text-xs font-bold uppercase tracking-widest text-cb-muted"
            >
              Active Request
            </h2>
            <div
              class="overflow-hidden rounded-2xl border border-cb-divider bg-cb-card"
            >
              <!-- Report an issue — main CTA -->
              <button
                @click="router.push({ name: 'CreateTicket' })"
                class="group flex w-full items-center gap-4 p-4 text-left transition-all hover:bg-cb-field sm:p-5"
              >
                <div
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cb-warning-subtle"
                >
                  <i class="fa-solid fa-flag text-cb-warning text-base"></i>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-cb-text">
                    Report an issue
                  </p>
                  <p class="text-xs text-cb-muted">
                    Avg response time: ~5 minutes
                  </p>
                </div>
                <i
                  class="fa-solid fa-chevron-right text-[11px] text-cb-muted-40 transition-transform group-hover:translate-x-0.5"
                ></i>
              </button>

              <!-- My tickets shortcut -->
              <div class="border-t border-cb-divider">
                <button
                  @click="router.push({ name: 'Support' })"
                  class="group flex w-full items-center gap-4 p-4 text-left transition-all hover:bg-cb-field sm:p-5"
                >
                  <div
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cb-accent-subtle"
                  >
                    <i class="fa-solid fa-ticket text-cb-accent text-base"></i>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold text-cb-text">My tickets</p>
                    <p class="text-xs text-cb-muted">
                      {{
                        openTickets > 0
                          ? `${openTickets} open ticket${openTickets !== 1 ? "s" : ""}`
                          : "View your ticket history"
                      }}
                    </p>
                  </div>
                  <div class="flex shrink-0 items-center gap-2">
                    <span
                      v-if="openTickets > 0"
                      class="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-cb-accent px-1 text-[10px] font-bold text-cb-contrast"
                    >
                      {{ openTickets }}
                    </span>
                    <i
                      class="fa-solid fa-chevron-right text-[11px] text-cb-muted-40 transition-transform group-hover:translate-x-0.5"
                    ></i>
                  </div>
                </button>
              </div>
            </div>
          </section>

          <!-- FAQ / Common issues — desktop only (extra value on big screens) -->
          <section class="hidden lg:block">
            <h2
              class="mb-3 text-xs font-bold uppercase tracking-widest text-cb-muted"
            >
              Common Issues
            </h2>
            <div
              class="overflow-hidden rounded-2xl border border-cb-divider bg-cb-card"
            >
              <button
                v-for="faq in commonIssues"
                :key="faq.type"
                @click="openIssue(faq)"
                class="group flex w-full items-center gap-4 border-b border-cb-divider p-4 text-left transition-all hover:bg-cb-field last:border-0"
              >
                <div
                  :class="[
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm',
                    faq.iconBg,
                  ]"
                >
                  <i :class="[faq.icon, faq.iconColor]"></i>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-cb-text">
                    {{ faq.label }}
                  </p>
                  <p class="text-xs text-cb-muted">{{ faq.hint }}</p>
                </div>
                <i
                  class="fa-solid fa-chevron-right text-[11px] text-cb-muted-40 transition-transform group-hover:translate-x-0.5"
                ></i>
              </button>
            </div>
          </section>
        </div>

        <!-- ── RIGHT COLUMN ───────────────────── -->
        <div class="space-y-6">
          <!-- Others — contact channels -->
          <section>
            <h2
              class="mb-3 text-xs font-bold uppercase tracking-widest text-cb-muted"
            >
              Others
            </h2>
            <div
              class="overflow-hidden rounded-2xl border border-cb-divider bg-cb-card"
            >
              <!-- Call -->
              <a
                href="tel:+2347015676490"
                class="group flex items-center gap-4 border-b border-cb-divider p-4 transition-all hover:bg-cb-field sm:p-5"
              >
                <div
                  class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cb-accent-subtle"
                >
                  <i class="fa-solid fa-phone text-cb-accent text-base"></i>
                  <span
                    class="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-cb-card bg-cb-positive"
                  ></span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-cb-text">Call us</p>
                  <p class="text-xs text-cb-muted">
                    Avg response time: ~2 minutes
                  </p>
                  <p class="text-xs font-semibold text-cb-accent">
                    +234 701 567 6490
                  </p>
                </div>
                <i
                  class="fa-solid fa-chevron-right text-[11px] text-cb-muted-40 transition-transform group-hover:translate-x-0.5"
                ></i>
              </a>

              <!-- Office address -->
              <a
                href="https://www.google.com/maps/search/?api=1&query=St.+Johns+Hotel+Okpuno"
                target="_blank"
                rel="noopener noreferrer"
                class="group flex items-center gap-4 border-b border-cb-divider p-4 transition-all hover:bg-cb-field sm:p-5"
              >
                <div
                  class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cb-warning-subtle"
                >
                  <i
                    class="fa-solid fa-location-dot text-cb-warning text-base"
                  ></i>
                  <span
                    class="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-cb-card bg-cb-warning"
                  ></span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-cb-text">
                    Office address
                  </p>
                  <p class="text-xs text-cb-muted leading-relaxed">
                    (1st floor left,) after St. Johns Hotel nodu Okpuno
                  </p>
                </div>
                <i
                  class="fa-solid fa-chevron-right text-[11px] text-cb-muted-40 transition-transform group-hover:translate-x-0.5"
                ></i>
              </a>
              <!-- Email -->
              <a
                href="mailto:campusbazeofficial@gmail.com"
                class="group flex items-center gap-4 p-4 transition-all hover:bg-cb-field sm:p-5"
              >
                <div
                  class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cb-accent-subtle"
                >
                  <i class="fa-solid fa-envelope text-cb-accent text-base"></i>
                  <span
                    class="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-cb-card bg-cb-warning"
                  ></span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-cb-text">
                    Email address
                  </p>
                  <p class="text-xs text-cb-muted">
                    Avg response time: ~12 hours
                  </p>
                  <p class="text-xs font-semibold text-cb-accent">
                    Campus Bazeofficial@gmail.com
                  </p>
                </div>
                <i
                  class="fa-solid fa-chevron-right text-[11px] text-cb-muted-40 transition-transform group-hover:translate-x-0.5"
                ></i>
              </a>
            </div>
          </section>

          <!-- Social media -->
          <section>
            <div
              class="rounded-2xl border border-cb-divider bg-cb-card px-4 py-5 text-center sm:px-6"
            >
              <p class="mb-0.5 text-sm font-bold text-cb-text">
                Our Social Media Handles
              </p>
              <p class="mb-4 text-xs text-cb-muted">You can reach us here</p>
              <div class="grid grid-cols-3 gap-3">
                <a
                  v-for="social in socials"
                  :key="social.label"
                  :href="social.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  :title="social.label"
                  class="flex flex-col items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-field p-3 transition-all hover:border-cb-accent hover:bg-cb-accent-subtle hover:text-cb-accent"
                >
                  <i
                    :class="[
                      social.icon,
                      'text-xl text-cb-muted group-hover:text-cb-accent',
                    ]"
                  ></i>
                  <span class="text-xs text-cb-muted">{{ social.label }}</span>
                </a>
              </div>
            </div>
          </section>

          <!-- Mobile: common issues (shown below social on mobile) -->
          <section class="lg:hidden">
            <h2
              class="mb-3 text-xs font-bold uppercase tracking-widest text-cb-muted"
            >
              Common Issues
            </h2>
            <div
              class="overflow-hidden rounded-2xl border border-cb-divider bg-cb-card"
            >
              <button
                v-for="faq in commonIssues"
                :key="faq.type"
                @click="openIssue(faq)"
                class="group flex w-full items-center gap-4 border-b border-cb-divider p-4 text-left transition-all hover:bg-cb-field last:border-0"
              >
                <div
                  :class="[
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm',
                    faq.iconBg,
                  ]"
                >
                  <i :class="[faq.icon, faq.iconColor]"></i>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-cb-text">
                    {{ faq.label }}
                  </p>
                  <p class="text-xs text-cb-muted">{{ faq.hint }}</p>
                </div>
                <i
                  class="fa-solid fa-chevron-right text-[11px] text-cb-muted-40 transition-transform group-hover:translate-x-0.5"
                ></i>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/userStore";
import { useSupportStore } from "@/stores/supportStore";

import heroImage from "@/assets/img/cbz_coin.png";

const router = useRouter();
const userStore = useUserStore();
const supportStore = useSupportStore();

// ── User info ──────────────────────────────────────────────────
const firstName = computed(
  () =>
    userStore.user?.firstName ||
    userStore.user?.displayName?.split(" ")[0] ||
    "there",
);

// Matches Header.vue — avatar can be a plain string or { url: string }
const avatarSrc = computed(() => {
  const a = userStore.user?.avatar;
  if (!a) return null;
  return typeof a === "string" ? a : a?.url || null;
});

const openTickets = computed(
  () =>
    supportStore.tickets.filter((t) => ["open", "in_review"].includes(t.status))
      .length,
);

// ── Common issues — quick-launch into create ticket with pre-selection ──
const commonIssues = [
  {
    category: "payment",
    type: "payment_failed",
    label: "Payment failed",
    hint: "Issues with payments or charges",
    icon: "fa-solid fa-credit-card",
    iconBg: "bg-cb-negative-subtle",
    iconColor: "text-cb-negative",
  },
  {
    category: "payment",
    type: "withdrawal_issue",
    label: "Withdrawal problem",
    hint: "Funds not received or pending",
    icon: "fa-solid fa-sack-dollar",
    iconBg: "bg-cb-warning-subtle",
    iconColor: "text-cb-warning",
  },
  {
    category: "errand",
    type: "runner_no_show",
    label: "Runner didn't show up",
    hint: "Runner accepted but never arrived",
    icon: "fa-solid fa-person-running",
    iconBg: "bg-cb-accent-subtle",
    iconColor: "text-cb-accent",
  },
  {
    category: "account",
    type: "login_problem",
    label: "Can't log in",
    hint: "Password or access issues",
    icon: "fa-solid fa-lock",
    iconBg: "bg-cb-field",
    iconColor: "text-cb-muted",
  },
  {
    category: "order",
    type: "order_not_delivered",
    label: "Order not delivered",
    hint: "Service order overdue or not received",
    icon: "fa-solid fa-box-open",
    iconBg: "bg-cb-accent-subtle",
    iconColor: "text-cb-accent",
  },
];

function openIssue(faq) {
  // Navigate to create ticket and pass the pre-selection via query params
  // CreateTicketPage will read these to jump to the right step
  router.push({
    name: "CreateTicket",
    query: { category: faq.category, type: faq.type },
  });
}

// ── Social links ───────────────────────────────────────────────
const socials = [
  {
    label: "X (Twitter)",
    icon: "fa-brands fa-x-twitter",
    href: "https://x.com/i/status/2043001280365310172",
  },
  {
    label: "Facebook",
    icon: "fa-brands fa-facebook-f",
    href: "https://www.facebook.com/61555774271352/posts/122111110616192475/?app=fbl",
  },
  {
    label: "Instagram",
    icon: "fa-brands fa-instagram",
    href: "https://www.instagram.com/campus_baze?igsh=MXFrNm1vMHR4c2I5Zg==",
  },
  {
    label: "WhatsApp",
    icon: "fa-brands fa-whatsapp",
    href: "https://chat.whatsapp.com/HdwfFSzVQu69DAH8UPweJT?mode=hqctcla",
  },
  {
    label: "TikTok",
    icon: "fa-brands fa-tiktok",
    href: "https://www.tiktok.com/@campusbaze?_r=1&_t=ZS-96AUORqfjuu",
  },
  {
    label: "Telegram",
    icon: "fa-brands fa-telegram",
    href: "https://t.me/campusbazers1",
  },
];

onMounted(() => {
  // Pre-load tickets so the badge count is live
  if (!supportStore.tickets.length) supportStore.fetchMyTickets();
});
</script>

<style scoped>
/* ── Hero ────────────────────────────────────────────────── */
.hero {
  min-height: 300px;
}
@media (min-width: 1024px) {
  .hero {
    min-height: 400px;
  }
}

/* ── Wave emoji animation ────────────────────────────────── */
@keyframes wave {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(20deg);
  }
  75% {
    transform: rotate(-10deg);
  }
}
.wave {
  display: inline-block;
  animation: wave 1.8s ease-in-out 0.5s 2;
  transform-origin: 70% 70%;
}
</style>
