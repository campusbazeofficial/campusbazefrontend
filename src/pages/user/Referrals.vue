<!-- src/pages/user/ReferralPage.vue -->
<template>
  <div class="min-h-screen bg-cb-base">

    <!-- ── Page header ── -->
    <div class="bg-cb-card">
      <div class="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cb-accent-subtle">
            <i class="fa-solid fa-gift text-cb-accent"></i>
          </div>
          <div>
            <h1 class="text-xl font-bold text-cb-text sm:text-2xl">Refer &amp; Earn</h1>
            <p class="text-xs text-cb-muted sm:text-sm">Share your link and earn rewards when friends join.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl py-6 flex flex-col gap-4">

      <!-- ── Loading skeleton ── -->
      <template v-if="referralLoading">
        <div class="rounded-2xl bg-cb-card border border-cb-divider p-6 flex flex-col gap-4">
          <div class="h-5 w-32 animate-pulse rounded-lg bg-cb-field"></div>
          <div class="h-14 w-full animate-pulse rounded-xl bg-cb-field"></div>
          <div class="flex gap-3">
            <div class="h-10 flex-1 animate-pulse rounded-xl bg-cb-field"></div>
            <div class="h-10 w-24 animate-pulse rounded-xl bg-cb-field"></div>
          </div>
        </div>
        <div class="rounded-2xl bg-cb-card border border-cb-divider p-6">
          <div class="mx-auto h-48 w-48 animate-pulse rounded-2xl bg-cb-field"></div>
        </div>
      </template>

      <!-- ── Error state ── -->
      <div
        v-else-if="error && !referralCode"
        class="rounded-2xl bg-cb-card border border-cb-divider p-10 flex flex-col items-center gap-4 text-center"
      >
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-cb-negative-subtle">
          <i class="fa-solid fa-circle-exclamation text-2xl text-cb-negative"></i>
        </div>
        <div>
          <p class="text-sm font-semibold text-cb-text">Failed to load referral info</p>
          <p class="mt-1 text-xs text-cb-muted">{{ error }}</p>
        </div>
        <button
          @click="load"
          class="inline-flex items-center gap-2 rounded-xl bg-cb-accent px-5 py-2.5 text-sm font-semibold text-cb-contrast hover:bg-cb-accent-dark transition-colors"
        >
          <i class="fa-solid fa-rotate-right text-xs"></i> Try again
        </button>
      </div>

      <template v-else-if="referralCode">

        <!-- ── Hero: code + share link ── -->
        <div class="rounded-2xl border border-cb-divider bg-cb-card overflow-hidden">
          <div class="p-5 sm:p-6 flex flex-col gap-5">

            <!-- Code block -->
            <div class="flex flex-col gap-2">
              <p class="text-[10px] font-bold uppercase tracking-widest text-cb-muted">Your referral code</p>
              <div class="flex items-center gap-3 flex-wrap">
                <span class="font-mono text-3xl sm:text-4xl font-extrabold tracking-[0.18em] text-cb-text leading-none">
                  {{ referralCode }}
                </span>
                <button
                  @click="copyCode"
                  :class="[
                    'inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all',
                    codeCopied
                      ? 'border-cb-positive bg-cb-positive/10 text-cb-positive'
                      : 'border-cb-accent/50 text-cb-accent hover:bg-cb-accent hover:text-cb-contrast'
                  ]"
                >
                  <i :class="codeCopied ? 'fa-solid fa-check' : 'fa-regular fa-copy'"></i>
                  {{ codeCopied ? 'Copied!' : 'Copy code' }}
                </button>
              </div>
            </div>

            <!-- Divider -->
            <div class="h-px bg-cb-divider"></div>

            <!-- Link row -->
            <div class="flex flex-col gap-2">
              <p class="text-[10px] font-bold uppercase tracking-widest text-cb-muted">Referral link</p>
              <div class="flex items-stretch gap-2">
                <div class="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-cb-divider bg-cb-field px-3 py-2.5">
                  <i class="fa-solid fa-link text-cb-muted text-xs shrink-0"></i>
                  <span class="truncate font-mono text-xs text-cb-muted select-all">{{ referralLink }}</span>
                </div>
                <button
                  @click="copyLink"
                  :class="[
                    'shrink-0 flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all',
                    linkCopied
                      ? 'border-cb-accent bg-cb-accent-subtle text-cb-accent'
                      : 'border-cb-divider bg-cb-base text-cb-muted hover:border-cb-accent hover:text-cb-accent'
                  ]"
                >
                  <i :class="linkCopied ? 'fa-solid fa-check' : 'fa-solid fa-copy'"></i>
                  {{ linkCopied ? 'Copied!' : 'Copy' }}
                </button>
              </div>
            </div>

            <!-- Share buttons -->
            <div class="flex flex-wrap gap-2">
              <button @click="shareWhatsApp" class="share-btn whatsapp">
                <i class="fa-brands fa-whatsapp"></i>
                WhatsApp
              </button>
              <button @click="shareTwitter" class="share-btn twitter">
                <i class="fa-brands fa-x-twitter"></i>
                X / Twitter
              </button>
              <button @click="shareTelegram" class="share-btn telegram">
                <i class="fa-brands fa-telegram"></i>
                Telegram
              </button>
              <button v-if="canNativeShare" @click="nativeShare" class="share-btn native">
                <i class="fa-solid fa-share-nodes"></i>
                More
              </button>
            </div>
          </div>
        </div>

        <!-- ── Bottom row: QR + How it works ── -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <!-- QR Code -->
          <div class="rounded-2xl bg-cb-card border border-cb-divider p-5 flex flex-col items-center gap-4">
            <div class="w-full flex items-center gap-2">
              <i class="fa-solid fa-qrcode text-cb-accent text-sm"></i>
              <h2 class="text-sm font-bold text-cb-text">QR Code</h2>
            </div>
            <p class="w-full text-xs text-cb-muted -mt-2">Let someone scan to sign up with your referral.</p>

            <div class="rounded-2xl border border-cb-divider bg-cb-field p-4 shadow-sm">
              <img
                :src="referralQrCode"
                alt="Referral QR code"
                class="block w-40 h-40 image-rendering-pixelated"
              />
            </div>

            <button
              @click="downloadQr"
              class="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-cb-divider bg-cb-base px-4 py-2.5 text-xs font-semibold text-cb-muted transition-colors hover:border-cb-accent hover:text-cb-accent"
            >
              <i class="fa-solid fa-download text-[10px]"></i>
              Download QR Code
            </button>
          </div>

          <!-- How it works -->
          <div class="rounded-2xl bg-cb-card border border-cb-divider p-5 flex flex-col gap-4">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-circle-info text-cb-accent text-sm"></i>
              <h2 class="text-sm font-bold text-cb-text">How it works</h2>
            </div>

            <ol class="flex flex-col gap-4">
              <li v-for="(step, i) in steps" :key="i" class="flex items-start gap-3">
                <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cb-accent-subtle text-[11px] font-extrabold text-cb-accent mt-0.5">
                  {{ i + 1 }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-cb-text leading-snug">{{ step.title }}</p>
                  <p class="mt-1 text-xs leading-relaxed text-cb-muted">{{ step.desc }}</p>
                </div>
              </li>
            </ol>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

// ── Mirror the same computed pattern used in ProfilePage ──────────────
// storeToRefs was missing the user.referralCode fallback, which caused
// the page to stay blank when the store's top-level ref hadn't been
// seeded yet (e.g. navigating directly to /user/referral before
// fetchMe has run).
const user          = computed(() => userStore.user)
const referralCode  = computed(() => userStore.referralCode  || user.value?.referralCode || '')
const referralLink  = computed(() => userStore.referralLink  || '')
const referralQrCode = computed(() => userStore.referralQrCode || '')
const referralLoading = computed(() => userStore.referralLoading)
const error         = computed(() => userStore.error)

const codeCopied = ref(false)
const linkCopied = ref(false)

const canNativeShare = computed(() => !!navigator.share)

const steps = [
  {
    title: 'Share your link or code',
    desc: 'Send your unique referral link to friends or let them scan your QR code.',
  },
  {
    title: 'Friend signs up',
    desc: 'They create an account using your link and the referral is automatically tracked.',
  },
  {
    title: 'Both of you benefit',
    desc: 'Earn rewards when your referred friends complete their first activity on the platform.',
  },
]

async function load() {
  // Ensure user is loaded first so the referralCode fallback
  // (user.value?.referralCode) is available even if fetchReferralInfo
  // hasn't returned yet — same order as ProfilePage.
  if (!user.value) {
    await userStore.fetchMe()
  }
  try {
    await userStore.fetchReferralInfo()
  } catch { }
}

function flashCopy(flag) {
  flag.value = true
  setTimeout(() => { flag.value = false }, 2500)
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(referralCode.value)
    flashCopy(codeCopied)
  } catch { }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(referralLink.value)
    flashCopy(linkCopied)
  } catch { }
}

