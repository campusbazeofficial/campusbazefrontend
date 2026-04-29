<template>
  <div
    class="w-full max-w-sm overflow-hidden rounded-t-3xl bg-cb-card sm:rounded-2xl"
    @click.stop
  >
    <!-- accent stripe -->
    <div class="h-0.5 w-full bg-gradient-to-r from-cb-accent via-cb-accent/60 to-transparent" />

    <div class="p-6 space-y-5">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-cb-accent/12 text-cb-accent">
            <i class="fa-solid fa-coins fa-lg" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-cb-text leading-tight">Buy CBC</h2>
            <p class="text-xs text-cb-muted">₦10 per CBC token</p>
          </div>
        </div>
        <button
          class="flex h-8 w-8 items-center justify-center rounded-xl text-cb-muted hover:text-cb-text hover:bg-cb-field transition-colors"
          @click="$emit('cancel')"
        >
          <i class="fa-solid fa-xmark" />
        </button>
      </div>

      <!-- Quick amounts -->
      <div>
        <p class="mb-2.5 text-xs font-semibold text-cb-muted uppercase tracking-wider">Quick select</p>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="preset in presets"
            :key="preset"
            class="rounded-xl border py-2.5 text-sm font-bold transition-all duration-150"
            :class="cbcAmount === preset
              ? 'border-cb-accent bg-cb-accent/10 text-cb-accent shadow-[0_0_0_1px_var(--color-cb-accent)]'
              : 'border-cb-divider bg-cb-field text-cb-muted hover:border-cb-accent/40 hover:text-cb-text'"
            @click="cbcAmount = preset; localError = ''"
          >
            {{ preset }}
          </button>
        </div>
      </div>

      <!-- Custom input -->
      <div>
        <p class="mb-2 text-xs font-semibold text-cb-muted uppercase tracking-wider">Or enter amount</p>
        <div class="relative">
          <input
            v-model.number="cbcAmount"
            type="number"
            min="10"
            step="10"
            placeholder="e.g. 250"
            class="w-full rounded-xl border border-cb-divider bg-cb-field px-4 py-3 text-cb-text placeholder-cb-muted/40 focus:border-cb-accent focus:outline-none focus:ring-1 focus:ring-cb-accent/30 text-sm transition-colors"
            @input="localError = ''"
          />
          <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-cb-muted pointer-events-none">CBC</span>
        </div>
      </div>

      <!-- Price preview -->
      <div class="rounded-xl border border-cb-divider bg-cb-field px-4 py-3.5 flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm text-cb-muted">
          <i class="fa-solid fa-tag text-xs" />
          You pay
        </div>
        <span class="text-xl font-bold text-cb-text tabular-nums">
          {{ cbcAmount ? `₦${(cbcAmount * 10).toLocaleString()}` : '—' }}
        </span>
      </div>

      <!-- Info note -->
      <div class="flex items-start gap-2.5 rounded-xl bg-cb-field px-4 py-3">
        <i class="fa-solid fa-circle-info text-xs text-cb-muted mt-0.5 shrink-0" />
        <p class="text-xs text-cb-muted leading-relaxed">
          You'll be redirected to Paystack to complete payment. CBC will be credited once confirmed.
        </p>
      </div>

      <!-- Error -->
      <div v-if="localError" class="flex items-center gap-2 rounded-xl bg-cb-negative/8 px-4 py-2.5">
        <i class="fa-solid fa-circle-exclamation text-xs text-cb-negative shrink-0" />
        <p class="text-xs text-cb-negative">{{ localError }}</p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 pt-1">
        <button
          class="flex-1 rounded-xl border border-cb-divider py-3 text-sm font-semibold text-cb-muted hover:text-cb-text hover:border-cb-divider/80 transition-colors"
          :disabled="loading"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button
          class="flex-1 rounded-xl bg-cb-accent py-3 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          :disabled="loading || !isValid"
          @click="submit"
        >
          <i v-if="loading" class="fa-solid fa-spinner fa-spin" />
          <i v-else class="fa-brands fa-paystack" />
          {{ loading ? 'Redirecting…' : 'Pay with Paystack' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["confirm", "cancel"]);

const presets = [50, 100, 200, 500];
const cbcAmount = ref(100);
const localError = ref("");

const isValid = computed(() => cbcAmount.value && cbcAmount.value >= 10);

function submit() {
  localError.value = "";
  if (!cbcAmount.value || cbcAmount.value < 10) {
    localError.value = "Minimum purchase is 10 CBC (₦100)";
    return;
  }
  emit("confirm", cbcAmount.value);
}
</script>

