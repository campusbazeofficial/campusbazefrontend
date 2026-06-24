<template>
  <div
    class="w-full max-w-md overflow-hidden rounded-t-3xl bg-cb-card sm:rounded-2xl max-h-[95vh] flex flex-col"
    @click.stop
  >
    <!-- accent stripe -->
    <div class="h-0.5 w-full bg-linear-to-r from-cb-accent via-cb-accent/60 to-transparent shrink-0" />

    <!-- Scrollable body -->
    <div class="overflow-y-auto flex-1">
      <div class="p-6 space-y-5">

        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-cb-accent/12 text-cb-accent">
              <i class="fa-solid fa-building-columns fa-lg" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-cb-text leading-tight">Withdraw Funds</h2>
              <p class="text-xs text-cb-muted">
                Available:
                <span class="font-semibold text-cb-accent">₦{{ ngnBalance.toLocaleString() }}</span>
              </p>
            </div>
          </div>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-xl text-cb-muted hover:text-cb-text hover:bg-cb-field transition-colors"
            @click="$emit('cancel')"
          >
            <i class="fa-solid fa-xmark" />
          </button>
        </div>

        <!-- Amount -->
        <div>
          <label class="mb-2 flex items-center gap-1.5 text-xs font-semibold text-cb-muted uppercase tracking-wider">
            <i class="fa-solid fa-naira-sign text-cb-muted/70" />
            Amount (NGN)
          </label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-cb-muted pointer-events-none">₦</span>
            <input
              v-model.number="form.amountNGN"
              type="number"
              min="500"
              :max="ngnBalance"
              placeholder="0"
              class="w-full rounded-xl border border-cb-divider bg-cb-field pl-8 pr-4 py-3 text-cb-text placeholder-cb-muted/40 focus:border-cb-accent focus:outline-none focus:ring-1 focus:ring-cb-accent/30 text-sm transition-colors font-mono"
            />
          </div>
          <p class="mt-1.5 text-xs text-cb-muted">Minimum withdrawal: ₦500</p>
        </div>

        <!-- Bank selector — custom dropdown -->
        <div>
          <label class="mb-2 flex items-center gap-1.5 text-xs font-semibold text-cb-muted uppercase tracking-wider">
            <i class="fa-solid fa-landmark text-cb-muted/70" />
            Bank
          </label>

          <!-- Search/trigger -->
          <div class="relative">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-cb-muted pointer-events-none" />
            <input
              v-model="bankSearch"
              type="text"
              placeholder="Search banks…"
              class="w-full rounded-xl border border-cb-divider bg-cb-field pl-9 pr-9 py-3 text-cb-text placeholder-cb-muted/40 focus:border-cb-accent focus:outline-none focus:ring-1 focus:ring-cb-accent/30 text-sm transition-colors"
              @focus="showBankDropdown = true"
            />
            <button
              v-if="selectedBank"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-cb-muted hover:text-cb-text transition-colors"
              @click.stop="clearBank"
            >
              <i class="fa-solid fa-circle-xmark text-xs" />
            </button>
            <i v-else class="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-cb-muted pointer-events-none" />
          </div>

          <!-- Dropdown list -->
          <Transition name="dropdown">
            <div
              v-if="showBankDropdown && (filteredBanks.length || banksLoading)"
              class="mt-1.5 max-h-44 overflow-y-auto rounded-xl border border-cb-divider bg-cb-card shadow-xl shadow-black/10 z-10 relative"
            >
              <div v-if="banksLoading" class="flex items-center gap-2.5 px-4 py-3 text-sm text-cb-muted">
                <i class="fa-solid fa-spinner fa-spin text-xs" />
                Loading banks…
              </div>
              <button
                v-for="bank in filteredBanks.slice(0, 30)"
                :key="bank.code"
                class="flex w-full items-center justify-between px-4 py-2.5 text-sm text-cb-text hover:bg-cb-field transition-colors text-left group"
                @click="selectBank(bank)"
              >
                <span class="font-medium group-hover:text-cb-accent transition-colors">{{ bank.name }}</span>
                <span class="text-xs text-cb-muted ml-2 shrink-0 font-mono">{{ bank.code }}</span>
              </button>
            </div>
          </Transition>

          <!-- Selected bank pill -->
          <Transition name="fade">
            <div v-if="selectedBank && !showBankDropdown" class="mt-2 flex items-center gap-2">
              <div class="flex-1 flex items-center gap-2.5 rounded-xl border border-cb-accent/25 bg-cb-accent/8 px-4 py-2">
                <i class="fa-solid fa-circle-check text-xs text-cb-accent shrink-0" />
                <span class="text-sm font-medium text-cb-accent truncate">{{ selectedBank.name }}</span>
              </div>
              <button
                class="flex h-9 w-9 items-center justify-center rounded-xl border border-cb-divider text-cb-muted hover:text-cb-text transition-colors"
                @click="clearBank"
              >
                <i class="fa-solid fa-pen text-xs" />
              </button>
            </div>
          </Transition>
        </div>

        <!-- Account number -->
        <div>
          <label class="mb-2 flex items-center gap-1.5 text-xs font-semibold text-cb-muted uppercase tracking-wider">
            <i class="fa-solid fa-hashtag text-cb-muted/70" />
            Account Number
          </label>
          <input
            v-model="form.accountNumber"
            type="text"
            maxlength="10"
            placeholder="10-digit account number"
            class="w-full rounded-xl border border-cb-divider bg-cb-field px-4 py-3 text-cb-text placeholder-cb-muted/40 focus:border-cb-accent focus:outline-none focus:ring-1 focus:ring-cb-accent/30 text-sm font-mono tracking-widest transition-colors"
          />
        </div>

        <!-- Account name -->
        <div>
          <label class="mb-2 flex items-center gap-1.5 text-xs font-semibold text-cb-muted uppercase tracking-wider">
            <i class="fa-solid fa-user text-cb-muted/70" />
            Account Name
          </label>
          <input
            v-model="form.accountName"
            type="text"
            placeholder="As it appears on your bank account"
            class="w-full rounded-xl border border-cb-divider bg-cb-field px-4 py-3 text-cb-text placeholder-cb-muted/40 focus:border-cb-accent focus:outline-none focus:ring-1 focus:ring-cb-accent/30 text-sm transition-colors"
          />
        </div>

        <!-- Summary card -->
        <Transition name="fade">
          <div v-if="isValid" class="rounded-xl border border-cb-divider bg-cb-field divide-y divide-cb-divider overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-xs text-cb-muted">Withdrawing</span>
              <span class="text-sm font-bold text-cb-text tabular-nums">₦{{ form.amountNGN?.toLocaleString() }}</span>
            </div>
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-xs text-cb-muted">To bank</span>
              <span class="text-sm font-bold text-cb-text truncate ml-4">{{ selectedBank?.name }}</span>
            </div>
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-xs text-cb-muted">Account</span>
              <span class="text-sm font-mono font-bold text-cb-text">{{ form.accountNumber }}</span>
            </div>
          </div>
        </Transition>

        <!-- Error -->
        <div v-if="localError" class="flex items-center gap-2.5 rounded-xl bg-cb-negative/8 px-4 py-3">
          <i class="fa-solid fa-circle-exclamation text-xs text-cb-negative shrink-0" />
          <p class="text-xs text-cb-negative">{{ localError }}</p>
        </div>

        <!-- Warning note -->
        <div class="flex items-start gap-2.5 rounded-xl bg-cb-warning-subtle border border-cb-warning/20 px-4 py-3">
          <!-- <i class="fa-solid fa-triangle-exclamation text-xs text-cb-warning mt-0.5 shrink-0" /> -->
          <p class="text-xs text-cb-muted leading-relaxed">
          Your earnings are debited immediately and held before the transfer is sent (up to 2 hours for verified and subscribed members; up to 24 hours for non-verified). You can cancel anytime during the hold period for an instant refund. Withdrawals are blocked while you have an active dispute.
          </p>
        </div>
      </div>
    </div>

    <!-- Sticky footer -->
    <div class="shrink-0 border-t border-cb-divider px-6 py-4 flex gap-3 bg-cb-card">
      <button
        class="flex-1 rounded-xl border border-cb-divider py-3 text-sm font-semibold text-cb-muted hover:text-cb-text transition-colors"
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
        <i v-else class="fa-solid fa-paper-plane" />
        {{ loading ? 'Processing…' : 'Withdraw Funds' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";

const props = defineProps({
  loading: { type: Boolean, default: false },
  ngnBalance: { type: Number, default: 0 },
  banks: { type: Array, default: () => [] },
  banksLoading: { type: Boolean, default: false },
});

const emit = defineEmits(["confirm", "cancel"]);

const form = reactive({
  amountNGN: null,
  accountNumber: "",
  accountName: "",
});

const bankSearch = ref("");
const selectedBank = ref(null);
const showBankDropdown = ref(false);
const localError = ref("");

const filteredBanks = computed(() => {
  if (!bankSearch.value) return props.banks;
  const q = bankSearch.value.toLowerCase();
  return props.banks.filter(
    (b) => b.name.toLowerCase().includes(q) || b.code.includes(bankSearch.value)
  );
});

const isValid = computed(() => {
  return (
    form.amountNGN >= 500 &&
    form.amountNGN <= props.ngnBalance &&
    selectedBank.value &&
    form.accountNumber.length >= 10 &&
    form.accountName.trim().length > 2
  );
});

function selectBank(bank) {
  selectedBank.value = bank;
  bankSearch.value = bank.name;
  showBankDropdown.value = false;
}

function clearBank() {
  selectedBank.value = null;
  bankSearch.value = "";
  showBankDropdown.value = true;
}

function submit() {
  localError.value = "";
  if (!form.amountNGN || form.amountNGN < 500) {
    localError.value = "Minimum withdrawal is ₦500";
    return;
  }
  if (form.amountNGN > props.ngnBalance) {
    localError.value = "Amount exceeds your available balance";
    return;
  }
  if (!selectedBank.value) {
    localError.value = "Please select a bank";
    return;
  }
  if (form.accountNumber.length < 10) {
    localError.value = "Please enter a valid 10-digit account number";
    return;
  }
  if (!form.accountName.trim()) {
    localError.value = "Please enter the account name";
    return;
  }
  emit("confirm", {
    amountNGN: form.amountNGN,
    bankCode: selectedBank.value.code,
    bankName: selectedBank.value.name,
    accountNumber: form.accountNumber,
    accountName: form.accountName.trim(),
  });
}
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

</style>