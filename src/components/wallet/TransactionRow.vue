<template>
  <div class="wallet-tx-row flex items-center gap-4 px-5 py-4 border-b border-cb-divider last:border-0 hover:bg-cb-field/30 transition-all duration-150 cursor-default">
    <!-- Icon bubble -->
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm"
      :class="iconBg"
    >
      <i :class="[txIcon, iconColor]" class="fa-fw" />
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-cb-text truncate leading-tight">
        {{ store.formatTransactionType(transaction.type) }}
      </p>
      <p class="text-xs text-cb-muted truncate mt-0.5">
        {{ transaction.note || store.formatDate(transaction.createdAt) }}
      </p>
      <p v-if="transaction.note" class="text-xs text-cb-muted/50 mt-0.5">
        {{ store.formatDate(transaction.createdAt) }}
      </p>
    </div>

    <!-- Amount + balance -->
    <div class="shrink-0 text-right">
      <p class="text-sm font-bold tabular-nums" :class="amountClass">
        {{ transaction.direction === 'credit' ? '+' : '−' }}{{ transaction.amount.toLocaleString() }}
        <span class="text-xs font-normal text-cb-muted/70 ml-0.5">{{ currency }}</span>
      </p>
      <p v-if="showBalance && transaction.balanceAfter !== undefined" class="text-xs text-cb-muted mt-0.5 tabular-nums">
        {{ transaction.balanceAfter.toLocaleString() }} {{ currency }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  transaction: { type: Object, required: true },
  store: { type: Object, required: true },
  showBalance: { type: Boolean, default: false },
});

const currency = computed(() =>
  props.transaction.metadata?.currency === "NGN" ? "NGN" : "CBC"
);

const txIcon = computed(() => {
  const map = {
    welcome_bonus:        "fa-solid fa-gift",
    earning_held:         "fa-solid fa-clock",
    earning_released:     "fa-solid fa-circle-check",
    debit_errand_post:    "fa-solid fa-file-pen",
    debit_service_order:  "fa-solid fa-handshake",
    purchase:             "fa-solid fa-coins",
    withdrawal:           "fa-solid fa-building-columns",
    refund:               "fa-solid fa-rotate-left",
  };
  return map[props.transaction.type] || "fa-solid fa-credit-card";
});

const iconBg = computed(() =>
  props.transaction.direction === "credit"
    ? "bg-cb-positive/10"
    : "bg-cb-negative/10"
);

const iconColor = computed(() =>
  props.transaction.direction === "credit"
    ? "text-cb-positive"
    : "text-cb-negative"
);

const amountClass = computed(() =>
  props.transaction.direction === "credit" ? "text-cb-positive" : "text-cb-negative"
);
</script>