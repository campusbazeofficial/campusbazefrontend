<template>
  <div class="min-h-screen bg-cb-base">
    <header class="sticky -top-8 z-10 border-b border-cb-divider bg-cb-base/95 backdrop-blur-sm">
      <div class="mx-auto flex max-w-7xl items-center gap-3  py-3 ">
        <button @click="router.back()" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cb-divider bg-cb-card text-cb-muted transition-colors hover:bg-cb-field hover:text-cb-text">
          <i class="fa-solid fa-arrow-left text-sm"></i>
        </button>
        <div>
          <h1 class="text-base font-bold text-cb-text">Identity Verification</h1>
          <p class="text-[11px] text-cb-muted">Verify your identity to unlock more opportunities</p>
        </div>
      </div>
    </header>
    <div class="mx-auto max-w-7xl  py-5 ">
      <VerificationSection />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import VerificationSection from '@/components/profile/VerificationSection.vue'
const router = useRouter()
</script>