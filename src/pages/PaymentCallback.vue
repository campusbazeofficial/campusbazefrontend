<template>
  <div class="flex min-h-screen items-center justify-center bg-cb-base px-4">
    <div class="w-full max-w-sm rounded-2xl border border-cb-divider bg-cb-card p-8 text-center">

      <!-- Loading state -->
      <template v-if="verifying">
        <div class="mb-5 flex justify-center">
          <svg class="h-12 w-12 animate-spin text-cb-accent" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <h2 class="text-lg font-bold text-cb-text mb-2">Verifying payment…</h2>
        <p class="text-sm text-cb-muted">Please wait while we confirm your transaction.</p>
      </template>

      <!-- Success state -->
      <template v-else-if="result === 'success'">
        <div class="mb-5 flex justify-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-cb-positive/15 text-4xl">✅</div>
        </div>
        <h2 class="text-xl font-bold text-cb-text mb-2">Payment confirmed!</h2>
        <p class="text-sm text-cb-muted mb-1">
          <span class="font-bold text-cb-text">{{ verifyData?.cbcAmount }} CBC</span> will be credited to your wallet shortly.
        </p>
        <p class="text-xs text-cb-muted mb-6">Ref: {{ verifyData?.reference }}</p>
        <button
          class="w-full rounded-xl bg-cb-accent py-3 text-sm font-bold text-white hover:brightness-110 transition-all"
          @click="goToWallet"
        >
          Go to Wallet
        </button>
      </template>

      <!-- Error state -->
      <template v-else-if="result === 'error'">
        <div class="mb-5 flex justify-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-cb-negative-subtle text-4xl">❌</div>
        </div>
        <h2 class="text-xl font-bold text-cb-text mb-2">Verification failed</h2>
        <p class="text-sm text-cb-muted mb-6">
          {{ errorMessage || "We couldn't verify your payment. Please contact support if your money was debited." }}
        </p>
        <div class="flex gap-3">
          <button
            class="flex-1 rounded-xl border border-cb-divider py-3 text-sm font-semibold text-cb-muted hover:text-cb-text transition-colors"
            @click="goToWallet"
          >
            Back to Wallet
          </button>
          <button
            class="flex-1 rounded-xl bg-cb-accent py-3 text-sm font-bold text-white hover:brightness-110 transition-all"
            @click="retry"
          >
            Retry
          </button>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useWalletStore } from "@/stores/walletStore";
import { useToast } from "@/composables/useToast";

const route = useRoute();
const router = useRouter();
const walletStore = useWalletStore();
const toast = useToast();

const verifying = ref(true);
const result = ref(null); // 'success' | 'error'
const verifyData = ref(null);
const errorMessage = ref("");

async function verify() {
  const reference = route.query.reference || route.query.trxref;
  if (!reference) {
    result.value = "error";
    errorMessage.value = "No payment reference found in URL.";
    verifying.value = false;
    return;
  }

  verifying.value = true;
  try {
    const res = await walletStore.verifyPurchase(reference);
    verifyData.value = res?.data || {};
    result.value = "success";
    toast.success("CBC purchase verified successfully!");
  } catch (err) {
    result.value = "error";
    errorMessage.value = err?.response?.data?.message || "Verification failed";
  } finally {
    verifying.value = false;
  }
}

function goToWallet() {
  router.push({ name: "Wallet" });
}

function retry() {
  verify();
}

onMounted(verify);
</script>