function shareWhatsApp() {
  const text = encodeURIComponent(`Join me on CampusBaze! Sign up with my referral link: ${referralLink.value}`)
  window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener')
}

function shareTwitter() {
  const text = encodeURIComponent(`Join me on CampusBaze 🎓 Sign up with my link and let's get things done together:\n${referralLink.value}`)
  window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener')
}

function shareTelegram() {
  const text = encodeURIComponent(`Join CampusBaze with my referral link: ${referralLink.value}`)
  window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink.value)}&text=${text}`, '_blank', 'noopener')
}

async function nativeShare() {
  try {
    await navigator.share({
      title: 'Join me on CampusBaze',
      text: 'Sign up using my referral link!',
      url: referralLink.value,
    })
  } catch { }
}

function downloadQr() {
  if (!referralQrCode.value) return
  const a = document.createElement('a')
  a.href = referralQrCode.value
  a.download = `campusbaze-referral-${referralCode.value}.png`
  a.click()
}

onMounted(load)
</script>

<style scoped>
.share-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.875rem;
  border-radius: 10px;
  border: 1px solid var(--color-cb-divider);
  background: var(--color-cb-base);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--color-cb-muted);
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.share-btn.whatsapp:hover  { border-color: #25D366; color: #25D366; background: color-mix(in srgb, #25D366 8%, transparent); }
.share-btn.twitter:hover   { border-color: #000;    color: #000;    background: color-mix(in srgb, #000 6%, transparent); }
.share-btn.telegram:hover  { border-color: #229ED9; color: #229ED9; background: color-mix(in srgb, #229ED9 8%, transparent); }
.share-btn.native:hover    { border-color: var(--color-cb-accent); color: var(--color-cb-accent); background: var(--color-cb-accent-subtle); }

.image-rendering-pixelated { image-rendering: pixelated; }
</style>